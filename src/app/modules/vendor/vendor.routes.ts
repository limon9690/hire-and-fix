import { Router } from "express";
import { Role } from "../../../../prisma/generated/prisma/enums";
import { VendorControllers } from "./vendor.controller";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { vendorValidationSchemas } from "./vendor.validation";

const router = Router();

router.get("/", VendorControllers.getAllVendors);

router.get("/dashboard-summary", auth(Role.VENDOR), VendorControllers.getDashboardSummary);

router.patch(
    "/me",
    auth(Role.VENDOR),
    validateRequest(vendorValidationSchemas.updateMyVendorSchema),
    VendorControllers.updateMyVendorProfile
);

router.get("/:id", VendorControllers.getVendorDetails);

export const VendorRoutes = router;
