<template>
  <el-form>
    <el-form-item :label="$t('login.nickname')">
      <el-input v-model.trim="user.nickname" />
    </el-form-item>
    <el-form-item :label="$t('login.mobile')">
      <el-input v-model.trim="user.mobile" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">保存</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          name: '',
          mobile: '',
          avatar: ''
        }
      }
    }
  },
  methods: {
    submit() {
      this.$emit('on-change', {})
      this.$message({
        message: 'User information has been updated successfully',
        type: 'success',
        duration: 5 * 1000
      })
    }
  }
}
</script>
