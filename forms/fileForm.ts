import baseForm from '@zrm/motor-nx-core/forms/baseForm'
import {ref} from 'vue'
import {useI18n} from 'vue-i18n'
import modelRepository from '@zrm/motor-nx-media/api/file'
import {useCoreFormData} from "@zrm/motor-nx-core/composables/form/formData";
import {object, string, number, date, InferType, array, Schema} from 'yup';
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
      categories: array().min(1).required(),
      files: array().nullable(),
      file: object().nullable()
    }
  )

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
    file: null,
  })

  // Sanitize file data
  const sanitizer = async (formData: any) => {
      if (formData.files) {
        const tempFiles = []
        for (let i = 0; i < formData.files.length; i++) {
          if (formData.files[i].url !== '') {
            const startBase64 = formData.files[i].url.indexOf(',') + 1
            tempFiles.push({
              name: formData.files[i].name,
              dataUrl: formData.files[i].url.substring(startBase64),
            })
          }
        }
        formData.files = tempFiles
      }
      // Check if form hase file (=file edit) and if file is old file
      if (formData.file && !formData.file.uuid) {
        const startBase64 = formData.file.url.indexOf(',') + 1
        formData.file = {
          name: formData.file.name,
          dataUrl: formData.file.url.substring(startBase64)
        }
      }

  }

  const {onSubmit, form} = baseForm(
    'motor-media.files',
    'admin.motor-media.files',
    modelRepository(),
    model,
    schema,
    sanitizer
  )

  const route = useRoute()
  const getData = async () => {
    if (!route.params.id) return;
    const id: number = Number(route.params.id)
    const {data: response} = await modelRepository().get(id)
    model.value = response.value.data;
  }

  const { getRelevantFormData } = useCoreFormData()
  const { treeData, getCategoryData } = useFormData();

  onMounted(async () => {
    await getRelevantFormData(getData,[
      getCategoryData
    ],[
      getCategoryData,
    ]);
  })

  watch(() => model.value.file, () => {
    model.value.files = []
    if (model.value.file) {
      if (model.value.file.name) {
        model.value.files.push(model.value.file);
        return;
      }
    }
  })

  return {
    form,
    getData,
    onSubmit,
    model,
    treeData,
  }
}
