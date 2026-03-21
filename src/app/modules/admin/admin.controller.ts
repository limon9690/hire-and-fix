import { Request, Response } from "express";
import status from "http-status";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { AdminServices } from "./admin.service";
import { TUpdateUserStatusPayload, TUpdateVendorApprovalPayload } from "./admin.validation";

const getDashboardSummary = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminServices.getDashboardSummary();

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Dashboard summary retrieved successfully",
        data: result
    });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminServices.getAllUsers();

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Users retrieved successfully",
        data: result
    });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminServices.getAllBookings();

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Bookings retrieved successfully",
        data: result
    });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminServices.getAllPayments();

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Payments retrieved successfully",
        data: result
    });
});

const getPaymentDetails = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminServices.getPaymentDetails(req.params.id as string);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Payment retrieved successfully",
        data: result
    });
});

const getBookingDetails = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminServices.getBookingDetails(req.params.id as string);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Booking retrieved successfully",
        data: result
    });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminServices.getSingleUser(req.params.id as string);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "User retrieved successfully",
        data: result
    });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminServices.updateUserStatus(
        req.params.id as string,
        req.body as TUpdateUserStatusPayload
    );

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "User status updated successfully",
        data: result
    });
});

const updateVendorApproval = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminServices.updateVendorApproval(
        req.params.id as string,
        req.body as TUpdateVendorApprovalPayload
    );

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Vendor approval status updated successfully",
        data: result
    });
});

export const AdminControllers = {
    getDashboardSummary,
    getAllUsers,
    getAllBookings,
    getAllPayments,
    getPaymentDetails,
    getBookingDetails,
    getSingleUser,
    updateUserStatus,
    updateVendorApproval
};
