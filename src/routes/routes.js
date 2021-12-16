const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const { generateKeyPair } = require('../utils/key-generator');
const { PEERS } = require('../../config/ports-folders');

const swaggerDocument = YAML.load(path.join(__dirname, '../../openapi/openapi.yaml'));
const app = require('../../app');

const router = express.Router();

router.use('/api-docs', swaggerUi.serve);

router.get('/', (req, res) => {
    res.send('Welcome to AABRDP-simple-blockchain!');
});

router.get('/api-docs', swaggerUi.setup(swaggerDocument));

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

router.get('/blocks/id/:id', (req, res) => {
    if (+req.params.id <= app.blockchain.chain.length) {
        res.json(app.blockchain.chain[+req.params.id - 1]);
    } else {
        res.status(404);
        res.json(`There is no block with id: ${req.params.id}`);
    }
});

router.get('/blocks/hash/:hash', (req, res) => {
    let found = false;
    let foundBlock;
    app.blockchain.chain.forEach((block) => {
        if (block.hash === req.params.hash) {
            found = true;
            foundBlock = block;
        }
    });

    if (found) {
        res.json(foundBlock);
    } else {
        res.status(404);
        res.json(`There is no block with hash: ${req.params.hash}`);
    }
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

    if (block) {
        console.log(`New block added: ${block.toString()}`);
        res.redirect('/chain');
    } else {
        res.json('No pendingTransactions - cannot mine new block!');
    }
});

router.post('/getcoins', (req, res) => {
    const transaction = app.blockchain.getCoins(req.body.fromAddress, req.body.toAddress);
    app.wsServer.broadcastTransaction(transaction);
    res.json('100 coins will be added to your address after new block is mined!');
});

router.get('/peers', (req, res) => {
    if (PEERS.length === 0) {
        res.json('No peers');
    } else {
        res.json(PEERS);
    }
});

module.exports = router;
