//module.exports.getTopArtists = async function getTopArtists(savedToken){
//    const result = await fetch("https://api.spotify.com/v1/me/top/artists", {
//        method: "GET",
//        headers: { 
//            'Authorization': 'Bearer ' + savedToken 
//        }
//    });
//
//    return await result.json();
//}

module.exports.getTopTracks = async function getTopTracks(savedToken, time_range){

    let submitRange = ""
    if(time_range != undefined){
        submitRange = "?time_range=" + time_range;
    }
    

    const result = await fetch(`https://api.spotify.com/v1/me/top/tracks${submitRange}`, {
        method: "GET",
        headers: { 
            'Authorization': 'Bearer ' + savedToken 
        }
    });

    return await result.json();
}

module.exports.getTopArtists = async function getTopArtists(savedToken, time_range){

    let submitRange = ""
    if(time_range != undefined){
        submitRange = "?time_range=" + time_range;
    }

    const result = await fetch(`https://api.spotify.com/v1/me/top/artists${submitRange}`, {
        method: "GET",
        headers: { 
            'Authorization': 'Bearer ' + savedToken 
        }
    });

    return await result.json();
}

module.exports.getTrackRecommendation = async function getTrackRecommendation(savedToken, inputs){


    //NEED BETTER STRING FILTERING FOR INPUTS; 

    let artists = "seed_artists="
    let tracks = "seed_tracks="
    let genres = "seed_genres="
    let seperator = "%2C"

    let finalQuery = genres

    for(let i = 0; i < inputs.length; i++){
        if(i == 0){
            finalQuery += inputs[i]
        }
        else{
            finalQuery += (seperator + inputs[i])
        }
    }

    const result = await fetch(`https://api.spotify.com/v1/recommendations?${finalQuery}`, {
        method: "GET",
        headers: { 
            'Authorization': 'Bearer ' + savedToken 
        }
    });

    return await result.json();
}


module.exports.createRecommendedPlaylist = async function createRecommendedPlaylist(savedToken, recommendedTracks, genreInput){

    const userID = await getUserID(savedToken);

    console.log(userID)

    const playlist_id = await createEmptyPlaylist(savedToken, userID, genreInput);

    console.log(playlist_id)

    const populatedPlaylist = await populatePlaylist(savedToken, recommendedTracks, playlist_id);

    console.log(populatedPlaylist)

    return await populatedPlaylist;

}


async function getUserID(savedToken){

    //get current user's profile:
    let user = await fetch(`https://api.spotify.com/v1/me`, {
        method: "GET",
        headers: { 
            'Authorization': 'Bearer ' + savedToken 
        }
    })

    return await user.json().id
}

async function createEmptyPlaylist(savedToken, userID, genreInput){

    let createdPlaylist = await fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
        method: "POST",
        headers: { 
            'Authorization': 'Bearer ' + savedToken,
            'Content-Type': 'application/json' 
        },
        data: {
            "name":`${genreInput} Playlist`,
            "description":`${genreInput} playlist generated by moodtune.`,
            "public":false
        }
        })

    return await createdPlaylist.json().id
}

async function populatePlaylist(savedToken, recommendedTracks, playlist_id){

    let poopulatedPlaylist = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
        method: "POST",
        headers: { 
            'Authorization': 'Bearer ' + savedToken 
        },
        data: {
            "uris": [recommendedTracks]
        }
    })

    return await populatedPlaylist.json()
}

