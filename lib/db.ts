import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const dbInstance = process.env.DATABASE_URL 
  ? drizzle(neon(process.env.DATABASE_URL))
  : null;

// @ts-ignore - handle null case
export const db = dbInstance;