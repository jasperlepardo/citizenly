import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib';

interface NotificationRecord {
  id: string;
  user_id: string;
  notification_type: string;
  metadata: any;
  retry_count: number;
}

export async function POST(_request: NextRequest) {
  try {
    console.log('🔄 Processing pending notifications...');

    const supabaseAdmin = createAdminSupabaseClient();

    // Get pending notifications
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
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    const results = {
      processed: 0,
      failed: 0,
      total: notifications?.length || 0,
    };

    if (!notifications || notifications.length === 0) {
      return NextResponse.json({
        message: 'No pending notifications',
        results,
      });
    }

    console.log(`📧 Processing ${notifications.length} notifications...`);

    // Process each notification
    for (const notification of notifications) {
      const notif = notification as NotificationRecord;

      try {
        let success = false;
        let errorMessage = '';

        switch (notif.notification_type) {
          case 'welcome_email':
            success = await sendWelcomeEmail(notif);
            break;
          case 'sms_welcome':
            success = await sendWelcomeSMS(notif);
            break;
          default:
            errorMessage = `Unknown notification type: ${notif.notification_type}`;
            console.warn(errorMessage);
        }

        // Update notification status
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
              scheduled_for: new Date(Date.now() + (notif.retry_count + 1) * 60000).toISOString(), // Retry after 1, 2, 3 minutes
            };

        await supabaseAdmin.from('user_notifications').update(updateData).eq('id', notif.id);

        if (success) {
          results.processed++;
          console.log(`✅ ${notif.notification_type} sent to user ${notif.user_id}`);
        } else {
          results.failed++;
          console.log(
            `❌ ${notif.notification_type} failed for user ${notif.user_id}: ${errorMessage}`
          );
        }
      } catch (error) {
        results.failed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Failed to process notification ${notif.id}:`, errorMsg);

        // Update retry count
        await supabaseAdmin
          .from('user_notifications')
          .update({
            retry_count: notif.retry_count + 1,
            error_message: errorMsg,
            scheduled_for: new Date(Date.now() + (notif.retry_count + 1) * 60000).toISOString(),
          })
          .eq('id', notif.id);
      }
    }

    console.log(`📊 Notification processing complete:`, results);

    return NextResponse.json({
      message: 'Notifications processed',
      results,
    });
  } catch (error) {
    console.error('Notification processing error:', error);
    return NextResponse.json({ error: 'Failed to process notifications' }, { status: 500 });
  }
}

async function sendWelcomeEmail(notification: NotificationRecord): Promise<boolean> {
  try {
    const { email, first_name, role_name } = notification.metadata;

    console.log(`📧 Sending welcome email to ${email} (${first_name}, ${role_name})`);

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

    console.log('📧 Email content:', emailContent);

    // TODO: Implement actual email sending
    // const result = await emailService.send(emailContent);
    // return result.success;

    // For now, simulate success
    return true;
  } catch (error) {
    console.error('Welcome email error:', error);
    return false;
  }
}

async function sendWelcomeSMS(notification: NotificationRecord): Promise<boolean> {
  try {
    const { phone, first_name } = notification.metadata;

    console.log(`📱 Sending welcome SMS to ${phone} (${first_name})`);

    // In a real implementation, you would integrate with:
    // - Twilio, AWS SNS, or similar SMS service
    // - Handle delivery receipts
    // - Manage opt-outs

    const smsContent = {
      to: phone,
      message: `Welcome to RBI System, ${first_name}! Your account is now active. Visit ${process.env.NEXT_PUBLIC_APP_URL}/login to get started.`,
    };

    console.log('📱 SMS content:', smsContent);

    // TODO: Implement actual SMS sending
    // const result = await smsService.send(smsContent);
    // return result.success;

    // For now, simulate success
    return true;
  } catch (error) {
    console.error('Welcome SMS error:', error);
    return false;
  }
}

// GET endpoint to check notification status
export async function GET() {
  try {
    const supabaseAdmin = createAdminSupabaseClient();
    const { data: stats, error } = await supabaseAdmin
      .from('user_notifications')
      .select('status, notification_type')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    const summary =
      stats?.reduce((acc: any, notif: any) => {
        const key = `${notif.notification_type}_${notif.status}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}) || {};

    return NextResponse.json({
      message: 'Notification stats',
      summary,
      total: stats?.length || 0,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
  }
}
