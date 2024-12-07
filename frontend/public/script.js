async function fetchPlatform(platformID) {
  try {
      const response = await fetch(`http://localhost:3000/gamesByPlatform?search=${platformID}`);
      const gamesByPlatform = await response.json(); // Parse the response as JSON
      if (gamesByPlatform.length === 0) {
        console.log('No games found or data is not an array.');
        return; 
    }
      //console.log(gamesByPlatform[0].name); 
      return gamesByPlatform;
  } catch (error) {
      console.error('Error fetching games:', error);
  }
}

async function searchGame(gameName) {
  try {
      const response = await fetch(`http://localhost:3000/searchGame?search=${gameName}`);
      const searchedGames = await response.json(); // Parse the response as JSON
      if (searchedGames.length === 0) {
        console.log('No games found or data is not an array.');
        return; 
    } 
    // console.log(searchedGames[0].name); 
      return searchedGames;
  } catch (error) {
      console.error('Error fetching games:', error);
  }
}

async function searchBar() {
  var theGame = document.getElementById("findText").value;
  searchedGame =  await searchGame(theGame);
  populateDiv(searchedGame, "searchedGames");
}

async function indexPopulation(){
  const pcGames = await fetchPlatform(6);
  populateDiv(pcGames, "PCGamesDiv")

  const ps5Games = await fetchPlatform(167);
  populateDiv(ps5Games, "PS5GamesDiv")
}
async function servicePopulation(){
  const pcGames = await fetchPlatform(6);
  populateDiv(pcGames, "PCGamesDiv")

  const ps5Games = await fetchPlatform(167);
  populateDiv(ps5Games, "PS5GamesDiv")

  const xboxGames = await fetchPlatform(49);
  populateDiv(xboxGames, "xboxGamesDiv")

  const SwitchGames = await fetchPlatform(130);
  populateDiv(SwitchGames, "SwitchGamesDiv")
}

