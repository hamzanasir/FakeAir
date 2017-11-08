create table flight(
	  flightID serial,
	  code char(2),
    number int,
    date date,
    depAirport char(3) not null,
    arrAirport char(3) not null,
    depTime time not null,
    arrTime time not null,
    econSeats int not null,
    firstSeats int not null,
    miles real not null,
    firstPrice real not null,
    econPrice real not null,
    primary key (code, number, date),
    foreign key (code) references airline(code),
    foreign key (depAirport) references airport(iata),
    foreign key (arrAirport) references airport(iata)
)
