import { eq, and, sql, desc, asc, count, sum, avg } from "drizzle-orm";
import { db, pool } from "./db";
import * as schema from "@shared/saas-schema";
import { superAdmins } from "@shared/saas-schema";
import { systemSettings } from "@shared/schema";
import { hashPassword, verifyPassword, generateCompanyId, generateConnectionString, generateRandomToken } from "./auth-utils";
import { addDays, addMonths, addYears } from "date-fns";

// Company management
export class CompanyService {
  async createCompany(companyData: schema.InsertCompany): Promise<schema.Company> {
    const companyId = generateCompanyId();
    const connectionString = generateConnectionString();
    
    const [company] = await db
      .insert(schema.companies)
      .values({
        ...companyData,
        companyId,
        connectionString,
      })
      .returning();
    
    return company;
  }

  async getCompanyById(id: number): Promise<schema.Company | undefined> {
    const [company] = await db
      .select()
      .from(schema.companies)
      .where(eq(schema.companies.id, id));
    return company;
  }

  async getCompanyByCompanyId(companyId: string): Promise<schema.Company | undefined> {
    const [company] = await db
      .select()
      .from(schema.companies)
      .where(eq(schema.companies.companyId, companyId));
    return company;
  }

  async getCompanyByConnectionString(connectionString: string): Promise<schema.Company | undefined> {
    const [company] = await db
      .select()
      .from(schema.companies)
      .where(eq(schema.companies.connectionString, connectionString));
    return company;
  }

  async updateCompany(id: number, updates: Partial<schema.InsertCompany>): Promise<schema.Company> {
    const [company] = await db
      .update(schema.companies)
      .set(updates)
      .where(eq(schema.companies.id, id))
      .returning();
    return company;
  }

  async deleteCompany(id: number): Promise<void> {
    await db
      .update(schema.companies)
      .set({ isActive: false })
      .where(eq(schema.companies.id, id));
  }

  async getAllCompanies(): Promise<schema.Company[]> {
    return await db.select().from(schema.companies).where(eq(schema.companies.isActive, true));
  }
}

// Subscription management
export class SubscriptionService {
  async createSubscriptionPlan(planData: schema.InsertSubscriptionPlan): Promise<schema.SubscriptionPlan> {
    const [plan] = await db
      .insert(schema.subscriptionPlans)
      .values(planData)
      .returning();
    return plan;
  }

  async getSubscriptionPlans(): Promise<schema.SubscriptionPlan[]> {
    return await db
      .select()
      .from(schema.subscriptionPlans)
      .where(eq(schema.subscriptionPlans.isActive, true));
  }

  async createCompanySubscription(
    companyId: number,
    planId: number,
    billingInterval: string
  ): Promise<schema.CompanySubscription> {
    const plan = await db
      .select()
      .from(schema.subscriptionPlans)
      .where(eq(schema.subscriptionPlans.id, planId))
      .limit(1);

    if (!plan[0]) {
      throw new Error("Subscription plan not found");
    }

    const startDate = new Date();
    let endDate: Date;

    if (billingInterval === 'monthly') {
      endDate = addMonths(startDate, 1);
    } else if (billingInterval === 'yearly') {
      endDate = addYears(startDate, 1);
    } else {
      throw new Error("Invalid billing interval");
    }

    const [subscription] = await db
      .insert(schema.companySubscriptions)
      .values({
        companyId,
        planId,
        startDate,
        endDate,
        status: 'active',
      })
      .returning();

    return subscription;
  }

  async getCompanySubscription(companyId: number): Promise<schema.CompanySubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(schema.companySubscriptions)
      .where(and(
        eq(schema.companySubscriptions.companyId, companyId),
        eq(schema.companySubscriptions.status, 'active')
      ))
      .orderBy(desc(schema.companySubscriptions.createdAt))
      .limit(1);

