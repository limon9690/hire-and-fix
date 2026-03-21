import { Request, Response } from "express";
import status from "http-status";
import { BookingStatus, PaymentStatus } from "../../../../prisma/generated/prisma/enums";
import { catchAsync } from "../../utils/catchAsync";
import { parseQueryOptions } from "../../utils/queryHelpers";
import { sendResponse } from "../../utils/sendResponse";
import { BookingServices } from "./booking.service";
import {
    TCreateBookingPayload,
    TUpdateBookingStatusByEmployeePayload,
    TUpdateBookingStatusByVendorPayload
} from "./booking.validation";

const getEnumQueryValue = <T extends string>(value: unknown, enumValues: readonly T[]) => {
    if (typeof value !== "string") {
        return undefined;
    }

    return enumValues.includes(value as T) ? (value as T) : undefined;
};

const createBooking = catchAsync(async (req: Request, res: Response) => {
    const result = await BookingServices.createBooking(
        req.user.userId,
        req.body as TCreateBookingPayload
    );

    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: "Booking created successfully",
        data: result
    });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
    const queryOptions = parseQueryOptions(req.query as Record<string, unknown>, {
        defaultLimit: 10,
        maxLimit: 100,
        defaultSortBy: "createdAt",
        allowedSortFields: ["createdAt", "startTime", "endTime", "bookingStatus", "paymentStatus", "totalPrice"]
    });

    const bookingStatus = getEnumQueryValue(
        req.query.bookingStatus,
        Object.values(BookingStatus) as BookingStatus[]
    );

    const paymentStatus = getEnumQueryValue(
        req.query.paymentStatus,
        Object.values(PaymentStatus) as PaymentStatus[]
    );

    const result = await BookingServices.getMyBookings(
        req.user.userId,
        req.user.role,
        queryOptions,
        {
            bookingStatus,
            paymentStatus
        }
    );

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Bookings retrieved successfully",
        data: result.data,
        meta: result.meta
    });
});

const getBookingDetails = catchAsync(async (req: Request, res: Response) => {
    const result = await BookingServices.getBookingDetails(
        req.params.id as string,
        req.user.userId,
        req.user.role
    );

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Booking retrieved successfully",
        data: result
    });
});

const cancelBooking = catchAsync(async (req: Request, res: Response) => {
    const result = await BookingServices.cancelBooking(
        req.params.id as string,
        req.user.userId
    );

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Booking cancelled successfully",
        data: result
    });
});

const updateBookingStatusByVendor = catchAsync(async (req: Request, res: Response) => {
    const result = await BookingServices.updateBookingStatusByVendor(
        req.user.userId,
        req.params.id as string,
        req.body as TUpdateBookingStatusByVendorPayload
    );

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Booking status updated successfully",
        data: result
    });
});

const updateBookingStatusByEmployee = catchAsync(async (req: Request, res: Response) => {
    const result = await BookingServices.updateBookingStatusByEmployee(
        req.user.userId,
        req.params.id as string,
        req.body as TUpdateBookingStatusByEmployeePayload
    );

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Booking status updated successfully",
        data: result
    });
});

export const BookingControllers = {
    createBooking,
    getMyBookings,
    getBookingDetails,
    cancelBooking,
    updateBookingStatusByVendor,
    updateBookingStatusByEmployee
};
