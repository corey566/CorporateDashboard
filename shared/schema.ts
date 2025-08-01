import { pgTable, text, serial, integer, boolean, timestamp, decimal, json, varchar, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for admin authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull().default("#3B82F6"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Teams table
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#2563eb"),
  volumeTarget: decimal("volume_target", { precision: 10, scale: 2 }).notNull().default("0"),
  unitsTarget: integer("units_target").notNull().default(0),
  targetCycle: text("target_cycle").notNull().default("monthly"), // 'monthly' or 'yearly'
  resetDay: integer("reset_day").notNull().default(1), // Day of month (1-31) for monthly, day of year (1-366) for yearly
  resetMonth: integer("reset_month").default(1), // Month (1-12) for yearly cycles only
  createdAt: timestamp("created_at").defaultNow(),
});

// Agents table
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  photo: text("photo"),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  category: text("category").notNull(),
  volumeTarget: decimal("volume_target", { precision: 10, scale: 2 }).notNull().default("0"),
  unitsTarget: integer("units_target").notNull().default(0),
  targetCycle: text("target_cycle").notNull().default("monthly"), // 'monthly' or 'yearly'
  resetDay: integer("reset_day").notNull().default(1), // Day of month (1-31) for monthly, day of year (1-366) for yearly
  resetMonth: integer("reset_month").default(1), // Month (1-12) for yearly cycles only
  isActive: boolean("is_active").notNull().default(true),
  // Mobile auth fields
  username: text("username").unique(),
  password: text("password"),
  canSelfReport: boolean("can_self_report").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sales table
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").references(() => agents.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  units: integer("units").notNull().default(1),
  category: text("category").notNull(),
  clientName: text("client_name").notNull(),
  description: text("description"),
  subscriptionPeriod: text("subscription_period"),
  cycleStartDate: timestamp("cycle_start_date").notNull(), // Start date of the target cycle when this sale was made
  cycleEndDate: timestamp("cycle_end_date").notNull(), // End date of the target cycle when this sale was made
  createdAt: timestamp("created_at").defaultNow(),
});

// Target History table for agents
export const agentTargetHistory = pgTable("agent_target_history", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").references(() => agents.id).notNull(),
  cycleStartDate: timestamp("cycle_start_date").notNull(),
  cycleEndDate: timestamp("cycle_end_date").notNull(),
  targetCycle: text("target_cycle").notNull(), // 'monthly' or 'yearly'
  volumeTarget: decimal("volume_target", { precision: 10, scale: 2 }).notNull(),
  unitsTarget: integer("units_target").notNull(),
  volumeAchieved: decimal("volume_achieved", { precision: 10, scale: 2 }).notNull().default("0"),
  unitsAchieved: integer("units_achieved").notNull().default(0),
  totalSales: integer("total_sales").notNull().default(0),
  isCompleted: boolean("is_completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Target History table for teams
export const teamTargetHistory = pgTable("team_target_history", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  cycleStartDate: timestamp("cycle_start_date").notNull(),
  cycleEndDate: timestamp("cycle_end_date").notNull(),
  targetCycle: text("target_cycle").notNull(), // 'monthly' or 'yearly'
  volumeTarget: decimal("volume_target", { precision: 10, scale: 2 }).notNull(),
  unitsTarget: integer("units_target").notNull(),
  volumeAchieved: decimal("volume_achieved", { precision: 10, scale: 2 }).notNull().default("0"),
  unitsAchieved: integer("units_achieved").notNull().default(0),
  totalSales: integer("total_sales").notNull().default(0),
  isCompleted: boolean("is_completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cash offers table
export const cashOffers = pgTable("cash_offers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  reward: decimal("reward", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // 'volume' or 'units'
  target: decimal("target", { precision: 10, scale: 2 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Media slides table
export const mediaSlides = pgTable("media_slides", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'image', 'video', 'text'
  url: text("url"),
  content: text("content"),
  duration: integer("duration").notNull().default(10), // Duration in seconds
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Announcements table
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'general', 'birthday', 'emergency'
  title: text("title").notNull(),
  message: text("message").notNull(),
  soundUrl: text("sound_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// News ticker table
export const newsTicker = pgTable("news_ticker", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// File uploads table
export const fileUploads = pgTable("file_uploads", {
  id: serial("id").primaryKey(),
  originalName: text("original_name").notNull(),
  filename: text("filename").notNull(),
  mimetype: text("mimetype").notNull(),
  size: integer("size").notNull(),
  path: text("path").notNull(),
  type: text("type").notNull(), // 'image', 'audio', 'video'
  createdAt: timestamp("created_at").defaultNow(),
});

// System settings table
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  type: varchar("type", { length: 50 }).notNull().default("string"), // 'string', 'number', 'boolean', 'json'
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sound effects table for different event types
export const soundEffects = pgTable("sound_effects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  eventType: text("event_type").notNull(), // 'sale', 'announcement', 'cash_offer', 'birthday', 'emergency'
  fileUrl: text("file_url").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  volume: real("volume").notNull().default(0.5), // 0.0 to 1.0
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const teamsRelations = relations(teams, ({ many }) => ({
  agents: many(agents),
  targetHistory: many(teamTargetHistory),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  agents: many(agents),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  team: one(teams, {
    fields: [agents.teamId],
    references: [teams.id],
  }),
  category: one(categories, {
    fields: [agents.categoryId],
    references: [categories.id],
  }),
  sales: many(sales),
  targetHistory: many(agentTargetHistory),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  agent: one(agents, {
    fields: [sales.agentId],
    references: [agents.id],
  }),
}));

export const agentTargetHistoryRelations = relations(agentTargetHistory, ({ one }) => ({
  agent: one(agents, {
    fields: [agentTargetHistory.agentId],
    references: [agents.id],
  }),
}));

export const teamTargetHistoryRelations = relations(teamTargetHistory, ({ one }) => ({
  team: one(teams, {
    fields: [teamTargetHistory.teamId],
    references: [teams.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
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

export const insertAgentTargetHistorySchema = createInsertSchema(agentTargetHistory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamTargetHistorySchema = createInsertSchema(teamTargetHistory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
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
export type AgentTargetHistory = typeof agentTargetHistory.$inferSelect;
export type InsertAgentTargetHistory = z.infer<typeof insertAgentTargetHistorySchema>;
export type TeamTargetHistory = typeof teamTargetHistory.$inferSelect;
export type InsertTeamTargetHistory = z.infer<typeof insertTeamTargetHistorySchema>;