    return subscription;
  }

  async updateSubscriptionUsage(companyId: number, usage: {
    currentUsers?: number;
    currentAgents?: number;
    currentAdmins?: number;
  }): Promise<void> {
    await db
      .update(schema.companySubscriptions)
      .set(usage)
      .where(and(
        eq(schema.companySubscriptions.companyId, companyId),
        eq(schema.companySubscriptions.status, 'active')
      ));
  }

  async cancelSubscription(companyId: number): Promise<void> {
    await db
      .update(schema.companySubscriptions)
      .set({ status: 'cancelled' })
      .where(and(
        eq(schema.companySubscriptions.companyId, companyId),
        eq(schema.companySubscriptions.status, 'active')
      ));
  }

  async isWithinLimits(companyId: number): Promise<{
    withinLimits: boolean;
    currentUsage: any;
    limits: any;
  }> {
    const subscription = await this.getCompanySubscription(companyId);
    if (!subscription) {
      return { withinLimits: false, currentUsage: null, limits: null };
    }

    const plan = await db
      .select()
      .from(schema.subscriptionPlans)
      .where(eq(schema.subscriptionPlans.id, subscription.planId))
      .limit(1);

    const currentUsage = {
      users: subscription.currentUsers,
      agents: subscription.currentAgents,
      admins: subscription.currentAdmins,
    };

    const limits = {
      users: plan[0].maxUsers,
      agents: plan[0].maxAgents,
      admins: plan[0].maxAdmins,
    };

    const withinLimits = 
      currentUsage.users <= limits.users &&
      currentUsage.agents <= limits.agents &&
      currentUsage.admins <= limits.admins;

    return { withinLimits, currentUsage, limits };
  }
}

// User management
export class UserService {
  async createCompanyUser(userData: schema.InsertCompanyUser): Promise<schema.CompanyUser> {
    const hashedPassword = userData.password ? await hashPassword(userData.password) : null;
    const emailVerificationToken = generateRandomToken();

    const [user] = await db
      .insert(schema.companyUsers)
      .values({
        ...userData,
        password: hashedPassword,
        emailVerificationToken,
      })
      .returning();

    return user;
  }

  async getUserByEmail(email: string): Promise<schema.CompanyUser | undefined> {
    const [user] = await db
      .select()
      .from(schema.companyUsers)
      .where(eq(schema.companyUsers.email, email));
    return user;
  }

  async getUserById(id: number): Promise<schema.CompanyUser | undefined> {
    const [user] = await db
      .select()
      .from(schema.companyUsers)
      .where(eq(schema.companyUsers.id, id));
    return user;
  }

  async verifyUserPassword(email: string, password: string): Promise<schema.CompanyUser | null> {
    const user = await this.getUserByEmail(email);
    if (!user || !user.password) return null;

    const isValid = await verifyPassword(password, user.password);
    return isValid ? user : null;
  }

  async updateUser(id: number, updates: Partial<schema.InsertCompanyUser>): Promise<schema.CompanyUser> {
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    const [user] = await db
      .update(schema.companyUsers)
      .set(updates)
      .where(eq(schema.companyUsers.id, id))
      .returning();

    return user;
  }

  async verifyEmail(token: string): Promise<boolean> {
    const [user] = await db
      .update(schema.companyUsers)
      .set({ 
        emailVerified: true,
        emailVerificationToken: null,
      })
      .where(eq(schema.companyUsers.emailVerificationToken, token))
      .returning();

    return !!user;
  }

  async getCompanyUsers(companyId: number): Promise<schema.CompanyUser[]> {
    return await db
      .select()
      .from(schema.companyUsers)
      .where(and(
        eq(schema.companyUsers.companyId, companyId),
        eq(schema.companyUsers.isActive, true)
      ));
  }
}

// Multi-tenant data access
export class TenantDataService {
  constructor(private companyId: number) {}

  // Teams
  async getTeams(): Promise<schema.CompanyTeam[]> {
    return await db
      .select()
      .from(schema.companyTeams)
      .where(and(
        eq(schema.companyTeams.companyId, this.companyId),
        eq(schema.companyTeams.isActive, true)
      ));
  }

