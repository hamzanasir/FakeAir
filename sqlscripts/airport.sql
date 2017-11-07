CREATE TABLE airport (
  iata char(3) NOT NULL,
  country varchar,
  state varchar,
  name varchar,
  longitude real,
  latitude real

  CHECK (state = NULL where country = 'United States' or country = 'Canada')
  PRIMARY KEY (iata)
)
