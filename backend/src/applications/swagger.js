import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SnapJournal API Documentation",
      version: "1.0.0",
      description: "Dokumentasi API untuk aplikasi SnapJournal (Backend).",
      contact: {
        name: "Developer",
      },
    },

    tags: [
    { name: "Auth Public", description: "Endpoint Autentikasi Publik" },
    { name: "Auth", description: "Endpoint Autentikasi Private" },
    { name: "User", description: "Manajemen User" },
    { name: "Journal", description: "Manajemen Journal" },
    { name: "Cron Job (Testing)", description: "Endpoint Cron Manual" },
    { name: "Notification", description: "Manajemen Notifikasi" },
    ],
    
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/docs/*.js"], 
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app) => {
  if (process.env.NODE_ENV !== 'production') {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }
};

export default swaggerDocs;