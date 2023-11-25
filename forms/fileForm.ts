import baseForm from '@zrm/motor-nx-core/forms/baseForm'
import {useI18n} from 'vue-i18n'
import modelRepository from '@zrm/motor-nx-media/api/file'
import {object, string, number, date, InferType, array, Schema} from 'yup';
import {storeToRefs} from "pinia";
export default function fileForm() {
  // Load i18n module
  const {t, tm} = useI18n()

  // Record
  const initialModelData = {
    id: null,
  }
  const initialFormData = {
    description: '',
    author: '',
    source: '',
    alt_text: '',
    categories: [],
    is_excluded_from_search_index: false,
    metadata: [],
    tags: [],
    files: [],
    file: null,
  }

  const formStore = useFormStore();
  const {model, formSchema} = storeToRefs(formStore);
  formStore.init(initialModelData, initialFormData);
  formSchema.value =  {
    id: number().nullable(),
    client_id: number().nullable(),
    description: string().nullable(),
    author: string().min(3).nullable().label(t('motor-media.files.author')),
    source: string().nullable(),
    alt_text: string().nullable(),
    is_global: number().nullable(),
    categories: array().min(1).required().label(t('motor-admin.categories.categories')),
    files: array().label(t('motor-media.files.files')),
    file: object().nullable()
  }

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
            description: formData.files[i].description,
            alt_text: formData.files[i].alt_text,
          })
        }
      }
      formData.files = tempFiles
    }
    // Check if form hase file (=file edit) and if file is old file
    if (formData.file && Object.keys(formData.file).length) {
      if (!formData.file.uuid) {
        const startBase64 = formData.file.url.indexOf(',') + 1
        formData.file = {
          name: formData.file.name,
          dataUrl: formData.file.url.substring(startBase64)
        }
      }
    } else {
      formData.file = false;
    }
  }

  const {onSubmit, form, getData} = baseForm(
    'motor-media.files',
    'admin.motor-media.files',
    modelRepository(),
    sanitizer
  )

  const route = useRoute()


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
    ...useFormData()
  }
}
