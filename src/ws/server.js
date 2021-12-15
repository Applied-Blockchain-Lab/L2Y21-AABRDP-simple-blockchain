const Websocket = require('ws');

const { WS_PORT, PEERS } = require('../../config/ports-folders');

const MESSAGE_TYPES = {
    chain: 'CHAIN',
    transaction: 'TRANSACTION',
    clear_transactions: 'CLEAR_TRANSACTIONS',
};

class WsServer {
    constructor(blockchain) {
        this.blockchain = blockchain;
        this.sockets = [];
    }

    listen() {
        const server = new Websocket.Server({ port: WS_PORT });
        server.on('connection', (socket) => this.connectSocket(socket));

        this.connectToPeers();

        console.log(`Listening for peer-to-peer connections on ${WS_PORT}`);
    }

    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('Socket connected');

        this.messageHandler(socket);

        this.sendChain(socket);
    }

    connectToPeers() {
        PEERS.forEach((peer) => {
            const socket = new Websocket(peer);
            socket.on('open', () => this.connectSocket(socket));
            socket.on('error', (error) => { console.log('Error: ' + error); });
        });
    }

    messageHandler(socket) {
        socket.on('message', (message) => {
            const data = JSON.parse(message);

            switch (data.type) {
            case MESSAGE_TYPES.chain:
                this.blockchain.replaceChain(data.chain);
                break;
            case MESSAGE_TYPES.transaction:
                this.blockchain.pendingTransactions.push(data.transaction);
                break;
            case MESSAGE_TYPES.clear_transactions:
                this.blockchain.clearPendingTransactions();
                break;
            default:
                break;
            }
        });
    }

    sendChain(socket) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.chain,
            chain: this.blockchain.chain,
        }));
    }

    sendTransaction(socket, transaction) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.transaction,
            transaction,
        }));
    }

    synchronizeChains() {
        this.sockets.forEach((socket) => this.sendChain(socket));
    }

    broadcastTransaction(transaction) {
        this.sockets.forEach((socket) => this.sendTransaction(socket, transaction));
    }

    broadcastClearTransactions() {
        this.sockets.forEach((socket) => socket.send(JSON.stringify({
            type: MESSAGE_TYPES.clear_transactions,
        })));
    }
}

module.exports = WsServer;
