import { cors } from 'hono/cors';

const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['https://eterecitizen.io', 'http://localhost:3000', 'http://localhost:3001'];

export const corsMiddleware = cors({
  origin: ALLOWED_ORIGINS,
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  maxAge: 86400,
});
