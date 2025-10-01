import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterModal({ open, onClose, onSwitchToLogin }: RegisterModalProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (formData.password !== formData.confirmPassword) {
        throw new Error("As senhas não coincidem");
      }
      const res = await apiRequest("POST", "/api/auth/register", {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        password: formData.password,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Conta criada!",
        description: "Agora você precisa verificar sua identidade enviando documentos",
      });
      onClose();
      navigate("/dashboard");
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
    registerMutation.mutate();
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold" data-testid="text-register-title">Criar Conta</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-semibold">Nome Completo</Label>
              <Input 
                id="fullName"
                type="text" 
                placeholder="Seu nome completo" 
                value={formData.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                required 
                data-testid="input-fullname"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
              <Input 
                id="email"
                type="email" 
                placeholder="seu@email.com" 
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                required 
                data-testid="input-email"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold">Telefone</Label>
              <Input 
                id="phone"
                type="tel" 
                placeholder="+244 900 000 000" 
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                required 
                data-testid="input-phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-sm font-semibold">Data de Nascimento</Label>
              <Input 
                id="dateOfBirth"
                type="date" 
                value={formData.dateOfBirth}
                onChange={(e) => updateField("dateOfBirth", e.target.value)}
                required 
                data-testid="input-dob"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">Senha</Label>
              <Input 
                id="password"
                type="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => updateField("password", e.target.value)}
                required 
                data-testid="input-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold">Confirmar Senha</Label>
              <Input 
                id="confirmPassword"
                type="password" 
                placeholder="••••••••" 
                value={formData.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                required 
                data-testid="input-confirm-password"
              />
            </div>
          </div>
          
          <Alert className="bg-muted/20 border-border">
            <i className="fas fa-info-circle text-primary"></i>
            <AlertDescription>
              <strong className="font-semibold">Verificação de Identidade</strong>
              <p className="text-sm mt-1">
                Após o cadastro, você precisará verificar sua identidade enviando documentos (BI, selfie e comprovativo de residência).
              </p>
            </AlertDescription>
          </Alert>
          
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="w-5 h-5 mt-1" required data-testid="checkbox-terms" />
            <span className="text-sm text-muted-foreground">
              Aceito os <a href="#" className="text-primary hover:underline">Termos de Uso</a> e 
              <a href="#" className="text-primary hover:underline ml-1">Política de Privacidade</a>
            </span>
          </label>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-[hsl(35,100%,45%)] text-primary-foreground font-semibold hover:shadow-lg"
            disabled={registerMutation.isPending}
            data-testid="button-submit-register"
          >
            {registerMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Criando...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus mr-2"></i>
                Criar Conta
              </>
            )}
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            Já tem conta? {" "}
            <button 
              type="button" 
              onClick={onSwitchToLogin} 
              className="text-primary hover:underline"
              data-testid="button-switch-login"
            >
              Entrar
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
