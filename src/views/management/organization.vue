<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" :placeholder="$t('table.search')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">{{ $t('table.add') }}</el-button>
    </div>

    <el-table
      ref="table"
      v-loading="listLoading"
      :data="list"
      element-loading-text="给我一点时间"
      border
      fit
      highlight-current-row
      style="width: 100%"
      row-key="id"
      lazy
      :load="loadChildren"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column align="left" label="组织名称" min-width="130">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('table.actions')" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{ $t('table.edit') }}</el-button>
          <el-button type="warning" size="mini" @click="handleChildren(scope.row)">新增下级</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row,'deleted')">{{ $t('table.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getData" />

    <el-dialog :visible.sync="dialogVisible">
      <el-form v-if="dialogStatus!='children'" ref="dataForm" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <!-- 编辑 -->
        <template v-if="dialogStatus=='update'">
          <el-form-item :label="$t('table.id')">
            <el-input v-model="temp.id" type="text" placeholder="id" disabled />
          </el-form-item>
        </template>

        <template v-if="dialogStatus=='update'||dialogStatus=='create'">
          <el-form-item label="组织名称" prop="login" label-width="90px">
            <el-input v-model="temp.name" type="text" placeholder="请输入名称" />
          </el-form-item>
        </template>

      </el-form>

      <el-form v-else ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="父机构" label-width="110px">
          <el-input v-model="temp.parentName" placeholder="组织名称" disabled />
        </el-form-item>
        <el-form-item label="组织名称" label-width="110px">
          <el-input v-model="temp.name" placeholder="组织名称" />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{ $t('table.confirm') }}</el-button>
        <el-button v-if="dialogStatus=='update'" type="primary" @click="updateData">{{ $t('table.confirm') }}</el-button>
        <el-button v-if="dialogStatus=='children'" type="primary" @click="addChildren">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { checkUserLogin } from '@/api/user'
import { getOrganizations, createOrganization, updateOrganization, deleteOrganization } from '@/api/organization'
import { roleOptions, formatAuthorities, LOGIN_VALID_CHARACTER } from '@/utils/app-common'
import { tableOpr } from './tree-opr'

export default {
  components: { Pagination },
  filters: {
    formatAuthorities
  },
  mixins: [tableOpr],
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
      const resp = await getOrganizations(this.listQuery)
      this.list = resp.data
      this.list.forEach(item => {
        item.hasChildren = true
      })
      this.total = Number(resp.headers['x-total-count'])
      this.listLoading = false
    },
    handleFilter() {
      this.listQuery.page = 0
      this.getData()
    },
    handleCreate() {
      this.temp = {
        id: '',
        name: '',
        parentId: ''
      }
      this.dialogStatus = 'create'
      this.dialogVisible = true
    },
    handleUpdate(row) {
      this.dialogStatus = 'update'
      this.temp = Object.assign({}, row)
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleChildren(row) {
      this.dialogStatus = 'children'
      this.temp = {
        parentId: row.id,
        id: row.parentId,
        parentName: row.name,
        name: '',
        code: '',
        type: ''
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

        await deleteOrganization(this.temp.id)
        this.getData()
        this.refreshLoadTree(this.$refs.table.store.states.lazyTreeNodeMap, this.maps, this.temp.parentId)
      } catch (err) {
        console.log(err)
      }
    },
    async createData() {
      await createOrganization(this.temp)
      this.getData()
      this.dialogVisible = false
    },
    updateData() {
      this.$refs['dataForm'].validate(async valid => {
        if (valid) {
          await updateOrganization(this.temp)
          this.getData()
          this.refreshLoadTree(this.$refs.table.store.states.lazyTreeNodeMap, this.maps, this.temp.parentId)
          this.dialogVisible = false
        }
      })
    },
    async addChildren() {
      await createOrganization(this.temp)
      this.getData()
      this.refreshLoadTree(this.$refs.table.store.states.lazyTreeNodeMap, this.maps, this.temp.parentId)
      this.dialogVisible = false
    },
    getChildren(listQuery) {
      return getOrganizations(listQuery)
    }
  }
}
</script>

<style>
</style>
