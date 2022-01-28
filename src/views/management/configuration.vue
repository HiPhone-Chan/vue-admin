<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" type="success" icon="el-icon-refresh" @click="handleRefresh">{{ $t('table.refresh') }}</el-button>
      <el-radio-group v-model="dataSelect" class="filter-item" style="margin-left: 20px;" @change="getData">
        <el-radio :label="'config'">配置</el-radio>
        <el-radio :label="'env'">环境</el-radio>
      </el-radio-group>
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
      <el-table-column align="center" label="key" width="215">
        <template slot-scope="scope">
          <span>{{ scope.row.key }}</span>
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
import { loadConfiguration, loadEnvConfiguration } from '@/api/management'

export default {
  data() {
    return {
      dataSelect: 'config',
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
    getData() {
      if (this.dataSelect === 'config') {
        this.getConfigData()
      } else {
        this.getEnvData()
      }
    },
    async getConfigData() {
      this.listLoading = true
      const resp = await loadConfiguration()
      const contexts = resp.data.contexts
      const list = []
      for (const key in contexts) {
        list.push({
          key,
          ...contexts[key]
        })
      }
      this.list = list
      this.listLoading = false
    },
    async getEnvData() {
      this.listLoading = true
      const resp = await loadEnvConfiguration()
      const components = resp.data
      const list = []
      for (const key in components) {
        list.push({
          key,
          details: components[key].details,
          status: components[key].status
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
