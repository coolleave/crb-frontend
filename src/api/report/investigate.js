import request from '@/utils/request'

// 查询上报数据核实诊断与调查处理列表
export function listInvestigate(query) {
  return request({
    url: '/report/investigate/list',
    method: 'get',
    params: query
  })
}

// 查询上报数据核实诊断与调查处理详细
export function getInvestigate(verifyId) {
  return request({
    url: '/report/investigate/' + verifyId,
    method: 'get'
  })
}

// 新增上报数据核实诊断与调查处理
export function addInvestigate(data) {
  return request({
    url: '/report/investigate',
    method: 'post',
    data: data
  })
}

// 修改上报数据核实诊断与调查处理
export function updateInvestigate(data) {
  return request({
    url: '/report/investigate',
    method: 'put',
    data: data
  })
}

// 删除上报数据核实诊断与调查处理
export function delInvestigate(verifyId) {
  return request({
    url: '/report/investigate/' + verifyId,
    method: 'delete'
  })
}
