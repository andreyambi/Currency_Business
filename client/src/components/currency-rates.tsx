import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

export default function CurrencyRates() {
  const { data: rates, isLoading } = useQuery({
    queryKey: ["/api/currency-rates"],
  });

  if (isLoading) {
    return (
      <Card className="glass-card rounded-2xl p-6 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  const rateMap = rates?.reduce((acc: any, rate: any) => {
    const key = `${rate.fromCurrency}-${rate.toCurrency}`;
    acc[key] = rate;
    return acc;
  }, {});

  const eurToKz = rateMap?.["EUR-KZ"];
  const usdToKz = rateMap?.["USD-KZ"];
  const eurToUsd = rateMap?.["EUR-USD"];

  return (
    <Card className="glass-card rounded-2xl p-6 space-y-4" data-testid="card-currency-rates">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2" data-testid="text-rates-title">
          <i className="fas fa-chart-line text-primary"></i>
          Taxas de Câmbio ao Vivo
        </h3>
        <span className="text-xs text-muted-foreground" data-testid="text-rates-updated">Atualizado agora</span>
      </div>
      
      <div className="space-y-3">
        {/* EUR to KZ */}
        {eurToKz && (
          <div className="bg-gradient-to-r from-accent/10 to-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between" data-testid="rate-eur-kz">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <i className="fas fa-euro-sign text-accent"></i>
              </div>
              <div>
                <div className="font-semibold">EUR → KZ</div>
                <div className="text-xs text-muted-foreground">Euro para Kwanza</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-primary" data-testid="text-rate-eur-kz">
                {parseFloat(eurToKz.rate).toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        )}
        
        {/* USD to KZ */}
        {usdToKz && (
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between" data-testid="rate-usd-kz">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <i className="fas fa-dollar-sign text-primary"></i>
              </div>
              <div>
                <div className="font-semibold">USD → KZ</div>
                <div className="text-xs text-muted-foreground">Dólar para Kwanza</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-primary" data-testid="text-rate-usd-kz">
                {parseFloat(usdToKz.rate).toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        )}
        
        {/* EUR to USD */}
        {eurToUsd && (
          <div className="bg-gradient-to-r from-secondary/50 to-accent/10 border border-border rounded-lg p-4 flex items-center justify-between" data-testid="rate-eur-usd">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
                <i className="fas fa-exchange-alt text-secondary-foreground"></i>
              </div>
              <div>
                <div className="font-semibold">EUR → USD</div>
                <div className="text-xs text-muted-foreground">Euro para Dólar</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-primary" data-testid="text-rate-eur-usd">
                {parseFloat(eurToUsd.rate).toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
