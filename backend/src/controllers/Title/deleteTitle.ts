import { Response } from "express";
import httpStatus from "http-status";
import { titleService } from "../../services";
import { errorHandlerWrapper } from "../../utils";

// New deleteTitleHandler function
const deleteTitleHandler = async (req, res: Response) => {

  const { id } = req.params; // Assuming the title ID is passed as a URL parameter
  console.log('id', id)
  const newTitle = await titleService.deleteTitle(id); // Call the service to delete the title
  res.json(newTitle).status(httpStatus.CREATED);
};

export const deleteTitleController = errorHandlerWrapper(deleteTitleHandler);
