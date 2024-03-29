import type { SearchParams } from '@/components/PagePoolList/types'
import useStore from '@/store/useStore'

import React from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { DEFAULT_SEARCH_PARAMS } from '@/store/createPoolListSlice'
import Button from '@/ui/Button'
import ExternalLink from '@/ui/Link/ExternalLink'

const TableRowNoResults = ({
  searchParams,
  updatePath,
}: {
  searchParams: SearchParams
  updatePath(updatedSearchParams: Partial<SearchParams>): void
}) => {
  const userPoolListLoaded = useStore((state) => state.user.poolListLoaded)
  const userPoolListError = useStore((state) => state.user.poolListError)

  return (
    <tr>
      <TableRowNotFound colSpan={12}>
        {searchParams.filterKey === 'user' && userPoolListLoaded && !!userPoolListError ? (
          <>{t`Sorry, we are unable to load your pools.`}</>
        ) : searchParams.searchText.length > 0 ? (
          searchParams.filterKey === 'all' ? (
            <>
              {t`Didn't find what you're looking for?`}{' '}
              <ExternalLink $noStyles href="https://t.me/curvefi">
                {t`Join the Telegram`}
              </ExternalLink>
            </>
          ) : (
            <>
              {t`No pool found for "${searchParams.searchText}". Feel free to search other tabs, or`}{' '}
              <Button variant="text" onClick={() => updatePath(DEFAULT_SEARCH_PARAMS)}>
                {t`view all pools.`}
              </Button>
            </>
          )
        ) : (
          <>{t`No pool found in this category`}</>
        )}
      </TableRowNotFound>
    </tr>
  )
}

const TableRowNotFound = styled.td`
  padding: var(--spacing-5);
  text-align: center;
`

export default TableRowNoResults
