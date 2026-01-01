import request from '@/utils/request'

// 查询病例诊治处理列表
export function listTreatment(query) {
  return request({
    url: '/report/treatment/list',
    method: 'get',
    params: query
  })
}

// 查询病例诊治处理详细
export function getTreatment(diagId) {
  return request({
    url: '/report/treatment/' + diagId,
    method: 'get'
  })
}

// 新增病例诊治处理
export function addTreatment(data) {
  return request({
    url: '/report/treatment',
    method: 'post',
    data: data
  })
}

// 修改病例诊治处理
export function updateTreatment(data) {
  return request({
    url: '/report/treatment',
    method: 'put',
    data: data
  })
}

// 删除病例诊治处理
export function delTreatment(diagId) {
  return request({
    url: '/report/treatment/' + diagId,
    method: 'delete'
  })
}
