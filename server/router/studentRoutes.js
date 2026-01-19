import express from "express";
import {getAvailableSupervisors,getStudentProject,requestSupervisor,submitProposal,uploadFiles    }from "../controllers/studentController.js"

import multer from "multer";
import { isAuthenticated,isAuthorized } from "../middlewares/authMiddleware.js";
import { handleUploadError,upload } from "../middlewares/upload.js";
import { getSupervisor } from "../../client/src/store/slices/studentSlice.js";

const router=express.Router();

router.get("/project",isAuthenticated,isAuthorized("Student"),getStudentProject);
router.post("/project-proposal",isAuthenticated,isAuthorized("Student"),submitProposal);
router.post("/upload/:projectId",isAuthenticated,isAuthorized("Student"),upload.array("files",10), handleUploadError,uploadFiles);

router.get("/fetch-supervisors",isAuthenticated,isAuthorized("Student"),getAvailableSupervisors);
router.get("/supervisor",isAuthenticated,isAuthorized("Student"),getSupervisor);
router.post("/request-supervisor",isAuthenticated,isAuthorized("Student"),requestSupervisor);

export default router;