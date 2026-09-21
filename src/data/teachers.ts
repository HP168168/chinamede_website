// 师资数据 - 由旧站 teachers/index.html 抽取生成
export interface Teacher {
  avatar: string;
  name: string;
  title: string;
  desc: string;
}

export interface TeacherLevel {
  code: string;
  gradient: string;
  name: string;
  desc: string;
  meta: string[];
}

export const teachers: Teacher[] = [
  {
    "avatar": "👨‍💼",
    "name": "张明远",
    "title": "AI新媒体运营学科带头人",
    "desc": "10年新媒体运营与获客经验，曾操盘多个百万级账号，擅长抖音、小红书、视频号全平台运营与企业GEO获客实战。"
  },
  {
    "avatar": "👩‍🎨",
    "name": "李思琪",
    "title": "AI视觉设计金牌讲师",
    "desc": "8年电商视觉设计经验，服务过多个知名电商品牌，精通C4D、PS精修、AIGC商业出图与品牌IP延展设计。"
  },
  {
    "avatar": "👨‍🎬",
    "name": "王浩然",
    "title": "商业短视频创作负责人",
    "desc": "前MCN内容总监，主导过数百条商业短视频项目，擅长拍摄剪辑、特效合成、信息流广告与商单履约全流程。"
  },
  {
    "avatar": "👩‍💻",
    "name": "陈雨桐",
    "title": "AIGC全能班主讲",
    "desc": "深耕AI工具应用与智能体开发，熟悉Coze、Dify等平台，擅长将AI能力落地到运营、设计、视频等真实工作场景。"
  },
  {
    "avatar": "👨‍🎭",
    "name": "刘子轩",
    "title": "AI短剧漫剧创作导师",
    "desc": "参与多部短剧/漫剧项目制作，熟悉AI漫剧、AI真人剧全流程，掌握短剧备案合规、投流分账与平台征稿通道。"
  },
  {
    "avatar": "👩‍🌐",
    "name": "赵雅琳",
    "title": "跨境电商实战讲师",
    "desc": "10年跨境电商运营经验，操盘过亚马逊、TikTok、独立站等多平台项目，擅长海外社媒运营与Facebook高阶投流。"
  },
  {
    "avatar": "👨‍💼",
    "name": "周建国",
    "title": "就业指导总监",
    "desc": "负责学员就业服务体系建设，对接全国合作企业资源，擅长简历诊断、模拟面试、岗位匹配与职场发展规划。"
  },
  {
    "avatar": "👩‍🏫",
    "name": "吴文静",
    "title": "教学督导负责人",
    "desc": "负责教学质量监控与讲师评级，通过随堂听课、学员期评、模块通过率等数据，持续优化教学标准与服务体验。"
  }
];