  async createTeam(teamData: schema.InsertCompanyTeam): Promise<schema.CompanyTeam> {
    const [team] = await db
      .insert(schema.companyTeams)
      .values({
        ...teamData,
        companyId: this.companyId,
      })
      .returning();
    return team;
  }

  async updateTeam(id: number, updates: Partial<schema.InsertCompanyTeam>): Promise<schema.CompanyTeam> {
    const [team] = await db
      .update(schema.companyTeams)
      .set(updates)
      .where(and(
        eq(schema.companyTeams.id, id),
        eq(schema.companyTeams.companyId, this.companyId)
      ))
      .returning();
    return team;
  }

  async deleteTeam(id: number): Promise<void> {
    await db
      .update(schema.companyTeams)
      .set({ isActive: false })
      .where(and(
        eq(schema.companyTeams.id, id),
        eq(schema.companyTeams.companyId, this.companyId)
      ));
  }

  // Agents
  async getAgents(): Promise<schema.CompanyAgent[]> {
    return await db
      .select()
      .from(schema.companyAgents)
      .where(and(
        eq(schema.companyAgents.companyId, this.companyId),
        eq(schema.companyAgents.isActive, true)
      ));
  }

  async createAgent(agentData: schema.InsertCompanyAgent): Promise<schema.CompanyAgent> {
    const hashedPassword = agentData.password ? await hashPassword(agentData.password) : null;
    const emailVerificationToken = generateRandomToken();

    const [agent] = await db
      .insert(schema.companyAgents)
      .values({
        ...agentData,
        companyId: this.companyId,
        password: hashedPassword,
        emailVerificationToken,
      })
      .returning();
    return agent;
  }

  async updateAgent(id: number, updates: Partial<schema.InsertCompanyAgent>): Promise<schema.CompanyAgent> {
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    const [agent] = await db
      .update(schema.companyAgents)
      .set(updates)
      .where(and(
        eq(schema.companyAgents.id, id),
        eq(schema.companyAgents.companyId, this.companyId)
      ))
      .returning();
    return agent;
  }

  async deleteAgent(id: number): Promise<void> {
    await db
      .update(schema.companyAgents)
      .set({ isActive: false })
      .where(and(
        eq(schema.companyAgents.id, id),
        eq(schema.companyAgents.companyId, this.companyId)
      ));
  }

  // Sales
  async getSales(): Promise<schema.CompanySale[]> {
    return await db
      .select()
      .from(schema.companySales)
      .where(eq(schema.companySales.companyId, this.companyId))
      .orderBy(desc(schema.companySales.createdAt));
  }

  async createSale(saleData: schema.InsertCompanySale): Promise<schema.CompanySale> {
    const [sale] = await db
      .insert(schema.companySales)
      .values({
        ...saleData,
        companyId: this.companyId,
      })
      .returning();
    return sale;
  }

  async updateSale(id: number, updates: Partial<schema.InsertCompanySale>): Promise<schema.CompanySale> {
    const [sale] = await db
      .update(schema.companySales)
      .set(updates)
      .where(and(
        eq(schema.companySales.id, id),
        eq(schema.companySales.companyId, this.companyId)
      ))
      .returning();
    return sale;
  }

  async deleteSale(id: number): Promise<void> {
    await db
      .delete(schema.companySales)
      .where(and(
        eq(schema.companySales.id, id),
        eq(schema.companySales.companyId, this.companyId)
      ));
  }

  // Cash Offers
  async getCashOffers(): Promise<schema.CompanyCashOffer[]> {
    return await db
      .select()
      .from(schema.companyCashOffers)
      .where(and(
        eq(schema.companyCashOffers.companyId, this.companyId),
        eq(schema.companyCashOffers.isActive, true),
        sql`${schema.companyCashOffers.expiresAt} > NOW()`
      ));
  }

  async createCashOffer(offerData: schema.InsertCompanyCashOffer): Promise<schema.CompanyCashOffer> {
    const [offer] = await db
      .insert(schema.companyCashOffers)
      .values({
        ...offerData,
        companyId: this.companyId,
      })
      .returning();
    return offer;
  }

