module.exports.getAccessToken = async function getAccessToken(client_id, client_secret, code, redirect_uri) {
    const params = new URLSearchParams();
    params.append("code", code);
    params.append("redirect_uri", redirect_uri);
    params.append("grant_type", "authorization_code");
    params.append("client_id", client_id);
    //params.append("code_verifier", verifier);


    //use .then/.catch ??
    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { 
            "Content-Type": "application/x-www-form-urlencoded",
            'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) 
        },
        body: params
    });


    var responseJSON = await result.json();

    var refresh_token = responseJSON.refresh_token;
    var access_token  = responseJSON.access_token;
    return {access_token, refresh_token};
}



//refresh access_token
//should detect if access token is expired, then call this function
//refresh token is given during authorization token request
//returns new access token (clear cookie then set cookie to new access token in route)
module.exports.refreshAccessToken = async function refreshAccessToken(client_id, client_secret, refresh_token){
    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refresh_token);
    params.append("client_id", client_id);
    //params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { 
            "Content-Type": "application/x-www-form-urlencoded",
            'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) 
        },
        body: params
    });

    var responseJSON = await result.json();
    var new_access_token  = responseJSON.access_token;

    return new_access_token;

}