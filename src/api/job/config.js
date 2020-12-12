import request from '@/utils/request'

// 查询任务管理配置列表
export function listConfig(query) {
  return request({
    url: '/api/config/list',
    method: 'get',
    params: query
  })
}

// 查询任务管理配置详细
export function getConfig(id) {
  return request({
    url: '/api/config/' + id,
    method: 'get'
  })
}

// 新增任务管理配置
export function addConfig(data) {
  return request({
    url: '/api/config',
    method: 'post',
    data: data
  })
}

// 修改任务管理配置
export function updateConfig(data) {
  return request({
    url: '/api/config',
    method: 'put',
    data: data
  })
}

// 删除任务管理配置
export function delConfig(id) {
  return request({
    url: '/api/config/' + id,
    method: 'delete'
  })
}

// 导出任务管理配置
export function exportConfig(query) {
  return request({
    url: '/api/config/export',
    method: 'get',
    params: query
  })
}