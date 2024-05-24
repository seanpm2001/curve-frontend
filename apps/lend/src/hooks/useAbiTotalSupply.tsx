import type { Contract } from 'ethers'

import { useCallback, useEffect, useState } from 'react'

import { REFRESH_INTERVAL } from '@/constants'
import useContract from '@/hooks/useContract'
import usePageVisibleInterval from '@/ui/hooks/usePageVisibleInterval'
import useStore from '@/store/useStore'

const useAbiTotalSupply = (rChainId: ChainId, contractAddress: string | undefined) => {
  const contract = useContract(rChainId, false, 'totalSupply', contractAddress)

  const isPageVisible = useStore((state) => state.isPageVisible)

  const [totalSupply, setTotalSupply] = useState<number | null>(null)

  const getTotalSupply = useCallback(async (contract: Contract) => {
    try {
      const totalSupply = await contract.totalSupply()
      setTotalSupply(totalSupply)
    } catch (error) {
      console.error(error)
    }
  }, [])

  useEffect(() => {
    if (contract) getTotalSupply(contract)
  }, [contract, getTotalSupply])

  usePageVisibleInterval(
    () => {
      if (contract) getTotalSupply(contract)
    },
    REFRESH_INTERVAL['5m'],
    isPageVisible
  )

  return totalSupply
}

export default useAbiTotalSupply
