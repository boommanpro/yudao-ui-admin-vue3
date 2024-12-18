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
      <el-form-item label="项目名称" prop="projectName">
        <el-input
          v-model="queryParams.projectName"
          placeholder="请输入项目名称，不能为空"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="启动状态" prop="enableStatus">
        <el-select
          v-model="queryParams.enableStatus"
          placeholder="请选择启动状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getBoolDictOptions(DICT_TYPE.ENABLE_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
          v-hasPermi="['ucg:project:create']"
        >
          <Icon icon="ep:plus" class="mr-5px"/>
          新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleImport"
          :loading="exportLoading"
          v-hasPermi="['ucg:project:export']"
        >
          <Icon icon="ep:download" class="mr-5px"/>
          导入
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <!-- 子表的列表 -->
      <el-table-column type="expand">
        <template #default="scope">
          <el-tabs model-value="projectVariable">
            <el-tab-pane label="存储与项目相关的变量信息" name="projectVariable">
              <ProjectVariableList :project-id="scope.row.id"/>
            </el-tab-pane>
          </el-tabs>
        </template>
      </el-table-column>
      <el-table-column label="编号" align="center" prop="id"/>
      <el-table-column label="项目名称" align="center" prop="projectName"/>
      <el-table-column label="项目描述" align="center" prop="projectDescription"/>
      <el-table-column label="启动状态" align="center" prop="enableStatus">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ENABLE_STATUS" :value="scope.row.enableStatus"/>
        </template>
      </el-table-column>
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
            v-hasPermi="['ucg:project:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="primary"
            @click="openForm('copy', scope.row.id)"
            v-hasPermi="['ucg:project:create']"
          >
            复制
          </el-button>
          <el-button
            link
            type="primary"
            @click="toEditCodeTemplate( scope.row.id)"
            v-hasPermi="['ucg:code-template:create']"
          >
            查看代码模板
          </el-button>
          <el-button
            link
            type="primary"
            @click="toExport( scope.row.id)"
            v-hasPermi="['ucg:code-template:export']"
          >
            导出
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['ucg:project:delete']"
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
  <ProjectForm ref="formRef" @success="getList"/>
</template>

<script setup lang="ts">
import {DICT_TYPE, getBoolDictOptions} from '@/utils/dict'
import {dateFormatter} from '@/utils/formatTime'
import download from '@/utils/download'
import {ProjectApi, ProjectVO} from '@/api/ucg/project'
import ProjectForm from './ProjectForm.vue'
import ProjectVariableList from './components/ProjectVariableList.vue'
import {ElMessage} from "element-plus";
import {CodeTemplateApi} from "@/api/ucg/codetemplate";

/** 存储项目的基本信息 列表 */
defineOptions({name: 'Project'})

const message = useMessage() // 消息弹窗
const {t} = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<ProjectVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  projectName: undefined,
  projectDescription: undefined,
  enableStatus: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ProjectApi.getProjectPage(queryParams)
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
    await ProjectApi.deleteProject(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {
  }
}

const exportLoading = ref(false); // 导出的加载中

/** 导入按钮操作 */
/** 导入按钮操作 */
const handleImport = async () => {
  try {
    // 创建一个文件输入元素
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json'; // 根据实际情况调整接受的文件类型

    // 监听文件选择事件
    input.onchange = async (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (!files || files.length === 0) {
        ElMessage.warning('请选择一个文件');
        return;
      }

      const file = files[0] ;
      const formData = new FormData();
      formData.append('file', file);

      exportLoading.value = true;
      try {
        // 假设 ProjectApi 提供了一个 importProject 方法
        await ProjectApi.importProject(formData);
        ElMessage.success('导入成功');
        // 刷新列表
        await getList();
      } catch (error) {
        ElMessage.error('导入失败: ' + error.message);
      } finally {
        exportLoading.value = false;
      }
    };

    // 触发文件选择对话框
    input.click();
  } catch (error) {
    ElMessage.error('导入失败: ' + error.message);
  }
};

const toExport = async (id:number) => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await ProjectApi.export(id)
    download.json(data, id+'.json')
  } catch {
  } finally {
    exportLoading.value = false
  }
}
const router = useRouter();
/** 查看代码模板 */
const toEditCodeTemplate = (id: number) => {
  router.push({
    path: '/infra/codetemplate',
    query: {projectId: id}
  });
}
/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
