/* eslint-disable no-param-reassign, no-console, max-len, prefer-destructuring */

require('dotenv').load();
const { Client } = require('pg');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const url = require('url');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');

const ssl = (process.env.NODE_ENV === 'production');

const app = express();
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 120000 },
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
app.set('view engine', 'ejs');
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

function confirmation(email, cnumber, callback) { // eslint-disable-line
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'fakeair01@gmail.com',
      pass: 'fakeairfakeair',
    },
  });

  const mailOptions = {
    from: 'fakeair01@gmail.com',
    to: email,
    subject: 'Flight Confirmation',
    html: `<h1>Fake Air</h1><p>Thank you for booking with us! It is to notify that your bookinng has been confirmed. Your flight confirmation number is: ${cnumber} </p>`,
  };

  transporter.sendMail(mailOptions, callback);
}

function tConvert(time) {
  // Check correct time format and split into components
  time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

  if (time.length > 1) { // If time format correct
    time = time.slice(1); // Remove full string match value
    time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
    time.splice(3, 1);
  }
  return time.join(''); // return adjusted time or original string
}

function parseData(arr) {
  let j;
  let i;
  for (j = 0; j < arr.length; j += 1) {
    arr[j].serialid = ((arr[j].serialid).split(',')).filter(element => element !== '');
    arr[j].route = (arr[j].route).split(',');
    arr[j].datel = (arr[j].datel).split(',');
    const array = [];
    const x = arr[j].timeset.split(',');
    for (i = 0; i < x.length; i += 1) {
      const y = x[i].split('~');
      array.push({
        dep: tConvert(y[0]),
        arrtime: tConvert(y[1]),
      });
    }
    arr[j].timeset = array;
  }
  return arr;
}

function buildStatement(passinfo, credinfo, flightinfo, confirmationnum, returnState) {
  const params = [];
  const chunks = [];
  let i;
  let flightid;
  let valueClause;
  for (i = 0; i < flightinfo.depart.serialid.length; i += 1) {
    flightid = flightinfo.depart.serialid[i];
    valueClause = [];
    params.push(confirmationnum);
    valueClause.push(`$${params.length}`);
    params.push(passinfo.email);
    valueClause.push(`$${params.length}`);
    params.push(flightid);
    valueClause.push(`$${params.length}`);
    params.push('depart');
    valueClause.push(`$${params.length}`);
    params.push(flightinfo.depart.departClass);
    valueClause.push(`$${params.length}`);
    params.push(credinfo.number);
    valueClause.push(`$${params.length}`);
    chunks.push(`(${valueClause.join(', ')})`);
  }
  if (returnState) {
    for (i = 0; i < flightinfo.return.serialid.length; i += 1) {
      flightid = flightinfo.return.serialid[i];
      valueClause = [];
      params.push(confirmationnum);
      valueClause.push(`$${params.length}`);
      params.push(passinfo.email);
      valueClause.push(`$${params.length}`);
      params.push(flightid);
      valueClause.push(`$${params.length}`);
      params.push('return');
      valueClause.push(`$${params.length}`);
      params.push(flightinfo.return.returnClass);
      valueClause.push(`$${params.length}`);
      params.push(credinfo.number);
      valueClause.push(`$${params.length}`);
      chunks.push(`(${valueClause.join(', ')})`);
    }
  }
  return {
    text: `INSERT INTO booking VALUES ${chunks.join(', ')}`,
    values: params,
  };
}

function checkBillingAddress(cardArray) {
  let i;
  for (i = 0; i < cardArray.length; i += 1) {
    if (cardArray[i].billing_address === cardArray[i].address1 && cardArray[i].billing_address === cardArray[i].address2) {
      return 'both';
    } else if (cardArray[i].billing_address === cardArray[i].address1) {
      return 'address1';
    } else if (cardArray[i].billing_address === cardArray[i].address2) {
      return 'address2';
    }
  }
  return false;
}

app.get('/', (req, res) => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl,
  });
  client.connect();
  const query = 'SELECT iata, name, state, city, country FROM airport';
  client.query(query, (err, airport) => {
    if (err) {
      res.render('landing');
      console.log(err.stack); // eslint-disable-line no-console
    } else {
      res.render('landing', { airport: airport.rows });
    }
    client.end();
  });
});

