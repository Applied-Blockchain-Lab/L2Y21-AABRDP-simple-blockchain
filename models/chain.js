const fs = require('fs');
const path = require('path');
const EC = require('elliptic').ec;

const Block = require('./block');
const Transaction = require('./transaction');
const { BLOCK_SIZE } = require('../config/network-parameters');
const { KEY_PAIRS_FOLDER } = require('../config/ports-folders');

const ec = new EC('secp256k1');

class Chain {
    constructor() {
        this.chain = [Block.genesisBlock()];
        this.pendingTransactions = [];
    }

    addTransaction(fromAddress, toAddress, amount) {
        let fileContent;

        if (fromAddress === '' || toAddress === '' || amount === '') { return ('Transaction must include from and to addresses and amount!'); }

        fs.readdirSync(path.join(__dirname, `../${KEY_PAIRS_FOLDER}/`)).forEach((file) => {
            if (file === `${fromAddress}.json`) {
                fileContent = JSON.parse(fs.readFileSync(path.join(__dirname, `../${KEY_PAIRS_FOLDER}/${file}`)));
            }
        });

        const keyPair = ec.keyFromPrivate(fileContent.privateKey, 'hex');

        const transaction = new Transaction(fromAddress, toAddress, amount, keyPair);

        if (!transaction.isValid()) return ('Cannot add invalid transaction!');

        return this.pendingTransactions.push(transaction);
    }

    addBlock() {
        if (this.pendingTransactions.length === 0) return ('No pendingTransactions - cannot mine new block!');

        const newBlock = Block.mineBlock(this.getLatestBlock(), this.getFromPendingTransactions());
        this.chain.push(newBlock);

        return newBlock;
    }

    replaceChain(newChain) {
        if (newChain.length <= this.chain.length) return 'Received chain in not longer than the current chain.';

        if (!this.isValidChain(newChain)) return 'Received chain is not valid.';

        this.chain = newChain;
        return 'Replacing with the new chain!';
    }

    isValidChain() {
        if (JSON.stringify(this.chain[0]) !== JSON.stringify(Block.genesisBlock())) return false;

        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.parentHash !== previousBlock.hash
                || currentBlock.hash !== Block.blockHash(currentBlock)) return false;

            if (!currentBlock.hasValidTransactions()) return false;
        }
        return true;
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    getFromPendingTransactions() {
        return this.pendingTransactions[BLOCK_SIZE - 1]
            ? this.pendingTransactions.splice(0, BLOCK_SIZE)
            : this.pendingTransactions.splice(0, this.pendingTransactions.length);
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        this.chain.forEach((block) => {
            block.transactions.forEach((transaction) => {
                if (transaction.fromAddress === address) {
                    balance -= transaction.amount;
                }
                if (transaction.toAddress === address) {
                    balance += transaction.amount;
                }
            });
        });
        return balance;
    }
}
module.exports = Chain;
