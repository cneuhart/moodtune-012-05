//onclick -> request info from spotify -> send as json -> handlebars accepts it

const spotifyCall = require("./spotifyCall");

/*
async function getArtistStats(){
    spotifyCall.getTopArtists(savedToken, time_range)
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

}
*/