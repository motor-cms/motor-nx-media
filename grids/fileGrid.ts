import axios from 'axios'
import baseGrid from 'motor-nx-core/grids/baseGrid'
import modelRepository from 'motor-nx-media/api/file'

export default function fileGrid() {
  const repository = modelRepository(axios)

  const { rows, meta, refreshRecords, handleCellEvent } = baseGrid(
    repository,
    'motor-media.files'
  )

  return { rows, meta, refreshRecords, handleCellEvent }
}
