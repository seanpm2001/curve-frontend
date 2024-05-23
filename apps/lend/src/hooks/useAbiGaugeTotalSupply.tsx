import type { Contract } from 'ethers'

import { useCallback, useEffect, useState } from 'react'

import { REFRESH_INTERVAL } from '@/constants'
import { weiToEther } from '@/ui/utils'
import useContract from '@/hooks/useContract'
import usePageVisibleInterval from '@/ui/hooks/usePageVisibleInterval'
import useStore from '@/store/useStore'

const useAbiGaugeTotalSupply = (rChainId: ChainId, gaugeAddress: string | undefined) => {
  const contract = useContract(rChainId, false, 'gaugeTotalSupply', gaugeAddress)

  const isPageVisible = useStore((state) => state.isPageVisible)

  const [gaugeTotalSupply, setGaugeTotalSupply] = useState<number | null>(null)

  const getGaugeTotalSupply = useCallback(async (contract: Contract) => {
    try {
      const gaugeTotalSupply = await contract.totalSupply()
      setGaugeTotalSupply(weiToEther(Number(gaugeTotalSupply)))
    } catch (error) {
      console.error(error)
    }
  }, [])

  useEffect(() => {
    if (contract) getGaugeTotalSupply(contract)
  }, [contract, getGaugeTotalSupply])

  usePageVisibleInterval(
    () => {
      if (contract) getGaugeTotalSupply(contract)
    },
    REFRESH_INTERVAL['1m'],
    isPageVisible
  )

  return gaugeTotalSupply
}

export default useAbiGaugeTotalSupply
