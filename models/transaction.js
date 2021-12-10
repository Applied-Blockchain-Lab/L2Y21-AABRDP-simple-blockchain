const EC = require('elliptic').ec;
const { generateHash } = require('../utils/crypto-util');

const ec = new EC('ed25519');

class Transaction {
    constructor(fromAddress, toAddress, amount, signature) {
        this.timestamp = Date.now();
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.signature = signature;
        this.hash = generateHash(this.timestamp + this.fromAddress + this.toAddress + this.amount + signature);
    }

    sign(signingKey) {
        if (signingKey.getPublic('hex') !== this.fromAddress) return ('You cannot sign transaction for other wallets!');

        const hash = generateHash(this.timestamp + this.fromAddress + this.toAddress + this.amount + this.signature);
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
