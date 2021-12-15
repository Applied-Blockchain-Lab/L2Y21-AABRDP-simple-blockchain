const EC = require('elliptic').ec;
const { generateHash } = require('../utils/crypto-util');

const ec = new EC('secp256k1');

/**
 * Transaction class
 * @example <caption>Create a new transaction object</caption>
 * let transaction = new Transaction(sender public key, receiver public key, amount);
 */
class Transaction {
    /**
     * Transaction constructor
     * @param {string} fromAddress - Sender public key in hex string (secp256k1)
     * @param {string} toAddress - Receiver public key in hex string (secp256k1)
     * @param {number} amount - Amount to send
     * @param {object} keyPair - Private and public key object, generated with elliptic(secp256k1) library
     */
    constructor(fromAddress, toAddress, amount, keyPair) {
        this.timestamp = Date.now();
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.signature = this.sign(keyPair);
        this.hash = generateHash(this.timestamp + this.fromAddress + this.toAddress + this.amount + this.signature);
    }

    /**
     * Method for creating a digital signature.
     * @param {object} signingKeyPair - Private and public key object
     * @returns Encoded hex string
     */
    sign(signingKeyPair) {
        if (signingKeyPair === 0) { return 0; }
        if (signingKeyPair.getPublic('hex') !== this.fromAddress) { return ('You cannot sign transaction for other wallets!'); }

        const signData = (this.timestamp + this.fromAddress + this.toAddress + this.amount).toString();
        return signingKeyPair.sign(signData).toDER('hex');
    }

    /**
     * Helper method to check if transaction object is valid.
     * Verifies by using public key.
     * @returns boolean
     */
    isValid() {
        if (!this.signature || this.signature.length === 0) return false;

        const keyPair = ec.keyFromPublic(this.fromAddress, 'hex');
        const signData = (this.timestamp + this.fromAddress + this.toAddress + this.amount).toString();
        return keyPair.verify(signData, this.signature);
    }
}
module.exports = Transaction;
