import type { TableRowProps } from '@/components/PagePoolList/types'

import { useRef } from 'react'
import styled from 'styled-components'

import useIntersectionObserver from '@/ui/hooks/useIntersectionObserver'

import { cellWidths } from '@/components/PagePoolList/utils'
import { TCell } from '@/ui/Table'
import PoolLabel from '@/components/PoolLabel'
import PoolRewardsCrv from '@/components/PoolRewardsCrv'
import TCellRewards from '@/components/PagePoolList/components/TableCellRewards'
import TableCellVolume from '@/components/PagePoolList/components/TableCellVolume'
import TableCellTvl from '@/components/PagePoolList/components/TableCellTvl'
import TableCellInPool from '@/components/PagePoolList/components/TableCellInPool'
import TableCellRewardsBase from '@/components/PagePoolList/components/TableCellRewardsBase'
import TableCellRewardsGauge from '@/components/PagePoolList/components/TableCellRewardsGauge'
import TableCellRewardsOthers from '@/components/PagePoolList/components/TableCellRewardsOthers'

const TableRow = ({
  rChainId,
  formValues,
  imageBaseUrl,
  isInPool,
  isMdUp,
  poolId,
  poolData,
  poolDataCachedOrApi,
  searchParams,
  showInPoolColumn,
  handleCellClick,
}: TableRowProps & { isMdUp: boolean }) => {
  const ref = useRef<HTMLTableRowElement>(null)
  const entry = useIntersectionObserver(ref, { freezeOnceVisible: true })

  const { searchTextByTokensAndAddresses, searchTextByOther } = formValues
  const { searchText, sortBy } = searchParams
  const isVisible = !!entry?.isIntersecting

  const cellProps = {
    rChainId,
    rPoolId: poolId,
  }

  return (
    <Tr
      ref={ref}
      className={`border-bottom row--info ${isVisible ? '' : 'pending'}`}
      onClick={({ target }) => handleCellClick(target)}
    >
      {showInPoolColumn && (
        <TCell className={isInPool ? 'active' : ''} $center $noPadding {...cellWidths.wInPool}>
          {isInPool ? <TableCellInPool /> : null}
        </TCell>
      )}
      <TCell $paddingLeft>
        <PoolLabel
          {...cellProps}
          isVisible={isVisible}
          imageBaseUrl={imageBaseUrl}
          poolData={poolDataCachedOrApi}
          poolListProps={{
            searchText: searchText,
            searchTextByTokensAndAddresses,
            searchTextByOther,
            onClick: handleCellClick,
          }}
        />
      </TCell>
      {isMdUp ? (
        <>
          <TCell {...cellWidths.wRewardsBase} $right>
            <TableCellRewardsBase isHighlight={sortBy === 'rewardsBase'} {...cellProps} />
          </TCell>
          <TCell {...cellWidths.wRewardsAll} $right>
            <PoolRewardsCrv isHighlight={sortBy === 'rewardsCrv'} {...cellProps} />
            <TableCellRewardsOthers isHighlight={sortBy === 'rewardsOther'} {...cellProps} />
            <TableCellRewardsGauge gauge={poolData?.pool?.gauge} searchText={searchText} />
          </TCell>
        </>
      ) : (
        <TCell {...cellWidths.wRewardsAll} $right>
          <TCellRewards
            {...cellProps}
            isHighlightBase={sortBy === 'rewardsBase'}
            isHighlightCrv={sortBy === 'rewardsCrv'}
            isHighlightOther={sortBy === 'rewardsOther'}
            searchText={Object.keys(searchTextByOther).length > 0 ? searchText : ''}
          />
        </TCell>
      )}
      <TCell {...cellWidths.wVolume} $right $isBold={sortBy === 'volume'}>
        <TableCellVolume noStyles {...cellProps} />
      </TCell>
      <TCell {...cellWidths.wTvl} $paddingRight $right $isBold={sortBy === 'tvl'}>
        <TableCellTvl noStyles {...cellProps} />
      </TCell>
    </Tr>
  )
}

export const TCellInPool = styled.td`
  &.active {
    color: var(--box--primary--color);
    background-color: var(--table_detail_row--active--background-color);
  }
`

export const Tr = styled.tr`
  &.pending {
    height: 3.25rem;
  }

  :hover {
    background-color: var(--table_row--hover--color);
  }
`

export default TableRow
