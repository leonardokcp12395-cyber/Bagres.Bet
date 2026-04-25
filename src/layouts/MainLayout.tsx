import { NavLink, Outlet } from 'react-router-dom';
import { Home, ListOrdered, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShoppingCart } from 'lucide-react';
import logoIcon from '../assets/LogoIcon.png';

export function MainLayout() {
  const navItems = [
    { to: '/dashboard', icon: <Home className="w-6 h-6 lg:w-5 lg:h-5" />, label: 'Home' },
    { to: '/minhas-apostas', icon: <ListOrdered className="w-6 h-6 lg:w-5 lg:h-5" />, label: 'Apostas' },
    { to: '/ranking', icon: <Trophy className="w-6 h-6 lg:w-5 lg:h-5" />, label: 'Ranking' },
    { to: '/loja', icon: <ShoppingCart className="w-6 h-6 lg:w-5 lg:h-5" />, label: 'Loja' },
    { to: '/perfil', icon: <User className="w-6 h-6 lg:w-5 lg:h-5" />, label: 'Perfil' },
  ];

  return (
    <div className="min-h-screen bg-dark-bg lg:bg-[#0a0a0a] flex justify-center text-text-light">

      {/*
        Container Responsivo:
        - Mobile: w-full max-w-md (celular centralizado)
        - Desktop (lg): w-full max-w-7xl, grid com Sidebar e Main Content
      */}
      <div className="flex flex-col lg:flex-row w-full max-w-md lg:max-w-7xl min-h-screen bg-dark-bg relative lg:border-x lg:border-dark-border/50 lg:shadow-2xl">

        {/* Sidebar (Desktop Only) */}
        <aside className="hidden lg:flex flex-col w-64 bg-dark-card border-r border-dark-border p-6 fixed h-screen z-40">
          <div className="flex items-center gap-3 mb-10">
            <img
              src={logoIcon}
              alt="Bagre Logo"
              className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <h2 className="text-2xl font-black text-text-light tracking-tight">Bagre.bet</h2>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 p-4 rounded-xl font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-primary-green/10 text-primary-green shadow-[inset_4px_0_0_0_rgba(34,197,94,1)]'
                      : 'text-text-muted hover:bg-dark-bg hover:text-text-light'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-dark-border/50">
            <div className="bg-dark-bg p-4 rounded-xl border border-dark-border flex flex-col items-center text-center">
               <span className="text-xs text-text-muted mb-2 font-bold uppercase tracking-widest">Torneio Ativo</span>
               <div className="w-full h-1 bg-dark-border rounded-full overflow-hidden">
                 <div className="w-2/3 h-full bg-primary-green rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
               </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        {/* Adicionado margin-left no Desktop para compensar a Sidebar fixed */}
        <main className="flex-grow flex flex-col relative overflow-x-hidden pb-20 lg:pb-0 lg:ml-64 bg-dark-bg w-full">
          <div className="w-full max-w-4xl mx-auto flex flex-col flex-grow">
            <AnimatePresence mode="wait">
                <Outlet />
              </AnimatePresence>
          </div>
        </main>

        {/* Bottom Navigation (Mobile Only) */}
        <nav className="lg:hidden fixed bottom-0 w-full max-w-md bg-dark-card border-t border-dark-border py-2 px-4 z-50 rounded-t-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-center">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'text-primary-green scale-110'
                      : 'text-text-muted hover:text-text-light'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative">
                      {item.icon}
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator-mobile"
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-green rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </div>
                    <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
