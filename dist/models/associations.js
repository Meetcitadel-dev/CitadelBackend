"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAssociations = setupAssociations;
// Mongoose doesn't need explicit associations like Sequelize
// References are handled through ObjectId refs in the schemas
function setupAssociations() {
    console.log('✅ Mongoose models loaded - associations handled via ObjectId refs');
}
