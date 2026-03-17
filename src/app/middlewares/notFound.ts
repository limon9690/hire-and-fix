import { Request, Response } from "express";
import status from "http-status";
import { IErrorResponse } from "../interfaces/error.interface";

export const notFound = (req : Request, res : Response) => {
    const errorResponse: IErrorResponse = {
        success: false,
        message: `Route ${req.originalUrl} not found`,
        errorSources: [
            {
                path: req.originalUrl,
                message: "API endpoint not found"
            }
        ]
    };

    res.status(status.NOT_FOUND).json(errorResponse);
}
