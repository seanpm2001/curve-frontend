import type { PoolListTableLabel, TheadBtnProps } from '@/components/PagePoolList/types'

import React from 'react'
import { t } from '@lingui/macro'

import Box from '@/ui/Box'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'
import TheadSortButton from '@/ui/Table/TheadSortButton'

const TableHeadRewards = ({
  isLoading,
  tableLabels,
  ...props
}: TheadBtnProps & {
  isLoading: boolean
  tableLabels: PoolListTableLabel
}) => {
  return (
    <>
      <Box margin="0 0 var(--spacing-1) 0">
        {t`Rewards tAPR`}{' '}
        <IconTooltip placement="top">{t`Token APR based on current prices of tokens and reward rates`}</IconTooltip>
      </Box>
      <Box flex flexAlignItems="center" flexJustifyContent="flex-end" gridGap={1}>
        <TheadSortButton sortIdKey="rewardsCrv" nowrap {...props} loading={isLoading}>
          {tableLabels.rewardsCrv.name}
        </TheadSortButton>
        +
        <TheadSortButton sortIdKey="rewardsOther" nowrap {...props} loading={isLoading}>
          {tableLabels.rewardsOther.name}
        </TheadSortButton>
      </Box>
    </>
  )
}

export default TableHeadRewards
