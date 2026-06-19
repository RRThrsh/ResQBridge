const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { asyncHandler } = require("../middleware/errorHandler");
const { getUsers, getUser, updateUserRole, getStats } = require("../controllers/adminController");

router.use(authenticate, authorize("superadmin"));

router.get("/users", asyncHandler(getUsers));
router.get("/users/:uuid", asyncHandler(getUser));
router.get("/stats", asyncHandler(getStats));

const updateRoleRules = [
  body("role").trim().notEmpty().withMessage("Role is required."),
];
router.patch("/users/:uuid/role", updateRoleRules, validate, asyncHandler(updateUserRole));

module.exports = router;