async function wishListPopulation() {
  const wishedGames = await fetchWishlist();
  populateDiv(wishedGames,"WishlistGames")
  renderWishlistChart();
  renderRatingDistributionChart();
}

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
    
    //Cover image
    const gameImage = document.createElement('img');
    gameImage.src = `https:${game.cover.url}`; // Ensure URL format
    gameImage.alt = game.name;

    //Game title
    const gameTitle = document.createElement('h3');
    gameTitle.textContent = game.name;

    //Game release date
    const releaseDateElement = document.createElement('p');
    if (game.first_release_date) {
      const releaseDate = new Date(game.first_release_date * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',//The game has to be converted to regular date format since it is in Unix Time Stamp format.
        day: 'numeric',
      });
      releaseDateElement.textContent = `Release Date: ${releaseDate}`;
    } else {
      releaseDateElement.textContent = 'Release Date: Unknown';
    }

    //Game rating
    const ratingElement = document.createElement('p');
    if (game.rating) {
      ratingElement.textContent = `Rating: ${game.rating.toFixed(1)}`; // Show one decimal
    } else {
      ratingElement.textContent = 'Rating: Not Available';
    }

    //Game genres
    const genresElement = document.createElement('p');
    if (game.genres && game.genres.length > 0) {
      genresElement.textContent = `Genres: ${game.genres.map(genre => genre.name).join(', ')}`;
      //Genres have to be extracted from the json since the database gives us an ID for each genre as well, I really don't know why we need ID for this...
    } else {
      genresElement.textContent = 'Genres: Not Available';
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
      gameCard.classList.add('miniPopUpGame');
      //Add a different class so it doesnt collide with the miniGame class
      const gameSummary = document.createElement('p');


      //CHECK THIS CODE BETTER IT LOOKS PRETTY DAMN UGLY!!!!!!!!!!!!!!!!!!!!!!!!!
      let truncatedSummary = game.summary.split(' ').slice(0, 60).join(' ');

      if (game.summary){
        if (game.summary.split(' ').length > 60) {
          truncatedSummary += '...';
        }
        gameSummary.textContent = truncatedSummary;
      }else{
        gameSummary.textContent = "No summary available.";
      }
      gameCard.appendChild(gameSummary);
      
      //Button to close the div when clicked

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
          if (game.rank === j) option.selected = true; // Select current rank
          rankSelect.appendChild(option);
        }
        
        rankLabel.appendChild(rankSelect);
        gameCard.appendChild(rankLabel);

        const playedLabel = document.createElement('label');
        playedLabel.textContent = ' Played: ';
        const playedCheckbox = document.createElement('input');
        playedCheckbox.type = 'checkbox';
        playedCheckbox.checked = game.playState === "Played"; 
        playedLabel.appendChild(playedCheckbox);
        gameCard.appendChild(playedLabel);

        const closeButton = document.createElement("button");
        closeButton.textContent = 'Close';
        closeButton.classList.add('closeButton');
        closeButton.onclick = async () => {
        
          if(playedCheckbox.checked){
            newPlayState = "Played"
          }else{
            newPlayState = "Not Played"
          }

          const newRank = parseInt(rankSelect.value, 10);

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
      
          await updateWishlist(gameWithExtras); // Ensure update is completed
          await wishListPopulation(); // Re-populate the wishlist
      
          gameContainer.style.display = 'none'; // Hide the pop-up
          gameContainer.innerHTML = ''; // Clear the content
        };
      
        gameCard.appendChild(closeButton);
        
      }else{

        const closeButton = document.createElement("button");
        closeButton.textContent = 'Close';
        closeButton.classList.add('closeButton');
        closeButton.onclick = () => {
          gameContainer.style.display = 'none'; // Hide the pop-up
          gameContainer.innerHTML = ''; // Clear the content
        };
  
        gameCard.appendChild(closeButton);

        const wishlistButton = document.createElement("button");
        wishlistButton.textContent = "Add to wish list";
        wishlistButton.classList.add('closeButton');
        //FIX WISHLIST BUTTON
        wishlistButton.addEventListener('click', () => {
          addToWishlist(game);
        });      
        gameCard.appendChild(wishlistButton);
        
      }

    } else if (isWishList){
      
      //CHANGE CLASS TO BE OWN WISHLIST GAME TO BE ABLE TO RANK THEM PROPERLY!!!!
      gameCard.classList.add('wishGame');
      
      //Add the popUp Function and add miniGame class if not a popUp item

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Remove from wishlist";
      //ADD own class here
      //deleteButton.classList.add('closeButton');
      //FIX WISHLIST BUTTON
      deleteButton.addEventListener('click', () => {
        removeFromWishlist(game);
      });

      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      //Add own class here !!!
      //editButton.classList.add('');
      //FIX WISHLIST BUTTON
      editButton.addEventListener('click', () => {
        popUpGame(gameJson.textContent);
      });
      //<input type="number" id="value" name="value" required="">
      gameCard.appendChild(deleteButton);
      gameCard.appendChild(editButton);

    } else {
      gameCard.classList.add('miniGame');
      //Add the popUp Function and add miniGame class if not a popUp item
      gameCard.addEventListener('click', () => popUpGame(gameJson.textContent));
    }

    gameContainer.appendChild(gameCard);
  }
}

function popUpGame(gameString) {
  
  const game = JSON.parse(gameString)

  populateDiv([game], "PopUpGamesDiv"); 
}

async function addToWishlist(game) {

  const currentGames = await fetchWishlist();
  const gameID = game.id;

  //Checking if a game is already on the wishlist.
  for (let i = 0; i < currentGames.length; i++){
    currentGame = currentGames[i];
    if (currentGame.id == gameID){
      alert(`${game.name} is already on your wishlist!`)
      return;
    }
  }

  const gameWithExtras = {
    
      id: game.id,
      cover: game.cover,
      first_release_date: game.first_release_date,
      genres: game.genres,
      name: game.name,
      rating: game.rating,
      summary: game.summary,
      playState: "Not Played"
  };


  try {
    const response = await fetch(
        "http://localhost:3000/wishlist",
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(gameWithExtras)
        }
    );
    const data = await response.json();
    console.log('Game added to wishlist:', data);
    alert(`${game.name} has been added to your wishlist!`);
  } catch (err) {
      console.error("Error fetching games:", err);
  }
}

