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

<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import grid from '@zrm/motor-nx-media/grids/fileGrid'
import CellFile from '@zrm/motor-nx-core/components/admin/cell/File.vue'
import categoryRepository from '@zrm/motor-nx-admin/api/category'

// Load i18n module
const {t} = useI18n()

// Define columns for grid
const columns = ref([
  {
    name: t('motor-media.files.file'),
    prop: 'file',
    components: [{name: 'CellFile'}],
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
      {name: 'DeleteButton', options: {name: t('motor-admin.global.delete')}},
    ],
  },
])

// Define filters for grid
const filters = ref([
  {name: 'SearchFilter', options: {}},
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

const loadComponents = [
  {
    name: 'CellFile',
    object: CellFile,
  },
]

// WE START THE OUTSOURCED CODE HERE
const {rows, meta, refreshRecords, handleCellEvent} = grid()

onMounted(async () => {
  await refreshRecords();
  // Get catgories from api
  const categoryRepo = categoryRepository()
  const {data: response} = await categoryRepo.index({}, '1');
  for (let i = 0; i < response.value.data.length; i++) {
    filters.value[1].options.options.push({
      name: response.value.data[i].name,
      value: response.value.data[i].id,
    })
  }
})
</script>
