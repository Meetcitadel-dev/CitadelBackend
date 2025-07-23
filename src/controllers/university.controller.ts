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
