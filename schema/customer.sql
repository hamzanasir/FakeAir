CREATE TABLE customer (
  email varchar,
  first_name varchar,
  last_name varchar,
  passport varchar,
  dob date,
  mileages int,

  primary key (email),
  foreign key (billing_address) references payment(billing_address),
  foreign key (home_airport) references airport(iata)
)
