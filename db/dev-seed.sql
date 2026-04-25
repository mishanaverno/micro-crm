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

INSERT INTO notes (
  user_id,
  client_id,
  content
)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    'Interested in expanding the contract next quarter.'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    'Prefers communication by email after 18:00.'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Asked for a revised pricing proposal for the team plan.'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Follow up next Tuesday after internal approval meeting.'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Interested in onboarding support and migration assistance.'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222223',
    'Requested a demo focused on reporting and analytics.'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222223',
    'Budget owner joins the next call, prepare enterprise options.'
  );

COMMIT;
