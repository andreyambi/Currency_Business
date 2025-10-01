import {
  users,
  kycDocuments,
  digitalWallets,
  transactions,
  loans,
  currencyRates,
  systemSettings,
  type User,
  type InsertUser,
  type KycDocument,
  type InsertKycDocument,
  type DigitalWallet,
  type InsertDigitalWallet,
  type Transaction,
  type InsertTransaction,
  type Loan,
  type InsertLoan,
  type CurrencyRate,
  type InsertCurrencyRate,
  type SystemSetting,
  type InsertSystemSetting,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // KYC Document operations
  createKycDocument(doc: InsertKycDocument): Promise<KycDocument>;
  getKycDocumentsByUserId(userId: string): Promise<KycDocument[]>;
  updateKycDocument(id: string, updates: Partial<KycDocument>): Promise<KycDocument>;
  getPendingKycDocuments(): Promise<KycDocument[]>;

  // Digital Wallet operations
  createDigitalWallet(wallet: InsertDigitalWallet): Promise<DigitalWallet>;
  getWalletsByUserId(userId: string): Promise<DigitalWallet[]>;
  updateWallet(id: string, updates: Partial<DigitalWallet>): Promise<DigitalWallet>;

  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUserId(userId: string): Promise<Transaction[]>;
  getTransactionById(id: string): Promise<Transaction | undefined>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction>;

  // Loan operations
  createLoan(loan: InsertLoan): Promise<Loan>;
  getLoansByUserId(userId: string): Promise<Loan[]>;
  getLoanById(id: string): Promise<Loan | undefined>;
  updateLoan(id: string, updates: Partial<Loan>): Promise<Loan>;
  getAllLoans(): Promise<Loan[]>;
  getPendingLoans(): Promise<Loan[]>;

  // Currency Rate operations
  getCurrencyRate(from: string, to: string): Promise<CurrencyRate | undefined>;
  updateCurrencyRate(rate: InsertCurrencyRate): Promise<CurrencyRate>;
  getAllCurrencyRates(): Promise<CurrencyRate[]>;

  // System Settings operations
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  updateSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // KYC Document operations
  async createKycDocument(doc: InsertKycDocument): Promise<KycDocument> {
    const [document] = await db
      .insert(kycDocuments)
      .values(doc)
      .returning();
    return document;
  }

  async getKycDocumentsByUserId(userId: string): Promise<KycDocument[]> {
    return await db
      .select()
      .from(kycDocuments)
      .where(eq(kycDocuments.userId, userId))
      .orderBy(desc(kycDocuments.createdAt));
  }

  async updateKycDocument(id: string, updates: Partial<KycDocument>): Promise<KycDocument> {
    const [document] = await db
      .update(kycDocuments)
      .set(updates)
      .where(eq(kycDocuments.id, id))
      .returning();
    return document;
  }

  async getPendingKycDocuments(): Promise<KycDocument[]> {
    return await db
      .select()
      .from(kycDocuments)
      .where(eq(kycDocuments.status, "pending"))
      .orderBy(desc(kycDocuments.createdAt));
  }

  // Digital Wallet operations
  async createDigitalWallet(wallet: InsertDigitalWallet): Promise<DigitalWallet> {
    const [newWallet] = await db
      .insert(digitalWallets)
      .values(wallet)
      .returning();
    return newWallet;
  }

  async getWalletsByUserId(userId: string): Promise<DigitalWallet[]> {
    return await db
      .select()
      .from(digitalWallets)
      .where(eq(digitalWallets.userId, userId))
      .orderBy(desc(digitalWallets.createdAt));
  }

  async updateWallet(id: string, updates: Partial<DigitalWallet>): Promise<DigitalWallet> {
    const [wallet] = await db
      .update(digitalWallets)
      .set(updates)
      .where(eq(digitalWallets.id, id))
      .returning();
    return wallet;
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const [transaction] = await db
      .update(transactions)
      .set(updates)
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  // Loan operations
  async createLoan(loan: InsertLoan): Promise<Loan> {
    const [newLoan] = await db
      .insert(loans)
      .values(loan)
      .returning();
    return newLoan;
  }

  async getLoansByUserId(userId: string): Promise<Loan[]> {
    return await db
      .select()
      .from(loans)
      .where(eq(loans.userId, userId))
      .orderBy(desc(loans.createdAt));
  }

  async getLoanById(id: string): Promise<Loan | undefined> {
    const [loan] = await db
      .select()
      .from(loans)
      .where(eq(loans.id, id));
    return loan;
  }

  async updateLoan(id: string, updates: Partial<Loan>): Promise<Loan> {
    const [loan] = await db
      .update(loans)
      .set(updates)
      .where(eq(loans.id, id))
      .returning();
    return loan;
  }

  async getAllLoans(): Promise<Loan[]> {
    return await db.select().from(loans).orderBy(desc(loans.createdAt));
  }

  async getPendingLoans(): Promise<Loan[]> {
    return await db
      .select()
      .from(loans)
      .where(eq(loans.status, "pending"))
      .orderBy(desc(loans.createdAt));
  }

  // Currency Rate operations
  async getCurrencyRate(from: string, to: string): Promise<CurrencyRate | undefined> {
    const [rate] = await db
      .select()
      .from(currencyRates)
      .where(
        and(
          eq(currencyRates.fromCurrency, from),
          eq(currencyRates.toCurrency, to)
        )
      );
    return rate;
  }

  async updateCurrencyRate(rate: InsertCurrencyRate): Promise<CurrencyRate> {
    const existing = await this.getCurrencyRate(rate.fromCurrency, rate.toCurrency);
    
    if (existing) {
      const [updated] = await db
        .update(currencyRates)
        .set({ rate: rate.rate, updatedAt: new Date() })
        .where(eq(currencyRates.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(currencyRates)
        .values(rate)
        .returning();
      return created;
    }
  }

  async getAllCurrencyRates(): Promise<CurrencyRate[]> {
    return await db.select().from(currencyRates);
  }

  // System Settings operations
  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key));
    return setting;
  }

  async updateSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting> {
    const existing = await this.getSystemSetting(setting.key);
    
    if (existing) {
      const [updated] = await db
        .update(systemSettings)
        .set({ value: setting.value, updatedAt: new Date() })
        .where(eq(systemSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(systemSettings)
        .values(setting)
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
