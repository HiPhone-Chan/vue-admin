<template>
  <div class="app-container" style="display:flex">
    <div class="container-left">
      <div class="filter-container">
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
        <el-table-column align="center" label="角色名称" min-width="60">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="60" align="center" label="备注">
          <template slot-scope="scope">
            <span>{{ scope.row.remark }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('table.actions')" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{ $t('table.edit') }}</el-button>
            <el-button type="warning" size="mini" @click="handleConfig(scope.row)">配置</el-button>
            <el-button type="danger" size="mini" @click="handleDelete(scope.row,'deleted')">{{ $t('table.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getData" />
    </div>
    <el-drawer
      :visible.sync="clickConfig"
    >
      <div v-if="clickConfig" class="roleTree">
        <template>
          <el-button type="primary" size="mini" @click="handleSave">保存</el-button>
          <el-button v-if="checkAll" type="primary" size="mini" @click="handleCheckAllChange">全选菜单</el-button>
          <el-button v-else type="primary" size="mini" @click="handleCheckAllChange">取消全选</el-button>
        </template>
        <el-tree
          ref="roleTree"
          :props="props"
          :load="loadNode"
          :data="menuList"
          :default-checked-keys="hasCheck"
          node-key="id"
          lazy
          check-strictly
          show-checkbox
        />
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
          <el-form-item label="名称" label-width="90px" prop="name">
            <el-input v-model="temp.name" type="text" placeholder="角色名称" />
          </el-form-item>
          <el-form-item label="角色编码" label-width="90px">
            <el-input v-model="temp.code" type="text" placeholder="角色编码" />
          </el-form-item>
          <el-form-item label="备注" label-width="90px">
            <el-input v-model="temp.remark" type="text" placeholder="备注" />
          </el-form-item>
        </template>

      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{ $t('table.confirm') }}</el-button>
        <el-button v-if="dialogStatus=='update'" type="primary" @click="updateData">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { checkUserLogin } from '@/api/user'
import { getRoles, createRole, updateRole, deleteRole } from '@/api/staffRole'
import { getNavigations } from '@/api/navigation'
import { getNavigationApis } from '@/api/navigationApi'
import { getRoleNavigations, updateNavigationRole } from '@/api/navigationRole'
import { getRoleApis, saveRoleApi } from '@/api/roleApi'
import { roleOptions, formatAuthorities, LOGIN_VALID_CHARACTER } from '@/utils/app-common'

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
      menuList: [],
      roleNavList: [],
      roleApiList: [], // 用户上一次编辑的数据
      roleApiListTmp: [], // 懒加载获取的数据
      total: 0,
      hasCheck: [],
      checkAll: true,
      listLoading: false,
      clickConfig: false,
      listQuery: {
        page: 0,
        size: 10,
        authority: null
      },
      menuListQuery: {
        page: 0,
        size: 500,
        authority: null
      },
      roleOptions,
      temp: {
        id: undefined
      },
      dialogVisible: false,
      dialogStatus: '',
      rules: {
        login: [{ required: true, trigger: 'blur', validator: validateLogin }],
        name: [{ required: true, trigger: 'blur', message: '名称不能为空' }]

      },
      props: {
        label: function(data, node) {
          if (node.data.title) {
            return node.data.title
          } else {
            return node.data.method
          }
        },
        children: 'title',
        isLeaf: function(data, node) {
          if (node.data.title) {
            return false
          } else {
            return true
          }
        }
      },
      count: 1
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
    this.getMenuData()
  },
  methods: {
    async getData() {
      this.listLoading = true
      const resp = await getRoles(this.listQuery)
      this.list = resp.data
      this.total = Number(resp.headers['x-total-count'])
      this.listLoading = false
    },
    async getMenuData() {
      this.listLoading = true
      const resp = await getNavigations(this.menuListQuery)
      this.menuList = resp.data
      this.total = Number(resp.headers['x-total-count'])
      this.listLoading = false
    },
    async getRoleNavigation(roleId) {
      const resp = await getRoleNavigations(roleId)
      this.roleList = resp.data
      resp.data.forEach(item => {
        this.hasCheck.push(item.id)
      })
      this.$nextTick(() => {
        if (this.$refs.roleTree) {
          this.$refs.roleTree.setCheckedKeys(this.hasCheck)
        }
      })
    },
    async getRoleApis(temp) {
      this.roleApiList = []
      const roleApiResp = await getRoleApis(temp)
      roleApiResp.data.forEach(item => {
        this.hasCheck.push(item.id)
        this.roleApiList.push(item.id)
      })
      this.$nextTick(() => {
        if (this.$refs.roleTree) {
          this.$refs.roleTree.setCheckedKeys(this.hasCheck)
        }
      })
    },
    handleFilter() {
      this.listQuery.page = 0
      this.getData()
    },
    handleCreate() {
      this.temp = {
        id: undefined,
        name: '',
        remark: '',
        code: ''
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
    async handleConfig(row) {
      this.temp = {
        roleId: row.id,
        navigationIds: []
      }
      this.hasCheck = []
      this.getRoleNavigation(this.temp.roleId)
      this.getRoleApis(this.temp)
      this.$nextTick(() => {
        this.clickConfig = true
        this.checkAll = true
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

        await deleteRole(this.temp.id)
        this.getData()
      } catch (err) {
        console.log(err)
      }
    },
    createData() {
      this.$refs['dataForm'].validate(async valid => {
        if (valid) {
          await createRole(this.temp)
          this.getData()
          this.dialogVisible = false
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(async valid => {
        if (valid) {
          await updateRole(this.temp)
          this.getData()
          this.dialogVisible = false
        }
      })
    },
    handleNodeClick(data) {
    },
    async loadNode(node, resolve) {
      this.menuListQuery.parentId = node.data.id
      const resp = await getNavigations(this.menuListQuery)
      if (node.data.hasApis) {
        const navId = {
          navId: node.data.id
        }
        const apiResp = await getNavigationApis(navId)
        apiResp.data.forEach(item => {
          this.roleApiListTmp.push(item.id)
        })
        resp.data.push(...apiResp.data)
      }
      resolve(resp.data)
    },
    handleCheckAllChange() {
      if (this.checkAll) {
        this.$refs.roleTree.setCheckedNodes(this.menuList)
        this.checkAll = !this.checkAll
      } else {
        this.$refs.roleTree.setCheckedKeys([])
        this.checkAll = !this.checkAll
      }
    },
    handleSave() {
      const checkedApiList = []
      const checkList = this.$refs.roleTree.getCheckedNodes()
      checkList.forEach(item => { // 遍历所有已选择节点 得到 已选择菜单和已选择接口
        if (item.title) {
          this.temp.navigationIds.push(item.id)
        } else if (item.method) {
          checkedApiList.push(item.id)
        }
      })
      checkedApiList.forEach(item => { // 用已选择的接口数据与原始接口数据对比，若原始数组无该数据则push
        if (!this.roleApiList.includes(item)) {
          this.roleApiList.push(item)
        }
      })
      const needDeleteList = []
      this.roleApiList.forEach(item => { // 用原始接口数据与已选择的接口数据对比
        if (!checkedApiList.includes(item)) { // 若已选择的接口数据无该数据则说明可能需要删除
          if (this.roleApiListTmp.includes(item)) { // 用可能需要删除的数据与懒加载数据对比，若懒加载数据中存在，则说明用户操作过该菜单，需要删除
            needDeleteList.push(item)
          }
        }
      })
      this.roleApiList = this.roleApiList.filter(item1 => { // 过滤掉需要删除的数据，得到新的原始数据
        return !needDeleteList.includes(item1)
      })
      const roleApiTemp = {
        roleId: this.temp.roleId,
        apiIds: this.roleApiList
      }
      updateNavigationRole(this.temp)
      saveRoleApi(roleApiTemp)
      this.roleApiListTmp = []
      this.$notify({
        title: '修改成功',
        type: 'success'
      })
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

