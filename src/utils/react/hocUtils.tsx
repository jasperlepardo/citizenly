/**
 * Higher-Order Component Utilities
 *
 * @fileoverview Consolidated utilities for creating Higher-Order Components (HOCs).
 * Eliminates duplicate WrappedComponent patterns across the codebase and provides
 * standardized component wrapping with proper displayName handling.
 *
 * @version 1.0.0
 * @since 2025-08-29
 * @author Citizenly Development Team
 */

'use client';

import React from 'react';

// Define WrapperComponentProps inline
interface WrapperComponentProps {
  children: React.ReactNode;
  [key: string]: any;
}

// =============================================================================
// CONSOLIDATED HOC UTILITY
// =============================================================================

/**
 * Creates a standardized wrapped component with proper displayName handling
 * Eliminates duplicate WrappedComponent patterns across all HOCs
 */
export function createWrappedComponent<P extends object>(
  Component: React.ComponentType<P>,
  WrapperComponent: React.ComponentType<WrapperComponentProps>,
  wrapperDisplayName: string,
  wrapperProps?: Record<string, any>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <WrapperComponent {...wrapperProps}>
      <Component {...props} />
    </WrapperComponent>
  );

  // Standardized displayName pattern
  WrappedComponent.displayName = `${wrapperDisplayName}(${
    Component.displayName || Component.name || 'Anonymous'
  })`;

  return WrappedComponent;
}

/**
 * Advanced wrapped component creator with render prop support
 */
export function createWrappedComponentWithRender<P extends object>(
  Component: React.ComponentType<P>,
  renderWrapper: (children: React.ReactNode, props: P) => React.ReactElement,
  wrapperDisplayName: string
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => renderWrapper(<Component {...props} />, props);

  WrappedComponent.displayName = `${wrapperDisplayName}(${
    Component.displayName || Component.name || 'Anonymous'
  })`;

  return WrappedComponent;
}

/**
 * Creates a HOC with standardized WrappedComponent pattern
 */
export function createStandardHOC<WrapperProps, ComponentProps extends object>(
  createWrapper: (wrapperProps: WrapperProps) => React.ComponentType<WrapperComponentProps>,
  hocDisplayName: string
) {
  return function HOC(
    Component: React.ComponentType<ComponentProps>,
    wrapperProps: WrapperProps
  ): React.ComponentType<ComponentProps> {
    const WrapperComponent = createWrapper(wrapperProps);
    return createWrappedComponent(Component, WrapperComponent, hocDisplayName, wrapperProps as any);
  };
}

// =============================================================================
// SPECIALIZED HOC CREATORS
// =============================================================================

/**
 * Creates error boundary HOC with consolidated WrappedComponent pattern
 */
export function createErrorBoundaryHOC<T extends object>(
  ErrorBoundaryComponent: React.ComponentType<any>,
  boundaryProps?: any
) {
  return function withErrorBoundary(
    Component: React.ComponentType<T>,
    additionalProps?: any
  ): React.ComponentType<T> {
    return createWrappedComponent(Component, ErrorBoundaryComponent, 'withErrorBoundary', {
      ...boundaryProps,
      ...additionalProps,
    });
  };
}

/**
 * Creates lazy loading HOC with consolidated WrappedComponent pattern
 */
export function createLazyLoadingHOC(
  SuspenseWrapper: React.ComponentType<WrapperComponentProps>,
  suspenseProps?: any
) {
  return function withLazyLoading<T extends object>(
    Component: React.ComponentType<T>,
    loadingMessage?: string
  ): React.ComponentType<T> {
    return createWrappedComponent(Component, SuspenseWrapper, 'withLazyLoading', {
      ...suspenseProps,
      loadingMessage,
    });
  };
}

/**
 * Creates monitoring HOC with consolidated WrappedComponent pattern
 */
export function createMonitoringHOC(
  MonitoringWrapper: React.ComponentType<WrapperComponentProps>,
  monitoringProps?: any
) {
  return function withMonitoring<T extends object>(
    Component: React.ComponentType<T>,
    componentName?: string
  ): React.ComponentType<T> {
    return createWrappedComponent(Component, MonitoringWrapper, 'withMonitoring', {
      ...monitoringProps,
      componentName: componentName || Component.displayName || Component.name,
    });
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Extracts component name for display purposes
 */
export function getComponentName(Component: React.ComponentType<any>): string {
  return Component.displayName || Component.name || 'Anonymous';
}

/**
 * Creates standardized HOC displayName
 */
export function createHOCDisplayName(hocName: string, Component: React.ComponentType<any>): string {
  return `${hocName}(${getComponentName(Component)})`;
}

/**
 * Validates that a component is a valid React component
 */
export function validateComponent(Component: any): asserts Component is React.ComponentType<any> {
  if (typeof Component !== 'function' && typeof Component !== 'object') {
    throw new Error(`Invalid component: Expected function or object, received ${typeof Component}`);
  }
}

/**
 * Compose multiple HOCs into a single HOC
 */
export function composeHOCs<T extends object>(
  ...hocs: Array<(Component: React.ComponentType<T>) => React.ComponentType<T>>
) {
  return function composedHOC(Component: React.ComponentType<T>): React.ComponentType<T> {
    return hocs.reduceRight((acc, hoc) => hoc(acc), Component);
  };
}

/**
 * Creates a memo-wrapped component with HOC pattern
 */
export function createMemoWrappedComponent<P extends object>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
): React.ComponentType<P> {
  const MemoizedComponent = React.memo(Component, areEqual);
  MemoizedComponent.displayName = `memo(${getComponentName(Component)})`;
  return MemoizedComponent;
}

// =============================================================================
// LEGACY COMPATIBILITY
// =============================================================================

/**
 * @deprecated Use createWrappedComponent instead
 * Provided for backward compatibility during migration
 */
export function legacyWrappedComponent<P extends object>(
  Component: React.ComponentType<P>,
  wrapper: (children: React.ReactNode) => React.ReactElement,
  displayName: string
): React.ComponentType<P> {
  console.warn(
    'legacyWrappedComponent is deprecated. Use createWrappedComponent or createWrappedComponentWithRender instead.'
  );

  return createWrappedComponentWithRender(Component, children => wrapper(children), displayName);
}