import React, { useMemo } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import { INVALID_ADDRESS } from '@/constants'
import useAbiTotalSupply from '@/hooks/useAbiTotalSupply'
import useStore from '@/store/useStore'

import Box from '@/ui/Box'

const DetailsSupplyTotalStaked = ({ rChainId, rOwmId }: { rChainId: ChainId; rOwmId: string }) => {
  const owmData = useStore((state) => state.markets.owmDatasMapper[rChainId]?.[rOwmId])
  const { gauge: gaugeAddress, vault: vaultAddress } = owmData?.owm?.addresses ?? {}
  const gaugeTotalSupply = useAbiTotalSupply(rChainId, gaugeAddress)
  const vaultTotalSupply = useAbiTotalSupply(rChainId, vaultAddress)
  const isValidGaugeAddress = gaugeAddress !== INVALID_ADDRESS

  const { totalVaultSharesStaked, percent } = useMemo(() => {
    if (!isValidGaugeAddress) {
      return { totalVaultSharesStaked: 'N/A', percent: 'N/A' }
    } else {
      return {
        totalVaultSharesStaked: formatNumber(gaugeTotalSupply, {
          notation: 'compact',
          defaultValue: '-',
        }),
        percent: formatNumber(_getStakedPercent(gaugeTotalSupply, vaultTotalSupply), {
          ...FORMAT_OPTIONS.PERCENT,
          defaultValue: '-',
        }),
      }
    }
  }, [gaugeTotalSupply, isValidGaugeAddress, vaultTotalSupply])

  return (
    <Box grid gridGap={1}>
      <DetailInfo grid>
        <span>{t`Total vault shares staked:`}</span> {totalVaultSharesStaked}
      </DetailInfo>
      <DetailInfo>
        <span>{t`Staked percent:`}</span> {percent}
      </DetailInfo>
    </Box>
  )
}

const DetailInfo = styled(Box)`
  font-weight: bold;

  span {
    font-size: var(--font-size-2);
  }
`

export default DetailsSupplyTotalStaked

function _getStakedPercent(gaugeTotalSupply: number | null, vaultTotalSupply: number | null) {
  return (Number(gaugeTotalSupply || 0) / Number(vaultTotalSupply || 0)) * 100
}
