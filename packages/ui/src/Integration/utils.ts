import type { AppName, FilterKey, IntegrationApp, IntegrationAppResp, IntegrationsTags } from 'ui/src/Integration/types'

import Fuse from 'fuse.js'
import sortBy from 'lodash/sortBy'

const excludeTags = ['lend', 'crvusd']

export function parseIntegrationsTags(integrationsTags: { id: string; displayName: string }[]) {
  const parsedIntegrationsTags: IntegrationsTags = {}
  const INTEGRATIONS_TAGS_COLORS = ['#F60000', '#FF8C00', '#FFEE00', '#4DE94C', '#3783FF', '#4815AA', '#ee82ee']

  if (Array.isArray(integrationsTags)) {
    for (const idx in integrationsTags) {
      const t = integrationsTags[idx]
      if (excludeTags.indexOf(t.id) === -1) {
        const color = t.id === 'all' ? '' : INTEGRATIONS_TAGS_COLORS[+idx - 1]
        parsedIntegrationsTags[t.id] = { ...t, color }

        if (t.id !== 'all' && color === '') {
          console.warn(`missing integrations tag color for ${t.id}`)
        }
      }
    }
  }

  return parsedIntegrationsTags
}

export function parseIntegrationsList(integrationsList: IntegrationAppResp[], appName: AppName) {
  const parsedIntegrationsList: IntegrationApp[] = []

  if (Array.isArray(integrationsList)) {
    for (const { networks, tags, ...rest } of integrationsList) {
      // include all integration if tags contains 'lend'
      if (!appName || tags.indexOf(appName) !== -1) {
        const parsedNetworks: { [network: string]: boolean } = {}
        for (const n of networks) {
          parsedNetworks[n] = true
        }

        const parsedTags: { [tag: string]: boolean } = {}
        for (const n of tags) {
          if (excludeTags.indexOf(n) === -1) {
            parsedTags[n] = true
          }
        }
        parsedIntegrationsList.push({ ...rest, networks: parsedNetworks, tags: parsedTags })
      }
    }
  }

  return sortBy(parsedIntegrationsList, (a) => a.name)
}

export function filterByNetwork(networkId: string, integrationApps: IntegrationApp[]) {
  return networkId ? integrationApps.filter(({ networks }) => networks[networkId]) : integrationApps
}

export function filterBySearchText(searchText: string, integrationApps: IntegrationApp[]) {
  const fuse = new Fuse<IntegrationApp>(integrationApps, {
    ignoreLocation: true,
    threshold: 0.01,
    keys: [{ name: 'name', getFn: (a) => a.name }],
  })
  return fuse.search(searchText).map((r) => r.item)
}

export function filterByKey(filterKey: FilterKey, integrationApps: IntegrationApp[]) {
  return filterKey !== 'all' ? integrationApps.filter(({ tags }) => tags[filterKey]) : integrationApps
}
