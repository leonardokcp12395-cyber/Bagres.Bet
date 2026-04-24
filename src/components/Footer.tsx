export function Footer() {
  return (
    <footer className="mt-12 py-8 border-t border-dark-border/50 bg-dark-bg text-center px-4">
      <div className="flex justify-center items-center gap-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-dark-card border border-dark-border flex items-center justify-center">
          <span className="font-black text-xs text-text-muted">18+</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-dark-card border border-dark-border flex items-center justify-center">
          <span className="font-bold text-[10px] text-text-muted text-center leading-tight">PIX<br/>Fast</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-dark-card border border-dark-border flex items-center justify-center">
          <span className="font-bold text-[10px] text-text-muted text-center leading-tight">SSL<br/>Sec</span>
        </div>
      </div>

      <p className="text-[10px] text-text-muted/60 max-w-xs mx-auto mb-4 leading-relaxed">
        Bagre.bet é uma plataforma de entretenimento simulado. Jogue com responsabilidade.
        <br />
        <a href="#" className="underline hover:text-primary-green transition-colors">Termos e Condições do Torneio</a>
      </p>

      <div className="text-xs font-bold text-text-muted/40 uppercase tracking-widest">
        Bagre.bet © 2026. A plataforma oficial da resenha.
      </div>
    </footer>
  );
}
