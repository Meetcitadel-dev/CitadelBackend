"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUniversity = exports.getUniversities = void 0;
const university_model_1 = __importDefault(require("../models/university.model"));
const redis_1 = __importDefault(require("../config/redis"));
const levenshtein_1 = require("../utils/levenshtein");
const CACHE_TTL = 60 * 60 * 24; // 24 hours
const getUniversities = async (req, res) => {
    const search = req.query.search || '';
    const limit = parseInt(req.query.limit || '20', 10);
    const offset = parseInt(req.query.offset || '0', 10);
    const cacheKey = `universities:${search}:${limit}:${offset}`;
    try {
        // Try cache first
        const cached = await redis_1.default.get(cacheKey);
        if (cached) {
            return res.json({ success: true, universities: JSON.parse(cached) });
        }
        // Fetch all universities (for fuzzy search)
        let universities = await university_model_1.default.findAll();
        // Fuzzy search if query present
        if (search) {
            const scored = universities
                .map(u => ({
                university: u,
                distance: (0, levenshtein_1.levenshtein)(u.name.toLowerCase(), search.toLowerCase()),
            }))
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 100); // Limit fuzzy search to top 100
            universities = scored.map(s => s.university);
        }
        // Pagination
        const paginated = universities.slice(offset, offset + limit);
        // Cache result
        await redis_1.default.setEx(cacheKey, CACHE_TTL, JSON.stringify(paginated));
        return res.json({ success: true, universities: paginated });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Server error', error: err });
    }
};
exports.getUniversities = getUniversities;
const createUniversity = async (req, res) => {
    try {
        const { name, domain, country } = req.body;
        // Validate required fields
        if (!name || !domain || !country) {
            return res.status(400).json({
                success: false,
                message: 'Name, domain, and country are required'
            });
        }
        // Check if university already exists
        const existingUniversity = await university_model_1.default.findOne({
            where: {
                [require('sequelize').Op.or]: [
                    { name: name },
                    { domain: domain }
                ]
            }
        });
        if (existingUniversity) {
            return res.status(409).json({
                success: false,
                message: 'University with this name or domain already exists',
                university: existingUniversity
            });
        }
        // Create new university
        const newUniversity = await university_model_1.default.create({
            name,
            domain,
            country
        });
        // Clear cache to ensure fresh data
        const pattern = 'universities:*';
        const keys = await redis_1.default.keys(pattern);
        if (keys.length > 0) {
            await redis_1.default.del(keys);
        }
        return res.status(201).json({
            success: true,
            message: 'University created successfully',
            university: newUniversity
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Server error', error: err });
    }
};
exports.createUniversity = createUniversity;
