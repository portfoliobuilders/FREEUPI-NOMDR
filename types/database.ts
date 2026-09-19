export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          business_name: string | null;
          upi_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name?: string | null;
          upi_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          business_name?: string | null;
          upi_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          user_id: string;
          merchant_name: string;
          upi_id: string;
          total_amount_paise: number;
          reference: string;
          note: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          merchant_name: string;
          upi_id: string;
          total_amount_paise: number;
          reference: string;
          note?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          merchant_name?: string;
          upi_id?: string;
          total_amount_paise?: number;
          reference?: string;
          note?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payment_requests: {
        Row: {
          id: string;
          invoice_id: string;
          sequence_number: number;
          amount_paise: number;
          upi_uri: string;
          status: string;
          manually_verified: boolean;
          created_at: string;
          paid_at: string | null;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          sequence_number: number;
          amount_paise: number;
          upi_uri: string;
          status?: string;
          manually_verified?: boolean;
          created_at?: string;
          paid_at?: string | null;
        };
        Update: {
          status?: string;
          manually_verified?: boolean;
          paid_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
