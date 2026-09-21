// 讲师评级体系 - 由旧站 teachers/index.html 抽取生成
import type { TeacherLevel } from './teachers';

export const teacherLevels: TeacherLevel[] = [
  {
    "code": "L1",
    "gradient": "background: linear-gradient(135deg, #0066FF, #5B9AFF);",
    "name": "L1 助理讲师",
    "desc": "通过模块知识笔试与助教实习，承担答疑、批改、助教课等基础教学工作。",
    "meta": [
      "📝 模块笔试",
      "👨‍🏫 助教实习"
    ]
  },
  {
    "code": "L2",
    "gradient": "background: linear-gradient(135deg, #7B2FF7, #B07CFF);",
    "name": "L2 认证讲师",
    "desc": "试讲双评≥80分，项目实操考核通过，可独立承担单模块授课与标准课时。",
    "meta": [
      "🎤 试讲考核",
      "🛠️ 项目实操"
    ]
  },
  {
    "code": "L3",
    "gradient": "background: linear-gradient(135deg, #E60012, #FF4D5A);",
    "name": "L3 资深讲师",
    "desc": "满两年且学员期评≥4.5，主导课纲迭代，享受学科分红与讲师带教职责。",
    "meta": [
      "⭐ 期评≥4.5",
      "📚 课纲迭代"
    ]
  },
  {
    "code": "M",
    "gradient": "background: linear-gradient(135deg, #006D77, #83C5BE);",
    "name": "M 企业导师",
    "desc": "行业在职专家，参与商业项目点评、前沿模块教学与岗位标准输入。",
    "meta": [
      "💼 一线在职",
      "🎯 项目点评"
    ]
  }
];
