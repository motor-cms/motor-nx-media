import axios from 'axios'
import baseForm from 'motor-nx-core/forms/baseForm'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import modelRepository from 'motor-nx-media/api/file'
import categoryTreeRepository from 'motor-nx-admin/api/categoryTree'
import { toFormValidator } from '@vee-validate/zod';
import * as zod from 'zod';

export default function fileForm() {
  // Load i18n module
  const { t, tm } = useI18n()

  // Validation schema
  const schema = toFormValidator(
      zod.object({
        author: zod.string().min(3),
        categories: zod.number().array(),
      })
  )

  // Record
  const model = ref({
    id: 0,
    description: '',
    author: '',
    source: '',
    alt_text: '',
    categories: [],
    file: <any>{},
  })

  // Sanitize file data
  const sanitizer = async (formData: any) => {
    // Handle an array of files
    if (formData.file && Array.isArray(formData.file)) {
      const tempFiles = []
      for (let i = 0; i < formData.file.length; i++) {
        if (formData.file[i].dataUrl !== '') {
          const startBase64 = formData.file[i].dataUrl.indexOf(',') + 1
          tempFiles.push({
            name: formData.file[i].name,
            dataUrl: formData.file[i].dataUrl.substring(startBase64),
          })
        }
      }
      if (formData.file.length == 1) {
        formData.file = [tempFiles[0]]
      } else {
        formData.file = tempFiles
      }
    } else {
      // Handle a single file
      if (formData.file.dataUrl !== '') {
        const startBase64 = formData.file.dataUrl.indexOf(',') + 1
        formData.file = {
          name: formData.file.name,
          dataUrl: formData.file.dataUrl.substring(startBase64),
        }
      }
    }
  }

  const { getData, onSubmit } = baseForm(
    'motor-media.files',
    'admin.motor-media.files',
    modelRepository(axios),
    model,
    schema,
    sanitizer
  )

  const treeData = ref({})

  categoryTreeRepository(axios)
    .get(1)
    .then((response: any) => {
      treeData.value = response.data.data
    })

  return {
    getData,
    onSubmit,
    model,
    treeData,
  }
}
