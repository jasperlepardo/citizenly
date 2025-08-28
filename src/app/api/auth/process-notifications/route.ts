import { NextRequest, NextResponse } from 'next/server';

import { createAdminSupabaseClient } from '@/lib';
import type { NotificationRecord } from '@/types/api-requests';

// NotificationRecord moved to src/types/api-requests.ts for consolidation

export async function POST(_request: NextRequest) {
  try {
    console.warn('🔄 Processing pending notifications...');

    const supabaseAdmin = createAdminSupabaseClient() as any;
    const notifications = await fetchPendingNotifications(supabaseAdmin);

    if (!notifications) {
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    const results = {
      processed: 0,
      failed: 0,
      total: notifications.length,
    };

    if (notifications.length === 0) {
      return NextResponse.json({
        message: 'No pending notifications',
        results,
      });
    }

    console.warn(`📧 Processing ${notifications.length} notifications...`);

    for (const notification of notifications) {
      await processNotification(notification as NotificationRecord, supabaseAdmin, results);
    }

    console.warn(`📊 Notification processing complete:`, results);

    return NextResponse.json({
      message: 'Notifications processed',
      results,
    });
  } catch (error) {
    console.error('Notification processing error:', error);
    return NextResponse.json({ error: 'Failed to process notifications' }, { status: 500 });
  }
}

async function fetchPendingNotifications(supabaseAdmin: any) {
  const { data: notifications, error } = await supabaseAdmin
    .from('user_notifications')
    .select('*')
    .eq('status', 'pending')
    .lt('retry_count', 3)
    .lte('scheduled_for', new Date().toISOString())
    .order('created_at', { ascending: true })
    .limit(10);

  if (error) {
    console.error('Failed to fetch notifications:', error);
    return null;
  }

  return notifications || [];
}

async function processNotification(
  notif: NotificationRecord,
  supabaseAdmin: any,
  results: { processed: number; failed: number; total: number }
) {
  try {
    const { success, errorMessage } = await sendNotification(notif);
    await updateNotificationStatus(notif, supabaseAdmin, success, errorMessage);

    if (success) {
      results.processed++;
      console.warn(`✅ ${notif.notification_type} sent to user ${notif.user_id}`);
    } else {
      results.failed++;
      console.error(
        `❌ ${notif.notification_type} failed for user ${notif.user_id}: ${errorMessage}`
      );
    }
  } catch (error) {
    results.failed++;
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Failed to process notification ${notif.id}:`, errorMsg);
    await updateNotificationRetry(notif, supabaseAdmin, errorMsg);
  }
}

async function sendNotification(
  notif: NotificationRecord
): Promise<{ success: boolean; errorMessage: string }> {
  switch (notif.notification_type) {
    case 'welcome_email': {
      const emailSuccess = await sendWelcomeEmail(notif);
      return { success: emailSuccess, errorMessage: '' };
    }
    case 'sms_welcome': {
      const smsSuccess = await sendWelcomeSMS(notif);
      return { success: smsSuccess, errorMessage: '' };
    }
    default: {
      const errorMessage = `Unknown notification type: ${notif.notification_type}`;
      console.warn(errorMessage);
      return { success: false, errorMessage };
    }
  }
}

async function updateNotificationStatus(
  notif: NotificationRecord,
  supabaseAdmin: any,
  success: boolean,
  errorMessage: string
) {
  const updateData = success
    ? {
        status: 'sent',
        sent_at: new Date().toISOString(),
        error_message: null,
      }
    : {
        status: 'failed',
        retry_count: notif.retry_count + 1,
        error_message: errorMessage || 'Processing failed',
        scheduled_for: new Date(Date.now() + (notif.retry_count + 1) * 60000).toISOString(),
      };

  const { error: updateNotifError } = await supabaseAdmin
    .from('user_notifications')
    .update(updateData)
    .eq('id', notif.id);

  if (updateNotifError) {
    console.error(`❌ Failed to update notification ${notif.id} status:`, updateNotifError);
  }
}

async function updateNotificationRetry(
  notif: NotificationRecord,
  supabaseAdmin: any,
  errorMsg: string
) {
  const { error: retryUpdateError } = await supabaseAdmin
    .from('user_notifications')
    .update({
      retry_count: notif.retry_count + 1,
      error_message: errorMsg,
      scheduled_for: new Date(Date.now() + (notif.retry_count + 1) * 60000).toISOString(),
    })
    .eq('id', notif.id);

  if (retryUpdateError) {
    console.error(`❌ Failed to bump retry_count for ${notif.id}:`, retryUpdateError);
  }
}

async function sendWelcomeEmail(notification: NotificationRecord): Promise<boolean> {
  try {
    const { email, first_name, role_name } = notification.metadata;

    console.warn(`📧 Sending welcome email to ${email} (${first_name}, ${role_name})`);

    // In a real implementation, you would integrate with:
    // - SendGrid, Mailgun, AWS SES, or similar email service
    // - Use email templates
    // - Handle bounces and delivery tracking

    // For now, just simulate success and log
    const emailContent = {
      to: email,
      subject: `Welcome to RBI System, ${first_name}!`,
      template: 'welcome-email',
      data: {
        firstName: first_name,
        role: role_name,
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      },
    };

    console.warn('📧 Email content:', emailContent);

    // Email service integration pending - currently returns success
    return true;
  } catch (error) {
    console.error('Welcome email error:', error);
    return false;
  }
}

async function sendWelcomeSMS(notification: NotificationRecord): Promise<boolean> {
  try {
    const { phone, first_name } = notification.metadata;

    console.warn(`📱 Sending welcome SMS to ${phone} (${first_name})`);

    // In a real implementation, you would integrate with:
    // - Twilio, AWS SNS, or similar SMS service
    // - Handle delivery receipts
    // - Manage opt-outs

    const smsContent = {
      to: phone,
      message: `Welcome to RBI System, ${first_name}! Your account is now active. Visit ${process.env.NEXT_PUBLIC_APP_URL}/login to get started.`,
    };

    console.warn('📱 SMS content:', smsContent);

    // SMS service integration pending - currently returns success
    return true;
  } catch (error) {
    console.error('Welcome SMS error:', error);
    return false;
  }
}

// GET endpoint to check notification status
export async function GET() {
  try {
    const supabaseAdmin = createAdminSupabaseClient() as any;
    const { data: stats, error } = await supabaseAdmin
      .from('user_notifications')
      .select('status, notification_type')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    const summary =
      stats?.reduce(
        (acc: Record<string, number>, notif: { notification_type: string; status: string }) => {
          const key = `${notif.notification_type}_${notif.status}`;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        },
        {}
      ) || {};

    return NextResponse.json({
      message: 'Notification stats',
      summary,
      total: stats?.length || 0,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
  }
}
