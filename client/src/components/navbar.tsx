import { Link } from "wouter";

interface NavbarProps {
  onLogin: () => void;
  onRegister: () => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
  userRole?: string;
}

export default function Navbar({ onLogin, onRegister, isAuthenticated, onLogout, userRole }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center space-x-3 cursor-pointer" data-testid="link-home">
              <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center">
                <i className="fas fa-coins text-xl text-background"></i>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Currency Business
              </span>
            </a>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/#home" className="nav-link text-foreground hover:text-primary transition-colors" data-testid="link-inicio">Início</a>
            <a href="/#services" className="nav-link text-foreground hover:text-primary transition-colors" data-testid="link-servicos">Serviços</a>
            <a href="/#wallets" className="nav-link text-foreground hover:text-primary transition-colors" data-testid="link-carteiras">Carteiras</a>
            <a href="/#loans" className="nav-link text-foreground hover:text-primary transition-colors" data-testid="link-emprestimos">Empréstimos</a>
            <a href="/#contact" className="nav-link text-foreground hover:text-primary transition-colors" data-testid="link-contacto">Contacto</a>
          </div>
          
          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {userRole === "admin" ? (
                  <Link href="/admin">
                    <a className="bg-secondary text-secondary-foreground font-semibold py-2 px-6 rounded-lg border border-border hover:bg-secondary/80 transition-all hidden md:block" data-testid="button-admin">
                      Admin
                    </a>
                  </Link>
                ) : (
                  <Link href="/dashboard">
                    <a className="bg-secondary text-secondary-foreground font-semibold py-2 px-6 rounded-lg border border-border hover:bg-secondary/80 transition-all hidden md:block" data-testid="button-dashboard">
                      Dashboard
                    </a>
                  </Link>
                )}
                <button 
                  onClick={onLogout}
                  className="bg-gradient-to-r from-primary to-[hsl(35,100%,45%)] text-primary-foreground font-semibold py-2 px-6 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  data-testid="button-logout"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={onLogin}
                  className="bg-secondary text-secondary-foreground font-semibold py-2 px-6 rounded-lg border border-border hover:bg-secondary/80 transition-all hidden md:block"
                  data-testid="button-entrar"
                >
                  Entrar
                </button>
                <button 
                  onClick={onRegister}
                  className="bg-gradient-to-r from-primary to-[hsl(35,100%,45%)] text-primary-foreground font-semibold py-2 px-6 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  data-testid="button-cadastrar"
                >
                  Cadastrar
                </button>
              </>
            )}
            {/* Mobile Menu Toggle */}
            <button className="md:hidden text-foreground" data-testid="button-mobile-menu">
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
