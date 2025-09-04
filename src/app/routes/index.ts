import express from "express";
import { BlogRoutes } from "../modules/blog/blog.route";
import { ModuleRoutes } from "../modules/module/module.route";
import { StudentRoutes } from "../modules/student/student.route";
import { AdminRoutes } from "../modules/admin/admin.route";
import { CourseRoutes } from "../modules/course/course.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/blog",
    route: BlogRoutes,
  },
  { path: "/module", route: ModuleRoutes },
  { path: "/student", route: StudentRoutes },
  { path: "/admin", route: AdminRoutes },
  { path: "/course", route: CourseRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
