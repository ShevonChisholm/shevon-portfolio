export type ProjectCategory = "Web Apps" | "Mobile Apps";

export type ProjectType =
  | "client"
  | "personal"
  | "internal"
  | "open-source"
  | "case-study";

export type ProjectTagType =
  | "tech"
  | "industry"
  | "feature"
  | "tool"
  | "platform";

export type ProjectImageType =
  | "cover"
  | "gallery"
  | "mobile_screen"
  | "feature"
  | "architecture"
  | "logo";

export type ProjectVideoType =
  | "website_walkthrough"
  | "admin_cms_walkthrough"
  | "mobile_experience"
  | "technical_backend"
  | "demo"
  | "other";

export interface Project {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string;
  image_url: string | null;
  category: ProjectCategory;
  project_type: ProjectType | null;
  client_name: string | null;
  is_client_project: boolean;
  site_url: string | null;
  github_url: string | null;
  demo_url: string | null;
  video_url: string | null;
  case_study_url: string | null;
  role: string | null;
  status: string | null;
  impact: string | null;
  started_at: string | null;
  completed_at: string | null;
  sort_order: number;
  is_featured: boolean;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectTag {
  id: string;
  project_id: string;
  name: string;
  type: ProjectTagType | null;
  sort_order: number;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  alt_text: string | null;
  image_type: ProjectImageType | null;
  sort_order: number;
  created_at: string;
}

export interface ProjectVideo {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  video_type: ProjectVideoType;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectVideoFormValue {
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  video_type: ProjectVideoType;
  sort_order: number;
  is_published: boolean;
}

export interface ProjectHighlight {
  id: string;
  project_id: string;
  content: string;
  sort_order: number;
}

export interface ProjectTechnicalFocus {
  id: string;
  project_id: string;
  content: string;
  sort_order: number;
}

export interface ProjectWithRelations extends Project {
  tags: ProjectTag[];
  images: ProjectImage[];
  videos: ProjectVideo[];
  highlights: ProjectHighlight[];
  technical_focus: ProjectTechnicalFocus[];
}

export interface ProjectFormValues {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  image_url: string;
  category: ProjectCategory;
  project_type: ProjectType;
  client_name: string;
  is_client_project: boolean;
  site_url: string;
  github_url: string;
  demo_url: string;
  video_url: string;
  case_study_url: string;
  role: string;
  status: string;
  impact: string;
  started_at: string;
  completed_at: string;
  sort_order: number;
  is_featured: boolean;
  is_published: boolean;
  seo_title: string;
  seo_description: string;
  tags: {
    name: string;
    type: ProjectTagType;
    sort_order: number;
  }[];
  images: {
    title: string;
    description: string;
    image_url: string;
    alt_text: string;
    image_type: ProjectImageType;
    sort_order: number;
  }[];
  videos: ProjectVideoFormValue[];
  highlights: {
    content: string;
    sort_order: number;
  }[];
  technical_focus: {
    content: string;
    sort_order: number;
  }[];
}

export const emptyProjectFormValues: ProjectFormValues = {
  title: "",
  slug: "",
  short_description: "",
  description: "",
  image_url: "",
  category: "Web Apps",
  project_type: "client",
  client_name: "",
  is_client_project: true,
  site_url: "",
  github_url: "",
  demo_url: "",
  video_url: "",
  case_study_url: "",
  role: "",
  status: "",
  impact: "",
  started_at: "",
  completed_at: "",
  sort_order: 0,
  is_featured: false,
  is_published: true,
  seo_title: "",
  seo_description: "",
  tags: [],
  images: [],
  videos: [],
  highlights: [],
  technical_focus: [],
};

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location: string | null;
  employment_type: string | null;
  period: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExperienceFormValues {
  title: string;
  company: string;
  location: string;
  employment_type: string;
  period: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
  sort_order: number;
  is_published: boolean;
}

export const emptyExperienceFormValues: ExperienceFormValues = {
  title: "",
  company: "",
  location: "",
  employment_type: "",
  period: "",
  start_date: "",
  end_date: "",
  is_current: false,
  description: "",
  sort_order: 0,
  is_published: true,
};

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string | null;
  period: string;
  start_date: string | null;
  end_date: string | null;
  description: string;
  credential_url: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface EducationFormValues {
  degree: string;
  institution: string;
  location: string;
  period: string;
  start_date: string;
  end_date: string;
  description: string;
  credential_url: string;
  sort_order: number;
  is_published: boolean;
}

export const emptyEducationFormValues: EducationFormValues = {
  degree: "",
  institution: "",
  location: "",
  period: "",
  start_date: "",
  end_date: "",
  description: "",
  credential_url: "",
  sort_order: 0,
  is_published: true,
};

export interface SkillCategory {
  id: string;
  title: string;
  icon: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  category_id: string;
  name: string;
  skill_type: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SkillCategoryWithSkills extends SkillCategory {
  skills: Skill[];
}

export interface SkillCategoryFormValues {
  title: string;
  icon: string;
  sort_order: number;
  is_published: boolean;
}

export interface SkillFormValues {
  category_id: string;
  name: string;
  skill_type: string;
  sort_order: number;
  is_published: boolean;
}

export const emptySkillCategoryFormValues: SkillCategoryFormValues = {
  title: "",
  icon: "",
  sort_order: 0,
  is_published: true,
};

export const emptySkillFormValues: SkillFormValues = {
  category_id: "",
  name: "",
  skill_type: "",
  sort_order: 0,
  is_published: true,
};

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  source: string | null;
  is_read: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: unknown;
  created_at: string;
  updated_at: string;
}

export interface ResumeSettingValue {
  url: string;
  label: string;
}

export interface AboutSettingsValue {
  subtitle: string;
  paragraph_one: string;
  paragraph_two: string;
  image_url: string;
  image_alt: string;
}

export interface PortfolioContactSettings {
  resume: ResumeSettingValue | null;
  github_url: string;
  linkedin_url: string;
  contact_email: string;
  contact_phone: string;
  location: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  tags: string[] | null;
  author_name: string | null;
  reading_time: string | null;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPostFormValues {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  tags: string;
  author_name: string;
  reading_time: string;
  seo_title: string;
  seo_description: string;
  published_at: string;
  is_published: boolean;
}

export const emptyBlogPostFormValues: BlogPostFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image_url: "",
  tags: "",
  author_name: "Shevon Chisholm",
  reading_time: "",
  seo_title: "",
  seo_description: "",
  published_at: "",
  is_published: false,
};

export interface Testimonial {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  role: string | null;
  project_name: string | null;
  rating: number | null;
  feedback: string;
  consent_to_publish: boolean;
  is_published: boolean;
  is_featured: boolean;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export interface TestimonialFormValues {
  name: string;
  email: string;
  company: string;
  role: string;
  project_name: string;
  rating: number | null;
  feedback: string;
  consent_to_publish: boolean;
}

export const emptyTestimonialFormValues: TestimonialFormValues = {
  name: "",
  email: "",
  company: "",
  role: "",
  project_name: "",
  rating: null,
  feedback: "",
  consent_to_publish: false,
};
