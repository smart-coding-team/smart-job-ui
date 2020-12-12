import request from '@/utils/request'

// 查询任务调度列表
export function listJobThread(query) {
  return request({
    url: '/api/jobThread/list',
    method: 'get',
    params: query
  })
}

// 查询任务调度详细
export function getJobThread(id) {
  return request({
    url: '/api/jobThread/' + id,
    method: 'get'
  })
}

// 新增任务调度
export function addJobThread(data) {
  return request({
    url: '/api/jobThread',
    method: 'post',
    data: data
  })
}

// 修改任务调度
export function updateJobThread(data) {
  return request({
    url: '/api/jobThread',
    method: 'put',
    data: data
  })
}

// 删除任务调度
export function delJobThread(id) {
  return request({
    url: '/api/jobThread/' + id,
    method: 'delete'
  })
}

// 导出任务调度
export function exportJobThread(query) {
  return request({
    url: '/api/jobThread/export',
    method: 'get',
    params: query
  })
}

export function changeStatus(id,status) {
  return request({
    url: '/api/jobThread/changeStatus?id=' + id+"&status="+status,
    method: 'post'
  })
}