app.post('/', (req, res) => {
  res.redirect(url.format({
    pathname: '/search',
    query: req.body,
  }));
});

app.get('/admin', (req, res) => {
  if (req.session.userid !== process.env.ADMINU || req.session.password !== process.env.ADMINP) {
    res.redirect('/login');
  } else {
    let airportcodes;
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl,
    });
    client.connect();
    let query = 'SELECT iata FROM airport';
    client.query(query, (err, result) => {
      if (err) {
        console.log(err.stack); // eslint-disable-line no-console
      } else {
        airportcodes = result.rows;
      }
      query = 'SELECT code FROM airline';
      client.query(query, (err1, result1) => {
        if (err1) {
          console.log(err.stack); // eslint-disable-line no-console
        } else {
          res.render('admin', { airportcodes, airlinecodes: result1.rows });
        }
        client.end();
      });
    });
  }
});

app.post('/admin', (req, res) => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl,
  });
  client.connect();
  const data = req.body;
  if (data) {
    if (data.airport) {
      const airp = data.airport; // object destructuring not yet supported by node
      let st = null;
      if (airp.state) {
        st = airp.state;
      }
      const query = 'INSERT INTO airport VALUES ($1, $2, $3, $4, $5, $6, $7)';
      const values = [
        airp.iata,
        airp.country,
        airp.city,
        st,
        airp.name,
        airp.longitude,
        airp.latitude,
      ];
      client.query(query, values, (err) => {
        if (err) {
          req.flash('error', 'Error: Could not add to database.');
          res.redirect('/admin');
          console.log(err.stack); // eslint-disable-line no-console
        } else {
          req.flash('success', 'Successfully added to Database!');
          res.redirect('/admin');
        }
        client.end();
      });
    }

    if (data.airline) {
      const airl = data.airline; // object destructuring not yet supported by node
      const query = 'INSERT INTO airline VALUES ($1, $2, $3)';
      const values = [
        airl.code,
        airl['name-airline'],
        airl['country-origin'],
      ];
      client.query(query, values, (err) => {
        if (err) {
          req.flash('error', 'Error: Could not add to database.');
          res.redirect('/admin');
          console.log(err.stack); // eslint-disable-line no-console
        } else {
          req.flash('success', 'Successfully added to Database!');
          res.redirect('/admin');
        }
        client.end();
      });
    }
    if (data.flight) {
      const flightData = data.flight;
      const query = 'INSERT INTO flight VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)';
      const values = [
        flightData.code,
        flightData.number,
        flightData.date,
        flightData['departure-airport'],
        flightData['arrival-airport'],
        flightData['departure-time'],
        flightData['arrival-time'],
        flightData['econ-cap'],
        flightData['first-cap'],
        flightData.miles,
        flightData.firstclass,
        flightData.econclass,
      ];
      client.query(query, values, (err) => {
        if (err) {
          req.flash('error', 'Error could not add to Database!');
          res.redirect('/admin');
          console.log(err.stack); // eslint-disable-line no-console
        } else {
          req.flash('success', 'Succesfully added to Database!');
          res.redirect('/admin');
        }
        client.end();
      });
    }
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  req.session.userid = req.body.userid;
  req.session.password = req.body.password;
  res.redirect('/admin');
});

