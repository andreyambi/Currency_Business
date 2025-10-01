import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface LoanSimulatorProps {
  onApply: () => void;
}

export default function LoanSimulator({ onApply }: LoanSimulatorProps) {
  const [amount, setAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(15);
  const [termMonths, setTermMonths] = useState(12);

  const calculateLoan = () => {
    const monthlyRate = (interestRate / 100) / 12;
    let monthlyPayment = 0;
    
    if (monthlyRate > 0) {
      monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                      (Math.pow(1 + monthlyRate, termMonths) - 1);
    } else {
      monthlyPayment = amount / termMonths;
    }
    
    const totalPayment = monthlyPayment * termMonths;
    const totalInterest = totalPayment - amount;
    
    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
    };
  };

  const results = calculateLoan();

  return (
    <section id="loans" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4" data-testid="text-loan-simulator-title">
            Simulador de <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Empréstimos</span>
          </h2>
          <p className="text-lg text-muted-foreground" data-testid="text-loan-simulator-description">
            Simule seu empréstimo e veja as parcelas antes de solicitar
          </p>
        </div>
        
        <Card className="glass-card rounded-2xl p-8 space-y-6">
          <CardContent className="p-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Loan Amount */}
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2" htmlFor="loan-amount">
                  <i className="fas fa-money-bill-wave text-primary"></i>
                  Valor do Empréstimo (KZ)
                </label>
                <input 
                  type="number" 
                  id="loan-amount"
                  className="w-full bg-input border border-border text-foreground px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="100.000" 
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  data-testid="input-loan-amount"
                />
              </div>
              
              {/* Interest Rate */}
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2" htmlFor="interest-rate">
                  <i className="fas fa-percentage text-primary"></i>
                  Taxa de Juro Anual (%)
                </label>
                <input 
                  type="number" 
                  id="interest-rate"
                  className="w-full bg-input border border-border text-foreground px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="12" 
                  value={interestRate}
                  step="0.1"
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  data-testid="input-interest-rate"
                />
              </div>
              
              {/* Loan Term */}
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2" htmlFor="loan-term">
                  <i className="fas fa-calendar-alt text-primary"></i>
                  Prazo (Meses)
                </label>
                <select 
                  id="loan-term"
                  className="w-full bg-input border border-border text-foreground px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  value={termMonths}
                  onChange={(e) => setTermMonths(Number(e.target.value))}
                  data-testid="select-loan-term"
                >
                  <option value="6">6 meses</option>
                  <option value="12">12 meses</option>
                  <option value="18">18 meses</option>
                  <option value="24">24 meses</option>
                  <option value="36">36 meses</option>
                </select>
              </div>
              
              {/* Payment Day */}
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2" htmlFor="payment-day">
                  <i className="fas fa-calendar-day text-primary"></i>
                  Dia de Pagamento
                </label>
                <select 
                  id="payment-day"
                  className="w-full bg-input border border-border text-foreground px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  data-testid="select-payment-day"
                >
                  <option value="5">Dia 5 do mês</option>
                  <option value="10">Dia 10 do mês</option>
                  <option value="15">Dia 15 do mês</option>
                  <option value="20">Dia 20 do mês</option>
                  <option value="25">Dia 25 do mês</option>
                </select>
              </div>
            </div>
            
            {/* Results */}
            <div className="border-t border-border pt-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg bg-primary/10" data-testid="result-monthly-payment">
                  <div className="text-sm text-muted-foreground mb-1">Parcela Mensal</div>
                  <div className="text-2xl font-bold text-primary">
                    {results.monthlyPayment.toLocaleString('pt-AO')} KZ
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-accent/10" data-testid="result-total-payment">
                  <div className="text-sm text-muted-foreground mb-1">Total a Pagar</div>
                  <div className="text-2xl font-bold text-accent">
                    {results.totalPayment.toLocaleString('pt-AO')} KZ
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary/50" data-testid="result-total-interest">
                  <div className="text-sm text-muted-foreground mb-1">Total de Juros</div>
                  <div className="text-2xl font-bold text-foreground">
                    {results.totalInterest.toLocaleString('pt-AO')} KZ
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center pt-4">
              <button 
                onClick={onApply}
                className="bg-gradient-to-r from-primary to-[hsl(35,100%,45%)] text-primary-foreground font-semibold py-3 px-8 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all"
                data-testid="button-apply-loan"
              >
                <i className="fas fa-file-invoice-dollar mr-2"></i>
                Solicitar Este Empréstimo
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
