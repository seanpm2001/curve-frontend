import type { ChipProps } from '@/ui/Typography/types'

import { formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import { Chip } from '@/ui/Typography'

const TableCellTvl = ({
  isHighLight,
  noStyles,
  rChainId,
  rPoolId,
  ...rest
}: ChipProps & { isHighLight?: boolean; noStyles?: boolean; rChainId: ChainId; rPoolId: string }) => {
  const tvl = useStore((state) => state.pools.tvlMapper[rChainId]?.[rPoolId]?.value)
  const tvlCached = useStore((state) => state.storeCache.tvlMapper[rChainId]?.[rPoolId]?.value)

  const value = tvlCached ?? tvl
  const formattedTvl = typeof value !== 'undefined' ? formatNumber(value, { currency: 'USD', notation: 'compact' }) : ''

  return (
    <>
      {noStyles ? (
        formattedTvl
      ) : (
        <Chip {...rest} isBold={isHighLight} size="md">
          {value ? formatNumber(value, { currency: 'USD', notation: 'compact' }) : ''}
        </Chip>
      )}
    </>
  )
}

export default TableCellTvl