app.get('/search', (req, res) => {
  const userData = req.query;
  const searchResults = {};
  const depAirport = userData.departureairport;
  const arrAirport = userData.arrivalairport;
  const returnState = userData.return === 'on';
  const seats = parseInt(userData.seats, 10);
  if (Object.keys(userData).length === 0 && userData.constructor === Object) {
    res.render('search', { searchResults, returnState, seats });
    return;
  }
  userData.departureairport = depAirport.slice((depAirport.indexOf('(') + 1), depAirport.indexOf(')'));
  userData.arrivalairport = arrAirport.slice((arrAirport.indexOf('(') + 1), arrAirport.indexOf(')'));

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl,
  });
  client.connect();

  const query = {
    // give the query a unique name
    name: 'resursive-search',
    text: `WITH RECURSIVE connectflight(flightcode, flightnumber) AS(
    SELECT flightID, code, number, code || '-' || number as flightInfo, date, date || ',' as dateL ,depAirport, arrAirport, arrTime, depAirport, econSeats, firstSeats, flightID || ',' as serialID, (arrTime-depTime) as duration, ARRAY[depAirport,arrAirport]::text[] as route, 1 path_len, cast(depTime as varchar) || '~' || cast(arrTime as varchar) as timeSet, Array[econPrice] as econPrice, Array[firstPrice] as firstPrice, econSeats || '' as econLeft, firstSeats || '' as firstLeft
        FROM flight
    UNION
    SELECT f2.flightID, f2.code, f2.number,flightInfo || ',' || f2.code || '-' || f2.number as flightInfo, f2.date, dateL || f2.date as dateL, f2.depAirport, f2.arrAirport, f2.arrTime, f2.depAirport, f2.econSeats, f2.firstSeats, serialID|| f2.flightID as serialID, duration + (f2.arrTime - f2.depTime) as duration, route || Array[f2.arrAirport]::text[] as route, path_len +1 as path_len, timeSet|| ',' || (f2.depTime || '~' || f2.arrTime) as timeSet, Array[connectflight.econPrice] || Array[f2.econPrice] as econPrice,Array[connectflight.firstPrice] || Array[f2.firstPrice] as firstPrice, econLeft || ',' || f2.econSeats as econLeft, firstLeft || ',' || f2.firstSeats as firstLeft
        FROM  connectflight, flight f2
          WHERE connectflight.arrAirport = f2.depAirport
          AND ((connectflight.date < f2.date) OR (connectflight.arrTime<f2.depTime and connectflight.date = f2.date))
          AND f2.econSeats>0
          AND f2.firstSeats>0
          AND NOT (ARRAY[f2.arrAirport]::text[] <@ route)
    )
    SELECT distinct serialID, duration, array_to_string(route,',') as route, path_len, dateL, timeSet, array_to_string(econPrice, ',') as econPrice, array_to_string(firstPrice, ',') as firstPrice, (Select sum(s) from unnest(econPrice) as s) as econPriceSum, (Select sum(u) from unnest(firstPrice) as u) as firstPriceSum, econSeats, firstSeats
    FROM connectflight
    WHERE (array_to_string(route, ',') like $1 and array_to_string(route, ',') like $2)
       and (dateL like $3)
       and path_len > $4`,
    values: [
      `${userData.departureairport}%`,
      `%${userData.arrivalairport}`,
      `${userData.departuredate}%`,
      parseInt(userData.connections, 10),
    ],
  };

  client.query(query, (err, result) => {
    if (err) {
      console.log(err.stack); // eslint-disable-line no-console
    } else {
      searchResults.depart = parseData(result.rows);
    }
    if (returnState && !err) {
      query.values = [
        `${userData.arrivalairport}%`,
        `%${userData.departureairport}`,
        `${userData.returndate}%`,
        parseInt(userData.connections, 10),
      ];
      client.query(query, (err1, result1) => {
        if (err1) {
          console.log(err1.stack);
        } else {
          searchResults.return = parseData(result1.rows);
        }
        client.end();
        res.render('search', { searchResults, returnState, seats });
      });
    } else {
      client.end();
      res.render('search', { searchResults, returnState, seats });
    }
  });
});

// req.query will contain the flight data that the user has sent.
// Console.log it to see what it looks like
app.get('/book', (req, res) => {
  const flightData = JSON.parse(req.query.data);
  res.render('book', { flightData });
});

