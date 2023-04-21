<template>
  <AdminCommonForm
    :back-route="routeParser.routeDottedToSlash('admin.motor-media.files')"
    :title="title"
    @submit="onSubmit"
  >
    <h6 class="text-uppercase text-body text-xs font-weight-bolder">
      Basic information
    </h6>
    {{model}}
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
              name="file"
              :allow-delete="true"
              id="file"
              :label="$t('motor-media.files.file')"
              v-model="model.file"
            ></FormsFileUploadField>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <FormsCheckboxTreeField
          name="categories"
          id="categories"
          :label="$t('motor-admin.categories.categories')"
          :value="model.categories"
          :tree="treeData.children"
        ></FormsCheckboxTreeField>
      </div>
    </div>
  </AdminCommonForm>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import fileForm from '@zrm/motor-nx-media/forms/fileForm'
import useRouteParser from "@zrm/motor-nx-core/composables/route/parse";

const routeParser = useRouteParser();

// Load i18n module
const { t } = useI18n()

// Load form
const { model, onSubmit, treeData, form} = fileForm()

// Set default action title
const title = ref(t('motor-media.files.new'))

// FIXME: this is buggy (/see FormFileField)
const multiple = ref(false)

// Sanitize roles
watch(model, () => {
  const checkAgainst = Object.entries(model.value.categories)

  const options = []
  for (const object of checkAgainst) {
    const checkObject: any = object
    if (checkObject[1]) {
      options.push(checkObject[1]['id'])
    }
  }
  model.value.categories = options
})
</script>
