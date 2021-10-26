<template>
  <div class="app-container" style="display:flex">
    <div class="container-left">
      <div class="filter-container">
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
        <el-table-column align="center" :label="$t('table.actions')" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{ $t('table.edit') }}</el-button>
            <el-button type="warning" size="mini" @click="handleConfig(scope.row)">配置</el-button>
            <el-button type="info" size="mini" @click="handlePassword(scope.row)">{{ $t('login.password') }}</el-button>
            <el-button type="danger" size="mini" @click="handleDelete(scope.row,'deleted')">{{ $t('table.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getData" />
    </div>

    <el-drawer
      :visible.sync="clickConfig"
    >

      <div class="roleTree">
        <div>
          <template>
            <el-button type="primary" size="mini" @click="handleSave">保存</el-button>
            <el-button v-if="checkAll" type="primary" size="mini" @click="handleCheckAllChange">全选</el-button>
            <el-button v-else type="primary" size="mini" @click="handleCheckAllChange">取消全选</el-button>
          </template>
          <el-tree
            ref="roleTree"
            :props="props"
            :data="roleList"
            node-key="id"
            lazy
            show-checkbox
            :default-checked-keys="hasCheck"
          />
        </div>
      </div>
    </el-drawer>

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
import { getUserRoles, updateUserRole } from '@/api/userRole'
import { createStaff, updateStaff, deleteStaff, getStaffs, changePassword } from '@/api/staff'
import { getRoles } from '@/api/staffRole'
import { roleOptions, formatAuthorities, LOGIN_VALID_CHARACTER } from '@/utils/app-common'

export default {
  components: { Pagination },
  filters: {
    formatAuthorities
  },
  data() {
    return {
      list: [],
      roleList: [],
      userRoleList: [],
      hasCheck: [],
      total: 0,
      listLoading: false,
      clickConfig: false,
      checkAll: true,
      listQuery: {
        page: 0,
        size: 10
      },
      roleListQuery: {
        page: 0,
        size: 500
      },
      userRoleQuery: {
        page: 0,
        size: 500,
        login: ''
      },
      props: {
        label: 'name',
        children: 'name',
        isLeaf: function() {
          return true
        }
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
        login: [{ required: true, trigger: 'blur' }],
        authorities: [
          {
            required: true,
            message: '请选择权限'
          }
        ],
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
      const resp = await getStaffs(this.listQuery)
      this.list = resp.data
      this.total = Number(resp.headers['x-total-count'])
      this.listLoading = false
    },
    async getRoleData() {
      this.listLoading = true
      const resp = await getRoles(this.roleListQuery)
      this.roleList = resp.data
      this.listLoading = false
    },
    async getUserRoles() {
      this.listLoading = true
      this.userRoleQuery.login = this.temp.login
      const resp = await getUserRoles(this.userRoleQuery)
      this.userRoleList = resp.data
      resp.data.forEach(item => {
        this.hasCheck.push(item.id)
      })
      this.$nextTick(() => {
        if (this.$refs.roleTree) {
          this.$refs.roleTree.setCheckedKeys(this.hasCheck)
        }
      })
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
        nickName: ''
      }
      this.dialogStatus = 'create'

      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleConfig(row) {
      this.getRoleData()
      this.temp = Object.assign({}, row)
      this.hasCheck = []
      this.getUserRoles()
      this.$nextTick(() => {
        this.clickConfig = true
        this.checkAll = true
      })
    },
    handleCheckAllChange() {
      if (this.checkAll) {
        this.$refs.roleTree.setCheckedNodes(this.roleList)
        this.checkAll = !this.checkAll
      } else {
        this.$refs.roleTree.setCheckedKeys([])
        this.checkAll = !this.checkAll
      }
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

        await deleteStaff(this.temp.login)
        this.getData()
      } catch (err) {
        console.log(err)
      }
    },
    createData() {
      this.$refs['dataForm'].validate(async valid => {
        if (valid) {
          await createStaff(this.temp)
          this.getData()
          this.dialogVisible = false
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(async valid => {
        if (valid) {
          await updateStaff(this.temp)
          this.getData()
          this.dialogVisible = false
        }
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
    handleSave() {
      this.temp = {
        login: this.temp.login,
        roleIds: []
      }
      const checkList = this.$refs.roleTree.getCheckedNodes()
      checkList.forEach(item => {
        this.temp.roleIds.push(item.id)
      })
      updateUserRole(this.temp)
      this.$notify({
        title: '修改成功',
        type: 'success'
      })
    },
    loadNode() {
    }
  }
}
</script>

<style lang="scss" scoped>
  .roleTree{
    border-left: 1px solid #eee;
    border-right: 1px solid #eee;
    width:500px;
    margin: 20px;
    padding: 20px;
  }
  .container-left{
    width: 100%;
  }
  .el-tree{
    margin-top: 20px;
  }
</style>
