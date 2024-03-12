export const ASSETS_BASE_PATH = 'https://cdn.jsdelivr.net/gh/curvefi/curve-assets'
export const INVALID_ADDRESS = '0x0000000000000000000000000000000000000000'
export const LARGE_APY = 5000000

export const MAIN_ROUTE = {
  PAGE_MARKETS: '/markets',
  PAGE_RISK_DISCLAIMER: '/risk-disclaimer',
  PAGE_INTEGRATIONS: '/integrations',
}

export const ROUTE = {
  ...MAIN_ROUTE,
  PAGE_CREATE: '/create',
  PAGE_MANAGE: '/manage',
  PAGE_VAULT: '/vault',
  PAGE_404: '/404',
}

export const REFRESH_INTERVAL = {
  '3s': 3000,
  '1m': 60000,
  '5m': 300000,
  '11m': 660000,
}

const CURVE_FI_MAIN = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://curve.fi'

export const CURVE_FI_ROUTE = {
  MAIN: CURVE_FI_MAIN,
  CRVUSD_POOLS: `${CURVE_FI_MAIN}/#/ethereum/pools?filter=crvusd`,
}

export const CONNECT_STAGE = {
  CONNECT_API: 'api',
  CONNECT_WALLET: 'connect-wallet',
  DISCONNECT_WALLET: 'disconnect-wallet',
  SWITCH_NETWORK: 'switch-network',
} as const
