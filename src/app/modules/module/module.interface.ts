export type TModule = {
  title: string;
  course: string;
  lessons: TLesson[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  isPublished: boolean;
};

export type TLesson = {
  lesson1: string;
  lesson2: string;
  description: string;
};
