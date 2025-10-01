import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  numeric,
  boolean,
  integer,
  pgEnum
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["client", "admin"]);
export const verificationStatusEnum = pgEnum("verification_status", ["pending", "approved", "rejected"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["deposit", "withdraw", "exchange", "loan_disbursement", "loan_payment"]);
export const loanStatusEnum = pgEnum("loan_status", ["pending", "approved", "rejected", "active", "completed"]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  phone: varchar("phone").notNull().unique(),
  password: varchar("password").notNull(),
  fullName: varchar("full_name").notNull(),
  dateOfBirth: varchar("date_of_birth").notNull(),
  role: userRoleEnum("role").notNull().default("client"),
  verificationStatus: verificationStatusEnum("verification_status").notNull().default("pending"),
  balance: numeric("balance", { precision: 15, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// KYC Documents table
export const kycDocuments = pgTable("kyc_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  documentType: varchar("document_type").notNull(), // "id_card", "selfie", "proof_of_address"
  documentUrl: text("document_url").notNull(),
  status: verificationStatusEnum("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Digital Wallets table
export const digitalWallets = pgTable("digital_wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  walletName: varchar("wallet_name").notNull(), // "Binance", "Wise", "PayPal", etc.
  accountId: varchar("account_id"), // User's account ID in that wallet
  balance: numeric("balance", { precision: 15, scale: 2 }).notNull().default("0"),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: transactionTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("KZ"), // KZ, USD, EUR
  description: text("description").notNull(),
  reference: varchar("reference"), // Bank reference for deposits/withdrawals
  status: verificationStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Loans table
export const loans = pgTable("loans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  interestRate: numeric("interest_rate", { precision: 5, scale: 2 }).notNull(), // Annual percentage
  termMonths: integer("term_months").notNull(),
  monthlyPayment: numeric("monthly_payment", { precision: 15, scale: 2 }).notNull(),
  totalPayment: numeric("total_payment", { precision: 15, scale: 2 }).notNull(),
  paymentDay: integer("payment_day").notNull(), // Day of month for payment
  monthlySalary: numeric("monthly_salary", { precision: 15, scale: 2 }).notNull(),
  workplace: varchar("workplace").notNull(),
  bankName: varchar("bank_name").notNull(),
  iban: varchar("iban").notNull(),
  emergencyContact1Name: varchar("emergency_contact_1_name").notNull(),
  emergencyContact1Phone: varchar("emergency_contact_1_phone").notNull(),
  emergencyContact2Name: varchar("emergency_contact_2_name").notNull(),
  emergencyContact2Phone: varchar("emergency_contact_2_phone").notNull(),
  idCardUrl: text("id_card_url").notNull(),
  selfieUrl: text("selfie_url").notNull(),
  salaryProofUrl: text("salary_proof_url").notNull(),
  justificationUrl: text("justification_url"),
  status: loanStatusEnum("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Currency Rates table
export const currencyRates = pgTable("currency_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromCurrency: varchar("from_currency", { length: 3 }).notNull(),
  toCurrency: varchar("to_currency", { length: 3 }).notNull(),
  rate: numeric("rate", { precision: 15, scale: 6 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System Settings table
export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  kycDocuments: many(kycDocuments),
  wallets: many(digitalWallets),
  transactions: many(transactions),
  loans: many(loans),
}));

export const kycDocumentsRelations = relations(kycDocuments, ({ one }) => ({
  user: one(users, {
    fields: [kycDocuments.userId],
    references: [users.id],
  }),
}));

export const digitalWalletsRelations = relations(digitalWallets, ({ one }) => ({
  user: one(users, {
    fields: [digitalWallets.userId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const loansRelations = relations(loans, ({ one }) => ({
  user: one(users, {
    fields: [loans.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  role: true,
  verificationStatus: true,
  balance: true,
});

export const insertKycDocumentSchema = createInsertSchema(kycDocuments).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
  status: true,
  rejectionReason: true,
});

export const insertDigitalWalletSchema = createInsertSchema(digitalWallets).omit({
  id: true,
  createdAt: true,
  balance: true,
  isVerified: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertLoanSchema = createInsertSchema(loans).omit({
  id: true,
  createdAt: true,
  status: true,
  approvedAt: true,
  rejectionReason: true,
});

export const insertCurrencyRateSchema = createInsertSchema(currencyRates).omit({
  id: true,
  updatedAt: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type KycDocument = typeof kycDocuments.$inferSelect;
export type InsertKycDocument = z.infer<typeof insertKycDocumentSchema>;
export type DigitalWallet = typeof digitalWallets.$inferSelect;
export type InsertDigitalWallet = z.infer<typeof insertDigitalWalletSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Loan = typeof loans.$inferSelect;
export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type CurrencyRate = typeof currencyRates.$inferSelect;
export type InsertCurrencyRate = z.infer<typeof insertCurrencyRateSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
