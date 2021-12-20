const Transaction = require('../src/models/transaction');
const { REWARD_TX } = require('./network-parameters');

const TIMESTAMP = '0000';
const PARENT_HASH = '0000';
const HASH = '111-111';

const TRANSACTIONS = [new Transaction(REWARD_TX, '04c2007692c390c25640e4eb6e2b9ab35c5ce3c3cae756b3ed88e0e183e8fa5bdd5bd978399af3a8b78856c9e12febc3d64969e27867648733637772712a3ea37e', 100, 0)];

module.exports = {
    TIMESTAMP, PARENT_HASH, HASH, TRANSACTIONS,
};
