import { useOverlayTriggerState } from 'react-stately'
import styled from 'styled-components'
import { useState, useMemo } from 'react'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'
import { delayAction } from '@/ui/utils/helpers'

import ModalDialog from '@/ui/Dialog'
import Button from '@/ui/Button'
import UserInformation from './UserInformation'
import Icon from '@/ui/Icon'
import Box from '@/ui/Box'

type Props = {
  activeProposal: boolean
  testId?: string
  proposalId?: string
  votingPower: SnapshotVotingPower
  snapshotVotingPower: boolean
  className?: string
}

const VoteDialog = ({ activeProposal, testId, className, votingPower, snapshotVotingPower, proposalId }: Props) => {
  const overlayTriggerState = useOverlayTriggerState({})
  const [vote, setVote] = useState<boolean | null>(null)

  const isMobile = useStore((state) => state.isMobile)
  const { castVote } = useStore((state) => state.proposals)
  const { userVotesMapper } = useStore((state) => state.user)

  const handleClose = () => {
    if (isMobile) {
      delayAction(overlayTriggerState.close)
    } else {
      overlayTriggerState.close()
    }
  }

  console.log(userVotesMapper)

  return (
    <Wrapper className={className}>
      {activeProposal ? (
        votingPower.value === 0 ? (
          <VotingMessage>
            <Icon name="WarningSquareFilled" size={20} />
            {t`Voting power too low to participate in this proposal.`}
          </VotingMessage>
        ) : proposalId && userVotesMapper[proposalId] ? (
          <VotedMessageWrapper>
            <VotedMessage>{t`You have succesfully voted:`}</VotedMessage>
            <VotedMessage>
              {t`${userVotesMapper[proposalId].userVote ? 'For' : 'Against'}`}
              {userVotesMapper[proposalId].userVote ? (
                <Icon color="var(--chart-green)" name="CheckmarkFilled" size={16} />
              ) : (
                <Icon color="var(--chart-red)" name="Misuse" size={16} />
              )}
            </VotedMessage>
          </VotedMessageWrapper>
        ) : (
          <>
            <VoteDialogButton variant="filled" onClick={overlayTriggerState.open}>
              {t`Vote on Proposal`}
            </VoteDialogButton>
            {overlayTriggerState.isOpen && (
              <ModalDialog testId={testId} title={''} state={{ ...overlayTriggerState, close: handleClose }}>
                <Box flex>
                  <UserInformation snapshotVotingPower={snapshotVotingPower} votingPower={votingPower} noLink />
                </Box>
                <VoteButtonsWrapper
                  flex
                  flexGap="var(--spacing-2)"
                  margin="var(--spacing-4) 0 var(--spacing-3)"
                  flexJustifyContent="center"
                >
                  <Button variant="select" className={vote === true ? 'active' : ''} onClick={() => setVote(true)}>
                    {t`For`}
                  </Button>
                  <Button variant="select" className={vote === false ? 'active' : ''} onClick={() => setVote(false)}>
                    {t`Against`}
                  </Button>
                </VoteButtonsWrapper>
                <StyledButton
                  fillWidth
                  variant="icon-filled"
                  disabled={vote === null}
                  onClick={() => castVote(1, 'PARAMETER', vote!)}
                >
                  {t`Cast Vote`}
                </StyledButton>
              </ModalDialog>
            )}{' '}
          </>
        )
      ) : proposalId && userVotesMapper[proposalId] ? (
        <VotedMessageWrapper>
          <VotedMessage>{t`You have succesfully voted:`}</VotedMessage>
          <VotedMessage>
            {t`${userVotesMapper[proposalId].userVote ? 'For' : 'Against'}`}
            {userVotesMapper[proposalId].userVote ? (
              <Icon color="var(--chart-green)" name="CheckmarkFilled" size={16} />
            ) : (
              <Icon color="var(--chart-red)" name="Misuse" size={16} />
            )}
          </VotedMessage>
        </VotedMessageWrapper>
      ) : (
        <VotingMessage>{t`Voting has ended`}</VotingMessage>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const VoteButtonsWrapper = styled(Box)`
  padding: var(--spacing-3);
  background-color: var(--box_header--secondary--background-color);
`

const VotingMessage = styled.p`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2);
  color: var(--button_outlined--color);
  font-weight: var(--semi-bold);
  font-size: var(--font-size-1);
  line-height: 1.2;
  margin-right: auto;
  background-color: var(--box_header--secondary--background-color);
  svg {
    color: var(--warning-400);
  }
`

const VotedMessageWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--spacing-2);
  align-items: center;
  justify-content: space-between;
  background-color: var(--box_header--secondary--background-color);
  padding: var(--spacing-2);
`

const VotedMessage = styled.p`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-1);
  color: var(--button_outlined--color);
  font-weight: var(--bold);
  font-size: var(--font-size-1);
  line-height: 1.5;
`

const VoteDialogButton = styled(Button)`
  margin-right: auto;
`

const StyledButton = styled(Button)`
  margin-top: var(--spacing-1);
`

export default VoteDialog