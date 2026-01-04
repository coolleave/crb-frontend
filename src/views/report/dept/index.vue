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
          v-hasPermi="['report:dept:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['report:dept:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['report:dept:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['report:dept:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="deptList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="机构ID" align="center" prop="deptId" />
      <el-table-column label="机构名称" align="center" prop="deptName" />
      <el-table-column label="机构级别" align="center" prop="deptLevel">
        <template #default="scope">
          <dict-tag :options="case_dept_level" :value="scope.row.deptLevel"/>
        </template>
      </el-table-column>
      <el-table-column label="省份" align="center" prop="province" />
      <el-table-column label="城市" align="center" prop="city" />
      <el-table-column label="区县" align="center" prop="district" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['report:dept:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['report:dept:remove']">删除</el-button>
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

    <!-- 添加或修改卫生机构/部门信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="deptRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="机构名称" prop="deptName">
          <el-input v-model="form.deptName" placeholder="请输入机构名称" />
        </el-form-item>
        <el-form-item label="机构级别" prop="deptLevel">
          <el-select v-model="form.deptLevel" placeholder="请选择机构级别">
            <el-option
              v-for="dict in case_dept_level"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="省份" prop="province">
          <el-input v-model="form.province" placeholder="请输入省份" />
        </el-form-item>
        <el-form-item label="城市" prop="city">
          <el-input v-model="form.city" placeholder="请输入城市" />
        </el-form-item>
        <el-form-item label="区县" prop="district">
          <el-input v-model="form.district" placeholder="请输入区县" />
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

<script setup name="Dept">
import { listDept, getDept, delDept, addDept, updateDept } from "@/api/report/dept"

const { proxy } = getCurrentInstance()
const { case_dept_level } = proxy.useDict('case_dept_level')

const deptList = ref([])
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
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询卫生机构/部门信息列表 */
function getList() {
  loading.value = true
  listDept(queryParams.value).then(response => {
    deptList.value = response.rows
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
    deptId: null,
    deptName: null,
    deptLevel: null,
    province: null,
    city: null,
    district: null
  }
  proxy.resetForm("deptRef")
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
  ids.value = selection.map(item => item.deptId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加卫生机构/部门信息"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _deptId = row.deptId || ids.value
  getDept(_deptId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改卫生机构/部门信息"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["deptRef"].validate(valid => {
    if (valid) {
      if (form.value.deptId != null) {
        updateDept(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addDept(form.value).then(response => {
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
  const _deptIds = row.deptId || ids.value
  proxy.$modal.confirm('是否确认删除卫生机构/部门信息编号为"' + _deptIds + '"的数据项？').then(function() {
    return delDept(_deptIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('report/dept/export', {
    ...queryParams.value
  }, `dept_${new Date().getTime()}.xlsx`)
}

getList()
</script>
