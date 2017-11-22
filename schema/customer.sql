CREATE TABLE customer (
  email varchar,
  first_name varchar,
  last_name varchar,
  mileages int,
  home_airport char(3),
  address1 varchar,
  address2 varchar,

  primary key (email),
  foreign key (home_airport) references airport(iata),
  foreign key (email) references payment(email)
)
