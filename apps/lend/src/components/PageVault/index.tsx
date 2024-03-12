import type { FormType, VaultDepositFormType, VaultWithdrawFormType } from '@/components/PageVault/types'

import { t } from '@lingui/macro'
import { useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { getVaultPathname } from '@/utils/utilsRouter'
import { useSlideTabState } from '@/ui/hooks'

import { FormContent, FormContentWrapper, FormSlideTab } from '@/components/SharedFormStyles/styles'
import FormHeader from '@/components/SharedFormStyles/FormHeader'
import SlideTabsWrapper, { SlideTabs } from '@/ui/TabSlide'
import VaultDepositMint from '@/components/PageVault/VaultDepositMint'
import VaultWithdrawRedeem from '@/components/PageVault/VaultWithdrawRedeem'
import VaultStake from '@/components/PageVault/VaultStake'
import VaultUnstake from '@/components/PageVault/VaultUnstake'
import VaultClaim from '@/components/PageVault/VaultClaim'

const Vault = (pageProps: PageContentProps) => {
  const { rOwmId, rFormType, owmDataCachedOrApi } = pageProps
  const params = useParams()
  const navigate = useNavigate()
  const tabsRef = useRef<HTMLDivElement>(null)

  const { selectedTabIdx, tabPositions, setSelectedTabIdx } = useSlideTabState(tabsRef, rFormType)

  const FORM_TYPES: { key: FormType; label: string }[] = [
    { label: t`Deposit`, key: 'deposit' },
    { label: t`Withdraw`, key: 'withdraw' },
  ]

  const DEPOSIT_TABS: { label: string; formType: VaultDepositFormType }[] = [
    { label: t`Deposit`, formType: 'deposit' },
    { label: t`Stake`, formType: 'stake' },
  ]

  const WITHDRAW_TABS: { label: string; formType: VaultWithdrawFormType }[] = [
    { label: t`Withdraw`, formType: 'withdraw' },
    { label: t`Unstake`, formType: 'unstake' },
    { label: t`Claim Rewards`, formType: 'claim' },
  ]

  const tabs = !rFormType || rFormType === 'deposit' ? DEPOSIT_TABS : WITHDRAW_TABS

  return (
    <FormContent variant="primary" shadowed>
      <FormHeader
        formTypes={FORM_TYPES}
        activeFormKey={!rFormType ? 'deposit' : (rFormType as string)}
        handleClick={(key) => navigate(getVaultPathname(params, rOwmId, key))}
      />

      <FormContentWrapper grid gridRowGap={3} padding>
        {/* FORMS SELECTOR */}
        {tabs.length > 0 && (
          <SlideTabsWrapper activeIdx={selectedTabIdx}>
            <SlideTabs ref={tabsRef}>
              {tabs.map(({ label, formType }, idx) => {
                return (
                  <FormSlideTab
                    key={label}
                    disabled={selectedTabIdx === idx}
                    tabLeft={tabPositions[idx]?.left}
                    tabWidth={tabPositions[idx]?.width}
                    tabTop={tabPositions[idx]?.top}
                    onChange={() => setSelectedTabIdx(idx)}
                    tabIdx={idx}
                    label={label}
                  />
                )
              })}
            </SlideTabs>
          </SlideTabsWrapper>
        )}

        {/* FORMS */}
        {rFormType === '' || rFormType === 'deposit' ? (
          <>
            {selectedTabIdx === 0 && <VaultDepositMint {...pageProps} rFormType="deposit" />}
            {selectedTabIdx === 1 && <VaultStake {...pageProps} rFormType="stake" />}
          </>
        ) : rFormType === 'withdraw' ? (
          <>
            {selectedTabIdx === 0 && <VaultWithdrawRedeem {...pageProps} rFormType="withdraw" />}
            {selectedTabIdx === 1 && <VaultUnstake {...pageProps} rFormType="unstake" />}
            {selectedTabIdx === 2 && <VaultClaim {...pageProps} rFormType="claim" />}
          </>
        ) : null}
      </FormContentWrapper>
    </FormContent>
  )
}

export default Vault
