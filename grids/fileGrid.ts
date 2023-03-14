import baseGrid from '@zrm/motor-nx-core/grids/baseGrid'
import modelRepository from '../api/file'

export default function fileGrid() {
  const repository = modelRepository()

  const { rows, meta, refreshRecords, handleCellEvent } = baseGrid(
    repository,
    'motor-media.files'
  )

  return { rows, meta, refreshRecords, handleCellEvent }
}
