const Blockchain = require('../src/models/chain');
const Block = require('../src/models/block');
const Generator = require('../src/utils/key-generator');

describe('Test Chain class', () => {
    let blockchain;
    let bc;
    const TEST_PUB_KEY = Generator.generateKeyPair().publicKey;
    const TEST_PUB_KEY_S = Generator.generateKeyPair().publicKey;
    const TEST_PUB_KEY_T = Generator.generateKeyPair().publicKey;

    beforeEach(() => {
        blockchain = new Blockchain();
        bc = new Blockchain();
        blockchain.getCoins(TEST_PUB_KEY, TEST_PUB_KEY_S); // 100 coins
        blockchain.getCoins(TEST_PUB_KEY_T, TEST_PUB_KEY); // 100 coins
        blockchain.getCoins(TEST_PUB_KEY_T, TEST_PUB_KEY); // 100 coins
        blockchain.addBlock();
    });

    it('Blockchain start with genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesisBlock());
    });

    it('catch missing fromAddress in file', () => {
        blockchain.addTransaction('xxxxx', TEST_PUB_KEY_S, 1);

        expect(blockchain.pendingTransactions.length).toEqual(0);
    });

    it('catch missing parameters when call addTransaction function', () => {
        blockchain.addTransaction('', '', 1);

        expect(blockchain.pendingTransactions.length).toEqual(0);
    });

    it('add transaction to pendingTransactions', () => {
        blockchain.addTransaction(TEST_PUB_KEY, 'to', 1);

        expect(blockchain.pendingTransactions[blockchain.pendingTransactions.length - 1].fromAddress).toEqual(TEST_PUB_KEY);
        expect(blockchain.pendingTransactions[blockchain.pendingTransactions.length - 1].toAddress).toEqual('to');
        expect(blockchain.pendingTransactions[blockchain.pendingTransactions.length - 1].amount).toEqual(1);
        expect(blockchain.pendingTransactions[blockchain.pendingTransactions.length - 1].signature).toBeDefined();
        expect(blockchain.pendingTransactions[blockchain.pendingTransactions.length - 1].hash).toBeDefined();
        expect(blockchain.pendingTransactions.length).toEqual(1);
    });

    it('do not add transaction when fromAddress balance is not enough', () => {
        blockchain.addTransaction(TEST_PUB_KEY, 'to', 101);

        expect(blockchain.pendingTransactions.length).toEqual(0);
    });

    it('add block to blockchain', () => {
        blockchain.addTransaction(TEST_PUB_KEY, 'to', 1);
        blockchain.addTransaction(TEST_PUB_KEY, 'to1', 1);
        blockchain.addTransaction(TEST_PUB_KEY, 'to2', 1);
        blockchain.addBlock();

        expect(blockchain.chain[blockchain.chain.length - 1].transactions.length).toEqual(3);
    });

    it('do not add more than `BLOCK_SIZE` transactions in block', () => {
        blockchain.addTransaction(TEST_PUB_KEY, 'to', 1);
        blockchain.addTransaction(TEST_PUB_KEY, 'to1', 1);
        blockchain.addTransaction(TEST_PUB_KEY, 'to2', 1);
        blockchain.addTransaction(TEST_PUB_KEY, 'to2', 1);
        blockchain.addBlock();

        expect(blockchain.chain[blockchain.chain.length - 1].transactions.length).toEqual(3);
        expect(blockchain.pendingTransactions.length).toEqual(1);
    });

    it('do not add block with <=1 transactions', () => {
        blockchain.addBlock();

        expect(blockchain.chain.length).toEqual(2);
    });

    it('get balance of address', () => {
        blockchain.addTransaction(TEST_PUB_KEY, TEST_PUB_KEY_S, 20);
        blockchain.addTransaction(TEST_PUB_KEY, TEST_PUB_KEY_S, 20);
        blockchain.addBlock();

        expect(blockchain.getBalanceOfAddress(TEST_PUB_KEY)).toEqual(60);
    });

    it('validate valid chain', () => {
        blockchain.addTransaction(TEST_PUB_KEY, TEST_PUB_KEY_S, 1);
        blockchain.addTransaction(TEST_PUB_KEY, TEST_PUB_KEY_S, 1);
        blockchain.addBlock();

        expect(blockchain.isValidChain(blockchain.chain)).toBe(true);
    });

    it('change block data = invalid chain', () => {
        blockchain.addTransaction(TEST_PUB_KEY, 'to', 1);
        blockchain.addTransaction(TEST_PUB_KEY, 'to1', 1);
        blockchain.addBlock();
        blockchain.chain[1].transactions[0] = ['corrupt data'];

        expect(blockchain.isValidChain(blockchain.chain)).toBe(false);
    });

    it('previous block hash is invalid = invalid chain', () => {
        blockchain.addTransaction(TEST_PUB_KEY, 'to', 1);
        blockchain.addTransaction(TEST_PUB_KEY, 'to1', 1);
        blockchain.addTransaction(TEST_PUB_KEY, 'to', 1);
        blockchain.addTransaction(TEST_PUB_KEY, 'to1', 1);
        blockchain.addTransaction(TEST_PUB_KEY, 'to', 1);
        blockchain.addBlock();
        blockchain.addBlock();
        blockchain.chain[2].parentHash = '111-111';

        expect(blockchain.isValidChain(blockchain.chain)).toBe(false);
    });

    it('replace chain with valid chain = successfully', () => {
        bc.replaceChain(blockchain.chain);

        expect(bc.chain).toEqual(blockchain.chain);
    });

    it('replace chain with a shorter one  = unsuccessful', () => {
        blockchain.replaceChain(bc.chain);

        expect(blockchain.chain).not.toEqual(bc.chain);
    });

    it('clear pendingTransactions', () => {
        blockchain.addTransaction(TEST_PUB_KEY, 'to', 1);
        blockchain.clearPendingTransactions();

        expect(blockchain.pendingTransactions.length).toEqual(0);
    });
});
