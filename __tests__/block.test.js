const Block = require('../src/models/block');
const { DIFFICULTY, CREATION_TIME } = require('../config/network-parameters');

describe('Test Block class', () => {
    let transactions;
    let lastBlock;
    let block;
    let genesis;

    beforeEach(() => {
        genesis = new Block('000000', '-', '111-111', 0, DIFFICULTY, []);
        transactions = ['tx1', 'tx2', 'tx3', 'tx4', 'tx5'];
        lastBlock = Block.genesisBlock();
        block = Block.mineBlock(lastBlock, transactions);
    });

    it('genesisBlock function return correct genesis block structure', () => {
        expect(lastBlock).toEqual(genesis);
    });
    it('sets the `transactions` to match the input after mineBlock function', () => {
        expect(block.transactions).toEqual(transactions);
    });

    it('sets the `lastHash` to match the hash of the last block after mineBlock function', () => {
        expect(block.parentHash).toEqual(lastBlock.hash);
    });

    it('generate a hash thath matches the difficulty', () => {
        expect(block.hash.substring(0, block.difficulty)).toEqual('0'.repeat(block.difficulty));
    });

    it('lowers the difficulty', () => {
        expect(Block.adjustDifficulty(block, block.timestamp + CREATION_TIME)).toEqual(block.difficulty - 1);
    });

    it('raises the difficulty', () => {
        expect(Block.adjustDifficulty(block, block.timestamp + CREATION_TIME - 1)).toEqual(block.difficulty + 1);
    });
});
