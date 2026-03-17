import bcrypt from "bcrypt";
import { Role } from "../../../prisma/generated/prisma/enums";
import { envVars } from "../config/env";
import { prisma } from "../lib/prisma";

export const seedAdmin = async () => {
    const existingAdmin = await prisma.user.findUnique({
        where: {
            email: envVars.ADMIN_EMAIL
        }
    });

    if (existingAdmin) {
        console.log("Admin already exists");
        return;
    }

    const hashedPassword = await bcrypt.hash(
        envVars.ADMIN_PASSWORD,
        envVars.BCRYPT_SALT_ROUNDS
    );

    await prisma.user.create({
        data: {
            name: envVars.ADMIN_NAME,
            email: envVars.ADMIN_EMAIL,
            password: hashedPassword,
            role: Role.ADMIN
        }
    });

    console.log("Admin created successfully");
};
