const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createServer } = require("http");
const { initSocket } = require('./socketHandler'); // Import the module

const app = express();
const PORT = 5600;

app.use(cors());
app.use(bodyParser.json());

const httpServer = createServer(app);

// Map to store customer numbers and corresponding socket IDs
const customerSocketMap = new Map();

// Initialize the WebSocket and store the returned io instance
const io = initSocket(httpServer, customerSocketMap);

app.post('/webhook', async (req, res) => {
  console.log('Received webhook request:', req.body);

  // Get the socket ID associated with the customer number
  const socketId = customerSocketMap.get(req.body.customer_id);

  if (socketId) {
    console.log(`Found socket ID ${socketId} for customer ${req.body.customer_id}`);
    io.to(socketId).timeout(10000).emit('serverMessage', req.body, (error) => {
      if (error) {
        console.error('Error during server acknowledgment:', error);
      } else {
        console.log('Server acknowledgment received successfully');
      }
    });
  }
  
  res.sendStatus(200); // Send a response to acknowledge the request
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});