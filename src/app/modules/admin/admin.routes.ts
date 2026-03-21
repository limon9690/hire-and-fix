import { Router } from "express";
import { Role } from "../../../../prisma/generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { AdminControllers } from "./admin.controller";
import { adminValidationSchemas } from "./admin.validation";

const router = Router();

router.get(
    "/dashboard-summary",
    auth(Role.ADMIN),
    AdminControllers.getDashboardSummary
);

router.get(
    "/users",
    auth(Role.ADMIN),
    AdminControllers.getAllUsers
);

router.get(
    "/bookings",
    auth(Role.ADMIN),
    AdminControllers.getAllBookings
);

router.get(
    "/payments",
    auth(Role.ADMIN),
    AdminControllers.getAllPayments
);

router.get(
    "/payments/:id",
    auth(Role.ADMIN),
    AdminControllers.getPaymentDetails
);

router.get(
    "/bookings/:id",
    auth(Role.ADMIN),
    AdminControllers.getBookingDetails
);

router.get(
    "/users/:id",
    auth(Role.ADMIN),
    AdminControllers.getSingleUser
);

router.patch(
    "/vendors/:id/approval",
    auth(Role.ADMIN),
    validateRequest(adminValidationSchemas.updateVendorApprovalSchema),
    AdminControllers.updateVendorApproval
);

router.patch(
    "/users/:id/status",
    auth(Role.ADMIN),
    validateRequest(adminValidationSchemas.updateUserStatusSchema),
    AdminControllers.updateUserStatus
);

export const AdminRoutes = router;
