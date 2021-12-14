const Transaction = require('./transaction');

const { MINING_REWARD, REWARD_TX } = require('../../config/network-parameters');

class Miner {
    constructor(blockchain, wsServer) {
        this.blockchain = blockchain;
        this.wsServer = wsServer;
    }

    mine(minerAddress) {
        const coinbaseTransaction = new Transaction(REWARD_TX, minerAddress, MINING_REWARD, 0);

        this.blockchain.pendingTransactions.unshift(coinbaseTransaction);

        const newBlock = this.blockchain.addBlock();

        this.wsServer.synchronizeChains();

        this.blockchain.clearPendingTransactions();

        this.wsServer.broadcastClearTransactions();

        return newBlock;
    }
}

module.exports = Miner;
