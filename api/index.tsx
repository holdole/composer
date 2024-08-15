import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/vercel'

// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }

export const app = new Frog({
  assetsPath: '/',
  basePath: '/frame',
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

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
