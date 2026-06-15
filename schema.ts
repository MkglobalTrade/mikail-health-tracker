import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Glucose readings table
export const glucoseReadings = mysqlTable("glucose_readings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  value: decimal("value", { precision: 5, scale: 1 }).notNull(), // mg/dL
  readingDate: timestamp("readingDate").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GlucoseReading = typeof glucoseReadings.$inferSelect;
export type InsertGlucoseReading = typeof glucoseReadings.$inferInsert;

// Blood pressure readings table
export const bloodPressureReadings = mysqlTable("blood_pressure_readings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  systolic: int("systolic").notNull(), // mmHg
  diastolic: int("diastolic").notNull(), // mmHg
  pulse: int("pulse").notNull(), // bpm
  readingDate: timestamp("readingDate").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BloodPressureReading = typeof bloodPressureReadings.$inferSelect;
export type InsertBloodPressureReading = typeof bloodPressureReadings.$inferInsert;

// Medications table
export const medications = mysqlTable("medications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  dosage: varchar("dosage", { length: 255 }).notNull(),
  frequency: varchar("frequency", { length: 255 }).notNull(), // e.g., "once daily", "twice daily"
  schedule: mysqlEnum("schedule", ["day", "night", "both"]).notNull(),
  notes: text("notes"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  isActive: int("isActive").default(1).notNull(), // 1 = active, 0 = inactive
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Medication = typeof medications.$inferSelect;
export type InsertMedication = typeof medications.$inferInsert;

// Medication doses (tracking when doses are taken)
export const medicationDoses = mysqlTable("medication_doses", {
  id: int("id").autoincrement().primaryKey(),
  medicationId: int("medicationId").notNull(),
  userId: int("userId").notNull(),
  scheduledDate: timestamp("scheduledDate").notNull(),
  takenAt: timestamp("takenAt"), // null if not taken yet
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MedicationDose = typeof medicationDoses.$inferSelect;
export type InsertMedicationDose = typeof medicationDoses.$inferInsert;

// Lab documents table
export const labDocuments = mysqlTable("lab_documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull(), // S3 key
  fileUrl: text("fileUrl").notNull(), // S3 URL
  fileType: varchar("fileType", { length: 50 }).notNull(), // pdf, jpg, png
  uploadDate: timestamp("uploadDate").notNull(),
  extractedData: text("extractedData"), // JSON string of extracted health data
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LabDocument = typeof labDocuments.$inferSelect;
export type InsertLabDocument = typeof labDocuments.$inferInsert;

// Health news articles table
export const healthNewsArticles = mysqlTable("health_news_articles", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  content: text("content"),
  source: varchar("source", { length: 255 }).notNull(),
  sourceUrl: text("sourceUrl"),
  category: varchar("category", { length: 100 }).notNull(), // longevity, diabetes, health, etc.
  publishedDate: timestamp("publishedDate").notNull(),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HealthNewsArticle = typeof healthNewsArticles.$inferSelect;
export type InsertHealthNewsArticle = typeof healthNewsArticles.$inferInsert;

// Chat messages table for AI Doctor
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  context: text("context"), // JSON string of health data context
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;