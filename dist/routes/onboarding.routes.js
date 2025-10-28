"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const onboarding_controller_1 = require("../controllers/onboarding.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication - mounted at /api/v1
router.use(auth_middleware_1.authenticateToken);
// Complete onboarding
router.post('/onboarding', onboarding_controller_1.completeOnboarding);
// Get onboarding status
router.get('/onboarding/status', onboarding_controller_1.getOnboardingStatus);
exports.default = router;
