<template>
  <div>developing</div>
</template>

<script>
import request from '@/utils/request'
export default {
  data() {
    return {
      data: {}
    }
  },
  mounted() {
    this.getSwaggerInfo()
  },
  methods: {
    async getSwaggerInfo() {
      const resp = await request.get('/v3/api-docs')
      this.data = resp.data
    }
  }
}
</script>

<style>
</style>
