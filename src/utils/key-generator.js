const fs = require('fs');
const path = require('path');
const EC = require('elliptic').ec;

const { KEY_PAIRS_FOLDER } = require('../../config/ports-folders');

const ec = new EC('secp256k1');

module.exports = {
    generateKeyPair() {
        const keyPair = ec.genKeyPair();

        const data = {
            privateKey: keyPair.getPrivate('hex'),
            publicKey: keyPair.getPublic('hex'),
        };
        fs.writeFileSync(
            path.join(__dirname, `../${KEY_PAIRS_FOLDER}/${keyPair.getPublic('hex')}.json`),
            JSON.stringify(data, null, 2),
        );

        return data;
    },
};
