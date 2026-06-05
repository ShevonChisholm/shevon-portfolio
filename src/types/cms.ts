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
