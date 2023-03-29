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
      id: number().nullable(),
      client_id: number().nullable(),
      description: string().nullable(),
      author: string().min(3).nullable(),
      source: string().nullable(),
      alt_text: string().nullable(),
      is_global: number().nullable(),
      categories: array().of(number()).min(1).required(),
      files: array().min(1).required(),
      file: object().nullable()
    }
  )

  let userSchema = object({
    name: string().required(),
    age: number().required().positive().integer(),
    email: string().email(),
    website: string().url().nullable(),
    createdOn: date().default(() => new Date()),
  });

  type FileForm = InferType<typeof schema>;

  // Record
  const model = ref<FileForm>({
    id: null,
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
