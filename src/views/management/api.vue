<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.method" class="filter-item" placeholder="方法" @change="handleFilter">
        <el-option v-for="item in methodOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-input v-model="listQuery.search" :placeholder="$t('table.search')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
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
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{ $t('table.edit') }}</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row,'deleted')">{{ $t('table.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getData" />

    <el-dialog :visible.sync="dialogVisible">
      <el-form v-if="dialogStatus!='password'" ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <!-- 编辑 -->
        <template v-if="dialogStatus=='update'">
          <el-form-item :label="$t('table.id')">
            <el-input v-model="temp.id" type="text" placeholder="id" disabled />
          </el-form-item>
        </template>

        <template v-if="dialogStatus=='update'||dialogStatus=='create'">
          <el-form-item label="方法" label-width="90px" prop="method">
            <el-select v-model="temp.method" placeholder="请选择">
              <el-option v-for="item in methodOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="描述" label-width="90px">
            <el-input v-model="temp.description" type="text" placeholder="描述" />
          </el-form-item>
          <el-form-item label="路径" prop="mobile" label-width="90px">
            <el-input v-model="temp.path" type="text" placeholder="接口路径">
              <template slot="prepend">/api/staff/</template>
            </el-input>
          </el-form-item>
        </template>

      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{ $t('table.confirm') }}</el-button>
        <el-button v-if="dialogStatus=='update'" type="primary" @click="updateData">{{ $t('table.confirm') }}</el-button>
        <el-button v-if="dialogStatus=='password'" type="primary" @click="changePwd">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { checkUserLogin } from '@/api/user'
import { createApiInfo, updateApiInfo, getApiInfos, deleteApiInfo } from '@/api/apiInfo'
import { formatAuthorities, LOGIN_VALID_CHARACTER } from '@/utils/app-common'

export default {
  components: { Pagination },
  filters: {
    formatAuthorities
  },
  data() {
    const validateLogin = async(rule, value, callback) => {
      if (this.dialogStatus === 'create') {
        if (value) {
          if (LOGIN_VALID_CHARACTER.pattern.test(value)) {
            const resp = await checkUserLogin(value)
            const data = resp.data
            if (data) {
              callback(new Error('Login exists'))
            }
          } else {
            callback(new Error(LOGIN_VALID_CHARACTER.message))
          }
        } else {
          callback(new Error('Please enter login'))
        }
      }
    }

    return {
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        page: 0,
        size: 10
      },
      methodOptions: [
        { value: 'get', label: 'GET' },
        { value: 'post', label: 'POST' },
        { value: 'delete', label: 'DELETE' },
        { value: 'put', label: 'PUT' }
      ],
      temp: {
        id: undefined,
        login: '',
        mobile: ''
      },
      dialogVisible: false,
      dialogStatus: '',
      rules: {
        login: [{ required: true, trigger: 'blur', validator: validateLogin }],
        method: [{ required: true, trigger: 'blur' }],
        mobile: [{ pattern: /^[0-9]{7,16}$/, message: '请输入正确的电话号码' }],
        newPassword: [
          { required: true, message: 'password is required' },
          LOGIN_VALID_CHARACTER
        ]
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
      const resp = await getApiInfos(this.listQuery)
      this.list = resp.data
      this.total = Number(resp.headers['x-total-count'])
      this.listLoading = false
    },
    handleFilter() {
      this.listQuery.page = 0
      this.getData()
    },
    handleCreate() {
      this.temp = {
        id: undefined,
        method: '',
        path: '',
        description: ''
      }
      this.dialogStatus = 'create'

      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate(row) {
      this.dialogStatus = 'update'
      this.temp = Object.assign({}, row)
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    async handleDelete(row) {
      this.dialogStatus = 'delete'
      this.temp = Object.assign({}, row)

      try {
        await this.$confirm('该操作比较危险', '确认删除吗？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await deleteApiInfo(this.temp.id)
        this.getData()
      } catch (err) {
        console.log(err)
      }
    },
    createData() {
      this.$refs['dataForm'].validate(async valid => {
        if (valid) {
          this.temp.path = '/api/staff/' + this.temp.path
          await createApiInfo(this.temp)
          this.getData()
          this.dialogVisible = false
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(async valid => {
        if (valid) {
          await updateApiInfo(this.temp)
          this.getData()
          this.dialogVisible = false
        }
      })
    }
  }
}
</script>

<style>
</style>
