export type AuthAudience = "Admin" | "Client" | "Auto";

export type AuthUser = {
  id: string;
  email?: string;
};

export type AuthContext = {
  auth_user_id: string;
  email?: string;
  is_admin: boolean;
  is_owner: boolean;
  is_client: boolean;
  admin_profile?: {
    id: string;
    email?: string;
    role?: string;
    status?: string;
    roles: string[];
    permissions: string[];
  };
  client_contact?: {
    id: string;
    client_id?: string;
    email?: string;
    full_name?: string;
    portal_access_enabled?: boolean;
  };
};

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  token_type?: string;
  user: AuthUser;
  context: AuthContext;
};

export type LoginRequest = {
  email: string;
  password: string;
  audience?: AuthAudience;
};

export type RefreshRequest = {
  refresh_token: string;
  audience?: AuthAudience;
};

export type LogoutRequest = {
  access_token?: string;
  refresh_token?: string;
};

export type ForgotPasswordRequest = {
  email: string;
  audience?: AuthAudience;
  redirect_url?: string;
};

export type ResetPasswordRequest = {
  access_token?: string;
  refresh_token?: string;
  recovery_token?: string;
  new_password: string;
};
