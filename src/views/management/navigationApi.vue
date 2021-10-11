<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.authority" class="filter-item" :placeholder="$t('permission.role')" clearable @change="handleFilter">
        <el-option v-for="item in roleOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-input v-model="listQuery.title" :placeholder="$t('table.search')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">{{ $t('table.add') }}</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="给我一点时间"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column align="center" label="方法" min-width="60">
        <template slot-scope="scope">
          <span>{{ scope.row.method }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="60" align="center" label="路径">
        <template slot-scope="scope">
          <span>{{ scope.row.path }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="60" align="center" label="描述">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('table.actions')" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="danger" size="mini" @click="handleDelete(scope.row,'deleted')">{{ $t('table.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getData" />

    <el-dialog :visible.sync="dialogVisible">
      <el-table
        v-loading="listLoading"
        :data="apiList"
        element-loading-text="给我一点时间"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column align="center" label="方法" min-width="60">
          <template slot-scope="scope">
            <span>{{ scope.row.method }}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="60" align="center" label="路径">
          <template slot-scope="scope">
            <span>{{ scope.row.path }}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="60" align="center" label="描述">
          <template slot-scope="scope">
            <span>{{ scope.row.description }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('table.actions')" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="handleAddApi(scope.row)">添加</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="apiTotal>0"
        :total="apiTotal"
        :page.sync="apiListQuery.page"
        :limit.sync="apiListQuery.size"
        @pagination="getApiData"
      />
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { getNavigationApis, createNavigationApi, deleteNavigationApi } from '@/api/navigationApi'
import { getApiInfos } from '@/api/apiInfo'
import { roleOptions, formatAuthorities } from '@/utils/app-common'

export default {
  components: { Pagination },
  filters: {
    formatAuthorities
  },
  data() {
    return {
      navId: '',
      list: [],
      apiList: [],
      total: 0,
      apiTotal: 0,
      listLoading: false,
      dialogVisible: false,
      listQuery: {
        page: 0,
        size: 10,
        authority: null
      },
      apiListQuery: {
        page: 0,
        size: 100,
        authority: null
      },
      roleOptions,
      temp: {
        id: undefined,
        login: '',
        mobile: ''
      }
    }
  },
  watch: {
    listQuery: {
      deep: true,
      handler: function(val, oldVal) {
        this.$router.push({
          query: this.listQuery
        })
      }
    }
  },
  created() {
    const query = this.$route.query
    if (query) {
      this.listQuery.page = query.page ? Number(query.page) : this.listQuery.page
      this.listQuery.size = query.size ? Number(query.size) : this.listQuery.size
    }
    if (query.navInfo) {
      this.navId = query.navInfo.id
      this.getData()
    }
  },
  mounted() {
    this.getApiData()
  },
  methods: {
    async getData() {
      this.listLoading = true
      this.temp = {
        navId: this.navId
      }
      const resp = await getNavigationApis(this.temp)
      this.list = resp.data
      this.total = Number(resp.headers['x-total-count'])
      this.listLoading = false
    },
    async getApiData() {
      this.listLoading = true
      const resp = await getApiInfos(this.apiListQuery)
      const tempApiList = resp.data
      this.apiTotal = Number(resp.headers['x-total-count'])
      this.apiList = []
      this.apiList = tempApiList.filter(apiItem => {
        return this.list.every(item => {
          return item.id !== apiItem.id
        })
      })
      this.listLoading = false
    },
    handleFilter() {
      this.listQuery.page = 0
      this.getData()
    },
    handleCreate() {
      this.temp = {
        navId: this.navId,
        apiId: ''
      }
      this.dialogVisible = true
    },
    async handleDelete(row) {
      this.temp = {
        navId: this.navId,
        apiId: row.id
      }

      try {
        await this.$confirm('该操作比较危险', '确认删除吗？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        console.log(this.temp)
        await deleteNavigationApi(this.temp)
        this.getData()
      } catch (err) {
        console.log(err)
      }
    },
    async handleAddApi(row) {
      console.log(row)
      this.temp.apiId = row.id
      createNavigationApi(this.temp)
      await this.getData()
      await this.getApiData()
    }
  }
}
</script>

<style>
</style>
