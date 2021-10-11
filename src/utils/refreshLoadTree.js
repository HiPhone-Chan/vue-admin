// 重新触发树形表格的loadTree函数
export function refreshLoadTree(that, maps, parentId) {
  const { tree, treeNode, resolve } = maps.get(parentId)
  that.$set(that.$refs.table.store.states.lazyTreeNodeMap, parentId, [])
  if (tree) {
    that.loadChildren(tree, treeNode, resolve)
  }
}

