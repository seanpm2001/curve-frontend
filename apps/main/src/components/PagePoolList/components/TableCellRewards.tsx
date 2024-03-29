import type { ChipProps } from '@/ui/Typography/types'

import styled from 'styled-components'

import useStore from '@/store/useStore'

import PoolRewardsCrv from '@/components/PoolRewardsCrv'
import TableCellRewardsBase from '@/components/PagePoolList/components/TableCellRewardsBase'
import TableCellRewardsGauge from '@/components/PagePoolList/components/TableCellRewardsGauge'
import TableCellRewardsOthers from '@/components/PagePoolList/components/TableCellRewardsOthers'

const TCellRewards = ({
  rChainId,
  rPoolId,
  isHighlightBase,
  isHighlightCrv,
  isHighlightOther,
  searchText,
  ...rest
}: ChipProps & {
  rChainId: ChainId
  rPoolId: string
  isHighlightCrv: boolean
  isHighlightBase: boolean
  isHighlightOther: boolean
  searchText: string
}) => {
  const isMdUp = useStore((state) => state.isMdUp)
  const isXSmDown = useStore((state) => state.isXSmDown)
  const poolData = useStore((state) => state.pools.poolsMapper[rChainId]?.[rPoolId])
  const rewardsApy = useStore((state) => state.pools.rewardsApyMapper[rChainId]?.[rPoolId])

  if (typeof rewardsApy === 'undefined') {
    return <>-</>
  } else {
    return (
      <div>
        {!isXSmDown && !isMdUp && (
          <TableCellRewardsBase {...rest} isHighlight={isHighlightBase} rChainId={rChainId} rPoolId={rPoolId} />
        )}
        <Wrapper>
          <PoolRewardsCrv {...rest} isHighlight={isHighlightCrv} rChainId={rChainId} rPoolId={rPoolId} />
          <TableCellRewardsOthers {...rest} isHighlight={isHighlightOther} rChainId={rChainId} rPoolId={rPoolId} />
        </Wrapper>
        <TableCellRewardsGauge gauge={poolData?.pool?.gauge} searchText={searchText} />
      </div>
    )
  }
}

const Wrapper = styled.div`
  line-height: 1.2;
`

export default TCellRewards
