import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CurrencyRates from "@/components/currency-rates";
import LoanSimulator from "@/components/loan-simulator";
import LoginModal from "@/components/modals/login-modal";
import RegisterModal from "@/components/modals/register-modal";
import { SUPPORTED_WALLETS, SUBSCRIPTION_SERVICES, CONTACT_INFO } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar 
        onLogin={() => setShowLoginModal(true)}
        onRegister={() => setShowRegisterModal(true)}
      />

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block">
                <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold" data-testid="text-badge">
                  <i className="fas fa-shield-alt mr-2"></i>Serviços Financeiros Confiáveis
                </span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight" data-testid="text-hero-title">
                Sua Plataforma <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Financeira</span> Completa
              </h1>
              <p className="text-lg text-muted-foreground" data-testid="text-hero-description">
                Gestão de carteiras digitais, câmbio, transferências internacionais e empréstimos pessoais. Tudo em um só lugar, de forma segura e profissional.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => setShowRegisterModal(true)}
                  className="bg-gradient-to-r from-primary to-[hsl(35,100%,45%)] text-primary-foreground font-semibold py-3 px-8 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                  data-testid="button-get-started"
                >
                  <i className="fas fa-rocket"></i>
                  Começar Agora
                </button>
                <button 
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-secondary text-secondary-foreground font-semibold py-3 px-8 rounded-lg border border-border hover:bg-secondary/80 transition-all flex items-center justify-center gap-2"
                  data-testid="button-learn-services"
                >
                  <i className="fas fa-info-circle"></i>
                  Conhecer Serviços
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8">
                <div data-testid="stat-wallets">
                  <div className="text-3xl font-bold text-primary">10+</div>
                  <div className="text-sm text-muted-foreground">Carteiras Digitais</div>
                </div>
                <div data-testid="stat-support">
                  <div className="text-3xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Suporte</div>
                </div>
                <div data-testid="stat-secure">
                  <div className="text-3xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">Seguro</div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                  alt="Professional financial services" 
                  className="rounded-2xl shadow-2xl w-full"
                  data-testid="img-hero"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent rounded-2xl"></div>
              </div>
              
              <CurrencyRates />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4" data-testid="text-services-title">
              Nossos <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Serviços</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-services-description">
              Soluções financeiras completas para suas necessidades pessoais e empresariais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "wallet", title: "Carteiras Digitais", desc: "Abertura e gestão de contas em Binance, Wise, PayPal, Revolut e mais de 10 carteiras internacionais." },
              { icon: "exchange-alt", title: "Câmbio de Moedas", desc: "Compra e venda de EUR, USD, e outras moedas com taxas competitivas e transferências seguras." },
              { icon: "globe", title: "Transferências Internacionais", desc: "Envie e receba dinheiro internacionalmente com rapidez e segurança para qualquer país." },
              { icon: "credit-card", title: "Cartões Visa", desc: "Emissão de cartões Visa virtuais e físicos para compras online e no mundo todo." },
              { icon: "hand-holding-usd", title: "Empréstimos Pessoais", desc: "Crédito rápido com taxas flexíveis e prazos adaptados à sua realidade financeira." },
              { icon: "play-circle", title: "Pagamento de Serviços", desc: "Netflix, Spotify, Canva Pro, ChatGPT Plus e outros serviços premium internacionais." },
            ].map((service, idx) => (
              <Card key={idx} className="bg-card border-border hover:border-primary transition-all hover:-translate-y-1" data-testid={`card-service-${idx}`}>
                <CardContent className="p-6 space-y-4">
                  <div className={`w-14 h-14 rounded-lg ${idx % 2 === 0 ? 'gradient-gold' : 'gradient-dark'} flex items-center justify-center`}>
                    <i className={`fas fa-${service.icon} text-2xl ${idx % 2 === 0 ? 'text-background' : 'text-primary'}`}></i>
                  </div>
                  <h3 className="text-xl font-bold" data-testid={`text-service-title-${idx}`}>{service.title}</h3>
                  <p className="text-muted-foreground" data-testid={`text-service-desc-${idx}`}>{service.desc}</p>
                  <button className="text-primary font-semibold flex items-center gap-2 hover:gap-3 transition-all" data-testid={`button-explore-${idx}`}>
                    Explorar <i className="fas fa-arrow-right"></i>
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Wallets Section */}
      <section id="wallets" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4" data-testid="text-wallets-title">
              Carteiras <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Suportadas</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-wallets-description">
              Abra, gerencie e carregue saldo em mais de 10 carteiras digitais internacionais
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {SUPPORTED_WALLETS.map((wallet, idx) => (
              <Card key={idx} className="bg-card border-border hover:border-primary transition-all hover:-translate-y-1" data-testid={`card-wallet-${idx}`}>
                <CardContent className="p-6 flex flex-col items-center justify-center space-y-3 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <i className={`fas fa-${wallet.icon} text-3xl text-primary`}></i>
                  </div>
                  <div className="font-semibold" data-testid={`text-wallet-name-${idx}`}>{wallet.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <button 
              onClick={() => setShowRegisterModal(true)}
              className="bg-gradient-to-r from-primary to-[hsl(35,100%,45%)] text-primary-foreground font-semibold py-3 px-8 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all"
              data-testid="button-open-wallet"
            >
              <i className="fas fa-plus-circle mr-2"></i>
              Abrir Conta em Carteira
            </button>
          </div>
        </div>
      </section>

      {/* Loan Simulator */}
      <LoanSimulator onApply={() => setShowRegisterModal(true)} />

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4" data-testid="text-contact-title">
              Entre em <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Contacto</span>
            </h2>
            <p className="text-lg text-muted-foreground" data-testid="text-contact-description">
              Estamos aqui para ajudá-lo com qualquer questão
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <a href={`mailto:${CONTACT_INFO.email}`} className="bg-card border border-border rounded-xl p-6 text-center space-y-3 hover:border-primary hover:scale-105 transition-all" data-testid="link-email">
              <div className="w-14 h-14 mx-auto rounded-full gradient-gold flex items-center justify-center">
                <i className="fas fa-envelope text-2xl text-background"></i>
              </div>
              <h3 className="font-bold">Email</h3>
              <p className="text-sm text-muted-foreground">{CONTACT_INFO.email}</p>
            </a>

            <a href={`https://wa.me/${CONTACT_INFO.whatsapp.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="bg-card border border-border rounded-xl p-6 text-center space-y-3 hover:border-primary hover:scale-105 transition-all" data-testid="link-whatsapp">
              <div className="w-14 h-14 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                <i className="fab fa-whatsapp text-2xl text-green-400"></i>
              </div>
              <h3 className="font-bold">WhatsApp</h3>
              <p className="text-sm text-muted-foreground">{CONTACT_INFO.whatsapp}</p>
            </a>

            <a href={`https://instagram.com/${CONTACT_INFO.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="bg-card border border-border rounded-xl p-6 text-center space-y-3 hover:border-primary hover:scale-105 transition-all" data-testid="link-instagram">
              <div className="w-14 h-14 mx-auto rounded-full gradient-dark flex items-center justify-center">
                <i className="fab fa-instagram text-2xl text-primary"></i>
              </div>
              <h3 className="font-bold">Instagram</h3>
              <p className="text-sm text-muted-foreground">{CONTACT_INFO.instagram}</p>
            </a>
          </div>
        </div>
      </section>

      <Footer />

      <LoginModal 
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />

      <RegisterModal 
        open={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </div>
  );
}
