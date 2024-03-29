import type { FilterKey, PagePoolList } from '@/components/PagePoolList/types'

import React, { useMemo, useRef } from 'react'
import { t } from '@lingui/macro'
import networks from '@/networks'
import styled from 'styled-components'

import { DEFAULT_FORM_STATUS } from '@/store/createPoolListSlice'
import { breakpoints } from '@/ui/utils'
import { useFocusRing } from '@react-aria/focus'
import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import Checkbox from '@/ui/Checkbox'
import DialogSortDesktop from '@/components/PagePoolList/components/DialogSort/DialogSortDesktop'
import DialogSortMobile from '@/components/PagePoolList/components/DialogSort/DialogSortMobile'
import SearchInput from '@/ui/SearchInput'
import TableButtonFilters from '@/ui/TableButtonFilters'
import TableButtonFiltersMobile from '@/ui/TableButtonFiltersMobile'

const TableSettings = ({
  rChainId,
  activeKey,
  curve,
  result,
  searchParams,
  tableLabels,
  updatePath,
}: PagePoolList & { activeKey: string; result: string[] | undefined }) => {
  const settingsRef = useRef<HTMLDivElement>(null)
  const { isFocusVisible, focusProps } = useFocusRing()

  const formStatus = useStore((state) => state.poolList.formStatus[activeKey] ?? DEFAULT_FORM_STATUS)
  const poolDataMapperCached = useStore((state) => state.storeCache.poolsMapper[rChainId])
  const poolDatas = useStore((state) => state.pools.pools[rChainId])
  const isXSmDown = useStore((state) => state.isXSmDown)

  const { signerAddress } = curve ?? {}

  const parsedFilters = useMemo(() => {
    const list = [
      { key: 'all', label: t`ALL` },
      { key: 'usd', label: 'USD' },
      { key: 'btc', label: 'BTC' },
      { key: 'kava', label: 'KAVA' },
      { key: 'eth', label: 'ETH' },
      { key: 'crvusd', label: t`crvUSD` },
      { key: 'tricrypto', label: t`Tricrypto` },
      { key: 'crypto', label: t`Crypto` },
      { key: 'stableng', label: t`Stable NG` },
      { key: 'user', label: t`My Pools` },
    ]

    return _parsedFilterList(list, networks[rChainId].poolFilters, signerAddress)
  }, [rChainId, signerAddress])

  const poolDatasCached = Object.values(poolDataMapperCached ?? {})
  const poolDatasCachedOrApi = poolDatas ?? poolDatasCached
  const poolDatasLength = (poolDatasCachedOrApi ?? []).length

  return (
    <>
      <SearchWrapper>
        <SearchInput
          id="inpSearchPool"
          placeholder={t`Search by pool name, pool address, token name or token address`}
          className={isFocusVisible ? 'focus-visible' : ''}
          {...focusProps}
          value={searchParams.searchText}
          handleInputChange={(val) => updatePath({ searchText: val })}
          handleSearchClose={() => updatePath({ searchText: '' })}
        />
      </SearchWrapper>
      <Box ref={settingsRef} grid gridRowGap={2}>
        <TableFilterSettings>
          {!isXSmDown && parsedFilters && (
            <TableButtonFilters
              disabled={false}
              filters={parsedFilters}
              filterKey={searchParams.filterKey}
              isLoading={formStatus.isLoading}
              resultsLength={result?.length}
              updateRouteFilterKey={(filterKey) => updatePath({ filterKey: filterKey as FilterKey })}
            />
          )}
          <Box>
            <Box flex gridColumnGap={2}>
              {!isXSmDown && (
                <DialogSortDesktop searchParams={searchParams} tableLabels={tableLabels} updatePath={updatePath} />
              )}
              {networks[rChainId].showHideSmallPoolsCheckbox ||
              (typeof poolDatasCachedOrApi !== 'undefined' && poolDatasLength > 10) ? (
                <Checkbox
                  isDisabled={searchParams.filterKey === 'user'}
                  isSelected={searchParams.filterKey === 'user' ? false : searchParams.hideSmallPools}
                  onChange={(val) => updatePath({ hideSmallPools: val })}
                >
                  {t`Hide very small pools`}
                </Checkbox>
              ) : null}
            </Box>
            {isXSmDown && parsedFilters && (
              <Box flex gridColumnGap={2} margin="1rem 0 0 0.25rem">
                <TableButtonFiltersMobile
                  filters={parsedFilters}
                  filterKey={searchParams.filterKey}
                  updateRouteFilterKey={(filterKey) => updatePath({ filterKey: filterKey as FilterKey })}
                />
                <DialogSortMobile searchParams={searchParams} tableLabels={tableLabels} updatePath={updatePath} />
              </Box>
            )}
          </Box>
        </TableFilterSettings>
      </Box>
    </>
  )
}

const SearchWrapper = styled(Box)`
  display: grid;
  margin: 1rem 1rem 0 1rem;
  padding-top: 1rem;
  height: var(--header-height);

  background-color: var(--box--secondary--background-color);

  grid-template-columns: 1fr;
`

const TableFilterSettings = styled(Box)`
  align-items: flex-start;
  display: grid;
  margin: 1rem;
  grid-row-gap: var(--spacing-2);

  @media (min-width: ${breakpoints.lg}rem) {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
`

function _parsedFilterList(
  list: { key: string; label: string }[],
  poolFilters: string[],
  signerAddress: string | undefined
) {
  let parsed: { [key: string]: { id: string; displayName: string } } = {}

  list
    .filter(({ key }) => {
      if (key === 'user' && !signerAddress) return false
      return poolFilters.indexOf(key) !== -1
    })
    .forEach(({ key, label }) => {
      parsed[key] = { id: key, displayName: label }
    })

  return parsed
}

export default TableSettings
