import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

interface ExchangeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ExchangeModal({ open, onClose }: ExchangeModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("EUR");
  const [toCurrency, setToCurrency] = useState("KZ");

  const { data: rates } = useQuery({
    queryKey: ["/api/currency-rates"],
  });

  const getCurrentRate = () => {
    if (!rates) return null;
    const rate = rates.find((r: any) => 
      r.fromCurrency === fromCurrency && r.toCurrency === toCurrency
    );
    return rate ? parseFloat(rate.rate) : null;
  };

  const calculateExchanged = () => {
    const rate = getCurrentRate();
    if (!rate || !amount) return 0;
    return (parseFloat(amount) * rate).toFixed(2);
  };

  const exchangeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/transactions/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount, fromCurrency, toCurrency }),
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
        title: "Troca solicitada!",
        description: "Sua solicitação de câmbio está em processamento",
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
    exchangeMutation.mutate();
  };

  const currentRate = getCurrentRate();
  const exchangedAmount = calculateExchanged();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold" data-testid="text-exchange-title">Trocar Moeda</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fromCurrency">De</Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger id="fromCurrency" data-testid="select-from-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                <SelectItem value="USD">Dólar (USD)</SelectItem>
                <SelectItem value="KZ">Kwanza (KZ)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input 
              id="amount"
              type="number" 
              placeholder="1000" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required 
              min="1"
              step="0.01"
              data-testid="input-exchange-amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="toCurrency">Para</Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger id="toCurrency" data-testid="select-to-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                <SelectItem value="USD">Dólar (USD)</SelectItem>
                <SelectItem value="KZ">Kwanza (KZ)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {currentRate && amount && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4" data-testid="exchange-preview">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Taxa atual:</span>
                <span className="font-semibold">{currentRate.toFixed(6)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Você receberá:</span>
                <span className="text-xl font-bold text-primary" data-testid="text-exchanged-amount">
                  {exchangedAmount} {toCurrency}
                </span>
              </div>
            </div>
          )}

          <div className="bg-muted/20 border border-border rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <i className="fas fa-info-circle text-primary"></i>
              Como funciona?
            </h4>
            <p className="text-xs text-muted-foreground">
              A troca será processada pela nossa equipe. Os fundos trocados estarão disponíveis em sua conta após a confirmação.
            </p>
          </div>

          <div className="flex gap-4">
            <Button 
              type="button" 
              onClick={onClose}
              variant="outline"
              className="flex-1"
              data-testid="button-cancel-exchange"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-primary to-[hsl(35,100%,45%)] text-primary-foreground font-semibold hover:shadow-lg"
              disabled={exchangeMutation.isPending || !currentRate}
              data-testid="button-submit-exchange"
            >
              {exchangeMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Trocando...
                </>
              ) : (
                <>
                  <i className="fas fa-exchange-alt mr-2"></i>
                  Trocar Agora
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
