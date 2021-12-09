const Block = require('./block');
const Transaction = require('./transaction');
const { BLOCK_SIZE } = require('.././network-parameters');
class Chain {

    constructor() {
        this.chain = [Block.genesisBlock()];
        this.pendingTransactions = [];
    }

    addTransaction(fromAddress, toAddress, amount, myKeyForSign) {
        if(fromAddress==='' || toAddress==='')
            return ('Transaction must include from and to addresses!');

        let transaction = new Transaction(fromAddress, toAddress, amount, myKeyForSign);
        if(!transaction.isValid())
            return ('Cannot add invalid transaction!');

        this.pendingTransactions.push(transaction);
    }

    addBlock() {
        if(this.pendingTransactions.length === 0)
            return ('No pendingTransactions - cannot mine new block!');

        const newBlock = Block.mineBlock(this.getLatestBlock(), this.getFromPendingTransactions());
        this.chain.push(newBlock);

        return newBlock;
    }

    replaceChain(newChain) {
        if(newChain.length <= this.chain.length)
            return 'Received chain in not longer than the current chain.';

        if (!this.isValidChain(newChain))
            return 'Received chain is not valid.';

        this.chain = newChain;
            return 'Replacing with the new chain!';
    }

    isValidChain() {
        if(JSON.stringify(this.chain[0]) !== JSON.stringify(Block.genesisBlock()))
            return false;

        for(let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            if(currentBlock.parentHash !== previousBlock.hash || currentBlock.hash !== Block.blockHash(currentBlock))
                return false;

            if(!currentBlock.hasValidTransactions())
                return false;
        }
        return true;
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    getFromPendingTransactions() {
        return this.pendingTransactions[BLOCK_SIZE-1] ? this.pendingTransactions.splice(0, BLOCK_SIZE) : this.pendingTransactions.splice(0, this.pendingTransactions.length);
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        for(const block of this.chain) {
            for(const transaction of block.transactions) {
                if(transaction.fromAddress === address) {
                    balance -= transaction.amount;
                }
                if(transaction.toAddress === address) {
                    balance += transaction.amount;
                }
            }
        }
        return balance;
    }
}
module.exports = Chain;