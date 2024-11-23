
const http = require("http");
const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();


app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});


