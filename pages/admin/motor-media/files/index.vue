<template>
  <AdminCommonGrid
    :name="$t('motor-media.files.files')"
    create-route="admin.motor-media.files.create"
    :create-label="$t('motor-media.files.create')"
    :rows="rows"
    :columns="columns"
    :meta="meta"
    :filters="filters"
    resource="files"
    :loadComponents="loadComponents"
    @submit="refreshGridData"
    @submit-cell="handleCellEvent"
  ></AdminCommonGrid>
</template>

<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import grid from '@zrm/motor-nx-media/grids/fileGrid'
import CellFile from '@zrm/motor-nx-core/components/admin/cell/File.vue'
import categoryRepository from '@zrm/motor-nx-admin/api/category'
import categoryTreeForm from "@zrm/motor-nx-admin/forms/categoryTreeForm";
import {CategoryScopes} from "@zrm/motor-nx-admin/types/categories.enums";
const route = useRoute();

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

const refreshGridData = async (params = {}) => {
  const appStore = useAppStore();
  appStore.updateInBackground(true);
  await refreshRecords(params)
  appStore.updateInBackground(false);
}

await refreshRecords(route.query);

const form = categoryTreeForm();

// Get catgories from api
await form.getCategoryDataByScope(CategoryScopes.MEDIA);

for (let i = 0; i < form.treeData.value.children.length; i++) {
  filters.value[1].options.options.push({
    name: form.treeData.value.children[i].name,
    value: form.treeData.value.children[i].id,
  })
}

</script>