  async updateCashOffer(id: number, updates: Partial<schema.InsertCompanyCashOffer>): Promise<schema.CompanyCashOffer> {
    const [offer] = await db
      .update(schema.companyCashOffers)
      .set(updates)
      .where(and(
        eq(schema.companyCashOffers.id, id),
        eq(schema.companyCashOffers.companyId, this.companyId)
      ))
      .returning();
    return offer;
  }

  async deleteCashOffer(id: number): Promise<void> {
    await db
      .update(schema.companyCashOffers)
      .set({ isActive: false })
      .where(and(
        eq(schema.companyCashOffers.id, id),
        eq(schema.companyCashOffers.companyId, this.companyId)
      ));
  }

  // Media Slides
  async getMediaSlides(): Promise<schema.CompanyMediaSlide[]> {
    return await db
      .select()
      .from(schema.companyMediaSlides)
      .where(and(
        eq(schema.companyMediaSlides.companyId, this.companyId),
        eq(schema.companyMediaSlides.isActive, true)
      ))
      .orderBy(schema.companyMediaSlides.order);
  }

  async createMediaSlide(slideData: schema.InsertCompanyMediaSlide): Promise<schema.CompanyMediaSlide> {
    const [slide] = await db
      .insert(schema.companyMediaSlides)
      .values({
        ...slideData,
        companyId: this.companyId,
      })
      .returning();
    return slide;
  }

  async updateMediaSlide(id: number, updates: Partial<schema.InsertCompanyMediaSlide>): Promise<schema.CompanyMediaSlide> {
    const [slide] = await db
      .update(schema.companyMediaSlides)
      .set(updates)
      .where(and(
        eq(schema.companyMediaSlides.id, id),
        eq(schema.companyMediaSlides.companyId, this.companyId)
      ))
      .returning();
    return slide;
  }

  async deleteMediaSlide(id: number): Promise<void> {
    await db
      .update(schema.companyMediaSlides)
      .set({ isActive: false })
      .where(and(
        eq(schema.companyMediaSlides.id, id),
        eq(schema.companyMediaSlides.companyId, this.companyId)
      ));
  }

  // Announcements
  async getAnnouncements(): Promise<schema.CompanyAnnouncement[]> {
    return await db
      .select()
      .from(schema.companyAnnouncements)
      .where(and(
        eq(schema.companyAnnouncements.companyId, this.companyId),
        eq(schema.companyAnnouncements.isActive, true)
      ))
      .orderBy(desc(schema.companyAnnouncements.createdAt));
  }

  async createAnnouncement(announcementData: schema.InsertCompanyAnnouncement): Promise<schema.CompanyAnnouncement> {
    const [announcement] = await db
      .insert(schema.companyAnnouncements)
      .values({
        ...announcementData,
        companyId: this.companyId,
      })
      .returning();
    return announcement;
  }

  async updateAnnouncement(id: number, updates: Partial<schema.InsertCompanyAnnouncement>): Promise<schema.CompanyAnnouncement> {
    const [announcement] = await db
      .update(schema.companyAnnouncements)
      .set(updates)
      .where(and(
        eq(schema.companyAnnouncements.id, id),
        eq(schema.companyAnnouncements.companyId, this.companyId)
      ))
      .returning();
    return announcement;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    await db
      .update(schema.companyAnnouncements)
      .set({ isActive: false })
      .where(and(
        eq(schema.companyAnnouncements.id, id),
        eq(schema.companyAnnouncements.companyId, this.companyId)
      ));
  }

  // News Ticker
  async getNewsTicker(): Promise<schema.CompanyNewsTicker[]> {
    return await db
      .select()
      .from(schema.companyNewsTicker)
      .where(and(
        eq(schema.companyNewsTicker.companyId, this.companyId),
        eq(schema.companyNewsTicker.isActive, true)
      ))
      .orderBy(desc(schema.companyNewsTicker.createdAt));
  }

  async createNewsTicker(tickerData: schema.InsertCompanyNewsTicker): Promise<schema.CompanyNewsTicker> {
    const [ticker] = await db
      .insert(schema.companyNewsTicker)
      .values({
        ...tickerData,
        companyId: this.companyId,
      })
      .returning();
    return ticker;
  }

