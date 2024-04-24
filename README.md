# moodtune-012-05

*moodtune* is a music generation application that allows users to input their mood or general situation and get back a tailored music recommendation playlist that they can add to their spotify account.

## Contributors
* Conner Neuhart
* Prachi Soni
* Tahn Jandai
* Robby Toomey
* Margaret Munich

## Technology Stack
written in javascript, with handlebars for passing data into HTML and formatting and CSS for further formatting. Through use of the Spotify API we are abele access users spotify account statistics and modify the playlists we add to their accounts. We store each recommendation that is generated and display the most generated artists and songs in out global staticics data. We are using postgres to store our recommendations and user login information.

## Running the application
* clone repo
* "npm init"
* "docker compose up"

## Running Tests
Inside the docker-compose.yaml file, changing the web command from "npm start" to "npm testandrun" runs the test suite.