CREATE TABLE customer (
  email varchar unique,
  first_name varchar,
  last_name varchar,
  billing_address address,
  home_airport char(3),
  mileages int,

  primary key (email),
  foreign key (billing_address) references payment(billing_address),
  foreign key (home_airport) references airport(iata)
)
