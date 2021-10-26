<template>
  <div class="app-container" style="display:flex">
    <el-card class="box-card">
      <el-tree
        ref="organizationTree"
        :props="orgTreeProps"
        :load="loadTreeNode"
        :data="organizationList"
        node-key="id"
        :render-content="renderContent"
        lazy
        @node-click="treeNodeClick"
      />
    </el-card>

    <el-card class="table-card">
      <el-table
        v-loading="listLoading"
        :data="staffList"
        element-loading-text="给我一点时间"
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
        <el-table-column align="center" />
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
      staffList: [],
      listLoading: false,
      staffListQuery: {
        page: 0,
        size: 10
      },
      organizationListQuery: {
        page: 0,
        size: 500
      },
      orgTreeProps: {
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
      const resp = await getStaffs(this.staffListQuery)
      this.staffList = resp.data
      this.total = Number(resp.headers['x-total-count'])
      this.listLoading = false
    },
    async loadTreeNode(node, resolve) {
      this.organizationListQuery.parentId = node.data.id
      const resp = await getOrganizations(this.organizationListQuery)
      resolve(resp.data)
    },
    async treeNodeClick(data) {
      console.log(data)
      this.listLoading = true
      this.staffListQuery.organizationId = data.id
      const resp = await getOrganizationUsers(this.staffListQuery)
      this.staffList = resp.data
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
    /* width: 320px;
    height: 800px; */
    width: 350px;
    height: 95%;
    margin-right: 20px;
    position: absolute;
  }
  .table-card{
    width: 90%;
    height: 95%;
    left: 400px;
    position: absolute;
  }

</style>
