import type { Page } from '@/layout/default/Header'

import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import { useNavigate } from 'react-router-dom'
import React, { useMemo, useRef, useState } from 'react'
import { useOverlay } from 'react-aria'
import { useOverlayTriggerState } from 'react-stately'
import Image from 'next/image'
import styled, { css } from 'styled-components'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import { parseLocale } from '@/lib/i18n'
import networks from '@/networks'
import useStore from '@/store/useStore'

import { CommunitySection, ResourcesSection } from '@/layout/default/Footer'
import { LlamaImg } from '@/images'
import Box from '@/ui/Box'
import Button from '@/ui/Button'
import ConnectWallet from '@/components/ConnectWallet'
import CurveLogoLink from '@/layout/default/CurveLogoLink'
import ExternalLink from '@/ui/Link/ExternalLink'
import HeaderStats from '@/ui/HeaderStats'
import Icon from '@/ui/Icon'
import IconButton from '@/ui/IconButton'
import Overlay from '@/ui/Overlay'
import SelectLocale from '@/components/SelectLocale'
import SelectThemes from '@/components/SelectThemes'
import Spacer from '@/ui/Spacer'

const DEFAULT_MENUS_WIDTH = [0, 0]

const HeaderMobile = ({
  pages,
  chainId,
  rChainId,
  selectNetwork: SelectNetwork,
}: PageProps & {
  pages: Page[]
  rChainId: ChainId | ''
  selectNetwork: React.ReactElement
}) => {
  const isXSmDown = useStore((state) => state.isXSmDown)
  const locale = useStore((state) => state.locale)
  const pageWidth = useStore((state) => state.pageWidth)
  const routerProps = useStore((state) => state.routerProps)
  const tvlTotalCached = useStore((state) => state.storeCache.tvlTotal?.[rChainId])
  const tvlTotal = useStore((state) => state.pools.tvlTotal)
  const volumeTotalCached = useStore((state) => state.storeCache.volumeTotal?.[rChainId])
  const volumeTotal = useStore((state) => state.pools.volumeTotal)
  const volumeCryptoShareCached = useStore((state) => state.storeCache.volumeCryptoShare?.[rChainId])
  const volumeCryptoShare = useStore((state) => state.pools.volumeCryptoShare)

  const leftMenuRef = useRef<HTMLDivElement | null>(null)
  const leftButtonRef = useRef<HTMLButtonElement | null>(null)
  const leftButtonCloseRef = useRef<HTMLButtonElement | null>(null)
  const navigate = useNavigate()
  const overlayTriggerState = useOverlayTriggerState({})

  const [menusWidth, setMenusWidth] = useState(DEFAULT_MENUS_WIDTH)
  const [showLinks, setShowMore] = useState(false)
  const [showResources, setShowResources] = useState(false)
  const [showCommunity, setShowCommunity] = useState(false)
  const [showLocaleList, setShowLocaleList] = useState(false)

  const { params } = routerProps || {}
  const menuWidth = useMemo(() => (pageWidth === 'page-small-x' ? 270 : 300), [pageWidth])

  const curveOrgPathname = useMemo(() => {
    if (chainId) {
      return networks[chainId].orgUIPath
    }
    return '/'
  }, [chainId])

  const openMenu = (updatedMenusWidth: number[]) => {
    setMenusWidth(updatedMenusWidth)
    overlayTriggerState.open()

    if (updatedMenusWidth[0] && leftButtonCloseRef.current) {
      leftButtonCloseRef.current.focus()
    }
  }

  const closeMenu = (currentMenusWidth: number[]) => {
    setMenusWidth(DEFAULT_MENUS_WIDTH)
    overlayTriggerState.close()

    if (currentMenusWidth[0] && leftButtonRef.current) {
      leftButtonRef.current.focus()
    }
  }

  const leftOverlayProps = {
    isOpen: !!menusWidth[0],
    onClose: () => closeMenu([menuWidth, 0]),
    isDismissable: true,
  }

  const handleRouteClick = (route: string) => {
    const { pathnameLocale } = parseLocale(params?.locale)
    const network = params?.network ?? 'ethereum'

    if (navigate) {
      const reRoutePathname = pathnameLocale ? `/${pathnameLocale}/${network}${route}` : `/${network}${route}`
      navigate(reRoutePathname)
    }
    closeMenu([menuWidth, 0])
  }

  const leftOverlay = useOverlay(leftOverlayProps, leftMenuRef)

  return (
    <>
      <Box grid gridTemplateColumns="repeat(2, auto)" gridColumnGap={2} flexAlignItems="center">
        <IconButton ref={leftButtonRef} onClick={() => openMenu([menuWidth, 0])}>
          <Icon name="Menu" size={24} aria-label="menu icon" />
        </IconButton>
        <CurveLogoLink className="main" hideLabel={isXSmDown} />
      </Box>
      <Spacer />
      <Menu>{SelectNetwork}</Menu>

      <Overlay isOpen={leftOverlayProps.isOpen} {...leftOverlay.underlayProps}>
        <ModalWrapper ref={leftMenuRef} placement="left" width={menusWidth[0]} {...leftOverlay.overlayProps}>
          <ModalHeader>
            <CurveLogoLink />
            <IconButton ref={leftButtonCloseRef} onClick={() => closeMenu([menuWidth, 0])}>
              <Icon name="Close" size={24} aria-label="close icon" />
            </IconButton>
          </ModalHeader>
          <ModalContent className="mobile-menu" grid gridRowGap={3} padding="0 var(--spacing-3)">
            <Box grid gridRowGap={3} margin="var(--spacing-normal) 0 var(--spacing-2)">
              {pages.map(({ route, label }) => {
                return (
                  <MobileButton key={route} size="medium" variant="text" onClick={() => handleRouteClick(route)}>
                    {i18n._(label)}
                  </MobileButton>
                )
              })}

              <StyledExternalLink href="https://crvusd.curve.fi">{t`crvUSD`}</StyledExternalLink>

              <Box margin={`var(--spacing-3) 0 0 0`}>
                <StyledSelectThemes label={t`Mode`} />
              </Box>

              <div>
                <SelectLocale mobileHeader={{ showList: showLocaleList, setShowList: setShowLocaleList }} />
              </div>
              <MoreContainer>
                <MobileButton size="medium" variant="text" fillWidth onClick={() => setShowMore((prev) => !prev)}>
                  {t`More`}{' '}
                  {showLinks ? (
                    <Icon name="CaretUp" size={16} aria-label="hide icon" />
                  ) : (
                    <Icon name="CaretDown" size={16} aria-label="show icon" />
                  )}
                </MobileButton>
                <More grid gridRowGap={3} className={`collapsed ${showLinks ? 'show' : ''}`} showLinks={showLinks}>
                  <StyledExternalLink href={curveOrgPathname}>{t`Classic UI`}</StyledExternalLink>
                  <StyledExternalLink href="https://dao.curve.fi/">{t`DAO`}</StyledExternalLink>
                  <StyledExternalLink href="https://gov.curve.fi/">{t`Governance`}</StyledExternalLink>
                  <div>
                    <MobileButton
                      size="medium"
                      variant="text"
                      fillWidth
                      onClick={() => setShowCommunity((prev) => !prev)}
                    >
                      {t`Community`}{' '}
                      {showCommunity ? (
                        <Icon name="CaretUp" size={16} aria-label="hide icon" />
                      ) : (
                        <Icon name="CaretDown" size={16} aria-label="show icon" />
                      )}
                    </MobileButton>
                    <StyledCommunitySection locale={locale} className={`collapsed ${showCommunity ? 'show' : ''}`} />
                  </div>

                  <div>
                    <MobileButton
                      size="medium"
                      variant="text"
                      fillWidth
                      onClick={() => setShowResources((prev) => !prev)}
                    >
                      {t`Resources`}{' '}
                      {showResources ? (
                        <Icon name="CaretUp" size={16} aria-label="hide icon" />
                      ) : (
                        <Icon name="CaretDown" size={16} aria-label="show icon" />
                      )}
                    </MobileButton>
                    <StyledResourcesSection chainId={chainId} className={`collapsed ${showResources ? 'show' : ''}`} />
                  </div>
                </More>
              </MoreContainer>
            </Box>

            {chainId && (
              <>
                <Stats grid>
                  <HeaderStats
                    isMobile
                    title={t`Total Deposits`}
                    valueCached={tvlTotalCached}
                    value={tvlTotal}
                    parsedVal={formatNumber(tvlTotal ?? tvlTotalCached, {
                      currency: 'USD',
                      showDecimalIfSmallNumberOnly: true,
                    })}
                  />
                </Stats>
                <Box grid>
                  <HeaderStats
                    isMobile
                    title={t`Daily Volume`}
                    valueCached={volumeTotalCached}
                    value={volumeTotal}
                    parsedVal={formatNumber(volumeTotal ?? volumeTotalCached, {
                      currency: 'USD',
                      showDecimalIfSmallNumberOnly: true,
                    })}
                  />
                </Box>
                <Box grid>
                  <HeaderStats
                    isMobile
                    title={t`Crypto Volume Share`}
                    valueCached={volumeCryptoShareCached}
                    value={volumeCryptoShare}
                    parsedVal={formatNumber(volumeCryptoShare ?? volumeCryptoShareCached, FORMAT_OPTIONS.PERCENT)}
                  />
                </Box>
              </>
            )}
            <Image src={LlamaImg} alt="Llama" width="32" height="40" />
          </ModalContent>
          <Spacer />
          <ModalFooter>
            <StyledConnectWallet onClick={() => closeMenu([menuWidth, 0])} />
          </ModalFooter>
        </ModalWrapper>
      </Overlay>
    </>
  )
}

