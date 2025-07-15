import { 
  users, agents, teams, sales, cashOffers, mediaSlides, announcements, newsTicker,
  type User, type InsertUser, type Agent, type InsertAgent, type Team, type InsertTeam,
  type Sale, type InsertSale, type CashOffer, type InsertCashOffer, type MediaSlide,
  type InsertMediaSlide, type Announcement, type InsertAnnouncement, type NewsTicker,
  type InsertNewsTicker
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

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
  
  // Sales methods
  getSales(): Promise<Sale[]>;
  getSalesByAgent(agentId: number): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  
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
  
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.SessionStore;
  
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
    return await db.select().from(agents).where(eq(agents.isActive, true));
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
    return await db.select().from(teams);
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
  
  async getSales(): Promise<Sale[]> {
    return await db.select().from(sales).orderBy(desc(sales.createdAt));
  }
  
  async getSalesByAgent(agentId: number): Promise<Sale[]> {
    return await db.select().from(sales).where(eq(sales.agentId, agentId)).orderBy(desc(sales.createdAt));
  }
  
  async createSale(sale: InsertSale): Promise<Sale> {
    const [newSale] = await db.insert(sales).values(sale).returning();
    return newSale;
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
    const [agentsData, teamsData, salesData, offersData, slidesData, tickerData] = await Promise.all([
      db.select().from(agents).where(eq(agents.isActive, true)),
      db.select().from(teams),
      db.select().from(sales).orderBy(desc(sales.createdAt)).limit(50),
      this.getActiveCashOffers(),
      this.getActiveMediaSlides(),
      this.getActiveNewsTicker()
    ]);
    
    // Calculate current sales volume and units for each agent
    const agentsWithSales = agentsData.map(agent => {
      const agentSales = salesData.filter(sale => sale.agentId === agent.id);
      const currentVolume = agentSales.reduce((sum, sale) => sum + parseFloat(sale.amount), 0);
      const currentUnits = agentSales.reduce((sum, sale) => sum + sale.units, 0);
      
      return {
        ...agent,
        currentVolume: currentVolume.toFixed(2),
        currentUnits,
        team: teamsData.find(team => team.id === agent.teamId)
      };
    });
    
    // Calculate team scores based on combined agent sales
    const teamsWithScores = teamsData.map(team => {
      const teamAgents = agentsWithSales.filter(agent => agent.teamId === team.id);
      const teamVolume = teamAgents.reduce((sum, agent) => sum + parseFloat(agent.currentVolume), 0);
      const teamUnits = teamAgents.reduce((sum, agent) => sum + agent.currentUnits, 0);
      
      return {
        ...team,
        currentVolume: teamVolume.toFixed(2),
        currentUnits,
        agentCount: teamAgents.length,
        agents: teamAgents
      };
    });
    
    // Sort teams by current volume (highest first)
    teamsWithScores.sort((a, b) => parseFloat(b.currentVolume) - parseFloat(a.currentVolume));
    
    // Sort agents by current volume (highest first) and assign ranks
    agentsWithSales.sort((a, b) => parseFloat(b.currentVolume) - parseFloat(a.currentVolume));
    agentsWithSales.forEach((agent, index) => {
      agent.rank = index + 1;
    });
    
    return {
      agents: agentsWithSales,
      teams: teamsWithScores,
      sales: salesData,
      cashOffers: offersData,
      mediaSlides: slidesData,
      newsTicker: tickerData
    };
  }
}

export const storage = new DatabaseStorage();
