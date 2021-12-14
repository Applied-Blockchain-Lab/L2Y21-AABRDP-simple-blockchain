const { generateHash } = require('../utils/crypto-util');
const { DIFFICULTY, CREATION_TIME } = require('../../config/network-parameters');

class Block {
    constructor(timestamp, parentHash, hash, nonce, difficulty, transactions) {
        this.timestamp = timestamp;
        this.parentHash = parentHash;
        this.hash = hash;
        this.nonce = nonce;
        this.difficulty = difficulty || DIFFICULTY;
        this.transactions = transactions;
    }

    static genesisBlock() {
        return new Block('000000', '-', '111-111', 0, DIFFICULTY, []);
    }

    static mineBlock(lastBlock, transactions) {
        let nonce = 0;
        let hash;
        let timestamp;
        const parentHash = lastBlock.hash;
        let { difficulty } = lastBlock;

        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty(lastBlock, timestamp);
            hash = generateHash(timestamp + parentHash + nonce + difficulty + transactions);
        } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

        return new Block(timestamp, parentHash, hash, nonce, difficulty, transactions);
    }

    static blockHash(block) {
        const {
            timestamp, parentHash, nonce, difficulty, transactions,
        } = block;

        return generateHash(timestamp + parentHash + nonce + difficulty + transactions);
    }

    static adjustDifficulty(lastBlock, currentTime) {
        let { difficulty } = lastBlock;
        difficulty = lastBlock.timestamp + CREATION_TIME > currentTime
            ? difficulty + 1 : difficulty - 1;

        return difficulty;
    }

    hasValidTransactions() {
        for (let i = 0; i < this.transactions.length; i++) {
            if (!this.transactions[i].isValid()) {
                return false;
            }
        }
        return true;
    }

    toString() {
        return `Block -
            Timestamp    : ${this.timestamp}
            Parent hash  : ${this.parentHash}
            Hash         : ${this.hash}
            Nonce        : ${this.nonce}
            Difficulty   : ${this.difficulty}
            Transactions : ${this.transactions}
        `;
    }
}
module.exports = Block;