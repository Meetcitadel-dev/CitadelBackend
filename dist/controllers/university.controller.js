"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUniversity = exports.getUniversities = void 0;
const university_model_1 = __importDefault(require("../models/university.model"));
const redis_1 = __importStar(require("../config/redis"));
const levenshtein_1 = require("../utils/levenshtein");
const sequelize_1 = require("sequelize");
const CACHE_TTL = 60 * 60 * 24; // 24 hours
const SEARCH_CACHE_TTL = 60 * 5; // 5 minutes for search results
const getUniversities = async (req, res) => {
    const search = req.query.search || '';
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100); // Cap at 100
    const offset = parseInt(req.query.offset || '0', 10);
    const cacheKey = `universities:${search}:${limit}:${offset}`;
    try {
        // Try cache first with safe Redis command
        const cached = await (0, redis_1.safeRedisCommand)(() => redis_1.default.get(cacheKey), null);
        if (cached) {
            console.log(`✅ University cache hit for key: ${cacheKey}`);
            return res.json({ success: true, universities: JSON.parse(cached) });
        }
        console.log(`🔍 University cache miss, querying database for: "${search}"`);
        let universities;
        if (search && search.length >= 2) {
            // Use database search with ILIKE for better performance
            universities = await university_model_1.default.findAll({
                where: {
                    name: {
                        [sequelize_1.Op.iLike]: `%${search}%`
                    }
                },
                order: [['name', 'ASC']],
                limit: limit + 50, // Get extra for fuzzy matching
                offset: 0 // Don't offset here, we'll handle it after fuzzy search
            });
            // Apply fuzzy search only if we have results and search is specific
            if (universities.length > 0 && search.length >= 3) {
                const scored = universities
                    .map(u => ({
                    university: u,
                    distance: (0, levenshtein_1.levenshtein)(u.name.toLowerCase(), search.toLowerCase()),
                }))
                    .sort((a, b) => a.distance - b.distance)
                    .slice(0, Math.min(100, universities.length)); // Limit fuzzy search results
                universities = scored.map(s => s.university);
            }
        }
        else if (!search) {
            // For empty search, get popular universities (you might want to add a popularity field)
            universities = await university_model_1.default.findAll({
                order: [['name', 'ASC']],
                limit: limit + offset,
                offset: 0
            });
        }
        else {
            // Search too short, return empty
            universities = [];
        }
        // Apply pagination after fuzzy search
        const paginated = universities.slice(offset, offset + limit);
        // Cache result with appropriate TTL
        const cacheTTL = search ? SEARCH_CACHE_TTL : CACHE_TTL;
        await (0, redis_1.safeRedisCommand)(() => redis_1.default.setEx(cacheKey, cacheTTL, JSON.stringify(paginated)), undefined);
        console.log(`✅ University query completed: ${paginated.length} results for "${search}"`);
        return res.json({ success: true, universities: paginated });
    }
    catch (err) {
        console.error('❌ University controller error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching universities',
            error: process.env.NODE_ENV === 'development' ? err : undefined
        });
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
