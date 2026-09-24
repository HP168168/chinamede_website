// 导航与页脚数据 - 由旧站 partials/header.html、partials/footer.html 抽取生成
export interface NavLink {
  label: string;
  href: string;
}

export interface FooterGroup {
  title: string;
  links: NavLink[];
}

export const nav: NavLink[] = [
  {
    "label": "品牌介绍",
    "href": "/brand/"
  },
  {
    "label": "培训课程",
    "href": "/courses/"
  },
  {
    "label": "产教融合",
    "href": "/industry/"
  },
  {
    "label": "师资团队",
    "href": "/teachers/"
  },
  {
    "label": "学员风采",
    "href": "/students/"
  },
  {
    "label": "知识百科",
    "href": "/knowledge/"
  },
  {
    "label": "美迪问答",
    "href": "/faq/"
  },
  {
    "label": "机构动态",
    "href": "/news/"
  },
  {
    "label": "商业资讯",
    "href": "/business/"
  },
  {
    "label": "联系我们",
    "href": "/contact/"
  }
];

export const footerGroups: FooterGroup[] = [
  {
    "title": "快速导航",
    "links": [
      {
        "label": "品牌介绍",
        "href": "/brand/"
      },
      {
        "label": "培训课程",
        "href": "/courses/"
      },
      {
        "label": "师资团队",
        "href": "/teachers/"
      },
      {
        "label": "学员风采",
        "href": "/students/"
      },
      {
        "label": "知识百科",
        "href": "/knowledge/"
      }
    ]
  },
  {
    "title": "服务体系",
    "links": [
      {
        "label": "产教融合",
        "href": "/industry/"
      },
      {
        "label": "免费试听",
        "href": "/enroll/"
      },
      {
        "label": "美迪问答",
        "href": "/faq/"
      },
      {
        "label": "机构动态",
        "href": "/news/"
      },
      {
        "label": "商业资讯",
        "href": "/business/"
      }
    ]
  }
];

export const footerIntro: string = "美迪时代教育隶属于广州美迪教育科技有限公司，专注成人职业技能就业培训，让职业就业更简单。";

export const footerContacts: string[] = [
  "📞 400-800-4459",
  "🌐 www.chinamede.com",
  "📧 广州美迪教育科技有限公司",
  "🏢 6城13个直营校区就近服务"
];

export const footerBottom: string[] = [
  "© 2026 美迪时代教育 版权所有 | 广州美迪教育科技有限公司 | 粤ICP备15034320号-7",
  "让职业就业更简单"
];
