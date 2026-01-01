import request from '@/utils/request'

// 查询病例基础信息列表
export function listReport(query) {
  return request({
    url: '/report/report/list',
    method: 'get',
    params: query
  })
}

// 查询病例基础信息详细
export function getReport(caseId) {
  return request({
    url: '/report/report/' + caseId,
    method: 'get'
  })
}

// 新增病例基础信息
export function addReport(data) {
  return request({
    url: '/report/report',
    method: 'post',
    data: data
  })
}

// 修改病例基础信息
export function updateReport(data) {
  return request({
    url: '/report/report',
    method: 'put',
    data: data
  })
}

// 删除病例基础信息
export function delReport(caseId) {
  return request({
    url: '/report/report/' + caseId,
    method: 'delete'
  })
}
