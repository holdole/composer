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
        <Button.Transaction target={targetUrl}>
          Buy
        </Button.Transaction>,
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



// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
