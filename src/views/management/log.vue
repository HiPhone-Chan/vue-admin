<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" :placeholder="$t('table.search')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
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
      <el-table-column align="center" :label="$t('table.id')" width="65" type="index" />
      <el-table-column align="center" label="用户" width="95">
        <template slot-scope="scope">
          <span>{{ scope.row.createdBy }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="方法" width="75">
        <template slot-scope="scope">
          <span>{{ scope.row.method }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="路径" min-width="115">
        <template slot-scope="scope">
          <span>{{ scope.row.path }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="时间" width="145">
        <template slot-scope="scope">
          <span>{{ scope.row.createdDate | formatTime }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column align="center" :label="$t('table.actions')" class-name="small-padding fixed-width">
      </el-table-column> -->
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getData" />

    <el-dialog :visible.sync="dialogVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <!-- 编辑 -->
        <template v-if="dialogStatus=='update'">
          <el-form-item :label="$t('table.id')">
            <el-input v-model="temp.id" type="text" placeholder="id" disabled />
          </el-form-item>
        </template>

      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('table.cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { formatTime } from '@/utils'
import { getOperationLogs } from '@/api/log'

export default {
  components: { Pagination },
  filters: {
    formatTime
  },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        page: 0,
        size: 10,
        authority: null
      },
      temp: {},
      dialogVisible: false,
      dialogStatus: '',
      rules: {
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
  },
  mounted() {
    this.getData()
  },
  methods: {
    async getData() {
      this.listLoading = true
      const resp = await getOperationLogs(this.listQuery)
      this.list = resp.data
      this.total = Number(resp.headers['x-total-count'])
      this.listLoading = false
    },
    handleFilter() {
      this.listQuery.page = 0
      this.getData()
    }
  }
}
</script>

<style>
</style>
