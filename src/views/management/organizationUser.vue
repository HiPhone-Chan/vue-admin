<template>
  <div class="app-container">
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
      <el-table-column align="center" label="账号" min-width="60">
        <template slot-scope="scope">
          <span>{{ scope.row.login }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="60" align="center" label="昵称">
        <template slot-scope="scope">
          <span>{{ scope.row.nickName }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="60" align="center" label="电话">
        <template slot-scope="scope">
          <span>{{ scope.row.mobile }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('table.actions')" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="danger" size="mini" @click="handleDelete(scope.row,'deleted')">移出部门</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getData" />

    <el-dialog :visible.sync="dialogVisible">
      <el-input v-model="listQuery.title" :placeholder="$t('table.search')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
      <el-table
        v-loading="listLoading"
        :data="userList"
        element-loading-text="给我一点时间"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column align="center" label="账号" min-width="60">
          <template slot-scope="scope">
            <span>{{ scope.row.login }}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="60" align="center" label="昵称">
          <template slot-scope="scope">
            <span>{{ scope.row.nickName }}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="60" align="center" label="电话">
          <template slot-scope="scope">
            <span>{{ scope.row.mobile }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('table.actions')" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="handleAddUser(scope.row)">添加</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="apiTotal>0"
        :total="apiTotal"
        :page.sync="userListQuery.page"
        :limit.sync="userListQuery.size"
        @pagination="getUserData"
      />
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { getOrganizationUsers, saveOrganizationUser, deleteOrganizationUser } from '@/api/organizationUser'
import { getStaffs } from '@/api/staff'
import { roleOptions, formatAuthorities } from '@/utils/app-common'

export default {
  components: { Pagination },
  filters: {
    formatAuthorities
  },
  data() {
    return {
      organizationId: '',
      list: [],
      userList: [],
      total: 0,
      apiTotal: 0,
      listLoading: false,
      dialogVisible: false,
      listQuery: {
        page: 0,
        size: 10,
        authority: null
      },
      userListQuery: {
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
    },
    organizationId: {
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
      this.organizationId = query.organizationId
    }
    if (query.navInfo) {
      this.organizationId = query.navInfo.id
    }
  },
  mounted() {
    this.getData()
    this.getUserData()
  },
  methods: {
    async getData() {
      this.listLoading = true
      this.listQuery.organizationId = this.organizationId
      const resp = await getOrganizationUsers(this.listQuery)
      this.list = resp.data
      this.total = Number(resp.headers['x-total-count'])
      this.listLoading = false
    },
    async getUserData() {
      this.listLoading = true
      const resp = await getStaffs(this.userListQuery)
      const tempUserList = resp.data
      this.userTotal = Number(resp.headers['x-total-count'])
      this.userList = []
      this.userList = tempUserList.filter(userItem => {
        return this.list.every(item => {
          return item.id !== userItem.id
        })
      })
      this.userTotal = this.userList.length
      this.listLoading = false
    },
    handleFilter() {
      this.listQuery.page = 0
      this.userListQuery.page = 0
      this.getData()
      this.getUserData()
    },
    handleCreate() {
      this.temp = {
        login: '',
        organizationId: ''
      }
      this.handleFilter()
      this.dialogVisible = true
    },
    async handleDelete(row) {
      this.temp = {
        organizationId: this.organizationId,
        login: row.login
      }

      try {
        await this.$confirm('该操作比较危险', '确认删除吗？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await deleteOrganizationUser(this.temp)
        this.getData()
      } catch (err) {
        console.log(err)
      }
    },
    async handleAddUser(row) {
      this.temp.organizationId = this.organizationId
      this.temp.login = row.login
      saveOrganizationUser(this.temp)
      await this.getData()
      await this.getUserData()
    }
  }
}
</script>

<style>
</style>
