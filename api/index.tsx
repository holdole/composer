import { Button, Frog,parseEther, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/vercel'
import BigNumber from 'bignumber.js';
import { http, createPublicClient, encodeAbiParameters } from 'viem'
import { mainnet,arbitrum, base, optimism } from 'viem/chains'
import {ethers} from 'ethers'

// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  imageAspectRatio:"1:1",
  verify: 'silent'
})

app.frame('/', (c) => {

  return c.res({
    image: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 64,
          gap: 48,
          backgroundColor: '#1e1e1e',
          color: '#FCFCFD',
          lineHeight: 1.2,
          fontSize: 50,
          width: '100%',
          height: '100%',
          fontFamily: 'inter',
        }}
      >  
        <span
          style={{
            fontSize: 40,
            fontFamily: 'gilroy',
            textAlign: 'center',
            lineHeight: 1,
          }}
        >Banyan</span> 
        <span
          style={{
            fontSize: 30,
            fontFamily: 'gilroy',
            textAlign: 'center',
            lineHeight: 1,
          }}
        >Seamlessly Engage in On-Chain Activities
        </span> 
        <span
          style={{
            fontSize: 30,
            fontFamily: 'gilroy',
            textAlign: 'center',
            lineHeight: 1,
            marginTop:'-20px'
          }}
        >within Social Media
        </span> 
      </div>
      ),
  })
})

app.frame('/finish', (c) => {
  return c.res({
    image: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 64,
          gap: 48,
          backgroundColor: '#1e1e1e',
          color: '#FCFCFD',
          lineHeight: 1.2,
          fontSize: 50,
          width: '100%',
          height: '100%',
          fontFamily: 'inter',
        }}
      >  
          <span
          style={{
            fontSize: 30,
            fontFamily: 'gilroy',
            textAlign: 'center',
            lineHeight: 1,
          }}
        >Your transaction is being processed.</span> 
      </div>
      ),
  })
})

