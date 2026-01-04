import request from '@/utils/request'

// 查询人员信息列表
export function listStaff(query) {
  return request({
    url: '/report/staff/list',
    method: 'get',
    params: query
  })
}

// 查询人员信息详细
export function getStaff(medId) {
  return request({
    url: '/report/staff/' + medId,
    method: 'get'
  })
}

// 新增人员信息

export function addStaff(data) {
  return request({
    url: '/report/staff',
    method: 'post',
    data: data
  })
}

// 修改人员信息

export function updateStaff(data) {
  return request({
    url: '/report/staff',
    method: 'put',
    data: data
  })
}

// 删除人员信息

export function delStaff(medId) {
  return request({
    url: '/report/staff/' + medId,
    method: 'delete'
  })
}
