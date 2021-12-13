const express = require('express');
const routes = require('./routes/routes');
const Blockchain = require('./models/chain');
const WsServer = require('./ws/server');
const Miner = require('./models/miner');

const { HTTP_PORT } = require('./config/ports-folders');

const app = express();

const blockchain = new Blockchain();
const wsServer = new WsServer(blockchain);
const miner = new Miner(blockchain, wsServer);

app.use(routes);
app.listen(HTTP_PORT, () => {
    console.log(`HTTP server listening at http://localhost:${HTTP_PORT}`);
});

wsServer.listen();

exports.blockchain = blockchain;
exports.wsServer = wsServer;
exports.miner = miner;
