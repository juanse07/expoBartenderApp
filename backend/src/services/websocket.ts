import mongoose from 'mongoose';
import WebSocket from 'ws';

export const setupWebSocket = (server: any) => {
   const wss = new WebSocket.Server({ server });

   console.log('WebSocket server running');

   mongoose.connection.on('connected', () => {
       console.log('MongoDB connected');
       
       // Access the collection
       const collection = mongoose.connection.db?.collection('barservicequotations');
       if (!collection) {
           throw new Error('Failed to access the collection. Ensure MongoDB is initialized properly.');
       }

       // Handle new WebSocket connections
       wss.on('connection', (ws) => {
           console.log('WebSocket client connected');

           ws.on('close', () => {
               console.log('WebSocket client disconnected');
           });
       });

       // Listen for MongoDB changes
       const changeStream = collection.watch();
       changeStream.on('change', (change) => {
           console.log('Change detected:', change);

           wss.clients.forEach((client) => {
               if (client.readyState === WebSocket.OPEN) {
                   client.send(JSON.stringify(change));
               }
           });
       });

       changeStream.on('error', (error) => {
           console.error('Error in Change Stream:', error);
       });

       console.log('Listening to changes in the barservicequotations collection');
   });
};

