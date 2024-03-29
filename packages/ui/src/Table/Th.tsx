import styled from 'styled-components'

const Th = styled.th`
  padding-bottom: var(--spacing-1);
  padding-top: var(--spacing-2);
  padding-left: var(--spacing-2);
  padding-right: var(--spacing-2);
  vertical-align: bottom;

  &.noPadding {
    padding: 0;
  }
`

export default Th
