// Mongoose doesn't need explicit associations like Sequelize
// References are handled through ObjectId refs in the schemas
export function setupAssociations() {
  console.log('✅ Mongoose models loaded - associations handled via ObjectId refs');
}