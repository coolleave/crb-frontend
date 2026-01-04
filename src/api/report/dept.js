import request from '@/utils/request'

// 查询卫生机构/部门信息列表
export function listDept(query) {
  return request({
    url: '/report/dept/list',
    method: 'get',
    params: query
  })
}

// 查询卫生机构/部门信息详细
export function getDept(deptId) {
  return request({
    url: '/report/dept/' + deptId,
    method: 'get'
  })
}

// 新增卫生机构/部门信息
export function addDept(data) {
  return request({
    url: '/report/dept',
    method: 'post',
    data: data
  })
}

// 修改卫生机构/部门信息
export function updateDept(data) {
  return request({
    url: '/report/dept',
    method: 'put',
    data: data
  })
}

// 删除卫生机构/部门信息
export function delDept(deptId) {
  return request({
    url: '/report/dept/' + deptId,
    method: 'delete'
  })
}
