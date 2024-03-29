import type { PagePoolList, SearchParams } from '@/components/PagePoolList/types'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import chunk from 'lodash/chunk'
import styled from 'styled-components'

import { DEFAULT_FORM_STATUS, _getActiveKey } from '@/store/createPoolListSlice'
import api from '@/lib/curvejs'
import useStore from '@/store/useStore'

import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import Table from '@/ui/Table'
import TableHead from '@/components/PagePoolList/components/TableHead'
import TableHeadMobile from '@/components/PagePoolList/components/TableHeadMobile'
import TableRowChunk from '@/components/PagePoolList/components/TableRowChunk'
import TableRowNoResults from '@/components/PagePoolList/components/TableRowNoResults'
import TableSettings from '@/components/PagePoolList/components/TableSettings'

const PoolList = (pageProps: PagePoolList) => {
  const { rChainId, curve, searchParams, tableLabels, updatePath } = pageProps
  const navigate = useNavigate()

  const activeKey = _getActiveKey(rChainId, searchParams)
  const prevActiveKey = useStore((state) => state.poolList.activeKey)
  const formStatus = useStore((state) => state.poolList.formStatus[activeKey] ?? DEFAULT_FORM_STATUS)
  const formValues = useStore((state) => state.poolList.formValues)
  const isMdUp = useStore((state) => state.isMdUp)
  const isXSmDown = useStore((state) => state.isXSmDown)
  const isLoadingApi = useStore((state) => state.isLoadingApi)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const results = useStore((state) => state.poolList.result)
  const resultCached = useStore((state) => state.storeCache.poolListResult[activeKey])
  const showHideSmallPools = useStore((state) => state.poolList.showHideSmallPools)
  const userActiveKey = api.helpers.getUserActiveKey(curve)
  const userPoolList = useStore((state) => state.user.poolList[userActiveKey])
  const setFormValues = useStore((state) => state.poolList.setFormValues)

  const [showDetail, setShowDetail] = useState('')

  const searchParamActiveKey = _getSearchParamActiveKey(searchParams)
  const result = results[activeKey] ?? _getPrevResult(activeKey, prevActiveKey, results) ?? resultCached

  const updateFormValues = useCallback(
    (searchParams: SearchParams, shouldRefetch?: boolean) => {
      setFormValues(rChainId, searchParams, isLoadingApi ? null : curve, shouldRefetch)
    },
    [setFormValues, rChainId, isLoadingApi, curve]
  )

  const resultChunk = useMemo(
    () =>
      typeof result !== 'undefined' && Array.isArray(result) && result.length > 0
        ? chunk(result, isMdUp ? 30 : 15)
        : null,
    [isMdUp, result]
  )

  // init
  useEffect(() => {
    if (!!searchParams && !isLoadingApi && isPageVisible) {
      updateFormValues(searchParams)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingApi, searchParamActiveKey])

  useEffect(() => {
    if (isPageVisible) {
      // updateFormValues(searchParams, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPageVisible])

  const showInPoolColumn = Object.keys(userPoolList ?? {}).length > 0
  let colSpan = isMdUp ? 7 : 4
  if (showHideSmallPools) {
    colSpan++
  }

  return (
    <>
      <TableSettings {...pageProps} activeKey={activeKey} result={result} />
      <StyledTable>
        {isXSmDown ? (
          <TableHeadMobile showInPoolColumn={showInPoolColumn} />
        ) : (
          <TableHead
            isLoading={isLoadingApi || formStatus.isLoading}
            isMdUp={isMdUp}
            searchParams={searchParams}
            showInPoolColumn={showInPoolColumn}
            tableLabels={tableLabels}
            updatePath={updatePath}
          />
        )}
        <tbody>
          {formStatus.noResult ? (
            <TableRowNoResults searchParams={searchParams} updatePath={updatePath} />
          ) : Array.isArray(resultChunk) && resultChunk.length > 0 ? (
            resultChunk.map((chunk: string[], idx) => (
              <TableRowChunk
                key={`chunk-${idx}`}
                rChainId={rChainId}
                formValues={formValues}
                poolIds={chunk}
                searchParams={searchParams}
                showDetail={showDetail}
                showInPoolColumn={showInPoolColumn}
                tableLabels={tableLabels}
                userActiveKey={userActiveKey}
                navigate={navigate}
                setShowDetail={setShowDetail}
              />
            ))
          ) : (
            <tr>
              <td colSpan={colSpan}>
                <SpinnerWrapper>
                  <Spinner />
                </SpinnerWrapper>
              </td>
            </tr>
          )}
        </tbody>
      </StyledTable>
    </>
  )
}

const StyledTable = styled(Table)`
  .w20 {
    width: 20px;
  }
  .w240 {
    width: 240px;
  }
  .w130 {
    width: 130px;
  }
`

function _getPrevResult(activeKey: string, prevActiveKey: string, results: { [activeKey: string]: string[] }) {
  const isSameChainId = activeKey.split('-')[0] === prevActiveKey.split('-')[0]
  return isSameChainId ? results[prevActiveKey] : undefined
}

function _getSearchParamActiveKey(searchParam: SearchParams) {
  const { filterKey, hideSmallPools, searchText, sortBy, sortByOrder } = searchParam
  return `${filterKey}-${hideSmallPools}-${searchText}-${sortBy}-${sortByOrder}`
}

export default PoolList
