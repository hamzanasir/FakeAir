create table booking(
  confirmation varchar,
  email varchar,
  flightID integer,
  flightType varchar,
  class varchar,
  card char(16),

  primary key(email,flightID),
  foreign key(email, card) references payment(email, card),
  foreign key(email) references customer(email),
  foreign key (flightID) references flight(flightID),
  check(class = 'guestclass' or class = 'firstclass')
)
