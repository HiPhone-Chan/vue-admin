<template>
  <div class="form">
    <el-form ref="form" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="旧密码" prop="oldPwd">
        <el-input v-model="form.oldPwd" type="password" auto-complete="off" />
      </el-form-item>
      <el-form-item label="新密码" prop="newPwd">
        <el-input v-model="form.newPwd" type="password" auto-complete="off" />
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPwd">
        <el-input v-model="form.confirmPwd" type="password" auto-complete="off" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submit('form')">提交</el-button>
        <el-button @click="reset('form')">重置</el-button>
      </el-form-item>
    </el-form>

  </div>
</template>

<script>
import { changePassword } from '@/api/account'

const VALID_CHARACTER = {
  pattern: /^[a-zA-Z0-9_'.@]{4,50}$/,
  message: `英文大小写,数字,以及 _'.@,长度4-50`
}

export default {
  data() {
    return {
      form: {
        oldPwd: '',
        newPwd: '',
        confirmPwd: ''
      },
      rules: {
        oldPwd: [{ required: true, message: '请输入旧密码' }],
        newPwd: [VALID_CHARACTER, { required: true, message: '请输入新密码' }],
        confirmPwd: [
          {
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error('请输入确认密码'))
              } else if (value !== this.form.newPwd) {
                callback(new Error('两次输入密码不一致!'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    submit(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          const req = {
            currentPassword: this.form.oldPwd,
            newPassword: this.form.newPwd
          }
          await changePassword(req)
          this.$notify({
            title: '修改成功',
            type: 'success'
          })
          this.reset(formName)
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    reset(formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>

<style scoped>
.form {
  margin-top: 10px;
  width: 300px;
}
</style>
