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
      <el-table-column align="center" :label="$t('table.id')" width="65">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" :label="$t('login.username')">
        <template slot-scope="scope">
          <span>{{ scope.row.login }}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" :label="$t('user.nickname')">
        <template slot-scope="scope">
          <span>{{ scope.row.nickName }}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" :label="$t('login.mobile')">
        <template slot-scope="scope">
          <span>{{ scope.row.mobile }}</span>
        </template>
      </el-table-column>
      <el-table-column width="150px" align="center" :label="$t('permission.role')">
        <template slot-scope="scope">
          <span>{{ scope.row.authorities|formatAuthorities }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('table.actions')" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{ $t('table.edit') }}</el-button>
          <el-button type="warning" size="mini" @click="handlePassword(scope.row)">{{ $t('login.password') }}</el-button>
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
          <el-form-item :label="$t('login.username')" prop="login" label-width="90px">
            <el-input v-model="temp.login" type="text" placeholder="登录名" :disabled="dialogStatus=='update'" />
          </el-form-item>
          <el-form-item :label="$t('permission.role')" prop="authorities" label-width="90px">
            <el-select v-model="temp.authorities" :placeholder="$t('permission.role')" clearable multiple>
              <el-option v-for="item in roleOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('user.nickname')" label-width="90px">
            <el-input v-model="temp.nickName" type="text" placeholder="昵称" />
          </el-form-item>
          <el-form-item :label="$t('login.mobile')" prop="mobile" label-width="90px">
            <el-input v-model="temp.mobile" type="text" placeholder="电话号码" />
          </el-form-item>
        </template>

      </el-form>

      <el-form v-else ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item :label="$t('user.adminPassword')" label-width="110px">
          <el-input v-model="temp.currentPassword" type="password" placeholder="当前管理员密码" />
        </el-form-item>
        <el-form-item :label="$t('login.password')" prop="newPassword" label-width="110px">
          <el-input v-model="temp.newPassword" type="password" placeholder="需要改的密码" />
        </el-form-item>
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
import { checkUserLogin, createUser, updateUser, getUsers, deleteUser, changePassword } from '@/api/user'
import { roleOptions } from './options'

const VALID_CHARACTER = {
  pattern: /^[a-zA-Z0-9_'.@]{4,50}$/,
  message: `英文大小写,数字,以及 _'.@,长度4-50`
}
export default {
  components: { Pagination },
  filters: {
    formatAuthorities(val) {
      return val
        .map(item => {
          for (const option of roleOptions) {
            if (option.value === item) {
              return option.label
            }
          }
          return item
        })
        .join(',')
    }
  },
  data() {
    const validateLogin = async(rule, value, callback) => {
      if (this.dialogStatus === 'create') {
        if (value) {
          if (VALID_CHARACTER.pattern.test(value)) {
            const resp = await checkUserLogin(value)
            const data = resp.data
            if (data) {
              callback(new Error('Login exists'))
            }
          } else {
            callback(new Error(VALID_CHARACTER.message))
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
        size: 10,
        authority: null
      },
      roleOptions,
      temp: {
        id: undefined,
        login: '',
        mobile: ''
      },
      dialogVisible: false,
      dialogStatus: '',
      rules: {
        login: [{ required: true, trigger: 'blur', validator: validateLogin }],
        authorities: [
          {
            required: true,
            message: '请选择权限'
          }
        ],
        mobile: [{ pattern: /^[0-9]{7,16}$/, message: '请输入正确的电话号码' }],
        newPassword: [
          { required: true, message: 'password is required' },
          VALID_CHARACTER
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
      const resp = await getUsers(this.listQuery)
      const data = resp.data
      this.list = data.content
      this.total = data.totalElements
      this.listLoading = false
    },
    handleFilter() {
      this.listQuery.page = 0
      this.getData()
    },
    handleCreate() {
      this.temp = {
        id: undefined,
        login: '',
        mobile: '',
        newPassword: '',
        nickName: '',
        authorities: [roleOptions[1].value]
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
    handlePassword(row) {
      this.dialogStatus = 'password'
      this.temp = {
        login: row.login,
        currentPassword: '',
        newPassword: ''
      }
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

        await deleteUser(this.temp.login)
        this.getData()
      } catch (err) {
        console.log(err)
      }
    },
    createData() {
      this.$refs['dataForm'].validate(async valid => {
        if (valid) {
          await createUser(this.temp)
          this.getData()
          this.dialogVisible = false
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(async valid => {
        if (valid) {
          await updateUser(this.temp)
          this.getData()
          this.dialogVisible = false
        }
      })
    },
    changePwd() {
      this.$refs['dataForm'].validate(async valid => {
        if (valid) {
          const changePwdVM = {
            currentPassword: this.temp.currentPassword,
            newPassword: this.temp.newPassword
          }

          try {
            await changePassword(this.temp.login, changePwdVM)
            this.$notify({
              title: '修改成功',
              type: 'success'
            })
          } catch (err) {
            this.$notify({
              title: '修改失败',
              type: 'warning'
            })
          }
          this.dialogVisible = false
        }
      })
    }
  }
}
</script>

<style>
</style>
