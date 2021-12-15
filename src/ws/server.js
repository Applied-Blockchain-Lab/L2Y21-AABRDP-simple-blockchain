const Websocket = require('ws');

const { WS_PORT, PEERS } = require('../../config/ports-folders');
const ip = require('../utils/get-public-ip');

const P2P_PORT = process.env.WS_PORT || WS_PORT;

const MESSAGE_TYPES = {
    chain: 'CHAIN',
    transaction: 'TRANSACTION',
    clear_transactions: 'CLEAR_TRANSACTIONS',
    peer: 'PEER',
};

let server;

class WsServer {
    constructor(blockchain) {
        this.blockchain = blockchain;
        this.sockets = [];
        this.connectedPeers = [];
    }

    listen() {
        server = new Websocket.Server({ port: P2P_PORT });

        server.on('connection', (socket) => this.connectSocket(socket));

        this.connectToPeers();

        console.log(`Listening for peer-to-peer connections on ${WS_PORT}`);
    }

    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('Socket connected');

        this.messageHandler(socket);

        this.sendChain(socket);

        this.broadcastPeers(PEERS);
    }

    connectToPeers() {
        PEERS.forEach((peer) => {
            // Check if peer exists - do not connect to peer's own address
            if (peer !== `ws://localhost:${P2P_PORT}`) {
                this.addAddressToPeers();

                this.connectedPeers.push(peer);

                const socket = new Websocket(peer);

                socket.on('open', () => this.connectSocket(socket));
            }
        });
    }

    addAddressToPeers() {
        PEERS.push(this.getPeerAddress());
    }

    getPeerAddress() {
        // Get peer with public ip
        // return `ws://${await ip.getPublicIp()}:${server.address().port}`
        return `ws://localhost:${server.address().port}`;
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
            case MESSAGE_TYPES.peer:
                this.addNotExistingPeer(data.peers);
                this.connectToNewPeers();
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

    sendPeers(socket) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.peer,
            peers: PEERS,
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

    broadcastPeers(peers) {
        this.sockets.forEach((socket) => socket.send(JSON.stringify({
            type: MESSAGE_TYPES.peer,
            peers,
        })));
    }

    addNotExistingPeer(peers) {
        peers.forEach((peer) => {
            if (!PEERS.includes(peer)) {
                PEERS.push(peer);
            }
        });
    }

    connectToNewPeers() {
        let difference = [];
        let actualArray = [];

        if (this.connectedPeers.length > 0) {
            difference = PEERS.filter((x) => !this.connectedPeers.includes(x));
            actualArray = difference.filter((x) => x !== this.getPeerAddress());
        }

        if (actualArray.length > 0) {
            actualArray.forEach((peer) => {
                this.connectedPeers.push(peer);

                const socket = new Websocket(peer);

                socket.on('open', () => this.connectSocket(socket));
            });
        }
    }
}

module.exports = WsServer;
