<template>
  <div class="dashboard-container">
    <github-corner v-if="isAdmin" style="position: absolute; top: 0px; border: 0; right: 0;" />
    <component :is="currentRole" />
  </div>
</template>

<script>
import GithubCorner from '@/components/GithubCorner'
import { mapGetters } from 'vuex'
import adminDashboard from './admin'
import otherDashboard from './other'

export default {
  components: {
    GithubCorner, adminDashboard, otherDashboard
  },
  data() {
    return {
      currentRole: 'adminDashboard'
    }
  },
  computed: {
    ...mapGetters(['roles']),
    isAdmin() {
      return this.roles.includes('ROLE_ADMIN')
    }
  },
  created() {
    if (this.roles.includes('ROLE_ADMIN')) {
      this.currentRole = 'adminDashboard'
    } else {
      this.currentRole = 'otherDashboard'
    }
  }
}
</script>
