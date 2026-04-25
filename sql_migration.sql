-- Alter table profiles
ALTER TABLE profiles ALTER COLUMN saldo_bagrecoins TYPE numeric;

-- Create table compras
CREATE TABLE compras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  username VARCHAR NOT NULL,
  pacote_nome VARCHAR NOT NULL,
  valor_real NUMERIC NOT NULL,
  moedas_recebidas INTEGER NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own compras" ON compras
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own compras" ON compras
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all compras" ON compras
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update compras" ON compras
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE compras;
