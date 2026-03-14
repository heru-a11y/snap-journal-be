import winston from "winston";

export const logger = winston.createLogger({
    level: process.env.NODE_ENV === "development" ? "debug" : "info",
    format: winston.format.combine(
        process.env.NODE_ENV === "development" 
            ? winston.format.simple() 
            : winston.format.json()   
    ),
    transports: [
        new winston.transports.Console({})
    ]
});