app.frame('/swap/:network/:token', async (c) => {
  const { frameData, verified } = c

  const network = c.req.param('network');
  const token = c.req.param('token');

  const url = new URL(c.req.url);
  const referral = url.searchParams.get('referral');

  if (network == 'eth' || network == 'arbitrum' || network == 'optimism' ||network == 'base') {
    try {
      const url = `https://api.geckoterminal.com/api/v2/networks/${network}/tokens/${token}?x_cg_pro_api_key=CG-zuq9GEsGpeERifMpZwgmJ6d9`;
      const priceUrl = `https://api.geckoterminal.com/api/v2/networks/${network}/tokens/${token}/pools?page=1&x_cg_pro_api_key=CG-zuq9GEsGpeERifMpZwgmJ6d9	`;
      let tokenInfo
      let priceData

      try {
        let response, response1;
        
        [response, response1] = await Promise.all([
          fetch(url),
          fetch(priceUrl)
        ]);

        if (!response.ok && !response1.ok) {
          [response, response1] = await Promise.all([
            fetch(url),
            fetch(priceUrl)
          ]);
        }
      
        if (!response.ok) {
          response = await fetch(url);
        }
      
        if (!response1.ok) {
          response1 = await fetch(priceUrl);
        }

        if (!response.ok) {
          throw new Error('Response for url was not ok');
        }
        if (!response1.ok) {
          throw new Error('Response for priceUrl was not ok');
        }
      
        let result = await response.json();
        let result1 = await response1.json();
        console.log(result)
        tokenInfo = result.data;
        priceData = result1.data;
      } catch (error) {
        let response, response1;
        [response, response1] = await Promise.all([
          fetch(url),
          fetch(priceUrl)
        ]);

        let result = await response.json();
        let result1 = await response1.json();
        tokenInfo = result.data;
        priceData = result1.data;
      }
      
      const address = tokenInfo.attributes.address;
      const formattedAddress = `${address.slice(0, 6)}...${address.slice(-3)}`;
      let market_cap_usd
      let h24
      if (tokenInfo.attributes.market_cap_usd != null){
        market_cap_usd = formatMarketCap(tokenInfo.attributes.market_cap_usd)
      } else {
        market_cap_usd = null
      }
      if (tokenInfo.attributes.volume_usd.h24 != null){
        h24 = formatMarketCap(tokenInfo.attributes.volume_usd.h24)
      } else {
        h24 = null
      }
      let priceChange = priceData[0].attributes.price_change_percentage.h24
      const color = priceChange >= 0 ? 'green' : 'red';

      let dex
      if (priceData[0].attributes.name.includes('WETH')) {
        dex = priceData[0].relationships.dex.data.id
      } else {
        dex = '0x'
      }

      let buyTokenDecimals = tokenInfo.attributes.decimals
  
      let pool = priceData[0].attributes.address

      let targetUrl = `/tx?network=${network}&token=${token}&dex=${dex}&pool=${pool}&buyTokenDecimals=${buyTokenDecimals}`;
      if (referral) {
        targetUrl += `&referral=${referral}`;
      }

      let image_url
      if (tokenInfo.attributes.image_url == 'missing.png'){
        image_url = 'https://i.imgur.com/dAanHbf.png'
      } else {
        image_url = tokenInfo.attributes.image_url
      }

      let priceChangeData = priceData[0].attributes.price_change_percentage
      const dataPoints = Object.values(priceChangeData);
      const pathData = generatePath(dataPoints);

      const formattedTime = getFormattedUTCTime();
      return c.res({
        action: '/finish',
        image: (
          <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 64,
            gap: 48,
            backgroundColor: '#1e1e1e',
            color: '#FCFCFD',
            lineHeight: 1.2,
            fontSize: 50,
            width: '100%',
            height: '100%',
            fontFamily: 'inter',
          }}
        >

          <div style={{ width: '550px', height: '100px',marginTop: '-380px',backgroundColor: '#2e2e2e', borderRadius: '10px', padding: '20px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column'}}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <img src={image_url} alt="DEGEN Logo" width="50" height="50" style={{ marginRight: '10px', marginTop:'5px'}} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ margin: '0', fontSize: '25px', marginLeft: '10px' }}>{tokenInfo.attributes.symbol}</h2>
                <p style={{ margin: '0', fontSize: '16px', marginLeft: '10px' }}>{formattedAddress}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginLeft: '170px'}}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <p style={{ margin: '0', fontSize: '16px' }}>MKT Cap</p>
                  <p style={{ margin: '0', fontSize: '16px' }}>{market_cap_usd}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',marginLeft: '30px' }}>
                  <p style={{ margin: '0', fontSize: '16px' }}>24h Vol</p>
                  <p style={{ margin: '0', fontSize: '16px' }}>{h24}</p>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <h1 style={{ margin: '0', fontSize: '25px' }}>${formatPrice(tokenInfo.attributes.price_usd)}</h1>
              <p style={{ margin: '0', color: color, fontSize: '25px' }}>{priceChange}%(24h)</p>
            </div>

            <div style={{ display: 'flex', marginTop: '-185px' }}>
              <h1 style={{ margin: '0', fontSize: '20px', color:'#16a34a'}}>BANYAN</h1>
            </div>
            {/* <div style={{ display: 'flex', marginTop: '200px', }}>
              <svg width="500" height="250" style={{ background: '#1e1e1e' }}>
                <path d={pathData} stroke="cyan" fill="transparent" />
              </svg>
            </div> */}
            {/* <div style={{ display: 'flex', marginTop: '330px', alignItems: 'center' }}>
              <div style={{ margin: '0', fontSize: '16px', display: 'flex', alignItems: 'center' }}>
                {formattedTime}
              </div>
              <div style={{ margin: '0', fontSize: '16px', marginLeft: '120px', display: 'flex', alignItems: 'center' }}>
                0.5% Transaction Fee
              </div>
            </div> */}

          </div>
        </div>
      ),
      intents: [
        <TextInput placeholder="ETH amount (default 0.01)" />,
        <Button.Link href="https://warpcast.com/banyanplatform">
        Follow
        </Button.Link>,
        // <Button.Transaction target={targetUrl}>
        //   Buy
        // </Button.Transaction>,
      ],
    })
    } catch (error) {
      return c.res({
        image: (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 64,
              gap: 48,
              backgroundColor: '#1e1e1e',
              color: '#FCFCFD',
              lineHeight: 1.2,
              fontSize: 50,
              width: '100%',
              height: '100%',
              fontFamily: 'inter',
            }}
          >       
            <span
              style={{
                fontSize: 30,
                fontFamily: 'gilroy',
                textAlign: 'center',
                lineHeight: 1,
              }}
            >An error occurred, please try again.</span> 
          </div>
          ),
          intents: [
            <Button target={'c.req.path'}>
              Refresh
            </Button>,
          ],
      })
    }
  } else {
    return c.res({
      image: (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 64,
            gap: 48,
            backgroundColor: '#1e1e1e',
            color: '#FCFCFD',
            lineHeight: 1.2,
            fontSize: 50,
            width: '100%',
            height: '100%',
            fontFamily: 'inter',
          }}
        >       
          <span
            style={{
              fontSize: 30,
              fontFamily: 'gilroy',
              textAlign: 'center',
              lineHeight: 1,
            }}
          >Unsupported network.</span> 
        </div>
        ),
    })
  }
})


