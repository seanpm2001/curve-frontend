import type { TableRowProps } from '@/components/PagePoolList/types'
import type { Theme } from '@/store/createGlobalSlice'

import { t } from '@lingui/macro'
import React, { useMemo, useRef } from 'react'

import useIntersectionObserver from '@/ui/hooks/useIntersectionObserver'

import { cellWidths } from '@/components/PagePoolList/utils'
import { Tr, TCellInPool } from '@/components/PagePoolList/components/TableRow'
import Button from '@/ui/Button'
import Icon from '@/ui/Icon'
import PoolLabel from '@/components/PoolLabel'
import TCellRewards from '@/components/PagePoolList/components/TableCellRewards'
import TableCellInPool from '@/components/PagePoolList/components/TableCellInPool'
import styled from 'styled-components'
import Box from '@/ui/Box'
import IconButton from '@/ui/IconButton'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'
import PoolRewardsCrv from '@/components/PoolRewardsCrv'
import TableCellVolume from '@/components/PagePoolList/components/TableCellVolume'
import TableCellTvl from '@/components/PagePoolList/components/TableCellTvl'
import TableCellRewardsBase from '@/components/PagePoolList/components/TableCellRewardsBase'
import TableCellRewardsOthers from '@/components/PagePoolList/components/TableCellRewardsOthers'

