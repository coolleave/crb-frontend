<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="病例编号" prop="caseId">
        <el-input
          v-model="queryParams.caseId"
          placeholder="请输入病例编号"
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
          v-hasPermi="['report:contact:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['report:contact:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['report:contact:remove']"
          v-if="false"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['report:contact:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="contactList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="trackId" />
      <el-table-column label="病例编号" align="center" prop="caseId" />
      <el-table-column label="轨迹发生时间" align="center" prop="trackDatetime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.trackDatetime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="轨迹地点" align="center" prop="trackAddress" />
      <el-table-column label="轨迹类型" align="center" prop="trackType" />
      <el-table-column label="轨迹描述" align="center" prop="trackDesc" />
      <el-table-column label="接触人姓名" align="center" prop="contactName" />
      <el-table-column label="接触关系" align="center" prop="contactRelation" />
      <el-table-column label="接触时间" align="center" prop="contactDatetime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.contactDatetime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="接触地点" align="center" prop="contactAddress" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['report:contact:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['report:contact:remove']" v-if="false">删除</el-button>
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

    <!-- 添加或修改病例轨迹与接触人群对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="contactRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="病例编号" prop="caseId">
          <el-input v-model="form.caseId" placeholder="请输入病例编号" />
        </el-form-item>
        <el-form-item label="轨迹发生时间" prop="trackDatetime">
          <el-date-picker clearable
            v-model="form.trackDatetime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择轨迹发生时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="轨迹地点" prop="trackAddress">
          <el-input v-model="form.trackAddress" placeholder="请输入轨迹地点" />
        </el-form-item>
        <el-form-item label="轨迹描述" prop="trackDesc">
          <el-input v-model="form.trackDesc" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="接触人姓名" prop="contactName">
          <el-input v-model="form.contactName" placeholder="请输入接触人姓名" />
        </el-form-item>
        <el-form-item label="接触关系" prop="contactRelation">
          <el-input v-model="form.contactRelation" placeholder="请输入接触关系" />
        </el-form-item>
        <el-form-item label="接触人身份证号" prop="contactIdcard">
          <el-input v-model="form.contactIdcard" placeholder="请输入接触人身份证号" />
        </el-form-item>
        <el-form-item label="接触人手机号" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入接触人手机号" />
        </el-form-item>
        <el-form-item label="接触时间" prop="contactDatetime">
          <el-date-picker clearable
            v-model="form.contactDatetime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择接触时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="接触地点" prop="contactAddress">
          <el-input v-model="form.contactAddress" placeholder="请输入接触地点" />
        </el-form-item>
        <el-form-item label="1=高风险，2=中风险，3=低风险" prop="contactRisk">
          <el-input v-model="form.contactRisk" placeholder="请输入1=高风险，2=中风险，3=低风险" />
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

<script setup name="Contact">
import { listContact, getContact, delContact, addContact, updateContact } from "@/api/report/contact"

const { proxy } = getCurrentInstance()

const contactList = ref([])
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
    caseId: null,
  },
  rules: {
    caseId: [
      { required: true, message: "病例编号不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询病例轨迹与接触人群列表 */
function getList() {
  loading.value = true
  listContact(queryParams.value).then(response => {
    contactList.value = response.rows
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
    trackId: null,
    caseId: null,
    trackDatetime: null,
    trackAddress: null,
    trackType: null,
    trackDesc: null,
    contactName: null,
    contactRelation: null,
    contactIdcard: null,
    contactPhone: null,
    contactDatetime: null,
    contactAddress: null,
    contactRisk: null,
    createTime: null
  }
  proxy.resetForm("contactRef")
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
  ids.value = selection.map(item => item.trackId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加病例轨迹与接触人群"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _trackId = row.trackId || ids.value
  getContact(_trackId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改病例轨迹与接触人群"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["contactRef"].validate(valid => {
    if (valid) {
      if (form.value.trackId != null) {
        updateContact(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addContact(form.value).then(response => {
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
  const _trackIds = row.trackId || ids.value
  proxy.$modal.confirm('是否确认删除病例轨迹与接触人群编号为"' + _trackIds + '"的数据项？').then(function() {
    return delContact(_trackIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('report/contact/export', {
    ...queryParams.value
  }, `contact_${new Date().getTime()}.xlsx`)
}

getList()
</script>
