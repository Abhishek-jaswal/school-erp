-- Add migration script here
CREATE TABLE teachers (
  id VARCHAR PRIMARY KEY,
  firstName TEXT,
  lastName TEXT,
  email TEXT,
  contact TEXT,
  address TEXT,
  aadharNumber TEXT,
  alternateNumber TEXT,
  education TEXT,
  subject TEXT,
  password TEXT
);

CREATE TABLE students (
  id VARCHAR PRIMARY KEY,
  firstName TEXT,
  lastName TEXT,
  email TEXT,
  contact TEXT,
  address TEXT,
  aadharNumber TEXT,
  alternateNumber TEXT,
  education TEXT,
  subject TEXT,
  password TEXT
);
INSERT INTO teachers (
  id, firstName, lastName, email, contact, address,
  aadharNumber, alternateNumber, education, subject, password
)
VALUES (
  'admin', 'Admin', 'User', 'admin@example.com', '9999999999', 'HQ',
  '123456789012', '8888888888', 'MBA', 'IT',
  '$2b$04$Kzfz0Wc1OaKTUeOAYK7LOeuIEt/gbmfYOEy1KjLStMgfEtcCG4qJm' -- hash for admin123
);