const Stats = styled(Box)`
  padding-top: var(--spacing-normal);
  border-top: 1px solid var(--border-400);
`

const MoreContainer = styled(Box)``

const More = styled(Box)<{ showLinks: boolean }>`
  padding-left: var(--spacing-1);
  ${({ showLinks }) => (showLinks ? 'padding-top: var(--spacing-normal)' : '')}
`

const StyledExternalLink = styled(ExternalLink)`
  align-items: center;
  display: flex;
  min-height: 1.125rem;

  font-weight: inherit;
`

const MobileButton = styled(Button)`
  align-items: center;
  display: flex;
  justify-content: space-between;
  min-height: 1.125rem;
`

const footerSectionStyles = css`
  li {
    margin-top: var(--spacing-3);
    margin-left: var(--spacing-1);

    a {
      opacity: 0.8;
    }
  }
`

const StyledCommunitySection = styled(CommunitySection)`
  ${footerSectionStyles}
`

const StyledResourcesSection = styled(ResourcesSection)`
  ${footerSectionStyles}
`

const StyledSelectThemes = styled(SelectThemes)`
  justify-content: flex-start;
  min-height: 1.125rem;

  svg {
    margin: 0 var(--spacing-2);
  }
`

const StyledConnectWallet = styled(ConnectWallet)`
  justify-content: center;
  width: 100%;
  min-height: var(--height-large);
`

