import express from 'express';
import compression from 'compression'; // compresses requests
import bodyParser from 'body-parser';
import cors from 'cors';
import socketIO, { Socket } from 'socket.io';

import http from 'http';
import errorHandler from 'errorhandler';
import * as orderController from './controllers/order';

// Create Express server
const expressApp = express();
// expressApp.use(
//   basicAuth({
//     challenge: true,
//     users: { admin: 'pmwwe8ol' },
//   }),
// );
// Express configuration
expressApp.use(
  cors({
    exposedHeaders: '*',
  }),
);
expressApp.use(errorHandler());
expressApp.use(compression());
expressApp.use(bodyParser.json());
expressApp.use(bodyParser.urlencoded({ extended: true }));
//
// expressApp.get('/healthcheck', (req, res) => {
//   res.send(new Date().toISOString());
//
//   res.end();
// });
expressApp.get('/Orders', orderController.listOrders);
expressApp.post('/Orders', orderController.createOrders);
expressApp.get('/Orders/:id', orderController.getOrder);
expressApp.put('/Orders/:id', orderController.updateOrder);

const app = http.createServer(expressApp);
const io = socketIO(app);
io.on('connection', (socket: Socket) => {
  console.log(`New WS connection ${socket.id}`);
  // socket.on('message', (message) => {
  //   // log.info(`New message ${JSON.stringify(message)}`);
  //   // socket.broadcast.emit('message', message);
  //   socket.broadcast.emit('message', message);
  // });
});
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.io = io;

export default app;
