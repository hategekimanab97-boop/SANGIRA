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
  Button,
} from '@react-email/components';

export interface BusinessDecisionEmailProps {
  businessName: string;
  ownerName: string;
  reference: string;
  decision: 'approved' | 'rejected';
  notes?: string;
  portalUrl: string;
}

export function BusinessDecisionEmail({
  businessName,
  ownerName,
  reference,
  decision,
  notes,
  portalUrl,
}: BusinessDecisionEmailProps) {
  const isApproved = decision === 'approved';
  const h = React.createElement;

  return h(
    Html,
    null,
    h(Head, null),
    h(
      Preview,
      null,
      isApproved
        ? `Approved: ${businessName} workspace is now active on Sangira`
        : `Update on your Sangira application (${reference})`
    ),
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
            maxWidth: '580px',
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
              padding: '24px 28px',
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
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                margin: '0 0 6px 0',
              },
            },
            'SANGIRA HOSPITALITY NETWORK'
          ),
          h(
            Heading,
            {
              style: {
                color: '#FAF6EB',
                fontSize: '20px',
                fontWeight: 800,
                margin: 0,
              },
            },
            isApproved ? 'Venue Application Approved' : 'Application Review Update'
          )
        ),
        h(
          Section,
          { style: { padding: '26px 28px' } },
          h(
            Text,
            { style: { color: '#1C1917', fontSize: '14px', lineHeight: '22px', margin: '0 0 14px 0' } },
            `Hello ${ownerName},`
          ),
          h(
            Text,
            { style: { color: '#44403C', fontSize: '14px', lineHeight: '22px', margin: '0 0 16px 0' } },
            isApproved
              ? `Congratulations! Your venue registration for ${businessName} (Reference ${reference}) has been verified and approved by the Sangira Platform Administration team.`
              : `Thank you for submitting ${businessName} (Reference ${reference}) to the Sangira Hospitality Network. After reviewing your compliance documents, our team could not approve the application at this stage.`
          ),
          notes
            ? h(
                Section,
                {
                  style: {
                    backgroundColor: isApproved ? '#ECFDF5' : '#FFF1F2',
                    border: `1px solid ${isApproved ? '#A7F3D0' : '#FECDD3'}`,
                    borderRadius: '10px',
                    padding: '14px 16px',
                    marginBottom: '18px',
                  },
                },
                h(
                  Text,
                  {
                    style: {
                      color: isApproved ? '#065F46' : '#9F1239',
                      fontSize: '12px',
                      fontWeight: 700,
                      margin: '0 0 4px 0',
                    },
                  },
                  isApproved ? 'Provisioning Summary' : 'Reviewer Compliance Notes'
                ),
                h(
                  Text,
                  {
                    style: {
                      color: '#292524',
                      fontSize: '13px',
                      lineHeight: '20px',
                      margin: 0,
                    },
                  },
                  notes
                )
              )
            : null,
          h(
            Button,
            {
              href: portalUrl,
              style: {
                backgroundColor: '#0E382B',
                color: '#F3DF95',
                fontSize: '13px',
                fontWeight: 700,
                textDecoration: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                border: '1px solid #D4AF37',
                display: 'inline-block',
              },
            },
            isApproved ? 'Access Your Sangira Workspace' : 'View Application Status'
          ),
          h(Hr, { style: { borderColor: '#E7E5E4', margin: '24px 0 16px 0' } }),
          h(
            Text,
            { style: { color: '#78716C', fontSize: '12px', lineHeight: '18px', margin: 0 } },
            'Sangira Multi-Tenant Hospitality Operations · Kigali, Rwanda'
          )
        )
      )
    )
  );
}