const TableRowMobile = ({
  rChainId,
  formValues,
  isInPool,
  imageBaseUrl,
  poolId,
  poolData,
  poolDataCachedOrApi,
  searchParams,
  showDetail,
  tableLabel,
  themeType,
  handleCellClick,
  setShowDetail,
}: TableRowProps & {
  showDetail: string
  themeType: Theme
  setShowDetail: React.Dispatch<React.SetStateAction<string>>
}) => {
  const ref = useRef<HTMLTableRowElement>(null)
  const entry = useIntersectionObserver(ref, { freezeOnceVisible: true })

  const { searchTextByTokensAndAddresses, searchTextByOther } = formValues
  const { searchText, sortBy } = searchParams
  const isVisible = !!entry?.isIntersecting
  const isShowDetail = showDetail === poolId

  const cellProps = {
    rChainId,
    rPoolId: poolId,
  }

  const quickViewValue = useMemo(() => {
    if (sortBy && !showDetail) {
      if (sortBy === 'rewardsBase') {
        return <TableCellRewardsBase isHighlight={sortBy === 'rewardsBase'} {...cellProps} />
      } else if (sortBy === 'rewardsCrv') {
        return <PoolRewardsCrv isHighlight={sortBy === 'rewardsCrv'} {...cellProps} />
      } else if (sortBy === 'rewardsOther') {
        return <TableCellRewardsOthers isHighlight={sortBy === 'rewardsOther'} {...cellProps} />
      } else if (sortBy === 'volume') {
        return <TableCellVolume isHighLight={sortBy === 'volume'} {...cellProps} />
      } else if (sortBy === 'tvl') {
        return <TableCellTvl isHighLight={sortBy === 'tvl'} {...cellProps} />
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDetail, sortBy])

  return (
    <Tr ref={ref} className={`border-bottom row--info ${isVisible ? '' : 'pending'}`}>
      <TCell>
        <MobileLabelWrapper flex>
          <TCellInPool as="div" className={`row-in-pool ${isInPool ? 'active' : ''} ${cellWidths.wInPool}`}>
            {isInPool ? <TableCellInPool /> : null}
          </TCellInPool>
          <MobileLabelContent>
            <PoolLabel
              rChainId={rChainId}
              isVisible={isVisible}
              imageBaseUrl={imageBaseUrl}
              poolData={poolDataCachedOrApi}
              poolListProps={{
                quickViewValue,
                searchText,
                searchTextByTokensAndAddresses,
                searchTextByOther,
                onClick: handleCellClick,
              }}
            />
            <IconButton
              onClick={() =>
                setShowDetail((prevState) => {
                  return prevState === poolId ? '' : poolId
                })
              }
            >
              {isShowDetail ? <Icon name="ChevronUp" size={16} /> : <Icon name="ChevronDown" size={16} />}
            </IconButton>
          </MobileLabelContent>
        </MobileLabelWrapper>

        <MobileTableContentWrapper className={isShowDetail ? 'show' : ''}>
          <MobileTableContent themeType={themeType}>
            {isShowDetail && (
              <>
                <div style={{ gridArea: 'grid-volume' }}>
                  <MobileTableTitle>{tableLabel.volume.name}</MobileTableTitle>
                  <TableCellVolume isHighLight={sortBy === 'volume'} {...cellProps} />
                </div>
                <div style={{ gridArea: 'grid-tvl' }}>
                  <MobileTableTitle>{tableLabel.tvl.name}</MobileTableTitle>
                  <TableCellTvl isHighLight={sortBy === 'tvl'} {...cellProps} />
                </div>
                <div style={{ gridArea: 'grid-rewards' }}>
                  <div>
                    <MobileTableTitle>{tableLabel.rewardsBase.name}</MobileTableTitle>
                    <TableCellRewardsBase isHighlight={sortBy === 'rewardsBase'} {...cellProps} />
                  </div>

                  {!poolData?.pool?.isGaugeKilled && (
                    <div>
                      <MobileTableTitle>
                        {t`Rewards tAPR`}{' '}
                        <IconTooltip
                          placement="top"
                          minWidth="200px"
                        >{t`Token APR based on current prices of tokens and reward rates`}</IconTooltip>
                        {tableLabel.rewardsCrv.name} + {tableLabel.rewardsOther.name}
                      </MobileTableTitle>
                      <TCellRewards
                        rChainId={rChainId}
                        rPoolId={poolId}
                        isHighlightBase={sortBy === 'rewardsBase'}
                        isHighlightCrv={sortBy === 'rewardsCrv'}
                        isHighlightOther={sortBy === 'rewardsOther'}
                        searchText={Object.keys(searchTextByOther).length > 0 ? searchText : ''}
                      />
                    </div>
                  )}
                </div>
                <MobileTableActions style={{ gridArea: 'grid-actions' }}>
                  <Button variant="filled" onClick={({ target }) => handleCellClick(target)}>
                    {t`Deposit`}
                  </Button>
                  <Button variant="filled" onClick={({ target }) => handleCellClick(target, 'withdraw')}>
                    {t`Withdraw`}
                  </Button>
                  <Button variant="filled" onClick={({ target }) => handleCellClick(target, 'swap')}>
                    {t`Swap`}
                  </Button>
                </MobileTableActions>
              </>
            )}
          </MobileTableContent>
        </MobileTableContentWrapper>
      </TCell>
    </Tr>
  )
}

TableRowMobile.defaultProps = {
  className: '',
}

const MobileLabelWrapper = styled(Box)`
  .row-in-pool {
    align-items: center;
    display: inline-flex;
    min-width: 1rem;
  }
`

const MobileLabelContent = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 4px;
  width: 100%;
`

const MobileTableTitle = styled.div`
  font-size: var(--font-size-2);
  font-weight: var(--table_head--font-weight);
`

const MobileTableContent = styled.div<{ themeType: Theme }>`
  display: grid;
  min-height: 150px;
  padding: ${({ themeType }) => (themeType === 'chad' ? '1rem 0.75rem 0.75rem' : '1rem 1rem 0.75rem 1rem')};

  grid-gap: var(--spacing-3);
  grid-template-areas:
    'grid-volume grid-tvl'
    'grid-rewards grid-rewards'
    'grid-actions grid-actions';
`

const MobileTableActions = styled.div`
  margin: 0.3rem 0;
  > button:not(:last-of-type) {
    border-right: 1px solid rgba(255, 255, 255, 0.25);
  }
`

const MobileTableContentWrapper = styled.div`
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.5s cubic-bezier(0, 1, 0, 1);

  &.show {
    max-height: 100rem;
    transition: max-height 1s ease-in-out;
  }
`

const TCell = styled.td`
  border-bottom: 1px solid var(--border-400);
`

export default TableRowMobile
