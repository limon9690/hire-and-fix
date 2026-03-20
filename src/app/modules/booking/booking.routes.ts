import { Router } from "express";
import { Role } from "../../../../prisma/generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { BookingControllers } from "./booking.controller";
import { bookingValidationSchemas } from "./booking.validation";

const router = Router();

router.get(
    "/me",
    auth(Role.USER, Role.VENDOR, Role.EMPLOYEE),
    BookingControllers.getMyBookings
);

router.get(
    "/:id",
    auth(Role.USER, Role.VENDOR, Role.EMPLOYEE, Role.ADMIN),
    BookingControllers.getBookingDetails
);

router.patch(
    "/:id/cancel",
    auth(Role.USER),
    BookingControllers.cancelBooking
);

router.patch(
    "/:id/status",
    auth(Role.VENDOR),
    validateRequest(bookingValidationSchemas.updateBookingStatusByVendorSchema),
    BookingControllers.updateBookingStatusByVendor
);

router.patch(
    "/:id/employee-status",
    auth(Role.EMPLOYEE),
    validateRequest(bookingValidationSchemas.updateBookingStatusByEmployeeSchema),
    BookingControllers.updateBookingStatusByEmployee
);

router.post(
    "/",
    auth(Role.USER),
    validateRequest(bookingValidationSchemas.createBookingSchema),
    BookingControllers.createBooking
);

export const BookingRoutes = router;
