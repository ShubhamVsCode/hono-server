import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const connectToDb = (databaseUrl: string) => {
  const sql = neon(databaseUrl);
  return drizzle(sql);
};

export default connectToDb;
