const SHA256 = require('crypto-js/sha256');

module.exports = {
    generateHash(data) {
        return SHA256(JSON.stringify(data)).toString();
    },
};
