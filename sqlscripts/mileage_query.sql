update customer
  set mileages = (select sum(f.miles) as sum
               from booking b, flight f, customer c
               where b.flightID = f.flightID
                 and b.email = c.email)
