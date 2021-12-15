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

/**
 * WsServer class
 * @example <caption>Create a new websocket object</caption>
 * let blockchain = new Blockchain();
 * let wsServer = new WsServer(blockchain);
 */
class WsServer {
    /**
     * WsServer constructor
     * @param {object} blockchain - Blockchain class object
     */
    constructor(blockchain) {
        this.blockchain = blockchain;
        /**
         * @type {object[]} - List of socket objects
         */
        this.sockets = [];
        /**
         * @type {string[]} - List of addresses of connected peers
         */
        this.connectedPeers = [];
    }

    /**
     * Starts Websocket Server. Connects to peers and listens for connections.
     */
    listen() {
        server = new Websocket.Server({ port: P2P_PORT });

        server.on('connection', (socket) => this.connectSocket(socket));

        this.connectToPeers();

        console.log(`Listening for peer-to-peer connections on ${WS_PORT}`);
    }

    /**
     * Functionalities:
     * - Adds current socket to socket list;
     * - Sends socket to message handler method;
     * - Sends current chain to other peers;
     * - Broadcasts own peers list to other peers.
     * @param {object} socket - Socket object, returned by creating websocket client
     */
    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('Socket connected');

        this.messageHandler(socket);

        this.sendChain(socket);

        this.broadcastPeers(PEERS);
    }

    /**
     * Opens Websocket client connection to peers in peers list, excluding own address.
     */
    connectToPeers() {
        PEERS.forEach((peer) => {
            // Check if peer exists - do not connect to peer's own address
            if (peer !== `ws://localhost:${P2P_PORT}`) {
                this.addAddressToPeers();

                this.connectedPeers.push(peer);

                const socket = new Websocket(peer);

                socket.on('open', () => this.connectSocket(socket));
                socket.on('error', (error) => { console.log('Error: ' + error); });
            }
        });
    }

    /**
     * Adds own address to peers list
     */
    addAddressToPeers() {
        PEERS.push(this.getPeerAddress());
    }

    /**
     * Returns address and port
     * @returns address of peer - string
     */
    getPeerAddress() {
        // Get peer with public ip
        // return `ws://${await ip.getPublicIp()}:${server.address().port}`
        return `ws://localhost:${server.address().port}`;
    }

    /**
     * Handles incoming message by comparing different message types
     * @param {object} socket - Socket object, returned by creating websocket client
     */
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

    /**
     * Sends message to socket - chain object
     * @param {object} socket - Socket object, returned by creating websocket client
     */
    sendChain(socket) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.chain,
            chain: this.blockchain.chain,
        }));
    }

    /**
     * Sends message to socket - transaction object
     * @param {object} socket - Socket object, returned by creating websocket client
     * @param {object} transaction - Transaction class object
     */
    sendTransaction(socket, transaction) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.transaction,
            transaction,
        }));
    }

    /**
     * Sends message to socket - peers list
     * @param {object} socket - Socket object, returned by creating websocket client
     */
    sendPeers(socket) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.peer,
            peers: PEERS,
        }));
    }

    /**
     * Sends message to every socket - current chain
     */
    synchronizeChains() {
        this.sockets.forEach((socket) => this.sendChain(socket));
    }

    /**
     * Sends message to every socket - current transaction
     * @param {object} transaction - Transaction class object
     */
    broadcastTransaction(transaction) {
        this.sockets.forEach((socket) => this.sendTransaction(socket, transaction));
    }

    /**
     * Sends message to every socket - clears every socket's pending transactions list
     */
    broadcastClearTransactions() {
        this.sockets.forEach((socket) => socket.send(JSON.stringify({
            type: MESSAGE_TYPES.clear_transactions,
        })));
    }

    /**
     * Sends message to every socket - peers list
     * @param {string[]} peers - List of addresses of peers
     */
    broadcastPeers(peers) {
        this.sockets.forEach((socket) => socket.send(JSON.stringify({
            type: MESSAGE_TYPES.peer,
            peers,
        })));
    }

    /**
     * Adds peers from another node peer list to current node peer list - only unique ones
     * @param {string[]} peers - List of addresses of peers
     */
    addNotExistingPeer(peers) {
        peers.forEach((peer) => {
            if (!PEERS.includes(peer)) {
                PEERS.push(peer);
            }
        });
    }

    /**
     * Connects to peers after receiving new peers from another node.
     */
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
