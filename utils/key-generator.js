const EdDSA = require('elliptic').eddsa;

const ed25519 = new EdDSA('ed25519');

module.exports = {
    generateKeyPair(secret) {
        const keyPair = ed25519.keyFromSecret(secret);
        return keyPair.getPublic('hex');
    },
};
