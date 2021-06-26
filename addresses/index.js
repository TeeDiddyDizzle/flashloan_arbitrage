const kyberMainnet = require('./kyber-mainnet.json');
const uniswapMainnet = require('./uniswap-mainnet.json');
const pancakeswapv1Mainnet = require('./pancakeswapv1-mainnet.json')
const pancakeswapv2Mainnet = require('./pancakeswapv2-mainnet.json')
const bakeryswapMainnet = require('./pancakeswapv1-mainnet.json')
const dydxMainnet = require('./dydx-mainnet.json');
const tokensMainnet = require('./tokens-mainnet.json');

module.exports = {
  mainnet: {
    kyber: kyberMainnet,
    pancakeswapv1: pancakeswapv1Mainnet,
    pancakeswapv2: pancakeswapv2Mainnet,
    bakeryswap: bakeryswapMainnet,
    tokens: tokensMainnet
  }
};
