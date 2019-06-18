<template>
  <div class="dashboard-container">
    <github-corner style="position: absolute; top: 0px; border: 0; right: 0;" />
    <!-- <component :is="currentRole"/> -->
  </div>
</template>

<script>
import GithubCorner from '@/components/GithubCorner'
import { mapGetters } from 'vuex'

export default {
  components: {
    GithubCorner
  },
  data() {
    return {
      currentRole: 'adminDashboard'
    }
  },
  computed: {
    ...mapGetters(['roles'])
  },
  created() {
    if (!this.roles.includes('ROLE_ADMIN')) {
      this.currentRole = 'otherDashboard'
    }
  }
}
</script>
