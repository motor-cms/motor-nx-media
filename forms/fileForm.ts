import baseForm from '@zrm/motor-nx-core/forms/baseForm'
import {useI18n} from 'vue-i18n'
import modelRepository from '@zrm/motor-nx-media/api/file'
import {object, string, number, array, mixed} from 'yup';
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
    description: string().required().label(t('motor-media.files.description')),
    author: string().min(3).required().label(t('motor-media.files.author')),
    source: string().required().label(t('motor-media.files.source')),
    alt_text: string().required().label(t('motor-media.files.alt_text')),
    is_global: number().nullable(),
    categories: array().min(1).required().label(t('motor-admin.categories.categories')),
    files: array().label(t('motor-media.files.files')),
    // Accept both array (create mode) and object (edit mode)
    file: mixed().test('file-required', t('motor-media.files.file') + ' is required', (value) => {
      if (!value) return false;
      // Accept array with at least one item (create mode)
      if (Array.isArray(value)) return value.length > 0;
      // Accept object with properties (edit mode)
      return Object.keys(value).length > 0;
    }).required().label(t('motor-media.files.file'))
  }

  // Sanitize file data
  const sanitizer = async (formData: any) => {
    // Handle multiple files (create mode - array)
    if (formData.file && Array.isArray(formData.file) && formData.file.length > 0) {
      const tempFiles = []
      for (let i = 0; i < formData.file.length; i++) {
        // Skip old files that already have a uuid
        if (formData.file[i].uuid) {
          continue;
        }
        if (formData.file[i].url && formData.file[i].url !== '') {
          const startBase64 = formData.file[i].url.indexOf(',') + 1
          tempFiles.push({
            name: formData.file[i].name,
            dataUrl: formData.file[i].url.substring(startBase64),
            description: formData.file[i].description || formData.description,
            alt_text: formData.file[i].alt_text || formData.alt_text,
          })
        }
      }
      formData.files = tempFiles
      // Keep the file field for backward compatibility
      if (tempFiles.length > 0) {
        formData.file = tempFiles[0]
      } else {
        // No new files, remove the field entirely so backend doesn't think we're deleting
        delete formData.file
      }
    } 
    // Handle single file (edit mode - object)
    else if (formData.file && !Array.isArray(formData.file) && Object.keys(formData.file).length > 0) {
      // Check if it's a new file or existing file
      if (formData.file.uuid) {
        // Existing file - don't send it to backend, it already has it
        // Remove file field entirely so backend doesn't process it
        delete formData.file;
        delete formData.files;
      } else if (formData.file.url && formData.file.url !== '') {
        // New file to replace the existing one
        const startBase64 = formData.file.url.indexOf(',') + 1
        formData.file = {
          name: formData.file.name,
          dataUrl: formData.file.url.substring(startBase64)
        }
        formData.files = [formData.file];
      } else {
        // No file data, remove fields
        delete formData.file;
        delete formData.files;
      }
    } else {
      // No file provided, remove fields
      delete formData.file;
      delete formData.files;
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
    if (model.value.file && Array.isArray(model.value.file)) {
      model.value.files = model.value.file.filter(f => f && f.name);
    } else if (model.value.file && model.value.file.name) {
      // Handle single file for backward compatibility
      model.value.files = [model.value.file];
    } else {
      model.value.files = [];
    }
  }, { deep: true })

  return {
    form,
    getData,
    onSubmit,
    model,
    ...useFormData()
  }
}
