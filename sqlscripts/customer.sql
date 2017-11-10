CREATE TABLE customer (
  email varchar unique,
  name varchar,
  billing_address varchar unique,
  home_airport char(3),
  miles int,


  foreign key (email, name) references payment(email,name),
  primary key (email, billing_address),
  foreign key (billing_address) references payment(billing_address),
  foreign key (home_airport) references airport(iata),

)
