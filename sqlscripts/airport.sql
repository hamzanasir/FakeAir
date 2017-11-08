CREATE TABLE airport (
  iata char(3) NOT NULL,
  country varchar,
  city varchar, 
  state varchar,
  name varchar,
  longitude real,
  latitude real

  CHECK (state is NOT NULL AND (country = 'United States' or country = 'Canada'))
  PRIMARY KEY (iata)
)
