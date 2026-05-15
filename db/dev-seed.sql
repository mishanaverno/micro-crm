BEGIN;

INSERT INTO users (
  id,
  first_name,
  last_name,
  email,
  password,
  hashed_refresh_token,
  created_at,
  updated_at
)
VALUES (
  '11111111-1111-4111-8111-111111111111',
  'Dev',
  'User',
  'dev@example.com',
  'devseedusersalt1:631de36176f04acc424174d538f5f67270b672f269775db488e9b543fda374734dedd2cde6675eb10dad42e747d88b95e0fc2954f53f8e88e99e72c8dd96516b',
  NULL,
  '2026-05-01 09:00:00',
  '2026-05-01 09:00:00'
)
ON CONFLICT (id) DO UPDATE
SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  password = EXCLUDED.password,
  hashed_refresh_token = NULL,
  created_at = EXCLUDED.created_at,
  updated_at = EXCLUDED.updated_at;

INSERT INTO clients (
  id,
  user_id,
  first_name,
  last_name,
  email,
  phone_number,
  company,
  created_at,
  updated_at
)
VALUES
  (
    '22222222-2222-4222-8222-222222222221',
    '11111111-1111-4111-8111-111111111111',
    'Ivan',
    'Petrov',
    'ivan.petrov@example.com',
    '+79990000001',
    'Acme LLC',
    '2026-05-01 09:01:00',
    '2026-05-01 09:26:00'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '11111111-1111-4111-8111-111111111111',
    'Anna',
    'Smirnova',
    'anna.smirnova@example.com',
    '+79990000002',
    'North Wind',
    '2026-05-01 09:27:00',
    '2026-05-01 09:47:00'
  ),
  (
    '22222222-2222-4222-8222-222222222223',
    '11111111-1111-4111-8111-111111111111',
    'Pavel',
    'Sidorov',
    'pavel.sidorov@example.com',
    '+79990000003',
    'Orbit Systems',
    '2026-05-01 09:48:00',
    '2026-05-01 10:11:00'
  )
ON CONFLICT (id) DO UPDATE
SET
  user_id = EXCLUDED.user_id,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  phone_number = EXCLUDED.phone_number,
  company = EXCLUDED.company,
  created_at = EXCLUDED.created_at,
  updated_at = EXCLUDED.updated_at,
  deleted_at = NULL;

DELETE FROM events
WHERE user_id = '11111111-1111-4111-8111-111111111111'
  AND client_id IN (
    '22222222-2222-4222-8222-222222222221',
    '22222222-2222-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222223'
  );

DELETE FROM reminders
WHERE user_id = '11111111-1111-4111-8111-111111111111'
  AND client_id IN (
    '22222222-2222-4222-8222-222222222221',
    '22222222-2222-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222223'
  );

DELETE FROM tasks
WHERE user_id = '11111111-1111-4111-8111-111111111111'
  AND client_id IN (
    '22222222-2222-4222-8222-222222222221',
    '22222222-2222-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222223'
  );

DELETE FROM spents
WHERE user_id = '11111111-1111-4111-8111-111111111111'
  AND client_id IN (
    '22222222-2222-4222-8222-222222222221',
    '22222222-2222-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222223'
  );

DELETE FROM paids
WHERE user_id = '11111111-1111-4111-8111-111111111111'
  AND client_id IN (
    '22222222-2222-4222-8222-222222222221',
    '22222222-2222-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222223'
  );

DELETE FROM notes
WHERE user_id = '11111111-1111-4111-8111-111111111111'
  AND client_id IN (
    '22222222-2222-4222-8222-222222222221',
    '22222222-2222-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222223'
  );

DELETE FROM orders
WHERE user_id = '11111111-1111-4111-8111-111111111111'
  AND client_id IN (
    '22222222-2222-4222-8222-222222222221',
    '22222222-2222-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222223'
  );

