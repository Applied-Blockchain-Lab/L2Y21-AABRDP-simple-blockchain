const express = require('express');
const routes = require('./src/routes/routes');
const Blockchain = require('./src/models/chain');
const WsServer = require('./src/ws/server');
const Miner = require('./src/models/miner');

const { HTTP_PORT, IP_ADDRESS } = require('./config/ports-folders');

const app = express();

const blockchain = new Blockchain();
const wsServer = new WsServer(blockchain);
const miner = new Miner(blockchain, wsServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);
app.listen(process.env.HTTP_PORT || HTTP_PORT, IP_ADDRESS, () => {
    console.log(`HTTP server listening at http://${IP_ADDRESS}:${HTTP_PORT}`);
});

wsServer.listen();

exports.blockchain = blockchain;
exports.wsServer = wsServer;
exports.miner = miner;
