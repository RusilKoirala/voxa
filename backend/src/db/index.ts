import dotenv from 'dotenv'
dotenv.config()

import { drizzle } from "drizzle-orm/node-postgres"
import pg from "pg"
import * as schema from './schema.js'


// make a new pooolll
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
})

// make a global variable db to use
export const db = drizzle(pool, {
    schema
})