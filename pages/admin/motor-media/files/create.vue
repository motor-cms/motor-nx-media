<template>
  <AdminCommonForm
    back-route="admin.motor-media.files"
    :title="title"
    @submit="onSubmit"
  >
    <h6 class="text-uppercase text-body text-xs font-weight-bolder">
      Basic information
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
              :value="model.description"
            ></FormsInputField>
          </div>
          <div class="col-md-6">
            <FormsInputField
              type="text"
              name="author"
              id="author"
              :label="$t('motor-media.files.author')"
              :value="model.author"
            ></FormsInputField>
          </div>
          <div class="col-md-6">
            <FormsInputField
              type="text"
              name="source"
              id="source"
              :label="$t('motor-media.files.source')"
              :value="model.source"
            ></FormsInputField>
          </div>
          <div class="col-md-6">
            <FormsInputField
              type="text"
              name="alt_text"
              id="alt_text"
              :label="$t('motor-media.files.alt_text')"
              :value="model.alt_text"
            ></FormsInputField>
          </div>
          <div class="col-md-12">
            <FileUploadField
              name="files"
              id="files"
              :allow-delete="true"
              :multiple="true"
              :label="$t('motor-media.files.file')"
              :value="model.files"
            ></FileUploadField>
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
<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import AdminCommonForm from '@zrm/motor-nx-core/components/admin/common/Form.vue'
import FormsInputField from '@zrm/motor-nx-core/components/forms/InputField.vue'
import FileUploadField from '@zrm/motor-nx-core/components/forms/FileUploadField.vue'
import FormsCheckboxTreeField from '@zrm/motor-nx-core/components/forms/CheckboxTreeField.vue'
import { useI18n } from 'vue-i18n'
import form from '@zrm/motor-nx-media/forms/fileForm'

export default defineComponent({
  name: 'admin-motor-media-files-create',
  components: {
    AdminCommonForm,
    FormsInputField,
    FormsCheckboxTreeField,
    FileUploadField,
  },
  setup() {
    // Load i18n module
    const { t } = useI18n()

    // Load form
    const { model, onSubmit, treeData } = form()

    // Set default action title
    const title = ref(t('motor-media.files.new'))

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

    return {
      model,
      title,
      onSubmit,
      treeData,
      multiple,
    }
  },
})
</script>
