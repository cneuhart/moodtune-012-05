# moodtune-012-05

*moodtune* is a music recommendation application that allows users to input their mood or general situation and get back a tailored music recommendation playlist that they can add to their spotify account.

## Contributors
* Conner Neuhart
* Prachi Soni
* Tahn Jandai
* Robby Toomey
* Margaret Munich

## Technology Stack
written in javascript, with handlebars for passing data into HTML and formatting and CSS for further formatting. Through use of the Spotify API we are abele access users spotify account statistics and modify the playlists we add to their accounts. We store each recommendation that is generated and display the most generated artists and songs in out global staticics data. We are using postgres to store our recommendations and user login information.

## Running the application
### Spotify API Instructions
* be logged in with spotify account
* go to https://developer.spotify.com/dashboard
* click "create app" button
* input custom app name and description
* set redirect URI to "http://localhost:3000/callback"
* check the "Web API" box under "which API/SDKs are you planning to use?"
* accept spotify api TOS
* navigate to app dashboard 
    * client_id and client_secret listed in app settings (settings button in top right of app dashboard)
### Local Instructions
* clone repo
* create .env file in /ProjectSourceCode/ folder
    * must input own session_secret, Spotify API client_id, and Spotify API client_secret if running locally
        * session secret can be any 16 char string, client_id and client_secret are gained from spotify API app dashboard
    * database credentials
        * POSTGRES_USER="postgres"
        * POSTGRES_PASSWORD="pwd"
        * POSTGRES_DB="users_db"

    * Node vars
        * SESSION_SECRET=""
        * client_id = ""
        * client_secret = ""
        * host="db"
* cd to the /ProjectSourceCode/ folder
* "npm init"
* "docker compose up"

## Running Tests
Inside the docker-compose.yaml file, changing the web command from "npm start" to "npm testandrun" runs the test suite.