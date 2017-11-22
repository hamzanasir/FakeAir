Create table payment (
  email varchar,
  card char(16),
  billing_address varchar unique,

  primary key (email, card),
  check (billing_address != null and card != null)
)
