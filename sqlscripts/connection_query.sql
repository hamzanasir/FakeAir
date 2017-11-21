   WITH RECURSIVE connectflight(flightcode, flightnumber) AS(
   SELECT flightID, code, number, code || '-' || number as flightInfo, date, date || ',' as dateL ,depAirport, arrAirport, arrTime, depAirport, econSeats, firstSeats, flightID || ',' as serialID, (arrTime-depTime) as duration, ARRAY[depAirport,arrAirport]::text[] as route, 1 path_len, cast(depTime as varchar) || '~' || cast(arrTime as varchar) as timeSet, Array[econPrice] as econPriceL, Array[firstPrice] as firstPriceL, econSeats || '' as econLeft, firstSeats || '' as firstLeft
       FROM flight
   UNION
   SELECT f2.flightID, f2.code, f2.number, flightInfo || ',' || f2.code || '-' || f2.number as flightInfo, f2.date, dateL || f2.date as dateL, f2.depAirport, f2.arrAirport, f2.arrTime, f2.depAirport, f2.econSeats, f2.firstSeats, serialID|| f2.flightID as serialID, duration + (f2.arrTime - f2.depTime) as duration, route || Array[f2.arrAirport]::text[] as route, path_len +1 as path_len, timeSet|| ',' || (f2.depTime || '~' || f2.arrTime) as timeSet, econPriceL || Array[f2.econPrice] as econPriceL, firstPriceL || Array[f2.firstPrice] as firstPriceL, econLeft || ',' || f2.econSeats as econLeft, firstLeft || ',' || f2.firstSeats as firstLeft
       FROM  connectflight, flight f2
   	WHERE connectflight.arrAirport = f2.depAirport
       	AND ((connectflight.date < f2.date) OR (connectflight.arrTime<f2.depTime and connectflight.date = f2.date))
       	AND f2.econSeats>0
       	AND f2.firstSeats>0
       	AND NOT (ARRAY[f2.arrAirport]::text[] <@ route)
   )
   SELECT distinct serialID, flightInfo, duration, array_to_string(route,',') as route, path_len, dateL, timeSet, array_to_string(econPriceL, ',') as econPrice, array_to_string(firstPriceL, ',') as firstPrice, (Select sum(s) from unnest(econPriceL) as s) as econPriceSum, (Select sum(u) from unnest(firstPriceL) as u) as firstPriceSum, econSeats, firstSeats
   FROM connectflight
   WHERE (array_to_string(route, ',') like 'ORD%' and array_to_string(route, ',') like '%MAD')
      and (dateL like '2017-11-20%')
      and path_len > 0
