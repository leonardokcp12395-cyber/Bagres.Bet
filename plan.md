1.  **Refactor `AdminPartidas.tsx` to use Combobox for Team Selection**
    *   Create `src/utils/teamsData.ts` using the provided logic (or use standard data if the file is missing/cannot be found, but first check if I can just mock it or if the user wants me to implement a general headless-ui combobox). Actually, the user says "O cliente gerou o arquivo src/utils/teamsData.ts", but it was missing in `ls` so I will create a dummy `teamsData.ts` with a few teams to simulate it, or assume it's supposed to be fetched.
    *   Wait, the user said they generated the file `src/utils/teamsData.ts` with 569 teams. But I checked and the file does not exist locally. I will write a script to download it or create a placeholder. The prompt says: "O cliente gerou o arquivo src/utils/teamsData.ts com o mapeamento de 569 times e fez o upload dos arquivos SVG para um bucket público chamado escudos no Supabase". I will implement the feature using a mock array for `teamsData.ts` if I can't find it, and inform the user.
    *   Add `getTeamLogoUrl` in `utils/teamLogos.ts`.
    *   Implement Headless UI Combobox in `AdminPartidas.tsx`.
    *   Add "Time Personalizado" toggle.
2.  **Persistent Auth & Easy Logout**
    *   Supabase automatically persists auth sessions in `localStorage`. If users are complaining about having to login again, we should ensure `auth.onAuthStateChange` is correctly handling the session restoration.
    *   Add a clear "Sair da Conta" (Logout) button to the `Profile.tsx` page.
    *   Allow users to edit their `username` in `Profile.tsx`.
3.  **Fix the "Ops! O sistema capotou." Error**
    *   The error is triggered by a crash. The Playwright trace earlier showed `PAGE ERROR: supabaseUrl is required.`. This happens because `VITE_SUPABASE_URL` is empty in `.env`.
    *   The user's local instance is probably missing the `.env` file or variables.
    *   I need to make sure `supabaseUrl` handles missing env vars gracefully, or update the `ErrorBoundary` to show a more descriptive error related to `.env`. Wait, the error could be something else on *their* end. I'll add more protective optional chaining `?.` in `Ranking.tsx` and `MinhasApostas.tsx`. The ranking crash was usually due to `saldo_bagrecoins` being undefined or null.
