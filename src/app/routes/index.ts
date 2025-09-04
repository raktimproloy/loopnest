import express from "express";
import { BlogRoutes } from "../modules/blog/blog.route";
import { ModuleRoutes } from "../modules/module/module.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/blog",
    route: BlogRoutes,
  },
  { path: "/module", route: ModuleRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
