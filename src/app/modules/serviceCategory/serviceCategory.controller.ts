import { Request, Response } from "express";
import status from "http-status";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { ServiceCategoryServices } from "./serviceCategory.service";
import { TCreateServiceCategoryPayload, TUpdateServiceCategoryPayload } from "./serviceCategory.validation";

const createServiceCategory = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await ServiceCategoryServices.createServiceCategory(payload as TCreateServiceCategoryPayload);

    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: "Service category created successfully",
        data: result
    });
});

const getAllServiceCategories = catchAsync(async (req: Request, res: Response) => {
    const result = await ServiceCategoryServices.getAllServiceCategories();

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Service categories retrieved successfully",
        data: result
    });
});

const getServiceCategoryDetails = catchAsync(async (req: Request, res: Response) => {
    const result = await ServiceCategoryServices.getServiceCategoryDetails(req.params.id as string);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Service category retrieved successfully",
        data: result
    });
});

const updateServiceCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await ServiceCategoryServices.updateServiceCategory(
        req.params.id as string,
        req.body as TUpdateServiceCategoryPayload
    );

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Service category updated successfully",
        data: result
    });
});

const deleteServiceCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await ServiceCategoryServices.deleteServiceCategory(req.params.id as string);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Service category deleted successfully",
        data: result
    });
});

export const ServiceCategoryControllers = {
    createServiceCategory,
    getAllServiceCategories,
    getServiceCategoryDetails,
    updateServiceCategory,
    deleteServiceCategory
};