// app.transaction('/tx', async (c) => {
//     const network = c.req.query('network')
//     const token = c.req.query('token')
//     const dex = c.req.query('dex')
//     const pool = c.req.query('pool')
//     const buyTokenDecimals = c.req.query('buyTokenDecimals')
//     const referral = c.req.query('referral')
//     const value = c.inputText || '0.01'

//     let client
//     let networkId
//     let to
//     let weth
//     if (network == 'eth') {
//         client = createPublicClient({chain: mainnet,transport: http('https://eth-mainnet.g.alchemy.com/v2/oDUJSnHZHQEFozZpcApXB7-HYTYTj5Oq')})
//         networkId = 1
//         to = '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad'
//         weth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
//     } else if (network == 'arbitrum') {
//         client = createPublicClient({chain: arbitrum,transport: http('https://arb-mainnet.g.alchemy.com/v2/Gv1wv4KZ8mAp20pqDBlrb-zKkeoiTRlg')})
//         networkId = 42161
//         to = '0xeC8B0F7Ffe3ae75d7FfAb09429e3675bb63503e4'
//         weth = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
//     } else if (network == 'base') {
//         client = createPublicClient({chain: base,transport: http('https://base-mainnet.g.alchemy.com/v2/EalYhrth5Ae-l1rk0Alq4iewQLE9waxz')})
//         networkId = 8453
//         to = '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad'
//         weth = '0x4200000000000000000000000000000000000006'
//     } else if (network == 'optimism') {
//         client = createPublicClient({chain: optimism,transport: http('https://opt-mainnet.g.alchemy.com/v2/EalYhrth5Ae-l1rk0Alq4iewQLE9waxz')})
//         networkId = 10
//         to = '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad'
//         weth = '0x4200000000000000000000000000000000000006'
//     }
//     if (dex == 'uniswap_v2' || dex == 'uniswap-v2-base' || dex == 'uniswap-v2-arbitrum' || dex == 'uniswap_v2_optimism') {
//       let path = weth + ',' + token
//       let receiveAtLeast
//       if (network == 'eth') {
//         let price = await getUniswapV2Price(path, weth, token, value, '18', buyTokenDecimals)
//         let inputBuyValue = formatBuyValue(price);
//         receiveAtLeast = calculationReceiveAtLeast(inputBuyValue)
//       } else {
//         receiveAtLeast = 0
//       }
//       const { commands, inputs } = await encodeETHTransaction(value, receiveAtLeast, '18', buyTokenDecimals, token, dex, referral, path);

