const { Server } = require("socket.io");
const axios = require('axios');
const { generateJWT } = require('./jwtGeneration');

const initSocket = (httpServer, customerSocketMap) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.ALLOWED_ORIGIN,
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('serverMessage', async (message) => {
      socket.emit('serverMessage', replyMessage);
    });

    socket.on('clientMessage', async (message) => {
      // Store the customer number and corresponding socket ID in the map
      customerSocketMap.set(message.customer_id, socket.id);

      console.log('Received message from client:', message);
      try {
        const jwtToken = await generateJWT();
        const headers = {
          Authorization: `Bearer ${jwtToken}`,
          connection_id: process.env.JWT_ISSUER,
        };
  
        const externalApiResponse = await axios.post(
          process.env.DMS_URL,
          {
            type: message.type,
            customer_id: message.customer_id,
            customer_name: message.customer_name,
            message_id: message.message_id,
            text: message.text,
          },
          { headers }
        );
  
      } catch (error) {
        console.error('Error forwarding request to external API:', error.message);
        // Emit an error event to the client
        socket.emit('serverError', 'Error forwarding request to external API');
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
      // Remove the mapping when a socket disconnects
      for (const [customerNumber, socketId] of customerSocketMap.entries()) {
        if (socketId === socket.id) {
          customerSocketMap.delete(customerNumber);
          console.log(`Removed mapping for customer ${customerNumber}`);
          break;
        }
      }
    });
  });

  return io;
};

module.exports = { initSocket };
