import express from "express";

import validateRequest from "../../middleware/validateRequest";
import { ModuleValidation } from "./module.validation";
import { moduleController } from "./module.controller";

const router = express.Router();

router.post(
  "/create",
  validateRequest(ModuleValidation.createModuleValidationSchema),
  moduleController.createModule
);

router.get("/", moduleController.getAllModules);
router.get("/:id", moduleController.getSingleModule);
router.delete("/:id", moduleController.deleteModule);
router.put(
  "/:id",
  validateRequest(ModuleValidation.updateModuleValidationSchema),
  moduleController.updateModule
);

export const ModuleRoutes = router;
