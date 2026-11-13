import * as React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Hr,
} from '@react-email/components';

export interface StaffShiftEmailProps {
  businessName: string;
  employeeName: string;
  employeeId: string;
  department: string;
  role: string;
  eventType: 'invite' | 'clock_in' | 'clock_out';
  timestamp: string;
}

export function StaffShiftEmail({
  businessName,
  employeeName,
  employeeId,
  department,
  role,
  eventType,
  timestamp,
}: StaffShiftEmailProps) {
  const h = React.createElement;

  const title =
    eventType === 'invite'
      ? 'Welcome to the Sangira Staff Team'
      : eventType === 'clock_in'
      ? 'Shift Clock-In Confirmed'
      : 'Shift Clock-Out Summary';

  const bodyCopy =
    eventType === 'invite'
      ? `Your staff account for ${businessName} has been provisioned in the ${department} department with role ${role}.`
      : eventType === 'clock_in'
      ? `Your duty shift at ${businessName} (${department}) was clocked in at ${timestamp}.`
      : `Your duty shift at ${businessName} (${department}) ended and was clocked out at ${timestamp}.`;

  return h(
    Html,
    null,
    h(Head, null),
    h(Preview, null, `${title} · ${employeeName} (${employeeId})`),
    h(
      Body,
      {
        style: {
          backgroundColor: '#FAF6EB',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          padding: '24px 12px',
          margin: 0,
        },
      },
      h(
        Container,
        {
          style: {
            maxWidth: '560px',
            margin: '0 auto',
            backgroundColor: '#FFFDF9',
            borderRadius: '14px',
            border: '1px solid #D4AF37',
            overflow: 'hidden',
          },
        },
        h(
          Section,
          {
            style: {
              backgroundColor: '#0E382B',
              padding: '20px 26px',
              borderBottom: '2px solid #D4AF37',
            },
          },
          h(
            Text,
            {
              style: {
                color: '#D4AF37',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                margin: '0 0 4px 0',
              },
            },
            businessName
          ),
          h(
            Heading,
            { style: { color: '#FAF6EB', fontSize: '19px', fontWeight: 800, margin: 0 } },
            title
          )
        ),
        h(
          Section,
          { style: { padding: '24px 26px' } },
          h(
            Text,
            { style: { color: '#1C1917', fontSize: '14px', margin: '0 0 10px 0' } },
            `Hello ${employeeName} (${employeeId}),`
          ),
          h(
            Text,
            { style: { color: '#44403C', fontSize: '13px', lineHeight: '21px', margin: '0 0 16px 0' } },
            bodyCopy
          ),
          h(
            Section,
            {
              style: {
                backgroundColor: '#F5F5F4',
                borderRadius: '10px',
                padding: '12px 14px',
              },
            },
            h(Text, { style: { fontSize: '12px', color: '#292524', margin: '0 0 4px 0' } }, `Department: ${department}`),
            h(Text, { style: { fontSize: '12px', color: '#292524', margin: '0 0 4px 0' } }, `Role: ${role}`),
            h(Text, { style: { fontSize: '12px', color: '#292524', margin: 0 } }, `Timestamp: ${timestamp}`)
          ),
          h(Hr, { style: { borderColor: '#E7E5E4', margin: '20px 0 12px 0' } }),
          h(
            Text,
            { style: { color: '#78716C', fontSize: '11px', margin: 0 } },
            'Sangira Workforce & Shift Attendance Verification'
          )
        )
      )
    )
  );
}
