import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DepositModal({ open, onClose }: DepositModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("KZ");

  const depositMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/transactions/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount, currency }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Referência gerada!",
        description: "Verifique seu email para os detalhes do depósito",
      });
      onClose();
      setAmount("");
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
    depositMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold" data-testid="text-deposit-title">Depositar Fundos</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input 
              id="amount"
              type="number" 
              placeholder="100.000" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required 
              min="1"
              data-testid="input-deposit-amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Moeda</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency" data-testid="select-deposit-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KZ">Kwanza (KZ)</SelectItem>
                <SelectItem value="USD">Dólar (USD)</SelectItem>
                <SelectItem value="EUR">Euro (EUR)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/20 border border-border rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <i className="fas fa-info-circle text-primary"></i>
              Como funciona?
            </h4>
            <p className="text-xs text-muted-foreground">
              Após confirmar, você receberá um email com a referência de depósito e as coordenadas bancárias da empresa. 
              Faça a transferência bancária usando essa referência.
            </p>
          </div>

          <div className="flex gap-4">
            <Button 
              type="button" 
              onClick={onClose}
              variant="outline"
              className="flex-1"
              data-testid="button-cancel-deposit"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-primary to-[hsl(35,100%,45%)] text-primary-foreground font-semibold hover:shadow-lg"
              disabled={depositMutation.isPending}
              data-testid="button-submit-deposit"
            >
              {depositMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Gerando...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  Gerar Referência
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
