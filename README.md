# LCH - Labb Chat Hook
Webhook and socket support to interact with the LCC (Labb Chat Client) and Pega DMS to chat with a bot and agent

# How to use it.

1. Create an account on render.com (or any other 'free' hosting platform)
2. Create a webservice and select `Build and deploy from a Git repository`
3. Paste this repo URL and go to the next step
4. Fill in the following details:
- Give it a name
- Select a region
- Select the `main` branch
- leave `Root directory` empty
- Runtime should be `Node`
- Build command should be `yarn`
- Start command should be `yarn start`
- Select the `Free` option
5. Pay special attention to `Environment variables`. This can easily be changed later on when the service is setup and deployed. Once it's changed, the service will automatically restart and the new environment variables will be in place.
- Key: ALLOWED_ORIGIN - Value of the URL to the LCC (Labb Chat Client)
- Key: DMS_URL - The value of the URL to Pega DMS as given by Pega when creating the chat DMS service. For example: `https://incoming.euw1.um.pega.digital/messages`
- Key: JWT_ISSUER - The JWT issuer as given by the the DMS settings in Pega when creating a chat DMS service
- Key: JWT_SECRET - The JWT secret as given by the the DMS settings in Pega when creating a chat DMS service
6. You are ready to go. Please deploy the LCC (Labb Chat Client) now if not done already.

# What does it do?

This JavaScript code is for a server application that uses the Express.js framework, along with several other modules: body-parser, cors, and http. It also imports a custom module named socketHandler.

In socketHandler the Socket.IO library is used to handle real-time, bidirectional, and event-based communication. It also uses the axios library to make HTTP requests and a custom module named jwtGeneration.

An HTTP server is created with the Express application as a handler for HTTP requests. This server is stored in the `httpServer` constant.

A `Map` object is created to store customer numbers and corresponding socket IDs. This map is used to keep track of which socket is associated with which customer.

The `initSocket` function from the `socketHandler` module is called with the HTTP server and the customer-socket map as arguments.

Inside the function, a new Socket.IO server instance is created with the HTTP server as an argument. The server is configured to allow Cross-Origin Resource Sharing (CORS) from a specific origin, which is retrieved from the environment variables.

The server listens for `connection` events, which are fired when a client connects to the server. When a client connects, a message is logged to the console, and several event listeners are set up on the client's socket.

The 'serverMessage' event listener simply sends a message back to the client when it receives a message.

The 'clientMessage' event listener is more complex. When a message is received from the client, the customer number from the message and the socket ID are stored in the map. Then, a JSON Web Token (JWT) is generated and used to authenticate a POST request to the DMS service. The request body contains data from the message received from the client. If the request is successful, the response from the DMS service is logged. If an error occurs during this process, an error message is logged and an 'serverError' event is emitted to the client with a message.

The 'disconnect' event listener is fired when the client disconnects from the server. When this happens, the mapping of the customer number to the socket ID is removed from the map, and a message is logged to the console.

The server is set up to handle POST requests from Pega DMS at the `/webhook` endpoint. When a request from the DMS is received, the server logs the request body, retrieves the socket ID associated with the customer number from the request body, and if a socket ID is found, it sends a message to that socket with a timeout of 10 seconds. If there's an error during the acknowledgment, it logs the error; otherwise, it logs a success message. Regardless of whether a socket ID is found, the server responds with a status code of 200 to acknowledge the request.