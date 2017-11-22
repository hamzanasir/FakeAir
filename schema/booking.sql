create table booking(
  confirmation varchar,
  email varchar,
  flightID integer[],
  class varchar,
  card char(16),

  primary key(email,flightID),
  foreign key(email, card) references payment(email, card),
  foreign key (flightID) references flight(flightID),
  check(class = 'Economy' or class = 'First')
)
