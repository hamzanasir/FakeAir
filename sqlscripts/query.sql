WITH RECURSIVE connectflight(flightcode, flightnumber) AS(
SELECT flightID, code, number, date, depAirport, arrAirport, arrTime, depAirport, econSeats, firstSeats, flightID || ', ' as serialID ,depAirport || ', ' || arrAirport as route, 1 path_len
    FROM flight
UNION
SELECT f2.flightID, f2.code, f2.number, f2.date, f2.depAirport, f2.arrAirport, f2.arrTime, f2.depAirport, f2.econSeats, f2.firstSeats, serialID|| f2.flightID as serialID, route || ', ' || f2.arrAirport as route, path_len +1 as path_len
	FROM  connectflight, flight f2
	WHERE connectflight.arrAirport = f2.depAirport
    	AND ((connectflight.date < f2.date) OR (connectflight.arrTime<f2.depTime and connectflight.date = f2.date))
    	AND f2.econSeats>0
    	AND f2.firstSeats>0
)
SELECT distinct serialID, route, path_len
FROM connectflight
WHERE path_len > 1
