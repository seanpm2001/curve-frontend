import type { ChipProps } from '@/ui/Typography/types'

import { formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import { Chip } from '@/ui/Typography'

const TableCellVolume = ({
  isHighLight,
  noStyles,
  rChainId,
  rPoolId,
  ...rest
}: ChipProps & { isHighLight?: boolean; noStyles?: boolean; rChainId: ChainId; rPoolId: string }) => {
  const volume = useStore((state) => state.pools.volumeMapper[rChainId]?.[rPoolId]?.value)
  const volumeCached = useStore((state) => state.storeCache.volumeMapper[rChainId]?.[rPoolId]?.value)

  const value = volumeCached ?? volume
  const formattedVolume =
    typeof value !== 'undefined' ? formatNumber(value, { currency: 'USD', notation: 'compact' }) : ''

  return (
    <>
      {noStyles ? (
        formattedVolume
      ) : (
        <Chip size="md" isBold={isHighLight} {...rest}>
          {formattedVolume}
        </Chip>
      )}
    </>
  )
}

export default TableCellVolume