/*
 * MODAL
 */
const ModalHeader = styled.header`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 0 var(--spacing-2) 0 var(--spacing-3);

  min-height: var(--box_header--height);
`

const ModalContent = styled(Box)`
  overflow: scroll;
  transition: max-height 0.15s ease-out;

  li {
    margin-top: var(--spacing-3);
    margin-left: var(--spacing-1);
  }

  button {
    width: 100%;
  }

  a,
  button,
  .title {
    padding: 0;
    margin: 0;

    font-family: inherit;
    font-size: var(--font-size-4);
    font-weight: var(--font-weight--bold);
    text-align: left;
    text-transform: initial;
    text-decoration: none;

    color: inherit;
  }

  .collapsed {
    max-height: 0;
    overflow: hidden;

    a,
    button,
    .title {
      font-size: 1rem;
      font-weight: normal;
    }

    &.show {
      max-height: 500px;
      transition: max-height 0.25s ease-in;
    }
  }
`

const ModalFooter = styled.div`
  padding: var(--spacing-narrow);
  padding-top: var(--spacing-normal);
`

type ModalWrapperProps = {
  width: number
  placement: 'left' | 'right'
}

const ModalWrapper = styled.section<ModalWrapperProps>`
  display: flex;
  flex-direction: column;
  height: 100%;
  ${({ placement }) => (placement === 'left' ? 'left: 0;' : 'right: 0;')}
  overflow: hidden;
  padding: 0;
  position: fixed;
  top: 0;
  width: ${({ width }) => `${width}px`};
  z-index: var(--z-index-page-mobile-nav);

  color: var(--nav--color);
  background-color: var(--dialog--background-color);

  transition: width 0.2s;
`

/*
 * MOBILE NAVBAR
 */
const Item = styled.div<{ active?: boolean }>`
  align-items: center;
  display: flex;
  margin: 0 var(--spacing-narrow);
`

const Menu = styled.div`
  align-items: center;
  display: grid;
  margin: 0;
  padding: 0;

  list-style: none;

  grid-auto-flow: column;
  grid-gap: var(--spacing-2);

  ${Item}:first-of-type, ${Item}:last-of-type {
    margin-left: 0;
  }
`

export default HeaderMobile