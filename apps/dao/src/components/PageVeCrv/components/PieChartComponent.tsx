import styled from 'styled-components'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useState } from 'react'

import { shortenTokenAddress } from '@/ui/utils'

import CustomTooltip from './TopHoldersBarChartTooltip'

type Props = {
  data: VeCrvHolder[]
  filter: TopHoldersSortBy
}

type CustomLabelProps = {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
  index: number
  payload: VeCrvHolder
}

const COLORS = [
  '#f94144',
  '#f3722c',
  '#F8961E',
  '#F9844A',
  '#F9C74F',
  '#90BE6D',
  '#43AA8B',
  '#4D908E',
  '#577590',
  '#277DA1',
]

const PieChartComponent = ({ data, filter }: Props) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const height = 300

  return (
    <Wrapper chartHeight={height}>
      <InnerWrapper>
        <ResponsiveContainer width={'99%'} height={height}>
          <PieChart width={300} height={300}>
            <Pie
              dataKey={filter}
              nameKey="user"
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={CustomLabel}
              stroke="var(--box--secondary--background-color)"
              strokeWidth={0.5}
              labelLine={false}
              style={{ outline: 'none' }}
              isAnimationActive={false}
              // onMouseEnter={(_, index) => setActiveIndex(index)}
              // onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((item, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={activeIndex === index ? 0.8 : 1}
                />
              ))}
            </Pie>
            <Tooltip content={CustomTooltip} />
          </PieChart>
        </ResponsiveContainer>
      </InnerWrapper>
    </Wrapper>
  )
}

// Custom label component
const CustomLabel = ({ payload, cx, cy, midAngle, outerRadius, index }: CustomLabelProps) => {
  if (payload.weight_ratio > 1.7) {
    const RADIAN = Math.PI / 180
    // Calculate the starting point at the edge of the pie slice
    const startRadius = outerRadius * 0.99 // Slightly inside the outer edge to ensure visibility
    const startX = cx + startRadius * Math.cos(-midAngle * RADIAN)
    const startY = cy + startRadius * Math.sin(-midAngle * RADIAN)

    // Calculate the label position further out
    const labelRadius = outerRadius * 1.2
    const labelX = cx + labelRadius * Math.cos(-midAngle * RADIAN)
    const labelY = cy + labelRadius * Math.sin(-midAngle * RADIAN)

    // Calculate the shortened line endpoint
    const shorteningFactor = 10 // 5 pixels shorter
    const adjustedLineX = labelX - shorteningFactor * Math.cos(-midAngle * RADIAN)
    const adjustedLineY = labelY - shorteningFactor * Math.sin(-midAngle * RADIAN)

    const linePath = `M${startX},${startY} L${adjustedLineX},${adjustedLineY}`

    return (
      <>
        <path d={linePath} stroke={COLORS[index % COLORS.length]} strokeWidth={1} fill="none" />
        <CellLabel
          key={`label-${index}`}
          x={labelX}
          y={labelY}
          dy={3}
          fill="var(--page--text-color)"
          textAnchor={labelX > cx ? 'start' : 'end'}
        >
          {payload.user.length > 10 ? shortenTokenAddress(payload.user) : payload.user} ({payload.weight_ratio}%)
        </CellLabel>
      </>
    )
  }
  return null
}

const Wrapper = styled.div<{ chartHeight: number }>`
  width: 100%;
  height: ${({ chartHeight }) => `${chartHeight}px`};
  position: relative;
  margin: 0 auto;
`

const InnerWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`

const CellLabel = styled.text`
  font-size: var(--font-size-1);
  fill: var(--page--text-color);
  font-weight: var(--bold);
`

export default PieChartComponent