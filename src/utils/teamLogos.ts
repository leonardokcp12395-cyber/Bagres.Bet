
/**
 * Retorna a URL pública do Supabase para o escudo de um time.
 * @param leagueFolder A pasta da liga no bucket (ex: 'premier-league', 'brasileirao')
 * @param id O ID do time (nome do arquivo SVG sem extensão)
 */
export const getTeamLogoUrl = (leagueFolder: string, id: string): string => {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  // Garante que não termine com barra e monta o path
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  return `${cleanBaseUrl}/storage/v1/object/public/escudos/${leagueFolder}/${id}.svg`;
};