//       const deadline = Date.parse(new Date()) / 1000 + 600;
  
//       const options = {
//           parametersType: [ 
//             {name:'commands', type:'bytes'}, 
//             {name:'inputs', type:'bytes[]'}, 
//             {name:'deadline', type:'uint256'},
//           ],
//           parameters: [commands, inputs, deadline],
//           functionHash: '0x3593564c'
//       };

//       const data = await encodeFunctionData(options);
//       return c.send({
//         chainId: `eip155:${networkId}`,
//         to: to,
//         data: data,
//         value: parseEther(value)
//       })

//     } else if (dex == 'uniswap_v3' || dex == 'uniswap-v3-base' || dex == 'uniswap_v3_arbitrum' || dex == 'uniswap_v3_optimism') {
//       const pool_abi = [{"inputs":[],"name":"fee","outputs":[{"internalType":"uint24","name":"","type":"uint24"}],"stateMutability":"view","type":"function"}]
      
//       const fee = await client.readContract({
//         abi: pool_abi,
//         address: pool,
//         functionName: "fee",
//       })

//       const feeHex = fee.toString(16).padStart(6, '0');
//       let path = `0x${ weth.slice(2)}${feeHex}${token.slice(2)}`;

//       let receiveAtLeast
//       if (network == 'eth') {
//         let price = await getUniswapV3Price(fee, weth, token, value, 18, buyTokenDecimals)
//         let inputBuyValue = formatBuyValue(price);
//         receiveAtLeast = calculationReceiveAtLeast(inputBuyValue)
//       } else {
//         receiveAtLeast = 0
//       }
//       const { commands, inputs } = await encodeETHTransaction(value, receiveAtLeast, '18', buyTokenDecimals, token, dex, referral, path);

//       const deadline = Date.parse(new Date()) / 1000 + 600;
  
//       const options = {
//           parametersType: [ 
//             {name:'commands', type:'bytes'}, 
//             {name:'inputs', type:'bytes[]'}, 
//             {name:'deadline', type:'uint256'},
//           ],
//           parameters: [commands, inputs, deadline],
//           functionHash: '0x3593564c'
//       };
  
//       const data = await encodeFunctionData(options);
  
//       return c.send({
//         chainId: `eip155:${networkId}`,
//         to: to,
//         data: data,
//         value: parseEther(value)
//       })
      
//     } else {
//       let baseUrl
//       if (network == 'eth') {
//         baseUrl = `https://api.0x.org/swap/v1/quote?`
//       } else {
//         baseUrl = `https://${network}.api.0x.org/swap/v1/quote?`
//       }
//       const eth = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

//       let params
//       if (referral != undefined) {
//         params = new URLSearchParams({
//           buyToken: token,
//           sellToken: eth,
//           sellAmount: parseEther(value).toString(),
//           feeRecipient: referral,
//           buyTokenPercentageFee: '0.005',
//         }).toString()
//       } else {
//         params = new URLSearchParams({
//           buyToken: token,
//           sellToken: eth,
//           sellAmount: parseEther(value).toString(),
//           feeRecipient: '0x5580be4b0c3fd5d43a7c78e5050264a6b5167b6f',
//           buyTokenPercentageFee: '0.005',
//         }).toString()
//       }
    
//       const res = await fetch(baseUrl + params, {
//         headers: { '0x-api-key': '85b09240-ef30-482d-a222-24ea235ca579' },
//       })
//       const order = (await res.json())
//       return c.send({
//         chainId: `eip155:${(networkId)}`,
//         to: order.to,
//         data: order.data,
//         value: BigInt(order.value),
//       })
//     }
// })

