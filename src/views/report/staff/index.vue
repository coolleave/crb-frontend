<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="姓名" prop="medName">
        <el-input
          v-model="queryParams.medName"
          placeholder="请输入医务人员姓名"
          clearable
          @keyup.enter="handleQuery"
        />
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
          v-hasPermi="['report:staff:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['report:staff:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['report:staff:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['report:staff:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="staffList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="医务人员ID" align="center" prop="medId" />
      <el-table-column label="医务人员姓名" align="center" prop="medName" />
      <el-table-column label="所属机构名称" align="center" prop="medDeptName" />
      <el-table-column label="医师资格证号" align="center" prop="medLicense" />
      <el-table-column label="联系电话" align="center" prop="medPhone" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['report:staff:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['report:staff:remove']">删除</el-button>
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

    <!-- 添加或修改人员信息
对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="staffRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="姓名" prop="medName">
          <el-input v-model="form.medName" placeholder="请输入医务人员姓名" />
        </el-form-item>
        <el-form-item label="所属机构ID" prop="medDeptId">
          <el-input v-model="form.medDeptId" placeholder="请输入所属机构ID" />
        </el-form-item>
        <el-form-item label="医师资格证号" prop="medLicense">
          <el-input v-model="form.medLicense" placeholder="请输入医师资格证号" />
        </el-form-item>
        <el-form-item label="联系电话" prop="medPhone">
          <el-input v-model="form.medPhone" placeholder="请输入联系电话" />
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

<script setup name="Staff">
import { listStaff, getStaff, delStaff, addStaff, updateStaff } from "@/api/report/staff"

const { proxy } = getCurrentInstance()

const staffList = ref([])
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
    medName: null,
  },
  rules: {
    medName: [
      { required: true, message: "医务人员姓名不能为空", trigger: "blur" }
    ],
    medDeptId: [
      { required: true, message: "所属机构ID不能为空", trigger: "blur" }
    ],
    medLicense: [
      { required: true, message: "医师资格证号不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询人员信息
列表 */
function getList() {
  loading.value = true
  listStaff(queryParams.value).then(response => {
    staffList.value = response.rows
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
    medId: null,
    medName: null,
    medDeptId: null,
    medDeptName: null,
    medLicense: null,
    medPhone: null
  }
  proxy.resetForm("staffRef")
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
  ids.value = selection.map(item => item.medId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加人员信息"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _medId = row.medId || ids.value
  getStaff(_medId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改人员信息"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["staffRef"].validate(valid => {
    if (valid) {
      if (form.value.medId != null) {
        updateStaff(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addStaff(form.value).then(response => {
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
  const _medIds = row.medId || ids.value
  proxy.$modal.confirm('是否确认删除人员信息编号为"' + _medIds + '"的数据项？').then(function() {
    return delStaff(_medIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('report/staff/export', {
    ...queryParams.value
  }, `staff_${new Date().getTime()}.xlsx`)
}

getList()
</script>
