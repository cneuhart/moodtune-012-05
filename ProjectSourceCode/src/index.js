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
//const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part C.

app.use(express.static(__dirname + '/'));


const hbs = handlebars.create({
    extname: 'hbs',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
  });


// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.


app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
  

//api routes


//default route
app.get('/', (req,res) => {
    //res.render('pages/test');
    res.sendFile(__dirname + "/views/pages/test.html");
});


//spotify login

//stored in keys.js to prevent leaking id/secret
const {client_id, client_secret} = require('./resources/js/keys.js')

const redirect_uri = "http://localhost:3000/callback";


app.get('/spotifylogin', (req,res) => {
  var state = 123456789123456; //should be randomly generated number (16)
  var scope = 'user-read-private user-read-email';

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

const OAuth = require('./resources/js/OAuth.js')

app.get('/callback', async function(req, res) {

  var code = req.query.code || null;
  var state = req.query.state || null;

  if (state === null) {
    res.redirect('/#' + new URLSearchParams({error: 'state_mismatch'}).toString());
  } 
  else {
    const accessToken = await OAuth.getAccessToken(client_id, code, redirect_uri, client_secret);
    
    //access token returned in URL
    res.redirect('/#' + new URLSearchParams({accessToken: accessToken}).toString());
  }

});



// *****************************************************
// <!-- Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
app.listen(3000);
console.log('Server is listening on port 3000');