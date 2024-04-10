// *****************************************************
// <!-- Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part C.
const { time } = require('console');

//lets us use relative pathing when using files (rather than only absolute)
app.use(express.static(__dirname + '/'));

const publicPath = path.resolve(__dirname, "public");
app.use(express.static(publicPath));


const hbs = handlebars.create({
    extname: 'hbs',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
  });

const dbConfig = {
  host: "db", // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then((obj) => {
    console.log("Database connection successful"); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch((error) => {
    console.log("ERROR:", error.message || error);
  });

// Register `hbs` as  view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    access_token: "empty_access_token",
    refresh_token: "empty_refresh_token"
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
  

//api routes

app.get('/', (req, res) => {
  res.render('pages/homepage');
});

app.get('/welcome', (req, res) => {
    res.json({status: 'success', message: 'Welcome!'});
  });

app.get('/register', (req, res) => { //register API(made in lab 11)
      res.render('pages/register');
  });

app.get('/login', (req, res) => {
    res.render('pages/login');
  });

app.get('/homepage', (req, res) => {
    res.render('pages/homepage');
  });

/*
app.post('/register', async (req, res) => {
    //hash the password using bcrypt library
    const hash = await bcrypt.hash(req.body.password, 10);
    const username = req.body.username;
    var query = 'INSERT INTO users(username, password) VALUES ($1, $2) RETURNING *;';
    // To-DO: Insert username and hashed password into the 'users' table
    // db comand -defining user in here
    db.one(query, [username, hash])
    .then(data => {
      data.username = username;
      data.password = hash;
      
      console.log("Hey there")// test: remove
      req.session.user = user;
      req.session.save();
      res.redirect(200,'/login');
    })
    .catch(error => {
      console.log('ERROR:', error.message || error);
      //TEST FOR TESTS
      res.redirect(400,'/register');
    });
});
*/


app.post('/register', async (req,res) => {
  const username = req.body.username;
  const hash = await bcrypt.hash(req.body.password,10);
  //insert username and hashed password into table
  //check if username already exists

  if(hash.err){
    console.log("BCRYPT ERROR")
  }
  else{
    var query = `INSERT INTO users (username, password) VALUES ('${username}','${hash}') returning *;`;
    db.one(query)
    .then(() => {
      res.redirect(200,'pages/login')
    })
    .catch(() => {
      res.status(400)
      .render('pages/register', {
        error: true,
        message: "Username already associated with an account."
      })
    })
  }
});

app.post('/login', async (req, res) => {
  try {
    const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1;', req.body.username);
    // Check if a user with the provided username exists
    if (user == null) {
      // Username not found in the database
      return res.status(400)
      .render('pages/login', { message: 'Incorrect username or password.' });
    }

    // Compare the stored password with the password provided in the request
    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) {
      // Incorrect password
      return res.status(400)
      .render('pages/login', { message: 'Incorrect username or password.' });
    } else {
      req.session.user = req.body.username;
      req.session.save();

      res.redirect(200, '/homepage');
    }
  } catch (error) {
    res.render('pages/login', { message: 'An error occured.' });
  }
});

// *****************************************************
// <!-- Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');
