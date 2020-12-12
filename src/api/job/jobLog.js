import request from '@/utils/request'

// datax插件api
export function getList(params) {
  return request({
    url: '/api/log/pageList',
    method: 'get',
    params
  })
}

export function clearLog(jobGroup, jobId, type, num) {
  return request({
    url: '/api/log/clearLog?jobGroup=' + jobGroup + '&jobId=' + jobId + '&type=' + type + '&num=' + num,
    method: 'post'
  })
}

export function killJob(id) {
  return request({
    url: '/api/log/killJob/' + id,
    method: 'post'
  })
}

export function viewJobLog(executorAddress, triggerTime, logId, fromLineNum) {
  return request({
    url: '/api/log/logDetailCat?executorAddress=' + executorAddress + '&triggerTime=' + triggerTime + '&logId=' + logId + '&fromLineNum=' + fromLineNum,
    method: 'get'
  })
}
