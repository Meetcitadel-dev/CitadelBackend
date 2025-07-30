import { Request, Response } from 'express';
import User from '../models/user.model';
import { generateUsername } from './userProfile.controller';

export const completeOnboarding = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const {
      name,
      university,
      degree,
      year,
      gender,
      dob,
      skills,
      friends,
      email
    } = req.body;

    // Validate required fields
    if (!name || !university || !degree || !year || !gender || !dob || !skills || !friends) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'university', 'degree', 'year', 'gender', 'dob', 'skills', 'friends']
      });
    }

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Parse date of birth
    const dateOfBirth = new Date(`${dob.year}-${dob.month}-${dob.day}`);

    // Generate username if not already set
    let username = user.username;
    if (!username) {
      username = await generateUsername(name);
    }

    // Update user profile
    await user.update({
      name,
      username,
      universityId: university.id,
      degree,
      year,
      gender,
      dateOfBirth,
      skills,
      friends,
      isProfileComplete: true
    });

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        universityId: user.universityId,
        degree: user.degree,
        year: user.year,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        skills: user.skills,
        friends: user.friends,
        isProfileComplete: user.isProfileComplete,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
};

export const getOnboardingStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        isProfileComplete: user.isProfileComplete,
        profile: user.isProfileComplete ? {
          name: user.name,
          universityId: user.universityId,
          degree: user.degree,
          year: user.year,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          skills: user.skills,
          friends: user.friends
        } : null
      }
    });
  } catch (error) {
    console.error('Error getting onboarding status:', error);
    res.status(500).json({ error: 'Failed to get onboarding status' });
  }
}; 