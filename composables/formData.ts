import {ref} from "vue";
import categoryTreeRepository from "@zrm/motor-nx-admin/api/categoryTree";

export function useMediaFormData() {

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
