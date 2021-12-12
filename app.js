const express = require('express');
const routes = require('./routes/routes');
const Blockchain = require('./models/chain');

const { HTTP_PORT } = require('./config/ports-folders');

const app = express();

const chain = new Blockchain();

app.use(routes);
app.listen(HTTP_PORT, () => {
    console.log(`HTTP server listening at http://localhost:${HTTP_PORT}`);
});

exports.chain = chain;
