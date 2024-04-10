//onclick -> request info from spotify -> send as json -> handlebars accepts it

const spotifyCall = require("./spotifyCall");


async function getTracksStats(){
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

}