// function generatePath(dataPoints) {
//   const width = 400;
//   const height = 200;
//   const maxValue = Math.max(...dataPoints);
//   const minValue = Math.min(...dataPoints);

//   const normalizedPoints = dataPoints.map(point => {
//     return height - ((point - minValue) / (maxValue - minValue) * height);
//   });

//   const step = width / (dataPoints.length - 1);
//   let path = `M 0 ${normalizedPoints[0]}`;

//   normalizedPoints.forEach((point, index) => {
//     if (index > 0) {
//       path += ` L ${index * step} ${point}`;
//     }
//   });
//   return path;
// };

// function getFormattedUTCTime() {
//   const now = new Date();
  
//   const year = now.getUTCFullYear();
//   const month = String(now.getUTCMonth() + 1).padStart(2, '0');
//   const day = String(now.getUTCDate()).padStart(2, '0');
  
//   const hours = String(now.getUTCHours()).padStart(2, '0');
//   const minutes = String(now.getUTCMinutes()).padStart(2, '0');
//   const seconds = String(now.getUTCSeconds()).padStart(2, '0');
  
//   return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
// }


// function formatPrice(price) {
//   if (price >= 1) {
//     return Number(price).toFixed(2);
//   } else {
//     const smallNumber = parseFloat(price).toPrecision(2);
//     return parseFloat(smallNumber).toString();
//   }
// }

// function formatMarketCap(value) {
//   if (value >= 1000000) {
//     return (value / 1000000).toFixed(2) + 'M';
//   } else if (value >= 1000) {
//     return (value / 1000).toFixed(2) + 'K';
//   } else if (value < 1000) {
//     return Number(value).toFixed(2)
//   } else {
//     return value.toString();
//   }
// }


// async function getUniswapV3Price(fee, sellToken, buyToken, inputSellValue, sellDecimals, buyDecimals) {
//   let client;
//   let quoterAddress = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'
//   client = createPublicClient({chain: mainnet,transport: http('https://eth-mainnet.g.alchemy.com/v2/oDUJSnHZHQEFozZpcApXB7-HYTYTj5Oq')})

//   const amountIn = ethers.utils.parseUnits(inputSellValue, sellDecimals);
//   let amountOut
//   const QuoterABI = [ { "inputs": [ { "internalType": "address", "name": "_factory", "type": "address" }, { "internalType": "address", "name": "_WETH9", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "WETH9", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "factory", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "bytes", "name": "path", "type": "bytes" }, { "internalType": "uint256", "name": "amountIn", "type": "uint256" } ], "name": "quoteExactInput", "outputs": [ { "internalType": "uint256", "name": "amountOut", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "tokenIn", "type": "address" }, { "internalType": "address", "name": "tokenOut", "type": "address" }, { "internalType": "uint24", "name": "fee", "type": "uint24" }, { "internalType": "uint256", "name": "amountIn", "type": "uint256" }, { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" } ], "name": "quoteExactInputSingle", "outputs": [ { "internalType": "uint256", "name": "amountOut", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "bytes", "name": "path", "type": "bytes" }, { "internalType": "uint256", "name": "amountOut", "type": "uint256" } ], "name": "quoteExactOutput", "outputs": [ { "internalType": "uint256", "name": "amountIn", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "tokenIn", "type": "address" }, { "internalType": "address", "name": "tokenOut", "type": "address" }, { "internalType": "uint24", "name": "fee", "type": "uint24" }, { "internalType": "uint256", "name": "amountOut", "type": "uint256" }, { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" } ], "name": "quoteExactOutputSingle", "outputs": [ { "internalType": "uint256", "name": "amountIn", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "int256", "name": "amount0Delta", "type": "int256" }, { "internalType": "int256", "name": "amount1Delta", "type": "int256" }, { "internalType": "bytes", "name": "path", "type": "bytes" } ], "name": "uniswapV3SwapCallback", "outputs": [], "stateMutability": "view", "type": "function" } ]
  
