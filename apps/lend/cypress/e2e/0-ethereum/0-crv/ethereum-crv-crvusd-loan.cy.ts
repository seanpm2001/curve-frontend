import createLoanSettings from '@/cy/fixtures/create-loan-settings.json'
import markets from '@/cy/fixtures/markets.json'
import tokens from '@/cy/fixtures/tokens.json'
import { ethers } from 'ethers'

const CHAIN = 'Ethereum'
const MARKET_ID = 'CRV-crvUSD'
describe(`Lend ${MARKET_ID} ${CHAIN} market`, () => {
  const market = markets[CHAIN][MARKET_ID]
  const settings = createLoanSettings[CHAIN][MARKET_ID]
  const collateralToken = tokens[CHAIN][market.collateral]

  const borrowToken = tokens[CHAIN][market.borrow]
  const borrowTokenAmount = 1

  beforeEach(() => {
    // prepare wallet
    cy.createJsonRpcProvider()
      .as('jsonRpcProvider', { type: 'static' })
      .connectFaucetWallet()
      .as('faucetWallet', { type: 'static' })
    cy.get('@jsonRpcProvider')
      .createRandomWallet()
      .as('wallet', { type: 'static' })
      .prepareMetamaskWallet()
      .allocateEth(settings.ethersToAllocate)
      .allocateERC20Tokens(collateralToken.address, settings.collateralTokenToAllocate)

    // prepare page
    cy.intercept('GET', 'https://api.curve.fi/api/**').as('getAPI')
    cy.visit(market.url)
    cy.wait('@getAPI').its('response.statusCode').should('equal', 200)

    // connect metamask
    cy.get('@wallet').connectMetamask()
  })

  it('Create max amount soft liquidation loan', () => {
    cy.dataTestId('btn-approval').as('btnApproval').should('be.disabled')
    cy.dataTestId('btn-create').as('btnCreate').should('be.disabled')

    cy.inputMaxCollateral(settings.collateralTokenToAllocate)

    cy.inputMaxBorrow()

    cy.approveSpending()

    cy.createSofLiquidationLoan()

    cy.get<ethers.HDNodeWallet>('@wallet')
      .balanceOfErc20(borrowToken.address)
      .then(($tokenBalance) => {
        cy.get<string>('@debtAmount').then(($debtAmount) =>
          expect($tokenBalance).to.be.equal(ethers.parseUnits($debtAmount, borrowToken.decimals))
        )
      })
    cy.get<ethers.HDNodeWallet>('@wallet').balanceOfErc20(collateralToken.address).should('eq', BigInt(0))
  })
})
