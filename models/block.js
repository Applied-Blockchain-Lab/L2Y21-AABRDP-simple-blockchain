const SHA256 = require('crypto-js/sha256');

const { DIFFICULTY, CREATION_TIME } = require('.././network-parameters');

class Block {

    constructor (timestamp, parentHash, hash, nonce, difficulty, data) {
        this.timestamp = timestamp;
        this.parentHash = parentHash;
        this.hash = hash;
        this.nonce = nonce;
        this.difficulty = difficulty || DIFFICULTY;
        this.data = data;
}

    static genesisBlock() {
        return new Block('000000','-','111-111', 0, DIFFICULTY, []);
    }

    static mineBlock(lastBlock, data) {
        let nonce = 0;
        let hash, timestamp;
        const parentHash = lastBlock.hash;
        let { difficulty } = lastBlock;

        do{
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty(lastBlock, timestamp);
            hash = Block.generateHash(timestamp, parentHash, nonce, difficulty, data);

        } while(hash.substring(0, DIFFICULTY) != '0'.repeat(DIFFICULTY));

        return new Block(timestamp, parentHash, hash, nonce, difficulty, data);
    }

    static generateHash(timestamp, parentHash, nonce, difficulty, data) {
        return SHA256(`${timestamp}${parentHash}${nonce}${difficulty}${data}`).toString();
    }

    static blockHash(block) {
        const {timestamp, parentHash, nonce, difficulty, data} = block;

        return Block.generateHash(timestamp, parentHash, nonce,difficulty, data);
    }

    static adjustDifficulty(lastBlock, currentTime) {
        let { difficulty } = lastBlock;
        difficulty = lastBlock.timestamp + CREATION_TIME > currentTime ? difficulty + 1 : difficulty - 1;

        return difficulty;
    }

}
module.exports = Block;