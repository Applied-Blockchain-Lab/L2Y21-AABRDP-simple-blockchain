const express = require('express');
const bodyParser = require('body-parser');
const app = require('../app');

const { generateKeyPair } = require('../utils/key-generator');

const router = express.Router();

router.use(bodyParser.json());

router.get('/', (req, res) => {
    res.send('Welcome to AABRDP-simple-blockchain!');
});

router.get('/chain', (req, res) => {
    res.json(app.blockchain);
});

router.get('/generate', (req, res) => {
    const { privateKey, publicKey } = generateKeyPair();
    res.json({
        'Generated private key': privateKey,
        'Generated public key': publicKey,
    });
});

router.get('/blocks/latest', (req, res) => {
    res.json(app.blockchain.getLatestBlock());
});

router.get('/transactions', (req, res) => {
    res.json(app.blockchain.pendingTransactions);
});

router.get('/address/balance/:address', (req, res) => {
    res.json(app.blockchain.getBalanceOfAddress(req.params.address));
});

router.post('/addtransaction', (req, res) => {
    const transaction = app.blockchain.addTransaction(req.body.fromAddress, req.body.toAddress, req.body.amount);
    app.wsServer.broadcastTransaction(transaction);
    res.redirect('/transactions');
});

router.post('/minetransactions', (req, res) => {
    const block = app.miner.mine(req.body.mineraddress);
    console.log(`New block added: ${block.toString()}`);
    res.redirect('/chain');
});

module.exports = router;
