import request from '@/utils/request'

// 查询任务告警记录列表
export function listAlarmLog(query) {
  return request({
    url: '/api/alarmLog/list',
    method: 'get',
    params: query
  })
}

// 查询任务告警记录详细
export function getAlarmLog(id) {
  return request({
    url: '/api/alarmLog/' + id,
    method: 'get'
  })
}

// 新增任务告警记录
export function addAlarmLog(data) {
  return request({
    url: '/api/alarmLog',
    method: 'post',
    data: data
  })
}

// 修改任务告警记录
export function updateAlarmLog(data) {
  return request({
    url: '/api/alarmLog',
    method: 'put',
    data: data
  })
}

// 删除任务告警记录
export function delAlarmLog(id) {
  return request({
    url: '/api/alarmLog/' + id,
    method: 'delete'
  })
}

// 导出任务告警记录
export function exportAlarmLog(query) {
  return request({
    url: '/api/alarmLog/export',
    method: 'get',
    params: query
  })
}