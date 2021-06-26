require('dotenv').config();

const Web3 = require('web3');
const { ChainId, Token, TokenAmount, Pair } = require('@uniswap/sdk');
const abis = require('./abis')
const { mainnet: addresses } = require('./addresses')

const web3 = new Web3(
    new Web3.providers.WebsocketProvider(process.env.QUICKNODE_URL)
);

// const pancakeswapv2 = new web3.eth.Contract(
//     abis.pancakeswapv2.FACTORY_ADDRESS,
//     addresses.pancakeswapv2.FACTORY_ADDRESS
// );

web3.eth.subscribe('newBlockHeaders')
        .on('data', async block => {
            console.log(`Block # ${block.number}`);
            // const pcsResults = await Promise.all([
            //     pancakeswapv2
            //         .methods
            //         .getExpectedRate(
            //             addresses.tokens.busd,
            //             '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
            //             AMOUNT_BUSD_WEI
            //         )
            //         .call(),
            //     pancakeswapv2
            //         .methods
            //         .getExpectedRate(
            //             addresses.tokens.busd,
            //             '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
            //             AMOUNT_BNB_WEI
            //         )
            //         .call()
            // ]);
            // console.log(pcsResults);
            // const pcsResults = await Promise.all([
            //     busdWBNB.getOutputAmount(new TokenAmount(busd, AMOUNT_BUSD_WEI)),
            //     busdWBNB.getOutputAmount(new TokenAmount(wbnb, AMOUNT_BNB_WEI)),
            // ]);
            // console.log(pcsResults)
        })
        .on('error', error => {
            console.log(error)
        });

// const AMOUNT_BNB = 100;
// const RECENT_BNB_PRICE = 300;
// const AMOUNT_BNB_WEI = web3.utils.toWei(AMOUNT_BNB.toString());
// const AMOUNT_BUSD_WEI = web3.utils.toWei((AMOUNT_BNB * RECENT_BNB_PRICE).toString());


// const init = async () => {
//     const [busd, wbnb] = await Promise.all(
//         [addresses.tokens.busd, addresses.tokens.wbnb].map(tokenAddress => (
//             Token.fetchData(
//                 ChainId.MAINNET,
//                 tokenAddress
//             )
//     )))

//     const busdWBNB = await Pair.fetchData(
//         busd,
//         wbnb
//     );
//     web3.eth.subscribe('newBlockHeaders')
//         .on('data', async block => {
//             console.log(`Block # ${block.number}`);
//             // const pcsResults = await Promise.all([
//             //     pancakeswapv2
//             //         .methods
//             //         .getExpectedRate(
//             //             addresses.tokens.busd,
//             //             '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
//             //             AMOUNT_BUSD_WEI
//             //         )
//             //         .call(),
//             //     pancakeswapv2
//             //         .methods
//             //         .getExpectedRate(
//             //             addresses.tokens.busd,
//             //             '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
//             //             AMOUNT_BNB_WEI
//             //         )
//             //         .call()
//             // ]);
//             // console.log(pcsResults);
//             // const pcsResults = await Promise.all([
//             //     busdWBNB.getOutputAmount(new TokenAmount(busd, AMOUNT_BUSD_WEI)),
//             //     busdWBNB.getOutputAmount(new TokenAmount(wbnb, AMOUNT_BNB_WEI)),
//             // ]);
//             console.log(pcsResults)
//         })
//         .on('error', error => {
//             console.log(error)
//         });
// }
// init();