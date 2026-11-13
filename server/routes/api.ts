import express, { type Request, type Response } from 'express';
import { getIntegrationStatus } from '../config/integrations.ts';
import { testDatabaseConnection, withRlsTransaction, getDbPool } from '../db/pool.ts';
import { getStaffSession } from '../auth/auth.ts';
import {
  sendBusinessDecisionEmail,
  sendOrderReceiptEmail,
  sendStaffShiftEmail,
  type EmailSendResult,
} from '../emails/mailer.ts';

export const apiRouter = express.Router();

async function logEmailDispatch(
  businessId: string | null,
  recipient: string,
  template: string,
  subject: string,
  result: EmailSendResult
) {
  const pool = getDbPool();
  if (!pool) return;
  try {
    await pool.query(
      `INSERT INTO email_dispatch_logs (id, business_id, recipient, template, subject, status, provider_id, error_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        `eml-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        businessId,
        recipient,
        template,
        subject,
        result.status,
        result.providerId || null,
        result.error || null,
      ]
    );
  } catch {
    // Non-fatal if schema has not been executed yet
  }
}

apiRouter.get('/integrations/status', async (_req: Request, res: Response) => {
  const status = getIntegrationStatus();
  const dbProbe = status.services.supabase.configured
    ? await testDatabaseConnection()
    : { connected: false, error: 'DATABASE_URL missing' };

  res.json({
    ...status,
    databaseReachable: dbProbe.connected,
    databaseError: dbProbe.error || null,
  });
});

apiRouter.get('/health', async (_req: Request, res: Response) => {
  const dbProbe = await testDatabaseConnection();
  res.json({
    ok: true,
    service: 'sangira-express',
    databaseConnected: dbProbe.connected,
    timestamp: new Date().toISOString(),
  });
});

apiRouter.get('/staff/session', async (req: Request, res: Response) => {
  const session = await getStaffSession(req.headers);
  res.json(session);
});

apiRouter.get('/bootstrap', async (req: Request, res: Response) => {
  const pool = getDbPool();
  if (!pool) {
    return res.json({ dbReady: false, reason: 'DATABASE_URL_MISSING' });
  }

  const session = await getStaffSession(req.headers);
  const rlsCtx = session.authenticated && session.user
    ? {
        userId: session.user.id,
        businessId: session.user.businessId,
        role: session.user.role,
      }
    : {
        userId: 'public-guest',
        businessId: String(req.query.businessId || 'biz-grand-kigali'),
        role: 'PUBLIC_GUEST',
      };

  try {
    const data = await withRlsTransaction(rlsCtx, async (client) => {
      const businesses = (await client.query('SELECT * FROM businesses ORDER BY created_at ASC')).rows;
      const menuItems = (await client.query('SELECT * FROM menu_items ORDER BY name ASC')).rows;

      if (!session.authenticated) {
        return {
          dbReady: true,
          authenticated: false,
          businesses,
          menuItems,
        };
      }

      const [
        applications,
        employees,
        shifts,
        stockItems,
        stockMovements,
        recipes,
        orders,
        tickets,
        payments,
        auditLogs,
        emailLogs,
      ] = await Promise.all([
        client.query('SELECT * FROM business_applications ORDER BY submitted_at DESC'),
        client.query('SELECT * FROM employees ORDER BY invited_at DESC'),
        client.query('SELECT * FROM staff_shifts ORDER BY created_at DESC LIMIT 100'),
        client.query('SELECT * FROM stock_items ORDER BY name ASC'),
        client.query('SELECT * FROM stock_movements ORDER BY created_at DESC LIMIT 100'),
        client.query('SELECT * FROM recipes ORDER BY last_updated DESC'),
        client.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 100'),
        client.query('SELECT * FROM department_tickets ORDER BY created_at DESC LIMIT 150'),
        client.query('SELECT * FROM payments ORDER BY transaction_time DESC LIMIT 100'),
        client.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100'),
        client.query('SELECT * FROM email_dispatch_logs ORDER BY created_at DESC LIMIT 50'),
      ]);

      return {
        dbReady: true,
        authenticated: true,
        businesses,
        menuItems,
        applications: applications.rows,
        employees: employees.rows,
        shifts: shifts.rows,
        stockItems: stockItems.rows,
        stockMovements: stockMovements.rows,
        recipes: recipes.rows,
        orders: orders.rows,
        tickets: tickets.rows,
        payments: payments.rows,
        auditLogs: auditLogs.rows,
        emailLogs: emailLogs.rows,
      };
    });

    res.json(data);
  } catch (err) {
    res.json({
      dbReady: false,
      reason: err instanceof Error ? err.message : 'SCHEMA_NOT_READY',
    });
  }
});

