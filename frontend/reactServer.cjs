// reactServer.cjs
// Uses common JavaScript to serve React build folder

const express = require('express');
const path = require('path');
const app = express();

// hardcode react PORT
// TODO: move to .env file
const PORT = 6067;

// serve static files from React app located at build folder '/dist'
// React router will take over frontend routing
app.use(express.static(path.join(__dirname, 'dist')));

// ################################################
// ############ ROUTE HANDLERS

// handle requests that don't match the ones shown above to return React app
// request to '/nonExist' will redirect to index.html where react router takes over at '/'
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

// ##################################################
// ############## LISTENER

// start the server and listen on specified port
app.listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}...`);
});