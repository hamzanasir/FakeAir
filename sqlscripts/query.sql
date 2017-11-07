WITH RECURSIVE connectflight(flightcode, flightnumber) AS(
SELECT flightcode, flightnumber, depairport, arrairport, arrtime, depairport, econseats, firstseats, depairport || ' -> ' || arrairport as route, 1 path_len
    FROM flight
UNION
SELECT f2.flightcode, f2.flightnumber, f2.depairport, f2.arrairport, f2.arrtime, f2.depairport, f2.econseats, f2.firstseats, route || ' -> ' || f2.arrairport as route, path_len +1 as path_len
	FROM  connectflight, flight f2
	WHERE connectflight.arrairport = f2.depairport
    	AND connectflight.arrtime<f2.deptime
    	AND f2.econseats>0
    	AND f2.firstseats>0
)
SELECT flightcode, flightnumber, route, path_len
FROM connectflight
WHERE path_len > 1
