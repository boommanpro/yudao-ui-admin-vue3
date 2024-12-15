import request from '@/config/axios'

// 存储代码模板的基本信息 VO
export interface CodeTemplateVO {
  id: number // 编号
  projectId: number // 项目id
  templateName: string // 模板名称
  templateDescription: string // 模板描述
  templateType: string // 模板类型 
  templateTypeValue: string // 模板类型值
  fileType: string // 文件类型
  filePathExpression: string // 文件路径
  originalPath: string // 原始路径
  templateContent: string // 模板内容
}

// 存储代码模板的基本信息 API
export const CodeTemplateApi = {
  // 查询存储代码模板的基本信息分页
  getCodeTemplatePage: async (params: any) => {
    return await request.get({ url: `/ucg/code-template/page`, params })
  },

  // 查询存储代码模板的基本信息详情
  getCodeTemplate: async (id: number) => {
    return await request.get({ url: `/ucg/code-template/get?id=` + id })
  },

  // 新增存储代码模板的基本信息
  createCodeTemplate: async (data: CodeTemplateVO) => {
    return await request.post({ url: `/ucg/code-template/create`, data })
  },

  // 修改存储代码模板的基本信息
  updateCodeTemplate: async (data: CodeTemplateVO) => {
    return await request.put({ url: `/ucg/code-template/update`, data })
  },

  // 删除存储代码模板的基本信息
  deleteCodeTemplate: async (id: number) => {
    return await request.delete({ url: `/ucg/code-template/delete?id=` + id })
  },

  // 导出存储代码模板的基本信息 Excel
  exportCodeTemplate: async (params) => {
    return await request.download({ url: `/ucg/code-template/export-excel`, params })
  }
}