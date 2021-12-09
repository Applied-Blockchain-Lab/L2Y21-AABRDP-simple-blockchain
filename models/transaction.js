const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('ed25519');

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
        if(signingKey.getPublic('hex') != this.fromAddress)
            return ('You cannot sign transaction for other wallets!');

        const hash = this.generateHash();
        const sign = signingKey.sign(hash, 'base64');
        return sign.toDER('hex');
    }

    generateHash(){
		return SHA256(this.timestamp, this.fromAddress + this.toAddress + this.amount).toString();
	}

    isValid() {
        let publicKey;

        if(!this.signature || this.signature.length === 0)
            return false;

        try {
            publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        } catch(err) {
            return false;
        }
        return publicKey.verify(this.generateHash(), this.signature);
    }
}
module.exports = Transaction;