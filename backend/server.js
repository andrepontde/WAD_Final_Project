const express = require("express");
const path = require("path");
const fs = require("fs");
const igdbapi = require("./igdbapi");

const app = express();

app.get('/gamesByPlatform', async (req, res) => {
    try {
        const platformID = req.query.search; //Get the platform ID from the query
        const gamesByPlatform = await igdbapi.gameByPlatform(platformID);
        res.json(gamesByPlatform); //Return the filtered games
    } catch (error) {
        console.log("Error fetching GAMES BY PLATFORM" + error);
        return res.send({status: "Unable to fetch games by platform"});    
    }
});

app.get('/searchGame', async (req, res) => {
    try {
        const gameName = req.query.search; //Get the search term from the query parameter
        const searchedGame = await igdbapi.searchGame(gameName); 
        res.json(searchedGame); //Return the searched game
    } catch (error) {
        console.error('Error searching for game:', error);
        res.status(500).json({ error: 'Failed to search for game' });
    }
});

app.use(express.json());

//Class code - Push an item to a JSON file
app.post('/wishlist', (req, res) => {
    const newGame = req.body; //The game data received from the frontend
    const wishlistPath = path.join(__dirname, 'wishlist.json');

    fs.readFile(wishlistPath, 'utf-8', (error, data) => {
        if (error) {
            console.log('Error reading wishlist:' + error);
            return res.send({status: "Failed to read wishlist"}); 
        }
        let wishlist = [];
        //If data exists, parse it into an array
        if (data) {
            wishlist = JSON.parse(data);
        }

        const maxRank = wishlist.length + 1;
        newGame.rank = maxRank;

        //Add the new game to the wishlist array
        wishlist.push(newGame);
        //Write the updated wishlist back to the file
        fs.writeFile(wishlistPath, JSON.stringify(wishlist, null, 2), (err) => {
            if (error) {
                console.log('Error saving wishlist:' + error);
                return res.send({status: "Game was not added!"});
            }
            res.status(201).json({ message: 'Game added to wishlist' });
        });
    });
});

//Class code - Read the JSON file data
app.get('/wishlist', (req, res) => {
    const wishlistPath = path.join(__dirname, 'wishlist.json');
    //Read the wishlist JSON file
    fs.readFile(wishlistPath, 'utf-8', (error, data) => {
        if (error) {
            console.log('Error reading wishlist:', + error);
            return res.send({status: "wishlist Error"}); 
        }
        //Send the wishlist data as JSON
        res.json(JSON.parse(data));
    });
});

//Class code inspiration - Delete game from file.
app.delete('/wishlist/:id', (req, res) => {
    const gameId = parseInt(req.params.id, 10); //Convert the ID to a number
    const wishlistPath = path.join(__dirname, 'wishlist.json');
    fs.readFile(wishlistPath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading wishlist:', err);
            return res.status(500).json({ error: 'Failed to read wishlist' });
        }
        let wishlist = JSON.parse(data);
        
        //Filter out the game with the specified ID
        const updatedWishlist = wishlist.filter((game) => game.id !== gameId);

        fs.writeFile(wishlistPath, JSON.stringify(updatedWishlist, null, 2), (err) => {
            if (err) {
                console.error('Error saving updated wishlist:', err);
                return res.status(500).json({ error: 'Failed to save updated wishlist' });
            }
            res.status(200).json({ message: 'Game removed from wishlist' });
        });
    });
});

//Class code - Update an Item
app.put('/wishlist/:id', (req, res) => {
    const gameId = parseInt(req.params.id, 10);
    const updatedGame = req.body;
    const wishlistPath = path.join(__dirname, 'wishlist.json');
  
    fs.readFile(wishlistPath, 'utf-8', (err, data) => {
      if (err) {
        console.error('Error reading wishlist:', err);
        return res.status(500).json({ error: 'Failed to read wishlist' });
      }
  
      let wishlist = JSON.parse(data);
  
      //Find the original game in the wishlist
      const originalGameIndex = wishlist.findIndex(game => game.id === gameId);
      const originalRank = wishlist[originalGameIndex].rank;
  
      //Update the game
      wishlist[originalGameIndex] = updatedGame;
  
      //Handle rank shifting
      if (originalRank !== updatedGame.rank) {
        wishlist = wishlist.map(game => {
          if (game.id !== updatedGame.id) {
            //Shift ranks accordingly
            if (game.rank >= updatedGame.rank && game.rank < originalRank) {
              game.rank += 1; //Push down if within new rank range
            } else if (game.rank <= updatedGame.rank && game.rank > originalRank) {
              game.rank -= 1; //Pull up if in previous rank range
            }
          }
          return game;
        });
      }
  
      //Sort by rank before saving - code understood from https://www.geeksforgeeks.org/how-to-sort-json-array-in-javascript-by-value/
      wishlist.sort((a, b) => a.rank - b.rank);
  
      fs.writeFile(wishlistPath, JSON.stringify(wishlist, null, 2), err => {
        if (err) {
          console.error('Error saving updated wishlist:', err);
          return res.status(500).json({ error: 'Failed to save updated wishlist' });
        }
        res.status(200).json({ message: 'Game updated and ranks adjusted' });
      });
    });
});
  
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

//Start the server and fetch IGDB data
const port = 3000;
app.listen(port, async () => {
    console.log(`http://localhost:${port}/`);
    await igdbapi.getAccessToken();
});
