import { zh } from './route/index_zh'

export default {
    systemTitle: '🚀 MoAI',
    banner: {
        title: '👋 嘿，欢迎来到MoAI！',
        more: '了解详情'
    },

    badgeTitle: '轻量级、开箱即用 🎉',
    featureSupport: `🔥 现在支持 {{feature}}！`,
    lastUpdated: '最后更新于:',

    getStarted: '开始使用',
    userHomePage: '人个主页',

    error: '出错了',

    course: '课程',
    class: '班级',
    unit: '单元',
    guidebook: '概览',
    student: '学生',
    teacher: '教师',
    name: '名称',
    invitationCode: '邀请码',
    ops: '操作',

    id: '标识',
    slug: 'URL标识',
    signout: '退出登录',
    signin: '登录',
    enter: '进入',
    fullname: '姓名',
    email: '邮箱',
    delete: '删除',
    edit: '编辑',
    join: '加入',
    leave: '退出',
    cancel: '取消',
    confirm: '确认',
    save: '保存',
    copy: '复制',
    howToPaste: '使用Ctrl+V粘贴并上传图片',

    loading: '加载中...',
    uploading: '上传中...',
    submitting: '提交中...',
    submit: '提交',
    occupied: '已被占用',

    submitted: '已提交',
    notSubmitted: '未提交',
    reviewed: '已批阅',
    toBeReviewed: '待批阅',
    passed: '通过',
    failed: '未通过',
    submitRate: '提交率',
    passRate: '通过率',
    reviewRate: '批阅率',

    modifyProfile: '修改账户信息',
    deleteConfirm: '确定要删除吗？此操作是永久性的，无法撤销。',
    leaveConfirm: '确定要退出吗？此操作将会从班级中移除您，您将无法再访问该班级。',

    minChar: '至少需要{{min}}个字符',
    maxChar: '最多允许{{max}}个字符',
    reservedValidation: '该名称已被保留，请更换名称',
    slugValidation: '只允许使用小写字母、数字、下划线和短横线',
    uuidValidation: '请输入有效的 UUID',

    quiz_img_paste: '完成任务并截图上传',
    ...zh,

    featureList: [
        {
            title: '先进的技术栈',
            description: '高效的 React (v19) 框架，使用 Next.js、Nextra(v4) 和 Shadcn UI 打造现代化应用'
        },
        {
            title: '国际化支持 (i18n)',
            description: '内置多语言支持，轻松实现应用的国际化，扩大用户群体'
        },
        {
            title: 'TypeScript 类型安全',
            description: '全面集成 TypeScript，提供静态类型检查，减少运行时错误，提高代码可靠性和可维护性'
        },
        {
            title: 'Iconify 图标集',
            description: '纯 CSS 图标, 集成 Iconify 图标集，提供丰富的图标选择，增强 UI 视觉表现'
        },
        {
            title: 'Tailwind CSS (v4)',
            description: '使用原子化 CSS 框架 Tailwind CSS，快速构建高效设计、响应式界面 UI'
        },
        {
            title: '代码规范',
            description: '遵循最佳实践的代码规范，结合 ESLint 进行代码质量检查与一致性维护'
        },
        {
            title: '暗黑模式',
            description: '支持暗黑模式，提供更好的夜间使用体验'
        },
        {
            title: '丰富组件 & 支持自由扩展',
            description: '提供丰富的预置组件，并支持灵活的自定义扩展'
        },
        {
            title: '轻量化设计',
            description: '采用轻量化设计，精简项目设置，专注于内容编写'
        }
    ],
    featuresDesc: '轻松构建现代应用，快速启动您的开发流程',
    faqs: [
        {
            question: '这个启动模板支持哪些框架和技术栈？',
            answer: '本启动模板支持 Next.js 和 Nextra，并集成了 Tailwind CSS、Framer Motion、Shadcn UI 组件等现代开发技术栈。'
        },
        {
            question: '我如何开始使用这个模板进行开发？',
            answer: '只需克隆我们的 GitHub 仓库并按照文档中的步骤运行安装命令，即可开始使用本模板进行开发。'
        },
        {
            question: '这个模板适合哪些类型的项目？',
            answer: '该模板适合用于创建快速、高效的现代 Web 应用程序，包括企业站点、个人博客、电子商务平台等。'
        },
        {
            question: '如何添加或修改项目中的组件？',
            answer: '可以使用提供的组件库，按照文档中的说明进行自定义和扩展，以适应您的具体需求。'
        },
        {
            question: '模板是否提供多语言支持？',
            answer: '是的，模板内置国际化 (i18n) 功能，可以轻松添加和管理多语言内容，扩大应用的国际用户群。'
        },
        {
            question: '如何获得技术支持或帮助？',
            answer: '如果在使用过程中遇到问题，请通过 GitHub @pdsuwwz 与我们联系。'
        }
    ]
}