// Business Application Submission (Public Onboarding)
apiRouter.post('/applications', async (req: Request, res: Response) => {
  const {
    id,
    reference,
    businessName,
    businessType,
    location,
    description,
    ownerName,
    email,
    phone,
    position,
    documents,
  } = req.body || {};

  const pool = getDbPool();
  if (!pool) {
    return res.json({
      persisted: false,
      reason: 'DATABASE_URL_MISSING',
    });
  }

  try {
    await withRlsTransaction({ role: 'PUBLIC_GUEST' }, async (client) => {
      await client.query(
        `INSERT INTO business_applications
          (id, reference, business_name, business_type, location, description, owner_name, email, phone, position, documents, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')`,
        [
          id || `app-${Date.now()}`,
          reference,
          businessName,
          businessType,
          location,
          description || '',
          ownerName,
          email,
          phone,
          position || 'Owner',
          JSON.stringify(documents || {}),
        ]
      );
    });
    res.json({ persisted: true });
  } catch (err) {
    res.status(500).json({
      persisted: false,
      error: err instanceof Error ? err.message : 'Failed to store business application',
    });
  }
});

// Business Application Approval / Rejection + Resend React Email
apiRouter.post('/applications/:id/review', async (req: Request, res: Response) => {
  const appId = req.params.id;
  const {
    decision,
    notes,
    applicantEmail,
    businessName,
    ownerName,
    reference,
    businessType,
    location,
    phone,
  } = req.body || {};

  if (decision !== 'approved' && decision !== 'rejected') {
    return res.status(400).json({ error: 'Decision must be approved or rejected' });
  }

  const session = await getStaffSession(req.headers);
  if (session.configured && (!session.authenticated || session.user?.role !== 'SYSTEM_ADMIN')) {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Only authenticated SYSTEM_ADMIN users can review business applications.',
    });
  }

  const portalUrl =
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    'http://localhost:3000';

  const pool = getDbPool();
  let dbPersisted = false;

  if (pool) {
    try {
      await withRlsTransaction(
        {
          userId: session.user?.id || 'sys-admin',
          role: 'SYSTEM_ADMIN',
        },
        async (client) => {
          await client.query(
            `UPDATE business_applications
             SET status = $1, reviewer_notes = $2, reviewed_at = NOW()
             WHERE id = $3`,
            [decision, notes || '', appId]
          );

          if (decision === 'approved' && businessName) {
            const newBizId = `biz-${String(businessName)
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '-')}`;
            await client.query(
              `INSERT INTO businesses
                (id, name, type, status, location, phone, email, currency, tax_rate, has_hotel_module, table_count)
               VALUES ($1, $2, $3, 'active', $4, $5, $6, 'RWF', 0.18, $7, 12)
               ON CONFLICT (id) DO NOTHING`,
              [
                newBizId,
                businessName,
                businessType || 'restaurant',
                location || 'Kigali, Rwanda',
                phone || '+250 788 000 000',
                applicantEmail || 'contact@sangira.rw',
                businessType === 'hotel',
              ]
            );
          }
        }
      );
      dbPersisted = true;
    } catch (err) {
      console.warn('[Review Application PG Fallback]', err instanceof Error ? err.message : err);
    }
  }

  let emailResult: EmailSendResult = {
    sent: false,
    status: 'skipped_missing_key',
    error: 'Applicant email not provided',
  };

  if (applicantEmail) {
    emailResult = await sendBusinessDecisionEmail(applicantEmail, {
      businessName: businessName || 'Hospitality Venue',
      ownerName: ownerName || 'Partner',
      reference: reference || appId,
      decision,
      notes,
      portalUrl,
    });

    await logEmailDispatch(
      null,
      applicantEmail,
      'BusinessDecisionEmail',
      `${decision === 'approved' ? 'Approved' : 'Update'}: ${businessName}`,
      emailResult
    );
  }

  res.json({
    ok: true,
    dbPersisted,
    emailResult,
  });
});

