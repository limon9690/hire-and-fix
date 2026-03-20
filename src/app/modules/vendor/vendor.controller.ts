import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { VendorServices } from "./vendor.service";
import { TUpdateMyVendorPayload } from "./vendor.validation";

const getAllVendors = catchAsync(async (req: Request, res: Response) => {
    const result = await VendorServices.getAllVendors();

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Vendors retrieved successfully",
        data: result
    });
});

const getVendorDetails = catchAsync(async (req: Request, res: Response) => {
    const result = await VendorServices.getVendorDetails(req.params.id as string);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Vendor retrieved successfully",
        data: result
    });
});

const updateMyVendorProfile = catchAsync(async (req: Request, res: Response) => {
    const result = await VendorServices.updateMyVendorProfile(
        req.user.userId,
        req.body as TUpdateMyVendorPayload
    );

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Vendor profile updated successfully",
        data: result
    });
});

const getDashboardSummary = catchAsync(async (req: Request, res: Response) => {
    const result = await VendorServices.getDashboardSummary(req.user.userId);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Dashboard summary retrieved successfully",
        data: result
    });
});

export const VendorControllers = {
    getAllVendors,
    getVendorDetails,
    updateMyVendorProfile,
    getDashboardSummary
};
