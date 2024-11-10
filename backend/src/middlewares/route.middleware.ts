import { Env } from "../env";
import { Request, Response, NextFunction } from "express";

import { Logger } from "../utils";

export const routeMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (req.path !== "/health") {
    let clientInfo = {
      ip: req.ip,
      userAgent: req.headers['user-agent'] || 'Unknown User Agent',
      // Add any other relevant client information you want to capture
    };

    // Log the clientInfo to see its structure
    Logger.info("Client Info:", JSON.stringify(clientInfo, null, 2));

    Logger.group({
      title: "New Request",
      descriptions: [
        {
          description: "URL",
          info: `${req.protocol}://${req.hostname}:${Env.port}${req.url}`,
        },
        {
          description: "PARAMS",
          info: req.params,
        },
        {
          description: "QUERY",
          info: req.query,
        },
        {
          description: "BODY",
          info: JSON.stringify(req.body, null, 2),
        },
        {
          description: "CLIENTINFO",
          info: JSON.stringify(clientInfo, null, 2), // Use the validated clientInfo
        },
      ],
    });
  }
  next();
};
