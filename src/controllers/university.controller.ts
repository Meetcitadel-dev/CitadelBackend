import { Request, Response } from 'express';
import University, { IUniversity } from '../models/university.model';
import redisClient, { safeRedisCommand } from '../config/redis';
import { levenshtein } from '../utils/levenshtein';
// Removed Sequelize Op import - using Mongoose queries instead

const CACHE_TTL = 60 * 60 * 24; // 24 hours
const SEARCH_CACHE_TTL = 60 * 5; // 5 minutes for search results

export const getUniversities = async (req: Request, res: Response) => {
  const search = (req.query.search as string) || '';
  const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 100); // Cap at 100
  const offset = parseInt((req.query.offset as string) || '0', 10);
  const cacheKey = `universities:${search}:${limit}:${offset}`;

  try {
    // Try cache first with safe Redis command
    const cached = await safeRedisCommand(
      () => redisClient.get(cacheKey),
      null
    );

    if (cached) {
      console.log(`✅ University cache hit for key: ${cacheKey}`);
      return res.json({ success: true, universities: JSON.parse(cached) });
    }

    console.log(`🔍 University cache miss, querying database for: "${search}"`);
    let universities: IUniversity[];

    if (search && search.length >= 2) {
      // Use database search with ILIKE for better performance
      universities = await University.find({
        name: { $regex: search, $options: 'i' }
      })
      .sort({ name: 1 })
      .limit(limit + 50); // Get extra for fuzzy matching

      // Apply fuzzy search only if we have results and search is specific
      if (universities.length > 0 && search.length >= 3) {
        const scored = universities
          .map(u => ({
            university: u,
            distance: levenshtein(u.name.toLowerCase(), search.toLowerCase()),
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, Math.min(100, universities.length)); // Limit fuzzy search results
        universities = scored.map(s => s.university);
      }
    } else if (!search) {
      // For empty search, get popular universities (you might want to add a popularity field)
      universities = await University.find({})
        .sort({ name: 1 })
        .limit(limit + offset);
    } else {
      // Search too short, return empty
      universities = [];
    }

    // Apply pagination after fuzzy search
    const paginated = universities.slice(offset, offset + limit);

    // Cache result with appropriate TTL
    const cacheTTL = search ? SEARCH_CACHE_TTL : CACHE_TTL;
    await safeRedisCommand(
      () => redisClient.setEx(cacheKey, cacheTTL, JSON.stringify(paginated)),
      undefined
    );

    console.log(`✅ University query completed: ${paginated.length} results for "${search}"`);
    return res.json({ success: true, universities: paginated });
  } catch (err) {
    console.error('❌ University controller error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching universities',
      error: process.env.NODE_ENV === 'development' ? err : undefined
    });
  }
};

export const createUniversity = async (req: Request, res: Response) => {
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
    const existingUniversity = await University.findOne({
      $or: [
        { name: name },
        { domain: domain }
      ]
    });

    if (existingUniversity) {
      return res.status(409).json({
        success: false,
        message: 'University with this name or domain already exists',
        university: existingUniversity
      });
    }

    // Create new university
    const newUniversity = await University.create({
      name,
      domain,
      country
    });

    // Clear cache to ensure fresh data
    const pattern = 'universities:*';
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    return res.status(201).json({
      success: true,
      message: 'University created successfully',
      university: newUniversity
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};
