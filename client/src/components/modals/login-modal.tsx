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

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginModal({ open, onClose, onSwitchToRegister }: LoginModalProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/login", {
        emailOrPhone,
        password,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Sucesso!",
        description: "Login realizado com sucesso",
      });
      onClose();
      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
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
    loginMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold" data-testid="text-login-title">Entrar</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-or-phone" className="text-sm font-semibold">Email ou Telefone</Label>
            <Input 
              id="email-or-phone"
              type="text" 
              placeholder="seu@email.com ou +244..." 
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              required 
              data-testid="input-email-or-phone"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold">Senha</Label>
            <Input 
              id="password"
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              data-testid="input-password"
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" data-testid="checkbox-remember" />
              <span className="text-muted-foreground">Lembrar-me</span>
            </label>
            <a href="#" className="text-primary hover:underline" data-testid="link-forgot-password">Esqueci a senha</a>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-[hsl(35,100%,45%)] text-primary-foreground font-semibold hover:shadow-lg"
            disabled={loginMutation.isPending}
            data-testid="button-submit-login"
          >
            {loginMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Entrando...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt mr-2"></i>
                Entrar
              </>
            )}
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            Não tem conta? {" "}
            <button 
              type="button" 
              onClick={onSwitchToRegister} 
              className="text-primary hover:underline"
              data-testid="button-switch-register"
            >
              Cadastre-se
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
