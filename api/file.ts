import useApi from "@zrm/motor-nx-core/composables/http/api";

export default () => ({
    api: useApi(),
    index(params: any, cached: boolean = true) {
        return this.api.get('files', params, cached)
    },

    create(payload: object) {
        return this.api.post(`files`, payload)
    },

     get(id: number): Promise<object> {
        return this.api.get(`files/${id}`)
    },

    update(payload: object, id: number) {
        return this.api.put(`files/${id}`, payload)
    },

    delete(id: number) {
        return this.api.destroy(`files/${id}`)
    },
})
