const express = require('express');
const bodyParser = require('body-parser');
const app = require('../app');

const router = express.Router();
router.use(bodyParser.json());

router.get('/', (req, res) => {
    res.send('Welcome to AABRDP-simple-blockchain!');
});
router.get('/chain', (req, res) => {
    res.json(app.chain);
});

router.get('/blocks/latest', (req, res) => {
    res.json(app.chain.getLatestBlock());
});

router.get('/address/ballance/:address', (req, res) => {
    res.json(app.chain.getBalanceOfAddress(req.params.address));
});

router.get('/AddTransaction', (req, res) => {
    app.chain.addTransaction(req.body.fromAddress, req.body.toAddress, req.body.amount, req.body.myKeyForSign);
    console.log('New transaction!');
});

module.exports = router;
