import request from '@/utils/request'

// 查询传染病信息字典列表
export function listInfo(query) {
  return request({
    url: '/report/info/list',
    method: 'get',
    params: query
  })
}

// 查询传染病信息字典详细
export function getInfo(infectId) {
  return request({
    url: '/report/info/' + infectId,
    method: 'get'
  })
}

// 新增传染病信息字典
export function addInfo(data) {
  return request({
    url: '/report/info',
    method: 'post',
    data: data
  })
}

// 修改传染病信息字典
export function updateInfo(data) {
  return request({
    url: '/report/info',
    method: 'put',
    data: data
  })
}

// 删除传染病信息字典
export function delInfo(infectId) {
  return request({
    url: '/report/info/' + infectId,
    method: 'delete'
  })
}
