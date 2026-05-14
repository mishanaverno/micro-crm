BEGIN;

INSERT INTO users (
  id,
  first_name,
  last_name,
  email,
  password,
  hashed_refresh_token
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Dev',
  'User',
  'dev@example.com',
  'devseedusersalt1:631de36176f04acc424174d538f5f67270b672f269775db488e9b543fda374734dedd2cde6675eb10dad42e747d88b95e0fc2954f53f8e88e99e72c8dd96516b',
  NULL
)
ON CONFLICT (id) DO UPDATE
SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  password = EXCLUDED.password,
  hashed_refresh_token = NULL;

INSERT INTO clients (
  id,
  user_id,
  first_name,
  last_name,
  email,
  phone_number,
  company
)
VALUES
  (
    '22222222-2222-2222-2222-222222222221',
    '11111111-1111-1111-1111-111111111111',
    'Ivan',
    'Petrov',
    'ivan.petrov@example.com',
    '+79990000001',
    'Acme LLC'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Anna',
    'Smirnova',
    'anna.smirnova@example.com',
    '+79990000002',
    'North Wind'
  ),
  (
    '22222222-2222-2222-2222-222222222223',
    '11111111-1111-1111-1111-111111111111',
    'Pavel',
    'Sidorov',
    'pavel.sidorov@example.com',
    '+79990000003',
    'Orbit Systems'
  )
ON CONFLICT (id) DO UPDATE
SET
  user_id = EXCLUDED.user_id,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  phone_number = EXCLUDED.phone_number,
  company = EXCLUDED.company,
  deleted_at = NULL;

DELETE FROM notes
WHERE user_id = '11111111-1111-1111-1111-111111111111'
  AND client_id IN (
    '22222222-2222-2222-2222-222222222221',
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222223'
  );

DELETE FROM orders
WHERE user_id = '11111111-1111-1111-1111-111111111111'
  AND client_id IN (
    '22222222-2222-2222-2222-222222222221',
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222223'
  );

INSERT INTO notes (
  id,
  user_id,
  client_id,
  content
)
VALUES
  (
    1001,
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    'Interested in expanding the contract next quarter.'
  ),
  (
    1002,
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    'Prefers communication by email after 18:00.'
  ),
  (
    1003,
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Asked for a revised pricing proposal for the team plan.'
  ),
  (
    1004,
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Follow up next Tuesday after internal approval meeting.'
  ),
  (
    1005,
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Interested in onboarding support and migration assistance.'
  ),
  (
    1006,
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222223',
    'Requested a demo focused on reporting and analytics.'
  ),
  (
    1007,
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222223',
    'Budget owner joins the next call, prepare enterprise options.'
  );

INSERT INTO orders (
  id,
  user_id,
  client_id,
  price,
  content,
  status
)
VALUES
  (
    2001,
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    150000.00,
    'CRM onboarding and sales pipeline setup',
    'created'
  ),
  (
    2002,
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    245000.00,
    'Website redesign with lead forms and analytics',
    'inprogress'
  ),
  (
    2003,
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222223',
    98000.00,
    'Reporting dashboard implementation',
    'done'
  );

DELETE FROM events
WHERE user_id = '11111111-1111-1111-1111-111111111111'
  AND client_id IN (
    '22222222-2222-2222-2222-222222222221',
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222223'
  )
  AND type IN ('client_created', 'note', 'order_created');

INSERT INTO events (
  user_id,
  client_id,
  type,
  comment,
  payload
)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    'client_created',
    'Client created',
    '{"client_id":"22222222-2222-2222-2222-222222222221","first_name":"Ivan","last_name":"Petrov","email":"ivan.petrov@example.com","phone_number":"+79990000001","company":"Acme LLC"}'::jsonb
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'client_created',
    'Client created',
    '{"client_id":"22222222-2222-2222-2222-222222222222","first_name":"Anna","last_name":"Smirnova","email":"anna.smirnova@example.com","phone_number":"+79990000002","company":"North Wind"}'::jsonb
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222223',
    'client_created',
    'Client created',
    '{"client_id":"22222222-2222-2222-2222-222222222223","first_name":"Pavel","last_name":"Sidorov","email":"pavel.sidorov@example.com","phone_number":"+79990000003","company":"Orbit Systems"}'::jsonb
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    'note',
    'Note created',
    '{"note_id":1001,"content":"Interested in expanding the contract next quarter."}'::jsonb
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    'note',
    'Note created',
    '{"note_id":1002,"content":"Prefers communication by email after 18:00."}'::jsonb
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'note',
    'Note created',
    '{"note_id":1003,"content":"Asked for a revised pricing proposal for the team plan."}'::jsonb
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'note',
    'Note created',
    '{"note_id":1004,"content":"Follow up next Tuesday after internal approval meeting."}'::jsonb
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'note',
    'Note created',
    '{"note_id":1005,"content":"Interested in onboarding support and migration assistance."}'::jsonb
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222223',
    'note',
    'Note created',
    '{"note_id":1006,"content":"Requested a demo focused on reporting and analytics."}'::jsonb
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222223',
    'note',
    'Note created',
    '{"note_id":1007,"content":"Budget owner joins the next call, prepare enterprise options."}'::jsonb
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    'order_created',
    'Order created',
    '{"order_id":2001,"price":"150000.00","content":"CRM onboarding and sales pipeline setup","status":"created"}'::jsonb
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'order_created',
    'Order created',
    '{"order_id":2002,"price":"245000.00","content":"Website redesign with lead forms and analytics","status":"inprogress"}'::jsonb
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222223',
    'order_created',
    'Order created',
    '{"order_id":2003,"price":"98000.00","content":"Reporting dashboard implementation","status":"done"}'::jsonb
  );

COMMIT;
