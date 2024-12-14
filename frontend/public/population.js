//This is the main function to write all of the info on the page, it takes a div and games and populates each part
async function populateDiv(receivedGames, divToPopulate) {
    let isPopUp = false;
    let isWishList = false;
    //If a game is clicked, the PopUpGamesDiv will always be the Div
    if (divToPopulate === "PopUpGamesDiv") {
        isPopUp = true;
    }else if(divToPopulate === "WishlistGames"){
        isWishList = true;
    }

    const gameContainer = document.getElementById(divToPopulate);

    gameContainer.innerHTML = ''; // Clear existing content

    for (let i = 0; i < receivedGames.length; i++) {
        const game = receivedGames[i];

        const gameCard = document.createElement('div');

        const gameJson = document.createElement('p');
        gameJson.textContent = JSON.stringify(game);

        //Add the entire game data to the DIV itself so it can be called later and added to the wishlist JSON file. 

        //--------- Game card population area -------- 
        
        //Cover image -- display info if there is no cover available
        const gameImage = document.createElement('img');
        if (game.cover && game.cover.url){
            gameImage.src = `https:${game.cover.url}`;
        }else{
            gameImage.src = "";
        }
        
        gameImage.alt = game.name + " Cover not available";

        //Game title
        const gameTitle = document.createElement('h3');
        gameTitle.textContent = game.name;

        //The game has to be converted to regular date format since it is in Unix Time Stamp format.
        //Game release date - code learnt from https://www.geeksforgeeks.org/how-to-convert-unix-timestamp-to-time-in-javascript/
        const releaseDateElement = document.createElement('p');
        if (game.first_release_date) {
            const releaseDate = new Date(game.first_release_date * 1000).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            releaseDateElement.textContent = `Release Date: ${releaseDate}`;
        } else {
            releaseDateElement.textContent = "Release Date: Unknown";
        }

        //Game rating
        const ratingElement = document.createElement('p');
        if (game.rating) {
            ratingElement.textContent = `Rating: ${game.rating.toFixed(1)}`; //Show one decimal
        } else {
            ratingElement.textContent = "Rating: Not Available";
        }

        //Game genres
        const genresElement = document.createElement('p');
        if (game.genres && game.genres.length > 0) {
            let rightGenres = '';
            if(game.genres.length >= 2){
                for (let i = 0; i < game.genres.length; i++) {
                    if (i == game.genres.length-1) {
                        rightGenres += game.genres[i].name;  
                    }else{
                        rightGenres += game.genres[i].name + ", ";
                    }
                }
            }else{
                rightGenres = game.genres[0].name;
            }
            genresElement.textContent = rightGenres;
            //Genres have to be extracted from the json since the database gives us an ID for each genre as well, I really don't know why we need ID for this...
        } else {
            genresElement.textContent = "Genres: Not Available";
        }
     
        //Common gameCard elements 
        gameCard.appendChild(gameImage);
        gameCard.appendChild(gameTitle);
        gameCard.appendChild(releaseDateElement);
        gameCard.appendChild(ratingElement);
        gameCard.appendChild(genresElement);

        if (isPopUp) {

            if (document.getElementById("WishlistGames")) {
                isWishList = true;
        }

            //If it is a PopUp (When a game is clicked to te able to see the full game details)
            gameCard.classList.add("miniPopUpGame");
            //Add a different class so it doesnt collide with the miniGame class

            
            //used to have a limited amount of words on the summary section in case it was too big, since some summaries where unexplicably in german.
            const gameSummary = document.createElement('p');

            //Little code to concatenate each word up to 60
            let mySummary = "";
            let wordCount = 0;
            for (let i = 0; i < game.summary.length; i++) {
                if(game.summary[i] == " "){
                    wordCount++;
                    mySummary += " ";
                }else if (wordCount == 60){
                    mySummary += "..."
                    break;
                }else{
                    mySummary += game.summary[i];
                }
                
            }

            gameSummary.textContent = mySummary;


            gameCard.appendChild(gameSummary);

            //This overrides the "display: none;" part in the css so that the pop up is correctly shown.
            gameContainer.style.display = 'block';

            if (isWishList){
                const rankLabel = document.createElement('label');
                rankLabel.textContent = ' Rank: ';
                const rankSelect = document.createElement('select');
                rankSelect.classList.add('rankSelector');
                
                //Dynamically create rank options based on the number of games
                const wishlist = await fetchWishlist(); // Get the current wishlist
                const maxRank = wishlist.length;
                for (let j = 1; j <= maxRank; j++) {
                    const option = document.createElement('option');
                    option.value = j;
                    option.textContent = `Rank ${j}`;
                    if (game.rank === j) option.selected = true; //Selects the current rank of the game according to its JSON value.
                    rankSelect.appendChild(option);
                }
                
                rankLabel.appendChild(rankSelect);
                gameCard.appendChild(rankLabel);

                //Add a check box to know if the game has been played
                const playedLabel = document.createElement('label');
                playedLabel.textContent = ' Played: ';
                const playedCheckbox = document.createElement('input');
                playedCheckbox.type = 'checkbox'; //Make a checkbox type to mark if the game has been played or not
                playedCheckbox.checked = game.playState === "Played";
                playedLabel.appendChild(playedCheckbox);
                gameCard.appendChild(playedLabel);

                //For the wishlist, the close button has a few extra functionalities,
                //like updating the game info in the JSON file, refresh the wishlist page content and also close the pop up of course.
                const closeButton = document.createElement("button");
                closeButton.textContent = 'Close';
                closeButton.classList.add('popButton');
                closeButton.onclick = async () => {
                    if(playedCheckbox.checked){
                        newPlayState = "Played"
                    }else{
                        newPlayState = "Not Played"
                    }

                    const newRank = parseInt(rankSelect.value, 10);

                    //Update the new info if the game was edited upon closing the pop up
                    const gameWithExtras = {
                        id: game.id,
                        cover: game.cover,
                        first_release_date: game.first_release_date,
                        genres: game.genres,
                        name: game.name,
                        rating: game.rating,
                        summary: game.summary,
                        rank: newRank,
                        playState: newPlayState,
                    };
            
                    await updateWishlist(gameWithExtras); //Ensure update is completed
                    await wishListPopulation(); //Re-populate the wishlist
            
                    gameContainer.style.display = 'none'; //Hide the pop-up
                    gameContainer.innerHTML = ''; //Clear the content
                };
            
                gameCard.appendChild(closeButton);
                
            }else{

                const closeButton = document.createElement("button");
                closeButton.textContent = 'Close';
                closeButton.classList.add('popButton');
                closeButton.onclick = () => {
                    gameContainer.style.display = 'none'; //Hide the pop-up
                    gameContainer.innerHTML = ''; //Clear the content
                };
    
                gameCard.appendChild(closeButton);

                const wishlistButton = document.createElement("button");
                wishlistButton.textContent = "Add to wish list";
                wishlistButton.classList.add('popButton');
                wishlistButton.onclick = () => {
                    addToWishlist(game);
                };    
                gameCard.appendChild(wishlistButton);
                
            }

        } else if (isWishList){
            
            //CHANGE CLASS TO BE OWN WISHLIST GAME TO BE ABLE TO RANK THEM PROPERLY!!!!
            gameCard.classList.add('wishGame');
            
            //Add the popUp Function and add miniGame class if not a popUp item

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Remove from wishlist";
            deleteButton.onclick = () => {
                removeFromWishlist(game);
            };

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.onclick = () => {
                popUpGame(gameJson.textContent);
            };
            
            //<input type="number" id="value" name="value" required="">
            gameCard.appendChild(deleteButton);
            gameCard.appendChild(editButton);

        } else {
            gameCard.classList.add('miniGame');
            //Add the popUp Function and add miniGame class if not a popUp item
            gameCard.onclick = () => {
                popUpGame(gameJson.textContent);
            };
        }

        gameContainer.appendChild(gameCard);
    }
}