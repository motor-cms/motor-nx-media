<template>
  <AdminCommonForm
    back-route="admin.motor-media.files"
    :title="title"
    @submit="onSubmit"
  >
    <h6 class="text-uppercase text-body text-xs font-weight-bolder">
      {{ $t('motor-admin.global.basic_information')}}
    </h6>
    <div class="row">
      <div class="col-md-8">
        <div class="row">
          <div class="col-md-6">
            <FormsInputField
              type="text"
              name="description"
              id="description"
              :label="$t('motor-media.files.description')"
              v-model="model.description"
            ></FormsInputField>
          </div>
          <div class="col-md-6">
            <FormsInputField
              type="text"
              name="author"
              id="author"
              :label="$t('motor-media.files.author')"
              v-model="model.author"
            ></FormsInputField>
          </div>
          <div class="col-md-6">
            <FormsInputField
              type="text"
              name="source"
              id="source"
              :label="$t('motor-media.files.source')"
              v-model="model.source"
            ></FormsInputField>
          </div>
          <div class="col-md-6">
            <FormsInputField
              type="text"
              name="alt_text"
              id="alt_text"
              :label="$t('motor-media.files.alt_text')"
              v-model="model.alt_text"
            ></FormsInputField>
          </div>
          <div class="col-md-12">
            <FormsFileUploadField
              name="files"
              id="files"
              :allow-delete="true"
              :multiple="true"
              :label="$t('motor-media.files.file')"
              v-model="model.files"
              :fullScreenDragAndDrop="true"
            ></FormsFileUploadField>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <FormsCheckboxTreeField
          name="categories"
          id="categories"
          :label="$t('motor-admin.categories.categories')"
          v-model="model.categories"
          :tree="treeData.children"
        ></FormsCheckboxTreeField>
      </div>
    </div>
  </AdminCommonForm>
</template>
<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import fileForm from '@zrm/motor-nx-media/forms/fileForm'
import {CategoryScopes} from "@zrm/motor-nx-admin/types/categories.enums";

// Load i18n module
const {t} = useI18n()

// Load form
const {model, onSubmit, treeData, form, getCategoryDataByScope} = fileForm()

// Set default action title
const title = ref(t('motor-media.files.create'))

const multiple = ref(false)

await getCategoryDataByScope(CategoryScopes.MEDIA)
model.value.categories = model.value.categories.map((category) => {
  return category.id
})
</script>
