import baseForm from '@zrm/motor-nx-core/forms/baseForm'
import {ref} from 'vue'
import {useI18n} from 'vue-i18n'
import modelRepository from '@zrm/motor-nx-media/api/file'
import {useCoreFormData} from "@zrm/motor-nx-core/composables/form/formData";
import {object, string, number, date, InferType, array} from 'yup';
import {useFormData} from "@zrm/motor-nx-admin/composables/formData";

export default function fileForm() {
  // Load i18n module
  const {t, tm} = useI18n()

  // Validation schema
  const schema = object(
    {
      author: string().min(3),
      categories: array().of(number())
    }
  )

  let userSchema = object({
    name: string().required(),
    age: number().required().positive().integer(),
    email: string().email(),
    website: string().url().nullable(),
    createdOn: date().default(() => new Date()),
  });

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
