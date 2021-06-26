const ethers = require('ethers');
const Web3 = require('web3');
require("dotenv").config();
const pcsv2 = require('@pancakeswap/sdk'); //Pancakeswap V2
const pcsv1 = require('@pancakeswap-libs/sdk'); //Pancakeswap V1
const bakeryswap = require('@noqcks/bakeryswap-sdk-v2'); //Bakeryswap
// const {ChainId, Token, TokenAmount, Fetcher, Pair, Route, Trade, TradeType, Percent} = require('@pancakeswap-libs/sdk'); //Pancakeswap V1
// const {ChainId, Token, TokenAmount, Fetcher, Pair, Route, Trade, TradeType, Percent} = require('@pancakeswap/sdk'); //Pancakeswap V2
// const {ChainId, Token, TokenAmount, Fetcher, Pair, Route, Trade, TradeType, Percent} = require('@noqcks/bakeryswap-sdk-v2'); //Bakeryswap

// const {JsonRpcProvider, WebSocketProvider} = require("@ethersproject/providers");
const abis = require('./abis')
const { mainnet: addresses } = require('./addresses')

// const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed1.binance.org/');
// const provider = new ethers.providers.JsonRpcProvider(process.env.QUICKNODE_HTTP);
const provider = new ethers.providers.WebSocketProvider(process.env.QUICKNODE_WSS);
// const provider = new Web3.providers.WebsocketProvider(process.env.QUICKNODE_WSS);

// const web3 = new Web3('wss://apis.ankr.com/wss/c40792ffe3514537be9fb4109b32d257/946dd909d324e5a6caa2b72ba75c5799/binance/full/main');

const web3 = new Web3(
    new Web3.providers.WebsocketProvider(process.env.QUICKNODE_WSS)
);

const InputTokenAddr = web3.utils.toChecksumAddress(addresses.tokens.bscusd);
// var BUSD = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';

const OutputTokenAddr = web3.utils.toChecksumAddress(addresses.tokens.wbnb);
// var WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';

const PANCAKE_ROUTER = "0x10ed43c718714eb63d5aa57b78b54704e256024e";
// const PANCAKE_ROUTER_V2 = '0x10ed43c718714eb63d5aa57b78b54704e256024e';

// const PANCAKE_ROUTER_V1 = '0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F';

// 1/1000 = 0.001

const AMOUNT_BNB = 50;
const RECENT_BNB_PRICE = 300;
const AMOUNT_BNB_WEI = web3.utils.toWei(AMOUNT_BNB.toString());
const AMOUNT_BUSD_WEI = web3.utils.toWei((AMOUNT_BNB * RECENT_BNB_PRICE).toString());


