const CLIENT_ID = '3bpzcko2hlfe4gub82cnl7rc7lmvax';
const CLIENT_SECRET = 'goy4tg4fc9zkoh9f2v6esmkldpcpb0';
let ACCESS_TOKEN = '';

async function getAccessToken() {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
    });
    const data = await response.json();
    ACCESS_TOKEN = data.access_token;
    console.log(ACCESS_TOKEN + " Access Token");
}

async function searchGame(gameName) {
    if (!ACCESS_TOKEN) {
        console.error("No access token found");
        return;
    }

    try {
        const response = await fetch(
            "https://api.igdb.com/v4/games",
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Client-ID': CLIENT_ID,
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                },
                body: "fields name, rating, first_release_date, genres, platforms[0].name, summary, cover.url; limit 2;",
            }
        );

        const games = await response.json();
        console.log(games); 
    } catch (err) {
        console.error("Error fetching games:", err);
    }
}

async function gameByPlatform() {//Tomar todos numeros de plataforma para poder poner una funcion que regrese cada una de ellas
    
    try {
        const response = await fetch(
            "https://api.igdb.com/v4/games",
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Client-ID': CLIENT_ID,
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                },
                body: "fields name; where platforms = 157; limit 2;"
            
            }
        );

        const games = await response.json();
        console.log(games); 
    } catch (err) {
        console.error("Error fetching games:", err);
    }
}


// Execute the functions in the correct order
async function runIgdb()  {
    await getAccessToken(); // Ensure the access token is retrieved first
    await searchGame("halo");        // Then fetch the games
};

runIgdb();

//PC -6
//ps5 - 157
//Series S/X - 169
//Switch 130