  async updateNewsTicker(id: number, updates: Partial<schema.InsertCompanyNewsTicker>): Promise<schema.CompanyNewsTicker> {
    const [ticker] = await db
      .update(schema.companyNewsTicker)
      .set(updates)
      .where(and(
        eq(schema.companyNewsTicker.id, id),
        eq(schema.companyNewsTicker.companyId, this.companyId)
      ))
      .returning();
    return ticker;
  }

  async deleteNewsTicker(id: number): Promise<void> {
    await db
      .update(schema.companyNewsTicker)
      .set({ isActive: false })
      .where(and(
        eq(schema.companyNewsTicker.id, id),
        eq(schema.companyNewsTicker.companyId, this.companyId)
      ));
  }

  // System Settings
  async getSystemSettings(): Promise<schema.CompanySystemSetting[]> {
    return await db
      .select()
      .from(schema.companySystemSettings)
      .where(eq(schema.companySystemSettings.companyId, this.companyId));
  }

  async getSystemSetting(key: string): Promise<schema.CompanySystemSetting | undefined> {
    const [setting] = await db
      .select()
      .from(schema.companySystemSettings)
      .where(and(
        eq(schema.companySystemSettings.companyId, this.companyId),
        eq(schema.companySystemSettings.key, key)
      ));
    return setting;
  }

  async updateSystemSetting(key: string, value: string): Promise<schema.CompanySystemSetting> {
    const [setting] = await db
      .insert(schema.companySystemSettings)
      .values({
        companyId: this.companyId,
        key,
        value,
      })
      .onConflictDoUpdate({
        target: [schema.companySystemSettings.companyId, schema.companySystemSettings.key],
        set: { value },
      })
      .returning();
    return setting;
  }

  // Sound Effects
  async getSoundEffects(): Promise<schema.CompanySoundEffect[]> {
    return await db
      .select()
      .from(schema.companySoundEffects)
      .where(and(
        eq(schema.companySoundEffects.companyId, this.companyId),
        eq(schema.companySoundEffects.isActive, true)
      ));
  }

  async getSoundEffectByEvent(eventType: string): Promise<schema.CompanySoundEffect | undefined> {
    const [effect] = await db
      .select()
      .from(schema.companySoundEffects)
      .where(and(
        eq(schema.companySoundEffects.companyId, this.companyId),
        eq(schema.companySoundEffects.eventType, eventType),
        eq(schema.companySoundEffects.isActive, true)
      ));
    return effect;
  }

  async createSoundEffect(effectData: Omit<schema.CompanySoundEffect, 'id' | 'companyId' | 'createdAt'>): Promise<schema.CompanySoundEffect> {
    const [effect] = await db
      .insert(schema.companySoundEffects)
      .values({
        ...effectData,
        companyId: this.companyId,
      })
      .returning();
    return effect;
  }

  // Dashboard data
  async getDashboardData(): Promise<any> {
    const agents = await this.getAgents();
    const teams = await this.getTeams();
    const sales = await this.getSales();
    const cashOffers = await this.getCashOffers();
    const announcements = await this.getAnnouncements();
    const newsTicker = await this.getNewsTicker();
    const mediaSlides = await this.getMediaSlides();

    return {
      agents,
      teams,
      sales,
      cashOffers,
      announcements,
      newsTicker,
      mediaSlides,
    };
  }
}

// Payment service
export class PaymentService {
  async createPaymentTransaction(transactionData: {
    companyId: number;
    subscriptionId: number;
    amount: number;
    currency: string;
    paymentMethod: string;
    transactionId?: string;
    paymentData?: any;
  }): Promise<schema.PaymentTransaction> {
    const [transaction] = await db
      .insert(schema.paymentTransactions)
      .values({
        ...transactionData,
        status: 'pending',
      })
      .returning();
    return transaction;
  }

