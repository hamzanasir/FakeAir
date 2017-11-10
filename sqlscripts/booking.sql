create table booking(
  email varchar,
  flightID int,
  class varchar,
  card char(16),

  primary key(email,flightID,card),
  foreign key(email) references customer(email),
  foreign key(card) references payment(card),
  foreign key (flightID) references flight(flightID),
  check(class = 'Economy' or class = 'First')
)
