export type UserRole = 'super_admin' | 'sub_admin' | 'editor' | 'leader' | 'member';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  squad_id?: string;
  permissions?: {
    can_edit_site: boolean;
    can_manage_members: boolean;
    can_build_squads: boolean;
    can_manage_slots: boolean;
    can_view_accounts: boolean;
    can_post_notices: boolean;
  };
  stats?: {
    kd: number;
    win_rate: number;
    hs_rate: number;
    grade: string;
  };
  game_id?: string;
  status: 'active' | 'banned';
}

export interface Squad {
  id: string;
  squad_name: string;
  leader_id: string;
  members_count: number;
}
