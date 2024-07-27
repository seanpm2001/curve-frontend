/**
 * @file entities/gauge/query-keys.ts
 * @description This file defines the query keys used for React Query operations related to gauges in the Curve.fi DApp.
 * It's an integral part of the 'gauge' entity in the FSD architecture.
 *
 * The `gaugeKeys` object contains functions that generate consistent and type-safe query keys
 * for various gauge-related operations.
 *
 * These query keys are used throughout the application to ensure consistent caching,
 * refetching, and invalidation of gauge-related data in React Query.
 * They play a crucial role in maintaining a predictable and efficient data fetching strategy.
 */

import type {
  AddRewardParams,
  DepositRewardApproveParams,
  DepositRewardParams,
  GaugeQueryParams,
} from '@/entities/gauge/types'

export const gaugeKeys = {
  all: () => ['gauge'] as const,
  estimateGas: () => ['estimateGas'] as const,
  params: ({ chainId, poolId }: GaugeQueryParams) => [chainId, poolId] as const,
  gauge: (params: GaugeQueryParams) => [...gaugeKeys.all(), ...gaugeKeys.params(params)] as const,
  version: (params: GaugeQueryParams) => [...gaugeKeys.all(), 'version', ...gaugeKeys.params(params)] as const,
  status: (params: GaugeQueryParams) => [...gaugeKeys.all(), 'status', ...gaugeKeys.params(params)] as const,
  manager: (params: GaugeQueryParams) => [...gaugeKeys.all(), 'manager', ...gaugeKeys.params(params)] as const,
  distributors: (params: GaugeQueryParams) =>
    [...gaugeKeys.all(), 'distributors', ...gaugeKeys.params(params)] as const,
  isDepositRewardAvailable: (params: GaugeQueryParams) =>
    [...gaugeKeys.all(), 'isDepositRewardAvailable', ...gaugeKeys.params(params)] as const,
  depositRewardIsApproved: (params: DepositRewardApproveParams & GaugeQueryParams) =>
    [
      ...gaugeKeys.all(),
      'depositRewardIsApproved',
      ...gaugeKeys.params(params),
      params.rewardTokenId,
      params.amount,
    ] as const,
  addRewardToken: ({ chainId, poolId, rewardTokenId, distributorId }: AddRewardParams & GaugeQueryParams) =>
    [
      ...gaugeKeys.all(),
      'addRewardToken',
      ...gaugeKeys.params({ chainId, poolId }),
      rewardTokenId,
      distributorId,
    ] as const,
  depositRewardApprove: ({ chainId, poolId, rewardTokenId, amount }: DepositRewardApproveParams & GaugeQueryParams) =>
    [
      ...gaugeKeys.all(),
      'depositRewardApprove',
      ...gaugeKeys.params({ chainId, poolId }),
      rewardTokenId,
      amount,
    ] as const,
  depositReward: ({ chainId, poolId, rewardTokenId, amount, epoch }: DepositRewardParams & GaugeQueryParams) =>
    [
      ...gaugeKeys.all(),
      'depositReward',
      ...gaugeKeys.params({ chainId, poolId }),
      rewardTokenId,
      amount,
      epoch,
    ] as const,
  estimateGasDepositRewardApprove: ({
    chainId,
    poolId,
    rewardTokenId,
    amount,
  }: DepositRewardApproveParams & GaugeQueryParams) =>
    [
      ...gaugeKeys.all(),
      ...gaugeKeys.estimateGas(),
      'depositRewardApprove',
      ...gaugeKeys.params({ chainId, poolId }),
      rewardTokenId,
      amount,
    ] as const,
  estimateGasAddRewardToken: ({ chainId, poolId, rewardTokenId, distributorId }: AddRewardParams & GaugeQueryParams) =>
    [
      ...gaugeKeys.all(),
      ...gaugeKeys.estimateGas(),
      'addRewardToken',
      ...gaugeKeys.params({ chainId, poolId }),
      rewardTokenId,
      distributorId,
    ] as const,
  estimateGasDepositReward: ({
    chainId,
    poolId,
    rewardTokenId,
    amount,
    epoch,
  }: DepositRewardParams & GaugeQueryParams) =>
    [
      ...gaugeKeys.all(),
      ...gaugeKeys.estimateGas(),
      'depositReward',
      ...gaugeKeys.params({ chainId, poolId }),
      rewardTokenId,
      amount,
      epoch,
    ] as const,
} as const
