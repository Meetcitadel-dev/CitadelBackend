"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const university_controller_1 = require("../controllers/university.controller");
const router = (0, express_1.Router)();
// Public route - no authentication required
router.get('/universities', university_controller_1.getUniversities);
// POST route for creating universities (you might want to add authentication here)
router.post('/universities', university_controller_1.createUniversity);
exports.default = router;
