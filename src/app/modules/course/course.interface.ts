export type TInstructor = {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
};

export type TCourseModule = {
  title: string;
  lessons: string[];
};

export type TCourseStatistics = {
  enrolledStudents: number;
  moduleCount: number;
  projectCount: number;
  assignmentCount: number;
  price: number;
  originalPrice: number;
};

export type TCourseFeature = {
  value: string;
};

export type TProject = {
  name: string;
};

export type TCourse = {
  title: string;
  batchName: string;
  description: string;
  slug: string;
  imageUrl: string;
  videoUrl?: string;
  courseType: string;
  upcomingCourse?: number;
  enrolledStudents: number;
  moduleCount: number;
  projectCount: number;
  assignmentCount: number;
  price: number;
  originalPrice: number;
  instructors: TInstructor[];
  courseFeatures: TCourseFeature[];
  courseModules: TCourseModule[];
  projects: TProject[];
  isPublished: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type TCourseCreateData = {
  title: string;
  batchName: string;
  description: string;
  slug: string;
  imageUrl: string;
  videoUrl?: string;
  courseType: string;
  upcomingCourse?: number | string | boolean; // Allow different types from frontend
  enrolledStudents: number;
  moduleCount: number;
  projectCount: number;
  assignmentCount: number;
  price: number;
  originalPrice: number;
  instructors: TInstructor[];
  courseFeatures: TCourseFeature[];
  courseModules: TCourseModule[];
  projects: TProject[];
};

export type TCourseUpdateData = {
  title?: string;
  batchName?: string;
  description?: string;
  slug?: string;
  imageUrl?: string;
  videoUrl?: string;
  courseType?: string;
  upcomingCourse?: number | string | boolean;
  enrolledStudents?: number;
  moduleCount?: number;
  projectCount?: number;
  assignmentCount?: number;
  price?: number;
  originalPrice?: number;
  instructors?: TInstructor[];
  courseFeatures?: TCourseFeature[];
  courseModules?: TCourseModule[];
  projects?: TProject[];
  isPublished?: boolean;
};
