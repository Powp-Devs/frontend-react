import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Nota: Você deve migrar o CSS do legado para este arquivo ou um módulo CSS
// import '../styles/landing.css';

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const navigate = useNavigate();
  
  // Refs para observadores
  const heroStatsRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // --- 1. Menu Mobile Logic ---
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // --- 2. Smooth Scroll Logic ---
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    closeMenu();

    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // --- 3. Scroll Spy (Highlight Menu) ---
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      let current = '';

      sections.forEach((section) => {
        const htmlSection = section as HTMLElement;
        const sectionTop = htmlSection.offsetTop;
        
        if (window.pageYOffset >= sectionTop - 100) {
          current = htmlSection.getAttribute('id') || '';
        }
      });

      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- 4. Animations (Fade In) ---
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          target.style.opacity = '1';
          target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    // Seleciona elementos para animar (baseado no JS legado)
    const elementsToAnimate = document.querySelectorAll('.feature-card, .benefit-item, .testimonial-card, .benefits-card');
    
    elementsToAnimate.forEach(el => {
      const htmlEl = el as HTMLElement;
      // Define estilos iniciais via JS para garantir a animação
      htmlEl.style.opacity = '0';
      htmlEl.style.transform = 'translateY(30px)';
      htmlEl.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // --- 5. Counters Animation ---
  useEffect(() => {
    const animateCounter = (element: Element, target: number, duration = 2000) => {
      let start = 0;
      const increment = target / (duration / 16);
      
      const updateCounter = () => {
        start += increment;
        if (start < target) {
          element.textContent = Math.floor(start).toString();
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent = target.toString();
        }
      };
      
      updateCounter();
    };

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const stats = entry.target.querySelectorAll('.stat-number');
          stats.forEach(stat => {
            const text = stat.textContent || '0';
            const number = text.match(/\d+/);
            if (number) {
              animateCounter(stat, parseInt(number[0]));
            }
          });
          statsObserver.unobserve(entry.target);
        }
      });
    });

    if (heroStatsRef.current) {
      statsObserver.observe(heroStatsRef.current);
    }

    return () => statsObserver.disconnect();
  }, []);

  // --- 6. CTA Handlers ---
  const handleCTA = (action: string) => {
    if (action === 'cadastro') {
      navigate('/cadastro-clientes'); // Exemplo de rota interna
    } else {
      console.log('Ação:', action);
    }
  };

  return (
    <div className="landing-page">
      {/* Header / Navigation */}
      <header className="fixed w-full top-0 z-50 bg-white shadow-md h-20">
        <div className="container mx-auto px-4 h-full flex justify-between items-center">
          <div className="logo font-bold text-2xl">POWP</div>
          
          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-6 nav-links">
            {['inicio', 'recursos', 'beneficios', 'depoimentos'].map((item) => (
              <a 
                key={item}
                href={`#${item}`} 
                className={activeSection === item ? 'active text-blue-600' : 'text-gray-600'}
                onClick={(e) => handleScrollTo(e, item)}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </a>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            id="mobileMenuBtn" 
            className={`md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5 ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
          >
            <span className={`block w-6 h-0.5 bg-black transition-transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-black transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-black transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div 
          id="mobileMenu" 
          className={`md:hidden absolute top-20 left-0 w-full bg-white shadow-lg transition-all duration-300 ${isMenuOpen ? 'block' : 'hidden'}`}
        >
          <div className="flex flex-col p-4 space-y-4">
            {['inicio', 'recursos', 'beneficios', 'depoimentos'].map((item) => (
              <a 
                key={item}
                href={`#${item}`}
                onClick={(e) => handleScrollTo(e, item)}
                className="text-lg text-gray-800"
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="pt-24 pb-12 px-4 min-h-screen flex flex-col justify-center items-center text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Gestão Empresarial Simplificada</h1>
        <p className="text-xl text-gray-600 mb-8">Controle total do seu negócio em um só lugar.</p>
        <button onClick={() => handleCTA('cadastro')} className="btn btn-primary bg-blue-600 text-white px-8 py-3 rounded-lg text-lg">
          Começar Teste Grátis
        </button>

        {/* Stats Counter Section */}
        <div ref={heroStatsRef} className="hero-stats grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full max-w-4xl">
          <div className="stat-item text-center">
            <span className="stat-number text-4xl font-bold text-blue-600 block">1000+</span>
            <span className="text-gray-600">Clientes</span>
          </div>
          <div className="stat-item text-center">
            <span className="stat-number text-4xl font-bold text-blue-600 block">5000+</span>
            <span className="text-gray-600">Vendas/Mês</span>
          </div>
          <div className="stat-item text-center">
            <span className="stat-number text-4xl font-bold text-blue-600 block">99%</span>
            <span className="text-gray-600">Satisfação</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Recursos Principais</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="feature-card bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Recurso {i}</h3>
                <p className="text-gray-600">Descrição detalhada do recurso incrível que sua empresa precisa.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Benefícios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="benefit-item flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">✓</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Benefício {i}</h3>
                  <p className="text-gray-600">Explicação de como isso ajuda o usuário.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 text-center">
        <p>&copy; 2026 POWP Gestão. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default LandingPage;