import { Server } from "http";
import app from "./app";
import { envVars } from "./app/config/env";
import { seedAdmin } from "./app/utils/seedAdmin";


const port = envVars.PORT || 5000;
let server: Server;

const bootstrap = async () => {
    try {
        await seedAdmin();

        server = app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        })
    } catch (error) {
        console.log("Failed to start server!", error);
    }
}

bootstrap();
