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


    //now inputs are an ARRAY of STRINGS
    //pre-filtered

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

    const user = await getUserID(savedToken);

    const createdPlaylist = await createEmptyPlaylist(savedToken, user.id, genreInput);

    const populatedPlaylist = await populatePlaylist(savedToken, recommendedTracks, createdPlaylist.id);

    return populatedPlaylist;

}


async function getUserID(savedToken){

    //get current user's profile:
    let user = await fetch(`https://api.spotify.com/v1/me`, {
        method: "GET",
        headers: { 
            'Authorization': 'Bearer ' + savedToken 
        }
    })

    return user.json()
}

module.exports.getArtist = async function getArtist(savedToken, id){
    try {
        let response = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
            method: "GET",
            headers: { 
                'Authorization': 'Bearer ' + savedToken 
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch artist');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching artist:', error);
        throw error;
    }
}

async function createEmptyPlaylist(savedToken, userID, genreInput){

    let createdPlaylist = await fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
        method: "POST",
        headers: { 
            'Authorization': 'Bearer ' + savedToken,
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ name: `${genreInput}`, description: `${genreInput} playlist created by moodtune`})
    })

    return createdPlaylist.json()
}

async function populatePlaylist(savedToken, recommendedTracks, playlist_id){

    //replace colon characters wil %3A url code
    const trackURIs = recommendedTracks.replace(":","%3A")

    let populatedPlaylist = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks?uris=${trackURIs}`, {
        method: "POST",
        headers: { 
            'Authorization': 'Bearer ' + savedToken,
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ uris: "string", position: 0 })
    })

    //returns snapshot_id of playlist
    return populatedPlaylist.json()
}