INSERT INTO orders (
  id,
  user_id,
  client_id,
  title,
  price,
  content,
  status,
  created_at,
  updated_at
)
VALUES
  (2001, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'CRM onboarding', 150000.00, 'CRM onboarding and sales pipeline setup', 'inprogress', '2026-05-01 09:03:00', '2026-05-01 09:16:00'),
  (2002, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'Quarterly support pack', 80000.00, 'Quarterly consulting and support retainer', 'done', '2026-05-01 09:17:00', '2026-05-01 09:24:00'),
  (2003, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'Website redesign', 245000.00, 'Website redesign with lead forms and analytics', 'created', '2026-05-01 09:29:00', '2026-05-01 09:35:00'),
  (2004, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'Brand refresh rollout', 132000.00, 'Design rollout for updated brand materials', 'done', '2026-05-01 09:36:00', '2026-05-01 09:47:00'),
  (2005, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222223', 'Reporting dashboard', 98000.00, 'Reporting dashboard implementation', 'inprogress', '2026-05-01 09:50:00', '2026-05-01 09:57:00'),
  (2006, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222223', 'Data migration', 175000.00, 'Legacy data migration and validation', 'done', '2026-05-01 09:58:00', '2026-05-01 10:09:00');

INSERT INTO notes (
  id,
  user_id,
  client_id,
  order_id,
  content,
  created_at,
  updated_at
)
VALUES
  (1001, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 2001, 'Client wants onboarding checklists for each sales role.', '2026-05-01 09:05:00', '2026-05-01 09:05:00'),
  (1002, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', NULL, 'Prefers communication by email after 18:00.', '2026-05-01 09:25:00', '2026-05-01 09:25:00'),
  (1003, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 2004, 'Asked to include print-ready templates in the final handoff.', '2026-05-01 09:38:00', '2026-05-01 09:38:00'),
  (1004, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222223', 2005, 'Requested weekly progress snapshots while the dashboard is in progress.', '2026-05-01 09:52:00', '2026-05-01 09:52:00'),
  (1005, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222223', NULL, 'Budget owner joins the next call, prepare enterprise options.', '2026-05-01 10:10:00', '2026-05-01 10:10:00');

INSERT INTO tasks (
  id,
  user_id,
  client_id,
  order_id,
  content,
  status,
  created_at,
  updated_at
)
VALUES
  (4001, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 2001, 'Prepare onboarding checklist draft.', 'complete', '2026-05-01 09:07:00', '2026-05-01 09:07:00'),
  (4002, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 2001, 'Schedule kickoff workshop with sales leads.', 'pending', '2026-05-01 09:09:00', '2026-05-01 09:09:00'),
  (4003, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 2002, 'Deliver final quarterly support summary.', 'complete', '2026-05-01 09:19:00', '2026-05-01 09:19:00'),
  (4004, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 2003, 'Collect current website analytics baseline.', 'pending', '2026-05-01 09:31:00', '2026-05-01 09:31:00'),
  (4005, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 2004, 'Prepare updated logo export pack.', 'complete', '2026-05-01 09:40:00', '2026-05-01 09:40:00'),
  (4006, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 2004, 'Send rollout checklist to marketing team.', 'complete', '2026-05-01 09:42:00', '2026-05-01 09:42:00'),
  (4007, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222223', 2005, 'Confirm metrics list for the dashboard MVP.', 'pending', '2026-05-01 09:54:00', '2026-05-01 09:54:00'),
  (4008, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222223', 2006, 'Run dry migration on staging data set.', 'complete', '2026-05-01 10:00:00', '2026-05-01 10:00:00'),
  (4009, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222223', 2006, 'Prepare rollback checklist.', 'complete', '2026-05-01 10:02:00', '2026-05-01 10:02:00');

INSERT INTO spents (
  id,
  user_id,
  client_id,
  order_id,
  value,
  created_at,
  updated_at
)
VALUES
  (5001, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 2001, 12000.00, '2026-05-01 09:11:00', '2026-05-01 09:11:00'),
  (5002, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 2001, 3500.00, '2026-05-01 09:12:00', '2026-05-01 09:12:00'),
  (5003, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 2002, 9000.00, '2026-05-01 09:21:00', '2026-05-01 09:21:00'),
  (5004, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 2003, 7000.00, '2026-05-01 09:33:00', '2026-05-01 09:33:00'),
  (5005, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 2004, 14000.00, '2026-05-01 09:44:00', '2026-05-01 09:44:00'),
  (5006, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222223', 2005, 6000.00, '2026-05-01 09:56:00', '2026-05-01 09:56:00'),
  (5007, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222223', 2005, 2500.00, '2026-05-01 09:57:00', '2026-05-01 09:57:00'),
  (5008, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222223', 2006, 22000.00, '2026-05-01 10:04:00', '2026-05-01 10:04:00');

INSERT INTO paids (
  id,
  user_id,
  client_id,
  order_id,
  value,
  created_at,
  updated_at
)
VALUES
  (3001, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 2001, 50000.00, '2026-05-01 09:13:00', '2026-05-01 09:13:00'),
  (3002, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 2002, 80000.00, '2026-05-01 09:22:00', '2026-05-01 09:22:00'),
  (3003, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222223', 2006, 175000.00, '2026-05-01 10:05:00', '2026-05-01 10:05:00');

INSERT INTO reminders (
  id,
  user_id,
  client_id,
  order_id,
  content,
  timestamp,
  created_at,
  updated_at
)
VALUES
  (7001, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 2001, 'Send kickoff agenda to the client.', '2026-05-03 10:00:00', '2026-05-01 09:15:00', '2026-05-01 09:15:00'),
  (7002, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 2003, 'Check if analytics access was granted.', '2026-05-04 11:00:00', '2026-05-01 09:34:00', '2026-05-01 09:34:00'),
  (7003, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 2004, 'Ask for final sign-off on refreshed assets.', '2026-05-05 15:00:00', '2026-05-01 09:45:00', '2026-05-01 09:45:00'),
  (7004, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222223', 2006, 'Confirm migration freeze window with operations.', '2026-05-06 12:00:00', '2026-05-01 10:07:00', '2026-05-01 10:07:00');

INSERT INTO events (
  original_id,
  user_id,
  client_id,
  type,
  comment,
  payload,
  created_at,
  updated_at
)
VALUES
  (NULL, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'client_created', NULL, '{"client_id":"22222222-2222-4222-8222-222222222221","first_name":"Ivan","last_name":"Petrov","email":"ivan.petrov@example.com","phone_number":"+79990000001","company":"Acme LLC"}'::jsonb, '2026-05-01 09:02:00', '2026-05-01 09:02:00'),
  (NULL, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'order_created', NULL, '{"order_id":2001,"title":"CRM onboarding","price":"150000.00","content":"CRM onboarding and sales pipeline setup","status":"created"}'::jsonb, '2026-05-01 09:04:00', '2026-05-01 09:04:00'),
  (1001, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'note', NULL, '{"note_id":1001,"content":"Client wants onboarding checklists for each sales role.","order_id":2001}'::jsonb, '2026-05-01 09:06:00', '2026-05-01 09:06:00'),
  (4001, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'task', NULL, '{"task_id":4001,"content":"Prepare onboarding checklist draft.","status":"complete","order_id":2001}'::jsonb, '2026-05-01 09:08:00', '2026-05-01 09:08:00'),
  (4002, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'task', NULL, '{"task_id":4002,"content":"Schedule kickoff workshop with sales leads.","status":"pending","order_id":2001}'::jsonb, '2026-05-01 09:10:00', '2026-05-01 09:10:00'),
  (3001, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'paid', NULL, '{"paid_id":3001,"order_id":2001,"value":"50000.00"}'::jsonb, '2026-05-01 09:14:00', '2026-05-01 09:14:00'),
  (7001, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'reminder', NULL, '{"reminder_id":7001,"content":"Send kickoff agenda to the client.","timestamp":"2026-05-03T10:00:00.000Z","order_id":2001}'::jsonb, '2026-05-01 09:16:00', '2026-05-01 09:16:00'),
  (NULL, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'order_created', NULL, '{"order_id":2002,"title":"Quarterly support pack","price":"80000.00","content":"Quarterly consulting and support retainer","status":"created"}'::jsonb, '2026-05-01 09:18:00', '2026-05-01 09:18:00'),
  (4003, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'task', NULL, '{"task_id":4003,"content":"Deliver final quarterly support summary.","status":"complete","order_id":2002}'::jsonb, '2026-05-01 09:20:00', '2026-05-01 09:20:00'),
  (3002, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'paid', NULL, '{"paid_id":3002,"order_id":2002,"value":"80000.00"}'::jsonb, '2026-05-01 09:23:00', '2026-05-01 09:23:00'),
  (NULL, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'order_complete', NULL, '{"order_id":2002,"title":"Quarterly support pack","price":"80000.00","content":"Quarterly consulting and support retainer","status":"done","changed_fields":[{"field":"status","from":"inprogress","to":"done"}]}'::jsonb, '2026-05-01 09:24:00', '2026-05-01 09:24:00'),
  (1002, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'note', NULL, '{"note_id":1002,"content":"Prefers communication by email after 18:00.","order_id":null}'::jsonb, '2026-05-01 09:26:00', '2026-05-01 09:26:00'),

  (NULL, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'client_created', NULL, '{"client_id":"22222222-2222-4222-8222-222222222222","first_name":"Anna","last_name":"Smirnova","email":"anna.smirnova@example.com","phone_number":"+79990000002","company":"North Wind"}'::jsonb, '2026-05-01 09:28:00', '2026-05-01 09:28:00'),
  (NULL, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'order_created', NULL, '{"order_id":2003,"title":"Website redesign","price":"245000.00","content":"Website redesign with lead forms and analytics","status":"created"}'::jsonb, '2026-05-01 09:30:00', '2026-05-01 09:30:00'),
  (4004, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'task', NULL, '{"task_id":4004,"content":"Collect current website analytics baseline.","status":"pending","order_id":2003}'::jsonb, '2026-05-01 09:32:00', '2026-05-01 09:32:00'),
  (7002, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'reminder', NULL, '{"reminder_id":7002,"content":"Check if analytics access was granted.","timestamp":"2026-05-04T11:00:00.000Z","order_id":2003}'::jsonb, '2026-05-01 09:35:00', '2026-05-01 09:35:00'),
  (NULL, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'order_created', NULL, '{"order_id":2004,"title":"Brand refresh rollout","price":"132000.00","content":"Design rollout for updated brand materials","status":"created"}'::jsonb, '2026-05-01 09:37:00', '2026-05-01 09:37:00'),
  (1003, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'note', NULL, '{"note_id":1003,"content":"Asked to include print-ready templates in the final handoff.","order_id":2004}'::jsonb, '2026-05-01 09:39:00', '2026-05-01 09:39:00'),
  (4005, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'task', NULL, '{"task_id":4005,"content":"Prepare updated logo export pack.","status":"complete","order_id":2004}'::jsonb, '2026-05-01 09:41:00', '2026-05-01 09:41:00'),
  (4006, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'task', NULL, '{"task_id":4006,"content":"Send rollout checklist to marketing team.","status":"complete","order_id":2004}'::jsonb, '2026-05-01 09:43:00', '2026-05-01 09:43:00'),
  (7003, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'reminder', NULL, '{"reminder_id":7003,"content":"Ask for final sign-off on refreshed assets.","timestamp":"2026-05-05T15:00:00.000Z","order_id":2004}'::jsonb, '2026-05-01 09:46:00', '2026-05-01 09:46:00'),
  (NULL, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'order_complete', NULL, '{"order_id":2004,"title":"Brand refresh rollout","price":"132000.00","content":"Design rollout for updated brand materials","status":"done","changed_fields":[{"field":"status","from":"inprogress","to":"done"}]}'::jsonb, '2026-05-01 09:47:00', '2026-05-01 09:47:00'),

  (NULL, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222223', 'client_created', NULL, '{"client_id":"22222222-2222-4222-8222-222222222223","first_name":"Pavel","last_name":"Sidorov","email":"pavel.sidorov@example.com","phone_number":"+79990000003","company":"Orbit Systems"}'::jsonb, '2026-05-01 09:49:00', '2026-05-01 09:49:00'),
  (NULL, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222223', 'order_created', NULL, '{"order_id":2005,"title":"Reporting dashboard","price":"98000.00","content":"Reporting dashboard implementation","status":"created"}'::jsonb, '2026-05-01 09:51:00', '2026-05-01 09:51:00'),
  (1004, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222223', 'note', NULL, '{"note_id":1004,"content":"Requested weekly progress snapshots while the dashboard is in progress.","order_id":2005}'::jsonb, '2026-05-01 09:53:00', '2026-05-01 09:53:00'),
  (4007, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222223', 'task', NULL, '{"task_id":4007,"content":"Confirm metrics list for the dashboard MVP.","status":"pending","order_id":2005}'::jsonb, '2026-05-01 09:55:00', '2026-05-01 09:55:00'),
  (NULL, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222223', 'order_created', NULL, '{"order_id":2006,"title":"Data migration","price":"175000.00","content":"Legacy data migration and validation","status":"created"}'::jsonb, '2026-05-01 09:59:00', '2026-05-01 09:59:00'),
  (4008, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222223', 'task', NULL, '{"task_id":4008,"content":"Run dry migration on staging data set.","status":"complete","order_id":2006}'::jsonb, '2026-05-01 10:01:00', '2026-05-01 10:01:00'),
  (4009, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222223', 'task', NULL, '{"task_id":4009,"content":"Prepare rollback checklist.","status":"complete","order_id":2006}'::jsonb, '2026-05-01 10:03:00', '2026-05-01 10:03:00'),
  (3003, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222223', 'paid', NULL, '{"paid_id":3003,"order_id":2006,"value":"175000.00"}'::jsonb, '2026-05-01 10:06:00', '2026-05-01 10:06:00'),
  (7004, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222223', 'reminder', NULL, '{"reminder_id":7004,"content":"Confirm migration freeze window with operations.","timestamp":"2026-05-06T12:00:00.000Z","order_id":2006}'::jsonb, '2026-05-01 10:08:00', '2026-05-01 10:08:00'),
  (NULL, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222223', 'order_complete', NULL, '{"order_id":2006,"title":"Data migration","price":"175000.00","content":"Legacy data migration and validation","status":"done","changed_fields":[{"field":"status","from":"inprogress","to":"done"}]}'::jsonb, '2026-05-01 10:09:00', '2026-05-01 10:09:00'),
  (1005, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222223', 'note', NULL, '{"note_id":1005,"content":"Budget owner joins the next call, prepare enterprise options.","order_id":null}'::jsonb, '2026-05-01 10:11:00', '2026-05-01 10:11:00');

SELECT setval(pg_get_serial_sequence('orders', 'id'), COALESCE((SELECT MAX(id) FROM orders), 1), true);
SELECT setval(pg_get_serial_sequence('notes', 'id'), COALESCE((SELECT MAX(id) FROM notes), 1), true);
SELECT setval(pg_get_serial_sequence('tasks', 'id'), COALESCE((SELECT MAX(id) FROM tasks), 1), true);
SELECT setval(pg_get_serial_sequence('spents', 'id'), COALESCE((SELECT MAX(id) FROM spents), 1), true);
SELECT setval(pg_get_serial_sequence('paids', 'id'), COALESCE((SELECT MAX(id) FROM paids), 1), true);
SELECT setval(pg_get_serial_sequence('reminders', 'id'), COALESCE((SELECT MAX(id) FROM reminders), 1), true);

COMMIT;
