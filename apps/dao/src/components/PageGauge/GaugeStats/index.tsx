import styled from 'styled-components'
import { t } from '@lingui/macro'

import SubTitleColumn, { SubTitleColumnData } from '@/components/SubTitleColumn'
import Box from '@/ui/Box'
import Loader from '@/ui/Loader'

interface GaugeStatsProps {
  gaugeData: GaugeFormattedData
  dataLoading: boolean
}

const GaugeStats = ({ gaugeData, dataLoading }: GaugeStatsProps) => (
  <Wrapper>
    <BoxedDataComp>
      {dataLoading ? (
        <>
          <Loader isLightBg skeleton={[65, 25]} />
          <Loader isLightBg skeleton={[35, 25]} />
        </>
      ) : (
        <>
          <h3>{gaugeData.title}</h3>
          {gaugeData.is_killed && <BoxedData isKilled>{t`Killed`}</BoxedData>}
          {gaugeData.platform && <BoxedData>{gaugeData.platform}</BoxedData>}
          {gaugeData.pool?.chain && <BoxedData>{gaugeData.pool.chain}</BoxedData>}
          {gaugeData.market?.chain && <BoxedData>{gaugeData.market.chain}</BoxedData>}
        </>
      )}
    </BoxedDataComp>
    <Box flex flexGap="var(--spacing-4)">
      <SubTitleColumn
        loading={dataLoading}
        title={t`Relative Weight`}
        data={<SubTitleColumnData>{gaugeData?.gauge_relative_weight.toFixed(2)}%</SubTitleColumnData>}
      />
      <SubTitleColumn
        loading={dataLoading}
        title={t`7d Delta`}
        data={
          <StyledSubTitleColumnData
            className={`${
              gaugeData?.gauge_relative_weight_7d_delta
                ? gaugeData?.gauge_relative_weight_7d_delta > 0
                  ? 'green'
                  : 'red'
                : ''
            }`}
          >
            {gaugeData?.gauge_relative_weight_7d_delta
              ? `${gaugeData?.gauge_relative_weight_7d_delta.toFixed(2)}%`
              : 'N/A'}
          </StyledSubTitleColumnData>
        }
      />
      <SubTitleColumn
        loading={dataLoading}
        title={t`60d Delta`}
        data={
          <StyledSubTitleColumnData
            className={`${
              gaugeData?.gauge_relative_weight_60d_delta
                ? gaugeData?.gauge_relative_weight_60d_delta > 0
                  ? 'green'
                  : 'red'
                : ''
            }`}
          >
            {gaugeData?.gauge_relative_weight_60d_delta
              ? `${gaugeData?.gauge_relative_weight_60d_delta.toFixed(2)}%`
              : 'N/A'}
          </StyledSubTitleColumnData>
        }
      />
    </Box>
  </Wrapper>
)

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  border-bottom: 1px solid var(--gray-500a20);
`

const BoxedDataComp = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--spacing-1);
  grid-row: 1 / 2;
  margin-left: auto;
  margin-right: var(--spacing-2);
  @media (min-width: 33.125rem) {
    display: flex;
    flex-direction: row;
    margin-left: 0;
  }
  h3 {
    margin-right: var(--spacing-1);
  }
`

const BoxedData = styled.p<{ isKilled?: boolean }>`
  padding: var(--spacing-1);
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  text-transform: capitalize;
  margin: auto 0 0;
  border: 1px solid ${({ isKilled }) => (isKilled ? 'var(--chart-red)' : 'var(--gray-500);')};
  color: ${({ isKilled }) => (isKilled ? 'var(--chart-red)' : 'inherit')};
  @media (min-width: 33.125rem) {
    margin: 0;
  }
`

const StyledSubTitleColumnData = styled(SubTitleColumnData)`
  margin-top: var(--spacing-2);
  &.green {
    color: var(--chart-green);
  }
  &.red {
    color: var(--chart-red);
  }
  &.open {
    font-size: var(--font-size-2);
  }
`

export default GaugeStats