<template>
  <div class="app-container" style="display:flex">
    <el-card class="box-card">
      <el-tree
        ref="roleTree"
        :props="props"
        :load="loadNode"
        :data="organizationList"
        node-key="id"
        :render-content="renderContent"
        lazy
        @node-click="nodeClick"
      />
    </el-card>

    <el-card class="table-card">
      <el-table
        v-loading="listLoading"
        :data="list"
        element-loading-text="给我一点时间"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column width="200px" align="center" :label="$t('login.username')">
          <template slot-scope="scope">
            <span>{{ scope.row.login }}</span>
          </template>
        </el-table-column>
        <el-table-column width="200px" align="center" :label="$t('user.nickname')">
          <template slot-scope="scope">
            <span>{{ scope.row.nickName }}</span>
          </template>
        </el-table-column>
        <el-table-column width="200px" align="center" :label="$t('login.mobile')">
          <template slot-scope="scope">
            <span>{{ scope.row.mobile }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getOrganizations } from '@/api/organization'
import { getStaffs } from '@/api/staff'
import { getOrganizationUsers } from '@/api/organizationUser'

export default {
  data() {
    return {
      organizationList: [],
      list: [],
      listLoading: false,
      listQuery: {
        page: 0,
        size: 10,
        authority: null
      },
      organizationListQuery: {
        page: 0,
        size: 500,
        authority: null
      },
      props: {
        label: 'name',
        children: 'name'
      }
    }
  },
  mounted() {
    this.getOrganizationData()
    this.getData()
  },
  methods: {
    async getOrganizationData() {
      this.listLoading = true
      const resp = await getOrganizations(this.organizationListQuery)
      this.organizationList = resp.data
      this.total = Number(resp.headers['x-total-count'])
      this.listLoading = false
    },
    async getData() {
      this.listLoading = true
      const resp = await getStaffs(this.listQuery)
      this.list = resp.data
      this.total = Number(resp.headers['x-total-count'])
      this.listLoading = false
    },
    async loadNode(node, resolve) {
      this.organizationListQuery.parentId = node.data.id
      const resp = await getOrganizations(this.organizationListQuery)
      resolve(resp.data)
    },
    async nodeClick(data) {
      console.log(data)
      this.listLoading = true
      this.listQuery.organizationId = data.id
      const resp = await getOrganizationUsers(this.listQuery)
      this.list = resp.data
      this.total = Number(resp.headers['x-total-count'])
      this.listLoading = false
    },
    renderContent(h, { node, data, store }) {
      if (node.level > 1) {
        return (
          <span style='font-size: 14px;color:black;'>
            <i class='el-icon-s-order' style='width:20px' />
            <span> {node.label}</span>
          </span>
        )
      } else if (node.expanded) {
        return (
          <span style='font-size: 14px;color:black;'>
            <i class='el-icon-folder-opened' style='width:20px;' />
            <span> {node.label}</span>
          </span>
        )
      } else {
        return (
          <span style='font-size: 14px;color:black;'>
            <i class='el-icon-folder' style='width:20px' />
            <span> {node.label}</span>
          </span>
        )
      }
    }
  }
}
</script>
<style>
  .text {
    font-size: 14px;
  }

  .item {
    padding: 18px 0;
  }

  .box-card {
    width: 320px;
    height: 800px;
    margin-right: 20px;
  }

</style>
