const WsServer = require('../src/ws/server');
const Blockchain = require('../src/models/chain');
const Miner = require('../src/models/miner');
const Generator = require('../src/utils/key-generator');

describe('Test Miner class', () => {
    const TEST_PUB_KEY = Generator.generateKeyPair().publicKey;
    const TEST_PUB_KEY_S = Generator.generateKeyPair().publicKey;
    const blockchain = new Blockchain();
    blockchain.getCoins(TEST_PUB_KEY_S, TEST_PUB_KEY);

    it('mine block', () => {
        const wsServer = new WsServer(blockchain);
        const miner = new Miner(blockchain, wsServer);
        blockchain.addTransaction(TEST_PUB_KEY, 'to', 1);
        miner.mine('mine address');

        expect(blockchain.pendingTransactions.length).toEqual(0);
        expect(blockchain.chain.length).toEqual(2);
        expect(blockchain.isValidChain()).toEqual(true);
    });
});
