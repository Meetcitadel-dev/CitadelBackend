import sequelize from '../config/db';

async function runSpecificMigrations() {
  try {
    console.log('🔄 Running specific migrations...');
    
    // Create adjective_selections table
    console.log('📝 Creating adjective_selections table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS adjective_selections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
        "targetUserId" INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
        adjective VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        "isMatched" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Add unique constraint
    await sequelize.query(`
      ALTER TABLE adjective_selections 
      ADD CONSTRAINT unique_adjective_selection 
      UNIQUE ("userId", "targetUserId")
    `);
    
    // Add indexes
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_adjective_selections_user_id ON adjective_selections ("userId")');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_adjective_selections_target_user_id ON adjective_selections ("targetUserId")');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_adjective_selections_adjective ON adjective_selections (adjective)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_adjective_selections_is_matched ON adjective_selections ("isMatched")');
    
    console.log('✅ adjective_selections table created successfully');
    
    // Create matches table
    console.log('📝 Creating matches table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId1" INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
        "userId2" INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
        "mutualAdjective" VARCHAR(50) NOT NULL,
        "isConnected" BOOLEAN NOT NULL DEFAULT false,
        "matchTimestamp" TIMESTAMP NOT NULL DEFAULT NOW(),
        "connectionTimestamp" TIMESTAMP,
        "iceBreakingPrompt" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Add unique constraint
    await sequelize.query(`
      ALTER TABLE matches 
      ADD CONSTRAINT unique_match 
      UNIQUE ("userId1", "userId2")
    `);
    
    // Add indexes
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_matches_user_id1 ON matches ("userId1")');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_matches_user_id2 ON matches ("userId2")');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_matches_mutual_adjective ON matches ("mutualAdjective")');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_matches_is_connected ON matches ("isConnected")');
    
    console.log('✅ matches table created successfully');
    console.log('🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

runSpecificMigrations(); 