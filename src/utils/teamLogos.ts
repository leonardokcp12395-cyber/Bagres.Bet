export const getTeamLogoUrl = (teamName: string) => {
  // A simple heuristic or mapping. In a real scenario, this would match an API exactly.
  // Using https://github.com/luukhopman/football-logos for high quality transparent logos.

  // Example fallback or direct mapping logic could be placed here.
  // For now, we will return a generic shield if not found, or use a known service.
  // Using openligadb as an example fallback strategy, but for direct URLs we can use ui-avatars as fallback.
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&background=1c1e26&color=22c55e&rounded=true&bold=true`;
};
