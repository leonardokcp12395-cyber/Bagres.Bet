import re

with open('src/components/AdminPartidas.tsx', 'r') as f:
    content = f.read()

# Make supabase typed as any for this specific call to avoid generic TS error
content = content.replace("supabase.from('partidas' as any)", "(supabase as any).from('partidas')")

with open('src/components/AdminPartidas.tsx', 'w') as f:
    f.write(content)

with open('src/pages/Profile.tsx', 'r') as f:
    content = f.read()

content = content.replace("supabase\n        .from('profiles' as any)", "(supabase as any)\n        .from('profiles')")

with open('src/pages/Profile.tsx', 'w') as f:
    f.write(content)
