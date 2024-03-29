module.exports.getTopArtists = async function getTopArtists(savedToken){
    const result = await fetch("https://api.spotify.com/v1/me/top/artists", {
        method: "GET",
        headers: { 
            'Authorization': 'Bearer ' + savedToken 
        }
    });

    return await result.json();
}

module.exports.getTopTracks = async function getTopTracks(savedToken, time_range){

    const submitRange = "?time_range=" + time_range;

    const result = await fetch(`https://api.spotify.com/v1/me/top/tracks${submitRange}`, {
        method: "GET",
        headers: { 
            'Authorization': 'Bearer ' + savedToken 
        }
    });

    return await result.json();
}