async function updateWishlist(updatedGame) {
  try {
      const response = await fetch(`http://localhost:3000/wishlist/${updatedGame.id}`, {
          method: 'PUT', 
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedGame)
      });

      const data = await response.json();
      //alert('Game updated successfully!');
      console.log('Updated game:', data);
      
  } catch (error) {
      console.error('Error updating game:', error);
  }
}

async function removeFromWishlist(game) {
  const gameId = game.id;
  try {
    
    const response = await fetch(
        `http://localhost:3000/wishlist/${gameId}`,
        {
            method: 'DELETE',
        }
    );
    console.log('Game deleted from wishlist:', game.name);
    alert(`${game.name} has been deleted from your wishlist!`);
    
    wishListPopulation();
  } catch (err) {
      console.error("Error fetching games:", err);
  }
}

async function fetchWishlist() {
  try {
      const response = await fetch('http://localhost:3000/wishlist'); // Make GET request
      const wishlist = await response.json(); // Parse the response as JSON
      return wishlist; 
  } catch (error) {
      console.error('Error fetching wishlist:', error);
  }
}

//FIX RENDER FUNC
async function renderWishlistChart() {
  // Fetch the current wishlist
  const wishlist = await fetchWishlist();

  // Count played and not played games
  const playedCount = wishlist.filter(game => game.playState === "Played").length;
  const notPlayedCount = wishlist.length - playedCount;

  // Data for the chart
  const chartData = {
    labels: ["Played", "Not Played"],
    datasets: [{
      label: "Games Played Status",
      data: [playedCount, notPlayedCount], // Values for played and not played
      backgroundColor: ["#4caf50", "#f44336"], // Green for played, red for not played
      borderColor: ["#388e3c", "#d32f2f"],
      borderWidth: 1
    }]
  };

  // Options for the chart
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
  };

  // Get the canvas element
  const ctx = document.getElementById('wishlistChart').getContext('2d');

  // Render the chart
  new Chart(ctx, {
    type: 'pie', // You can change this to 'bar', 'doughnut', etc.
    data: chartData,
    options: chartOptions
  });
}
//FIX RENDER FUNC 2
async function renderRatingDistributionChart() {
  // Fetch the wishlist data
  const wishlist = await fetchWishlist();

  // Prepare rating ranges
  const ratingRanges = {
    "0-50": 0,
    "51-70": 0,
    "71-85": 0,
    "86-100": 0,
  };

  // Categorize games into rating ranges
  wishlist.forEach(game => {
    if (game.rating) {
      if (game.rating <= 50) ratingRanges["0-50"]++;
      else if (game.rating <= 70) ratingRanges["51-70"]++;
      else if (game.rating <= 85) ratingRanges["71-85"]++;
      else if (game.rating <= 100) ratingRanges["86-100"]++;
    }
  });

  // Data for the chart
  const chartData = {
    labels: Object.keys(ratingRanges),
    datasets: [{
      label: "Games by Rating Range",
      data: Object.values(ratingRanges),
      backgroundColor: ["#f44336", "#ff9800", "#ffc107", "#4caf50"], // Red to green gradient
      borderColor: ["#d32f2f", "#f57c00", "#ffa000", "#388e3c"],
      borderWidth: 1,
    }],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
  };

  // Get the canvas element
  const ctx = document.getElementById('ratingDistributionChart').getContext('2d');

  // Render the chart
  new Chart(ctx, {
    type: 'bar', // Use 'bar' chart to show the distribution
    data: chartData,
    options: chartOptions,
  });
}

