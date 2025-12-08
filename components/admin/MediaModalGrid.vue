<template>
  <div class="col-lg-12 col-md-12 mb-4">
    <div class="row">
      <div class="col-lg-12">
        <div class="row align-items-center">
          <component
            :is="f.name"
            v-for="f in filters"
            :key="f.name"
            :options="f.options"
            @submit="submitFilter"
          ></component>
          <div v-if="!loading" class="col">
            <ul class="pagination float-end m-0">
              <li v-if="meta.current_page === 1" class="page-item disabled">
                <a class="page-link text-black">
                  <fa icon="chevron-left"/>
                </a>
              </li>

              <li
                v-if="meta.current_page > 1"
                class="page-item"
                @click="firstPage"
              >
                <a class="page-link text-black">
                  <fa icon="chevron-left"/>
                  <fa icon="chevron-left"/>
                </a>
              </li>
              <li
                v-if="meta.current_page > 1"
                class="page-item"
                @click="previousPage"
              >
                <a class="page-link text-black">
                  <fa icon="chevron-left"/>
                </a>
              </li>
              <li>
                <select
                  v-model="filterValues.page"
                  class="form-control"
                  name="per-page"
                  @change="goToPage"
                >
                  <option v-for="option in pageOptions" :value="option">Seite {{ option }} von
                    {{ meta.last_page }}
                  </option>
                </select>
              </li>
              <li
                v-if="meta.current_page < meta.last_page"
                class="page-item"
                @click="nextPage()"
              >
                <a class="page-link text-black">
                  <fa icon="chevron-right"/>
                </a>
              </li>

              <li
                v-if="meta.current_page < meta.last_page"
                class="page-item"
                @click="lastPage()"
              >
                <a class="page-link text-black">
                  <fa icon="chevron-right"/>
                  <fa icon="chevron-right"/>
                </a>
              </li>

              <li
                v-if="meta.current_page === meta.last_page"
                class="page-item disabled"
              >
                <a class="page-link text-black">
                  <fa icon="chevron-right"/>
                </a>
              </li>
            </ul>
            <select
              v-model="filterValues.per_page"
              class="form-control max-width-100 d-inline float-end me-2"
              name="per-page"
              @change="submitFilter($event)"
            >
              <option value="16">16</option>
              <option value="32">32</option>
              <option value="48">48</option>
              <option value="64">64</option>
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
      <div class="media-modal card" :class="{'is-image': (record && record.file && isImage(record.file.mime_type))}" @click.prevent="chooseMedia(record)">
        <div v-if="record.exists && (record && record.file && isImage(record.file.mime_type))" class="card-header p-0 mx-3 mt-3 position-relative z-index-1">
          <vue-easy-lightbox
            scroll-disabled
            move-disabled
            :visible="visible"
            :imgs="[record.file.conversions.preview]"
            :index="0"
            @hide="visible = false"
          >
          </vue-easy-lightbox>
            <img
              :src="record.file.conversions.thumb"
              class="img-fluid border-radius-lg"
              :alt="record.alt_text"
              :title="record.alt_text"
            />
            <span v-if="!record.exists || !record.file">{{
                $t('motor-media.global.file_not_found')
              }}</span>
        </div>

        <div class="card-body pt-3 pb-3">
            <div class="file-info">
              <span style="word-break: break-all;">{{ record?.file?.name }}</span>
              <span class="badge bg-secondary">{{ convertMimeType(record?.file?.mime_type) }}</span>
            </div>
            {{ record.description }}
        </div>
      </div>

    </div>
  </div>
</template>
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
import {useMimeType} from "@zrm/base-components/composables/shared/useMimeType";
import {useFilterStore} from "@zrm/motor-nx-core/stores/filter";

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

    const appStore = useAppStore()
    const {loading, updatingInBackground} = storeToRefs(appStore)
    const gridStore = useGridStore();
    gridStore.init(props.meta);
    const router = useRouter();
    const route = useRoute();

    const {selectedItemsLength, selectedPageMap, pageSelected, allSelected} = storeToRefs(gridStore);
    const {t} = useI18n()
    const filterValues = reactive({per_page: route.query.per_page ? route.query.per_page : 16, page: route.query.page ? route.query.page : 1})

    const createRecordRoute = ref(useRouteParser().routeDottedToSlash(props.createRoute))

    const goBackRoute = ref(useRouteParser().routeDottedToSlash(props.backRoute))

    const { convertMimeType, isImage } = useMimeType();

    const filterStore = useFilterStore();
    Object.assign(filterValues, filterStore.getFilterValuesForGrid(route.name));

    const submitFilter = (data: { parameter: string; value: string }) => {

      if (data instanceof Event) {
        data = ref({
          parameter: 'per-page',
          value: filterValues.perPage
        });
      }
      // Add search filter
      filterValues[data.parameter] = data.value.value;

      // Reset page when filtering or searching
      filterValues.page = 1
      if (data.parameter) {
        filterValues[data.parameter] = data.value
      }

      // Save current filter values
      filterStore.setFilterValuesForGrid(route.name, filterValues);

      router.replace({query: filterStore.getFilterValuesForGrid(route.name)})
      ctx.emit('submit', filterValues)
    }

    const previousPage = () => {
      props.meta.current_page--;
      filterValues.page--
      filterStore.setFilterValuesForGrid(route.name, filterValues);
      router.replace({query: filterStore.getFilterValuesForGrid(route.name)})
      ctx.emit('submit', filterValues)
    }

    const nextPage = () => {
      props.meta.current_page++;
      filterValues.page++
      filterStore.setFilterValuesForGrid(route.name, filterValues);
      router.replace({query: filterStore.getFilterValuesForGrid(route.name)})
      ctx.emit('submit', filterValues)
    }

    const firstPage = () => {
      props.meta.current_page = 1;
      filterValues.page = 1;
      filterStore.setFilterValuesForGrid(route.name, filterValues);
      router.replace({query: filterStore.getFilterValuesForGrid(route.name)})
      ctx.emit('submit', filterValues)
    }
    const lastPage = () => {
      props.meta.current_page = props.meta.last_page;
      filterValues.page = props.meta.last_page;
      filterStore.setFilterValuesForGrid(route.name, filterValues);
      router.replace({query: filterStore.getFilterValuesForGrid(route.name)})
      ctx.emit('submit', filterValues)
    }

    const pageOptions = computed(() => Array(props.meta.last_page).fill(1).map((_, i) => i + 1))

    const goToPage = () => {
      filterStore.setFilterValuesForGrid(route.name, filterValues);
      router.replace({query: filterStore.getFilterValuesForGrid(route.name)})
      ctx.emit('submit', filterValues)
    }

    watchEffect(() => {
      gridStore.init(props.meta);
    })

    const chooseMedia = (record:{}) => {
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
      chooseMedia,
      convertMimeType,
    }
  },
})
</script>
<style lang="scss">
.media-modal-card {
  .card {
    &:hover {
      background-color: var(--c-primary-30);
    }
  }
}
.media-modal .card-header {
  min-height: 100px;
  max-height: 170px;
  background: none;
}

.media-modal.is-image .card-header {
  max-height: 220px;
}

.media-modal-card {
  margin-bottom: 10px;
}

.media-modal.card {
  min-height: 100px;
  max-height: 170px;
}

.media-modal.card.is-image {
  max-height: 300px;
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

.file-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
