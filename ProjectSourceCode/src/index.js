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

//include local custom files/dependencies
const OAuth = require('./resources/js/OAuth.js')
const spotifyCall = require('./resources/js/spotifyCall.js');

//id/secret stored in .env to prevent leaking id/secret
const client_id = process.env.client_id;
const client_secret = process.env.client_secret;

//spotify application redirect_uri; set in spotify developer dashboard
const redirect_uri = "http://localhost:3000/callback";

//lets us use relative pathing when using files (rather than only absolute)
app.use(express.static(__dirname + '/'));

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

//session kinda sucks in comparison to cookies (deletes all information when node server restarts), don't know if allowed to use cookies
//cookies preserve spotify auth tokens, preventing constant renewal if restarting server often (may not be that big of a problem but still annoying)
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

//default route
app.get('/', (req, res) => {
  res.render('pages/homepage');
});

//testing route
app.get('/welcome', (req, res) => {
    res.json({status: 'success', message: 'Welcome!'});
  });

//registration routes
app.get('/register', (req, res) => { 
      res.render('pages/register');
  });

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

//spotify authentication routes
  //spotify login/auth
app.get('/spotifylogin', (req,res) => {
  var state = 123456789123456; //should be randomly generated number (16)
  //SCOPE: what the application is able to do/read with the user's account, if getting out of scope error make sure request is in bounds of what scope allows (or add new scope to increase what we can grab)
  var scope = 'user-read-private user-read-email user-top-read';

  var authJSON = {
    response_type: 'code',
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state
  };

  const authQuery = new URLSearchParams(authJSON).toString();

  res.redirect(`https://accounts.spotify.com/authorize?${authQuery}`);
});
  //callback route for spotify post-authentication
app.get('/callback', async function(req, res) {

  var code = req.query.code || null;
  var state = req.query.state || null;

  if (state === null) {
    res.redirect('/#' + new URLSearchParams({error: 'state_mismatch'}).toString());
  } 
  else {
    const tokens = await OAuth.getAccessToken(client_id, client_secret, code, redirect_uri);

    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;


    //save access_token in session
    //save refresh_token in session
    req.session.access_token = accessToken;
    req.session.refresh_token = refreshToken;

    //access token returned in URL
    res.redirect('/#' + new URLSearchParams({accessToken: accessToken}).toString());
  }

});
  //refresh spotify access token
app.get('/refreshToken', async (req,res) => {
  if (req.session.refresh_token === null) {
    res.redirect('/#' + new URLSearchParams({error: 'no_refresh_token'}).toString());
  } 
  else {

    const refresh_token = req.session.refresh_token;

    const newAccessToken = await OAuth.refreshAccessToken(client_id, client_secret, refresh_token);

    //save new_access_token in session (replace old token)
    req.session.access_token = newAccessToken;

    //new access token returned in URL
    res.redirect('/#' + new URLSearchParams({accessToken: newAccessToken}).toString());
  }
});

//spotify data api calls:
  //get user's top artists
app.get('/topArtist', async (req,res) => {

  const savedToken = req.session.access_token;

  spotifyCall.getTopArtists(savedToken)
  .then(results => {
    res.render('pages/statistics', {
      data: results
    });
  })
  .catch(error => {
    res.status('500').json({
      error: error
    })
  });
  
});

  //get user's top tracks (given time range)
app.get('/topTracks', async (req,res) => {

  const savedToken = req.session.access_token;

  const time_range = req.query.time_range;

  spotifyCall.getTopTracks(savedToken, time_range)
  .then(results => {
    res.render('pages/statistics', {
      data: results
    });
  })
  .catch(error => {
    res.status('500').json({
      error: error
    })
  });
  
});

//user statistics route
  app.get('/statistics', async (req,res) => {

    const savedToken = req.session.access_token;
  
    //lazy-loading: call API only when elements are clicked on stats page; update info into DB at same time
    
  });


//session testing route
app.get('/testSession', (req,res) => {
  console.log(req.session);
  res.redirect('/');
});

// *****************************************************
// <!-- Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');
