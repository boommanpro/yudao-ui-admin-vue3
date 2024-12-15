<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="80%">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="模板名称" prop="templateName">
        <el-input v-model="formData.templateName" placeholder="请输入模板名称" />
      </el-form-item>
      <el-form-item label="模板描述" prop="templateDescription">
        <el-input v-model="formData.templateDescription" type="textarea" placeholder="请输入模板描述" />
      </el-form-item>
      <el-form-item label="模板类型 " prop="templateType">
        <el-select v-model="formData.templateType" placeholder="请选择模板类型 ">
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.TEMPLATE_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="模板类型值" prop="templateTypeValue">
        <el-select v-model="formData.templateTypeValue" placeholder="请选择模板类型值">
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.TEMPLATE_TYPE_VALUE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="文件类型" prop="fileType">
        <el-select v-model="formData.fileType" placeholder="请选择文件类型">
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.CODE_FILE_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="文件路径" prop="filePathExpression">
        <el-input v-model="formData.filePathExpression" placeholder="请输入文件路径" />
      </el-form-item>
      <el-form-item label="原始路径" prop="originalPath">
        <el-input v-model="formData.originalPath" placeholder="请输入原始路径" />
      </el-form-item>
      <el-form-item label="模板内容" prop="templateContent">
        <monaco-vite :width="1200" :height="500" v-model:="formData.templateContent" language="java"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import { CodeTemplateApi, CodeTemplateVO } from '@/api/ucg/codetemplate'

/** 存储代码模板的基本信息 表单 */
defineOptions({ name: 'CodeTemplateForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  projectId: undefined,
  templateName: undefined,
  templateDescription: undefined,
  templateType: undefined,
  templateTypeValue: undefined,
  fileType: undefined,
  filePathExpression: undefined,
  originalPath: undefined,
  templateContent: undefined
})
const formRules = reactive({
  templateName: [{ required: true, message: '模板名称不能为空', trigger: 'blur' }],
  templateType: [{ required: true, message: '模板类型 不能为空', trigger: 'change' }],
  templateTypeValue: [{ required: true, message: '模板类型值不能为空', trigger: 'change' }],
  fileType: [{ required: true, message: '文件类型不能为空', trigger: 'change' }],
  filePathExpression: [{ required: true, message: '文件路径不能为空', trigger: 'blur' }],
  templateContent: [{ required: true, message: '模板内容不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

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
      formData.value = await CodeTemplateApi.getCodeTemplate(id)
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
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as CodeTemplateVO
    if (formType.value === 'create') {
      await CodeTemplateApi.createCodeTemplate(data)
      message.success(t('common.createSuccess'))
    } else {
      await CodeTemplateApi.updateCodeTemplate(data)
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
    projectId: undefined,
    templateName: undefined,
    templateDescription: undefined,
    templateType: undefined,
    templateTypeValue: undefined,
    fileType: undefined,
    filePathExpression: undefined,
    originalPath: undefined,
    templateContent: undefined
  }
  formRef.value?.resetFields()
}
</script>
