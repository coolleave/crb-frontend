<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="病例编号" prop="caseCode">
        <el-input
          v-model="queryParams.caseCode"
          placeholder="请输入病例编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
    
      <el-form-item label="患者姓名" prop="patientName">
        <el-input
          v-model="queryParams.patientName"
          placeholder="请输入患者姓名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
     
      
      
      <el-form-item label="发病时间" prop="onsetDatetime">
        <el-date-picker clearable
          v-model="queryParams.onsetDatetime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择发病时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="上报时间" prop="reportDatetime">
        <el-date-picker clearable
          v-model="queryParams.reportDatetime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择上报时间">
        </el-date-picker>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['report:report:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['report:report:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['report:report:remove']"
          v-if="false"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['report:report:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="reportList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="病例编号" align="center" prop="caseCode" />
      <el-table-column label="传染病" align="center" prop="infectId" />
      <el-table-column label="上报类型" align="center" prop="reportType">
        <template #default="scope">
          <dict-tag :options="case_report_type" :value="scope.row.reportType" />
        </template>
      </el-table-column>

      <el-table-column label="患者姓名" align="center" prop="patientName" />
      <el-table-column label="性别" align="center" prop="patientGender">
        <template #default="scope">
          <dict-tag :options="case_psex" :value="scope.row.patientGender" />
        </template>
      </el-table-column>
      <el-table-column label="患者年龄" align="center" prop="patientAge" />
      <el-table-column label="患者所在省份" align="center" prop="province" />
      <el-table-column label="患者所在城市" align="center" prop="city" />
      <el-table-column label="患者所在区县" align="center" prop="district" />
      <el-table-column label="患者详细住址" align="center" prop="detailAddress" />
      <el-table-column label="发病时间" align="center" prop="onsetDatetime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.onsetDatetime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上报时间" align="center" prop="reportDatetime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.reportDatetime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上报医务人员" align="center" prop="reporterId" />
      <el-table-column label="上报机构" align="center" prop="reportDeptId" />
      <el-table-column label="核实状态" align="center" prop="caseStatus" >
        <template #default="scope">
          <dict-tag :options="case_verify_result" :value="scope.row.caseStatus" />
        </template>
      </el-table-column>
      <el-table-column label="住院病区" align="center" prop="hospitalWard" />
      <el-table-column label="住院床位号" align="center" prop="hospitalBed" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['report:report:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['report:report:remove']" v-if="false">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改病例基础信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="reportRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="病例编号" prop="caseCode">
          <el-input v-model="form.caseCode" placeholder="请输入病例编号" />
        </el-form-item>
        <el-form-item label="传染病" prop="infectId">
          <el-input v-model="form.infectId" placeholder="请输入传染病" />
        </el-form-item>
        <el-form-item label="患者姓名" prop="patientName">
          <el-input v-model="form.patientName" placeholder="请输入患者姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="patientGender">
          <dict-tag :options="case_psex" :value="form.patientGender" />
          <el-select v-model="form.patientGender" placeholder="请选择性别">
            <el-option
              v-for="item in case_psex"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="患者年龄" prop="patientAge">
          <el-input v-model="form.patientAge" placeholder="请输入患者年龄" />
        </el-form-item>
        <el-form-item label="患者身份证号" prop="patientIdcard">
          <el-input v-model="form.patientIdcard" placeholder="请输入患者身份证号" />
        </el-form-item>
        <el-form-item label="患者手机号" prop="patientPhone">
          <el-input v-model="form.patientPhone" placeholder="请输入患者手机号" />
        </el-form-item>
        <el-form-item label="患者所在省份" prop="province">
          <el-input v-model="form.province" placeholder="请输入患者所在省份" />
        </el-form-item>
        <el-form-item label="患者所在城市" prop="city">
          <el-input v-model="form.city" placeholder="请输入患者所在城市" />
        </el-form-item>
        <el-form-item label="患者所在区县" prop="district">
          <el-input v-model="form.district" placeholder="请输入患者所在区县" />
        </el-form-item>
        <el-form-item label="患者详细住址" prop="detailAddress">
          <el-input v-model="form.detailAddress" placeholder="请输入患者详细住址" />
        </el-form-item>
        <el-form-item label="发病时间" prop="onsetDatetime">
          <el-date-picker clearable
            v-model="form.onsetDatetime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择发病时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="上报时间" prop="reportDatetime">
          <el-date-picker clearable
            v-model="form.reportDatetime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择上报时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="上报医务人员" prop="reporterId">
          <el-input v-model="form.reporterId" placeholder="请输入上报医务人员" />
        </el-form-item>
        <el-form-item label="上报机构" prop="reportDeptId">
          <el-input v-model="form.reportDeptId" placeholder="请输入上报机构" />
        </el-form-item>
        <el-form-item label="住院病区" prop="hospitalWard">
          <el-input v-model="form.hospitalWard" placeholder="请输入住院病区" />
        </el-form-item>
        <el-form-item label="住院床位号" prop="hospitalBed">
          <el-input v-model="form.hospitalBed" placeholder="请输入住院床位号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Report">
import { listReport, getReport, delReport, addReport, updateReport } from "@/api/report/report"

const { proxy } = getCurrentInstance()
const { case_report_type } = proxy.useDict("case_report_type")
const {case_verify_result} = proxy.useDict("case_verify_result")
const {case_psex } = proxy.useDict("case_psex")
const reportList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    caseCode: null,
    infectId: null,
    reportType: null,
    patientName: null,
    patientGender: null,
    patientAge: null,
    patientIdcard: null,
    patientPhone: null,
    province: null,
    city: null,
    district: null,
    detailAddress: null,
    onsetDatetime: null,
    reportDatetime: null,
    reporterId: null,
    reportDeptId: null,
    caseStatus: null,
    hospitalWard: null,
    hospitalBed: null,
  },
  rules: {
    caseCode: [
      { required: true, message: "病例编号不能为空", trigger: "blur" }
    ],
    reportType: [
      { required: true, message: "上报类型不能为空", trigger: "change" }
    ],
    patientName: [
      { required: true, message: "患者姓名不能为空", trigger: "blur" }
    ],
    patientGender: [
      { required: true, message: "性别不能为空", trigger: "blur" }
    ],
    patientAge: [
      { required: true, message: "患者年龄不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询病例基础信息列表 */
function getList() {
  loading.value = true
  listReport(queryParams.value).then(response => {
    reportList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  form.value = {
    caseId: null,
    caseCode: null,
    infectId: null,
    reportType: null,
    patientName: null,
    patientGender: null,
    patientAge: null,
    patientIdcard: null,
    patientPhone: null,
    province: null,
    city: null,
    district: null,
    detailAddress: null,
    onsetDatetime: null,
    reportDatetime: null,
    reporterId: null,
    reportDeptId: null,
    caseStatus: null,
    hospitalWard: null,
    hospitalBed: null,
    createTime: null,
    updateTime: null
  }
  proxy.resetForm("reportRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.caseId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加病例基础信息"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _caseId = row.caseId || ids.value
  getReport(_caseId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改病例基础信息"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["reportRef"].validate(valid => {
    if (valid) {
      if (form.value.caseId != null) {
        updateReport(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addReport(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _caseIds = row.caseId || ids.value
  proxy.$modal.confirm('是否确认删除病例基础信息编号为"' + _caseIds + '"的数据项？').then(function() {
    return delReport(_caseIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('report/report/export', {
    ...queryParams.value
  }, `report_${new Date().getTime()}.xlsx`)
}

getList()
</script>
