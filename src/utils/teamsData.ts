export interface Team {
  id: string;
  name: string;
  leagueFolder: string;
  leagueName: string;
}

export const teamsData: Team[] = [
  { id: '1', name: 'Arsenal', leagueFolder: 'premier-league', leagueName: 'Premier League' },
  { id: '2', name: 'Manchester City', leagueFolder: 'premier-league', leagueName: 'Premier League' },
  { id: '3', name: 'Real Madrid', leagueFolder: 'la-liga', leagueName: 'La Liga' },
  { id: '4', name: 'Barcelona', leagueFolder: 'la-liga', leagueName: 'La Liga' },
  { id: '5', name: 'Bayern Munich', leagueFolder: 'bundesliga', leagueName: 'Bundesliga' },
  { id: '6', name: 'Paris Saint-Germain', leagueFolder: 'ligue-1', leagueName: 'Ligue 1' },
  { id: '7', name: 'Inter Milan', leagueFolder: 'serie-a', leagueName: 'Serie A' },
  { id: '8', name: 'Flamengo', leagueFolder: 'brasileirao', leagueName: 'Brasileirão' },
  { id: '9', name: 'Palmeiras', leagueFolder: 'brasileirao', leagueName: 'Brasileirão' },
  { id: '10', name: 'São Paulo', leagueFolder: 'brasileirao', leagueName: 'Brasileirão' },
];
