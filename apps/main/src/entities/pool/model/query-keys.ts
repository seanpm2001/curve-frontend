import { chainKeys } from '@/entities/chain'
import type { PoolQueryParams } from '@/entities/pool/types'

export const poolKeys = {
  root: ({ chainId, poolId }: PoolQueryParams) => [...chainKeys.root({ chainId }), 'pool', poolId] as const,
  lists: (params: PoolQueryParams) => [...poolKeys.root(params), 'list'] as const,
  list: (params: PoolQueryParams & { filters?: string }) => [...poolKeys.lists(params), params.filters] as const,
  liquidity: (params: PoolQueryParams) => [...poolKeys.root(params), 'totalLiquidity'] as const,
  volume: (params: PoolQueryParams) => [...poolKeys.root(params), 'volume'] as const,
} as const