// Place Customer Dining Order + Optional Receipt Email
apiRouter.post('/orders', async (req: Request, res: Response) => {
  const { order, tickets, payment, businessName, customerEmail } = req.body || {};
  if (!order) {
    return res.status(400).json({ error: 'Missing order payload' });
  }

  const pool = getDbPool();
  let dbPersisted = false;

  if (pool) {
    try {
      await withRlsTransaction(
        {
          businessId: order.businessId || 'biz-grand-kigali',
          role: 'PUBLIC_GUEST',
        },
        async (client) => {
          await client.query(
            `INSERT INTO orders
              (id, business_id, order_number, table_number, customer_name, customer_email, order_type, items, subtotal, tax_amount, total_amount, status, payment_status, payment_method)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
            [
              order.id,
              order.businessId,
              order.orderNumber,
              order.tableNumber,
              order.customerName || 'Dine-in Guest',
              customerEmail || null,
              order.orderType || 'dine_in',
              JSON.stringify(order.items || []),
              order.subtotal,
              order.taxAmount,
              order.totalAmount,
              order.status || 'received',
              order.paymentStatus || 'pending',
              order.paymentMethod || 'mtn_momo',
            ]
          );

          if (Array.isArray(tickets)) {
            for (const tkt of tickets) {
              await client.query(
                `INSERT INTO department_tickets
                  (id, business_id, order_id, order_number, table_number, department, items, status, priority)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                  tkt.id,
                  order.businessId,
                  order.id,
                  order.orderNumber,
                  order.tableNumber,
                  tkt.department,
                  JSON.stringify(tkt.items || []),
                  tkt.status || 'new',
                  tkt.priority || 'normal',
                ]
              );
            }
          }

          if (payment) {
            await client.query(
              `INSERT INTO payments
                (id, business_id, reference, order_id, order_number, table_number, amount, method, status, provider_ref, customer_phone_or_name, customer_email)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
              [
                payment.id,
                order.businessId,
                payment.reference,
                order.id,
                order.orderNumber,
                order.tableNumber,
                payment.amount,
                payment.method,
                payment.status || 'pending',
                payment.providerRef || null,
                payment.customerPhoneOrName || order.customerName || 'Guest',
                customerEmail || null,
              ]
            );
          }
        }
      );
      dbPersisted = true;
    } catch (err) {
      console.warn('[Place Order PG Fallback]', err instanceof Error ? err.message : err);
    }
  }

  let emailResult: EmailSendResult | null = null;
  if (customerEmail && typeof customerEmail === 'string' && customerEmail.includes('@')) {
    emailResult = await sendOrderReceiptEmail(customerEmail.trim(), {
      businessName: businessName || 'Sangira Venue',
      orderNumber: order.orderNumber,
      tableNumber: order.tableNumber,
      customerName: order.customerName || 'Guest',
      paymentMethod: order.paymentMethod || 'mtn_momo',
      paymentStatus: order.paymentStatus || 'pending',
      paymentReference: payment?.reference,
      items: order.items || [],
      subtotal: Number(order.subtotal) || 0,
      taxAmount: Number(order.taxAmount) || 0,
      totalAmount: Number(order.totalAmount) || 0,
    });

    await logEmailDispatch(
      order.businessId || null,
      customerEmail.trim(),
      'OrderReceiptEmail',
      `Receipt ${order.orderNumber}`,
      emailResult
    );
  }

  res.json({ ok: true, dbPersisted, emailResult });
});

// Atomic Delivery Confirmation + PostgreSQL Stock Deduction
apiRouter.post('/orders/:id/deliver', async (req: Request, res: Response) => {
  const orderId = req.params.id;
  const { businessId, serverName } = req.body || {};
  const session = await getStaffSession(req.headers);
  const pool = getDbPool();

  if (!pool) {
    return res.json({ ok: true, dbPersisted: false });
  }

  try {
    await withRlsTransaction(
      {
        userId: session.user?.id || 'server',
        businessId: session.user?.businessId || businessId || 'biz-grand-kigali',
        role: session.user?.role || 'SERVER',
      },
      async (client) => {
        const ordRes = await client.query('SELECT * FROM orders WHERE id = $1', [orderId]);
        if (ordRes.rows.length === 0) return;
        const ord = ordRes.rows[0];

        await client.query(
          `UPDATE orders SET status = 'delivered', server_name = $1, delivered_at = NOW() WHERE id = $2`,
          [serverName || 'Floor Server', orderId]
        );
        await client.query(
          `UPDATE department_tickets SET status = 'released_to_service' WHERE order_id = $1`,
          [orderId]
        );

        const items = Array.isArray(ord.items) ? ord.items : [];
        const recipesRes = await client.query('SELECT * FROM recipes WHERE business_id = $1', [
          ord.business_id,
        ]);
        const recipes = recipesRes.rows;

        for (const item of items) {
          const matchedRecipe = recipes.find(
            (r) =>
              r.menu_item_id === item.menuItemId ||
              String(r.menu_item_name || '').toLowerCase() === String(item.name || '').toLowerCase()
          );
          if (!matchedRecipe || !Array.isArray(matchedRecipe.ingredients)) continue;

          for (const ing of matchedRecipe.ingredients) {
            const consumed = Number(ing.quantity || 0) * Number(item.quantity || 1);
            if (consumed <= 0) continue;

            if (matchedRecipe.department === 'bar') {
              await client.query(
                `UPDATE stock_items
                 SET bar_stock = GREATEST(0, bar_stock - $1),
                     central_stock = GREATEST(0, central_stock - $1)
                 WHERE id = $2`,
                [consumed, ing.stockItemId]
              );
            } else {
              await client.query(
                `UPDATE stock_items
                 SET kitchen_stock = GREATEST(0, kitchen_stock - $1),
                     central_stock = GREATEST(0, central_stock - $1)
                 WHERE id = $2`,
                [consumed, ing.stockItemId]
              );
            }

            await client.query(
              `INSERT INTO stock_movements
                (id, business_id, reference, product_id, product_name, type, quantity, unit, source, destination, employee_name, reason)
               VALUES ($1, $2, $3, $4, $5, 'consumption', $6, $7, $8, $9, $10, $11)`,
              [
                `mov-${Date.now()}-${ing.stockItemId}`,
                ord.business_id,
                `MOV-CONS-${Date.now().toString().slice(-5)}`,
                ing.stockItemId,
                ing.stockItemName || 'Ingredient',
                consumed,
                ing.unit || 'unit',
                matchedRecipe.department === 'bar' ? 'Bar Line' : 'Main Kitchen Prep',
                `Guest Service (${ord.table_number})`,
                serverName || 'Server',
                `Order ${ord.order_number} recipe deduction`,
              ]
            );
          }
        }
      }
    );

    res.json({ ok: true, dbPersisted: true });
  } catch (err) {
    res.json({
      ok: true,
      dbPersisted: false,
      warning: err instanceof Error ? err.message : 'PG delivery fallback',
    });
  }
});

// Verify Payment (Cashier / Manager) + Send Verified MoMo Receipt Email
apiRouter.post('/payments/:id/verify', async (req: Request, res: Response) => {
  const paymentId = req.params.id;
  const {
    cashierName,
    notes,
    businessId,
    businessName,
    customerEmail,
    orderNumber,
    tableNumber,
    customerName,
    paymentMethod,
    paymentReference,
    items,
    subtotal,
    taxAmount,
    totalAmount,
  } = req.body || {};

  const session = await getStaffSession(req.headers);
  if (
    session.configured &&
    (!session.authenticated ||
      !['SYSTEM_ADMIN', 'HOTEL_MANAGER', 'CASHIER'].includes(session.user?.role || ''))
  ) {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Only Cashier or Manager accounts may verify settlements.',
    });
  }

  const pool = getDbPool();
  let dbPersisted = false;

  if (pool) {
    try {
      await withRlsTransaction(
        {
          userId: session.user?.id || 'cashier',
          businessId: session.user?.businessId || businessId || 'biz-grand-kigali',
          role: session.user?.role || 'CASHIER',
        },
        async (client) => {
          const payRes = await client.query(
            `UPDATE payments SET status = 'verified', verified_by = $1, notes = $2 WHERE id = $3 RETURNING order_id`,
            [cashierName || 'Authorized Cashier', notes || 'Verified', paymentId]
          );
          const orderId = payRes.rows[0]?.order_id;
          if (orderId) {
            await client.query(`UPDATE orders SET payment_status = 'verified' WHERE id = $1`, [
              orderId,
            ]);
          }
        }
      );
      dbPersisted = true;
    } catch (err) {
      console.warn('[Verify Payment PG Fallback]', err instanceof Error ? err.message : err);
    }
  }

  let emailResult: EmailSendResult | null = null;
  if (customerEmail && typeof customerEmail === 'string' && customerEmail.includes('@')) {
    emailResult = await sendOrderReceiptEmail(customerEmail.trim(), {
      businessName: businessName || 'Sangira Venue',
      orderNumber: orderNumber || 'ORD',
      tableNumber: tableNumber || 'Table',
      customerName: customerName || 'Guest',
      paymentMethod: paymentMethod || 'mtn_momo',
      paymentStatus: 'verified',
      paymentReference: paymentReference || paymentId,
      items: Array.isArray(items) ? items : [],
      subtotal: Number(subtotal) || 0,
      taxAmount: Number(taxAmount) || 0,
      totalAmount: Number(totalAmount) || 0,
    });

    await logEmailDispatch(
      businessId || null,
      customerEmail.trim(),
      'OrderReceiptEmail',
      `Payment Verified · ${orderNumber || paymentId}`,
      emailResult
    );
  }

  res.json({ ok: true, dbPersisted, emailResult });
});

// Staff Shift Clock-In / Clock-Out / Invite + Resend React Email
apiRouter.post('/staff/shifts', async (req: Request, res: Response) => {
  const {
    eventType,
    employeeId,
    employeeName,
    employeeEmail,
    department,
    role,
    businessId,
    businessName,
    timestamp,
  } = req.body || {};

  const session = await getStaffSession(req.headers);
  const pool = getDbPool();
  let dbPersisted = false;

  if (pool) {
    try {
      await withRlsTransaction(
        {
          userId: session.user?.id || employeeId || 'staff',
          businessId: session.user?.businessId || businessId || 'biz-grand-kigali',
          role: session.user?.role || role || 'HOTEL_MANAGER',
        },
        async (client) => {
          if (eventType === 'clock_in') {
            await client.query(
              `INSERT INTO staff_shifts (id, business_id, employee_id, employee_name, department, role, clock_in, status)
               VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')`,
              [
                `sh-${Date.now()}`,
                businessId || 'biz-grand-kigali',
                employeeId,
                employeeName,
                department,
                role,
                timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              ]
            );
            await client.query(
              `UPDATE employees SET shift_status = 'on_duty' WHERE id = $1 OR employee_id = $1`,
              [employeeId]
            );
          } else if (eventType === 'clock_out') {
            await client.query(
              `UPDATE staff_shifts SET status = 'completed', clock_out = $1
               WHERE employee_id = $2 AND status = 'active'`,
              [
                timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                employeeId,
              ]
            );
            await client.query(
              `UPDATE employees SET shift_status = 'off_duty' WHERE id = $1 OR employee_id = $1`,
              [employeeId]
            );
          }
        }
      );
      dbPersisted = true;
    } catch (err) {
      console.warn('[Staff Shift PG Fallback]', err instanceof Error ? err.message : err);
    }
  }

  let emailResult: EmailSendResult | null = null;
  if (employeeEmail && typeof employeeEmail === 'string' && employeeEmail.includes('@')) {
    emailResult = await sendStaffShiftEmail(employeeEmail.trim(), {
      businessName: businessName || 'Grand Kigali Resort & Spa',
      employeeName: employeeName || 'Staff Member',
      employeeId: employeeId || 'EMP',
      department: department || 'Operations',
      role: role || 'STAFF',
      eventType: eventType === 'invite' || eventType === 'clock_out' ? eventType : 'clock_in',
      timestamp: timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    await logEmailDispatch(
      businessId || null,
      employeeEmail.trim(),
      'StaffShiftEmail',
      `Staff ${eventType} · ${employeeId}`,
      emailResult
    );
  }

  res.json({ ok: true, dbPersisted, emailResult });
});

// Test Resend Transactional Email Endpoint (Admin / Manager Verification)
apiRouter.post('/emails/test', async (req: Request, res: Response) => {
  const { recipientEmail, businessName, employeeName } = req.body || {};
  if (!recipientEmail || typeof recipientEmail !== 'string' || !recipientEmail.includes('@')) {
    return res.status(400).json({ error: 'Valid recipient email is required' });
  }

  const emailResult = await sendStaffShiftEmail(recipientEmail.trim(), {
    businessName: businessName || 'Sangira Hospitality Network',
    employeeName: employeeName || 'Administrator',
    employeeId: 'SYS-TEST',
    department: 'Platform Verification',
    role: 'SYSTEM_ADMIN',
    eventType: 'invite',
    timestamp: new Date().toLocaleString(),
  });

  await logEmailDispatch(
    null,
    recipientEmail.trim(),
    'StaffShiftEmail',
    'Sangira Resend Verification Email',
    emailResult
  );

  res.json({ ok: emailResult.sent, emailResult });
});
