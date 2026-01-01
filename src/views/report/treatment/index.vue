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
          v-hasPermi="['report:treatment:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['report:treatment:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['report:treatment:remove']"
          v-if="false"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['report:treatment:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="treatmentList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="诊治编号" align="center" prop="diagId" />
      <el-table-column label="病例编号" align="center" prop="caseId" />
      <el-table-column label="诊治医生姓名" align="center" prop="diagDoctor" />
      <el-table-column label="诊断时间" align="center" prop="diagDatetime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.diagDatetime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="诊断结果" align="center" prop="diagResult" />
      <el-table-column label="1=已隔离，0=未隔离" align="center" prop="isIsolated" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['report:treatment:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['report:treatment:remove']" v-if="false">删除</el-button>
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

    <!-- 添加或修改病例诊治处理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="treatmentRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="病例编号" prop="caseId">
          <el-input v-model="form.caseId" placeholder="请输入病例编号" />
        </el-form-item>
        <el-form-item label="诊治医生姓名" prop="diagDoctor">
          <el-input v-model="form.diagDoctor" placeholder="请输入诊治医生姓名" />
        </el-form-item>
        <el-form-item label="诊断时间" prop="diagDatetime">
          <el-date-picker clearable
            v-model="form.diagDatetime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择诊断时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="诊断结果" prop="diagResult">
          <el-input v-model="form.diagResult" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="治疗方案" prop="treatmentPlan">
          <el-input v-model="form.treatmentPlan" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="隔离地点" prop="isolateAddress">
          <el-input v-model="form.isolateAddress" placeholder="请输入隔离地点" />
        </el-form-item>
        <el-form-item label="隔离开始日期" prop="isolateStart">
          <el-date-picker clearable
            v-model="form.isolateStart"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择隔离开始日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="隔离结束日期" prop="isolateEnd">
          <el-date-picker clearable
            v-model="form.isolateEnd"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择隔离结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="用药情况" prop="medication">
          <el-input v-model="form.medication" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="检查项目" prop="checkItems">
          <el-input v-model="form.checkItems" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="检查结果" prop="checkResult">
          <el-input v-model="form.checkResult" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="治愈/出院时间" prop="cureDatetime">
          <el-date-picker clearable
            v-model="form.cureDatetime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择治愈/出院时间">
          </el-date-picker>
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

<script setup name="Treatment">
import { listTreatment, getTreatment, delTreatment, addTreatment, updateTreatment } from "@/api/report/treatment"

const { proxy } = getCurrentInstance()

const treatmentList = ref([])
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
      { required: true, message: "病例编号不能为空", trigger: "blur" }
    ],
    diagDoctor: [
      { required: true, message: "诊治医生姓名不能为空", trigger: "blur" }
    ],
    diagDatetime: [
      { required: true, message: "诊断时间不能为空", trigger: "blur" }
    ],
    diagResult: [
      { required: true, message: "诊断结果不能为空", trigger: "blur" }
    ],
    treatmentPlan: [
      { required: true, message: "治疗方案不能为空", trigger: "blur" }
    ],
    isIsolated: [
      { required: true, message: "1=已隔离，0=未隔离不能为空", trigger: "change" }
    ],
    cureStatus: [
      { required: true, message: "1=治疗中，2=已治愈，3=转院，4=死亡不能为空", trigger: "change" }
    ],
    createTime: [
      { required: true, message: "记录创建时间不能为空", trigger: "blur" }
    ],
    updateTime: [
      { required: true, message: "记录更新时间不能为空", trigger: "blur" }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询病例诊治处理列表 */
function getList() {
  loading.value = true
  listTreatment(queryParams.value).then(response => {
    treatmentList.value = response.rows
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
    diagId: null,
    caseId: null,
    diagDoctor: null,
    diagDatetime: null,
    diagResult: null,
    treatmentPlan: null,
    isIsolated: null,
    isolateAddress: null,
    isolateStart: null,
    isolateEnd: null,
    medication: null,
    checkItems: null,
    checkResult: null,
    cureStatus: null,
    cureDatetime: null,
    createTime: null,
    updateTime: null
  }
  proxy.resetForm("treatmentRef")
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
  ids.value = selection.map(item => item.diagId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加病例诊治处理"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _diagId = row.diagId || ids.value
  getTreatment(_diagId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改病例诊治处理"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["treatmentRef"].validate(valid => {
    if (valid) {
      if (form.value.diagId != null) {
        updateTreatment(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addTreatment(form.value).then(response => {
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
  const _diagIds = row.diagId || ids.value
  proxy.$modal.confirm('是否确认删除病例诊治处理编号为"' + _diagIds + '"的数据项？').then(function() {
    return delTreatment(_diagIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('report/treatment/export', {
    ...queryParams.value
  }, `treatment_${new Date().getTime()}.xlsx`)
}

getList()
</script>
