import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { FormValues } from '@/components/PageIntegrations/types'
import type { FormStatus, IntegrationApp, IntegrationsTags } from '@/ui/Integration/types'

import cloneDeep from 'lodash/cloneDeep'
import produce from 'immer'
import sortBy from 'lodash/sortBy'

import { fulfilledValue, httpFetcher } from '@/utils/helpers'
import {
  filterByKey,
  filterByNetwork,
  filterBySearchText,
  parseIntegrationsList,
  parseIntegrationsTags,
} from '@/ui/Integration'
import networks from '@/networks'

type StateKey = keyof typeof DEFAULT_STATE

export const DEFAULT_FORM_VALUES: FormValues = {
  filterKey: 'all',
  searchText: '',
}

export const DEFAULT_FORM_STATUS: FormStatus = {
  isLoading: false,
  noResult: false,
}

type SliceState = {
  formStatus: FormStatus
  formValues: FormValues
  integrationsList: IntegrationApp[] | null
  integrationsTags: IntegrationsTags | null
  results: IntegrationApp[] | null
}

const sliceKey = 'integrations'

export type IntegrationsSlice = {
  [sliceKey]: SliceState & {
    init(chainId: ChainId | ''): Promise<void>
    setFormValues(updatedFormValues: FormValues, chainId: ChainId | ''): void

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  formStatus: DEFAULT_FORM_STATUS,
  formValues: DEFAULT_FORM_VALUES,
  integrationsList: null,
  integrationsTags: null,
  results: null,
}

const createIntegrationsSlice = (set: SetState<State>, get: GetState<State>): IntegrationsSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    init: async (chainId: ChainId) => {
      const { integrationsTags, integrationsList, ...sliceState } = get()[sliceKey]
      const parsedChainId = chainId || 1
      const { listUrl, tagsUrl } = networks[parsedChainId].integrations

      if (integrationsList === null) {
        const [integrationsListResult] = await Promise.allSettled([httpFetcher(listUrl)])
        const integrationsList = fulfilledValue(integrationsListResult) ?? []
        sliceState.setStateByKey('integrationsList', parseIntegrationsList(integrationsList, 'crvusd'))
      }

      if (integrationsTags === null) {
        const [integrationsTagsResult] = await Promise.allSettled([httpFetcher(tagsUrl)])
        let integrationsTags = fulfilledValue(integrationsTagsResult) ?? []
        sliceState.setStateByKey('integrationsTags', parseIntegrationsTags(integrationsTags))
      }
    },
    setFormValues: (updatedFormValues: FormValues, chainId: ChainId | '') => {
      const { integrationsTags, integrationsList, ...sliceState } = get()[sliceKey]
      const { searchText, filterKey } = updatedFormValues

      // loading
      sliceState.setStateByKeys({
        formStatus: { ...DEFAULT_FORM_STATUS, isLoading: true },
        formValues: updatedFormValues,
        results: [],
      })

      if (integrationsList) {
        let results = cloneDeep(integrationsList)

        if (chainId) {
          results = filterByNetwork(networks[chainId]?.id, results)
        }

        if (searchText) {
          results = filterBySearchText(searchText, results)
        }

        if (filterKey) {
          results = filterByKey(filterKey, results)
        }

        sliceState.setStateByKeys({
          formStatus: { ...DEFAULT_FORM_STATUS, noResult: results.length === 0 },
          results: sortBy(results, (r) => r.name),
        })
      }
    },

    // slice helpers
    setStateByActiveKey: <T>(key: StateKey, activeKey: string, value: T) => {
      get().setAppStateByActiveKey(sliceKey, key, activeKey, value)
    },
    setStateByKey: <T>(key: StateKey, value: T) => {
      get().setAppStateByKey(sliceKey, key, value)
    },
    setStateByKeys: <T>(sliceState: Partial<SliceState>) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      set(
        produce((state: State) => {
          state[sliceKey] = { ...state[sliceKey], ...DEFAULT_STATE }
        })
      )
    },
  },
})

export default createIntegrationsSlice
