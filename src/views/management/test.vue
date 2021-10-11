<template>
  <div style="margin-top:20px">
    <el-row v-for="item in staffApis" :key="item.id">
      <el-button type="primary">{{ item.method }}</el-button>
    </el-row>
  </div>
</template>
<script>
import { getStaffNavigationApis } from '@/api/navigationApi'

export default {
  data() {
    return {
      temp: {},
      staffApis: []
    }
  },
  created() {
    this.getStaffNavigationApis()
  },
  methods: {
    async getStaffNavigationApis() {
      this.temp = { navId: this.$route.meta.id }
      const resp = await getStaffNavigationApis(this.temp)
      this.staffApis = resp.data
    }
  }
}
</script>

