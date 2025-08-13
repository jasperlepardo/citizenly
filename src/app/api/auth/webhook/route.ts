import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { WebhookUserRecord } from '@/types/database';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Webhook secret for verifying Supabase webhook signatures
const WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET || 'dev-webhook-secret';

interface WebhookPayload {
  type: string;
  table: string;
  schema: string;
  record: WebhookUserRecord;
  old_record?: WebhookUserRecord;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-webhook-signature');

    // Verify webhook signature in production
    if (process.env.NODE_ENV === 'production' && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload: WebhookPayload = JSON.parse(body);

    console.log('🔄 Auth webhook received:', {
      type: payload.type,
      table: payload.table,
      userId: payload.record?.id,
    });

    // Handle different webhook events
    switch (payload.type) {
      case 'UPDATE':
        if (payload.table === 'users' && payload.schema === 'auth') {
          await handleUserUpdate(payload.record, payload.old_record || payload.record);
        }
        break;

      case 'INSERT':
        if (payload.table === 'users' && payload.schema === 'auth') {
          await handleUserInsert(payload.record);
        }
        break;

      default:
        console.log(`Unhandled webhook type: ${payload.type}`);
    }

    return NextResponse.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleUserUpdate(newRecord: WebhookUserRecord, oldRecord: WebhookUserRecord) {
  const userId = newRecord.id;

  // Check if email was just confirmed
  if (oldRecord.email_confirmed_at === null && newRecord.email_confirmed_at !== null) {
    console.log(`✅ Email confirmed for user: ${userId}`);

    try {
      // Update profile verification status
      const { error: updateError } = await supabaseAdmin
        .from('auth_user_profiles')
        .update({
          email_verified: true,
          email_verified_at: newRecord.email_confirmed_at,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to update profile verification:', updateError);
        return;
      }

      // Complete address hierarchy if needed
      await completeAddressHierarchy(userId);

      // Queue welcome notifications
      await queueWelcomeNotifications(userId);

      console.log(`✅ Post-confirmation processing completed for user: ${userId}`);
    } catch (error) {
      console.error(`❌ Post-confirmation processing failed for user ${userId}:`, error);
    }
  }
}

async function handleUserInsert(record: WebhookUserRecord) {
  const userId = record.id;
  console.log(`👤 New user created: ${userId}`);

  // If user is already confirmed (rare but possible), process immediately
  if (record.email_confirmed_at) {
    console.log(`✅ User already confirmed at signup: ${userId}`);
    const mockOldRecord: WebhookUserRecord = {
      ...record,
      email_confirmed_at: null,
    };
    await handleUserUpdate(record, mockOldRecord);
  }
}

async function completeAddressHierarchy(userId: string) {
  try {
    // Get user profile with barangay code
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('barangay_code, city_municipality_code, province_code, region_code')
      .eq('id', userId)
      .single();

    if (profileError || !profile || !profile.barangay_code) {
      console.log(`No address hierarchy to complete for user: ${userId}`);
      return;
    }

    // If hierarchy is already complete, skip
    if (profile.city_municipality_code && profile.province_code && profile.region_code) {
      console.log(`Address hierarchy already complete for user: ${userId}`);
      return;
    }

    // Get complete address hierarchy
    const { data: hierarchy, error: hierarchyError } = await supabaseAdmin
      .from('psgc_barangays')
      .select(
        `
        city_municipality_code,
        psgc_cities_municipalities!inner(
          code,
          province_code,
          psgc_provinces!inner(
            code,
            region_code
          )
        )
      `
      )
      .eq('code', profile.barangay_code)
      .single();

    if (hierarchyError || !hierarchy) {
      console.error(
        `Failed to get address hierarchy for ${profile.barangay_code}:`,
        hierarchyError
      );
      return;
    }

    // Update profile with complete hierarchy
    const { error: updateError } = await supabaseAdmin
      .from('auth_user_profiles')
      .update({
        city_municipality_code: hierarchy.city_municipality_code,
        province_code: (hierarchy as any).psgc_cities_municipalities.province_code,
        region_code: (hierarchy as any).psgc_cities_municipalities.psgc_provinces.region_code,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error(`Failed to update address hierarchy for user ${userId}:`, updateError);
    } else {
      console.log(`✅ Address hierarchy completed for user: ${userId}`);
    }
  } catch (error) {
    console.error(`Error completing address hierarchy for user ${userId}:`, error);
  }
}

async function queueWelcomeNotifications(userId: string) {
  try {
    // Get user profile for notification data
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select(
        `
        email,
        first_name,
        phone,
        auth_roles!inner(name)
      `
      )
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error(`Failed to get profile for notifications: ${userId}`, profileError);
      return;
    }

    const notifications = [];

    // Queue welcome email
    notifications.push({
      user_id: userId,
      notification_type: 'welcome_email',
      metadata: {
        email: profile.email,
        first_name: profile.first_name,
        role_name: (profile as any).auth_roles.name,
      },
    });

    // Queue SMS if phone provided
    if (profile.phone) {
      notifications.push({
        user_id: userId,
        notification_type: 'sms_welcome',
        metadata: {
          phone: profile.phone,
          first_name: profile.first_name,
        },
      });
    }

    // Insert notifications
    const { error: notifError } = await supabaseAdmin
      .from('user_notifications')
      .insert(notifications);

    if (notifError) {
      console.error(`Failed to queue notifications for user ${userId}:`, notifError);
    } else {
      console.log(`✅ Welcome notifications queued for user: ${userId}`);
    }
  } catch (error) {
    console.error(`Error queuing notifications for user ${userId}:`, error);
  }
}
