//Chart created with a mix of class knowledge and https://www.w3schools.com/js/js_graphics_chartjs.asp
let wishlistChartInstance;//Variable to delete the chart when updating it
async function renderWishlistChart() {
    try {
        //Fetch the current wishlist
        const wishlist = await fetchWishlist();

        //Count played and not played games
        let playedCount = 0;    
        for (let i = 0; i < wishlist.length; i++){
            if (wishlist[i].playState == "Played"){
                playedCount++;
            }
        }
        const notPlayedCount = wishlist.length - playedCount;

        //Data for the chart
        const chartData = {
            labels: ["Played", "Not Played"],
            datasets: [{
                label: "Games Played Status",
                data: [playedCount, notPlayedCount], //Values for played and not played
                backgroundColor: ["#4caf50", "#f44336"], //Green for played, red for not played
                borderColor: ["#388e3c", "#d32f2f"],
                borderWidth: 1
            }]
        };

        //Options for the chart
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

        //Destroy the existing chart instance if it exists
        if (wishlistChartInstance) {
            wishlistChartInstance.destroy();
        }

        // Create a new chart instance
        wishlistChartInstance = new Chart(ctx, {
            type: 'pie',
            data: chartData,
            options: chartOptions,
        });
        } catch (error) {
            console.error("Error rendering wishlist chart:", error);
        }
}

//Chart created with a mix of class knowledge and Part of this code was learnt with the aid of "techletters" youtube channel - https://www.youtube.com/watch?v=f-7uQXGur2o
let ratingChartInstance;
async function renderRatingChart() {
    try {
        //Fetch the wishlist data
        const wishlist = await fetchWishlist();

        const ratingRanges = {
            "0-50": 0,
            "51-70": 0,
            "71-85": 0,
            "86-100": 0,
        };

        //Categorize games into rating ranges

        for (let i = 0; i < wishlist.length; i++){
            let currentRating = 0;  
            if (wishlist[i].rating) {
                currentRating = wishlist[i].rating;
                if (currentRating <= 50) ratingRanges["0-50"]++;
                else if (currentRating <= 70) ratingRanges["51-70"]++;
                else if (currentRating <= 85) ratingRanges["71-85"]++;
                else if (currentRating <= 100) ratingRanges["86-100"]++;
            }
        }

        // Data for the chart
        const chartData = {
            labels: Object.keys(ratingRanges),
            datasets: [{
                label: "Games by Rating Range",
                data: Object.values(ratingRanges),
                backgroundColor: ["#f44336", "#ff9800", "#ffc107", "#4caf50"],
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

        const ctx = document.getElementById('ratingDistributionChart').getContext('2d');

        //Destroy the existing chart instance if it exists
        if (ratingChartInstance) {
            ratingChartInstance.destroy();
        }

        //Create a new chart instance
        ratingChartInstance = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: chartOptions,
        });
    } catch (error) {
        console.error("Error rendering rating distribution chart:", error);
    }
}