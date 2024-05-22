export type AppName = '' | 'lend' | 'crvusd'
export type IntegrationTag = { id: string; displayName: string; color: string }

export type FilterKey =
  | 'all'
  | 'automation'
  | 'bots'
  | 'defi'
  | 'gameNft'
  | 'learningData'
  | 'votingIncentives'
  | 'portfolio'
  | 'crvusd'
  | 'lend'
  | 'other'

export type IntegrationsTags = {
  [k: string]: IntegrationTag
}

export type IntegrationApp = {
  appUrl: string | null
  description: string
  imageId: string | null
  name: string
  networks: { [network: string]: boolean }
  tags: { [tag: string]: boolean }
  twitterUrl: string | null
}

export type IntegrationAppResp = {
  appUrl: string | null
  description: string
  imageId: string
  name: string
  networks: string[]
  tags: string[]
  twitterUrl: string | null
}

export type FormStatus = {
  isLoading: boolean
  noResult: boolean
}
