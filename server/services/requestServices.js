import { supervisorRequest } from "../models/supervisorRequest.js";
import { ErrorHandler } from "../middlewares/error.js";

export const createRequest = async (requestData) => {
  const existingRequest = await supervisorRequest.findOne({
    student: requestData.student,
    supervisor: requestData.supervisor,
    status: "pending",
  });

  if (existingRequest) {
    throw new ErrorHandler(
      "You have already sent a request to this supervisor. Please wait for their response.",
      400
    );
  }

  const request = await supervisorRequest.create(requestData);
  return request;
};
