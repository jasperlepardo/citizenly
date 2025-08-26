/**
 * Database Connection Pool Management
 * Optimized Supabase client management with connection pooling
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseConfig, isProduction, createLogger } from '@/lib/config/environment';
import type { Database } from '@/lib/data/supabase';

const logger = createLogger('ConnectionPool');

interface ConnectionPoolConfig {
  maxConnections: number;
  idleTimeout: number;
  connectionTimeout: number;
  retryAttempts: number;
  healthCheckInterval: number;
}

interface PooledConnection {
  client: SupabaseClient<Database>;
  createdAt: number;
  lastUsed: number;
  isActive: boolean;
  connectionId: string;
}

class DatabaseConnectionPool {
  private pool: Map<string, PooledConnection> = new Map();
  private config: ConnectionPoolConfig;
  private healthCheckTimer?: NodeJS.Timeout;
  private isInitialized = false;

  constructor() {
    this.config = {
      maxConnections: isProduction() ? 20 : 10,
      idleTimeout: 300000, // 5 minutes
      connectionTimeout: 10000, // 10 seconds
      retryAttempts: 3,
      healthCheckInterval: 60000, // 1 minute
    };
  }

  /**
   * Initialize the connection pool
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    logger.info('Initializing database connection pool', {
      maxConnections: this.config.maxConnections,
      environment: process.env.NODE_ENV,
    });

    // Start health check timer
    this.startHealthCheck();
    this.isInitialized = true;

    logger.info('Database connection pool initialized successfully');
  }

  /**
   * Get a connection from the pool or create a new one
   */
  async getConnection(type: 'anon' | 'service' = 'anon'): Promise<SupabaseClient> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const poolKey = `${type}_${Math.floor(this.pool.size / this.config.maxConnections)}`;

    // Try to reuse existing connection
    const existingConnection = this.findAvailableConnection(type);
    if (existingConnection) {
      existingConnection.lastUsed = Date.now();
      existingConnection.isActive = true;
      return existingConnection.client;
    }

    // Create new connection if pool not full
    if (this.pool.size < this.config.maxConnections) {
      return this.createConnection(poolKey, type);
    }

    // Pool is full, wait for available connection or create with retry
    logger.warn('Connection pool at capacity, attempting to create connection with retry');
    return this.createConnectionWithRetry(poolKey, type);
  }

  /**
   * Create a new database connection
   */
  private createConnection(connectionId: string, type: 'anon' | 'service'): SupabaseClient {
    const supabaseConfig = getSupabaseConfig();
    const now = Date.now();

    let client: SupabaseClient<Database>;

    if (type === 'service') {
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Service role key not configured');
      }

      client = createClient(supabaseConfig.url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        ...supabaseConfig.options,
        auth: {
          ...supabaseConfig.options.auth,
          autoRefreshToken: false,
          persistSession: false,
        },
      }) as SupabaseClient<Database>;
    } else {
      client = createClient(
        supabaseConfig.url,
        supabaseConfig.anonKey,
        supabaseConfig.options
      ) as SupabaseClient<Database>;
    }

    const pooledConnection: PooledConnection = {
      client,
      createdAt: now,
      lastUsed: now,
      isActive: true,
      connectionId,
    };

    this.pool.set(connectionId, pooledConnection);

    logger.debug(`Created new ${type} connection`, {
      connectionId,
      poolSize: this.pool.size,
      type,
    });

    return client;
  }

  /**
   * Create connection with retry logic
   */
  private async createConnectionWithRetry(
    connectionId: string,
    type: 'anon' | 'service'
  ): Promise<SupabaseClient> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        // Clean up idle connections first
        await this.cleanupIdleConnections();

        // Try to create connection again
        if (this.pool.size < this.config.maxConnections) {
          return this.createConnection(connectionId, type);
        }

        // Wait before retry
        if (attempt < this.config.retryAttempts) {
          await this.wait(1000 * attempt); // Exponential backoff
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.warn(`Connection creation attempt ${attempt} failed`, {
          error: lastError.message,
          attempt,
          connectionId,
        });
      }
    }

    throw new Error(
      `Failed to create database connection after ${this.config.retryAttempts} attempts: ${lastError?.message}`
    );
  }

  /**
   * Find an available connection in the pool
   */
  private findAvailableConnection(type: 'anon' | 'service'): PooledConnection | null {
    let result: PooledConnection | null = null;

    this.pool.forEach((connection, connectionId) => {
      if (result) return; // Already found one

      const isCorrectType =
        type === 'service' ? connectionId.startsWith('service_') : connectionId.startsWith('anon_');

      if (isCorrectType && !connection.isActive) {
        result = connection;
      }
    });

    return result;
  }

  /**
   * Release a connection back to the pool
   */
  releaseConnection(client: SupabaseClient): void {
    this.pool.forEach((connection, connectionId) => {
      if (connection.client === client) {
        connection.isActive = false;
        connection.lastUsed = Date.now();

        logger.debug(`Released connection back to pool`, {
          connectionId,
          poolSize: this.pool.size,
        });
      }
    });
  }

  /**
   * Clean up idle connections
   */
  private async cleanupIdleConnections(): Promise<void> {
    const now = Date.now();
    const connectionsToRemove: string[] = [];

    this.pool.forEach((connection, connectionId) => {
      const idleTime = now - connection.lastUsed;

      if (!connection.isActive && idleTime > this.config.idleTimeout) {
        connectionsToRemove.push(connectionId);
      }
    });

    connectionsToRemove.forEach(connectionId => {
      this.pool.delete(connectionId);
      logger.debug(`Removed idle connection`, { connectionId });
    });

    if (connectionsToRemove.length > 0) {
      logger.info(`Cleaned up ${connectionsToRemove.length} idle connections`, {
        remainingConnections: this.pool.size,
      });
    }
  }

  /**
   * Health check for all connections
   */
  private async performHealthCheck(): Promise<void> {
    const unhealthyConnections: string[] = [];

    // Use forEach to iterate over the Map
    await Promise.all(
      Array.from(this.pool.entries()).map(async ([connectionId, connection]) => {
        try {
          // Simple health check - try to access the API
          const { error } = await connection.client
            .from('auth_user_profiles')
            .select('id')
            .limit(1);

          if (error) {
            logger.warn(`Connection health check failed`, {
              connectionId,
              error: error.message,
            });
            unhealthyConnections.push(connectionId);
          }
        } catch (error) {
          logger.warn(`Connection health check error`, {
            connectionId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          unhealthyConnections.push(connectionId);
        }
      })
    );

    // Remove unhealthy connections
    unhealthyConnections.forEach(connectionId => {
      this.pool.delete(connectionId);
    });

    if (unhealthyConnections.length > 0) {
      logger.info(`Removed ${unhealthyConnections.length} unhealthy connections`);
    }
  }

  /**
   * Start periodic health checks
   */
  private startHealthCheck(): void {
    this.healthCheckTimer = setInterval(async () => {
      try {
        await this.cleanupIdleConnections();
        await this.performHealthCheck();
      } catch (error) {
        logger.error('Health check failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Get pool statistics
   */
  getStats() {
    const activeConnections = Array.from(this.pool.values()).filter(conn => conn.isActive).length;
    const totalConnections = this.pool.size;

    return {
      activeConnections,
      totalConnections,
      availableConnections: totalConnections - activeConnections,
      maxConnections: this.config.maxConnections,
      utilizationPercentage: Math.round((totalConnections / this.config.maxConnections) * 100),
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down database connection pool');

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    this.pool.clear();
    this.isInitialized = false;

    logger.info('Database connection pool shutdown complete');
  }

  /**
   * Utility function for waiting
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const connectionPool = new DatabaseConnectionPool();

// Export convenience functions
export const getPooledConnection = (type?: 'anon' | 'service') =>
  connectionPool.getConnection(type);

export const releasePooledConnection = (client: SupabaseClient) =>
  connectionPool.releaseConnection(client);

export const getConnectionPoolStats = () => connectionPool.getStats();

export default connectionPool;
