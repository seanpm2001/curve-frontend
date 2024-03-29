import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { FormStatus, FormValues, SearchParams, SortKey } from '@/components/PagePoolList/types'
import type { FilterKey, Order } from '@/components/PagePoolList/types'

import Fuse from 'fuse.js'
import chunk from 'lodash/chunk'
import cloneDeep from 'lodash/cloneDeep'
import differenceWith from 'lodash/differenceWith'
import endsWith from 'lodash/endsWith'
import orderBy from 'lodash/orderBy'
import uniqBy from 'lodash/uniqBy'

import { isStartPartOrEnd, parsedSearchTextToList } from '@/components/PagePoolList/utils'
import api from '@/lib/curvejs'
import networks from '@/networks'

type StateKey = keyof typeof DEFAULT_STATE

export const DEFAULT_FORM_VALUES: FormValues = {
  searchTextByTokensAndAddresses: {},
  searchTextByOther: {},
  hideSmallPools: true,
  hideZero: true,
}

export const DEFAULT_SEARCH_PARAMS: SearchParams = {
  filterKey: 'all',
  hideSmallPools: true,
  searchText: '',
  sortBy: 'volume',
  sortByOrder: 'desc',
}

export const DEFAULT_FORM_STATUS: FormStatus = {
  error: '',
  isLoading: true,
  noResult: false,
}

type SliceState = {
  activeKey: string
  formValues: FormValues
  formStatus: { [activeKey: string]: FormStatus }
  result: { [activeKey: string]: string[] }
  resultRewardsCrvCount: number
  resultRewardsOtherCount: number
  showHideSmallPools: boolean
}

