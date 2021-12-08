const Block = require('./block');

class Chain {

    constructor() {
        this.chain = [Block.genesisBlock()];
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(data) {
        const newBlock = Block.mineBlock(this.getLatestBlock(), data);
        this.chain.push(newBlock);

        return newBlock;
    }

    isValidChain() {
        if(JSON.stringify(this.chain[0]) !== JSON.stringify(Block.genesisBlock()))
            return false;

        for(let i = 1; i < this.chain.length; i++) {
            const block = this.chain[i];
            const lastBlock = this.chain[i-1];

            if(block.parentHash !== lastBlock.hash || block.hash !== Block.blockHash(block))
            return false;

        }
        return true;
    }

    replaceChain(newChain) {
        if(newChain.length <= this.chain.length) {
            console.log('Received chain in not longer than the current chain.');
            return;
        } else if (!this.isValidChain(newChain)) {
            console.log('Received chain is not valid.');
            return;
        }

        this.chai = newChain;
        console.log('Replacing with the new chain!')
    }
}
module.exports = Chain;