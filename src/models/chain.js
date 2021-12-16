const fs = require('fs');
const path = require('path');
const EC = require('elliptic').ec;

const Block = require('./block');
const Transaction = require('./transaction');
const { BLOCK_SIZE } = require('../../config/network-parameters');
const { KEY_PAIRS_FOLDER } = require('../../config/ports-folders');

const ec = new EC('secp256k1');

/**
 * Chain class
 * @example <caption>Create a new blockchain object</caption>
 * let blockchain = new Chain();
 */
class Chain {
    constructor() {
        /**
         * List of Block class objects.
         * @type {object[]}
         */
        this.chain = [Block.genesisBlock()];
        /**
         * List of Transaction class objects.
         * @type {object[]}
         */
        this.pendingTransactions = [];
    }

    /**
     * Method to add transaction in pendingTransactions array.
     * Has few checks for validation.
     * Reads public and private keys from .json file in keypairs directory.
     * @param {string} fromAddress - Sender public key in hex string (secp256k1)
     * @param {string} toAddress - Receiver public key in hex string (secp256k1)
     * @param {number} amount - Amount to send
     * @returns Transaction class object
     */
    addTransaction(fromAddress, toAddress, amount) {
        let fileContent;

        if (fromAddress === '' || toAddress === '' || amount === '') { return ('Transaction must include from and to addresses and amount!'); }

        if (amount === 0) {
            return console.log('Amount can\'t be 0!');
        }

        if (amount > this.getBalanceOfAddress(fromAddress)) {
            return console.log(`Amount ${amount} exceeds current balance ${this.getBalanceOfAddress(fromAddress)}.`);
        }

        fs.readdirSync(path.join(__dirname, `../../${KEY_PAIRS_FOLDER}/`)).forEach((file) => {
            if (file === `${fromAddress}.json`) {
                fileContent = JSON.parse(fs.readFileSync(path.join(__dirname, `../../${KEY_PAIRS_FOLDER}/${file}`)));
            }
        });

        const keyPair = ec.keyFromPrivate(fileContent.privateKey, 'hex');

        const transaction = new Transaction(fromAddress, toAddress, amount, keyPair);

        if (!Transaction.isValid(transaction)) return ('Cannot add invalid transaction!');

        this.pendingTransactions.push(transaction);

        return transaction;
    }

    /**
     * Method to add Block class object to chain member in Chain class.
     * @returns Block class object
     */
    addBlock() {
        if (this.pendingTransactions.length <= 1) {
            return console.log('No pendingTransactions - cannot mine new block!');
        }

        const newBlock = Block.mineBlock(this.getLatestBlock(), this.getFromPendingTransactions());
        this.chain.push(newBlock);

        return newBlock;
    }

    /**
     * Method to replace current Chain class member with another Chain class member.
     * It is used for broadcasting blockchain to other peers.
     * @param {object[]} newChain - Chain class object
     * @returns string
     */
    replaceChain(newChain) {
        if (newChain.length <= this.chain.length) {
            console.log('Received chain is not longer than the current chain.');
            return 'Received chain is not longer than the current chain.';
        }

        if (!this.isValidChain(newChain)) {
            console.log('Received chain is not valid.');
            return 'Received chain is not valid.';
        }

        this.chain = newChain;
        console.log('Replacing with the new chain!');
        return 'Replacing with the new chain!';
    }

    /**
     * Method to check if chain is valid.
     * Checks are:
     * - if chain list starts with genesis block;
     * - if current block previous hash and previous block hash are matching;
     * - if current block has valid transactions.
     * @returns boolean
     */
    isValidChain(newChain) {
        if (JSON.stringify(newChain[0]) !== JSON.stringify(Block.genesisBlock())) return false;

        for (let i = 1; i < newChain.length; i++) {
            const currentBlock = newChain[i];
            const previousBlock = newChain[i - 1];

            if (currentBlock.parentHash !== previousBlock.hash
                || currentBlock.hash !== Block.blockHash(currentBlock)) return false;

            if (!Block.hasValidTransactions(currentBlock)) return false;
        }
        return true;
    }

    /**
     * Clears pending transactions list in Chain class object.
     */
    clearPendingTransactions() {
        this.pendingTransactions = [];
    }

    /**
     * Returns last block from chain list.
     * @returns object
     */
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    /**
     * Cuts pending transaction list to BLOCK_SIZE, declared in config file.
     * @returns Transaction class object array
     */
    getFromPendingTransactions() {
        return this.pendingTransactions[BLOCK_SIZE - 1]
            ? this.pendingTransactions.splice(0, BLOCK_SIZE)
            : this.pendingTransactions.splice(0, this.pendingTransactions.length);
    }

    /**
     * Returns balance of given address.
     * Subtracts, if address is sender and adds, if address is receiver.
     * @param {string} address - Public key in hex string generated by elliptic (secp256k1) library
     * @returns number
     */
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

    /**
     * Sends coins to given address from faucet address.
     * Faucet address .json file must be in keypairs directory.
     * @param {string} fromAddress - Sender public key in hex string (secp256k1)
     * @param {string} toAddress - Receiver public key in hex string (secp256k1)
     * @returns transaction object
     */
    getCoins(fromAddress, toAddress) {
        let fileContent;

        fs.readdirSync(path.join(__dirname, `../../${KEY_PAIRS_FOLDER}/`)).forEach((file) => {
            if (file === `${fromAddress}.json`) {
                fileContent = JSON.parse(fs.readFileSync(path.join(__dirname, `../../${KEY_PAIRS_FOLDER}/${file}`)));
            }
        });

        const keyPair = ec.keyFromPrivate(fileContent.privateKey, 'hex');
        const transaction = new Transaction(fromAddress, toAddress, 100, keyPair);
        this.pendingTransactions.push(transaction);
        return transaction;
    }
}
module.exports = Chain;
