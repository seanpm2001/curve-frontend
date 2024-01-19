import type { PricesApiPool, PricesApiCoin, LabelList } from '@/ui/Chart/types'

import { useEffect, useState, useMemo } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import { combinations } from '@/components/PagePool/PoolDetails/PoolInfo/utils'
import Button from '@/ui/Button'
import ChartWrapper from '@/ui/Chart'
import Icon from '@/ui/Icon'
import PoolActivity from '@/components/PagePool/PoolDetails/PoolInfo/PoolActivity'
import { getThreeHundredResultsAgo } from '@/ui/Chart/utils'
import Box from '@/ui/Box'

type Props = {
  chainId: ChainId
  pricesApiPoolData: PricesApiPool
  routerParams: RouterParams
}

const PoolInfoData = ({ chainId, pricesApiPoolData, routerParams }: Props) => {
  const { rChainId } = routerParams
  const themeType = useStore((state) => state.themeType)
  const {
    pricesApiState: {
      chartOhlcData,
      chartStatus,
      selectedChartIndex,
      timeOption,
      chartExpanded,
      activityHidden,
      tradesTokens,
    },
    setChartSelectedIndex,
    setChartTimeOption,
    setChartExpanded,
    fetchPricesApiCharts,
    fetchPricesApiActivity,
  } = useStore((state) => state.pools)
  const isMdUp = useStore((state) => state.isMdUp)

  const [poolInfo, setPoolInfo] = useState<'chart' | 'poolActivity'>('chart')
  const [selectChartList, setSelectChartList] = useState<LabelList[]>([])
  const [isFlipped, setIsFlipped] = useState<boolean[]>([])

  const chartHeight = {
    expanded: 500,
    standard: 300,
  }

  const chartCombinations: PricesApiCoin[][] = useMemo(() => {
    const coins = pricesApiPoolData.coins.slice(0, pricesApiPoolData.n_coins)

    const combinationsArray = combinations(coins, 2)
    // adds combinations in case of basepool
    const extraCombinations = pricesApiPoolData.coins.slice(pricesApiPoolData.n_coins).map((item) => {
      return [item, coins[0]]
    })

    const combinedArray = [...combinationsArray]
    combinedArray.splice(0, 0, ...extraCombinations)

    return combinedArray
  }, [pricesApiPoolData.coins, pricesApiPoolData.n_coins])

  const chartTimeSettings = useMemo(() => {
    const threeHundredResultsAgo = getThreeHundredResultsAgo(timeOption)

    return {
      start: +threeHundredResultsAgo,
      end: Math.floor(Date.now() / 1000),
    }
  }, [timeOption])

  const chartInterval = useMemo(() => {
    if (timeOption === '15m') return 15
    if (timeOption === '30m') return 30
    if (timeOption === '1h') return 1
    if (timeOption === '4h') return 4
    if (timeOption === '6h') return 6
    if (timeOption === '12h') return 12
    if (timeOption === '1d') return 1
    if (timeOption === '7d') return 7
    return 14 // 14d
  }, [timeOption])

  const timeUnit = useMemo(() => {
    if (timeOption === '15m') return 'minute'
    if (timeOption === '30m') return 'minute'
    if (timeOption === '1h') return 'hour'
    if (timeOption === '4h') return 'hour'
    if (timeOption === '6h') return 'hour'
    if (timeOption === '12h') return 'hour'
    if (timeOption === '1d') return 'day'
    if (timeOption === '7d') return 'day'
    return 'day' // 14d
  }, [timeOption])

  const refetchPricesData = () => {
    fetchPricesApiCharts(
      chainId,
      selectedChartIndex,
      pricesApiPoolData.address,
      chartInterval,
      timeUnit,
      chartTimeSettings.end,
      chartTimeSettings.start,
      chartCombinations,
      isFlipped
    )
    fetchPricesApiActivity(chainId, pricesApiPoolData.address, chartCombinations)
  }

  // set snapshot data and subscribe to new data
  useEffect(() => {
    fetchPricesApiCharts(
      chainId,
      selectedChartIndex,
      pricesApiPoolData.address,
      chartInterval,
      timeUnit,
      chartTimeSettings.end,
      chartTimeSettings.start,
      chartCombinations,
      isFlipped
    )
  }, [
    chainId,
    chartCombinations,
    pricesApiPoolData.address,
    chartInterval,
    chartTimeSettings.end,
    chartTimeSettings.start,
    fetchPricesApiCharts,
    isFlipped,
    selectedChartIndex,
    timeUnit,
  ])

  useEffect(() => {
    const chartsList: LabelList[] =
      chartOhlcData.length !== 0
        ? [
            {
              label: t`LP Token (${pricesApiPoolData.coins[0].symbol})`,
            },
            {
              label: t`LP Token (USD)`,
            },
          ].concat(
            chartCombinations.map((chart, index) => {
              const mainTokenSymbol = isFlipped[index] ? chart[1].symbol : chart[0].symbol
              const referenceTokenSymbol = isFlipped[index] ? chart[0].symbol : chart[1].symbol

              return {
                label: `${referenceTokenSymbol} / ${mainTokenSymbol}`,
              }
            })
          )
        : []
    setSelectChartList(chartsList)
    // }
  }, [pricesApiPoolData.coins, chartCombinations, isFlipped, chartOhlcData.length])

  useEffect(() => {
    const flippedList = new Array(chartCombinations.length).fill(false)
    setIsFlipped(flippedList)
  }, [chartCombinations.length])

  const flipChart = () => {
    const updatedList = isFlipped.map((item, index) =>
      index === selectedChartIndex - 2 ? !isFlipped[selectedChartIndex - 2] : isFlipped[selectedChartIndex - 2]
    )
    setIsFlipped(updatedList)
  }

  return chartExpanded ? (
    <ExpandedWrapper activityHidden={activityHidden}>
      <Wrapper variant={'secondary'} chartExpanded={chartExpanded}>
        <ChartWrapper
          chartType="poolPage"
          chartStatus={chartStatus}
          chartHeight={chartHeight}
          chartExpanded={chartExpanded}
          themeType={themeType}
          ohlcData={chartOhlcData}
          selectChartList={selectChartList}
          selectedChartIndex={selectedChartIndex}
          setChartSelectedIndex={setChartSelectedIndex}
          timeOption={timeOption}
          setChartTimeOption={setChartTimeOption}
          refetchPricesData={refetchPricesData}
          flipChart={flipChart}
        />
      </Wrapper>
      <LpEventsWrapperExpanded>
        <PoolActivity
          chartExpanded={chartExpanded}
          coins={pricesApiPoolData.coins}
          tradesTokens={tradesTokens}
          poolAddress={pricesApiPoolData.address}
          chainId={rChainId}
          chartCombinations={chartCombinations}
          refetchPricesData={refetchPricesData}
        />
      </LpEventsWrapperExpanded>
    </ExpandedWrapper>
  ) : (
    <Wrapper chartExpanded={chartExpanded}>
      <SelectorRow>
        <SelectorButton
          variant={'text'}
          className={poolInfo === 'chart' ? 'active' : ''}
          onClick={() => setPoolInfo('chart')}
        >
          {t`Chart`}
        </SelectorButton>
        <SelectorButton
          variant={'text'}
          className={poolInfo === 'poolActivity' ? 'active' : ''}
          onClick={() => setPoolInfo('poolActivity')}
        >
          {t`Pool Activity`}
        </SelectorButton>
        {isMdUp && (
          <ExpandButton variant={'text'} onClick={() => setChartExpanded(!chartExpanded)}>
            {chartExpanded ? 'Minimize' : 'Expand'}
            <ExpandIcon name={chartExpanded ? 'Minimize' : 'Maximize'} size={16} aria-label={t`Expand chart`} />
          </ExpandButton>
        )}
      </SelectorRow>
      {pricesApiPoolData && poolInfo === 'poolActivity' && (
        <PoolActivity
          chartExpanded={chartExpanded}
          coins={pricesApiPoolData.coins}
          tradesTokens={tradesTokens}
          poolAddress={pricesApiPoolData.address}
          chainId={rChainId}
          chartCombinations={chartCombinations}
          refetchPricesData={refetchPricesData}
        />
      )}
      {poolInfo === 'chart' && (
        <ChartWrapper
          chartType="poolPage"
          chartStatus={chartStatus}
          chartHeight={chartHeight}
          chartExpanded={chartExpanded}
          themeType={themeType}
          ohlcData={chartOhlcData}
          selectChartList={selectChartList}
          selectedChartIndex={selectedChartIndex}
          setChartSelectedIndex={setChartSelectedIndex}
          timeOption={timeOption}
          setChartTimeOption={setChartTimeOption}
          flipChart={flipChart}
          refetchPricesData={refetchPricesData}
        />
      )}
    </Wrapper>
  )
}

const ExpandedWrapper = styled.div<{ activityHidden: boolean }>`
  display: grid;
  ${(props) =>
    !props.activityHidden
      ? 'grid-template-columns: 2fr 26.4375rem'
      : 'grid-template-columns: auto calc(var(--spacing-3) + var(--spacing-3))'}
`

const LpEventsWrapperExpanded = styled(Box)`
  padding: var(--spacing-3);
  background: var(--box--secondary--content--background-color);
`

const Wrapper = styled(Box)<{ chartExpanded: boolean }>`
  display: flex;
  flex-direction: column;
  padding: ${(props) => (props.chartExpanded ? 'var(--spacing-3)' : '0')};
`

const SelectorRow = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: var(--spacing-2);
`

const SelectorButton = styled(Button)`
  color: inherit;
  font: var(--font);
  font-size: var(--font-size-2);
  font-weight: bold;
  text-transform: none;
  opacity: 0.7;
  &.active {
    opacity: 1;
    border-bottom: 2px solid var(--page--text-color);
  }
`

const ExpandButton = styled(SelectorButton)`
  margin-left: auto;
  display: flex;
  align-content: center;
`

const ExpandIcon = styled(Icon)`
  margin-left: var(--spacing-1);
`

export default PoolInfoData
