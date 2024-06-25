import type { Location, NavigateFunction, Params } from 'react-router'
import type { INetworkName } from '@curvefi/api/lib/interfaces'

import { ROUTE } from '@/constants'
import { dynamicActivate, updateAppLocale } from '@/lib/i18n'
import { getStorageValue, setStorageValue } from '@/utils/storage'
import { parseParams } from '@/utils/utilsRouter'
import { initCurveJs } from '@/utils/utilsCurvejs'
import { useOnboardHelpers } from '@/onboard'
import networks, { networksIdMapper } from '@/networks'
import useStore from '@/store/useStore'

function usePageOnMount(params: Params, location: Location, navigate: NavigateFunction, chainIdNotRequired?: boolean) {
  const curve = useStore((state) => state.curve)
  const connectState = useStore((state) => state.connectState)
  const updateConnectState = useStore((state) => state.updateConnectState)
  const updateCurveJs = useStore((state) => state.updateCurveJs)
  const updateGlobalStoreByKey = useStore((state) => state.updateGlobalStoreByKey)

  const parsedParams = parseParams(params, chainIdNotRequired)
  const { network: paramsNetwork } = params

  const getNetwork = (chainId: number) => {
    const { id: networkId = null, isActiveNetwork = false } = networks[chainId as ChainId] ?? {}
    return { networkId, isActiveNetwork }
  }

  const getStorageWalletName = () => {
    return getStorageValue('APP_CACHE')?.walletName ?? ''
  }

  const updateApi = async (chainId: number, wallet: Wallet | null) => {
    const prevApi = curve
    updateGlobalStoreByKey('isLoadingApi', true)
    updateGlobalStoreByKey('isLoadingCurve', true) // remove -> use connectState

    const updatedApi = await initCurveJs(chainId as ChainId, wallet)
    if (!updatedApi) throw new Error('Unable to update api')

    await updateCurveJs(updatedApi, prevApi, wallet)
  }

  const updateRouterProps = () => {
    updateGlobalStoreByKey('routerProps', { params, location, navigate })
  }

  const updateLocale = (locale: string) => {
    dynamicActivate(locale)
    updateAppLocale(locale, updateGlobalStoreByKey)
    setStorageValue('APP_CACHE', { locale })
  }

  const updateStorageWalletName = (walletName: string) => {
    setStorageValue('APP_CACHE', { walletName, timestamp: walletName ? Date.now().toString() : '' })
  }

  useOnboardHelpers(
    `${parsedParams.rLocalePathname}/ethereum${ROUTE.PAGE_SWAP}`,
    1,
    curve?.chainId,
    curve?.signerAddress,
    parsedParams.rChainId,
    parsedParams.rLocale?.value ?? 'en',
    parsedParams.rLocalePathname,
    paramsNetwork ? networksIdMapper[paramsNetwork as INetworkName] : null,
    parsedParams.restFullPathname,
    location.pathname === ROUTE.PAGE_INTEGRATIONS,
    connectState,
    getNetwork,
    getStorageWalletName,
    updateApi,
    updateConnectState,
    updateLocale,
    updateStorageWalletName,
    updateRouterProps
  )

  return {
    pageLoaded: connectState.status === 'success',
    routerParams: parsedParams,
    curve,
  } as PageProps
}

export default usePageOnMount
