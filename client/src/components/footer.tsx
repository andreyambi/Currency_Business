import { CONTACT_INFO } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-card/50 border-t border-border py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center">
                <i className="fas fa-coins text-xl text-background"></i>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                CyB
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Sua plataforma financeira confiável para câmbio, carteiras digitais e empréstimos.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/#home" className="hover:text-primary transition-colors" data-testid="link-footer-inicio">Início</a></li>
              <li><a href="/#services" className="hover:text-primary transition-colors" data-testid="link-footer-servicos">Serviços</a></li>
              <li><a href="/#wallets" className="hover:text-primary transition-colors" data-testid="link-footer-carteiras">Carteiras</a></li>
              <li><a href="/#loans" className="hover:text-primary transition-colors" data-testid="link-footer-emprestimos">Empréstimos</a></li>
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h4 className="font-bold mb-4">Serviços</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-contas">Abertura de Contas</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-cambio">Câmbio de Moedas</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-transferencias">Transferências</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-cartoes">Cartões Visa</a></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2" data-testid="text-footer-email">
                <i className="fas fa-envelope text-primary"></i>
                {CONTACT_INFO.email}
              </li>
              <li className="flex items-center gap-2" data-testid="text-footer-whatsapp">
                <i className="fab fa-whatsapp text-green-400"></i>
                {CONTACT_INFO.whatsapp}
              </li>
              <li className="flex items-center gap-2" data-testid="text-footer-instagram">
                <i className="fab fa-instagram text-primary"></i>
                {CONTACT_INFO.instagram}
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground" data-testid="text-footer-copyright">
            © 2024 Currency Business (CyB). Todos os direitos reservados.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="link-footer-termos">Termos de Uso</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="link-footer-privacidade">Privacidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
