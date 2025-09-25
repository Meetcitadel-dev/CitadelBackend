import sequelize from '../config/db';
import University from '../models/university.model';
import { Op } from 'sequelize';

async function addAitPune() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Check if AIT Pune already exists
    const existingUniversity = await University.findOne({
      where: {
        [Op.or]: [
          { name: 'Army Institute of Technology, Pune' },
          { name: 'AIT Pune' },
          { domain: 'aitpune.edu.in' }
        ]
      }
    });

    if (existingUniversity) {
      console.log('AIT Pune already exists in the database:', existingUniversity.toJSON());
      return;
    }

    // Add AIT Pune
    const newUniversity = await University.create({
      name: 'Army Institute of Technology, Pune',
      domain: 'aitpune.edu.in',
      country: 'India'
    });

    console.log('AIT Pune added successfully:', newUniversity.toJSON());
  } catch (error) {
    console.error('Error adding AIT Pune:', error);
  } finally {
    await sequelize.close();
  }
}

addAitPune();
