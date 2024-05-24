import { Contract, Interface, JsonRpcProvider } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

import { INVALID_ADDRESS } from '@/constants'
import networks from '@/networks'
import useStore from '@/store/useStore'

const useAbiGaugeTotalSupply = (
  rChainId: ChainId,
  signerRequired: boolean,
  jsonModuleName: string,
  contractAddress: string | undefined
) => {
  const getProvider = useStore((state) => state.wallet.getProvider)

  const [contract, setContract] = useState<Contract | null>(null)

  const getContract = useCallback(
    async (jsonModuleName: string, contractAddress: string, provider: Provider | JsonRpcProvider) => {
      try {
        if (contractAddress !== INVALID_ADDRESS) {
          const abi = await import(`@/abis/${jsonModuleName}.json`).then((module) => module.default.abi)

          if (abi) {
            const iface = new Interface(abi)
            return new Contract(contractAddress, iface.format(), provider)
          }
        }
      } catch (error) {
        console.error(error)
      }
    },
    []
  )

  useEffect(() => {
    if (rChainId) {
      const provider = signerRequired
        ? getProvider('')
        : getProvider('') || new JsonRpcProvider(networks[rChainId].rpcUrl)

      if (jsonModuleName && contractAddress && provider) {
        ;(async () => {
          const contract = await getContract(jsonModuleName, contractAddress, provider)
          setContract(contract ?? null)
        })()
      }
    }
  }, [contractAddress, getContract, getProvider, jsonModuleName, rChainId, signerRequired])

  return contract
}

export default useAbiGaugeTotalSupply
