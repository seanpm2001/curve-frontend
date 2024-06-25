import type { WalletState } from '@web3-onboard/core'

import { useCallback, useEffect } from 'react'
import { useConnectWallet, useSetChain, useSetLocale } from '@web3-onboard/react'
import { ethers } from 'ethers'

import { getWallet } from '../utils/helpers'
import { CONNECT_STAGE, ConnectOptions, ConnectState, isFailure, isSuccess } from '../utils/connectStatus'
import { useLocation, useNavigate } from 'react-router-dom'

const useOnboardHelpers = (
  defaultPathname: string,
  defaultChainId: number,
  apiChainId: number | undefined | null = null,
  apiSignerAddress: string | undefined = '',
  routeChainId: number,
  routeLocale: string,
  routeLocalePathname: string,
  routerNetworkId: number | null | undefined,
  routeFullPathname: string,
  isIntegrationPage: boolean,
  connectState: ConnectState,
  getNetwork: (chainId: number) => { networkId: string | null; isActiveNetwork: boolean },
  getStorageWalletName: () => string,
  updateApi: (chainId: number, wallet: WalletState | null) => Promise<void>,
  updateConnectState: <S extends CONNECT_STAGE>(
    status: ConnectState['status'],
    stage: S | '',
    options?: ConnectOptions[S]
  ) => void,
  updateLocale: (locale: string) => void,
  updateStorageWalletName: (walletName: string) => void,
  updateRouterProps: () => void
) => {
  const [{ wallet }, connect, disconnect] = useConnectWallet()
  const [_, setChain] = useSetChain()
  const updateWalletLocale = useSetLocale()
  const navigate = useNavigate()
  const location = useLocation()

  const locationPathname = location.pathname
  const { walletChainId, walletSignerAddress } = getWallet(wallet)

  const isSameChainId = {
    apiRoute: apiChainId === routeChainId && !isIntegrationPage,
    apiWallet: !!walletChainId && +walletChainId === apiChainId,
    routeWallet: !!walletChainId && +walletChainId === routeChainId,
    apiWalletRoute:
      !!walletChainId && +walletChainId === apiChainId && +walletChainId === routeChainId && !isIntegrationPage,
  }

  const isSameAddress = {
    apiWallet: apiSignerAddress.toLowerCase() === walletSignerAddress,
  }

  const isSameLocale = routeLocale === document.documentElement.lang

  const updateConnectSwitchNetwork = useCallback(
    (options: ConnectOptions[CONNECT_STAGE.SWITCH_NETWORK]) => {
      updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, options)
    },
    [updateConnectState]
  )

  const updateConnectApi = useCallback(
    (options: ConnectOptions[CONNECT_STAGE.CONNECT_API]) => {
      updateConnectState('loading', CONNECT_STAGE.CONNECT_API, options)
    },
    [updateConnectState]
  )

  useEffect(() => {}, [connectState.stage, connectState.status])

  const handleReconnectWallet = useCallback(
    async (walletState: WalletState, chainId?: number) => {
      const label = walletState.label
      await disconnect(walletState)
      const newWalletState = (await connect({ autoSelect: { label, disableModals: true } }))[0]
      if (chainId) {
        await setChain({ chainId: ethers.toQuantity(chainId) })
        await _isNetworkSwitched(chainId)
      }
      return newWalletState
    },
    [connect, disconnect, setChain]
  )

  const handleConnectCurveApi = useCallback(
    async ([chainId, useWallet]: ConnectOptions[CONNECT_STAGE.CONNECT_API]) => {
      try {
        let parsedWallet = useWallet ? wallet : null
        const { walletChainId } = getWallet(parsedWallet)

        // check wallet sync again
        if (parsedWallet && walletChainId && +walletChainId !== chainId) {
          parsedWallet = await handleReconnectWallet(parsedWallet, chainId)
        }

        await updateApi(chainId, useWallet ? parsedWallet : null)
        updateConnectState('success', '')
      } catch (error) {
        console.error(error)
        updateConnectState('failure', CONNECT_STAGE.CONNECT_API)
      }
    },
    [wallet, updateApi, updateConnectState, handleReconnectWallet]
  )

  const handleConnectWallet = useCallback(
    async (walletName: ConnectOptions[CONNECT_STAGE.CONNECT_WALLET]) => {
      let walletState

      if (!walletName) {
        walletState = (await connect())?.[0]
      } else {
        // If found label in localstorage, after 30s if not connected, reconnect with modal
        const walletStatesPromise = new Promise<WalletState[] | null>(async (resolve, reject) => {
          try {
            const walletStates = await Promise.race([
              connect({ autoSelect: { label: walletName, disableModals: true } }),
              new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout connect wallet')), 3000)),
            ])
            resolve(walletStates)
          } catch (error) {
            reject(error)
          }
        })

        try {
          const walletStates = await walletStatesPromise
          if (!walletStates || walletStates?.length === 0) throw new Error('unable to connect')
          walletState = walletStates[0]
        } catch (error) {
          // if failed to get walletState due to timeout, show connect modal.
          updateStorageWalletName('')
          ;[walletState] = await connect()
        }
      }

      try {
        if (!walletState) throw new Error('No wallet found')

        updateStorageWalletName(walletState.label)
        const { walletChainId, walletChainIdHex } = getWallet(walletState)

        if (walletChainId && walletChainIdHex) {
          let parsedChainId = +walletChainId

          // if route and wallet chainId does not match, update wallet's chainId
          if (+walletChainId !== routeChainId) {
            const success = await setChain({ chainId: ethers.toQuantity(routeChainId) })
            if (!success) throw new Error('reject network switch')
            parsedChainId = routeChainId
          }

          // confirm wallet's chainId is updated
          const { isNetworkSwitched } = await _isNetworkSwitched(routeChainId)

          if (!isNetworkSwitched) {
            const { networkId, isActiveNetwork } = getNetwork(parsedChainId)

            if (networkId && isActiveNetwork) {
              navigate(`${routeLocalePathname}/${networkId}/${routeFullPathname}`)
              updateConnectApi([parsedChainId, true])
            } else {
              updateConnectState('failure', CONNECT_STAGE.SWITCH_NETWORK)
            }
            return
          }
          updateConnectApi([parsedChainId, true])
        }
      } catch (error) {
        console.error(error)
        updateStorageWalletName('')
        updateConnectApi([routeChainId, false])
      }
    },
    [
      connect,
      getNetwork,
      navigate,
      routeChainId,
      routeFullPathname,
      routeLocalePathname,
      setChain,
      updateConnectApi,
      updateConnectState,
      updateStorageWalletName,
    ]
  )

  const handleDisconnectWallet = useCallback(
    async (wallet: WalletState) => {
      try {
        updateStorageWalletName('')
        await disconnect(wallet)
        updateConnectApi([routeChainId, false])
      } catch (error) {
        console.error(error)
      }
    },
    [disconnect, routeChainId, updateConnectApi, updateStorageWalletName]
  )

  const handleNetworkSwitch = useCallback(
    async ([currChainId, newChainId]: ConnectOptions[CONNECT_STAGE.SWITCH_NETWORK]) => {
      if (wallet && window?.ethereum) {
        try {
          await setChain({ chainId: ethers.toQuantity(newChainId) })
          const { isNetworkSwitched, isWalletInSync } = await _isNetworkSwitched(+newChainId)

          if (!isWalletInSync) await handleReconnectWallet(wallet)
          if (!isNetworkSwitched) throw new Error('reject network switch')

          updateConnectApi([newChainId, true])
        } catch (error) {
          console.error(error)
          updateConnectState('failure', CONNECT_STAGE.SWITCH_NETWORK)
          const { networkId, isActiveNetwork } = getNetwork(currChainId)
          if (networkId && isActiveNetwork) {
            navigate(`${routeLocalePathname}/${networkId}/${routeFullPathname}`)
            updateConnectState('success', '')
          } else {
            updateConnectState('failure', CONNECT_STAGE.SWITCH_NETWORK)
          }
        }
      } else {
        updateConnectApi([newChainId, false])
      }
    },
    [
      getNetwork,
      handleReconnectWallet,
      navigate,
      routeFullPathname,
      routeLocalePathname,
      setChain,
      updateConnectApi,
      updateConnectState,
      wallet,
    ]
  )

  // onMount
  useEffect(() => {
    if (connectState.status === '' && connectState.stage === '') {
      const isActiveNetwork = routerNetworkId ? getNetwork(routerNetworkId).isActiveNetwork : false
      const walletLabel = getStorageWalletName()

      // if network in route is not good, navigate to app default network
      if (!isActiveNetwork) navigate(defaultPathname)

      if (!wallet && !!walletLabel) {
        updateConnectState('loading', CONNECT_STAGE.CONNECT_WALLET, walletLabel)
        return
      }

      const parsedChainId = isActiveNetwork ? routeChainId : defaultChainId

      if (!!wallet && !isActiveNetwork) {
        updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [parsedChainId, parsedChainId])
        return
      }

      updateConnectState('loading', CONNECT_STAGE.CONNECT_API, [parsedChainId, !!wallet])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (connectState.status || connectState.stage) {
      const { status, stage, options } = connectState

      if (isSuccess(connectState)) {
        updateRouterProps()
      } else if (status === 'loading') {
        if (stage === CONNECT_STAGE.SWITCH_NETWORK) {
          handleNetworkSwitch(options as ConnectOptions[CONNECT_STAGE.SWITCH_NETWORK])
        } else if (stage === CONNECT_STAGE.CONNECT_WALLET) {
          handleConnectWallet(options as ConnectOptions[CONNECT_STAGE.CONNECT_WALLET])
        } else if (stage === CONNECT_STAGE.DISCONNECT_WALLET) {
          !!wallet && handleDisconnectWallet(wallet)
        } else if (stage === CONNECT_STAGE.CONNECT_API) {
          handleConnectCurveApi(options as ConnectOptions[CONNECT_STAGE.CONNECT_API])
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectState.status, connectState.stage])

  // wallet state changed not from app
  useEffect(() => {
    if (
      (isSuccess(connectState) || isFailure(connectState, 'failure')) &&
      (!isSameAddress.apiWallet || !isSameChainId.apiWalletRoute)
    ) {
      if (!isSameAddress.apiWallet && !!walletChainId) {
        updateConnectApi([+walletChainId, true])
      } else if (!isSameChainId.apiWalletRoute && !!walletChainId) {
        const { networkId, isActiveNetwork } = getNetwork(+walletChainId)
        if (networkId && isActiveNetwork) {
          navigate(`${routeLocalePathname}/${networkId}/${routeFullPathname}`)
          updateConnectSwitchNetwork([routeChainId, +walletChainId])
        } else {
          updateConnectState('failure', CONNECT_STAGE.SWITCH_NETWORK)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletChainId, walletSignerAddress])

  // handle location pathname changes
  useEffect(() => {
    if (connectState.status === 'success') {
      if (!isSameLocale) {
        updateLocale(routeLocale)
        updateWalletLocale(routeLocale)
      } else if (!isSameChainId.routeWallet && !!walletChainId) {
        // switch network if url network is not same as wallet
        updateConnectSwitchNetwork([+walletChainId, routeChainId])
      } else if (!isSameChainId.apiRoute && !!apiChainId) {
        // switch network if url network is not same as api
        updateConnectSwitchNetwork([apiChainId, routeChainId])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationPathname])
}

export default useOnboardHelpers

export async function _isNetworkSwitched(newChainId: number) {
  try {
    if (window?.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const providerChainIdBigInt = (await provider.getNetwork())?.chainId
      const providerChainId = providerChainIdBigInt ? Number(providerChainIdBigInt) : null

      // TODO: check again if this is needed when @web3-onboard/core v2.21.2 is available.
      // https://github.com/blocknative/web3-onboard/issues/1907
      const deprecatedRequestChainIdHex = 'chainId' in window.ethereum ? (window.ethereum.chainId as string) : null
      const deprecatedRequestChainId = deprecatedRequestChainIdHex ? ethers.toNumber(deprecatedRequestChainIdHex) : null
      if (process.env.NODE_ENV === 'development')
        console.log('ONMOUNT SYNC STATUS:', newChainId, providerChainId, deprecatedRequestChainId)

      return {
        isNetworkSwitched: +newChainId === providerChainId,
        isWalletInSync: deprecatedRequestChainId ? providerChainId === deprecatedRequestChainId : true,
      }
    }
    return { isNetworkSwitched: true, isWalletInSync: true }
  } catch (error) {
    console.error(error)
    return { isNetworkSwitched: true, isWalletInSync: true }
  }
}
