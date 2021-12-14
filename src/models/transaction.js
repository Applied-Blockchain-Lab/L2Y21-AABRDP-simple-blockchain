const EC = require('elliptic').ec;
const { generateHash } = require('../utils/crypto-util');

const ec = new EC('secp256k1');

class Transaction {
    constructor(fromAddress, toAddress, amount, keyPair) {
        this.timestamp = Date.now();
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.signature = this.sign(keyPair);
        this.hash = generateHash(this.timestamp + this.fromAddress + this.toAddress + this.amount + this.signature);
    }

    sign(signingKeyPair) {
        if (signingKeyPair === 0) { return 0; }
        if (signingKeyPair.getPublic('hex') !== this.fromAddress) { return 0; }

        const signData = (this.timestamp + this.fromAddress + this.toAddress + this.amount).toString();
        return signingKeyPair.sign(signData).toDER('hex');
    }

    isValid() {
        if (!this.signature || this.signature.length === 0) return false;
        if (this.amount === 0) return false;

        const keyPair = ec.keyFromPublic(this.fromAddress, 'hex');
        const signData = (this.timestamp + this.fromAddress + this.toAddress + this.amount).toString();
        return keyPair.verify(signData, this.signature);
    }
}
module.exports = Transaction;
