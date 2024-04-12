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
    refresh_token: "empty_refresh_token",
    user: "empty_user"
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
      res.redirect(200,'/login')
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
      res.status(200)
      res.redirect('/homepage');
    }
  } catch (error) {
    res.render('pages/login', { message: 'An error occured.' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.render('pages/logout', {message: 'Logged out Successfully'});
});

//spotify authentication routes
  //spotify login/auth
  app.get('/spotifylogin', (req,res) => {
    var state = 123456789123456; //should be randomly generated number (16)
    //SCOPE: what the application is able to do/read with the user's account, if getting out of scope error make sure request is in bounds of what scope allows (or add new scope to increase what we can grab)
    var scope = 'user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private playlist-modify-public playlist-modify-private';
  
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
        artistdata: results
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
        trackdata: results
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
  
      const time_range = req.query.time_range;
    
        spotifyCall.getTopTracks(savedToken, time_range)
      .then(trackResult => {
        spotifyCall.getTopArtists(savedToken, time_range)
        .then(artistResult => {
          res.render('pages/statistics', {
            trackdata: trackResult,
            artistdata: artistResult
          });
        })
        .catch(error => {
          res.status('500').json({
            error: error
          })
        });
      })
      .catch(error => {
        res.status('500').json({
          error: error
        })
      });
      
    });
  
  //recommendations route
  app.get('/recommendations', async (req,res) => {
   
    const savedToken = req.session.access_token;
  
    const stringinputs = req.query.inputs;
  
    const inputs = stringinputs.split(" ")
  
    spotifyCall.getTrackRecommendation(savedToken, inputs)
    .then(results => {
      res.render('pages/recommendations',{
        data: results
      })
    })
    .catch(error => {
      res.status(500).json({
        error: error
      })
    });
  
  });

  //recommendations POST route; create recommended playlist
  app.get('/recommendations', async (req,res) => {

    const savedToken = req.session.access_token;
  
    const recommendedTracksDirty = req.query.spotifyURIs;
    let recommendedTracks = "";
    if(recommendedTracksDirty.slice(-1) == ','){ //if last character of recommendedTracks string is comma
      recommendedTracks = recommendedTracksDirty.slice(0, -1); //removes erroneous comma from form's post request
    }
    else{
      recommendedTracks = recommendedTracksDirty;
    }
  
    const genreInput = req.query.genreInput;

    spotifyCall.createRecommendedPlaylist(savedToken, recommendedTracks, genreInput)
    .then(results => { //where to redirect????????????
      res.render('pages/recommendations',{
        data: results
      })
    })
    .catch(error => {
      res.status(500).json({
        error: error
      })
    });
  
  });
  
  


// *****************************************************
// <!-- Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');
