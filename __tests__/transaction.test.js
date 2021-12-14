const EC = require('elliptic').ec;
const Transaction = require('../src/models/transaction');
const Generator = require('../src/utils/key-generator');

const ec = new EC('secp256k1');

describe('Test Transaction class', () => {
    const pair = Generator.generateKeyPair();

    it('empty key pair = unsuccessful signing', () => {
        const tx = new Transaction('invalid', 'to', 0, 0);

        expect(tx.sign(0)).toEqual(0);
    });

    it('fromAddress!=public key = unsuccessful signing', () => {
        const keyPair = ec.keyFromPrivate(pair.privateKey, 'hex');
        const tx = new Transaction('invalid', 'to', 0, keyPair);

        expect(tx.signature).toEqual(0);
    });

    it('fromAddress==public key = successful signing', () => {
        const keyPair = ec.keyFromPrivate(pair.privateKey, 'hex');
        const tx = new Transaction(pair.publicKey, 'to', 0, keyPair);

        expect(tx.signature).not.toEqual(0);
    });

    it('empty signature = not valid tx', () => {
        const tx = new Transaction('from', 'to', 0, 0);

        expect(tx.isValid()).toEqual(false);
    });

    it('amount=0 = not valid tx', () => {
        const tx = new Transaction('from', 'to', 0, 0);

        expect(tx.isValid()).toEqual(false);
    });

    it('valid tx', () => {
        const keyPair = ec.keyFromPrivate(pair.privateKey, 'hex');
        const tx = new Transaction(pair.publicKey, 'to', 1, keyPair);

        expect(tx.isValid()).toEqual(true);
    });

    it('invalid fromAddress = not valid tx', () => {
        const keyPair = ec.keyFromPrivate(pair.privateKey, 'hex');
        const tx = new Transaction('invalid', 'to', 0, keyPair);

        expect(tx.isValid()).toEqual(false);
    });
});
