import { TCell, Thead, Tr } from '@/ui/Table'
import { cellWidths } from '@/components/PagePoolList/utils'

const TableHeadMobile = ({ showInPoolColumn }: { showInPoolColumn: boolean }) => {
  return (
    <Thead>
      <Tr>
        {showInPoolColumn && <TCell {...cellWidths.wInPool}></TCell>}
        <TCell></TCell>
      </Tr>
    </Thead>
  )
}

export default TableHeadMobile
