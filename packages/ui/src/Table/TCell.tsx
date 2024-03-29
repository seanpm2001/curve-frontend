import styled from 'styled-components'

const TCell = styled.td<{
  $isBold?: boolean
  $paddingLeft?: boolean
  $paddingRight?: boolean
  $noPadding?: boolean
  $center?: boolean
  $left?: boolean
  $right?: boolean
  $w20?: boolean
  $w130?: boolean
  $w240?: boolean
}>`
  border-bottom: 1px solid var(--border-400);

  &.active {
    color: var(--box--primary--color);
    background-color: var(--table_detail_row--active--background-color);
  }

  ${({ $isBold }) => $isBold && `font-weight: bold;`}

  padding-top: var(--spacing-2);
  padding-bottom: var(--spacing-1);
  padding-left: ${({ $paddingLeft }) => ($paddingLeft ? 'var(--spacing-narrow)' : 'var(--spacing-2)')};
  padding-right: ${({ $paddingRight }) => ($paddingRight ? 'var(--spacing-narrow)' : 'var(--spacing-2)')};
  ${({ $noPadding }) => $noPadding && `padding: 0;`}

  ${({ $center }) => $center && `text-align: center;`}
  ${({ $left }) => $left && `text-align: left;`}
  ${({ $right }) => $right && `text-align: right;`}

  ${({ $w20 }) => $w20 && `width: 20px;`}
  ${({ $w130 }) => $w130 && `width: 130px;`}
  ${({ $w240 }) => $w240 && `width: 240px;`}
`

export default TCell
