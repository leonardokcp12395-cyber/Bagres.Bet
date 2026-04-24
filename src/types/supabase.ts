export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          saldo_bagrecoins: number
          is_admin: boolean
        }
        Insert: {
          id: string
          username: string
          saldo_bagrecoins?: number
          is_admin?: boolean
        }
        Update: {
          id?: string
          username?: string
          saldo_bagrecoins?: number
          is_admin?: boolean
        }
      }
      partidas: {
        Row: {
          id: string
          time_a: string
          time_b: string
          odd_a: number
          odd_b: number
          finalizada: boolean
          vencedor: 'A' | 'B' | 'Empate' | null
        }
        Insert: {
          id?: string
          time_a: string
          time_b: string
          odd_a: number
          odd_b: number
          finalizada?: boolean
          vencedor?: 'A' | 'B' | 'Empate' | null
        }
        Update: {
          id?: string
          time_a?: string
          time_b?: string
          odd_a?: number
          odd_b?: number
          finalizada?: boolean
          vencedor?: 'A' | 'B' | 'Empate' | null
        }
      }
      apostas: {
        Row: {
          id: string
          user_id: string
          username_apostador: string
          partida_id: string
          time_escolhido: string
          valor_apostado: number
          status: 'pendente' | 'ganhou' | 'perdeu'
          is_multipla: boolean
          multipla_data: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          username_apostador: string
          partida_id: string
          time_escolhido: string
          valor_apostado: number
          status?: 'pendente' | 'ganhou' | 'perdeu'
          is_multipla?: boolean
          multipla_data?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          username_apostador?: string
          partida_id?: string
          time_escolhido?: string
          valor_apostado?: number
          status?: 'pendente' | 'ganhou' | 'perdeu'
          is_multipla?: boolean
          multipla_data?: Json | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
