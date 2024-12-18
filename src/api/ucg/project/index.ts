import request from '@/config/axios'

// 存储项目的基本信息 VO
export interface ProjectVO {
  id: number // 编号，自增，唯一标识一个项目
  projectName: string // 项目名称，不能为空
  projectDescription: string // 项目描述，文本类型，可以为空
  enableStatus: boolean // 启动状态
}

// 存储项目的基本信息 API
export const ProjectApi = {
  // 查询存储项目的基本信息分页
  getProjectPage: async (params: any) => {
    return await request.get({ url: `/ucg/project/page`, params })
  },

  // 查询存储项目的基本信息详情
  getProject: async (id: number) => {
    return await request.get({ url: `/ucg/project/get?id=` + id })
  },

  // 新增存储项目的基本信息
  createProject: async (data: ProjectVO) => {
    return await request.post({ url: `/ucg/project/create`, data })
  },

  // 修改存储项目的基本信息
  updateProject: async (data: ProjectVO) => {
    return await request.put({ url: `/ucg/project/update`, data })
  },
  // 复制存储项目的基本信息
  copyProject: async (data: ProjectVO) => {
    return await request.post({ url: `/ucg/project/copy`, data })
  },

  // 删除存储项目的基本信息
  deleteProject: async (id: number) => {
    return await request.delete({ url: `/ucg/project/delete?id=` + id })
  },

  // 导出存储项目的基本信息 Excel
  exportProject: async (params) => {
    return await request.download({ url: `/ucg/project/export-excel`, params })
  },

// ==================== 子表（存储与项目相关的变量信息） ====================

  // 获得存储与项目相关的变量信息列表
  getProjectVariableListByProjectId: async (projectId) => {
    return await request.get({ url: `/ucg/project/project-variable/list-by-project-id?projectId=` + projectId })
  },

  importProject: async ( formData: FormData) => {
    return await request.upload({url: `/ucg/project/importProject`,  data: formData})
  },

  // 导出存储代码模板的基本信息 Excel
  export: async (id: number) => {
    return await request.download({ url: `/ucg/project/exportProject?id=`+id })
  }
}
