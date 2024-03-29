import type { Order, PoolListTableLabel, SearchParams, SortKey, TheadBtnProps } from '@/components/PagePoolList/types'

import React from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { cellWidths } from '@/components/PagePoolList/utils'

import { Thead, TCell, TheadSortButton, Tr } from '@/ui/Table'
import Box from '@/ui/Box'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'
import TableHeadRewards from '@/components/PagePoolList/components/TableHeadRewards'

const TableHead = ({
  isLoading,
  isMdUp,
  searchParams,
  showInPoolColumn,
  tableLabels,
  updatePath,
}: {
  isLoading: boolean
  isMdUp: boolean
  searchParams: SearchParams
  showInPoolColumn: boolean
  tableLabels: PoolListTableLabel
  updatePath(searchParams: Partial<SearchParams>): void
}) => {
  const handleBtnClickSort = (sortBy: string, sortByOrder: Order) => {
    updatePath({ sortBy: sortBy as SortKey, sortByOrder })
  }

  const props: TheadBtnProps = {
    indicatorPlacement: 'left',
    sortBy: searchParams.sortBy,
    sortByOrder: searchParams.sortByOrder,
    handleBtnClickSort,
  }

  return (
    <Thead>
      <Tr>
        {showInPoolColumn && <TCell as="th" className={`in-pool`} {...cellWidths.wInPool} $noPadding></TCell>}

        <TCell as="th" $left {...(showInPoolColumn ? {} : { $paddingLeft: true })}>
          <StyledTheadSortButton
            className="left"
            sortIdKey="name"
            {...props}
            loading={false}
            indicatorPlacement="right"
          >
            {tableLabels.name.name}
          </StyledTheadSortButton>
        </TCell>
        {isMdUp ? (
          <>
            <TCell as="th" $right {...cellWidths.wRewardsBase}>
              <Box>
                <StyledTheadSortButton className="right" sortIdKey="rewardsBase" {...props} loading={isLoading}>
                  {tableLabels.rewardsBase.name}
                  <IconTooltip placement="top">{t`Variable APY based on today's trading activity`}</IconTooltip>
                </StyledTheadSortButton>
              </Box>
            </TCell>
            <TCell as="th" $right {...cellWidths.wRewardsAll}>
              <TableHeadRewards isLoading={isLoading} tableLabels={tableLabels} {...props} />
            </TCell>
          </>
        ) : (
          <TCell as="th" $right {...cellWidths.wRewardsAll}>
            <StyledTheadSortButton className="right" sortIdKey="rewardsBase" {...props} loading={isLoading}>
              {tableLabels.rewardsBase.name}
              <IconTooltip placement="top">{t`Variable APY based on today's trading activity`}</IconTooltip>
            </StyledTheadSortButton>
            <Box margin="var(--spacing-1) 0 0 0">
              <TableHeadRewards isLoading={isLoading} tableLabels={tableLabels} {...props} />
            </Box>
          </TCell>
        )}
        <TCell as="th" $right {...cellWidths.wVolume}>
          <StyledTheadSortButton className="right" sortIdKey="volume" {...props} loading={isLoading}>
            {tableLabels.volume.name}
          </StyledTheadSortButton>
        </TCell>
        <TCell as="th" $right {...cellWidths.wTvl}>
          <StyledTheadSortButton
            className="right"
            sortIdKey="tvl"
            {...props}
            loading={isLoading}
            indicatorPlacement="left"
          >
            {tableLabels.tvl.name}
          </StyledTheadSortButton>
        </TCell>
      </Tr>
    </Thead>
  )
}

export const StyledTheadSortButton = styled(TheadSortButton)`
  width: 100%;
`

export default TableHead
