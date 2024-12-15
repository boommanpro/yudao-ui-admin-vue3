<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="项目名称" prop="projectName">
        <el-input v-model="formData.projectName" placeholder="请输入项目名称，不能为空" />
      </el-form-item>
      <el-form-item label="项目描述" prop="projectDescription">
        <el-input v-model="formData.projectDescription" type="textarea" placeholder="请输入项目描述，文本类型，可以为空" />
      </el-form-item>
      <el-form-item label="启动状态" prop="enableStatus">
        <el-radio-group v-model="formData.enableStatus">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.ENABLE_STATUS)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <!-- 子表的表单 -->
    <el-tabs v-model="subTabsName">
      <el-tab-pane label="项目变量" name="projectVariable">
        <ProjectVariableForm ref="projectVariableFormRef" :project-id="formData.id" />
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { getBoolDictOptions, DICT_TYPE } from '@/utils/dict'
import { ProjectApi, ProjectVO } from '@/api/ucg/project'
import ProjectVariableForm from './components/ProjectVariableForm.vue'

/** 存储项目的基本信息 表单 */
defineOptions({ name: 'ProjectForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  projectName: undefined,
  projectDescription: undefined,
  enableStatus: undefined
})
const formRules = reactive({
  projectName: [{ required: true, message: '项目名称，不能为空不能为空', trigger: 'blur' }],
  enableStatus: [{ required: true, message: '启动状态不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 子表的表单 */
const subTabsName = ref('projectVariable')
const projectVariableFormRef = ref()

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await ProjectApi.getProject(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 校验子表单
  try {
    await projectVariableFormRef.value.validate()
  } catch (e) {
    subTabsName.value = 'projectVariable'
    return
  }
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as ProjectVO
    // 拼接子表的数据
    data.projectVariables = projectVariableFormRef.value.getData()
    if (formType.value === 'create') {
      await ProjectApi.createProject(data)
      message.success(t('common.createSuccess'))
    } else {
      await ProjectApi.updateProject(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    projectName: undefined,
    projectDescription: undefined,
    enableStatus: undefined
  }
  formRef.value?.resetFields()
}
</script>
