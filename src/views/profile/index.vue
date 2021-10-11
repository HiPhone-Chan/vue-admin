<template>
  <div class="app-container">
    <div v-if="user">
      <el-row :gutter="20">

        <el-col :span="6" :xs="24">
          <user-card :user="user" />
        </el-col>

        <el-col :span="18" :xs="24">
          <el-card>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="用户信息" name="account">
                <account :user="user" @on-change="updateAccount" />
              </el-tab-pane>
              <el-tab-pane label="修改密码" name="password">
                <change-password />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>

      </el-row>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import UserCard from './components/UserCard'
import Account from './components/Account'
import ChangePassword from './components/ChangePassword'
import { updateAccount } from '@/api/account'

export default {
  name: 'Profile',
  components: { UserCard, Account, ChangePassword },
  data() {
    return {
      user: {},
      activeTab: 'account'
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'nickname',
      'mobile',
      'avatar',
      'roles'
    ])
  },
  created() {
    this.getUser()
  },
  methods: {
    getUser() {
      this.user = {
        name: this.name,
        nickname: this.nickname,
        roles: this.roles,
        mobile: this.mobile,
        avatar: this.avatar
      }
    },
    async updateAccount(data) {
      await updateAccount({
        nickName: this.user.nickname,
        mobile: this.user.mobile,
        imageUrl: this.user.avatar
      })
      this.$store.dispatch('user/getInfo')

      this.$message({
        message: '更新成功',
        type: 'success',
        duration: 5 * 1000
      })
    }
  }
}
</script>