// prettier-ignore
export type PoolListSlice = {
  poolList: SliceState & {
    filterSmallTvl(curve: CurveApi, poolData: PoolData[]): PoolData[]
    filterByKey(curve: CurveApi, key: FilterKey, poolDatas: PoolData[]): PoolData[]
    filterBySearchText(curve: CurveApi, searchText: string, poolDatas: PoolData[]): PoolData[]
    sortFn(curve: CurveApi, sortKey: SortKey, order: Order, poolDatas: PoolData[]): PoolData[]
    setFormValues(rChainId: ChainId, searchParams: SearchParams, curve: CurveApi | null, shouldRefetch?: boolean): Promise<void>

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  formValues: DEFAULT_FORM_VALUES,
  formStatus: {},
  result: {},
  resultRewardsCrvCount: 0,
  resultRewardsOtherCount: 0,
  showHideSmallPools: false,
}

const sliceKey = 'poolList'

const createPoolListSlice = (set: SetState<State>, get: GetState<State>): PoolListSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    filterSmallTvl: (curve, poolDatas) => {
      const { chainId } = curve
      const { hideSmallPoolsTvl } = networks[chainId]

      const tvlMapper = get().pools.tvlMapper[chainId] ?? {}

      return poolDatas.filter(({ pool }) => {
        return +(tvlMapper[pool.id]?.value || '0') > hideSmallPoolsTvl
      })
    },
    filterByKey: (curve, key, poolDatas) => {
      if (key === 'user') {
        const userActiveKey = api.helpers.getUserActiveKey(curve)
        const userPoolList = get().user.poolList[userActiveKey]
        return poolDatas.filter(({ pool }) => (userPoolList ?? {})[pool.id])
      } else if (key === 'btc' || key === 'crypto' || key === 'eth' || key === 'usd' || key === 'kava') {
        return poolDatas.filter(({ pool }) => pool.referenceAsset.toLowerCase() === key)
      } else if (key === 'crvusd') {
        return poolDatas.filter(({ pool }) => pool.id.startsWith('factory-crvusd'))
      } else if (key === 'tricrypto') {
        return poolDatas.filter(
          ({ pool }) => pool.id.startsWith('factory-tricrypto') || pool.id.startsWith('tricrypto')
        )
      } else if (key === 'stableng') {
        return poolDatas.filter(({ pool }) => pool.id.startsWith('factory-stable-ng'))
      } else if (key === 'others') {
        return poolDatas.filter(({ pool }) => {
          const referenceAsset = pool.referenceAsset.toLowerCase()
          return (
            referenceAsset === 'link' ||
            referenceAsset === 'eur' ||
            referenceAsset === 'xdai' ||
            referenceAsset === 'other'
          )
        })
      }
      return poolDatas
    },
    filterBySearchText: (curve, searchText, poolDatas) => {
      let parsedSearchText = searchText.toLowerCase().trim()

      let results: { searchTerm: string; results: PoolData[] } = {
        searchTerm: '',
        results: [],
      }

      const searchPoolByTokensAddressesResult = searchPoolByTokensAddresses(parsedSearchText, searchText, poolDatas)
      const searchPoolByOtherResult = searchPoolByOther(parsedSearchText, searchText, poolDatas)
      results.searchTerm = parsedSearchText
      results.results = uniqBy([...searchPoolByTokensAddressesResult, ...searchPoolByOtherResult], (r) => r.pool.id)

      get()[sliceKey].setStateByKey('formValues', {
        ...get()[sliceKey].formValues,
        searchTextByTokensAndAddresses: searchPoolByTokensAddressesResult.reduce((p, poolData) => {
          p[poolData.pool.address] = true
          return p
        }, {} as { [address: string]: boolean }),
        searchTextByOther: searchPoolByOtherResult.reduce((p, poolData) => {
          p[poolData.pool.address] = true
          return p
        }, {} as { [address: string]: boolean }),
      })

      if (results.searchTerm === parsedSearchText) {
        return results.results
      }
      return []
    },
    sortFn: (curve, sortKey, order, poolDatas) => {
      const { chainId } = curve

      if (poolDatas.length === 0) {
        return poolDatas
      } else if (sortKey === 'name') {
        return orderBy(poolDatas, ({ pool }) => pool.name.toLowerCase(), [order])
      } else if (sortKey === 'factory') {
        return orderBy(poolDatas, ({ pool }) => pool.isFactory, [order])
      } else if (sortKey === 'referenceAsset') {
        return orderBy(poolDatas, ({ pool }) => pool.referenceAsset.toLowerCase(), [order])
      } else if (sortKey.startsWith('rewards')) {
        const rewardsApyMapper = get().pools.rewardsApyMapper[chainId] ?? {}
        return orderBy(
          poolDatas,
          ({ pool }) => {
            const { base, crv = [], other = [] } = rewardsApyMapper[pool.id] ?? {}
            if (sortKey === 'rewardsBase') {
              return Number(base?.day ?? 0)
            } else if (sortKey === 'rewardsCrv') {
              // Replacing areCrvRewardsStuckInBridge or rewardsNeedNudging CRV with 0
              const showZero = pool?.gaugeStatus?.areCrvRewardsStuckInBridge || pool?.gaugeStatus?.rewardsNeedNudging
              return showZero ? 0 : Number(crv?.[0] ?? 0)
            } else if (sortKey === 'rewardsOther') {
              return other.length > 0 ? other.reduce((total, { apy }) => total + apy, 0) : 0
            }
          },
          [order]
        )
      } else if (sortKey === 'tvl') {
        const tvlMapper = get().pools.tvlMapper[chainId] ?? {}
        return orderBy(poolDatas, ({ pool }) => Number(tvlMapper[pool.id]?.value ?? 0), [order])
      } else if (sortKey === 'volume') {
        const volumeMapper = get().pools.volumeMapper[chainId] ?? {}
        return orderBy(poolDatas, ({ pool }) => Number(volumeMapper[pool.id]?.value ?? 0), [order])
      }
      return poolDatas
    },
    setFormValues: async (rChainId, searchParams, curve, shouldRefetch) => {
      // stored values
      const poolDatas = get().pools.pools[rChainId]

      const storedFormValues = get()[sliceKey].formValues

      // update form values
      const activeKey = _getActiveKey(rChainId, searchParams)
      let cFormValues = cloneDeep({
        ...storedFormValues,
        hideSmallPools: searchParams.hideSmallPools,
        searchTextByTokensAndAddresses: {},
        searchTextByOther: {},
      })
      get()[sliceKey].setStateByKey('formValues', cFormValues)

      if (!curve || typeof poolDatas === 'undefined') return

      // set loading state
      let formStatus: FormStatus = { ...DEFAULT_FORM_STATUS, isLoading: true }
      get()[sliceKey].setStateByActiveKey('formStatus', activeKey, cloneDeep(formStatus))

      const { hideSmallPools, searchText, filterKey, sortBy, sortByOrder } = searchParams

      let tablePoolDatas = cloneDeep(poolDatas)

      if (hideSmallPools) {
        await get().pools.fetchPoolsTvl(curve, poolDatas, shouldRefetch)
        tablePoolDatas = get()[sliceKey].filterSmallTvl(curve, tablePoolDatas)
      }

      // searchText
      if (searchText) {
        tablePoolDatas = get()[sliceKey].filterBySearchText(curve, searchText, tablePoolDatas)
      }

      // filter by 'all | usd | btc | etch...'
      if (filterKey) {
        if (filterKey === 'user') await get().user.fetchUserPoolList(curve, shouldRefetch)
        if (
          filterKey === 'all' ||
          filterKey === 'crypto' ||
          filterKey === 'tricrypto' ||
          filterKey === 'others' ||
          filterKey === 'stableng' ||
          filterKey === 'user'
        ) {
          tablePoolDatas = get()[sliceKey].filterByKey(curve, filterKey, tablePoolDatas)
        } else {
          tablePoolDatas = get()[sliceKey].filterBySearchText(curve, filterKey, tablePoolDatas)
        }
      }

      // sort by table labels 'pool | factory | type | rewards...'
      if (sortBy) {
        const fns: {
          keys: SortKey[]
          fn: ((curve: CurveApi, poolDatas: PoolData[], shouldRefetch?: boolean | undefined) => Promise<void>) | null
        }[] = [
          { keys: ['tvl'], fn: hideSmallPools ? null : get().pools.fetchPoolsTvl },
          { keys: ['volume'], fn: get().pools.fetchPoolsVolume },
          { keys: ['rewardsBase', 'rewardsCrv', 'rewardsOther'], fn: get().pools.fetchPoolsRewardsApy },
        ]
        const initialFnIdx = fns.findIndex(({ keys }) => keys.indexOf(sortBy) !== -1)
        if (initialFnIdx !== -1) {
          const { fn } = fns[initialFnIdx]
          if (fn !== null) {
            await fn(curve, tablePoolDatas, shouldRefetch)
            tablePoolDatas = get()[sliceKey].sortFn(curve, sortBy, sortByOrder, tablePoolDatas)
          }
        }

        // fetch rest of functions
        fns.splice(initialFnIdx, 1)
        Promise.all([fns.map(({ fn }) => (fn !== null ? fn(curve, tablePoolDatas, shouldRefetch) : () => {}))])
      }

      // get pool ids
      const result: string[] = []
      const hidePoolsMapper = networks[rChainId].customPoolIds

      for (const idx in tablePoolDatas) {
        const poolData = tablePoolDatas[idx]
        if (!hidePoolsMapper[poolData.pool.id]) {
          result.push(poolData.pool.id)
        }
      }

      // set result
      get()[sliceKey].setStateByActiveKey('result', activeKey, result)

      // set status
      formStatus.isLoading = false
      formStatus.noResult = result.length === 0
      get()[sliceKey].setStateByActiveKey('formStatus', activeKey, formStatus)

      // update cache
      if (activeKey.endsWith('-all-true-volume-desc-')) {
        get().storeCache.setStateByActiveKey('poolListResult', activeKey, result)
      }
    },

    // slice helpers
    setStateByActiveKey: <T>(key: StateKey, activeKey: string, value: T) => {
      if (Object.keys(get()[sliceKey][key]).length > 30) {
        get().setAppStateByKey(sliceKey, key, { [activeKey]: value })
      } else {
        get().setAppStateByActiveKey(sliceKey, key, activeKey, value)
      }
    },
    setStateByKey: <T>(key: StateKey, value: T) => {
      get().setAppStateByKey(sliceKey, key, value)
    },
    setStateByKeys: (sliceState: Partial<SliceState>) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, cloneDeep(DEFAULT_STATE))
    },
  },
})

