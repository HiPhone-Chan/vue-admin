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
      <el-table-column min-width="110px" align="left" label="名称">
        <template slot-scope="scope">
          <span>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="图标">
        <template slot-scope="scope">
          <i :class="scope.row.icon" />
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="优先级">
        <template slot-scope="scope">
          <span>{{ scope.row.priority }}</span>
        </template>
      </el-table-column>
      <el-table-column width="310px" align="center" label="地址">
        <template slot-scope="scope">
          <span>{{ scope.row.path }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('table.actions')" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{ $t('table.edit') }}</el-button>
          <el-button type="warning" size="mini" @click="handleChildren(scope.row)">新增下级</el-button>
          <el-button v-if="!scope.row.hasChildren" type="danger" size="mini" @click="handleDelete(scope.row,'deleted')">{{ $t('table.delete') }}</el-button>
          <el-button type="primary" size="mini" @click="goNavigationApi(scope.row)">功能</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getData" />

    <el-dialog :visible.sync="dialogVisible">

      <el-form v-if="dialogStatus!='children'&&dialogStatus!='api'" ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">

        <template v-if="dialogStatus=='update'||dialogStatus=='create'">
          <el-form-item label="名称" prop="title" label-width="90px">
            <el-input v-model="temp.title" type="text" placeholder="title" />
          </el-form-item>
          <el-form-item label="图标" label-width="90px">
            <el-input v-model="temp.icon" type="text" placeholder="icon">
              <el-button slot="append" type="primary">
                <a
                  href="https://element.eleme.cn/#/zh-CN/component/icon"
                  target="_blank"
                >查看可选</a>
              </el-button>
            </el-input>
          </el-form-item>
          <el-form-item label="地址" label-width="90px" prop="path">
            <el-input v-model="temp.path" type="text" placeholder="path" />
          </el-form-item>
          <el-form-item label="优先级" label-width="90px">
            <el-input v-model="temp.priority" placeholder="优先级" />
          </el-form-item>
        </template>

      </el-form>

      <el-form v-else ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="名称" label-width="110px" prop="title">
          <el-input v-model="temp.title" placeholder="名称" />
        </el-form-item>
        <el-form-item label="图标" label-width="110px">
          <el-input v-model="temp.icon" placeholder="图标" />
        </el-form-item>
        <el-form-item label="地址" label-width="110px">
          <el-input v-model="temp.path" placeholder="地址" />
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
import { getNavigations, createNavigation, updateNavigation, deleteNavigation } from '@/api/navigation'
import { getApiInfos } from '@/api/apiInfo'
import { tableOpr } from './tree-opr'

export default {
  components: { Pagination },
  mixins: [tableOpr],
  data() {
    return {
      list: [],
      apiList: [],
      total: 0,
      listLoading: false,
      listQuery: {
        page: 0,
        size: 10,
        sort: ['priority,asc']
      },
      temp: {
        id: undefined
      },
      dialogVisible: false,
      dialogStatus: '',
      rules: {
        title: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        path: [{ required: true, message: '路径不能为空', trigger: 'blur' }]
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
    this.getApiData()
  },
  methods: {
    async getData() {
      this.listLoading = true
      const resp = await getNavigations(this.listQuery)
      this.list = resp.data
      this.total = Number(resp.headers['x-total-count'])
      this.listLoading = false
    },
    async getApiData() {
      this.listLoading = true
      const resp = await getApiInfos(this.apiListQuery)
      this.apiList = resp.data
      this.listLoading = false
    },
    handleFilter() {
      this.listQuery.page = 0
      this.getData()
    },
    handleCreate() {
      this.temp = {
        title: '',
        path: '',
        icon: ''
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
        path: '',
        icon: '',
        title: ''
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
        await deleteNavigation(this.temp.id)
        this.getData()
        this.refreshLoadTree(this.$refs.table.store.states.lazyTreeNodeMap, this.maps, this.temp.parentId)
      } catch (err) {
        // console.log(err)
        this.$notify({
          title: '当前菜单有子级或被角色绑定，无法删除！',
          type: 'warning'
        })
      }
    },
    goNavigationApi(row) {
      this.$router.push({
        path: './navigationApi',
        query: { navInfo: row }
      })
    },
    createData() {
      this.$refs['dataForm'].validate(async valid => {
        if (valid) {
          await createNavigation(this.temp)
          this.getData()
          this.dialogVisible = false
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(async valid => {
        if (valid) {
          await updateNavigation(this.temp)
          this.getData()
          this.refreshLoadTree(this.$refs.table.store.states.lazyTreeNodeMap, this.maps, this.temp.parentId)
          this.dialogVisible = false
        }
      })
    },
    async addChildren() {
      await createNavigation(this.temp)
      this.refreshLoadTree(this.$refs.table.store.states.lazyTreeNodeMap, this.maps, this.temp.id)
      this.getData()
      this.dialogVisible = false
    },
    getChildren(listQuery) {
      return getNavigations(listQuery)
    }
  }
}
</script>

<style>
</style>
