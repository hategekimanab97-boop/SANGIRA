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

export interface OrderReceiptEmailProps {
  businessName: string;
  orderNumber: string;
  tableNumber: string;
  customerName: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentReference?: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
}

export function OrderReceiptEmail({
  businessName,
  orderNumber,
  tableNumber,
  customerName,
  paymentMethod,
  paymentStatus,
  paymentReference,
  items,
  subtotal,
  taxAmount,
  totalAmount,
}: OrderReceiptEmailProps) {
  const h = React.createElement;
  const formattedMethod = paymentMethod.replace('_', ' ').toUpperCase();

  return h(
    Html,
    null,
    h(Head, null),
    h(
      Preview,
      null,
      `Receipt for Order ${orderNumber} · ${totalAmount.toLocaleString()} RWF (${businessName})`
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
              padding: '22px 28px',
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
                margin: '0 0 4px 0',
              },
            },
            businessName
          ),
          h(
            Heading,
            { style: { color: '#FAF6EB', fontSize: '20px', fontWeight: 800, margin: 0 } },
            `Digital Dining Receipt · ${orderNumber}`
          )
        ),
        h(
          Section,
          { style: { padding: '24px 28px' } },
          h(
            Text,
            { style: { color: '#1C1917', fontSize: '14px', margin: '0 0 12px 0' } },
            `Thank you for dining with us, ${customerName}!`
          ),
          h(
            Text,
            { style: { color: '#57534E', fontSize: '12px', margin: '0 0 18px 0' } },
            `Table: ${tableNumber} · Payment Method: ${formattedMethod} · Settlement: ${paymentStatus.toUpperCase()}${
              paymentReference ? ` (${paymentReference})` : ''
            }`
          ),
          h(
            Section,
            {
              style: {
                backgroundColor: '#F5F5F4',
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '16px',
              },
            },
            ...items.map((item, idx) =>
              h(
                Text,
                {
                  key: `${item.name}-${idx}`,
                  style: {
                    color: '#1C1917',
                    fontSize: '13px',
                    margin: '0 0 6px 0',
                  },
                },
                `${item.quantity}x ${item.name} — ${(item.price * item.quantity).toLocaleString()} RWF`
              )
            ),
            h(Hr, { style: { borderColor: '#D6D3D1', margin: '10px 0' } }),
            h(
              Text,
              { style: { color: '#57534E', fontSize: '12px', margin: '0 0 4px 0' } },
              `Subtotal: ${subtotal.toLocaleString()} RWF`
            ),
            h(
              Text,
              { style: { color: '#57534E', fontSize: '12px', margin: '0 0 6px 0' } },
              `RRA VAT (18%): ${taxAmount.toLocaleString()} RWF`
            ),
            h(
              Text,
              { style: { color: '#0E382B', fontSize: '15px', fontWeight: 800, margin: 0 } },
              `Total Paid: ${totalAmount.toLocaleString()} RWF`
            )
          ),
          h(
            Text,
            { style: { color: '#78716C', fontSize: '11px', margin: 0 } },
            'Powered by Sangira Contactless Ordering & Cashier Reconciliation.'
          )
        )
      )
    )
  );
}
