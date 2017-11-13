WITH RECURSIVE connectflight(flightcode, flightnumber) AS(
SELECT flightID, code, number, date, date || ',' as dateL ,depAirport, arrAirport, arrTime, depAirport, econSeats, firstSeats, flightID || ',' as serialID, (arrTime-depTime) as duration, depAirport || ',' || arrAirport as route, 1 path_len, cast(depTime as varchar) || '~' || cast(arrTime as varchar) as timeSet
    FROM flight
UNION
SELECT f2.flightID, f2.code, f2.number, f2.date, dateL || f2.date as dateL, f2.depAirport, f2.arrAirport, f2.arrTime, f2.depAirport, f2.econSeats, f2.firstSeats, serialID|| f2.flightID as serialID, duration + (f2.arrTime - f2.depTime) as duration, route || ',' || f2.arrAirport as route, path_len +1 as path_len, timeSet|| ',' || (f2.depTime || '~' || f2.arrTime) as timeSet
	FROM  connectflight, flight f2
	WHERE connectflight.arrAirport = f2.depAirport
    	AND ((connectflight.date < f2.date) OR (connectflight.arrTime<f2.depTime and connectflight.date = f2.date))
    	AND f2.econSeats>0
    	AND f2.firstSeats>0
)
SELECT distinct serialID, duration, route, path_len, dateL, timeSet
FROM connectflight
WHERE (route like 'MAD,%' and route like '%ORD')
   and (dateL like '2017-11-22%' and dateL like '%2017-11-24')
   and path_len > 0
