import request from '@/utils/request'

// 查询任务告警方式配置列表
export function listAlarm(query) {
  return request({
    url: '/api/alarm/list',
    method: 'get',
    params: query
  })
}

// 查询任务告警方式配置详细
export function getAlarm(id) {
  return request({
    url: '/api/alarm/' + id,
    method: 'get'
  })
}

// 新增任务告警方式配置
export function addAlarm(data) {
  return request({
    url: '/api/alarm',
    method: 'post',
    data: data
  })
}

// 修改任务告警方式配置
export function updateAlarm(data) {
  return request({
    url: '/api/alarm',
    method: 'put',
    data: data
  })
}

// 删除任务告警方式配置
export function delAlarm(id) {
  return request({
    url: '/api/alarm/' + id,
    method: 'delete'
  })
}

// 删除任务告警方式配置
export function testSend(data) {
  return request({
    url: '/api/alarm/testSend',
    method: 'post',
    data: data
  })
}
export function querySearch(queryStr) {
  return request({
    url: '/api/alarm/querySearch?queryStr=' + queryStr,
    method: 'get'
  })
}
export function queryIds(alarmIds) {
  return request({
    url: '/api/alarm/queryIds?alarmIds=' + alarmIds,
    method: 'get'
  })
}