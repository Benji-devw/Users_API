import Fastify from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import db from "./db/connectToDb";
import usersRouter from "./routes/userRouter";

const fastify = Fastify({ logger: false });
const apiPort = 8805;

fastify.register(helmet);

fastify.register(cors, {
    origin: "*", // accéder à notre API depuis n'importe quelle origine ( '*' ) ;
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // envoyer des requêtes avec les méthodes mentionnées ( GET ,POST , etc.).
    allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content",
        "Accept",
        "Content-Type",
        "Authorization",
    ], // ajouter les headers mentionnés aux requêtes envoyées vers notre API
});

db.on("error", console.error.bind(console, " 🔴 MongoDB connection error:"));

fastify.register(usersRouter, { prefix: "/api" });

const start = async () => {
    try {
        await fastify.listen({ port: apiPort });
        fastify.log.info(`🚀 Vallena Users API running on port ${apiPort}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
