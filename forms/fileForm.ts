import baseForm from 'motor-nx-core/forms/baseForm'
import {ref} from 'vue'
import {useI18n} from 'vue-i18n'
import modelRepository from 'motor-nx-media/api/file'
import categoryTreeRepository from 'motor-nx-admin/api/categoryTree'
import {toFormValidator} from '@vee-validate/zod';
import * as zod from 'zod';
import {Record} from "immutable";
import {useCoreFormData} from "~/packages/motor-nx-core/composables/form/formData";
import {useFormData} from "~/packages/motor-nx-media/composables/formData";

export default function fileForm() {
  // Load i18n module
  const {t, tm} = useI18n()

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
    files: [],
    file: {},
  })

  // Sanitize file data
  const sanitizer = async (formData: any) => {
      const tempFiles = []
      for (let i = 0; i < formData.files.length; i++) {
        if (formData.files[i].dataUrl !== '') {
          const startBase64 = formData.files[i].dataUrl.indexOf(',') + 1
          tempFiles.push({
            name: formData.files[i].name,
            dataUrl: formData.files[i].dataUrl.substring(startBase64),
          })
        }
      }
      formData.files = tempFiles
  }

  const {getData, onSubmit} = baseForm(
    'motor-media.files',
    'admin.motor-media.files',
    modelRepository(),
    model,
    schema,
    sanitizer
  )

  const { getRelevantFormData } = useCoreFormData()
  const { treeData, getCategoryData } = useFormData();

  onMounted(async () => {
    await getRelevantFormData(getData,[
      getCategoryData
    ],[
      getCategoryData,
    ]);
  })

  return {
    getData,
    onSubmit,
    model,
    treeData,
  }
}
