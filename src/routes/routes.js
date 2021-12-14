const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const { generateKeyPair } = require('../utils/key-generator');

const swaggerDocument = YAML.load(path.join(__dirname, '../../openapi/openapi.yaml'));
const app = require('../../app');

const router = express.Router();

router.use(bodyParser.json());
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
    app.blockchain.getCoins(req.body.toAddress,req.body.toAddress);
    res.json('100 coins will be added to your address after new block is mined!');
});

module.exports = router;
