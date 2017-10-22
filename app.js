require('dotenv').load();
const { Client } = require('pg');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(`${__dirname}/public`));

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect();

client.end();

app.get('/', (req, res) => {
  res.render('landing');
});

app.listen(process.env.PORT, process.env.IP, () => {
  console.log('The FakeAir Server Has Started!'); // eslint-disable-line no-console
});
