import { 
  users, agents, teams, sales, cashOffers, mediaSlides, announcements, newsTicker, fileUploads, systemSettings, soundEffects,
  agentTargetHistory, teamTargetHistory, categories, agentCategoryTargets, teamCategoryTargets,
  type User, type InsertUser, type Agent, type InsertAgent, type Team, type InsertTeam,
  type Sale, type InsertSale, type CashOffer, type InsertCashOffer, type MediaSlide,
  type InsertMediaSlide, type Announcement, type InsertAnnouncement, type NewsTicker,
  type InsertNewsTicker, type FileUpload, type InsertFileUpload, type SystemSetting, type InsertSystemSetting,
  type SoundEffect, type InsertSoundEffect, type AgentTargetHistory, type InsertAgentTargetHistory,
  type TeamTargetHistory, type InsertTeamTargetHistory, type Category, type InsertCategory,
  type AgentCategoryTarget, type InsertAgentCategoryTarget, type TeamCategoryTarget, type InsertTeamCategoryTarget
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte, lte, or } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

// Report types
interface ReportFilters {
  startDate: Date;
  endDate: Date;
  agentId?: number;
  teamId?: number;
  reportType: string;
}

interface ReportData {
  totalSales: number;
  totalVolume: number;
  averageValue: number;
  salesCount: number;
  topPerformer: string;
  conversionRate: number;
  salesByAgent: any[];
  salesByTeam: any[];
  salesByDate: any[];
  performance: any[];
}

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Agent methods
  getAgents(): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  getAgentByUsername(username: string): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: number, agent: Partial<InsertAgent>): Promise<Agent>;
  deleteAgent(id: number): Promise<void>;
  
  // Team methods
  getTeams(): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, team: Partial<InsertTeam>): Promise<Team>;
  deleteTeam(id: number): Promise<void>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  
  // Sales methods
  getSales(): Promise<Sale[]>;
  getSalesByAgent(agentId: number): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  updateSale(id: number, sale: Partial<InsertSale>): Promise<Sale>;
  deleteSale(id: number): Promise<void>;
  
  // Cash offers methods
  getActiveCashOffers(): Promise<CashOffer[]>;
  createCashOffer(offer: InsertCashOffer): Promise<CashOffer>;
  updateCashOffer(id: number, offer: Partial<InsertCashOffer>): Promise<CashOffer>;
  deleteCashOffer(id: number): Promise<void>;
  
  // Media slides methods
  getActiveMediaSlides(): Promise<MediaSlide[]>;
  createMediaSlide(slide: InsertMediaSlide): Promise<MediaSlide>;
  updateMediaSlide(id: number, slide: Partial<InsertMediaSlide>): Promise<MediaSlide>;
  deleteMediaSlide(id: number): Promise<void>;
  
  // Announcements methods
  getActiveAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<void>;
  
  // News ticker methods
  getActiveNewsTicker(): Promise<NewsTicker[]>;
  createNewsTicker(ticker: InsertNewsTicker): Promise<NewsTicker>;
  updateNewsTicker(id: number, ticker: Partial<InsertNewsTicker>): Promise<NewsTicker>;
  deleteNewsTicker(id: number): Promise<void>;
  
  // Dashboard data
  getDashboardData(): Promise<any>;
  
  // File upload methods
  getFileUploads(): Promise<FileUpload[]>;
  createFileUpload(upload: InsertFileUpload): Promise<FileUpload>;
  deleteFileUpload(id: number): Promise<void>;
  
  // System settings methods
  getSystemSettings(): Promise<SystemSetting[]>;
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  createSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting>;
  updateSystemSetting(key: string, value: string): Promise<SystemSetting>;
  deleteSystemSetting(key: string): Promise<void>;
  
  // Sound effects methods
  getSoundEffects(): Promise<SoundEffect[]>;
  getSoundEffect(id: number): Promise<SoundEffect | undefined>;
  getSoundEffectByEventType(eventType: string): Promise<SoundEffect | undefined>;
  createSoundEffect(effect: InsertSoundEffect): Promise<SoundEffect>;
  updateSoundEffect(id: number, effect: Partial<InsertSoundEffect>): Promise<SoundEffect>;
  deleteSoundEffect(id: number): Promise<void>;
  
  // Reports methods
  generateReport(filters: ReportFilters): Promise<ReportData>;
  exportReportAsCSV(reportData: ReportData): Promise<string>;
  exportReportAsExcel(reportData: ReportData): Promise<Buffer>;
  exportReportAsPDF(reportData: ReportData): Promise<Buffer>;
  
  // Currency settings
  getCurrencySettings(): Promise<any>;
  
  // Target cycle management
  initializeTargetCycles(): Promise<void>;
  checkAndResetTargetCycles(): Promise<void>;
  getAgentTargetHistory(agentId: number): Promise<AgentTargetHistory[]>;
  getTeamTargetHistory(teamId: number): Promise<TeamTargetHistory[]>;
  getCurrentAgentTargetCycle(agentId: number): Promise<AgentTargetHistory | null>;
  getCurrentTeamTargetCycle(teamId: number): Promise<TeamTargetHistory | null>;
  createAgentTargetHistory(history: InsertAgentTargetHistory): Promise<AgentTargetHistory>;
  createTeamTargetHistory(history: InsertTeamTargetHistory): Promise<TeamTargetHistory>;
  updateAgentTargetHistory(id: number, history: Partial<InsertAgentTargetHistory>): Promise<AgentTargetHistory>;
  updateTeamTargetHistory(id: number, history: Partial<InsertTeamTargetHistory>): Promise<TeamTargetHistory>;
  calculateNextCycleDate(targetCycle: string, resetDay: number, resetMonth?: number): Date;

  // Agent category targets methods
  getAgentCategoryTargets(agentId: number): Promise<AgentCategoryTarget[]>;
  setAgentCategoryTargets(agentId: number, targets: InsertAgentCategoryTarget[]): Promise<void>;
  deleteAgentCategoryTargets(agentId: number): Promise<void>;

  // Team category targets methods
  getTeamCategoryTargets(teamId: number): Promise<TeamCategoryTarget[]>;
  setTeamCategoryTargets(teamId: number, targets: InsertTeamCategoryTarget[]): Promise<void>;
  deleteTeamCategoryTargets(teamId: number): Promise<void>;
  
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: any;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ pool, createTableIfMissing: true });
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async getAgents(): Promise<Agent[]> {
    console.log("Fetching agents from database...");
    try {
      const result = await db.select().from(agents);
      console.log("All agents:", result);
      console.log("Number of agents:", result.length);
      if (result.length > 0) {
        console.log("First agent:", result[0]);
        console.log("First agent isActive type:", typeof result[0].isActive);
        console.log("First agent isActive value:", result[0].isActive);
      }
      
      // Get category targets for all agents
      const categoryTargetsData = await db
        .select({
          agentId: agentCategoryTargets.agentId,
          categoryId: agentCategoryTargets.categoryId, 
          volumeTarget: agentCategoryTargets.volumeTarget,
          unitsTarget: agentCategoryTargets.unitsTarget,
        })
        .from(agentCategoryTargets);
      
      // Combine agents with their category targets
      const agentsWithTargets = result.map(agent => ({
        ...agent,
        categoryTargets: categoryTargetsData.filter(target => target.agentId === agent.id)
      }));
      
      const activeAgents = agentsWithTargets.filter(agent => agent.isActive);
      console.log("Active agents:", activeAgents);
      return activeAgents;
    } catch (error) {
      console.error("Error fetching agents:", error);
      return [];
    }
  }
  
  async getAgent(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent || undefined;
  }

  async getAgentByUsername(username: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.username, username));
    return agent || undefined;
  }
  
  async createAgent(agent: InsertAgent): Promise<Agent> {
    const [newAgent] = await db.insert(agents).values(agent).returning();
    return newAgent;
  }
  
  async updateAgent(id: number, agent: Partial<InsertAgent>): Promise<Agent> {
    const [updatedAgent] = await db.update(agents).set(agent).where(eq(agents.id, id)).returning();
    return updatedAgent;
  }
  
  async deleteAgent(id: number): Promise<void> {
    await db.update(agents).set({ isActive: false }).where(eq(agents.id, id));
  }
  
  async getTeams(): Promise<Team[]> {
    console.log("Fetching teams from database...");
    const result = await db.select().from(teams);
    console.log("Teams result:", result);
    return result;
  }
  
  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  }
  
  async createTeam(team: InsertTeam): Promise<Team> {
    const [newTeam] = await db.insert(teams).values(team).returning();
    return newTeam;
  }
  
  async updateTeam(id: number, team: Partial<InsertTeam>): Promise<Team> {
    const [updatedTeam] = await db.update(teams).set(team).where(eq(teams.id, id)).returning();
    return updatedTeam;
  }
  
  async deleteTeam(id: number): Promise<void> {
    await db.delete(teams).where(eq(teams.id, id));
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true));
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    const result = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return result[0];
  }

  async deleteCategory(id: number): Promise<void> {
    await db.update(categories).set({ isActive: false }).where(eq(categories.id, id));
  }
  
  async getSales(): Promise<Sale[]> {
    return await db.select().from(sales).orderBy(desc(sales.createdAt));
  }
  
  async getSalesByAgent(agentId: number): Promise<Sale[]> {
    return await db.select().from(sales).where(eq(sales.agentId, agentId)).orderBy(desc(sales.createdAt));
  }
  
  async createSale(sale: InsertSale): Promise<Sale> {
    // Get current agent target cycle
    const currentAgentCycle = await this.getCurrentAgentTargetCycle(sale.agentId);
    
    // Add cycle information to sale
    const saleWithCycle = {
      ...sale,
      cycleStartDate: currentAgentCycle?.cycleStartDate || new Date(),
      cycleEndDate: currentAgentCycle?.cycleEndDate || new Date(),
    };
    
    const [newSale] = await db.insert(sales).values(saleWithCycle).returning();
    
    // Update agent target cycle achievements
    if (currentAgentCycle) {
      const newVolumeAchieved = parseFloat(currentAgentCycle.volumeAchieved) + parseFloat(sale.amount);
      const newUnitsAchieved = currentAgentCycle.unitsAchieved + (sale.units || 1);
      const newTotalSales = currentAgentCycle.totalSales + 1;
      
      await this.updateAgentTargetHistory(currentAgentCycle.id, {
        volumeAchieved: newVolumeAchieved.toString(),
        unitsAchieved: newUnitsAchieved,
        totalSales: newTotalSales
      });
    }
    
    // Update team target cycle achievements
    const agent = await this.getAgent(sale.agentId);
    if (agent) {
      const currentTeamCycle = await this.getCurrentTeamTargetCycle(agent.teamId);
      if (currentTeamCycle) {
        const newVolumeAchieved = parseFloat(currentTeamCycle.volumeAchieved) + parseFloat(sale.amount);
        const newUnitsAchieved = currentTeamCycle.unitsAchieved + (sale.units || 1);
        const newTotalSales = currentTeamCycle.totalSales + 1;
        
        await this.updateTeamTargetHistory(currentTeamCycle.id, {
          volumeAchieved: newVolumeAchieved.toString(),
          unitsAchieved: newUnitsAchieved,
          totalSales: newTotalSales
        });
      }
    }
    
    return newSale;
  }

  async updateSale(id: number, sale: Partial<InsertSale>): Promise<Sale> {
    const [updatedSale] = await db.update(sales).set(sale).where(eq(sales.id, id)).returning();
    return updatedSale;
  }

  async deleteSale(id: number): Promise<void> {
    await db.delete(sales).where(eq(sales.id, id));
  }
  
  async getActiveCashOffers(): Promise<CashOffer[]> {
    return await db.select().from(cashOffers).where(
      and(
        eq(cashOffers.isActive, true),
        sql`${cashOffers.expiresAt} > NOW()`
      )
    );
  }
  
  async createCashOffer(offer: InsertCashOffer): Promise<CashOffer> {
    const [newOffer] = await db.insert(cashOffers).values(offer).returning();
    return newOffer;
  }
  
  async updateCashOffer(id: number, offer: Partial<InsertCashOffer>): Promise<CashOffer> {
    const [updatedOffer] = await db.update(cashOffers).set(offer).where(eq(cashOffers.id, id)).returning();
    return updatedOffer;
  }
  
  async deleteCashOffer(id: number): Promise<void> {
    await db.update(cashOffers).set({ isActive: false }).where(eq(cashOffers.id, id));
  }
  
  async getActiveMediaSlides(): Promise<MediaSlide[]> {
    return await db.select().from(mediaSlides).where(eq(mediaSlides.isActive, true)).orderBy(mediaSlides.order);
  }
  
  async createMediaSlide(slide: InsertMediaSlide): Promise<MediaSlide> {
    const [newSlide] = await db.insert(mediaSlides).values(slide).returning();
    return newSlide;
  }
  
  async updateMediaSlide(id: number, slide: Partial<InsertMediaSlide>): Promise<MediaSlide> {
    const [updatedSlide] = await db.update(mediaSlides).set(slide).where(eq(mediaSlides.id, id)).returning();
    return updatedSlide;
  }
  
  async deleteMediaSlide(id: number): Promise<void> {
    await db.update(mediaSlides).set({ isActive: false }).where(eq(mediaSlides.id, id));
  }
  
  async getActiveAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements).where(eq(announcements.isActive, true)).orderBy(desc(announcements.createdAt));
  }
  
  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [newAnnouncement] = await db.insert(announcements).values(announcement).returning();
    return newAnnouncement;
  }
  
  async updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement> {
    const [updatedAnnouncement] = await db.update(announcements).set(announcement).where(eq(announcements.id, id)).returning();
    return updatedAnnouncement;
  }
  
  async deleteAnnouncement(id: number): Promise<void> {
    await db.update(announcements).set({ isActive: false }).where(eq(announcements.id, id));
  }
  
  async getActiveNewsTicker(): Promise<NewsTicker[]> {
    return await db.select().from(newsTicker).where(eq(newsTicker.isActive, true)).orderBy(desc(newsTicker.createdAt));
  }
  
  async createNewsTicker(ticker: InsertNewsTicker): Promise<NewsTicker> {
    const [newTicker] = await db.insert(newsTicker).values(ticker).returning();
    return newTicker;
  }
  
  async updateNewsTicker(id: number, ticker: Partial<InsertNewsTicker>): Promise<NewsTicker> {
    const [updatedTicker] = await db.update(newsTicker).set(ticker).where(eq(newsTicker.id, id)).returning();
    return updatedTicker;
  }
  
  async deleteNewsTicker(id: number): Promise<void> {
    await db.update(newsTicker).set({ isActive: false }).where(eq(newsTicker.id, id));
  }
  
  async getDashboardData(): Promise<any> {
    const [agentsData, teamsData, salesData, offersData, slidesData, tickerData, announcementsData] = await Promise.all([
      db.select().from(agents).where(eq(agents.isActive, true)),
      db.select().from(teams),
      db.select().from(sales).orderBy(desc(sales.createdAt)).limit(50),
      this.getActiveCashOffers(),
      this.getActiveMediaSlides(),
      this.getActiveNewsTicker(),
      this.getActiveAnnouncements()
    ]);
    
    // Calculate current sales performance for each agent
    const agentSalesQuery = await db.select({
      agentId: sales.agentId,
      totalVolume: sql<string>`SUM(${sales.amount})`,
      totalUnits: sql<number>`COUNT(*)`
    }).from(sales).groupBy(sales.agentId);
    
    // Create a map for quick lookup
    const agentSalesMap = new Map();
    agentSalesQuery.forEach(item => {
      agentSalesMap.set(item.agentId, {
        currentVolume: parseFloat(item.totalVolume || '0'),
        currentUnits: item.totalUnits || 0
      });
    });
    
    // Enhance agents data with current performance
    const enhancedAgents = agentsData.map(agent => {
      const salesData = agentSalesMap.get(agent.id);
      return {
        ...agent,
        currentVolume: salesData?.currentVolume || 0,
        currentUnits: salesData?.currentUnits || 0,
        team: teamsData.find(team => team.id === agent.teamId)
      };
    });
    
    // Calculate team performance
    const enhancedTeams = teamsData.map(team => {
      const teamAgents = enhancedAgents.filter(agent => agent.teamId === team.id);
      const totalVolume = teamAgents.reduce((sum, agent) => sum + (agent.currentVolume || 0), 0);
      const totalUnits = teamAgents.reduce((sum, agent) => sum + (agent.currentUnits || 0), 0);
      
      return {
        ...team,
        currentVolume: totalVolume,
        currentUnits: totalUnits,
        memberCount: teamAgents.length
      };
    });
    
    return {
      agents: enhancedAgents,
      teams: enhancedTeams,
      sales: salesData,
      cashOffers: offersData,
      mediaSlides: slidesData,
      newsTicker: tickerData,
      announcements: announcementsData
    };
  }

  async getFileUploads(): Promise<FileUpload[]> {
    return await db.select().from(fileUploads).orderBy(desc(fileUploads.createdAt));
  }

  async createFileUpload(upload: InsertFileUpload): Promise<FileUpload> {
    const [newUpload] = await db.insert(fileUploads).values(upload).returning();
    return newUpload;
  }

  async deleteFileUpload(id: number): Promise<void> {
    await db.delete(fileUploads).where(eq(fileUploads.id, id));
  }

  async getSystemSettings(): Promise<SystemSetting[]> {
    return await db.select().from(systemSettings);
  }

  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting;
  }

  async createSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting> {
    const [newSetting] = await db.insert(systemSettings).values(setting).returning();
    return newSetting;
  }

  async updateSystemSetting(key: string, value: string): Promise<SystemSetting> {
    console.log(`Updating system setting: ${key} = ${value}`);
    try {
      // First try to update existing setting
      const [updatedSetting] = await db.update(systemSettings).set({ 
        value, 
        updatedAt: new Date() 
      }).where(eq(systemSettings.key, key)).returning();
      
      if (updatedSetting) {
        console.log(`Successfully updated setting:`, updatedSetting);
        return updatedSetting;
      }
      
      // If no existing setting found, create a new one
      console.log(`Setting ${key} not found, creating new setting`);
      const [newSetting] = await db.insert(systemSettings).values({
        key,
        value,
        type: 'string',
        description: `Auto-created setting for ${key}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      console.log(`Successfully created setting:`, newSetting);
      return newSetting;
    } catch (error) {
      console.error(`Failed to update/create system setting ${key}:`, error);
      throw error;
    }
  }

  async getCurrencySettings(): Promise<any> {
    try {
      const settings = await db.select().from(systemSettings).where(
        or(
          eq(systemSettings.key, 'currencySymbol'),
          eq(systemSettings.key, 'currencyCode'),
          eq(systemSettings.key, 'currencyName')
        )
      );
      
      const currencyData = {
        currencySymbol: settings.find(s => s.key === 'currencySymbol')?.value || '$',
        currencyCode: settings.find(s => s.key === 'currencyCode')?.value || 'USD',
        currencyName: settings.find(s => s.key === 'currencyName')?.value || 'US Dollar'
      };
      
      return currencyData;
    } catch (error) {
      console.error("Error fetching currency settings:", error);
      return {
        currencySymbol: '$',
        currencyCode: 'USD',
        currencyName: 'US Dollar'
      };
    }
  }

  // Target cycle management methods
  async initializeTargetCycles(): Promise<void> {
    try {
      // Initialize cycles for all agents
      const allAgents = await db.select().from(agents);
      for (const agent of allAgents) {
        const existingCycle = await this.getCurrentAgentTargetCycle(agent.id);
        if (!existingCycle) {
          const now = new Date();
          const cycleEnd = this.calculateNextCycleDate(
            agent.targetCycle || 'monthly',
            agent.resetDay || 1,
            agent.resetMonth || 1
          );
          
          await this.createAgentTargetHistory({
            agentId: agent.id,
            cycleStartDate: now,
            cycleEndDate: cycleEnd,
            targetCycle: agent.targetCycle || 'monthly',
            volumeTarget: agent.volumeTarget || '0',
            unitsTarget: agent.unitsTarget || 0,
            volumeAchieved: '0',
            unitsAchieved: 0,
            totalSales: 0,
            isCompleted: false
          });
        }
      }

      // Initialize cycles for all teams
      const allTeams = await db.select().from(teams);
      for (const team of allTeams) {
        const existingCycle = await this.getCurrentTeamTargetCycle(team.id);
        if (!existingCycle) {
          const now = new Date();
          const cycleEnd = this.calculateNextCycleDate(
            team.targetCycle || 'monthly',
            team.resetDay || 1,
            team.resetMonth || 1
          );
          
          await this.createTeamTargetHistory({
            teamId: team.id,
            cycleStartDate: now,
            cycleEndDate: cycleEnd,
            targetCycle: team.targetCycle || 'monthly',
            volumeTarget: team.volumeTarget || '0',
            unitsTarget: team.unitsTarget || 0,
            volumeAchieved: '0',
            unitsAchieved: 0,
            totalSales: 0,
            isCompleted: false
          });
        }
      }
    } catch (error) {
      console.error("Error initializing target cycles:", error);
    }
  }

  async checkAndResetTargetCycles(): Promise<void> {
    try {
      const now = new Date();
      
      // Check agent cycles
      const activeAgentCycles = await db.select()
        .from(agentTargetHistory)
        .where(eq(agentTargetHistory.isCompleted, false));
      
      for (const cycle of activeAgentCycles) {
        if (now >= cycle.cycleEndDate) {
          // Mark current cycle as completed
          await this.updateAgentTargetHistory(cycle.id, { isCompleted: true });
          
          // Get agent details for new cycle
          const agent = await this.getAgent(cycle.agentId);
          if (agent) {
            const nextCycleEnd = this.calculateNextCycleDate(
              agent.targetCycle || 'monthly',
              agent.resetDay || 1,
              agent.resetMonth || 1
            );
            
            // Create new cycle
            await this.createAgentTargetHistory({
              agentId: agent.id,
              cycleStartDate: now,
              cycleEndDate: nextCycleEnd,
              targetCycle: agent.targetCycle || 'monthly',
              volumeTarget: agent.volumeTarget || '0',
              unitsTarget: agent.unitsTarget || 0,
              volumeAchieved: '0',
              unitsAchieved: 0,
              totalSales: 0,
              isCompleted: false
            });
          }
        }
      }
      
      // Check team cycles
      const activeTeamCycles = await db.select()
        .from(teamTargetHistory)
        .where(eq(teamTargetHistory.isCompleted, false));
      
      for (const cycle of activeTeamCycles) {
        if (now >= cycle.cycleEndDate) {
          // Mark current cycle as completed
          await this.updateTeamTargetHistory(cycle.id, { isCompleted: true });
          
          // Get team details for new cycle
          const team = await this.getTeam(cycle.teamId);
          if (team) {
            const nextCycleEnd = this.calculateNextCycleDate(
              team.targetCycle || 'monthly',
              team.resetDay || 1,
              team.resetMonth || 1
            );
            
            // Create new cycle
            await this.createTeamTargetHistory({
              teamId: team.id,
              cycleStartDate: now,
              cycleEndDate: nextCycleEnd,
              targetCycle: team.targetCycle || 'monthly',
              volumeTarget: team.volumeTarget || '0',
              unitsTarget: team.unitsTarget || 0,
              volumeAchieved: '0',
              unitsAchieved: 0,
              totalSales: 0,
              isCompleted: false
            });
          }
        }
      }
    } catch (error) {
      console.error("Error checking and resetting target cycles:", error);
    }
  }

  calculateNextCycleDate(targetCycle: string, resetDay: number, resetMonth?: number): Date {
    const now = new Date();
    let nextDate: Date;
    
    if (targetCycle === 'monthly') {
      // Monthly cycle: next reset is on the specified day of next month
      nextDate = new Date(now.getFullYear(), now.getMonth() + 1, resetDay);
      
      // If reset day is today or has passed this month, set to next month
      if (now.getDate() >= resetDay) {
        nextDate = new Date(now.getFullYear(), now.getMonth() + 1, resetDay);
      } else {
        nextDate = new Date(now.getFullYear(), now.getMonth(), resetDay);
      }
    } else {
      // Yearly cycle: next reset is on the specified day and month of next year
      const month = (resetMonth || 1) - 1; // Convert to 0-indexed
      nextDate = new Date(now.getFullYear(), month, resetDay);
      
      // If the date has passed this year, set to next year
      if (now > nextDate) {
        nextDate = new Date(now.getFullYear() + 1, month, resetDay);
      }
    }
    
    return nextDate;
  }

  async getAgentTargetHistory(agentId: number): Promise<AgentTargetHistory[]> {
    return await db.select()
      .from(agentTargetHistory)
      .where(eq(agentTargetHistory.agentId, agentId))
      .orderBy(desc(agentTargetHistory.cycleStartDate));
  }

  async getTeamTargetHistory(teamId: number): Promise<TeamTargetHistory[]> {
    return await db.select()
      .from(teamTargetHistory)
      .where(eq(teamTargetHistory.teamId, teamId))
      .orderBy(desc(teamTargetHistory.cycleStartDate));
  }

  async getCurrentAgentTargetCycle(agentId: number): Promise<AgentTargetHistory | null> {
    const [currentCycle] = await db.select()
      .from(agentTargetHistory)
      .where(and(
        eq(agentTargetHistory.agentId, agentId),
        eq(agentTargetHistory.isCompleted, false)
      ))
      .orderBy(desc(agentTargetHistory.cycleStartDate))
      .limit(1);
    
    return currentCycle || null;
  }

  async getCurrentTeamTargetCycle(teamId: number): Promise<TeamTargetHistory | null> {
    const [currentCycle] = await db.select()
      .from(teamTargetHistory)
      .where(and(
        eq(teamTargetHistory.teamId, teamId),
        eq(teamTargetHistory.isCompleted, false)
      ))
      .orderBy(desc(teamTargetHistory.cycleStartDate))
      .limit(1);
    
    return currentCycle || null;
  }

  async createAgentTargetHistory(history: InsertAgentTargetHistory): Promise<AgentTargetHistory> {
    const [created] = await db.insert(agentTargetHistory).values(history).returning();
    return created;
  }

  async createTeamTargetHistory(history: InsertTeamTargetHistory): Promise<TeamTargetHistory> {
    const [created] = await db.insert(teamTargetHistory).values(history).returning();
    return created;
  }

  async updateAgentTargetHistory(id: number, history: Partial<InsertAgentTargetHistory>): Promise<AgentTargetHistory> {
    const [updated] = await db.update(agentTargetHistory)
      .set({ ...history, updatedAt: new Date() })
      .where(eq(agentTargetHistory.id, id))
      .returning();
    return updated;
  }

  async updateTeamTargetHistory(id: number, history: Partial<InsertTeamTargetHistory>): Promise<TeamTargetHistory> {
    const [updated] = await db.update(teamTargetHistory)
      .set({ ...history, updatedAt: new Date() })
      .where(eq(teamTargetHistory.id, id))
      .returning();
    return updated;
  }

  async deleteSystemSetting(key: string): Promise<void> {
    await db.delete(systemSettings).where(eq(systemSettings.key, key));
  }

  async getSoundEffects(): Promise<SoundEffect[]> {
    return await db.select().from(soundEffects).orderBy(desc(soundEffects.createdAt));
  }

  async getSoundEffect(id: number): Promise<SoundEffect | undefined> {
    const [effect] = await db.select().from(soundEffects).where(eq(soundEffects.id, id));
    return effect;
  }

  async getSoundEffectByEventType(eventType: string): Promise<SoundEffect | undefined> {
    const [effect] = await db.select()
      .from(soundEffects)
      .where(and(eq(soundEffects.eventType, eventType), eq(soundEffects.isActive, true)));
    return effect;
  }

  async createSoundEffect(effect: InsertSoundEffect): Promise<SoundEffect> {
    const [newEffect] = await db.insert(soundEffects).values(effect).returning();
    return newEffect;
  }

  async updateSoundEffect(id: number, effect: Partial<InsertSoundEffect>): Promise<SoundEffect> {
    const [updatedEffect] = await db.update(soundEffects).set(effect).where(eq(soundEffects.id, id)).returning();
    return updatedEffect;
  }

  async deleteSoundEffect(id: number): Promise<void> {
    await db.delete(soundEffects).where(eq(soundEffects.id, id));
  }

  // Reports methods
  async generateReport(filters: ReportFilters): Promise<ReportData> {
    const { startDate, endDate, agentId, teamId, reportType } = filters;
    
    // Base query conditions
    const conditions = [
      sql`${sales.createdAt} >= ${startDate}`,
      sql`${sales.createdAt} <= ${endDate}`
    ];
    
    if (agentId) {
      conditions.push(eq(sales.agentId, agentId));
    }
    
    if (teamId) {
      conditions.push(eq(agents.teamId, teamId));
    }
    
    // Get all sales with agent and team info
    const salesData = await db
      .select({
        id: sales.id,
        amount: sales.amount,
        units: sales.units,
        category: sales.category,
        clientName: sales.clientName,
        agentId: sales.agentId,
        agentName: agents.name,
        teamId: agents.teamId,
        teamName: teams.name,
        createdAt: sales.createdAt,
      })
      .from(sales)
      .leftJoin(agents, eq(sales.agentId, agents.id))
      .leftJoin(teams, eq(agents.teamId, teams.id))
      .where(and(...conditions))
      .orderBy(desc(sales.createdAt));
    
    // Calculate totals
    const totalVolume = salesData.reduce((sum, sale) => sum + parseFloat(sale.amount), 0);
    const totalSales = salesData.length;
    const averageValue = totalSales > 0 ? totalVolume / totalSales : 0;
    
    // Group by agent
    const agentSales = new Map();
    salesData.forEach(sale => {
      if (!agentSales.has(sale.agentId)) {
        agentSales.set(sale.agentId, {
          id: sale.agentId,
          name: sale.agentName,
          team: sale.teamName,
          totalVolume: 0,
          salesCount: 0,
          conversionRate: 0,
        });
      }
      const agent = agentSales.get(sale.agentId);
      agent.totalVolume += parseFloat(sale.amount);
      agent.salesCount += 1;
    });
    
    const salesByAgent = Array.from(agentSales.values())
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .map((agent, index) => ({
        ...agent,
        rank: index + 1,
        conversionRate: Math.random() * 0.3 + 0.7, // Placeholder conversion rate
      }));
    
    // Group by team
    const teamSales = new Map();
    salesData.forEach(sale => {
      if (!teamSales.has(sale.teamId)) {
        teamSales.set(sale.teamId, {
          id: sale.teamId,
          name: sale.teamName,
          totalVolume: 0,
          salesCount: 0,
          agentCount: new Set(),
        });
      }
      const team = teamSales.get(sale.teamId);
      team.totalVolume += parseFloat(sale.amount);
      team.salesCount += 1;
      team.agentCount.add(sale.agentId);
    });
    
    const salesByTeam = Array.from(teamSales.values())
      .map(team => ({
        ...team,
        agentCount: team.agentCount.size,
        averagePerAgent: team.totalVolume / team.agentCount.size,
      }))
      .sort((a, b) => b.totalVolume - a.totalVolume);
    
    // Group by date
    const dateSales = new Map();
    salesData.forEach(sale => {
      const date = new Date(sale.createdAt || new Date()).toISOString().split('T')[0];
      if (!dateSales.has(date)) {
        dateSales.set(date, {
          date,
          totalVolume: 0,
          salesCount: 0,
        });
      }
      const day = dateSales.get(date);
      day.totalVolume += parseFloat(sale.amount);
      day.salesCount += 1;
    });
    
    const salesByDate = Array.from(dateSales.values())
      .map(day => ({
        ...day,
        averageValue: day.totalVolume / day.salesCount,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const topPerformer = salesByAgent.length > 0 ? salesByAgent[0].name : "N/A";
    
    return {
      totalSales,
      totalVolume,
      averageValue,
      salesCount: totalSales,
      topPerformer,
      conversionRate: 0.85, // Placeholder conversion rate
      salesByAgent,
      salesByTeam,
      salesByDate,
      performance: salesByAgent, // Same as agent data for now
    };
  }

  async exportReportAsCSV(reportData: ReportData): Promise<string> {
    // Get current currency settings
    const currencySettings = await this.getCurrencySettings();
    const symbol = currencySettings.currencySymbol || '$';
    
    const headers = ['Agent', 'Team', 'Total Sales', 'Sales Count', 'Average Sale'];
    const rows = reportData.salesByAgent.map(agent => [
      agent.name,
      agent.team,
      `${symbol}${agent.totalVolume.toFixed(2)}`,
      agent.salesCount.toString(),
      `${symbol}${(agent.totalVolume / agent.salesCount).toFixed(2)}`
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    return csvContent;
  }

  async exportReportAsExcel(reportData: ReportData): Promise<Buffer> {
    // For now, return CSV as Excel requires additional dependencies
    const csv = await this.exportReportAsCSV(reportData);
    return Buffer.from(csv);
  }

  async exportReportAsPDF(reportData: ReportData): Promise<Buffer> {
    // For now, return CSV as PDF requires additional dependencies
    const csv = await this.exportReportAsCSV(reportData);
    return Buffer.from(csv);
  }

  // Agent category targets methods
  async getAgentCategoryTargets(agentId: number): Promise<AgentCategoryTarget[]> {
    return await db.select().from(agentCategoryTargets).where(eq(agentCategoryTargets.agentId, agentId));
  }

  async setAgentCategoryTargets(agentId: number, targets: InsertAgentCategoryTarget[]): Promise<void> {
    // Delete existing targets
    await db.delete(agentCategoryTargets).where(eq(agentCategoryTargets.agentId, agentId));
    
    // Insert new targets
    if (targets.length > 0) {
      await db.insert(agentCategoryTargets).values(targets);
    }
    
    // Auto-calculate and update team targets based on agent targets
    await this.recalculateTeamTargets(agentId);
  }

  async deleteAgentCategoryTargets(agentId: number): Promise<void> {
    await db.delete(agentCategoryTargets).where(eq(agentCategoryTargets.agentId, agentId));
    // Recalculate team targets after agent target deletion
    await this.recalculateTeamTargets(agentId);
  }

  // Team category targets methods  
  async getTeamCategoryTargets(teamId: number): Promise<TeamCategoryTarget[]> {
    return await db.select().from(teamCategoryTargets).where(eq(teamCategoryTargets.teamId, teamId));
  }

  async setTeamCategoryTargets(teamId: number, targets: InsertTeamCategoryTarget[]): Promise<void> {
    // Delete existing targets
    await db.delete(teamCategoryTargets).where(eq(teamCategoryTargets.teamId, teamId));
    
    // Insert new targets
    if (targets.length > 0) {
      await db.insert(teamCategoryTargets).values(targets);
    }
  }

  async deleteTeamCategoryTargets(teamId: number): Promise<void> {
    await db.delete(teamCategoryTargets).where(eq(teamCategoryTargets.teamId, teamId));
  }

  // Auto-calculate team targets based on sum of all agents' targets
  async recalculateTeamTargets(changedAgentId: number): Promise<void> {
    try {
      // Get the agent to find which team they belong to
      const agent = await this.getAgent(changedAgentId);
      if (!agent || !agent.teamId) return;

      // Get all agents in this team
      const teamAgents = await db.select()
        .from(agents)
        .where(and(
          eq(agents.teamId, agent.teamId),
          eq(agents.isActive, true)
        ));

      // Get all category targets for these agents
      const agentIds = teamAgents.map(a => a.id);
      let allAgentTargets: AgentCategoryTarget[] = [];
      
      for (const agentId of agentIds) {
        const targets = await this.getAgentCategoryTargets(agentId);
        allAgentTargets = allAgentTargets.concat(targets);
      }

      // Group by category and sum the targets
      const categoryTotals = new Map<number, { volumeTarget: number; unitsTarget: number }>();
      
      allAgentTargets.forEach(target => {
        const existing = categoryTotals.get(target.categoryId) || { volumeTarget: 0, unitsTarget: 0 };
        categoryTotals.set(target.categoryId, {
          volumeTarget: existing.volumeTarget + parseFloat(target.volumeTarget.toString()),
          unitsTarget: existing.unitsTarget + target.unitsTarget
        });
      });

      // Convert to team category targets format
      const teamTargets: InsertTeamCategoryTarget[] = Array.from(categoryTotals.entries()).map(([categoryId, totals]) => ({
        teamId: agent.teamId!,
        categoryId,
        volumeTarget: totals.volumeTarget.toString(),
        unitsTarget: totals.unitsTarget
      }));

      // Update team category targets
      await this.setTeamCategoryTargets(agent.teamId, teamTargets);

      // Also update the legacy team table for backward compatibility
      const totalVolume = Array.from(categoryTotals.values()).reduce((sum, cat) => sum + cat.volumeTarget, 0);
      const totalUnits = Array.from(categoryTotals.values()).reduce((sum, cat) => sum + cat.unitsTarget, 0);

      await db.update(teams)
        .set({
          volumeTarget: totalVolume.toString(),
          unitsTarget: totalUnits
        })
        .where(eq(teams.id, agent.teamId));

    } catch (error) {
      console.error("Error recalculating team targets:", error);
    }
  }
}

export const storage = new DatabaseStorage();
