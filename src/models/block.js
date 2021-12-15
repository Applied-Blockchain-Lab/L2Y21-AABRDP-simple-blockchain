const { generateHash } = require('../utils/crypto-util');
const { DIFFICULTY, CREATION_TIME } = require('../../config/network-parameters');

/**
 * Block class
 * @example <caption>Create a new block object</caption>
 * let block = new Block(timestamp, parentHash, hash, nonce, difficulty, transaction);
 */
class Block {
    /**
     * Block constructor
     * @param {string} timestamp - Block creation time in seconds after Unix Epoch
     * @param {string} parentHash - SHA256 hash of the previous block
     * @param {string} hash - SHA256 hash of the current block
     * @param {number} nonce - Counter for PoW algorithm
     * @param {number} difficulty - Target number for current block (count of leading zeros)
     * @param {object[]} transactions - List of transactions for the current block
     */
    constructor(timestamp, parentHash, hash, nonce, difficulty, transactions) {
        this.timestamp = timestamp;
        this.parentHash = parentHash;
        this.hash = hash;
        this.nonce = nonce;
        this.difficulty = difficulty || DIFFICULTY;
        this.transactions = transactions;
    }

    /**
     * Method to create genesis block with default parameters
     * @returns {object} New block object
     */
    static genesisBlock() {
        return new Block('000000', '-', '111-111', 0, DIFFICULTY, []);
    }

    /**
     * Method to mine a new block. Loop stops when hash with current difficulty is found.
     * @param {object} lastBlock - Block class object
     * @param {object[]} transactions - Transactions which will be included in current block
     * @returns New block object with calculated parameters - Block class object
     */
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

    /**
     * Method for generating hash from existing block - helper to validate chain
     * @param {object} block - Block class object
     * @returns Hash from block parameter attributes - string
     */
    static blockHash(block) {
        const {
            timestamp, parentHash, nonce, difficulty, transactions,
        } = block;

        return generateHash(timestamp + parentHash + nonce + difficulty + transactions);
    }

    /**
     * Method to adjust difficulty.
     * Sets difficulty according to last block's timestamp and CREATION_TIME from config file.
     * @param {object} lastBlock - Block class object
     * @param {string} currentTime - Time in seconds
     * @returns Adjusted difficulty - string
     */
    static adjustDifficulty(lastBlock, currentTime) {
        let { difficulty } = lastBlock;
        difficulty = lastBlock.timestamp + CREATION_TIME > currentTime
            ? difficulty + 1 : difficulty - 1;

        return difficulty;
    }

    /**
     * Method to check if transactions in current block are valid, using isValid helper function
     * @returns boolean
     */
    hasValidTransactions() {
        for (let i = 0; i < this.transactions.length; i++) {
            if (!this.transactions[i].isValid()) {
                return false;
            }
        }
        return true;
    }

    /**
     * Method for logging Block class object
     * @returns string
     */
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
