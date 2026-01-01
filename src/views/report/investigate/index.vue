<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
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
          v-hasPermi="['report:investigate:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['report:investigate:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['report:investigate:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['report:investigate:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="investigateList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="核实ID" align="center" prop="verifyId" />
      <el-table-column label="关联病例ID" align="center" prop="caseId" />
      <el-table-column label="核实时间" align="center" prop="verifyDatetime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.verifyDatetime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="1=确诊，2=疑似，3=排除，4=待复查" align="center" prop="verifyResult" />
      <el-table-column label="核实依据" align="center" prop="verifyBasis" />
      <el-table-column label="1=未处理，2=处理中，3=已完成，4=无需处理" align="center" prop="handleStatus" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['report:investigate:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['report:investigate:remove']">删除</el-button>
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

    <!-- 添加或修改上报数据核实诊断与调查处理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="investigateRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="关联病例ID" prop="caseId">
          <el-input v-model="form.caseId" placeholder="请输入关联病例ID" />
        </el-form-item>
        <el-form-item label="核实疾控人员ID" prop="verifyStaffId">
          <el-input v-model="form.verifyStaffId" placeholder="请输入核实疾控人员ID" />
        </el-form-item>
        <el-form-item label="核实时间" prop="verifyDatetime">
          <el-date-picker clearable
            v-model="form.verifyDatetime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择核实时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="1=确诊，2=疑似，3=排除，4=待复查" prop="verifyResult">
          <el-input v-model="form.verifyResult" placeholder="请输入1=确诊，2=疑似，3=排除，4=待复查" />
        </el-form-item>
        <el-form-item label="核实依据" prop="verifyBasis">
          <el-input v-model="form.verifyBasis" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="流行病学调查时间" prop="surveyDatetime">
          <el-date-picker clearable
            v-model="form.surveyDatetime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择流行病学调查时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="流行病学调查内容">
          <editor v-model="form.surveyContent" :min-height="192"/>
        </el-form-item>
        <el-form-item label="参与调查人员" prop="surveyStaff">
          <el-input v-model="form.surveyStaff" placeholder="请输入参与调查人员" />
        </el-form-item>
        <el-form-item label="处理措施" prop="handleMeasure">
          <el-input v-model="form.handleMeasure" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="处理完成时间" prop="handleDatetime">
          <el-date-picker clearable
            v-model="form.handleDatetime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择处理完成时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="处理结果" prop="handleResult">
          <el-input v-model="form.handleResult" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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

<script setup name="Investigate">
import { listInvestigate, getInvestigate, delInvestigate, addInvestigate, updateInvestigate } from "@/api/report/investigate"

const { proxy } = getCurrentInstance()

const investigateList = ref([])
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
  },
  rules: {
    caseId: [
      { required: true, message: "关联病例ID不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询上报数据核实诊断与调查处理列表 */
function getList() {
  loading.value = true
  listInvestigate(queryParams.value).then(response => {
    investigateList.value = response.rows
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
    verifyId: null,
    caseId: null,
    verifyStaffId: null,
    verifyDatetime: null,
    verifyResult: null,
    verifyBasis: null,
    surveyDatetime: null,
    surveyContent: null,
    surveyStaff: null,
    handleMeasure: null,
    handleStatus: null,
    handleDatetime: null,
    handleResult: null,
    remark: null,
    createTime: null,
    updateTime: null
  }
  proxy.resetForm("investigateRef")
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
  ids.value = selection.map(item => item.verifyId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加上报数据核实诊断与调查处理"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _verifyId = row.verifyId || ids.value
  getInvestigate(_verifyId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改上报数据核实诊断与调查处理"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["investigateRef"].validate(valid => {
    if (valid) {
      if (form.value.verifyId != null) {
        updateInvestigate(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addInvestigate(form.value).then(response => {
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
  const _verifyIds = row.verifyId || ids.value
  proxy.$modal.confirm('是否确认删除上报数据核实诊断与调查处理编号为"' + _verifyIds + '"的数据项？').then(function() {
    return delInvestigate(_verifyIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('report/investigate/export', {
    ...queryParams.value
  }, `investigate_${new Date().getTime()}.xlsx`)
}

getList()
</script>
