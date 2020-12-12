import request from '@/utils/request'

export function getLdapInfo(query) {
  return request({
    url: '/api/system/setting/ldap/info',
    method: 'get',
    params: query
  })
}

export function updateLdapInfo(data) {
  return request({
    url: '/api/system/setting/ldap/update',
    method: 'post',
    data: data
  })
}

export function addLdapInfo(data) {
  return request({
    url: '/api/system/setting/ldap/add',
    method: 'post',
    data: data
  })
}

export function testLdap(data) {
  return request({
    url: '/api/system/setting/ldap/test',
    method: 'post',
    data: data
  })
}