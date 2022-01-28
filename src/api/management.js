import request from '@/utils/request'

export function checkHealth() {
  return request.get('/management/health')
}

export function loadConfiguration() {
  return request.get('/management/configprops')
}

export function loadEnvConfiguration() {
  return request.get('/management/env')
}
