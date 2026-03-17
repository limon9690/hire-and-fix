import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { ServiceCategoryRoutes } from "../modules/serviceCategory/serviceCategory.routes";

const router = Router();

router.use('/auth', AuthRoutes);
router.use('/service-categories', ServiceCategoryRoutes);

export const AppRoutes = router;
