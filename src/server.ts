import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import { setupAssociations } from './models/associations';

// Setup model associations
setupAssociations();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

