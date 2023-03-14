import {ref} from "vue";
import categoryTreeRepository from "motor-nx-admin/api/categoryTree";

export function useFormData() {

  const treeData = ref({})

  const getCategoryData = async (cached: boolean) => {
    const {data: response} = await categoryTreeRepository()
      .get(1, cached);
    treeData.value = response.value.data
  }

  return {
    treeData,
    getCategoryData
  }
}
