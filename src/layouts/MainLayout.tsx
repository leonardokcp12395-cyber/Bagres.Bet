import { NavLink, Outlet } from 'react-router-dom';
import { Home, ListOrdered, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function MainLayout() {
  const navItems = [
    { to: '/dashboard', icon: <Home className="w-6 h-6" />, label: 'Home' },
    { to: '/minhas-apostas', icon: <ListOrdered className="w-6 h-6" />, label: 'Apostas' },
    { to: '/ranking', icon: <Trophy className="w-6 h-6" />, label: 'Ranking' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-dark-bg text-text-light pb-20">
      {/* Main Content Area with Framer Motion Outlet Wrapper */}
      <main className="flex-grow flex flex-col relative overflow-x-hidden">
        <AnimatePresence mode="wait">
          {/* Outlet handled by routes, we can wrap it per route later or just apply standard animations */}
          <Outlet />
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-dark-card border-t border-dark-border py-2 px-6 z-50 rounded-t-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center max-w-md mx-auto">
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
                        layoutId="nav-indicator"
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
  );
}
