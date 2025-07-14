import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for admin authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Teams table
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#2563eb"),
  target: decimal("target", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Agents table
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  photo: text("photo"),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  category: text("category").notNull(),
  volumeTarget: decimal("volume_target", { precision: 10, scale: 2 }).notNull().default("0"),
  unitsTarget: integer("units_target").notNull().default(0),
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
  createdAt: timestamp("created_at").defaultNow(),
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
