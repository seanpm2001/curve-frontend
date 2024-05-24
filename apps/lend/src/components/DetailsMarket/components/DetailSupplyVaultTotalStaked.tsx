import { useMemo } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { formatNumber } from '@/ui/utils'
import useAbiTotalSupply from '@/hooks/useAbiTotalSupply'
import useStore from '@/store/useStore'

import Box from '@/ui/Box'

const DetailSupplyVaultTotalStaked = ({ rChainId, rOwmId }: { rChainId: ChainId; rOwmId: string }) => {
  const owmData = useStore((state) => state.markets.owmDatasMapper[rChainId]?.[rOwmId])
  const { gauge: gaugeAddress, vault: vaultAddress } = owmData?.owm?.addresses ?? {}
  const gaugeTotalSupply = useAbiTotalSupply(rChainId, gaugeAddress)
  const vaultTotalSupply = useAbiTotalSupply(rChainId, vaultAddress)

  const { totalStaked, stakedPercent } = useMemo(() => {
    let resp = { totalStaked: '', stakedPercent: '' }

    if (Number(gaugeTotalSupply || 0) > 0 && Number(vaultTotalSupply || 0) > 0) {
      resp.totalStaked = formatNumber(gaugeTotalSupply, { notation: 'compact', defaultValue: '-' })
      resp.stakedPercent = formatNumber(_getStakedPercent(gaugeTotalSupply, vaultTotalSupply), {
        style: 'percent',
        maximumSignificantDigits: 2,
        defaultValue: '-',
      })
    }

    return resp
  }, [gaugeTotalSupply, vaultTotalSupply])

  return (
    <Box grid gridGap={1}>
      <DetailInfo grid>
        <span>{t`Total vault shares staked:`}</span>
        {totalStaked}
      </DetailInfo>
      <DetailInfo>
        <span>{t`Staked percent:`}</span> {stakedPercent}
      </DetailInfo>
    </Box>
  )
}

const DetailInfo = styled(Box)`
  font-weight: bold;

  span {
    opacity: 0.9;
    font-size: var(--font-size-2);
  }
`

export default DetailSupplyVaultTotalStaked

function _getStakedPercent(gaugeTotalSupply: number | null, vaultTotalSupply: number | null) {
  if (gaugeTotalSupply !== null && vaultTotalSupply !== null) {
    return (gaugeTotalSupply / vaultTotalSupply) * 100
  }
}
