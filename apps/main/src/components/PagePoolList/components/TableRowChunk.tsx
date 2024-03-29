import type { FormValues, PoolListTableLabel, SearchParams, TableRowProps } from '@/components/PagePoolList/types'
import type { NavigateFunction } from 'react-router'

import React, { useRef } from 'react'
import styled from 'styled-components'

import { ROUTE } from '@/constants'
import networks from '@/networks'
import useIntersectionObserver from 'ui/src/hooks/useIntersectionObserver'
import useStore from '@/store/useStore'

import Table from '@/ui/Table'
import TableRow from '@/components/PagePoolList/components/TableRow'
import TableRowMobile from '@/components/PagePoolList/components/TableRowMobile'

const TableRowChunk = ({
  rChainId,
  formValues,
  poolIds,
  searchParams,
  showDetail,
  showInPoolColumn,
  tableLabels,
  userActiveKey,
  navigate,
  setShowDetail,
}: {
  rChainId: ChainId
  formValues: FormValues
  poolIds: string[]
  searchParams: SearchParams
  showDetail: string
  showInPoolColumn: boolean
  tableLabels: PoolListTableLabel
  userActiveKey: string
  navigate: NavigateFunction
  setShowDetail: React.Dispatch<React.SetStateAction<string>>
}) => {
  const ref = useRef<HTMLTableRowElement>(null)
  const entry = useIntersectionObserver(ref, { freezeOnceVisible: false })

  const isXSmDown = useStore((state) => state.isXSmDown)
  const isMdUp = useStore((state) => state.isMdUp)
  const poolDataMapperCached = useStore((state) => state.storeCache.poolsMapper[rChainId])
  const poolDatasMapper = useStore((state) => state.pools.poolsMapper[rChainId])
  const themeType = useStore((state) => state.themeType)
  const userPoolList = useStore((state) => state.user.poolList[userActiveKey])

  const isVisible = !!entry?.isIntersecting
  const imageBaseUrl = networks[rChainId].imageBaseUrl

  return (
    <Tr ref={ref} count={poolIds.length} className={`${isVisible ? 'visible-section' : ''}`}>
      {isVisible && (
        <td colSpan={12}>
          <StyledTable>
            <tbody>
              {poolIds.map((poolId) => {
                const handleCellClick = (target: EventTarget, formType?: 'swap' | 'withdraw') => {
                  const { nodeName } = target as HTMLElement
                  if (nodeName !== 'A') {
                    // prevent click-through link from tooltip
                    if (formType) {
                      navigate(`${poolId}${formType === 'withdraw' ? ROUTE.PAGE_POOL_WITHDRAW : ROUTE.PAGE_SWAP}`)
                    } else {
                      navigate(`${poolId}${ROUTE.PAGE_POOL_DEPOSIT}`)
                    }
                  }
                }

                const poolDataCached = poolDataMapperCached?.[poolId]
                const poolData = poolDatasMapper?.[poolId]

                const tableRowProps: TableRowProps = {
                  rChainId,
                  formValues,
                  searchParams,
                  isInPool: userPoolList?.[poolId],
                  imageBaseUrl,
                  poolId,
                  poolData,
                  poolDataCachedOrApi: poolData ?? poolDataCached,
                  showInPoolColumn,
                  tableLabel: tableLabels,
                  userActiveKey,
                  handleCellClick,
                }

                return isXSmDown ? (
                  <TableRowMobile
                    key={poolId}
                    showDetail={showDetail}
                    themeType={themeType}
                    setShowDetail={setShowDetail}
                    {...tableRowProps}
                  />
                ) : (
                  <TableRow key={poolId} isMdUp={isMdUp} {...tableRowProps} />
                )
              })}
            </tbody>
          </StyledTable>
        </td>
      )}
    </Tr>
  )
}

const StyledTable = styled(Table)`
  width: 100%;
`

const Tr = styled.tr<{ count: number }>`
  height: ${({ count }) => `${count * 52}px`};
`

export default TableRowChunk
