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

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
}

export default function WithdrawModal({ open, onClose }: WithdrawModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("KZ");

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/transactions/withdraw", {
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
        title: "Pedido registrado!",
        description: "Seu pedido de levantamento está em processamento",
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
    withdrawMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold" data-testid="text-withdraw-title">Levantar Fundos</DialogTitle>
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
              data-testid="input-withdraw-amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Moeda</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency" data-testid="select-withdraw-currency">
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
              Informação importante
            </h4>
            <p className="text-xs text-muted-foreground">
              Após a confirmação, nossa equipe processará o levantamento e transferirá os fundos para sua conta bancária em até 24 horas úteis.
            </p>
          </div>

          <div className="flex gap-4">
            <Button 
              type="button" 
              onClick={onClose}
              variant="outline"
              className="flex-1"
              data-testid="button-cancel-withdraw"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-primary to-[hsl(35,100%,45%)] text-primary-foreground font-semibold hover:shadow-lg"
              disabled={withdrawMutation.isPending}
              data-testid="button-submit-withdraw"
            >
              {withdrawMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Processando...
                </>
              ) : (
                <>
                  <i className="fas fa-arrow-down mr-2"></i>
                  Solicitar Levantamento
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