export function _getActiveKey(chainId: ChainId, searchParams: SearchParams) {
  const { filterKey, hideSmallPools, searchText, sortBy, sortByOrder } = searchParams
  let parsedSearchText = searchText
  if (searchText && searchText.length > 20) {
    parsedSearchText = chunk(searchText, 5)
      .map((group) => group[0])
      .join('')
  }
  return `${chainId}-${filterKey}-${hideSmallPools}-${sortBy}-${sortByOrder}-${parsedSearchText}`
}

// search by tokens or token addresses
function searchPoolByTokensAddresses(parsedSearchText: string, searchText: string, poolDatas: PoolData[]) {
  const searchTextByList = parsedSearchTextToList(parsedSearchText)

  return poolDatas.filter((p) => {
    return (
      differenceWith(searchTextByList, p.tokensLowercase, (parsedSearchText, token) =>
        isStartPartOrEnd(parsedSearchText, token)
      ).length === 0 ||
      differenceWith(searchTextByList, p.tokenAddresses, (parsedSearchText, tokenAddress) =>
        isStartPartOrEnd(parsedSearchText, tokenAddress)
      ).length === 0
    )
  })
}

// search by pool name, address, lpToken and gauge
function searchPoolByOther(parsedSearchText: string, searchText: string, poolDatas: PoolData[]) {
  const fuse = new Fuse<PoolData>(poolDatas, {
    ignoreLocation: true,
    threshold: 0.01,
    keys: ['pool.address', 'pool.name', 'pool.gauge', 'pool.lpToken'],
  })
  const result = fuse.search(parsedSearchText)
  let filteredByOther = result.map((r) => r.item)

  if (result.length === 0) {
    filteredByOther = poolDatas.filter((item) => {
      const haveMatchedPoolAddress = endsWith(item.pool.address, parsedSearchText)
      const haveMatchedTokenAddress = item.tokenAddresses.some((tokenAddress) => endsWith(tokenAddress, searchText))
      return haveMatchedPoolAddress || haveMatchedTokenAddress
    })

    if (filteredByOther.length === 0) {
      // increase threshold to allow more results
      const fuse = new Fuse<PoolData>(poolDatas, {
        ignoreLocation: true,
        threshold: 0.08,
        findAllMatches: true,
        useExtendedSearch: true,
        keys: ['pool.name', 'tokensAll'],
      })

      let extendedSearchText = ''
      const parsedSearchTextSplit = parsedSearchText.split(' ')
      for (const idx in parsedSearchTextSplit) {
        const word = parsedSearchTextSplit[idx]
        extendedSearchText = `${extendedSearchText} '${word}`
      }
      const result = fuse.search(extendedSearchText)
      if (result.length > 0) {
        filteredByOther = result.map((r) => r.item)
      }
    }
  }
  return filteredByOther
}

export default createPoolListSlice
