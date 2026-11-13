import * as React from 'react';
import { Resend } from 'resend';
import { render } from '@react-email/components';
import { BusinessDecisionEmail } from './templates/BusinessDecisionEmail.ts';
import type { BusinessDecisionEmailProps } from './templates/BusinessDecisionEmail.ts';
import { OrderReceiptEmail } from './templates/OrderReceiptEmail.ts';
import type { OrderReceiptEmailProps } from './templates/OrderReceiptEmail.ts';
import { StaffShiftEmail } from './templates/StaffShiftEmail.ts';
import type { StaffShiftEmailProps } from './templates/StaffShiftEmail.ts';

export interface EmailSendResult {
  sent: boolean;
  status: 'sent' | 'skipped_missing_key' | 'failed';
  providerId?: string;
  missingKeys?: string[];
  error?: string;
}

function getResendClient(): { client: Resend | null; fromEmail: string } {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() || 'Sangira Hospitality <onboarding@resend.dev>';

  if (!apiKey || apiKey.startsWith('MY_')) {
    return { client: null, fromEmail };
  }
  return { client: new Resend(apiKey), fromEmail };
}

async function dispatchReactEmail(
  to: string,
  subject: string,
  element: React.ReactElement
): Promise<EmailSendResult> {
  const { client, fromEmail } = getResendClient();
  if (!client) {
    return {
      sent: false,
      status: 'skipped_missing_key',
      missingKeys: ['RESEND_API_KEY'],
      error: 'RESEND_API_KEY is not configured yet. Add it in Secrets / .env to deliver live emails.',
    };
  }

  try {
    const html = await render(element);
    const text = await render(element, { plainText: true });

    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: [to],
      subject,
      html,
      text,
    });

    if (error) {
      return {
        sent: false,
        status: 'failed',
        error: error.message || 'Resend rejected email payload',
      };
    }

    return {
      sent: true,
      status: 'sent',
      providerId: data?.id,
    };
  } catch (err) {
    return {
      sent: false,
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unexpected Resend rendering failure',
    };
  }
}

export async function sendBusinessDecisionEmail(
  to: string,
  props: BusinessDecisionEmailProps
): Promise<EmailSendResult> {
  const subject =
    props.decision === 'approved'
      ? `Approved: ${props.businessName} is live on Sangira (${props.reference})`
      : `Sangira Application Update (${props.reference}) — ${props.businessName}`;
  return dispatchReactEmail(to, subject, React.createElement(BusinessDecisionEmail, props));
}

export async function sendOrderReceiptEmail(
  to: string,
  props: OrderReceiptEmailProps
): Promise<EmailSendResult> {
  const subject = `Receipt ${props.orderNumber} · ${props.totalAmount.toLocaleString()} RWF (${props.businessName})`;
  return dispatchReactEmail(to, subject, React.createElement(OrderReceiptEmail, props));
}

export async function sendStaffShiftEmail(
  to: string,
  props: StaffShiftEmailProps
): Promise<EmailSendResult> {
  const subject =
    props.eventType === 'invite'
      ? `Welcome to ${props.businessName} on Sangira`
      : props.eventType === 'clock_in'
      ? `Shift Clock-In Confirmed (${props.employeeId})`
      : `Shift Clock-Out Summary (${props.employeeId})`;
  return dispatchReactEmail(to, subject, React.createElement(StaffShiftEmail, props));
}
