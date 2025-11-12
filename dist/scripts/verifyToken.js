"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzUzODc0MzA3LCJleHAiOjE3NTQzMDYzMDd9.YjQoDPFDGPT6rfOHnr55yV2zTtsXvKGaC1-ilOsz6vY';
function verifyToken() {
    try {
        const decoded = jsonwebtoken_1.default.decode(TOKEN);
        console.log('🔍 Token decoded successfully');
        console.log('User ID:', decoded.sub);
        console.log('Username:', decoded.username);
        console.log('Email:', decoded.email);
        console.log('Issued at:', new Date(decoded.iat * 1000));
        console.log('Expires at:', new Date(decoded.exp * 1000));
        const now = Math.floor(Date.now() / 1000);
        console.log('Current time:', now);
        console.log('Token expired:', decoded.exp < now);
    }
    catch (error) {
        console.error('❌ Error decoding token:', error);
    }
}
verifyToken();
