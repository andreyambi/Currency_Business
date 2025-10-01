import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Admin() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rates, setRates] = useState({
    eurKz: "",
    usdKz: "",
    eurUsd: "",
  });

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!user && user.role === "admin",
  });

  const { data: pendingKyc } = useQuery({
    queryKey: ["/api/admin/kyc/pending"],
    enabled: !!user && user.role === "admin",
  });

  const { data: pendingLoans } = useQuery({
    queryKey: ["/api/admin/loans/pending"],
    enabled: !!user && user.role === "admin",
  });

  const { data: allLoans } = useQuery({
    queryKey: ["/api/admin/loans"],
    enabled: !!user && user.role === "admin",
  });

  const { data: currencyRates } = useQuery({
    queryKey: ["/api/currency-rates"],
    enabled: !!user && user.role === "admin",
  });

  useEffect(() => {
    if (currencyRates) {
      const eurKzRate = currencyRates.find((r: any) => r.fromCurrency === "EUR" && r.toCurrency === "KZ");
      const usdKzRate = currencyRates.find((r: any) => r.fromCurrency === "USD" && r.toCurrency === "KZ");
      const eurUsdRate = currencyRates.find((r: any) => r.fromCurrency === "EUR" && r.toCurrency === "USD");
      
      setRates({
        eurKz: eurKzRate ? eurKzRate.rate : "",
        usdKz: usdKzRate ? usdKzRate.rate : "",
        eurUsd: eurUsdRate ? eurUsdRate.rate : "",
      });
    }
  }, [currencyRates]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.clear();
      navigate("/");
    },
  });

  const updateKycMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      await apiRequest("PATCH", `/api/admin/kyc/${id}`, {
        status,
        rejectionReason: reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kyc/pending"] });
      toast({
        title: "Atualizado!",
        description: "Status do documento KYC atualizado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateLoanMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      await apiRequest("PATCH", `/api/admin/loans/${id}`, {
        status,
        rejectionReason: reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/loans/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/loans"] });
      toast({
        title: "Atualizado!",
        description: "Status do empréstimo atualizado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateRatesMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", "/api/admin/currency-rates", {
        rates: [
          { fromCurrency: "EUR", toCurrency: "KZ", rate: rates.eurKz },
          { fromCurrency: "USD", toCurrency: "KZ", rate: rates.usdKz },
          { fromCurrency: "EUR", toCurrency: "USD", rate: rates.eurUsd },
        ],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/currency-rates"] });
      toast({
        title: "Atualizado!",
        description: "Taxas de câmbio atualizadas com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!userLoading && (!user || user.role !== "admin")) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página",
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
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

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
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4" data-testid="text-admin-title">
              Painel <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Administrativo</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Controle total sobre usuários, pedidos e configurações
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card border-border" data-testid="stat-users">
              <CardContent className="p-6 text-center space-y-2">
                <div className="text-3xl font-bold text-primary">{users?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Usuários Ativos</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border" data-testid="stat-pending-kyc">
              <CardContent className="p-6 text-center space-y-2">
                <div className="text-3xl font-bold text-accent">{pendingKyc?.length || 0}</div>
                <div className="text-sm text-muted-foreground">KYC Pendentes</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border" data-testid="stat-pending-loans">
              <CardContent className="p-6 text-center space-y-2">
                <div className="text-3xl font-bold text-primary">{pendingLoans?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Empréstimos Pendentes</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border" data-testid="stat-total-loans">
              <CardContent className="p-6 text-center space-y-2">
                <div className="text-3xl font-bold text-accent">{allLoans?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Total Empréstimos</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users" data-testid="tab-users">Usuários</TabsTrigger>
              <TabsTrigger value="kyc" data-testid="tab-kyc">KYC</TabsTrigger>
              <TabsTrigger value="loans" data-testid="tab-loans">Empréstimos</TabsTrigger>
              <TabsTrigger value="settings" data-testid="tab-settings">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Gestão de Usuários</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Saldo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((u: any) => (
                        <TableRow key={u.id} data-testid={`user-row-${u.id}`}>
                          <TableCell>{u.fullName}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <span className={`status-badge status-${u.verificationStatus}`}>
                              {u.verificationStatus === 'approved' ? 'Verificado' : u.verificationStatus === 'pending' ? 'Pendente' : 'Recusado'}
                            </span>
                          </TableCell>
                          <TableCell className="font-semibold">{parseFloat(u.balance).toLocaleString('pt-AO')} KZ</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="kyc">
              <Card>
                <CardHeader>
                  <CardTitle>Verificações KYC Pendentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingKyc?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma verificação pendente
                    </div>
                  ) : (
                    pendingKyc?.map((doc: any) => {
                      const docUser = users?.find((u: any) => u.id === doc.userId);
                      return (
                        <Card key={doc.id} className="bg-card border-border" data-testid={`kyc-${doc.id}`}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="font-bold">{docUser?.fullName}</h4>
                                <p className="text-sm text-muted-foreground">{docUser?.email}</p>
                              </div>
                              <span className="status-badge status-pending">Aguardando Análise</span>
                            </div>

                            <div className="mb-4">
                              <p className="text-sm font-semibold mb-2">Tipo: {doc.documentType}</p>
                              <a 
                                href={doc.documentUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm"
                                data-testid={`link-view-doc-${doc.id}`}
                              >
                                Ver Documento <i className="fas fa-external-link-alt ml-1"></i>
                              </a>
                            </div>

                            <div className="flex gap-3">
                              <Button
                                onClick={() => updateKycMutation.mutate({ id: doc.id, status: "approved" })}
                                className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                disabled={updateKycMutation.isPending}
                                data-testid={`button-approve-kyc-${doc.id}`}
                              >
                                <i className="fas fa-check mr-2"></i>Aprovar
                              </Button>
                              <Button
                                onClick={() => {
                                  const reason = prompt("Motivo da recusa:");
                                  if (reason) {
                                    updateKycMutation.mutate({ id: doc.id, status: "rejected", reason });
                                  }
                                }}
                                variant="destructive"
                                className="flex-1"
                                disabled={updateKycMutation.isPending}
                                data-testid={`button-reject-kyc-${doc.id}`}
                              >
                                <i className="fas fa-times mr-2"></i>Recusar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="loans">
              <Card>
                <CardHeader>
                  <CardTitle>Pedidos de Empréstimo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingLoans?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum pedido pendente
                    </div>
                  ) : (
                    pendingLoans?.map((loan: any) => {
                      const loanUser = users?.find((u: any) => u.id === loan.userId);
                      return (
                        <Card key={loan.id} className="bg-card border-border" data-testid={`loan-${loan.id}`}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="font-bold">{loanUser?.fullName}</h4>
                                <p className="text-sm text-muted-foreground">Solicitou: {parseFloat(loan.amount).toLocaleString('pt-AO')} KZ</p>
                              </div>
                              <span className="status-badge status-pending">Em Análise</span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <div className="text-xs text-muted-foreground">Prazo</div>
                                <div className="font-semibold">{loan.termMonths} meses</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Taxa</div>
                                <div className="font-semibold">{loan.interestRate}% a.a.</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Parcela</div>
                                <div className="font-semibold text-primary">{parseFloat(loan.monthlyPayment).toLocaleString('pt-AO')} KZ</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Salário</div>
                                <div className="font-semibold">{parseFloat(loan.monthlySalary).toLocaleString('pt-AO')} KZ</div>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <Button
                                onClick={() => updateLoanMutation.mutate({ id: loan.id, status: "approved" })}
                                className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                disabled={updateLoanMutation.isPending}
                                data-testid={`button-approve-loan-${loan.id}`}
                              >
                                <i className="fas fa-check mr-2"></i>Aprovar
                              </Button>
                              <Button
                                onClick={() => {
                                  const reason = prompt("Motivo da recusa:");
                                  if (reason) {
                                    updateLoanMutation.mutate({ id: loan.id, status: "rejected", reason });
                                  }
                                }}
                                variant="destructive"
                                className="flex-1"
                                disabled={updateLoanMutation.isPending}
                                data-testid={`button-reject-loan-${loan.id}`}
                              >
                                <i className="fas fa-times mr-2"></i>Recusar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <div className="space-y-6">
                {/* Exchange Rates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <i className="fas fa-exchange-alt text-primary"></i>
                      Taxas de Câmbio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={(e) => { e.preventDefault(); updateRatesMutation.mutate(); }} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="eurKz">EUR → KZ</Label>
                          <Input 
                            id="eurKz"
                            type="number" 
                            step="0.01"
                            value={rates.eurKz}
                            onChange={(e) => setRates(prev => ({ ...prev, eurKz: e.target.value }))}
                            data-testid="input-rate-eur-kz"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="usdKz">USD → KZ</Label>
                          <Input 
                            id="usdKz"
                            type="number" 
                            step="0.01"
                            value={rates.usdKz}
                            onChange={(e) => setRates(prev => ({ ...prev, usdKz: e.target.value }))}
                            data-testid="input-rate-usd-kz"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="eurUsd">EUR → USD</Label>
                          <Input 
                            id="eurUsd"
                            type="number" 
                            step="0.01"
                            value={rates.eurUsd}
                            onChange={(e) => setRates(prev => ({ ...prev, eurUsd: e.target.value }))}
                            data-testid="input-rate-eur-usd"
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit"
                        className="bg-gradient-to-r from-primary to-[hsl(35,100%,45%)] text-primary-foreground"
                        disabled={updateRatesMutation.isPending}
                        data-testid="button-save-rates"
                      >
                        {updateRatesMutation.isPending ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Salvando...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save mr-2"></i>
                            Salvar Taxas
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}