const init = async () => {
	const [PCSV2_INPUT_TOKEN, PCSV2_OUTPUT_TOKEN] = await Promise.all(
		[InputTokenAddr, OutputTokenAddr].map(tokenAddress => (
			new pcsv2.Token(
				pcsv2.ChainId.MAINNET,
				tokenAddress,
				18
			)
		)));
    const [PCSV1_INPUT_TOKEN, PCSV1_OUTPUT_TOKEN] = await Promise.all(
        [InputTokenAddr, OutputTokenAddr].map(tokenAddress => (
            new pcsv1.Token(
                pcsv1.ChainId.MAINNET,
                tokenAddress,
				18
            )
        )));
	const [BAKERYSWAP_INPUT_TOKEN, BAKERYSWAP_OUTPUT_TOKEN] = await Promise.all(
		[InputTokenAddr, OutputTokenAddr].map(tokenAddress => (
			new bakeryswap.Token(
				bakeryswap.ChainId.MAINNET,
				tokenAddress,
				18
			)
		)));

	// console.log(tokenAddress);

	web3.eth.subscribe('newBlockHeaders')
        .on('data', async block => {
            console.log(`\nBlock # ${block.number}`);
			const pcsv2Pair = await pcsv2.Fetcher.fetchPairData(PCSV2_INPUT_TOKEN, PCSV2_OUTPUT_TOKEN, provider);
			const pcsv1Pair = await pcsv1.Fetcher.fetchPairData(PCSV1_INPUT_TOKEN, PCSV1_OUTPUT_TOKEN, provider);
			const bakeryswapPair = await bakeryswap.Fetcher.fetchPairData(BAKERYSWAP_INPUT_TOKEN, BAKERYSWAP_OUTPUT_TOKEN, provider);

			const pcsv2Results = await Promise.all([
				pcsv2Pair.getOutputAmount(new pcsv2.TokenAmount(PCSV2_INPUT_TOKEN, AMOUNT_BUSD_WEI)),
				pcsv2Pair.getOutputAmount(new pcsv2.TokenAmount(PCSV2_OUTPUT_TOKEN, AMOUNT_BNB_WEI)),
			]);
			const pcsv1Results = await Promise.all([
				pcsv1Pair.getOutputAmount(new pcsv1.TokenAmount(PCSV1_INPUT_TOKEN, AMOUNT_BUSD_WEI)),
				pcsv1Pair.getOutputAmount(new pcsv1.TokenAmount(PCSV1_OUTPUT_TOKEN, AMOUNT_BNB_WEI)),
			]);
			const bakeryswapResults = await Promise.all([
				bakeryswapPair.getOutputAmount(new bakeryswap.TokenAmount(BAKERYSWAP_INPUT_TOKEN, AMOUNT_BUSD_WEI)),
				bakeryswapPair.getOutputAmount(new bakeryswap.TokenAmount(BAKERYSWAP_OUTPUT_TOKEN, AMOUNT_BNB_WEI)),
			]);

			const pcsv2Rates = {
				buy: parseFloat(AMOUNT_BUSD_WEI / (pcsv2Results[0][0].toExact() * 10 **18)),
				sell: parseFloat(pcsv2Results[1][0].toExact() / AMOUNT_BNB)
			};
			const pcsv1Rates = {
				buy: parseFloat(AMOUNT_BUSD_WEI / (pcsv1Results[0][0].toExact() * 10 **18)),
				sell: parseFloat(pcsv1Results[1][0].toExact() / AMOUNT_BNB)
			};
			const bakeryswapRates = {
				buy: parseFloat(AMOUNT_BUSD_WEI / (bakeryswapResults[0][0].toExact() * 10 **18)),
				sell: parseFloat(bakeryswapResults[1][0].toExact() / AMOUNT_BNB)
			};

			console.log("PCSv2 BNB/BUSD");
			console.log(pcsv2Rates);
			const pcsv2BNBPrice = (pcsv2Rates.buy + pcsv2Rates.sell) / 2;
			console.log("Average Price: " + pcsv2BNBPrice + "\n");

			console.log("PCSv1 BNB/BUSD");
			console.log(pcsv1Rates);
			const pcsv1BNBPrice = (pcsv1Rates.buy + pcsv1Rates.sell) / 2;
			console.log("Average Price: " + pcsv1BNBPrice + "\n");

			console.log("Bakeryswap BNB/BUSD");
			console.log(bakeryswapRates);
			const bakeryswapBNBPrice = (bakeryswapRates.buy + bakeryswapRates.sell) / 2;
			console.log("Average Price: " + bakeryswapBNBPrice + "\n");

			const gasPrice = await web3.eth.getGasPrice();
			// console.log("Gas Price: " + gasPrice);
			const txCost = 200000 * parseInt(gasPrice);
			// console.log("Transaction Cost: " + (txCost / 10 ** 18) + " BNB");
			// console.log("Amount to Borrow: " + (parseInt(AMOUNT_BNB_WEI) / 10 ** 18) + " BNB");
			const pcsv2_pcsv1_avg_price = (pcsv2BNBPrice + pcsv1BNBPrice) / 2;
			const pcsv2_bakery_avg_price = (pcsv2BNBPrice + bakeryswapBNBPrice) / 2;
			const pcsv1_bakery_avg_price = (pcsv1BNBPrice + bakeryswapBNBPrice) / 2;
			//buy on first sell on second
			const pcsv2_pcsv1_profit = (parseInt(AMOUNT_BNB_WEI) / 10 ** 18) * (pcsv1Rates.sell - pcsv2Rates.buy) - (txCost / 10 ** 18) * pcsv2_pcsv1_avg_price;
			const pcsv1_pcsv2_profit = (parseInt(AMOUNT_BNB_WEI) / 10 ** 18) * (pcsv2Rates.sell - pcsv1Rates.buy) - (txCost / 10 ** 18) * pcsv2_pcsv1_avg_price;

			const pcsv2_bakery_profit = (parseInt(AMOUNT_BNB_WEI) / 10 ** 18) * (bakeryswapRates.sell - pcsv2Rates.buy) - (txCost / 10 ** 18) * pcsv2_bakery_avg_price;
			const bakery_pcsv2_profit = (parseInt(AMOUNT_BNB_WEI) / 10 ** 18) * (pcsv2Rates.sell - bakeryswapRates.buy) - (txCost / 10 ** 18) * pcsv2_bakery_avg_price;

			const pcsv1_bakery_profit = (parseInt(AMOUNT_BNB_WEI) / 10 ** 18) * (bakeryswapRates.sell - pcsv1Rates.buy) - (txCost / 10 ** 18) * pcsv1_bakery_avg_price;
			const bakery_pcsv1_profit = (parseInt(AMOUNT_BNB_WEI) / 10 ** 18) * (pcsv1Rates.sell - bakeryswapRates.buy) - (txCost / 10 ** 18) * pcsv1_bakery_avg_price;
			const pcsv2_profit = (parseInt(AMOUNT_BNB_WEI) / 10 ** 18) * (pcsv2Rates.sell - pcsv2Rates.buy) - (txCost / 10 ** 18) * pcsv2BNBPrice;


			console.log("\nBuy on PCSv2, sell on PCSv1:" + pcsv2_pcsv1_profit);
			console.log("Buy on PCSv1, sell on PCSv2:" + pcsv1_pcsv2_profit);
			console.log("\nBuy on PCSv2, sell on Bakeryswap:" + pcsv2_bakery_profit);
			console.log("Buy on Bakeryswap, sell on PCSv2:" + bakery_pcsv2_profit);
			console.log("\nBuy on PCSv1, sell on Bakeryswap:" + pcsv1_bakery_profit);
			console.log("Buy on Bakeryswap, sell on PCSv1:" + bakery_pcsv1_profit);

			let profits = [];
			profits.push(pcsv2_pcsv1_profit);
			profits.push(pcsv1_pcsv2_profit);
			profits.push(pcsv2_bakery_profit);
			profits.push(bakery_pcsv2_profit);
			profits.push(pcsv1_bakery_profit);
			profits.push(bakery_pcsv1_profit);
			profits.push(pcsv2_profit);
			
			var greatestProfit = 0;
			var profitsIndex = -1;
			for (var i = 0; i < profits.length; i++) {
				if (profits[i] > greatestProfit) {
					greatestProfit=profits[i];
					profitsIndex = i
				}
			}
			if (profitsIndex > -1){
				if(profitsIndex = 0) {
					console.log(`Arb opportunnity: Buy BNB on PCSv2 at ${pcsv2Rates.buy} busd`);
					console.log(`Sell BNB on PCSv1 at ${pcsv1Rates.sell} busd`);
					console.log(`Expected profit: ${pcsv2_pcsv1_profit} busd`);
					process.exit(1);
				}
				if(profitsIndex = 1) {
					console.log(`Arb opportunnity: Buy BNB on PCSv1 at ${pcsv1Rates.buy} busd`);
					console.log(`Sell BNB on PCSv2 at ${pcsv2Rates.sell} busd`);
					console.log(`Expected profit: ${pcsv1_pcsv2_profit} busd`);
					process.exit(1);
				}
				if(profitsIndex = 2) {
					console.log(`Arb opportunnity: Buy BNB on PCSv2 at ${pcsv2Rates.buy} busd`);
					console.log(`Sell BNB on Bakeryswap at ${bakeryswapRates.sell} busd`);
					console.log(`Expected profit: ${pcsv2_bakery_profit} busd`);
					process.exit(1);
				}
				if(profitsIndex = 3) {
					console.log(`Arb opportunnity: Buy BNB on Bakeryswap at ${bakeryswapRates.buy} busd`);
					console.log(`Sell BNB on PCSv2 at ${pcsv2Rates.sell} busd`);
					console.log(`Expected profit: ${bakery_pcsv2_profit} busd`);
					process.exit(1);
				}
				if(profitsIndex = 4) {
					console.log(`Arb opportunnity: Buy BNB on PCSv1 at ${pcsv1Rates.buy} busd`);
					console.log(`Sell BNB on Bakeryswap at ${bakeryswapRates.sell} busd`);
					console.log(`Expected profit: ${pcsv1_bakery_profit} busd`);
					process.exit(1);
				}
				if(profitsIndex = 5) {
					console.log(`Arb opportunnity: Buy BNB on Bakeryswap at ${bakeryswapRates.buy} busd`);
					console.log(`Sell BNB on PCSv1 at ${pcsv1Rates.sell} busd`);
					console.log(`Expected profit: ${bakery_pcsv1_profit} busd`);
					process.exit(1);
				}
				if(profitsIndex = 6) {
					console.log(`Arb opportunnity: Buy BNB on PCSv2 at ${pcsv2Rates.buy} busd`);
					console.log(`Sell BNB on PCSv2 at ${pcsv2Rates.sell} busd`);
					console.log(`Expected profit: ${pcsv2_profit} busd`);
					process.exit(1);
				}
			}
			
        })
        .on('error', error => {
            console.log(error)
        });
}
init();