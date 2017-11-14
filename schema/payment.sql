Create type address as (streetNum int, streetName varchar, city varchar, state varchar, zip int)

Create table payment (
  email varchar,
  card char(16),
  billing_address address unique,

  primary key (email, card),
  check (billing_address != null and card != null)
)
