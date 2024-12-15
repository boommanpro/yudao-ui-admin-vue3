<template>
  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="编号" align="center" prop="id" />
       <el-table-column label="变量名称" align="center" prop="variableName" />
      <el-table-column label="表达式类型" align="center" prop="expressionType" />
      <el-table-column label="变量表达式" align="center" prop="variableExpression" />
      <el-table-column label="执行顺序" align="center" prop="executeOrder" />
      <el-table-column
        label="创建时间，默认为当前时间戳"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
    </el-table>
  </ContentWrap>
</template>
<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { ProjectApi } from '@/api/ucg/project'

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const props = defineProps<{
  projectId?: number // 工厂ID，与`ucg_project`表的`id`相关联，标识所属项目（主表的关联字段）
}>()
const loading = ref(false) // 列表的加载中
const list = ref([]) // 列表的数据

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    list.value = await ProjectApi.getProjectVariableListByProjectId(props.projectId)
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
