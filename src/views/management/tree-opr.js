export const tableOpr = {
  data() {
    return {
      maps: new Map()
    }
  },
  methods: {
    async loadChildren(tree, treeNode, resolve) {
      this.maps.set(tree.id, { tree, treeNode, resolve })
      const listQuery = {
        page: 0,
        size: 200,
        parentId: tree.id
      }
      const resp = await this.getChildren(listQuery)
      resolve(resp.data)
    },
    refreshLoadTree(lazyTreeNodeMap, maps, parentId) {
      if (maps.get(parentId)) {
        const { tree, treeNode, resolve } = maps.get(parentId)
        this.$set(lazyTreeNodeMap, parentId, [])
        if (tree) {
          this.loadChildren(tree, treeNode, resolve)
        }
      }
    }
  }
}
