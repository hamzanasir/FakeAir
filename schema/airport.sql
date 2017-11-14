CREATE TABLE airport (
  iata char(3) primary key,
  country varchar,
  city varchar,
  state varchar,
  name varchar,
  longitude real,
  latitude real

  CHECK ((state != NULL AND (country = 'United States' or country = 'Canada')) OR (state = NULL AND (country != 'United States' or country != 'Canada')))
)
