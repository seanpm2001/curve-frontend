import type { ChipProps } from '@/ui/Typography/types'

import React from 'react'

import { LARGE_APY } from '@/constants'
import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import { Chip } from '@/ui/Typography'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'
import TooltipBaseApy from '@/components/PagePoolList/components/TooltipBaseApy'

const TableCellRewardsBase = ({
  isHighlight,
  rChainId,
  rPoolId,
  ...rest
}: ChipProps & { isHighlight?: boolean; rChainId: ChainId; rPoolId: string }) => {
  const poolData = useStore((state) => state.pools.poolsMapper[rChainId]?.[rPoolId])
  const rewardsApy = useStore((state) => state.pools.rewardsApyMapper[rChainId]?.[rPoolId])

  const { base } = rewardsApy ?? {}

  let baseFormatted = ''
  if (base?.day) {
    if (+base.day > LARGE_APY) {
      baseFormatted = `${formatNumber(LARGE_APY)}+%`
    } else {
      baseFormatted = `${formatNumber(base.day, FORMAT_OPTIONS.PERCENT)}`
    }
  }

  const failedFetching24hOldVprice =
    poolData && 'failedFetching24hOldVprice' in poolData && poolData.failedFetching24hOldVprice

  return failedFetching24hOldVprice ? (
    <span>
      -<IconTooltip>Not available currently</IconTooltip>
    </span>
  ) : (
    <Chip
      {...rest}
      isBold={isHighlight}
      size="md"
      tooltip={!!base ? <TooltipBaseApy poolData={poolData} baseApy={base} /> : null}
      tooltipProps={{
        noWrap: true,
        placement: 'bottom end',
        textAlign: 'left',
      }}
    >
      {baseFormatted}
    </Chip>
  )
}

export default TableCellRewardsBase
