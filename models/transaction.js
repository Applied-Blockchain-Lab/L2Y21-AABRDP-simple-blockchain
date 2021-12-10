const EC = require('elliptic').ec;
const ec = new EC('ed25519');

const { generateHash } = require('../utils/crypto-util');

class Transaction {
    constructor(fromAddress, toAddress, amount, myKeyForSign) {
        this.timestamp = Date.now();
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.signature = this.sign(myKeyForSign);
        this.hash = this.generateHash();
    }

    sign(signingKey) {
        if (signingKey.getPublic('hex') !== this.fromAddress) return ('You cannot sign transaction for other wallets!');

        const hash = generateHash(this.timestamp + this.fromAddress + this.toAddress + this.amount);
        const sign = signingKey.sign(hash, 'base64');
        return sign.toDER('hex');
    }

    isValid() {
        let publicKey;

        if (!this.signature || this.signature.length === 0) return false;

        try {
            publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        } catch (err) {
            return false;
        }
        return publicKey.verify(this.generateHash(), this.signature);
    }
}
module.exports = Transaction;
