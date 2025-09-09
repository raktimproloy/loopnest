export type TModule = {
  title: string;
  courseId: string; // relation to Course _id
  lessons: string[];
  creatorId: string; // relation to User _id
  duration: string;
  resourceLink?: string;
  assignments: string[];
  videoLink?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  isPublished: boolean;
};
