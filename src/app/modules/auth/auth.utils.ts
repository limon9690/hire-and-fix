import { Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { envVars } from "../../config/env";

type TJwtPayload = {
    userId: string;
    email: string;
    role: string;
};

export const generateAccessToken = (payload: TJwtPayload) => {
    return jwt.sign(payload, envVars.JWT_ACCESS_SECRET, {
        expiresIn: envVars.JWT_ACCESS_EXPIRES_IN
    } as SignOptions);
};

export const setAuthCookie = (res: Response, token: string) => {
    res.cookie("accessToken", token, {
        httpOnly: true,
        secure: envVars.NODE_ENV === "production",
        sameSite: "lax"
    });
};
