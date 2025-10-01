import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import KycModal from "@/components/modals/kyc-modal";
import DepositModal from "@/components/modals/deposit-modal";
import WithdrawModal from "@/components/modals/withdraw-modal";
import ExchangeModal from "@/components/modals/exchange-modal";
import LoanApplicationModal from "@/components/modals/loan-application-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showKycModal, setShowKycModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: !!user,
  });

  const { data: loans, isLoading: loansLoading } = useQuery({
    queryKey: ["/api/loans"],
    enabled: !!user,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.clear();
      navigate("/");
    },
  });

  useEffect(() => {
    if (!userLoading && !user) {
      toast({
        title: "Não autorizado",
        description: "Por favor, faça login para acessar o dashboard",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, userLoading, navigate, toast]);

  if (userLoading) {
    return (
      <div className="min-h-screen">
        <Navbar onLogin={() => {}} onRegister={() => {}} />
        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const balance = parseFloat(user.balance || "0");
  const recentTransactions = transactions?.slice(0, 5) || [];
  const needsKyc = user.verificationStatus === "pending";

  return (
    <div className="min-h-screen">
      <Navbar 
        onLogin={() => {}} 
        onRegister={() => {}}
        isAuthenticated={true}
        onLogout={() => logoutMutation.mutate()}
        userRole={user.role}
      />

      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* KYC Warning */}
          {needsKyc && (
            <Card className="bg-yellow-500/10 border-yellow-500/20" data-testid="card-kyc-warning">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <i className="fas fa-exclamation-triangle text-3xl text-yellow-500"></i>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">Verificação de Identidade Necessária</h3>
                    <p className="text-muted-foreground mb-4">
                      Para usar todos os recursos da plataforma, você precisa verificar sua identidade enviando documentos.
                    </p>
                    <button 
                      onClick={() => setShowKycModal(true)}
                      className="bg-gradient-to-r from-primary to-[hsl(35,100%,45%)] text-primary-foreground font-semibold py-2 px-6 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all"
                      data-testid="button-start-kyc"
                    >
                      Verificar Agora
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Balance Card */}
          <Card className="gradient-dark rounded-xl" data-testid="card-balance">
            <CardContent className="p-8 text-center space-y-4">
              <div className="text-sm text-muted-foreground">Saldo Total Disponível</div>
              <div className="text-5xl font-bold text-primary" data-testid="text-balance">
                {balance.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} KZ
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-green-400">
                <i className="fas fa-arrow-up"></i>
                <span>Gerencie seus fundos abaixo</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card 
              className="bg-card border-border hover:border-primary hover:scale-105 transition-all cursor-pointer"
              onClick={() => setShowDepositModal(true)}
              data-testid="card-action-deposit"
            >
              <CardContent className="p-6 flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <i className="fas fa-plus text-xl text-primary"></i>
                </div>
                <span className="font-semibold">Depositar</span>
              </CardContent>
            </Card>

            <Card 
              className="bg-card border-border hover:border-primary hover:scale-105 transition-all cursor-pointer"
              onClick={() => setShowExchangeModal(true)}
              data-testid="card-action-exchange"
            >
              <CardContent className="p-6 flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <i className="fas fa-exchange-alt text-xl text-accent"></i>
                </div>
                <span className="font-semibold">Trocar</span>
              </CardContent>
            </Card>

            <Card 
              className="bg-card border-border hover:border-primary hover:scale-105 transition-all cursor-pointer"
              onClick={() => setShowWithdrawModal(true)}
              data-testid="card-action-withdraw"
            >
              <CardContent className="p-6 flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <i className="fas fa-arrow-down text-xl text-primary"></i>
                </div>
                <span className="font-semibold">Levantar</span>
              </CardContent>
            </Card>

            <Card 
              className="bg-card border-border hover:border-primary hover:scale-105 transition-all cursor-pointer"
              onClick={() => setShowLoanModal(true)}
              data-testid="card-action-loan"
            >
              <CardContent className="p-6 flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <i className="fas fa-hand-holding-usd text-xl text-accent"></i>
                </div>
                <span className="font-semibold">Empréstimo</span>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card data-testid="card-transactions">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-history text-primary"></i>
                Últimos Movimentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {transactionsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
                </div>
              ) : recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <i className="fas fa-inbox text-4xl mb-4 block"></i>
                  Nenhuma transação ainda
                </div>
              ) : (
                recentTransactions.map((transaction: any, idx: number) => (
                  <Card key={transaction.id} className="bg-card border-border" data-testid={`transaction-${idx}`}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'deposit' ? 'bg-green-500/20' : 
                          transaction.type === 'withdraw' ? 'bg-red-500/20' : 'bg-primary/20'
                        }`}>
                          <i className={`fas ${
                            transaction.type === 'deposit' ? 'fa-arrow-down text-green-400' : 
                            transaction.type === 'withdraw' ? 'fa-arrow-up text-red-400' : 
                            'fa-exchange-alt text-primary'
                          }`}></i>
                        </div>
                        <div>
                          <div className="font-semibold">{transaction.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleString('pt-AO')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${
                          transaction.type === 'deposit' ? 'text-green-400' : 
                          transaction.type === 'withdraw' ? 'text-red-400' : 'text-primary'
                        }`}>
                          {transaction.type === 'withdraw' ? '-' : '+'}{parseFloat(transaction.amount).toLocaleString('pt-AO')} {transaction.currency}
                        </div>
                        <div className={`text-xs status-badge status-${transaction.status}`}>
                          {transaction.status === 'pending' ? 'Pendente' : transaction.status === 'approved' ? 'Aprovado' : 'Recusado'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* Loans */}
          {loans && loans.length > 0 && (
            <Card data-testid="card-loans">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-file-invoice-dollar text-primary"></i>
                  Meus Empréstimos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loans.map((loan: any, idx: number) => (
                  <Card key={loan.id} className="bg-card border-border" data-testid={`loan-${idx}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-bold">Empréstimo de {parseFloat(loan.amount).toLocaleString('pt-AO')} KZ</h4>
                          <p className="text-sm text-muted-foreground">Solicitado em {new Date(loan.createdAt).toLocaleDateString('pt-AO')}</p>
                        </div>
                        <span className={`status-badge status-${loan.status}`}>
                          {loan.status === 'pending' ? 'Em Análise' : 
                           loan.status === 'approved' ? 'Aprovado' : 
                           loan.status === 'rejected' ? 'Recusado' : loan.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Prazo</div>
                          <div className="font-semibold">{loan.termMonths} meses</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Taxa</div>
                          <div className="font-semibold">{loan.interestRate}% a.a.</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Parcela</div>
                          <div className="font-semibold text-primary">{parseFloat(loan.monthlyPayment).toLocaleString('pt-AO')} KZ</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />

      <KycModal open={showKycModal} onClose={() => setShowKycModal(false)} />
      <DepositModal open={showDepositModal} onClose={() => setShowDepositModal(false)} />
      <WithdrawModal open={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} />
      <ExchangeModal open={showExchangeModal} onClose={() => setShowExchangeModal(false)} />
      <LoanApplicationModal open={showLoanModal} onClose={() => setShowLoanModal(false)} />
    </div>
  );
}
