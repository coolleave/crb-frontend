import request from '@/utils/request'

// 查询病例轨迹与接触人群列表
export function listContact(query) {
  return request({
    url: '/report/contact/list',
    method: 'get',
    params: query
  })
}

// 查询病例轨迹与接触人群详细
export function getContact(trackId) {
  return request({
    url: '/report/contact/' + trackId,
    method: 'get'
  })
}

// 新增病例轨迹与接触人群
export function addContact(data) {
  return request({
    url: '/report/contact',
    method: 'post',
    data: data
  })
}

// 修改病例轨迹与接触人群
export function updateContact(data) {
  return request({
    url: '/report/contact',
    method: 'put',
    data: data
  })
}

// 删除病例轨迹与接触人群
export function delContact(trackId) {
  return request({
    url: '/report/contact/' + trackId,
    method: 'delete'
  })
}