//   const quotePromises = await client.simulateContract({ 
//     abi: QuoterABI,
//     address: quoterAddress,
//     functionName: "quoteExactInputSingle",
//     args:[sellToken, buyToken, fee.toString(), amountIn, 0]
//   }).catch(() => {
//     return ethers.BigNumber.from(0);
//   })
//   amountOut = ethers.utils.formatUnits(quotePromises.result, buyDecimals);
//   return [amountOut];
// };



// async function getUniswapV2Price(path, sellToken, buyToken, inputSellValue, sellDecimals, buyDecimals) {
//   const UniswapV2Router02ABI = [{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"}]
//   const UniswapV2Router02Address = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

//   let client = createPublicClient({chain: mainnet,transport: http('https://eth-mainnet.g.alchemy.com/v2/oDUJSnHZHQEFozZpcApXB7-HYTYTj5Oq')})

//   path = path.split(',');

//   const amountIn = ethers.utils.parseUnits(
//     inputSellValue.toString(),
//     sellDecimals
//   );

//   let amountOut
//   if (path.length == 2) {
//     const quotedAmountOut = await client.readContract({
//       abi: UniswapV2Router02ABI,
//       address: UniswapV2Router02Address,
//       functionName: "getAmountsOut",
//       args:[amountIn, [sellToken, buyToken]]
//     }) 

//     amountOut = ethers.utils.formatUnits(quotedAmountOut[quotedAmountOut.length - 1].toString(), buyDecimals);
//   } else if (path.length == 3){
//     const quotedAmountOut = await client.readContract({
//       abi: UniswapV2Router02ABI,
//       address: UniswapV2Router02Address,
//       functionName: "getAmountsOut",
//       args:[amountIn, [path[0], path[1]]]
//     }) 

//     amountOut = await client.readContract({
//       abi: UniswapV2Router02ABI,
//       address: UniswapV2Router02Address,
//       functionName: "getAmountsOut",
//       args:[quotedAmountOut[quotedAmountOut.length - 1].toString(), [path[1], path[2]]]
//     }) 

//     amountOut = ethers.utils.formatUnits(amountOut[amountOut.length - 1].toString(), buyDecimals);
//   }
//   return [amountOut];
// };



// function formatBuyValue(number) {
//   const num = Number(number);
//   const integerPartLength = Math.floor(num).toString().length;
//   let decimalPlaces = 0;
//   if (integerPartLength > 10) {
//       return num.toExponential(2);
//   }
//   if (integerPartLength >= 6) {
//       decimalPlaces = 0;
//   } else if (integerPartLength === 5) {
//       decimalPlaces = 1;
//   } else if (integerPartLength === 4) {
//       decimalPlaces = 2;
//   } else if (integerPartLength === 3) {
//       decimalPlaces = 3;
//   } else if (integerPartLength === 2) {
//       decimalPlaces = 4;
//   } else {
//       decimalPlaces = 10;
//   }
//   let formattedAmount = num.toFixed(decimalPlaces)
//   formattedAmount = formattedAmount.replace(/(\.\d*?[1-9])0+$|\.0*$/, '$1');
//   formattedAmount = formattedAmount.toLocaleString('en-US');
//   if (isNaN(formattedAmount)) {
//       formattedAmount = '-'
//   }
//   return formattedAmount;
// }


// function calculationReceiveAtLeast(number) {
//   let receiveAtLeast = new BigNumber(number).multipliedBy(new BigNumber(100).minus(1).minus(0.5))
//   receiveAtLeast = receiveAtLeast / 100

//   return receiveAtLeast;
// }



// async function encodeETHTransaction(inputSellValue, receiveAtLeast, sellTokenDecimal, buyTokenDecimal,buyToken, dex, referral, path) {
//   let amountIn = calculateSmallestUnit(inputSellValue, sellTokenDecimal)
//   let amountOutmin = calculateSmallestUnit(receiveAtLeast, buyTokenDecimal)

