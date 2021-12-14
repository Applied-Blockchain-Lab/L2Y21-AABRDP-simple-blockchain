const server = require('../app');
const axios = require('axios');
const jestOpenAPI = require('jest-openapi').default;
const Generator = require('../src/utils/key-generator');
const swaggerDocument = require('../openapi/openapi.json');
jestOpenAPI(swaggerDocument);

const TEST_PUB_KEY = Generator.generateKeyPair().publicKey;
const TEST_PUB_KEY2 = Generator.generateKeyPair().publicKey;
describe('GET /', () => {
    it('should satisfy OpenAPI spec', async () => {
     
      
      const res = await axios.get('http://localhost:1337/');
      expect(res.status).toEqual(200);
      expect(res.data).toEqual("Welcome to AABRDP-simple-blockchain!");
      
    });
  });

  describe('GET /chain', () => {
    it('should satisfy OpenAPI spec', async () => {
     
      
      const res = await axios.get('http://localhost:1337/chain');
      expect(res.status).toEqual(200);
      expect(res).toSatisfyApiSpec();
    });
  });

  describe('GET /generate', () => {
    it('should satisfy OpenAPI spec', async () => {
     
      
      const res = await axios.get('http://localhost:1337/generate');
      expect(res.status).toEqual(200);
      expect(res).toSatisfyApiSpec();
   
    });
  });
  describe('GET /blocks/latest', () => {
    it('should satisfy OpenAPI spec', async () => {
     
      
      const res = await axios.get('http://localhost:1337/blocks/latest');
      expect(res.status).toEqual(200);
      expect(res).toSatisfyApiSpec();
    });
  });
  describe('GET /transactions', () => {
    it('should satisfy OpenAPI spec', async () => {
     
      
      const res = await axios.get('http://localhost:1337/transactions');
      expect(res.status).toEqual(200);
      expect(res).toSatisfyApiSpec();
    });
  });
  describe('GET /address/balance/:address', () => {
    it('should satisfy OpenAPI spec', async () => {
     
      
      const res = await axios.get(`http://localhost:1337/address/balance/${TEST_PUB_KEY}`);
      expect(res.status).toEqual(200);
      expect(res).toSatisfyApiSpec();
    });
  });
  describe('POST /addtransaction', () => {
    it('should satisfy OpenAPI spec', async () => {
       
      
      const res = await axios.post('http://localhost:1337/addtransaction',{fromAddress:TEST_PUB_KEY,toAddress:TEST_PUB_KEY2,amount:5});
      expect(res.status).toEqual(200);
      expect(res).toSatisfyApiSpec();
    });
  });
  describe('POST /minetransactions', () => {
    it('should satisfy OpenAPI spec', async () => {
      
      const res = await axios.post('http://localhost:1337/minetransactions',{mineraddress:TEST_PUB_KEY});
      expect(res.status).toEqual(200);
      expect(res).toSatisfyApiSpec();
    });
  });

  describe('POST /getcoins', () => {
    it('should satisfy OpenAPI spec', async () => {
     
      
      const res = await axios.post('http://localhost:1337/getcoins',{toAddress:TEST_PUB_KEY2});
      expect(res.status).toEqual(200);
      expect(res).toSatisfyApiSpec();
    });
  });

  
