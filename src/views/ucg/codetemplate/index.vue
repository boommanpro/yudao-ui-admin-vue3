<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="项目id" prop="projectId">
        <el-input
          v-model="queryParams.projectId"
          placeholder="请输入项目id"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="模板名称" prop="templateName">
        <el-input
          v-model="queryParams.templateName"
          placeholder="请输入模板名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="模板类型 " prop="templateType">
        <el-select
          v-model="queryParams.templateType"
          placeholder="请选择模板类型 "
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.TEMPLATE_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="模板类型值" prop="templateTypeValue" label-width="100px">
        <el-select
          v-model="queryParams.templateTypeValue"
          placeholder="请选择模板类型值"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.TEMPLATE_TYPE_VALUE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="文件类型" prop="fileType">
        <el-select
          v-model="queryParams.fileType"
          placeholder="请选择文件类型"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.CODE_FILE_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="文件路径" prop="filePathExpression">
        <el-input
          v-model="queryParams.filePathExpression"
          placeholder="请输入文件路径"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="原始路径" prop="originalPath">
        <el-input
          v-model="queryParams.originalPath"
          placeholder="请输入原始路径"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-5px"/>
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-5px"/>
          重置
        </el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['ucg:code-template:create']"
        >
          <Icon icon="ep:plus" class="mr-5px"/>
          新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['ucg:code-template:export']"
        >
          <Icon icon="ep:download" class="mr-5px"/>
          导出
        </el-button>
        <el-button
          type="danger"
          plain
          @click="handleBatchDelete"
          :disabled="multipleSelection.length === 0"
          v-hasPermi="['ucg:code-template:delete']"
        >
          <Icon icon="ep:delete" class="mr-5px"/>
          批量删除
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true"
              @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="30" align="center"/>
      <el-table-column label="编号" align="center" prop="id" width="80px"/>
      <el-table-column label="项目id" align="center" prop="projectId" width="80px"/>
      <el-table-column label="模板名称" align="center" prop="templateName"/>
      <el-table-column label="模板描述" align="center" prop="templateDescription"/>
      <el-table-column label="模板类型 " align="center" prop="templateType" width="80px">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.TEMPLATE_TYPE" :value="scope.row.templateType"/>
        </template>
      </el-table-column>
      <el-table-column label="模板类型值" align="center" prop="templateTypeValue" width="100px">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.TEMPLATE_TYPE_VALUE" :value="scope.row.templateTypeValue"/>
        </template>
      </el-table-column>
      <el-table-column label="文件类型" align="center" prop="fileType" width="80px">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.CODE_FILE_TYPE" :value="scope.row.fileType"/>
        </template>
      </el-table-column>
      <el-table-column label="文件路径" align="center" prop="filePathExpression"/>
      <el-table-column label="原始路径" align="center" prop="originalPath"/>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['ucg:code-template:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['ucg:code-template:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <CodeTemplateForm ref="formRef" @success="getList"/>
</template>

<script setup lang="ts">
import {DICT_TYPE, getStrDictOptions} from '@/utils/dict'
import {dateFormatter} from '@/utils/formatTime'
import download from '@/utils/download'
import {CodeTemplateApi, CodeTemplateVO} from '@/api/ucg/codetemplate'
import CodeTemplateForm from './CodeTemplateForm.vue'

/** 存储代码模板的基本信息 列表 */
defineOptions({name: 'CodeTemplate'})

const message = useMessage() // 消息弹窗
const {t} = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<CodeTemplateVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 100,
  projectId: undefined,
  templateName: undefined,
  templateDescription: undefined,
  templateType: undefined,
  templateTypeValue: undefined,
  fileType: undefined,
  filePathExpression: undefined,
  originalPath: undefined,
  templateContent: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await CodeTemplateApi.getCodeTemplatePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}


/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  router.push({query: {}})
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await CodeTemplateApi.deleteCodeTemplate(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {
  }
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await CodeTemplateApi.exportCodeTemplate(queryParams)
    download.excel(data, '存储代码模板的基本信息.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}
const route = useRoute()
const router = useRouter()

// 在 defineOptions 和其他响应式变量定义之后
const multipleSelection = ref<CodeTemplateVO[]>([])

/**
 * 处理表格多选变化
 * @param selections 当前选中的数据行集合
 */
const handleSelectionChange = (selections: CodeTemplateVO[]) => {
  multipleSelection.value = selections
}


/**
 * 批量删除按钮操作
 */
const handleBatchDelete = async () => {
  if (multipleSelection.value.length === 0) {
    message.warning('请先选择要删除的记录')
    return
  }

  try {
    // 删除的二次确认
    await message.delConfirm()

    // 获取所有选中的 ID
    for (const item of multipleSelection.value) {
      await CodeTemplateApi.deleteCodeTemplate(item.id!)
    }
    message.success(t('common.delSuccess'))

    // 刷新列表
    await getList()
  } catch (error) {
    console.error(error)
    message.error('批量删除失败')
  }
}

/** 初始化 **/
onMounted(() => {
  const query = route.query
  queryParams.projectId = query.projectId ? Number(query.projectId) : undefined
  getList()
})
</script>
