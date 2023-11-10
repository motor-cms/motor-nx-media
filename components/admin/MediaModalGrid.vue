<template>
  <div class="col-lg-12 col-md-12 mb-md-0 mb-4">
    <div class="row">
      <div class="col-lg-12">
        <div class="row">
          <div class="col-md-6">
            <div class="d-flex flex-row align-items-center">
              <h6 class="m-0" v-if="!loading">{{ name }}</h6>
              <SpinnerSmall v-if="updatingInBackground"/>
            </div>
          </div>

          <div class="col-md-6 text-end">
            <component
              v-for="component in headerActions"
              :key="component.name"
              :is="component.name"
            />
            <NuxtLink v-if="hasBackButton && backRoute?.length > 0" :to="goBackRoute">
              <button class="btn btn-outline-primary border-radius-sm text-capitalize text-base mb-4 me-1">
                {{ $t('global.back') }}
              </button>
            </NuxtLink>
            <NuxtLink v-if="!withoutCreate && createRecordRoute" :to="createRecordRoute">
              <a class="btn bg-gradient-primary border-radius-sm text-capitalize text-base mb-4 me-1">{{
                  createLabel
                }}</a>
            </NuxtLink>
          </div>
        </div>
        <div class="row align-items-center">
          <component
            v-for="f in filters"
            :key="f.name"
            :is="f.name"
            :options="f.options"
            @submit="submitFilter"
          ></component>
          <div class="col" v-if="!loading">
            <ul class="pagination float-end m-0">
              <li class="page-item disabled" v-if="meta.current_page === 1">
                <a class="page-link text-black">
                  <fa icon="chevron-left"/>
                </a>
              </li>

              <li
                class="page-item"
                @click="firstPage"
                v-if="meta.current_page > 1"
              >
                <a class="page-link text-black">
                  <fa icon="chevron-left"/>
                  <fa icon="chevron-left"/>
                </a>
              </li>
              <li
                class="page-item"
                @click="previousPage"
                v-if="meta.current_page > 1"
              >
                <a class="page-link text-black">
                  <fa icon="chevron-left"/>
                </a>
              </li>
              <li>
                <select
                  class="form-control"
                  name="per-page"
                  @change="goToPage"
                  v-model="filterValues.page"
                >
                  <option v-for="option in pageOptions" :value="option">Seite {{ option }} von
                    {{ meta.last_page }}
                  </option>
                </select>
              </li>
              <li
                class="page-item"
                @click="nextPage()"
                v-if="meta.current_page < meta.last_page"
              >
                <a class="page-link text-black">
                  <fa icon="chevron-right"/>
                </a>
              </li>

              <li
                class="page-item"
                @click="lastPage()"
                v-if="meta.current_page < meta.last_page"
              >
                <a class="page-link text-black">
                  <fa icon="chevron-right"/>
                  <fa icon="chevron-right"/>
                </a>
              </li>

              <li
                class="page-item disabled"
                v-if="meta.current_page === meta.last_page"
              >
                <a class="page-link text-black">
                  <fa icon="chevron-right"/>
                </a>
              </li>
            </ul>
            <select
              class="form-control max-width-100 d-inline float-end me-2"
              name="per-page"
              @change="submitFilter($event)"
              v-model="filterValues.per_page"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <div v-if="meta.total > 0" class="float-end mt-2 me-2">
              {{ meta.from }} - {{ meta.to }} / {{ meta.total }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="row">

    <template v-if="loading && rows.length === 0 || updatingInBackground && rows.length === 0">
      <div
        v-for="index in 5"
        :key="index"
        :class="index % 2 === 1 ? 'bg-gray-100' : ''"
      >
        <Skeletor
          height="30"
          :width="Math.random() * 20 + 80 + '%'"
        />
      </div>
    </template>
    <div
      v-for="(record, index) in rows"
      :key="record.id"
      class="col-md-3 media-modal-card"
    >
      <div class="media-modal card">
        <div class="card-header p-0 mx-3 mt-3 position-relative z-index-1">
          <vue-easy-lightbox
            v-if="record.exists && isImage(record.file.mime_type)"
            scrollDisabled
            moveDisabled
            :visible="visible"
            :imgs="[record.file.conversions.preview]"
            :index="0"
            @hide="visible = false"
          >
          </vue-easy-lightbox>
            <img
              v-if="record.exists && isImage(record.file.mime_type)"
              :src="record.file.conversions.thumb"
              class="img-fluid border-radius-lg"
              alt="Responsive image"
            />
            <span v-if="!record.exists">{{
                $t('motor-media.global.file_not_found')
              }}</span>
        </div>

        <div class="card-body pt-1 pb-1">
          <a href="#" @click.prevent="chooseImage(record)" class="card-title d-block text-darker">
            {{ record.file.name }}
          </a>
        </div>
      </div>

    </div>
  </div>
</template>
<style lang="scss">
.media-modal-card {
  .card {
    &:hover {
      background-color: var(--c-primary-30);
    }
  }
}
.media-modal .card-header {
  height: 210px;
  background: none;
}
.media-modal-card {
  margin-bottom: 10px;
}

.media-modal.card {
  height: 280px;
}

.media-modal img {
  display: block;
  max-height: 200px;
  margin: 0 auto;
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;}
</style>
<script lang="ts">
import {
  computed,
  defineComponent,
  reactive,
  ref,
} from 'vue'
import SearchFilter from '@zrm/motor-nx-core/components/admin/filters/SearchFilter.vue'
import SelectFilter from '@zrm/motor-nx-core/components/admin/filters/SelectFilter.vue'
import {Skeletor} from 'vue-skeletor'
import 'vue-skeletor/dist/vue-skeletor.css'
import {useI18n} from 'vue-i18n'
import {storeToRefs} from 'pinia';
import Button from "@zrm/motor-nx-core/components/admin/cell/Button.vue";
import useRouteParser from "@zrm/motor-nx-core/composables/route/parse";
import SpinnerSmall from "@zrm/motor-nx-core/components/admin/partials/SpinnerSmall.vue";
import VueEasyLightbox from "vue-easy-lightbox";

export default defineComponent({
  components: {
    VueEasyLightbox,
    SpinnerSmall,
    SearchFilter,
    SelectFilter,
    Skeletor,
    Button,
  },
  emits: ['resolve'],
  props: {
    name: {
      type: String,
      default: 'Grid',
    },
    rows: {
      type: Array<Record<string, any>>,
      default: ref([]),
    },
    meta: {
      type: Object,
      default: () => {
        return {}
      },
    },
    resource: {
      type: String,
      default: '',
    },
    filters: {
      type: Array,
      default: ref([]),
    },
    createLabel: {
      type: String,
      default: 'New record',
    },
    createRoute: {
      type: String,
      default: '',
    },
    headerActions: {
      type: Array,
      default: () => [],
    },
    withoutCreate: {
      type: Boolean,
      default: false
    },
    hasBackButton: {
      type: Boolean,
      default: false,
    },
    backRoute: {
      type: String,
      default: '',
    },
    withSelection: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, ctx) {


    const visible = ref(false)
    // Check mimetype before displaying an image
    const isImage = (type: string) => {
      const mimeTypes = [
        'image/apng',
        'image/avif',
        'image/gif',
        'image/jpeg',
        'image/png',
        'image/svg+xml',
        'image/webp',
      ]

      return mimeTypes.indexOf(type) > -1
    }

    const appStore = useAppStore()
    const {loading, updatingInBackground} = storeToRefs(appStore)
    const gridStore = useGridStore();
    gridStore.init(props.meta);
    const router = useRouter();
    const route = useRoute();

    const {selectedItemsLength, selectedPageMap, pageSelected, allSelected} = storeToRefs(gridStore);
    const {t} = useI18n()
    const filterValues = reactive({per_page: route.query.per_page ? route.query.per_page : 25, page: route.query.page ? route.query.page : 1})

    const createRecordRoute = ref(useRouteParser().routeDottedToSlash(props.createRoute))

    const goBackRoute = ref(useRouteParser().routeDottedToSlash(props.backRoute))

    const submitFilter = (data: { parameter: string; value: string }) => {
      // Reset page when filtering or searching
      filterValues.page = 1
      if (data.parameter) {
        filterValues[data.parameter] = data.value
      }
      router.replace({query: {page: filterValues.page, per_page: filterValues.per_page}})
      ctx.emit('submit', filterValues)
    }

    const previousPage = () => {
      filterValues.page--
      router.replace({query: {page: filterValues.page, per_page: filterValues.per_page}})
      ctx.emit('submit', filterValues)
    }

    const nextPage = () => {
      filterValues.page++
      router.replace({query: {page: filterValues.page, per_page: filterValues.per_page}})
      ctx.emit('submit', filterValues)
    }

    const firstPage = () => {
      filterValues.page = 1;
      router.replace({query: {page: filterValues.page, per_page: filterValues.per_page}})
      ctx.emit('submit', filterValues)
    }
    const lastPage = () => {
      filterValues.page = props.meta.last_page;
      router.replace({query: {page: filterValues.page, per_page: filterValues.per_page}})
      ctx.emit('submit', filterValues)
    }

    const pageOptions = computed(() => Array(props.meta.last_page).fill(1).map((_, i) => i + 1))

    const goToPage = () => {
      router.replace({query: {page: filterValues.page, per_page: filterValues.per_page}})
      ctx.emit('submit', filterValues)
    }

    watchEffect(() => {
      gridStore.init(props.meta);
    })

    const chooseImage = (record:{}) => {
      ctx.emit('resolve', record);
    };

    return {
      filterValues,
      loading,
      nextPage,
      previousPage,
      submitFilter,
      createRecordRoute,
      updatingInBackground,
      firstPage,
      lastPage,
      pageOptions,
      goToPage,
      goBackRoute,
      selectedItemsLength,
      allSelected,
      pageSelected,
      gridStore,
      isImage,
      visible,
      chooseImage
    }
  },
})
</script>
