import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { insertUserSchema, insertKycDocumentSchema, insertLoanSchema, insertTransactionSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import { sendDepositReference, sendKycStatusEmail, sendLoanStatusEmail } from "./email";
import multer from "multer";
import path from "path";
import fs from "fs";

declare module "express-session" {
  interface SessionData {
    userId: string;
    userRole: string;
  }
}

// Setup file upload
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Session middleware
function getSessionMiddleware() {
  return session({
    secret: process.env.SESSION_SECRET || "cyb-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  });
}

// Auth middleware
function isAuthenticated(req: any, res: any, next: any) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "Não autorizado" });
}

// Admin middleware
function isAdmin(req: any, res: any, next: any) {
  if (req.session && req.session.userId && req.session.userRole === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Acesso negado" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(getSessionMiddleware());

  // Initialize default currency rates
  const defaultRates = [
    { fromCurrency: "EUR", toCurrency: "KZ", rate: "1050.00" },
    { fromCurrency: "USD", toCurrency: "KZ", rate: "900.00" },
    { fromCurrency: "EUR", toCurrency: "USD", rate: "1.08" },
  ];

  for (const rate of defaultRates) {
    const existing = await storage.getCurrencyRate(rate.fromCurrency, rate.toCurrency);
    if (!existing) {
      await storage.updateCurrencyRate(rate);
    }
  }

  // Initialize default admin user
  const adminEmail = "admin@cyb.com";
  const existingAdmin = await storage.getUserByEmail(adminEmail);
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await storage.createUser({
      email: adminEmail,
      phone: "+244900000000",
      password: hashedPassword,
      fullName: "Administrador",
      dateOfBirth: "1990-01-01",
    });
    const admin = await storage.getUserByEmail(adminEmail);
    if (admin) {
      await storage.updateUser(admin.id, { role: "admin", verificationStatus: "approved" });
    }
  }

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      // Check if email or phone already exists
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email já está em uso" });
      }

      const existingPhone = await storage.getUserByPhone(data.phone);
      if (existingPhone) {
        return res.status(400).json({ message: "Telefone já está em uso" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      req.session.userId = user.id;
      req.session.userRole = user.role;

      res.json({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        verificationStatus: user.verificationStatus,
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ message: error.message || "Erro ao criar conta" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { emailOrPhone, password } = req.body;

      let user = await storage.getUserByEmail(emailOrPhone);
      if (!user) {
        user = await storage.getUserByPhone(emailOrPhone);
      }

      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      req.session.userId = user.id;
      req.session.userRole = user.role;

      res.json({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        verificationStatus: user.verificationStatus,
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ message: error.message || "Erro ao fazer login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.json({ message: "Logout realizado com sucesso" });
    });
  });

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      res.json({
        id: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
        verificationStatus: user.verificationStatus,
        balance: user.balance,
      });
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Erro ao buscar usuário" });
    }
  });

  // KYC routes
  app.post("/api/kyc", isAuthenticated, upload.fields([
    { name: "idCard", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
    { name: "proofOfAddress", maxCount: 1 },
  ]), async (req: any, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files.idCard || !files.selfie || !files.proofOfAddress) {
        return res.status(400).json({ message: "Todos os documentos são obrigatórios" });
      }

      const documents = [
        { type: "id_card", file: files.idCard[0] },
        { type: "selfie", file: files.selfie[0] },
        { type: "proof_of_address", file: files.proofOfAddress[0] },
      ];

      const createdDocs = [];
      for (const doc of documents) {
        const kycDoc = await storage.createKycDocument({
          userId: req.session.userId,
          documentType: doc.type,
          documentUrl: `/uploads/${doc.file.filename}`,
        });
        createdDocs.push(kycDoc);
      }

      res.json(createdDocs);
    } catch (error: any) {
      console.error("KYC upload error:", error);
      res.status(400).json({ message: error.message || "Erro ao enviar documentos" });
    }
  });

  app.get("/api/kyc", isAuthenticated, async (req: any, res) => {
    try {
      const documents = await storage.getKycDocumentsByUserId(req.session.userId);
      res.json(documents);
    } catch (error: any) {
      console.error("Get KYC error:", error);
      res.status(500).json({ message: "Erro ao buscar documentos" });
    }
  });

  // Transaction routes
  app.post("/api/transactions/deposit", isAuthenticated, async (req: any, res) => {
    try {
      const { amount, currency } = req.body;
      
      // Generate reference
      const reference = `DEP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const transaction = await storage.createTransaction({
        userId: req.session.userId,
        type: "deposit",
        amount,
        currency,
        description: `Depósito de ${amount} ${currency}`,
        reference,
      });

      // Send email with reference
      const user = await storage.getUser(req.session.userId);
      if (user) {
        await sendDepositReference(user.email, user.fullName, amount, currency, reference);
      }

      res.json(transaction);
    } catch (error: any) {
      console.error("Deposit error:", error);
      res.status(400).json({ message: error.message || "Erro ao processar depósito" });
    }
  });

  app.post("/api/transactions/withdraw", isAuthenticated, async (req: any, res) => {
    try {
      const { amount, currency } = req.body;
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const userBalance = parseFloat(user.balance);
      const withdrawAmount = parseFloat(amount);
      
      if (userBalance < withdrawAmount) {
        return res.status(400).json({ message: "Saldo insuficiente" });
      }

      const transaction = await storage.createTransaction({
        userId: req.session.userId,
        type: "withdraw",
        amount,
        currency,
        description: `Levantamento de ${amount} ${currency}`,
      });

      res.json(transaction);
    } catch (error: any) {
      console.error("Withdraw error:", error);
      res.status(400).json({ message: error.message || "Erro ao processar levantamento" });
    }
  });

  app.post("/api/transactions/exchange", isAuthenticated, async (req: any, res) => {
    try {
      const { amount, fromCurrency, toCurrency } = req.body;
      
      const rate = await storage.getCurrencyRate(fromCurrency, toCurrency);
      if (!rate) {
        return res.status(400).json({ message: "Taxa de câmbio não disponível" });
      }

      const exchangedAmount = parseFloat(amount) * parseFloat(rate.rate);

      const transaction = await storage.createTransaction({
        userId: req.session.userId,
        type: "exchange",
        amount,
        currency: fromCurrency,
        description: `Troca de ${amount} ${fromCurrency} para ${exchangedAmount.toFixed(2)} ${toCurrency}`,
      });

      res.json(transaction);
    } catch (error: any) {
      console.error("Exchange error:", error);
      res.status(400).json({ message: error.message || "Erro ao processar troca" });
    }
  });

  app.get("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const transactions = await storage.getTransactionsByUserId(req.session.userId);
      res.json(transactions);
    } catch (error: any) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Erro ao buscar transações" });
    }
  });

  // Loan routes
  app.post("/api/loans", isAuthenticated, upload.fields([
    { name: "idCard", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
    { name: "salaryProof", maxCount: 1 },
    { name: "justification", maxCount: 1 },
  ]), async (req: any, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files.idCard || !files.selfie || !files.salaryProof) {
        return res.status(400).json({ message: "Documentos obrigatórios em falta" });
      }

      const loanData = {
        ...req.body,
        userId: req.session.userId,
        idCardUrl: `/uploads/${files.idCard[0].filename}`,
        selfieUrl: `/uploads/${files.selfie[0].filename}`,
        salaryProofUrl: `/uploads/${files.salaryProof[0].filename}`,
        justificationUrl: files.justification ? `/uploads/${files.justification[0].filename}` : null,
      };

      const loan = await storage.createLoan(loanData);
      res.json(loan);
    } catch (error: any) {
      console.error("Loan application error:", error);
      res.status(400).json({ message: error.message || "Erro ao solicitar empréstimo" });
    }
  });

  app.get("/api/loans", isAuthenticated, async (req: any, res) => {
    try {
      const loans = await storage.getLoansByUserId(req.session.userId);
      res.json(loans);
    } catch (error: any) {
      console.error("Get loans error:", error);
      res.status(500).json({ message: "Erro ao buscar empréstimos" });
    }
  });

  // Currency rates routes
  app.get("/api/currency-rates", async (req, res) => {
    try {
      const rates = await storage.getAllCurrencyRates();
      res.json(rates);
    } catch (error: any) {
      console.error("Get currency rates error:", error);
      res.status(500).json({ message: "Erro ao buscar taxas de câmbio" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      console.error("Get all users error:", error);
      res.status(500).json({ message: "Erro ao buscar usuários" });
    }
  });

  app.get("/api/admin/kyc/pending", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const documents = await storage.getPendingKycDocuments();
      res.json(documents);
    } catch (error: any) {
      console.error("Get pending KYC error:", error);
      res.status(500).json({ message: "Erro ao buscar documentos pendentes" });
    }
  });

  app.patch("/api/admin/kyc/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;

      const document = await storage.updateKycDocument(id, {
        status,
        rejectionReason,
        reviewedAt: new Date(),
      });

      // Get user and send notification
      const kycDoc = await storage.getKycDocumentsByUserId(document.userId);
      if (kycDoc.length > 0) {
        const user = await storage.getUser(document.userId);
        if (user) {
          // Check if all documents are approved
          const allDocs = await storage.getKycDocumentsByUserId(document.userId);
          const allApproved = allDocs.every(doc => doc.status === "approved");
          
          if (allApproved) {
            await storage.updateUser(user.id, { verificationStatus: "approved" });
            await sendKycStatusEmail(user.email, user.fullName, "approved");
          } else if (status === "rejected") {
            await storage.updateUser(user.id, { verificationStatus: "rejected" });
            await sendKycStatusEmail(user.email, user.fullName, "rejected", rejectionReason);
          }
        }
      }

      res.json(document);
    } catch (error: any) {
      console.error("Update KYC error:", error);
      res.status(400).json({ message: error.message || "Erro ao atualizar documento" });
    }
  });

  app.get("/api/admin/loans/pending", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const loans = await storage.getPendingLoans();
      res.json(loans);
    } catch (error: any) {
      console.error("Get pending loans error:", error);
      res.status(500).json({ message: "Erro ao buscar empréstimos pendentes" });
    }
  });

  app.get("/api/admin/loans", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const loans = await storage.getAllLoans();
      res.json(loans);
    } catch (error: any) {
      console.error("Get all loans error:", error);
      res.status(500).json({ message: "Erro ao buscar empréstimos" });
    }
  });

  app.patch("/api/admin/loans/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;

      const loan = await storage.updateLoan(id, {
        status,
        rejectionReason,
        approvedAt: status === "approved" ? new Date() : undefined,
      });

      // Send notification
      const user = await storage.getUser(loan.userId);
      if (user) {
        await sendLoanStatusEmail(
          user.email,
          user.fullName,
          status,
          loan.amount,
          rejectionReason
        );
      }

      res.json(loan);
    } catch (error: any) {
      console.error("Update loan error:", error);
      res.status(400).json({ message: error.message || "Erro ao atualizar empréstimo" });
    }
  });

  app.patch("/api/admin/currency-rates", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { rates } = req.body;
      
      const updatedRates = [];
      for (const rate of rates) {
        const updated = await storage.updateCurrencyRate(rate);
        updatedRates.push(updated);
      }

      res.json(updatedRates);
    } catch (error: any) {
      console.error("Update currency rates error:", error);
      res.status(400).json({ message: error.message || "Erro ao atualizar taxas" });
    }
  });

  // Serve uploaded files
  app.use("/uploads", express.static(uploadDir));

  const httpServer = createServer(app);
  return httpServer;
}
