const Transaction = require('../src/models/transaction');
const { REWARD_TX } = require('./network-parameters');

const TIMESTAMP = '0000';
const PARENT_HASH = '0000';
const HASH = '111-111';

const TRANSACTIONS = [new Transaction(REWARD_TX, '04c9585c6112196cca49c01559d279a4f5c1bbf49d66a45f83970869f1e32ac19c30bd5237aa274633fa4057d92962579ed5ffc1d61831197de2e76b059271c4c2', 100, 0)];

module.exports = {
    TIMESTAMP, PARENT_HASH, HASH, TRANSACTIONS,
};
