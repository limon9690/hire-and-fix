import { Router } from "express";
import { VendorControllers } from "./vendor.controller";

const router = Router();

router.get("/", VendorControllers.getAllVendors);
router.get("/:id", VendorControllers.getVendorDetails);

export const VendorRoutes = router;
