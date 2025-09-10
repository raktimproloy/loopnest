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

export type TCourse = {
  title: string;
  batchName: string;
  description: string;
  slug: string;
  imageUrl: string;
  videoUrl?: string;
  courseType: string;
  upcomingCourse?: number;
  statistics: TCourseStatistics;
  instructors: TInstructor[];
  courseFeatures: string[];
  courseModules: TCourseModule[];
  projects: string[];
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
  upcomingCourse?: number;
  statistics: TCourseStatistics;
  instructors: TInstructor[];
  courseFeatures: string[];
  courseModules: TCourseModule[];
  projects: string[];
};

export type TCourseUpdateData = {
  title?: string;
  batchName?: string;
  description?: string;
  slug?: string;
  imageUrl?: string;
  videoUrl?: string;
  courseType?: string;
  upcomingCourse?: number;
  statistics?: TCourseStatistics;
  instructors?: TInstructor[];
  courseFeatures?: string[];
  courseModules?: TCourseModule[];
  projects?: string[];
  isPublished?: boolean;
};
