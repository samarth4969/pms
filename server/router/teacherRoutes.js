import express from "express";
import {
  getTeacherDashboardStats,
  acceptRequest,
  rejectRequest,
  getRequests,
  addFeedback,
  markComplete,
  getAssignedStudents,
  downloadFile,
  getFiles,
  getAssignedStudentsForMarks,
  teacherAddOrUpdateMarks,
} from "../controllers/teacherController.js";
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
  "/fetch-dashboard-stats",
  isAuthenticated,
  isAuthorized("Teacher"),
  getTeacherDashboardStats
);

router.get(
  "/requests",
  isAuthenticated,
  isAuthorized("Teacher"),
  getRequests
);

router.put(
  "/requests/:requestId/accept",
  isAuthenticated,
  isAuthorized("Teacher"),
  acceptRequest
);

router.put(
  "/requests/:requestId/reject",   // ✅ FIXED
  isAuthenticated,
  isAuthorized("Teacher"),
  rejectRequest
);

router.post(
  "/feedback/:projectId",
  isAuthenticated,
  isAuthorized("Teacher"),
  addFeedback
);

router.put(                           // ✅ FIXED
  "/mark-complete/:projectId",
  isAuthenticated,
  isAuthorized("Teacher"),
  markComplete
);

router.get(
  "/assigned-students",
  isAuthenticated,
  isAuthorized("Teacher"),
  getAssignedStudents
);
router.get(
  "/download/:projectId/:fileId",
  isAuthenticated,
  isAuthorized("Teacher"),
  downloadFile
);
router.get(
  "/files",
  isAuthenticated,
  isAuthorized("Teacher"),
  getFiles
);
router.get(
  "/assigned-students-for-marks",
  isAuthenticated,
  isAuthorized("Teacher"),
  getAssignedStudentsForMarks
);

router.post(
  "/add-or-update-marks/:studentId",
  isAuthenticated,
  isAuthorized("Teacher"),
  teacherAddOrUpdateMarks
)



export default router;
