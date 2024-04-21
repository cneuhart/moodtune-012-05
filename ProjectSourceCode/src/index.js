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


const proddbConfig = {
  host: process.env.host, // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};


// const db = pgp(dbConfig);
const db = pgp(proddbConfig);


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
  


//login test function (prevent routes from executing if not logged in, must have LoginTest func + res statement inside route)
async function LoginTest(req){

  try {
    const user = await db.oneOrNone(`SELECT * FROM users WHERE username = '${req.session.user}';`);

    // Check if a user with the provided username exists\
    if (user == null) {
      // if username not found in the database, return false
      return false;
    }

    // Compare the stored password with the password provided in the request
    const match = await bcrypt.compare(req.session.password, user.password);

    if (!match) {
      // Incorrect Login
      return false;
    } else {
      //Correct Login
      return true;
    }
  } catch (error) {
    //return incorrect login (false) in case of error
    return false;
  }

}

//sanitize user input strings that will be input into DB queries (separates into array with sanitized input)
function sanitize(inputString){

  let splitString = inputString.split(" ");

  const regexMap = {'"': '&quot;',"'": '&apst;','&': '&amp;','<': '&lt;','>': '&gt;','?': '&qm;','\\': '&bs;',"/": '&fs;',"%": '&pcnt;',";": '&sc;',"*": '&st;',}
  const regex = /[;&<>"'/\\?%*]/ig;

  for(let i = splitString.length; i >= 0; i--){
    if(splitString[i] != undefined){
      splitString[i] = splitString[i].replace(regex, (match)=>(regexMap[match]))
    }
  }

  
  //return inputString.replace(regex, (match)=>(regexMap[match]))
  return saniRemove(splitString)
}

//take sanitized input and remove special characters, split string into separate words
function saniRemove(inputString){

  let returnString = inputString;

  for(let i = returnString.length; i >= 0; i--){
    if(returnString[i] == undefined){
      continue;
    }
    returnString[i] = returnString[i].replace(/&quot;/g,"");
    returnString[i] = returnString[i].replace(/&apst;/g,"");
    returnString[i] = returnString[i].replace(/&amp;/g,"");
    returnString[i] = returnString[i].replace(/&lt;/g,"");
    returnString[i] = returnString[i].replace(/&gt;/g,"");
    returnString[i] = returnString[i].replace(/&lt;/g,"");
    returnString[i] = returnString[i].replace(/&qm;/g,"");
    returnString[i] = returnString[i].replace(/&bs;/g,"");
    returnString[i] = returnString[i].replace(/&fs;/g,"");
    returnString[i] = returnString[i].replace(/&pcnt;/g,"");
    returnString[i] = returnString[i].replace(/&sc;/g,"");
    returnString[i] = returnString[i].replace(/&st;/g,"");
  }

  return returnString;
}

//sanitize string input to store input string on DB
function singleSanitize(inputString){

  const regexMap = {'"': '&quot;',"'": '&apst;','&': '&amp;','<': '&lt;','>': '&gt;','?': '&qm;','\\': '&bs;',"/": '&fs;',"%": '&pcnt;',";": '&sc;',}
  const regex = /[;&<>"'/\\?%]/ig;
  inputString = inputString.replace(regex, (match)=>(regexMap[match]))

  inputString = inputString.replace(/&quot;/g,"");
  inputString = inputString.replace(/&apst;/g,"");
  inputString = inputString.replace(/&amp;/g,"");
  inputString = inputString.replace(/&lt;/g,"");
  inputString = inputString.replace(/&gt;/g,"");
  inputString = inputString.replace(/&lt;/g,"");
  inputString = inputString.replace(/&qm;/g,"");
  inputString = inputString.replace(/&bs;/g,"");
  inputString = inputString.replace(/&fs;/g,"");
  inputString = inputString.replace(/&pcnt;/g,"");
  inputString = inputString.replace(/&sc;/g,"");

  return inputString;
}

//api routes

app.get('/', async (req, res) => {

  //TEST IF USER IS LOGGED IN
    //!should probably send an error message to login page on redirect
  if(await LoginTest(req) == false){
    res.status(400).redirect('/login')
    return 0;
  }

  //loading page without user requesting recommendation with inputs
  if(req.query.inputs == undefined){
    res.render("pages/homepage")
    return 0;
  }

  const savedToken = req.session.access_token;
  
  const stringinputs = singleSanitize(req.query.inputs);

  const inputs = sanitize(req.query.inputs)


  //compare sanitized string array against database
  //genreString is the PSQL query portion that is generated based on how many words are in the input string.
  let genreString = "";
  for(let i = 0; i < inputs.length; i++){
    if(i == 0){
      genreString = genreString.concat(`moods.mood = '${inputs[i]}' `);
    }
    genreString = genreString.concat(`OR moods.mood = '${inputs[i]}' `);
  }
  //matchedInputs is an array of genres that is returned from DB after querying user input words
  const genreMatchQuery = `SELECT genres.genre FROM genres JOIN wgConnect ON genres.id = wgconnect.genre_id JOIN moods ON moods.id = wgconnect.mood_id WHERE ${genreString} LIMIT 5;`;
  const matchedInputsJSON = await db.any(genreMatchQuery)

  //if no genres are returned from inputs, redirect back to recommendations page with error
  if(matchedInputsJSON.length == 0){
    res.render("pages/homepage",{
      message:"No matching genres",
      error:true
    });
    return 0;
  }

  //convert array of JSON to array of strings
  let stringArrayMatchedInputs = [];
  for(let i = 0; i < matchedInputsJSON.length; i++){
    stringArrayMatchedInputs[i] = matchedInputsJSON[i].genre;
  }

  spotifyCall.getTrackRecommendation(savedToken, stringArrayMatchedInputs)
  .then(results => {
    //store recommendations in db
    //do not need to await, recommendations showing on page does not depend on DB entry
    storeRecommendations(req.session.user, results, stringArrayMatchedInputs);

    //render page with generated recommendations
    res.render('pages/homepage',{
      data: results,
      inputText: stringinputs
    })
  })
  .catch(error => {
    res.status(500).json({
      error: error
    })
  });

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

app.get('/homepage', async (req, res) => {
  if(await LoginTest(req) == false){
    res.status(400).redirect('/login')
    return 0;
  }

    res.render('pages/homepage');
  });

  app.get('/userprofile', async (req, res) => {
    if(await LoginTest(req) == false){
      res.status(400).redirect('/login')
      return 0;
    }
    res.render('pages/userprofile');
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
      res.status(200)
      res.render('pages/login')
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
      .render('pages/login', { message: 'Incorrect username or password.', error: true });
    }

    // Compare the stored password with the password provided in the request
    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) {
      // Incorrect password
      return res.status(400)
      .render('pages/login', { message: 'Incorrect username or password.', error: true  });
    } else {
      req.session.user = req.body.username;
      req.session.password = req.body.password;
      req.session.save();
      res.status(200)
      //redirect to spotifylogin route, not just homepage
        //res.redirect('/homepage');
      res.redirect('/spotifylogin')
    }
  } catch (error) {
    res.render('pages/login', { message: 'An error occured.', error: true  });
  }
});

app.get('/logout', async (req, res) => {
  if(await LoginTest(req) == false){
    res.status(400).redirect('/login')
    return 0;
  }
  req.session.destroy();
  res.render('pages/login', {message: 'Logged out Successfully'});
});

//spotify authentication routes
  //spotify login/auth
  app.get('/spotifylogin', async (req,res) => {

  //TEST IF USER IS LOGGED IN
    //!should probably send an error message to login page on redirect
    if(await LoginTest(req) == false){
      res.status(400).redirect('/login')
      return 0;
    }

    var state = 123456789123456; //!should be randomly generated number (16)
    //SCOPE: what the application is able to do/read with the user's account, if getting out of scope error make sure request is in bounds of what scope allows (or add new scope to increase what we can grab)
    var scope = 'user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private';
  
    var authJSON = {
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state,
      show_dialog: true
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
  
      //IF USER REFUSED SPOTIFY ACCESS:
      //redirect to login with error
      if (accessToken == undefined){
        res.render("pages/login",{
          message: "Refused Spotify Integration: Re-login and accept to use moodtune.",
          error: true
        });
        return 0;
      }
  
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

      if(await LoginTest(req) == false){
        res.status(400).redirect('/login')
        return 0;
      }
  
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

  async function storeRecommendations(recommended_for, results, genreArray){

    if(results.tracks == undefined){
      return 0;
    }

    //convert array of genre strings to one singular string to be stored
    let genreInput = genreArray.join(" ");

    let appendQuery = "";

    for(let track in results.tracks){

      let trackName = results.tracks[track].name
      let artist = results.tracks[track].artists[0].name
      let album_url = results.tracks[track].album.images[0].url
      let uri = results.tracks[track].uri
      let recommended_for_result = recommended_for;
      let genreInput_result = genreInput

      trackName = trackName.replace(/\'/g,'\'\'')
      artist = artist.replace(/\'/g,'\'\'')
      album_url = album_url.replace(/\'/g,'\'\'')
      uri = uri.replace(/\'/g,'\'\'')
      recommended_for_result = recommended_for_result.replace(/\'/g,'\'\'')
      genreInput_result = genreInput_result.replace(/\'/g,'\'\'')

      appendQuery = appendQuery.concat("(")
      appendQuery = appendQuery.concat(`'${trackName}'` + ",")
      appendQuery = appendQuery.concat(`'${artist}'` + ",")
      appendQuery = appendQuery.concat(`'${album_url}'` + ",")
      appendQuery = appendQuery.concat(`'${uri}'` + ",")
      appendQuery = appendQuery.concat(`'${recommended_for_result}'` + ",")
      appendQuery = appendQuery.concat(`'${genreInput_result}'`)
      appendQuery = appendQuery.concat("),")
    }

    
    let insertQuery = "INSERT INTO recommendations (track_name, artist_name, album_image_url, track_uri, recommended_for, genreInput) VALUES ";
    insertQuery = insertQuery.concat(appendQuery);
    insertQuery = insertQuery.slice(0,-1) + ';';

    db.any(insertQuery)

  }

  //recommendations POST route; create recommended playlist
  app.post('/recommendations', async (req,res) => {

    if(req.body.spotifyURIs == undefined){
      res.status(400).render('pages/homepage')
      return 0;
      //!should send an error message when rendering homepage (use handlebars)
    }

    const savedToken = req.session.access_token;

    const recommendedTracksDirty = req.body.spotifyURIs;
    let recommendedTracks = "";
    if(recommendedTracksDirty.slice(-1) == ','){ //if last character of recommendedTracks string is comma
      recommendedTracks = recommendedTracksDirty.slice(0, -1); //removes erroneous comma from form's post request
    }
    else{
      recommendedTracks = recommendedTracksDirty;
    }
  
    const genreInput = req.body.inputText;
    //const genreInput = req.query.genreInput;

    spotifyCall.createRecommendedPlaylist(savedToken, recommendedTracks, genreInput)
    .then(results => { //where to redirect? -> !should resolve with confirmation message that playlist was added.
      res.render('pages/homepage',{
        message: "Playlist successfully added to Spotify account.",
        snapshot: results
      })
    })
    .catch(error => {
      res.status(500).json({
        error: error
      })
    });
  
  });
  
  //Global Statistics 
  app.get('/globalstats', async (req, res) => {
    if (await LoginTest(req) == false) {
        res.status(400).redirect('/login');
        return;
    }

    var topTracksQuery = `
      SELECT track_name, COUNT(track_name) as frequency, artist_name, album_image_url, track_uri 
      FROM recommendations
      GROUP BY track_name, artist_name, album_image_url, track_uri
      ORDER BY frequency DESC
      LIMIT 20;
    `;
    
    db.any(topTracksQuery)
        .then(topTracks => {
            res.render('pages/globalstats', {
                trackdata: topTracks
            });
            // res.status(200).json(topTracks);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

  //handle all unmatched urls
  app.all('*', (req,res) => {
    res.redirect('/');
  })


// *****************************************************
// <!-- Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');