//   let commands = '0x0b';
//   let inputs = []
//   const inputs1 = encodeAbiParameters(
//       [{name:'a', type:'address'}, {name:'b', type:'uint256'}],
//       // ['address','uint256'],
//       ["0x0000000000000000000000000000000000000002",ethers.utils.parseUnits(inputSellValue, 'ether')]
//   )

//   let inputs2
//   if (dex == 'uniswap_v2' || dex == 'uniswap-v2-base' || dex == 'uniswap-v2-arbitrum' || dex == 'uniswap_v2_optimism'){
//       inputs2 = encodeAbiParameters(
//           [{name:'a', type:'address'}, {name:'b', type:'uint256'} , {name:'c', type:'uint256'} , {name:'d', type:'address[]'} , {name:'e', type:'bool'}],
//           // ['address','uint256','uint256','address[]','bool'],
//           ["0x0000000000000000000000000000000000000002", amountIn, amountOutmin , path.split(','), false]
//       )
//       commands = commands + '08'
//   } else if (dex == 'uniswap_v3' || dex == 'uniswap-v3-base' || dex == 'uniswap_v3_arbitrum' || dex == 'uniswap_v3_optimism'){
//       inputs2 = encodeAbiParameters(
//           [{name:'a', type:'address'}, {name:'b', type:'uint256'} , {name:'c', type:'uint256'} , {name:'d', type:'bytes'} , {name:'e', type:'bool'}],
//           // ['address','uint256','uint256','bytes','bool'],
//           ["0x0000000000000000000000000000000000000002", amountIn, amountOutmin, path, false]
//       )
//       commands = commands + '00'
//   }

//   let inputs3
//   let inputs4
//   if (referral != undefined) {
//     inputs3 = encodeAbiParameters(
//         [{name:'a', type:'address'}, {name:'b', type:'address'} , {name:'c', type:'uint256'}],
//         // ['address','address','uint256'],
//         [buyToken, referral, '30']
//     )
//     commands = commands + '06'

//     inputs4 = encodeAbiParameters(
//         [{name:'a', type:'address'}, {name:'b', type:'address'} , {name:'c', type:'uint256'}],
//         // ['address','address','uint256'],
//         [buyToken, '0x5580be4b0c3fd5d43a7c78e5050264a6b5167b6f', '20']
//     )
//     commands = commands + '06'
//   } else {
//     inputs4 = encodeAbiParameters(
//         [{name:'a', type:'address'}, {name:'b', type:'address'} , {name:'c', type:'uint256'}],
//         // ['address','address','uint256'],
//         [buyToken, '0x5580be4b0c3fd5d43a7c78e5050264a6b5167b6f', '50']
//     )
//     commands = commands + '06'
//   }

//   const inputs5 = encodeAbiParameters(
//       [{name:'a', type:'address'}, {name:'b', type:'address'} , {name:'c', type:'uint256'}],
//       // ['address','address','uint256'],
//       [buyToken, "0x0000000000000000000000000000000000000001", amountOutmin] 
//   )
//   commands = commands + '04'

//   if (inputs3 === undefined || inputs3 === null) {
//     inputs.push(inputs1, inputs2, inputs4, inputs5);
//   } else {
//     inputs.push(inputs1, inputs2, inputs3, inputs4, inputs5);

//   }

//   return {commands, inputs};
// };

// function calculateSmallestUnit(amount, decimals){
//   BigNumber.config({ DECIMAL_PLACES: 0, ROUNDING_MODE: BigNumber.ROUND_DOWN });
//   return new BigNumber(amount).times(new BigNumber(10).pow(decimals)).toFixed(0);
// }

// function encodeFunctionData(options) {
//   const params = encodeAbiParameters(
//       options.parametersType,
//       options.parameters
//   );
//   const data = options.functionHash + params.slice(2);
//   return (data);
// }


// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
