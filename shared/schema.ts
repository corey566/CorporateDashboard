import { sqliteTable, text, integer, blob, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for admin authentication
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Teams table
export const teams = sqliteTable("teams", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  color: text("color").notNull().default("#2563eb"),
  volumeTarget: real("volume_target").notNull().default(0),
  unitsTarget: integer("units_target").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(Date.now()),
});

// Agents table
export const agents = sqliteTable("agents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  photo: text("photo"),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  category: text("category").notNull(),
  volumeTarget: real("volume_target").notNull().default(0),
  unitsTarget: integer("units_target").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  // Mobile auth fields
  username: text("username").unique(),
  password: text("password"),
  canSelfReport: integer("can_self_report", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(Date.now()),
});

// Sales table
export const sales = sqliteTable("sales", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  agentId: integer("agent_id").references(() => agents.id).notNull(),
  amount: real("amount").notNull(),
  units: integer("units").notNull().default(1),
  category: text("category").notNull(),
  clientName: text("client_name").notNull(),
  description: text("description"),
  subscriptionPeriod: text("subscription_period"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(Date.now()),
});

// Cash offers table
export const cashOffers = sqliteTable("cash_offers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  reward: real("reward").notNull(),
  type: text("type").notNull(), // 'volume' or 'units'
  target: real("target").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(Date.now()),
});

// Media slides table
export const mediaSlides = sqliteTable("media_slides", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'image', 'video', 'text'
  url: text("url"),
  content: text("content"),
  duration: integer("duration").notNull().default(10), // Duration in seconds
  order: integer("order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(Date.now()),
});

// Announcements table
export const announcements = sqliteTable("announcements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(), // 'general', 'birthday', 'emergency'
  title: text("title").notNull(),
  message: text("message").notNull(),
  soundUrl: text("sound_url"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(Date.now()),
});

// News ticker table
export const newsTicker = sqliteTable("news_ticker", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  message: text("message").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(Date.now()),
});

// File uploads table
export const fileUploads = sqliteTable("file_uploads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  originalName: text("original_name").notNull(),
  filename: text("filename").notNull(),
  mimetype: text("mimetype").notNull(),
  size: integer("size").notNull(),
  path: text("path").notNull(),
  type: text("type").notNull(), // 'image', 'audio', 'video'
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(Date.now()),
});

// System settings table
export const systemSettings = sqliteTable("system_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  type: text("type").notNull().default("string"), // 'string', 'number', 'boolean', 'json'
  description: text("description"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(Date.now()),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(Date.now()),
});

// Sound effects table for different event types
export const soundEffects = sqliteTable("sound_effects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  eventType: text("event_type").notNull(), // 'sale', 'announcement', 'cash_offer', 'birthday', 'emergency'
  fileUrl: text("file_url").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  volume: real("volume").notNull().default(0.5), // 0.0 to 1.0
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(Date.now()),
});

// Relations
export const teamsRelations = relations(teams, ({ many }) => ({
  agents: many(agents),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  team: one(teams, {
    fields: [agents.teamId],
    references: [teams.id],
  }),
  sales: many(sales),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  agent: one(agents, {
    fields: [sales.agentId],
    references: [agents.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
});

// Mobile agent login schema
export const agentLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
});

export const insertCashOfferSchema = createInsertSchema(cashOffers).omit({
  id: true,
  createdAt: true,
});

export const insertMediaSlideSchema = createInsertSchema(mediaSlides).omit({
  id: true,
  createdAt: true,
}).extend({
  duration: z.number().min(5).max(60).default(10), // 5-60 seconds
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
});

export const insertNewsTickerSchema = createInsertSchema(newsTicker).omit({
  id: true,
  createdAt: true,
});

export const insertFileUploadSchema = createInsertSchema(fileUploads).omit({
  id: true,
  createdAt: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSoundEffectSchema = createInsertSchema(soundEffects).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type CashOffer = typeof cashOffers.$inferSelect;
export type InsertCashOffer = z.infer<typeof insertCashOfferSchema>;
export type MediaSlide = typeof mediaSlides.$inferSelect;
export type InsertMediaSlide = z.infer<typeof insertMediaSlideSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type NewsTicker = typeof newsTicker.$inferSelect;
export type InsertNewsTicker = z.infer<typeof insertNewsTickerSchema>;
export type FileUpload = typeof fileUploads.$inferSelect;
export type InsertFileUpload = z.infer<typeof insertFileUploadSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type SoundEffect = typeof soundEffects.$inferSelect;
export type InsertSoundEffect = z.infer<typeof insertSoundEffectSchema>;
