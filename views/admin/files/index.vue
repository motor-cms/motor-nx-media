<template>
  <AdminCommonGrid
    :name="$t('motor-media.files.files')"
    create-route="admin.motor-media.files.create"
    :create-label="$t('motor-media.files.new')"
    :rows="rows"
    :columns="columns"
    :meta="meta"
    :filters="filters"
    resource="files"
    :loadComponents="loadComponents"
    @submit="refreshRecords"
    @submit-cell="handleCellEvent"
  ></AdminCommonGrid>
</template>

<script lang="ts">
import AdminCommonGrid from 'motor-nx-core/components/admin/common/Grid.vue'
import { defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import EditButton from 'motor-nx-core/components/admin/cell/EditButton.vue'
import DeleteButton from 'motor-nx-core/components/admin/cell/DeleteButton.vue'
import grid from 'motor-nx-media/grids/fileGrid'
import CellFile from 'motor-nx-core/components/admin/cell/File.vue'
import axios from 'axios'
import categoryRepository from 'motor-nx-admin/api/category'

export default defineComponent({
  name: 'admin-motor-media.files',
  components: {
    AdminCommonGrid,
  },
  setup() {
    // Load i18n module
    const { t } = useI18n()

    // Define columns for grid
    const columns = ref([
      {
        name: t('motor-media.files.file'),
        prop: 'file',
        components: [{ name: 'CellFile' }],
      },
      {
        name: t('motor-media.files.name'),
        prop: 'file.file_name',
      },
      {
        name: t('motor-media.files.mime_type'),
        prop: 'file.mime_type',
      },
      {
        name: '',
        prop: 'actions',
        columnStyle: 'width: 200px',
        rowWrapperClass: 'justify-content-end',
        components: [
          {
            name: 'EditButton',
            options: {
              route: 'admin.motor-media.files.edit',
              name: t('global.edit'),
            },
          },
          { name: 'DeleteButton', options: { name: t('global.delete') } },
        ],
      },
    ])

    // Define filters for grid
    const filters = ref([
      { name: 'SearchFilter', options: {} },
      {
        name: 'SelectFilter',
        options: {
          parameter: 'category_id',
          emptyOption:
            t('global.filter') + ': ' + t('motor-admin.categories.category'),
          options: <any>[],
        },
      },
    ])

    // Get catgories from api
    const categoryRepo = categoryRepository(axios)
    categoryRepo.index({}, '1').then((response) => {
      for (let i = 0; i < response.data.data.length; i++) {
        filters.value[1].options.options.push({
          name: response.data.data[i].name,
          value: response.data.data[i].id,
        })
      }
    })

    const loadComponents = [
      {
        name: 'CellFile',
        object: CellFile,
      },
    ]

    // WE START THE OUTSOURCED CODE HERE
    const { rows, meta, refreshRecords, handleCellEvent } = grid()
    return {
      columns,
      filters,
      rows,
      meta,
      refreshRecords,
      loadComponents,
      handleCellEvent,
    }
  },
})
</script>
