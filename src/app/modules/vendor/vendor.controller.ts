import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { parseQueryOptions } from "../../utils/queryHelpers";
import { sendResponse } from "../../utils/sendResponse";
import { VendorServices } from "./vendor.service";
import { TUpdateMyVendorPayload } from "./vendor.validation";

const parseBooleanQuery = (value: unknown): boolean | undefined => {
    if (typeof value !== "string") {
        return undefined;
    }

    if (value === "true") {
        return true;
    }

    if (value === "false") {
        return false;
    }

    return undefined;
};

const getAllVendors = catchAsync(async (req: Request, res: Response) => {
    const queryOptions = parseQueryOptions(req.query as Record<string, unknown>, {
        defaultLimit: 10,
        maxLimit: 100,
        defaultSortBy: "vendorName",
        allowedSortFields: ["vendorName", "isApproved", "isActive"]
    });

    const isApproved = parseBooleanQuery(req.query.isApproved);
    const isActive = parseBooleanQuery(req.query.isActive);
    const searchTerm = typeof req.query.searchTerm === "string"
        ? req.query.searchTerm.trim()
        : undefined;

    const result = await VendorServices.getAllVendors(queryOptions, {
        isApproved,
        isActive,
        searchTerm: searchTerm && searchTerm.length > 0 ? searchTerm : undefined
    });

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Vendors retrieved successfully",
        data: result.data,
        meta: result.meta
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
