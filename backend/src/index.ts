import express from "express";
import cors from "cors";
import { dbCreate, AppDataSouce } from "./db";
import { appRouter } from "./routes";
import { errorHandlerMiddleware,  routeMiddleware } from "./middlewares";
import { Env } from "./env";
// import { clientUse } from "req-scopes";

const setupServer = async () => {
  try {
    await dbCreate();
  } catch (error) {
    console.error("Error during database creation:", error);
    return; // Optionally exit the setup if dbCreate fails
  }

  await AppDataSouce.initialize();

  const app = express();

  app.use(cors({ origin: '*' }));
  app.use(express.json());
  // app.use(clientUse());
  app.use(routeMiddleware);
  app.use("/health", (_req, res) => {
    res.json({ msg: "Hello World" });
  });
  app.use("/api/v1", appRouter);
  app.use(errorHandlerMiddleware);

  const { port } = Env;
  console.log("Port value:", port);

  app.listen(port, () => {
    console.log(`Server is listening on ${port}.`);
  });
};

setupServer();
