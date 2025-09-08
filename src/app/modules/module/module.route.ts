import express from "express";

import validateRequest from "../../middleware/validateRequest";
import { ModuleValidation } from "./module.validation";
import { moduleController } from "./module.controller";
import { adminAuth } from "../../middleware/adminAuth";

const router = express.Router();

router.post(
  "/create",
  adminAuth(),
  validateRequest(ModuleValidation.createModuleValidationSchema),
  moduleController.createModule
);

router.get("/", moduleController.getAllModules);
router.get("/:id", moduleController.getSingleModule);
router.delete("/:id", adminAuth(), moduleController.deleteModule);
router.put(
  "/:id",
  adminAuth(),
  validateRequest(ModuleValidation.updateModuleValidationSchema),
  moduleController.updateModule
);

export const ModuleRoutes = router;
