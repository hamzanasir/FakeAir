create table payment (
  email varchar unique,
  name varchar,
  card char(16) unique,
  billing_address varchar,

  PRIMARY KEY (email, name),
  FOREIGN KEY (email, billing_address) references customer(email, billing_address),

  check (billing_address != null and card != null)
)
