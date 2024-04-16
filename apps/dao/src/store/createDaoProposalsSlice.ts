import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import Fuse from 'fuse.js'
import orderBy from 'lodash/orderBy'
import produce from 'immer'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  proposalsLoading: boolean
  filteringProposalsLoading: boolean
  pricesProposalLoading: boolean
  proposalsMapper: { [voteId: string]: ProposalData }
  proposals: ProposalData[]
  currentProposal: PricesProposalData | null
  searchValue: string
  activeFilter: ProposalListFilter
  activeSortBy: SortByFilter
  activeSortDirection: ActiveSortDirection
}

const sliceKey = 'daoProposals'

// prettier-ignore
export type DaoProposalsSlice = {
  [sliceKey]: SliceState & {
    getProposals(curve: CurveApi): void
    getProposal(voteId: number, voteType: string): void
    setSearchValue(searchValue: string): void
    setActiveFilter(filter: ProposalListFilter): void
    setActiveSortBy(sortBy: SortByFilter): void
    setActiveSortDirection(direction: ActiveSortDirection): void
    selectFilteredSortedProposals(): ProposalData[]
    setProposals(activeFilter: ProposalListFilter, searchValue: string): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  proposalsLoading: false,
  filteringProposalsLoading: false,
  pricesProposalLoading: false,
  currentProposal: null,
  searchValue: '',
  activeFilter: 'all',
  activeSortBy: 'voteId',
  activeSortDirection: 'desc',
  proposalsMapper: {},
  proposals: [],
}

// units of gas used * (base fee + priority fee)
// estimatedGas * (base fee * maxPriorityFeePerGas)

const createDaoProposalsSlice = (set: SetState<State>, get: GetState<State>): DaoProposalsSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    getProposals: async (curve: CurveApi) => {
      get()[sliceKey].setStateByKey('proposalsLoading', true)

      try {
        const proposals = await curve.dao.getProposalList()

        let proposalsObject: { [voteId: string]: ProposalData } = {}

        for (const proposal of proposals) {
          const minAcceptQuorumPercent = convertNumber(+proposal.minAcceptQuorum) * 100
          const totalVeCrv = convertNumber(+proposal.totalSupply)
          const quorumVeCrv = (minAcceptQuorumPercent / 100) * totalVeCrv
          const votesFor = convertNumber(+proposal.votesFor)
          const votesAgainst = convertNumber(+proposal.votesAgainst)
          const totalVotesPercentage = ((votesFor + votesAgainst) / totalVeCrv) * 100

          const status = getProposalStatus(proposal.startDate, quorumVeCrv, votesFor, votesAgainst)

          proposalsObject[`${proposal.voteId}-${proposal.voteType}`] = {
            ...proposal,
            status: status,
            votesFor,
            votesAgainst,
            minAcceptQuorumPercent,
            quorumVeCrv,
            totalVeCrv,
            totalVotes: votesFor + votesAgainst,
            totalVotesPercentage,
          }
        }

        get()[sliceKey].setStateByKey('proposalsMapper', proposalsObject)
        get().storeCache.setStateByKey('proposalsMapper', proposalsObject)
        get()[sliceKey].setStateByKey('proposalsLoading', false)
      } catch (error) {
        console.log(error)
      }
    },
    getProposal: async (voteId: number, voteType: string) => {
      get()[sliceKey].setStateByKey('pricesProposalLoading', true)

      try {
        const proposalFetch = await fetch(`https://prices.curve.fi/v1/dao/proposals/details/${voteType}/${voteId}`)
        const proposal: PricesProposalData = await proposalFetch.json()

        const formattedVotes = proposal.votes
          .map((vote: PricesProposalData['votes'][number]) => ({
            ...vote,
            voting_power: +vote.voting_power / 10 ** 18,
            relative_power: (+vote.voting_power / +proposal.total_supply) * 100,
          }))
          .sort()
        const sortedVotes = formattedVotes.sort(
          (a: PricesProposalData['votes'][number], b: PricesProposalData['votes'][number]) =>
            +b.voting_power - +a.voting_power
        )

        set(
          produce((state: State) => {
            state[sliceKey].pricesProposalLoading = false
            state[sliceKey].currentProposal = {
              ...proposal,
              votes: sortedVotes,
            }
          })
        )
      } catch (error) {
        console.log(error)
      }
    },
    selectFilteredSortedProposals: () => {
      const { proposalsMapper, activeSortBy, activeSortDirection, activeFilter } = get()[sliceKey]

      let proposalsCopy = [...Object.values(proposalsMapper)]

      // filter
      if (activeFilter !== 'all') {
        proposalsCopy = Object.values(proposalsMapper).filter(
          (proposal) => proposal.status.toLowerCase() === activeFilter
        )
      }

      let sortedProposals = proposalsCopy
      let passedProposals = []
      if (activeSortBy === 'endingSoon') {
        // to-do: fix timestamp not being in sync with other proposal countdowns
        const currentTimestamp = Math.floor(Date.now() / 1000)
        sortedProposals = proposalsCopy.filter((proposal) => proposal.startDate + 604800 > currentTimestamp)
        passedProposals = orderBy(
          proposalsCopy.filter((proposal) => proposal.startDate + 604800 < currentTimestamp),
          ['voteId'],
          ['desc']
        )

        if (activeSortDirection === 'asc') {
          sortedProposals = orderBy(
            sortedProposals,
            [(proposal) => proposal.startDate + 604800 - currentTimestamp],
            ['desc']
          )
          sortedProposals = [...sortedProposals, ...passedProposals]
        } else {
          sortedProposals = orderBy(
            sortedProposals,
            [(proposal) => proposal.startDate + 604800 - currentTimestamp],
            ['asc']
          )
          sortedProposals = [...sortedProposals, ...passedProposals]
        }
      } else {
        sortedProposals = orderBy(proposalsCopy, [activeSortBy], [activeSortDirection])
      }

      return sortedProposals
    },
    setProposals: (activeFilter: ProposalListFilter, searchValue: string) => {
      const { selectFilteredSortedProposals } = get()[sliceKey]
      get()[sliceKey].setStateByKey('filteringProposalsLoading', true)

      setTimeout(() => {
        const proposals = selectFilteredSortedProposals()

        if (searchValue !== '') {
          const searchFilteredProposals = searchFn(searchValue, proposals)
          get()[sliceKey].setStateByKeys({
            filteringProposalsLoading: false,
            proposals: searchFilteredProposals,
          })
          return searchFilteredProposals
        }

        get()[sliceKey].setStateByKeys({
          filteringProposalsLoading: false,
          proposals: proposals,
        })
      }, 1000)
    },
    setSearchValue: (filterValue) => {
      get()[sliceKey].setStateByKey('searchValue', filterValue)
    },
    setActiveFilter: (filter: ProposalListFilter) => {
      get()[sliceKey].setStateByKey('activeFilter', filter)
    },
    setActiveSortDirection: (direction: ActiveSortDirection) => {
      get()[sliceKey].setStateByKey('activeSortDirection', direction)
    },
    setActiveSortBy: (sortBy: SortByFilter) => {
      get()[sliceKey].setStateByKey('activeSortBy', sortBy)
    },
    setStateByKey: (key, value) => {
      get().setAppStateByKey(sliceKey, key, value)
    },
    setStateByKeys: (sliceState) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, DEFAULT_STATE)
    },
  },
})

const getProposalStatus = (startDate: number, quorumVeCrv: number, votesFor: number, votesAgainst: number) => {
  const totalVotes = votesFor + votesAgainst
  const passedQuorum = totalVotes >= quorumVeCrv

  if (startDate + 604800 > Math.floor(Date.now() / 1000)) return 'Active'
  if (passedQuorum && votesFor > votesAgainst) return 'Passed'
  return 'Denied'
}

const convertNumber = (number: number) => {
  return number / 10 ** 18
}

const searchFn = (filterValue: string, proposals: ProposalData[]) => {
  const fuse = new Fuse<ProposalData>(proposals, {
    ignoreLocation: true,
    threshold: 0.3,
    includeScore: true,
    keys: [
      'voteId',
      'creator',
      'voteType',
      {
        name: 'metaData',
        getFn: (proposal) => {
          // Preprocess the metaData field
          const metaData = proposal.metadata || ''
          return metaData.toLowerCase()
        },
      },
    ],
  })

  const result = fuse.search(filterValue, { limit: 10 })

  console.log('result', result)

  return result.map((r) => r.item)
}

export default createDaoProposalsSlice