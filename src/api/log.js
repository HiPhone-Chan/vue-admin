import request from '@/utils/request'

export function getOperationLogs(params) {
  return request.get('/api/admin/operation-logs', { params })
}
