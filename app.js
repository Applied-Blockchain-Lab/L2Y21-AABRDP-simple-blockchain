const express = require('express');
const routes = require('./routes/routes.js');
const Blockchain = require('./models/chain.js');
const app = express();
const port = 8080; 


const chain = new Blockchain();
exports.chain = chain;


app.use(routes);
app.listen(port, () => {
  console.log("App listening at http://localhost:"+port);
});
