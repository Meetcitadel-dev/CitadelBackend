import { Request, Response } from 'express';
import University from '../models/university.model';
import redisClient from '../config/redis';
import { levenshtein } from '../utils/levenshtein';

const CACHE_TTL = 60 * 60 * 24; // 24 hours

export const getUniversities = async (req: Request, res: Response) => {
  const search = (req.query.search as string) || '';
  const limit = parseInt((req.query.limit as string) || '20', 10);
  const offset = parseInt((req.query.offset as string) || '0', 10);
  const cacheKey = `universities:${search}:${limit}:${offset}`;

  try {
    // Try cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json({ success: true, universities: JSON.parse(cached) });
    }

    // Fetch all universities (for fuzzy search)
    let universities = await University.findAll();

    // Fuzzy search if query present
    if (search) {
      const scored = universities
        .map(u => ({
          university: u,
          distance: levenshtein(u.name.toLowerCase(), search.toLowerCase()),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 100); // Limit fuzzy search to top 100
      universities = scored.map(s => s.university);
    }

    // Pagination
    const paginated = universities.slice(offset, offset + limit);

    // Cache result
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(paginated));

    return res.json({ success: true, universities: paginated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err });
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
