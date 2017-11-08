WITH RECURSIVE connectflight(flightcode, flightnumber) AS(
SELECT code, number, depAirport, arrAirport, arrTime, depAirport, econSeats, firstSeats, depAirport || ' -> ' || arrAirport as route, 1 path_len
    FROM flight
UNION
SELECT f2.code, f2.number, f2.depAirport, f2.arrAirport, f2.arrTime, f2.depAirport, f2.econSeats, f2.firstSeats, route || ' -> ' || f2.arrAirport as route, path_len +1 as path_len
	FROM  connectflight, flight f2
	WHERE connectflight.arrAirport = f2.depAirport
    	AND connectflight.arrTime<f2.depTime
    	AND f2.econSeats>0
    	AND f2.firstSeats>0
)
SELECT code, number, route, path_len
FROM connectflight
WHERE path_len > 1
