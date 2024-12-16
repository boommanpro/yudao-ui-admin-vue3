<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    v-loading="formLoading"
    label-width="0px"
    :inline-message="true"
  >
    <el-table :data="formData" class="-mt-10px">
      <el-table-column label="序号" type="index" width="100" />
       <el-table-column label="变量名称" min-width="300">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.variableName`" :rules="formRules.variableName" class="mb-0px!">
            <el-input v-model="row.variableName" placeholder="请输入变量名称，不能为空" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="表达式类型" min-width="200">
        <template #default="{ row, $index }">

          <el-form-item :prop="`${$index}.expressionType`" :rules="formRules.expressionType" class="mb-0px!">
            <el-select v-model="row.expressionType" placeholder="请选择表达式类型">
              <el-option
                v-for="dict in getStrDictOptions(DICT_TYPE.EXPRESSION_TYPE)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="变量表达式" min-width="500">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.variableExpression`" :rules="formRules.variableExpression" class="mb-0px!">
            <el-input v-model="row.variableExpression" placeholder="请输入变量表达式，标识变量的具体表达式，不能为空" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="执行顺序" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.executeOrder`" :rules="formRules.executeOrder" class="mb-0px!">
            <el-input v-model="row.executeOrder" placeholder="请输入执行顺序，默认为1" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="操作" width="60">
        <template #default="{ $index }">
          <el-button @click="handleDelete($index)" link>—</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-form>
  <el-row justify="center" class="mt-3">
    <el-button @click="handleAdd" round>+ 添加存储与项目相关的变量信息</el-button>
  </el-row>
</template>
<script setup lang="ts">
import { ProjectApi } from '@/api/ucg/project'
import {DICT_TYPE, getStrDictOptions} from "@/utils/dict";

const props = defineProps<{
  projectId: undefined // 工厂ID，与`ucg_project`表的`id`相关联，标识所属项目（主表的关联字段）
}>()
const formLoading = ref(false) // 表单的加载中
const formData = ref([])
const formRules = reactive({
  projectId: [{ required: true, message: '工厂ID，与`ucg_project`表的`id`相关联，标识所属项目不能为空', trigger: 'blur' }],
  variableName: [{ required: true, message: '变量名称，不能为空不能为空', trigger: 'blur' }],
  expressionType: [{ required: true, message: '表达式类型，标识变量的表达式类型，不能为空不能为空', trigger: 'change' }],
  variableExpression: [{ required: true, message: '变量表达式，标识变量的具体表达式，不能为空不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 监听主表的关联字段的变化，加载对应的子表数据 */
watch(
  () => props.projectId,
  async (val) => {
    // 1. 重置表单
    formData.value = []
    // 2. val 非空，则加载数据
    if (!val) {
      return;
    }
    try {
      formLoading.value = true
      formData.value = await ProjectApi.getProjectVariableListByProjectId(val)
    } finally {
      formLoading.value = false
    }
  },
  { immediate: true }
)

/** 新增按钮操作 */
const handleAdd = () => {
  const row = {
    id: undefined,
    projectId: undefined,
    variableName: undefined,
    expressionType: undefined,
    variableExpression: undefined,
    executeOrder: undefined
  }
  row.projectId = props.projectId
  formData.value.push(row)
}

/** 删除按钮操作 */
const handleDelete = (index) => {
  formData.value.splice(index, 1)
}

/** 表单校验 */
const validate = () => {
  return formRef.value.validate()
}

/** 表单值 */
const getData = () => {
  return formData.value
}

defineExpose({ validate, getData })
</script>
