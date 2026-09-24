import type { Schema, Struct } from '@strapi/strapi';

export interface CourseModule extends Struct.ComponentSchema {
  collectionName: 'components_course_modules';
  info: {
    displayName: '\u8BFE\u7A0B\u6A21\u5757';
    icon: 'book';
  };
  attributes: {
    highlight: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    hour: Schema.Attribute.String;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CourseOutcomes extends Struct.ComponentSchema {
  collectionName: 'components_course_outcomess';
  info: {
    displayName: '\u5C31\u4E1A\u65B9\u5411';
    icon: 'briefcase';
  };
  attributes: {
    jobs: Schema.Attribute.String;
    targets: Schema.Attribute.String;
  };
}

export interface CoursePractice extends Struct.ComponentSchema {
  collectionName: 'components_course_practices';
  info: {
    displayName: '\u5B9E\u8BAD\u8BF4\u660E';
    icon: 'cog';
  };
  attributes: {
    text: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface CoursePrice extends Struct.ComponentSchema {
  collectionName: 'components_course_prices';
  info: {
    displayName: '\u8BFE\u7A0B\u4EF7\u683C';
    icon: 'shopping-cart';
  };
  attributes: {
    amount: Schema.Attribute.String;
    currency: Schema.Attribute.String & Schema.Attribute.DefaultTo<'\u00A5'>;
    origin: Schema.Attribute.String;
    save: Schema.Attribute.String;
  };
}

export interface CourseStage extends Struct.ComponentSchema {
  collectionName: 'components_course_stages';
  info: {
    displayName: '\u8BFE\u7A0B\u9636\u6BB5';
    icon: 'layer';
  };
  attributes: {
    badge: Schema.Attribute.String;
    modules: Schema.Attribute.Component<'course.module', true>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface GeoAnswerBlock extends Struct.ComponentSchema {
  collectionName: 'components_geo_answer_blocks';
  info: {
    displayName: '\u7B54\u6848\u6BB5\u843D';
    icon: 'message';
  };
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface GeoKeyFact extends Struct.ComponentSchema {
  collectionName: 'components_geo_key_facts';
  info: {
    displayName: '\u5173\u952E\u6570\u636E';
    icon: 'database';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface GeoSource extends Struct.ComponentSchema {
  collectionName: 'components_geo_sources';
  info: {
    displayName: '\u5F15\u7528\u6765\u6E90';
    icon: 'link';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String;
  };
}

export interface KbFact extends Struct.ComponentSchema {
  collectionName: 'components_kb_facts';
  info: {
    displayName: '\u6570\u636E\u70B9';
    icon: 'chart-pie';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    source: Schema.Attribute.String;
    value: Schema.Attribute.String & Schema.Attribute.Required;
    year: Schema.Attribute.String;
  };
}

export interface KbPoint extends Struct.ComponentSchema {
  collectionName: 'components_kb_points';
  info: {
    displayName: '\u77E5\u8BC6\u8981\u70B9';
    icon: 'bullet-list';
  };
  attributes: {
    text: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface KbSource extends Struct.ComponentSchema {
  collectionName: 'components_kb_sources';
  info: {
    displayName: '\u6765\u6E90\u51FA\u5904';
    icon: 'external-link';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    note: Schema.Attribute.Text;
    url: Schema.Attribute.String;
  };
}

export interface SharedCover extends Struct.ComponentSchema {
  collectionName: 'components_shared_covers';
  info: {
    displayName: '\u5C01\u9762';
    icon: 'picture';
  };
  attributes: {
    alt: Schema.Attribute.String;
    fallbackPath: Schema.Attribute.String;
    height: Schema.Attribute.Integer;
    image: Schema.Attribute.Media<'images'>;
    width: Schema.Attribute.Integer;
  };
}

export interface SharedFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_faq_items';
  info: {
    displayName: '\u95EE\u7B54\u9879';
    icon: 'question';
  };
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedFooterGroup extends Struct.ComponentSchema {
  collectionName: 'components_shared_footer_groups';
  info: {
    displayName: '\u9875\u811A\u5206\u7EC4';
    icon: 'layer-group';
  };
  attributes: {
    links: Schema.Attribute.Component<'shared.link', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_links';
  info: {
    displayName: '\u94FE\u63A5';
    icon: 'link';
  };
  attributes: {
    external: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedMetaTag extends Struct.ComponentSchema {
  collectionName: 'components_shared_meta_tags';
  info: {
    displayName: '\u6807\u7B7E';
    icon: 'price-tag';
  };
  attributes: {
    cls: Schema.Attribute.String;
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedRouteSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_route_seos';
  info: {
    displayName: '\u8DEF\u7531 SEO';
    icon: 'globe';
  };
  attributes: {
    route: Schema.Attribute.String & Schema.Attribute.Required;
    seo: Schema.Attribute.Component<'shared.seo', false>;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'SEO \u5143\u4FE1\u606F';
    icon: 'search';
  };
  attributes: {
    canonical: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    keywords: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedShowcaseItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_showcase_items';
  info: {
    displayName: '\u5C55\u793A\u6761\u76EE';
    icon: 'grid';
  };
  attributes: {
    desc: Schema.Attribute.Text;
    emoji: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedStatItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_stat_items';
  info: {
    displayName: '\u6570\u636E\u9879';
    icon: 'chart-bubble';
  };
  attributes: {
    highlight: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'course.module': CourseModule;
      'course.outcomes': CourseOutcomes;
      'course.practice': CoursePractice;
      'course.price': CoursePrice;
      'course.stage': CourseStage;
      'geo.answer-block': GeoAnswerBlock;
      'geo.key-fact': GeoKeyFact;
      'geo.source': GeoSource;
      'kb.fact': KbFact;
      'kb.point': KbPoint;
      'kb.source': KbSource;
      'shared.cover': SharedCover;
      'shared.faq-item': SharedFaqItem;
      'shared.footer-group': SharedFooterGroup;
      'shared.link': SharedLink;
      'shared.meta-tag': SharedMetaTag;
      'shared.route-seo': SharedRouteSeo;
      'shared.seo': SharedSeo;
      'shared.showcase-item': SharedShowcaseItem;
      'shared.stat-item': SharedStatItem;
    }
  }
}
