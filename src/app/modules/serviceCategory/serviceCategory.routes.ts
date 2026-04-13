import { Router } from "express";
import { Role } from "../../../../prisma/generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { cacheResponse } from "../../middlewares/cache";
import { validateRequest } from "../../middlewares/validateRequest";
import { ServiceCategoryControllers } from "./serviceCategory.controller";
import { serviceCategoryValidationSchemas } from "./serviceCategory.validation";

const router = Router();

router.get("/", cacheResponse(3600), ServiceCategoryControllers.getAllServiceCategories);
router.get("/:id", ServiceCategoryControllers.getServiceCategoryDetails);

router.post(
    "/",
    auth(Role.ADMIN),
    validateRequest(serviceCategoryValidationSchemas.createServiceCategorySchema),
    ServiceCategoryControllers.createServiceCategory
);

router.patch(
    "/:id",
    auth(Role.ADMIN),
    validateRequest(serviceCategoryValidationSchemas.updateServiceCategorySchema),
    ServiceCategoryControllers.updateServiceCategory
);

router.delete(
    "/:id",
    auth(Role.ADMIN),
    ServiceCategoryControllers.deleteServiceCategory
);

export const ServiceCategoryRoutes = router;
