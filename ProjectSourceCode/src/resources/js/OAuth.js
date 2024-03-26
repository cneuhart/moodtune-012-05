module.exports.getAccessToken = async function getAccessToken(client_id, code, redirect_uri, client_secret) {
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

    const { access_token } = await result.json();
    return access_token;
}
