import type { ChipProps } from '@/ui/Typography/types'

import React from 'react'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import { Chip } from '@/ui/Typography'

const TableCellRewardsOthers = ({
  isHighlight,
  rChainId,
  rPoolId,
  ...rest
}: ChipProps & { isHighlight: boolean; rChainId: ChainId; rPoolId: string }) => {
  const rewardsApy = useStore((state) => state.pools.rewardsApyMapper[rChainId]?.[rPoolId])
  return (
    <div>
      {rewardsApy?.other?.map((o) => {
        return (
          <React.Fragment key={o.tokenAddress}>
            <Chip size="md" {...rest} isBold={isHighlight}>
              {formatNumber(o.apy, FORMAT_OPTIONS.PERCENT)} {o.symbol}
            </Chip>
            <br />
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default TableCellRewardsOthers
