import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ANGOLAN_BANKS } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LoanApplicationModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoanApplicationModal({ open, onClose }: LoanApplicationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    amount: "",
    termMonths: "12",
    paymentDay: "25",
    monthlySalary: "",
    workplace: "",
    bankName: "",
    iban: "",
    emergencyContact1Name: "",
    emergencyContact1Phone: "",
    emergencyContact2Name: "",
    emergencyContact2Phone: "",
  });
  const [files, setFiles] = useState({
    idCard: null as File | null,
    selfie: null as File | null,
    salaryProof: null as File | null,
    justification: null as File | null,
  });

  const loanMutation = useMutation({
    mutationFn: async () => {
      const data = new FormData();
      
      // Calculate loan details
      const amount = parseFloat(formData.amount);
      const interestRate = 15; // Default rate, should be fetched from settings
      const termMonths = parseInt(formData.termMonths);
      const monthlyRate = (interestRate / 100) / 12;
      const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                            (Math.pow(1 + monthlyRate, termMonths) - 1);
      const totalPayment = monthlyPayment * termMonths;

      // Append form data
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      
      data.append("interestRate", interestRate.toString());
      data.append("monthlyPayment", monthlyPayment.toString());
      data.append("totalPayment", totalPayment.toString());
      
      // Append files
      if (files.idCard) data.append("idCard", files.idCard);
      if (files.selfie) data.append("selfie", files.selfie);
      if (files.salaryProof) data.append("salaryProof", files.salaryProof);
      if (files.justification) data.append("justification", files.justification);

      const res = await fetch("/api/loans", {
        method: "POST",
        body: data,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      toast({
        title: "Pedido enviado!",
        description: "Seu pedido de empréstimo está em análise. Você receberá uma notificação em breve.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.idCard || !files.selfie || !files.salaryProof) {
      toast({
        title: "Documentos em falta",
        description: "Por favor, envie todos os documentos obrigatórios",
        variant: "destructive",
      });
      return;
    }
    loanMutation.mutate();
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: keyof typeof files, file: File | null) => {
    setFiles(prev => ({ ...prev, [field]: file }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold" data-testid="text-loan-app-title">Solicitar Empréstimo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Loan Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <i className="fas fa-file-invoice-dollar text-primary"></i>
              Detalhes do Empréstimo
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (KZ)</Label>
                <Input 
                  id="amount"
                  type="number" 
                  placeholder="500.000" 
                  value={formData.amount}
                  onChange={(e) => updateField("amount", e.target.value)}
                  required 
                  data-testid="input-loan-amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="termMonths">Prazo (meses)</Label>
                <Select value={formData.termMonths} onValueChange={(v) => updateField("termMonths", v)}>
                  <SelectTrigger id="termMonths" data-testid="select-term">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 meses</SelectItem>
                    <SelectItem value="12">12 meses</SelectItem>
                    <SelectItem value="18">18 meses</SelectItem>
                    <SelectItem value="24">24 meses</SelectItem>
                    <SelectItem value="36">36 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentDay">Dia de Pagamento</Label>
                <Select value={formData.paymentDay} onValueChange={(v) => updateField("paymentDay", v)}>
                  <SelectTrigger id="paymentDay" data-testid="select-payment-day">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Dia 5</SelectItem>
                    <SelectItem value="10">Dia 10</SelectItem>
                    <SelectItem value="15">Dia 15</SelectItem>
                    <SelectItem value="20">Dia 20</SelectItem>
                    <SelectItem value="25">Dia 25</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Employment Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <i className="fas fa-briefcase text-primary"></i>
              Informações de Emprego
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlySalary">Salário Médio Mensal (KZ)</Label>
                <Input 
                  id="monthlySalary"
                  type="number" 
                  placeholder="200.000" 
                  value={formData.monthlySalary}
                  onChange={(e) => updateField("monthlySalary", e.target.value)}
                  required 
                  data-testid="input-salary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workplace">Local de Trabalho</Label>
                <Input 
                  id="workplace"
                  type="text" 
                  placeholder="Nome da empresa" 
                  value={formData.workplace}
                  onChange={(e) => updateField("workplace", e.target.value)}
                  required 
                  data-testid="input-workplace"
                />
              </div>
            </div>
          </div>
          
          {/* Bank Account */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <i className="fas fa-university text-primary"></i>
              Conta Bancária
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Banco</Label>
                <Select value={formData.bankName} onValueChange={(v) => updateField("bankName", v)}>
                  <SelectTrigger id="bankName" data-testid="select-bank">
                    <SelectValue placeholder="Selecione seu banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {ANGOLAN_BANKS.map(bank => (
                      <SelectItem key={bank.value} value={bank.value}>{bank.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input 
                  id="iban"
                  type="text" 
                  placeholder="AO06 0000 0000 0000 0000 0000 0" 
                  value={formData.iban}
                  onChange={(e) => updateField("iban", e.target.value)}
                  required 
                  data-testid="input-iban"
                />
              </div>
            </div>
          </div>
          
          {/* Emergency Contacts */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <i className="fas fa-phone text-primary"></i>
              Contactos de Emergência
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact1Name">Contacto 1 - Nome</Label>
                  <Input 
                    id="contact1Name"
                    type="text" 
                    placeholder="Nome completo" 
                    value={formData.emergencyContact1Name}
                    onChange={(e) => updateField("emergencyContact1Name", e.target.value)}
                    required 
                    data-testid="input-contact1-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact1Phone">Contacto 1 - Telefone</Label>
                  <Input 
                    id="contact1Phone"
                    type="tel" 
                    placeholder="+244 900 000 000" 
                    value={formData.emergencyContact1Phone}
                    onChange={(e) => updateField("emergencyContact1Phone", e.target.value)}
                    required 
                    data-testid="input-contact1-phone"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact2Name">Contacto 2 - Nome</Label>
                  <Input 
                    id="contact2Name"
                    type="text" 
                    placeholder="Nome completo" 
                    value={formData.emergencyContact2Name}
                    onChange={(e) => updateField("emergencyContact2Name", e.target.value)}
                    required 
                    data-testid="input-contact2-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact2Phone">Contacto 2 - Telefone</Label>
                  <Input 
                    id="contact2Phone"
                    type="tel" 
                    placeholder="+244 900 000 000" 
                    value={formData.emergencyContact2Phone}
                    onChange={(e) => updateField("emergencyContact2Phone", e.target.value)}
                    required 
                    data-testid="input-contact2-phone"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Documents */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <i className="fas fa-file-upload text-primary"></i>
              Documentos Necessários
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idCard">Bilhete de Identidade (BI)</Label>
                <Input 
                  id="idCard"
                  type="file" 
                  accept="image/*,.pdf" 
                  onChange={(e) => handleFileChange("idCard", e.target.files?.[0] || null)}
                  required 
                  data-testid="input-id-card"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="selfie">Selfie com BI</Label>
                <Input 
                  id="selfie"
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange("selfie", e.target.files?.[0] || null)}
                  required 
                  data-testid="input-selfie"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryProof">Comprovativo de Salário</Label>
                <Input 
                  id="salaryProof"
                  type="file" 
                  accept="image/*,.pdf" 
                  onChange={(e) => handleFileChange("salaryProof", e.target.files?.[0] || null)}
                  required 
                  data-testid="input-salary-proof"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="justification">Justificativa (opcional)</Label>
                <Input 
                  id="justification"
                  type="file" 
                  accept="image/*,.pdf" 
                  onChange={(e) => handleFileChange("justification", e.target.files?.[0] || null)}
                  data-testid="input-justification"
                />
              </div>
            </div>
          </div>
          
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="w-5 h-5 mt-1" required data-testid="checkbox-loan-terms" />
            <span className="text-sm text-muted-foreground">
              Declaro que todas as informações fornecidas são verdadeiras e concordo com os {" "}
              <a href="#" className="text-primary hover:underline">termos do empréstimo</a>
            </span>
          </label>
          
          <div className="flex gap-4">
            <Button 
              type="button" 
              onClick={onClose}
              variant="outline"
              className="flex-1"
              data-testid="button-cancel-loan"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-primary to-[hsl(35,100%,45%)] text-primary-foreground font-semibold hover:shadow-lg"
              disabled={loanMutation.isPending}
              data-testid="button-submit-loan"
            >
              {loanMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Enviando...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  Enviar Pedido
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
