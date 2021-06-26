const ethers = require('ethers');
require("dotenv").config();
// const {ChainId, Token, TokenAmount, Fetcher, Pair, Route, Trade, TradeType, Percent} = require('@pancakeswap-libs/sdk'); //Pancakeswap V1
// const {ChainId, Token, TokenAmount, Fetcher, Pair, Route, Trade, TradeType, Percent} = require('@pancakeswap/sdk'); //Pancakeswap V2
// const {ChainId, Token, TokenAmount, Fetcher, Pair, Route, Trade, TradeType, Percent} = require('@noqcks/bakeryswap-sdk-v2'); //Bakeryswap
const Web3 = require('web3');
const abis = require('./abis')
const { mainnet: addresses } = require('./addresses')

const provider = new ethers.providers.WebSocketProvider(process.env.QUICKNODE_WSS);

// const provider = new Web3.providers.WebsocketProvider(process.env.QUICKNODE_URL);

// const web3 = new Web3('wss://apis.ankr.com/wss/c40792ffe3514537be9fb4109b32d257/946dd909d324e5a6caa2b72ba75c5799/binance/full/main');
// const web3 = new Web3(process.env.QUICKNODE_URL);

const web3 = new Web3(
    new Web3.providers.WebsocketProvider(process.env.QUICKNODE_WSS)
);

const InputTokenAddr = web3.utils.toChecksumAddress(addresses.tokens.busd);
// var BUSD = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';

const OutputTokenAddr = web3.utils.toChecksumAddress(addresses.tokens.wbnb);
// var WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';

const PANCAKE_ROUTER = "0x10ed43c718714eb63d5aa57b78b54704e256024e";
// const PANCAKE_ROUTER_V2 = '0x10ed43c718714eb63d5aa57b78b54704e256024e';

// const PANCAKE_ROUTER_V1 = '0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F';

// 1/1000 = 0.001

const AMOUNT_BNB = 100;
const RECENT_BNB_PRICE = 300;
const AMOUNT_BNB_WEI = web3.utils.toWei(AMOUNT_BNB.toString());
const AMOUNT_BUSD_WEI = web3.utils.toWei((AMOUNT_BNB * RECENT_BNB_PRICE).toString());


const init = async () => {
    const [INPUT_TOKEN, OUTPUT_TOKEN] = await Promise.all(
        [InputTokenAddr, OutputTokenAddr].map(tokenAddress => (
            new Token(
                ChainId.MAINNET,
                tokenAddress,
				18
            )
        )));
	const pair = await Fetcher.fetchPairData(INPUT_TOKEN, OUTPUT_TOKEN, provider);

	// console.log(JSON.stringify(pair));

	web3.eth.subscribe('newBlockHeaders')
        .on('data', async block => {
            console.log(`Block # ${block.number}`);
			const pcsResults = await Promise.all([
				pair.getOutputAmount(new TokenAmount(INPUT_TOKEN, AMOUNT_BUSD_WEI)),
				pair.getOutputAmount(new TokenAmount(OUTPUT_TOKEN, AMOUNT_BNB_WEI)),
			]);
			const pcsRates = {
				buy: parseFloat(AMOUNT_BUSD_WEI / (pcsResults[0][0].toExact() * 10 **18)),
				sell: parseFloat(pcsResults[1][0].toExact() / AMOUNT_BNB)
			};
			console.log("PCS BNB/BUSD");
			console.log(pcsRates);
			// console.log(((pcsRates.buy + pcsRates.sell)) / 2);
        })
        .on('error', error => {
            console.log(error)
        });
}
init();