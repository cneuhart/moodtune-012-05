module.exports.getTopCall = async function getTopCall(savedToken){
    const result = await fetch("https://api.spotify.com/v1/me/top/artists", {
        method: "GET",
        headers: { 
            'Authorization': 'Bearer ' + savedToken 
        }
    });

    return await result.json();
}