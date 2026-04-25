import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import logoIcon from '../assets/LogoIcon.png';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
}

export function EmptyState({ title, description, actionText, actionLink }: EmptyStateProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-6">
        <img
          src={logoIcon}
          alt="Bagre"
          className="w-32 h-32 object-contain opacity-20 grayscale"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement?.classList.add('bg-dark-card', 'rounded-full', 'flex', 'items-center', 'justify-center', 'border', 'border-dark-border');
          }}
        />
        <div className="absolute inset-0 bg-dark-bg/50 mix-blend-overlay pointer-events-none"></div>
      </div>

      <h3 className="text-xl font-black text-text-light mb-2">{title}</h3>
      <p className="text-text-muted text-sm mb-8 max-w-[250px] mx-auto leading-relaxed">
        {description}
      </p>

      {actionText && actionLink && (
        <button
          onClick={() => navigate(actionLink)}
          className="flex items-center gap-2 py-3 px-6 bg-primary-green/10 border border-primary-green text-primary-green rounded-full font-bold uppercase tracking-wider text-xs hover:bg-primary-green hover:text-dark-bg transition-colors animate-pulse"
        >
          {actionText} <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
