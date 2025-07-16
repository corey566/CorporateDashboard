import { pgTable, text, serial, integer, boolean, timestamp, decimal, json, varchar, real, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// SuperAdmin table for platform management
export const superAdmins = pgTable("super_admins", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  maxUsers: integer("max_users").notNull(),
  maxAgents: integer("max_agents").notNull(),
  maxAdmins: integer("max_admins").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("LKR"),
  billingInterval: text("billing_interval").notNull(), // 'monthly', 'yearly'
  features: json("features").$type<string[]>().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Companies/Organizations table (tenants)
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  companyId: text("company_id").notNull().unique(), // Public company identifier
  connectionString: text("connection_string").notNull().unique(), // For agent registration
  logo: text("logo"),
  subdomain: text("subdomain").unique(), // For multi-tenant access
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Company subscriptions table
export const companySubscriptions = pgTable("company_subscriptions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  planId: integer("plan_id").references(() => subscriptionPlans.id).notNull(),
  status: text("status").notNull().default("active"), // 'active', 'cancelled', 'suspended', 'expired'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  autoRenew: boolean("auto_renew").notNull().default(true),
  currentUsers: integer("current_users").notNull().default(0),
  currentAgents: integer("current_agents").notNull().default(0),
  currentAdmins: integer("current_admins").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment transactions table
export const paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  subscriptionId: integer("subscription_id").references(() => companySubscriptions.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("LKR"),
  paymentMethod: text("payment_method").notNull(), // 'payhere', 'stripe', 'manual'
  transactionId: text("transaction_id").unique(),
  status: text("status").notNull().default("pending"), // 'pending', 'completed', 'failed', 'refunded'
  paymentData: json("payment_data"), // Store payment gateway response
  createdAt: timestamp("created_at").defaultNow(),
});

// Company users table (admins for each company)
export const companyUsers = pgTable("company_users", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  email: text("email").notNull(),
  password: text("password"),
  name: text("name").notNull(),
  role: text("role").notNull().default("admin"), // 'admin', 'manager'
  isActive: boolean("is_active").notNull().default(true),
  // Auth fields
  emailVerified: boolean("email_verified").notNull().default(false),
  emailVerificationToken: text("email_verification_token"),
  otpSecret: text("otp_secret"),
  otpEnabled: boolean("otp_enabled").notNull().default(false),
  // OAuth fields
  googleId: text("google_id"),
  profileImage: text("profile_image"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
});

// OTP codes table for authentication
export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => companyUsers.id).notNull(),
  code: text("code").notNull(),
  type: text("type").notNull(), // 'login', 'registration', 'password_reset'
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Company-specific teams table
export const companyTeams = pgTable("company_teams", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#2563eb"),
  volumeTarget: decimal("volume_target", { precision: 10, scale: 2 }).notNull().default("0"),
  unitsTarget: integer("units_target").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Company-specific agents table
export const companyAgents = pgTable("company_agents", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  teamId: integer("team_id").references(() => companyTeams.id).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  photo: text("photo"),
  category: text("category").notNull(),
  volumeTarget: decimal("volume_target", { precision: 10, scale: 2 }).notNull().default("0"),
  unitsTarget: integer("units_target").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  // Auth fields
  password: text("password"),
  emailVerified: boolean("email_verified").notNull().default(false),
  emailVerificationToken: text("email_verification_token"),
  canSelfReport: boolean("can_self_report").notNull().default(false),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Company-specific sales table
export const companySales = pgTable("company_sales", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  agentId: integer("agent_id").references(() => companyAgents.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  units: integer("units").notNull().default(1),
  category: text("category").notNull(),
  clientName: text("client_name").notNull(),
  description: text("description"),
  subscriptionPeriod: text("subscription_period"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Company-specific cash offers table
export const companyCashOffers = pgTable("company_cash_offers", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  reward: decimal("reward", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // 'volume' or 'units'
  target: decimal("target", { precision: 10, scale: 2 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Company-specific media slides table
export const companyMediaSlides = pgTable("company_media_slides", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'image', 'video', 'text'
  url: text("url"),
  content: text("content"),
  duration: integer("duration").notNull().default(10),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Company-specific announcements table
export const companyAnnouncements = pgTable("company_announcements", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // 'info', 'warning', 'success', 'error'
  priority: text("priority").notNull().default("medium"), // 'low', 'medium', 'high'
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Company-specific news ticker table
export const companyNewsTicker = pgTable("company_news_ticker", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  message: text("message").notNull(),
  color: text("color").notNull().default("#3b82f6"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Company-specific file uploads table
export const companyFileUploads = pgTable("company_file_uploads", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimetype: text("mimetype").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  uploadedBy: integer("uploaded_by").references(() => companyUsers.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Company-specific system settings table
export const companySystemSettings = pgTable("company_system_settings", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  key: text("key").notNull(),
  value: text("value").notNull(),
  type: text("type").notNull().default("string"), // 'string', 'number', 'boolean', 'json'
  createdAt: timestamp("created_at").defaultNow(),
});

// Company-specific sound effects table
export const companySoundEffects = pgTable("company_sound_effects", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  name: text("name").notNull(),
  eventType: text("event_type").notNull(), // 'sale', 'announcement', 'cash_offer', etc.
  audioFile: text("audio_file").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const superAdminRelations = relations(superAdmins, ({ many }) => ({
  companies: many(companies),
}));

export const subscriptionPlanRelations = relations(subscriptionPlans, ({ many }) => ({
  subscriptions: many(companySubscriptions),
}));

export const companyRelations = relations(companies, ({ many, one }) => ({
  users: many(companyUsers),
  agents: many(companyAgents),
  teams: many(companyTeams),
  sales: many(companySales),
  subscriptions: many(companySubscriptions),
  transactions: many(paymentTransactions),
  cashOffers: many(companyCashOffers),
  mediaSlides: many(companyMediaSlides),
  announcements: many(companyAnnouncements),
  newsTicker: many(companyNewsTicker),
  fileUploads: many(companyFileUploads),
  systemSettings: many(companySystemSettings),
  soundEffects: many(companySoundEffects),
}));

export const companySubscriptionRelations = relations(companySubscriptions, ({ one, many }) => ({
  company: one(companies, {
    fields: [companySubscriptions.companyId],
    references: [companies.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [companySubscriptions.planId],
    references: [subscriptionPlans.id],
  }),
  transactions: many(paymentTransactions),
}));

export const companyUserRelations = relations(companyUsers, ({ one, many }) => ({
  company: one(companies, {
    fields: [companyUsers.companyId],
    references: [companies.id],
  }),
  otpCodes: many(otpCodes),
}));

export const companyTeamRelations = relations(companyTeams, ({ one, many }) => ({
  company: one(companies, {
    fields: [companyTeams.companyId],
    references: [companies.id],
  }),
  agents: many(companyAgents),
}));

export const companyAgentRelations = relations(companyAgents, ({ one, many }) => ({
  company: one(companies, {
    fields: [companyAgents.companyId],
    references: [companies.id],
  }),
  team: one(companyTeams, {
    fields: [companyAgents.teamId],
    references: [companyTeams.id],
  }),
  sales: many(companySales),
}));

export const companySalesRelations = relations(companySales, ({ one }) => ({
  company: one(companies, {
    fields: [companySales.companyId],
    references: [companies.id],
  }),
  agent: one(companyAgents, {
    fields: [companySales.agentId],
    references: [companyAgents.id],
  }),
}));

// Zod schemas for validation
export const insertSuperAdminSchema = createInsertSchema(superAdmins).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

export const insertCompanyUserSchema = createInsertSchema(companyUsers).omit({
  id: true,
  createdAt: true,
});

export const insertCompanyTeamSchema = createInsertSchema(companyTeams).omit({
  id: true,
  createdAt: true,
});

export const insertCompanyAgentSchema = createInsertSchema(companyAgents).omit({
  id: true,
  createdAt: true,
});

export const insertCompanySaleSchema = createInsertSchema(companySales).omit({
  id: true,
  createdAt: true,
});

export const insertCompanyCashOfferSchema = createInsertSchema(companyCashOffers).omit({
  id: true,
  createdAt: true,
});

export const insertCompanyMediaSlideSchema = createInsertSchema(companyMediaSlides).omit({
  id: true,
  createdAt: true,
});

export const insertCompanyAnnouncementSchema = createInsertSchema(companyAnnouncements).omit({
  id: true,
  createdAt: true,
});

export const insertCompanyNewsTickerSchema = createInsertSchema(companyNewsTicker).omit({
  id: true,
  createdAt: true,
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  otp: z.string().optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  companyName: z.string().min(2),
  companyId: z.string().optional(),
  connectionString: z.string().optional(),
});

export const agentRegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  companyId: z.string().min(1),
  connectionString: z.string().min(1),
});

// Type exports
export type SuperAdmin = typeof superAdmins.$inferSelect;
export type InsertSuperAdmin = z.infer<typeof insertSuperAdminSchema>;

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type CompanyUser = typeof companyUsers.$inferSelect;
export type InsertCompanyUser = z.infer<typeof insertCompanyUserSchema>;

export type CompanyTeam = typeof companyTeams.$inferSelect;
export type InsertCompanyTeam = z.infer<typeof insertCompanyTeamSchema>;

export type CompanyAgent = typeof companyAgents.$inferSelect;
export type InsertCompanyAgent = z.infer<typeof insertCompanyAgentSchema>;

export type CompanySale = typeof companySales.$inferSelect;
export type InsertCompanySale = z.infer<typeof insertCompanySaleSchema>;

export type CompanyCashOffer = typeof companyCashOffers.$inferSelect;
export type InsertCompanyCashOffer = z.infer<typeof insertCompanyCashOfferSchema>;

export type CompanyMediaSlide = typeof companyMediaSlides.$inferSelect;
export type InsertCompanyMediaSlide = z.infer<typeof insertCompanyMediaSlideSchema>;

export type CompanyAnnouncement = typeof companyAnnouncements.$inferSelect;
export type InsertCompanyAnnouncement = z.infer<typeof insertCompanyAnnouncementSchema>;

export type CompanyNewsTicker = typeof companyNewsTicker.$inferSelect;
export type InsertCompanyNewsTicker = z.infer<typeof insertCompanyNewsTickerSchema>;

export type CompanySubscription = typeof companySubscriptions.$inferSelect;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type OtpCode = typeof otpCodes.$inferSelect;
export type CompanyFileUpload = typeof companyFileUploads.$inferSelect;
export type CompanySystemSetting = typeof companySystemSettings.$inferSelect;
export type CompanySoundEffect = typeof companySoundEffects.$inferSelect;