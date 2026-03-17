import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { EmployeeServices } from "./employee.service";
import { TUpdateEmployeePayload, TUpdateMyProfilePayload } from "./employee.validation";

const getAllEmployees = catchAsync(async (req: Request, res: Response) => {
    const result = await EmployeeServices.getAllEmployees();

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Employees retrieved successfully",
        data: result
    });
});

const getEmployeeDetails = catchAsync(async (req: Request, res: Response) => {
    const result = await EmployeeServices.getEmployeeDetails(req.params.id as string);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Employee retrieved successfully",
        data: result
    });
});

const getMyEmployees = catchAsync(async (req: Request, res: Response) => {
    const result = await EmployeeServices.getMyEmployees(req.user.userId);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Vendor employees retrieved successfully",
        data: result
    });
});

const deleteMyEmployee = catchAsync(async (req: Request, res: Response) => {
    const result = await EmployeeServices.deleteMyEmployee(req.user.userId, req.params.id as string);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Employee deleted successfully",
        data: result
    });
});

const updateMyEmployee = catchAsync(async (req: Request, res: Response) => {
    const result = await EmployeeServices.updateMyEmployee(
        req.user.userId,
        req.params.id as string,
        req.body as TUpdateEmployeePayload
    );

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Employee updated successfully",
        data: result
    });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
    const result = await EmployeeServices.updateMyProfile(
        req.user.userId,
        req.body as TUpdateMyProfilePayload
    );

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Profile updated successfully",
        data: result
    });
});

export const EmployeeControllers = {
    getAllEmployees,
    getEmployeeDetails,
    getMyEmployees,
    deleteMyEmployee,
    updateMyEmployee,
    updateMyProfile
};
