<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" type="success" icon="el-icon-refresh" @click="handleRefresh">{{ $t('table.refresh') }}</el-button>
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
      <el-table-column align="center" label="key" width="115">
        <template slot-scope="scope">
          <span>{{ scope.row.key }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" width="75">
        <template slot-scope="scope">
          <span>{{ scope.row.status }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="详情" min-width="115">
        <template slot-scope="scope">
          <span>{{ scope.row.details }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column align="center" :label="$t('table.actions')" class-name="small-padding fixed-width">
      </el-table-column> -->
    </el-table>

    <el-dialog :visible.sync="dialogVisible">
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
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
import { checkHealth } from '@/api/management'

export default {
  data() {
    return {
      listLoading: false,
      list: [],
      temp: {},
      dialogVisible: false,
      dialogStatus: ''
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    async getData() {
      this.listLoading = true
      const resp = await checkHealth()
      const components = resp.data.components
      const list = []
      for (const key in components) {
        list.push({
          key,
          ...components[key]
        })
      }
      this.list = list
      this.listLoading = false
    },
    handleRefresh() {
      this.getData()
    }
  }
}
</script>

<style>
</style>
