import { ENVIROMENT_VARIABLES } from "./EnviromentVariables";

// CORS Configuration
export const corsOptions = {
    origin:
        ENVIROMENT_VARIABLES.NODE_ENV === "development"
            ? "*"
            : ENVIROMENT_VARIABLES.ALLOWED_ORIGINS
                ? ENVIROMENT_VARIABLES.ALLOWED_ORIGINS.split(",")
                : [
                    "http://localhost:3000",
                    "http://localhost:3001",
                    "http://127.0.0.1:3000",
                    "http://127.0.0.1:3001",
                ],
    credentials: ENVIROMENT_VARIABLES.NODE_ENV !== "development",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
    ],
    maxAge: 86400, // 24 hours
};