  async updatePaymentStatus(transactionId: string, status: string, paymentData?: any): Promise<schema.PaymentTransaction> {
    const [transaction] = await db
      .update(schema.paymentTransactions)
      .set({ status, paymentData })
      .where(eq(schema.paymentTransactions.transactionId, transactionId))
      .returning();
    return transaction;
  }

  async getPaymentsByCompany(companyId: number): Promise<schema.PaymentTransaction[]> {
    return await db
      .select()
      .from(schema.paymentTransactions)
      .where(eq(schema.paymentTransactions.companyId, companyId))
      .orderBy(desc(schema.paymentTransactions.createdAt));
  }
}

// SuperAdmin service
export class SuperAdminService {
  async createSuperAdmin(adminData: schema.InsertSuperAdmin): Promise<schema.SuperAdmin> {
    const hashedPassword = await hashPassword(adminData.password);
    
    const [admin] = await db
      .insert(superAdmins)
      .values({
        ...adminData,
        password: hashedPassword,
      })
      .returning();
    return admin;
  }

  async getSuperAdminByEmail(email: string): Promise<schema.SuperAdmin | undefined> {
    try {
      const result = await pool.query('SELECT * FROM super_admins WHERE email = $1 LIMIT 1', [email]);
      return result.rows[0] as schema.SuperAdmin;
    } catch (error) {
      console.error('Error fetching super admin:', error);
      return undefined;
    }
  }

  async verifySuperAdminPassword(email: string, password: string): Promise<schema.SuperAdmin | null> {
    const admin = await this.getSuperAdminByEmail(email);
    if (!admin) return null;

    const isValid = await verifyPassword(password, admin.password);
    return isValid ? admin : null;
  }

  async getAllCompaniesWithStats(): Promise<any[]> {
    const companies = await db
      .select({
        id: schema.companies.id,
        name: schema.companies.name,
        email: schema.companies.email,
        companyId: schema.companies.companyId,
        isActive: schema.companies.isActive,
        createdAt: schema.companies.createdAt,
      })
      .from(schema.companies);

    const companiesWithStats = await Promise.all(
      companies.map(async (company) => {
        const subscription = await db
          .select()
          .from(schema.companySubscriptions)
          .where(eq(schema.companySubscriptions.companyId, company.id))
          .orderBy(desc(schema.companySubscriptions.createdAt))
          .limit(1);

        const userCount = await db
          .select({ count: count() })
          .from(schema.companyUsers)
          .where(eq(schema.companyUsers.companyId, company.id));

        const agentCount = await db
          .select({ count: count() })
          .from(schema.companyAgents)
          .where(eq(schema.companyAgents.companyId, company.id));

        return {
          ...company,
          subscription: subscription[0] || null,
          userCount: userCount[0].count,
          agentCount: agentCount[0].count,
        };
      })
    );

    return companiesWithStats;
  }
}

// System settings service
export class SystemSettingsService {
  async getSystemSettings(): Promise<any[]> {
    try {
      console.log('Fetching system settings from database...');
      const result = await db.select().from(systemSettings);
      console.log('System settings fetched:', result.length, 'records');
      return result;
    } catch (error) {
      console.error('Error in getSystemSettings:', error);
      throw error;
    }
  }

  async getSystemSetting(key: string): Promise<any | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting;
  }

  async updateSystemSetting(key: string, value: string): Promise<any> {
    const [setting] = await db
      .update(systemSettings)
      .set({ value, updatedAt: new Date() })
      .where(eq(systemSettings.key, key))
      .returning();
    return setting;
  }

  async createSystemSetting(settingData: any): Promise<any> {
    const [setting] = await db
      .insert(systemSettings)
      .values(settingData)
      .returning();
    return setting;
  }
}

// Export service instances
export const companyService = new CompanyService();
export const subscriptionService = new SubscriptionService();
export const userService = new UserService();
export const paymentService = new PaymentService();
export const superAdminService = new SuperAdminService();
export const systemSettingsService = new SystemSettingsService();

// Export factory function for tenant-specific services
export const getTenantService = (companyId: number) => new TenantDataService(companyId);