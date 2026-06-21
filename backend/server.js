require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const P1 = process.env.PLAYER1_USERNAME || 'player1';
const P2 = process.env.PLAYER2_USERNAME || 'player2';

// State memory
let currentStats = {
  player1: { followers: 100000 },
  player2: { followers: 100000 }
};

const fetchInstagramData = async (username) => {
  if (!process.env.RAPIDAPI_KEY) {
    console.warn('API Key missing. Simulating data for:', username);
    return { follower_count: Math.floor(Math.random() * 50000) + 50000 };
  }

  try {
    const options = {
      method: 'GET',
      url: `https://${process.env.RAPIDAPI_HOST}/get_ig_user_about.php`, // <-- UPDATED URL
      params: { 
        username_or_url: username  // <-- UPDATED PARAMETER
      },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST
      }
    };
    
    const response = await axios.request(options);
    
    // Logging the response so we can see the exact data shape in Render
    console.log(`Successfully fetched data for ${username}`);
    
    // Return the data object. 
    return response.data.data; 
    
  } catch (error) {
    console.error(`Error fetching ${username}:`, error.message);
    throw error;
  }
};

const runTracker = async () => {
  try {
    // 1. Fetch Player 1
    const p1Data = await fetchInstagramData(P1);
    
    // 2. Add a 2-second delay to respect the API's concurrency limits
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. Fetch Player 2
    const p2Data = await fetchInstagramData(P2);

    currentStats = {
      player1: { followers: p1Data.follower_count },
      player2: { followers: p2Data.follower_count }
    };

    io.emit('statsUpdate', currentStats);
    console.log('Broadcasted update:', currentStats);
  } catch (err) {
    console.log('Polling skipped this cycle due to rate limit error.');
  }
};

// Initial run
runTracker();

// Change the interval from 15000 (15 seconds) to 60000 (60 seconds)
setInterval(runTracker, 60000);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('statsUpdate', currentStats); // Send current state on load
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Fight Engine running on port ${PORT}`);
});