app.post('/book', (req, res) => {
  const flightData = JSON.parse(req.body.data);
  const passengerInfo = req.body.passenger1;
  const creditInfo = req.body.credit;
  const confirmationNumber = randomstring.generate(7);
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl,
  });

  client.connect();
  let text = `INSERT INTO payment
  VALUES ($1, $2, $3, $4, $5)`;
  let values = [
    passengerInfo.email,
    creditInfo.number,
    creditInfo.type,
    creditInfo.ccv,
    creditInfo.billingaddress,
  ];

  // callback
  client.query(text, values, (err) => {
    if (err) {
      req.flash('error', 'Invalid Payment Information');
      res.redirect('back');
      client.end();
    } else {
      text = `INSERT INTO customer
      VALUES ($1, $2, $3, 0, $4, $5, $6)`;

      values = [
        passengerInfo.email,
        passengerInfo.fn,
        passengerInfo.ln,
        passengerInfo.homeairport,
        passengerInfo.address1,
        passengerInfo.address2,
      ];

      client.query(text, values, (err2) => {
        if (err2) {
          console.log(err2.stack);
          req.flash('error', 'Database Error: Please review your information.');
          res.redirect('back');
          client.end();
        } else {
          client.query(buildStatement(passengerInfo, creditInfo, flightData, confirmationNumber, flightData.returnState), (error) => {
            if (error) {
              req.flash('error', 'Database Error: Booking Unsuccessful.');
              res.redirect('back');
            } else {
              confirmation(passengerInfo.email, confirmationNumber, (error1) => {
                if (error1) {
                  req.flash('error', 'Booking Confirmed but email not sent.');
                  res.redirect('/manage');
                } else {
                  req.flash('success', 'Booking Confirmed and Confirmation Email sent.');
                  res.redirect('/manage');
                }
              });
            }
          });
        }
      });
    }
  });
});

app.get('/manage', (req, res) => {
  res.render('manage');
});

app.get('/booking', (req, res) => {
  const booking = req.query.booking;

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl,
  });
  client.connect();

  let query = {
    text: 'SELECT * FROM customer WHERE email=$1',
    values: [booking.email],
  };

  client.query(query, (err, result) => {
    if (err || !result.rows[0]) {
      if (err) {
        console.log(err.stack);
      }
      client.end();
      req.flash('error', 'Email does not match any of our records.');
      res.redirect('/manage');
    } else {
      const customer = result.rows[0];
      // Getting customer payment information
      query = {
        text: `select *
               from customer, payment
               where $1 = payment.email`,
        values: [booking.email],
      };
      client.query(query, (error1, result1) => {
        if (error1) {
          console.log(error1.stack);
          client.end();
          req.flash('error', 'Error getting payment information for user');
          res.redirect('back');
        } else {
          const card = result1.rows;
          customer.blockaddress = checkBillingAddress(card);
          res.render('booking', { customer, card });
          client.end();
        }
      });
    }
  });
});

app.post('/edit', (req, res) => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl,
  });
  client.connect();

  if (req.body.passenger) {
    const customer = req.body.passenger;
    const query = {
      text: `update customer
             set first_name=$1, last_name=$2, home_airport=$3, address1=$4, address2=$5
             where email=$6`,
      values: [customer.fn, customer.ln, customer.homeairport, customer.address1, customer.address2, customer.email],
    };

    client.query(query, (error) => {
      if (error) {
        console.log(error.stack);
        req.flash('error', 'Error while editing data. Please try again.');
        res.redirect('back');
      } else {
        req.flash('success', 'Successfully edited data.');
        res.redirect('back');
      }
      client.end();
    });
  }

  if (req.body.credit) {
    const creditcard = req.body.credit;
    const query = {
      text: `update payment
             set card=$1, cardtype=$2, cvv=$3, billing_address=$4
             where email=$5 and card=$6`,
      values: [
        creditcard.number,
        creditcard.type,
        creditcard.ccv,
        creditcard.billingaddress,
        creditcard.email,
        creditcard.prevnumber,
      ],
    };

    client.query(query, (error) => {
      if (error) {
        console.log(error.stack);
        req.flash('error', 'Error while editing data. Please try again.');
        res.redirect('back');
      } else {
        req.flash('success', 'Successfully edited data.');
        res.redirect('back');
      }
      client.end();
    });
  }
});

app.post('/add', (req, res) => {
  const credit = req.body.credit;
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl,
  });
  client.connect();
  const query = {
    text: 'INSERT INTO payment VALUES ($1, $2, $3, $4, $5)',
    values: [credit.email, credit.number, credit.type, credit.ccv, credit.billingaddress],
  };

  client.query(query, (error) => {
    if (error) {
      console.log(error.stack);
      req.flash('error', 'Could not add card to database.');
      res.redirect('back');
    } else {
      req.flash('success', 'Successfully added credit card!');
      res.redirect('back');
    }
    client.end();
  });
});

app.listen(process.env.PORT, process.env.IP, () => {
  console.log('The FakeAir Server Has Started!'); // eslint-disable-line no-console
});
