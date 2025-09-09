import express from "express";
import { BlogRoutes } from "../modules/blog/blog.route";
import { ModuleRoutes } from "../modules/module/module.route";
import { StudentRoutes } from "../modules/student/student.route";
import { CourseRoutes } from "../modules/course/course.route";
import { PaymentRoutes } from "../modules/payment/payment.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/blog",
    route: BlogRoutes,
  },
  { path: "/module", route: ModuleRoutes },
  { path: "/user", route: StudentRoutes },
  { path: "/course", route: CourseRoutes },
  { path: "/payment", route: PaymentRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
