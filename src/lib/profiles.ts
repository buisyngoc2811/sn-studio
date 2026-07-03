import { supabase } from './supabase';

export type ProfileStatus = 'active' | 'banned';

export interface ProfileRow {
  id: string;
  username: string | null;
  display_name: string | null;
  email: string | null;
  role: string | null;
  avatar_url: string | null;
  status: ProfileStatus;
}

type AdminProfileAction = 'upsert' | 'delete' | 'suspend';

const baseProfileSelect = 'id, username, display_name, email, role, avatar_url';
const profileSelectWithStatus = `${baseProfileSelect}, status`;

const isMissingStatusColumn = (error: any) =>
  error?.code === '42703' && /profiles\.status|status/i.test(error?.message || '');

const normalizeProfile = (profile: Partial<ProfileRow>): ProfileRow => ({
  id: profile.id || crypto.randomUUID(),
  username: profile.username || '',
  display_name: profile.display_name || profile.username || profile.email || '',
  email: profile.email || '',
  role: profile.role || 'user',
  avatar_url: profile.avatar_url || '',
  status: profile.status?.toLowerCase() === 'banned' ? 'banned' : 'active',
});

export const fetchProfiles = async (): Promise<ProfileRow[]> => {
  const withStatus = await supabase
    .from('profiles')
    .select(profileSelectWithStatus)
    .order('display_name', { ascending: true });

  if (!withStatus.error) return ((withStatus.data || []) as ProfileRow[]).map(normalizeProfile);
  if (!isMissingStatusColumn(withStatus.error)) throw withStatus.error;

  const withoutStatus = await supabase
    .from('profiles')
    .select(baseProfileSelect)
    .order('display_name', { ascending: true });

  if (withoutStatus.error) throw withoutStatus.error;
  return ((withoutStatus.data || []) as Partial<ProfileRow>[]).map(normalizeProfile);
};

export const fetchProfileById = async (id: string): Promise<ProfileRow | null> => {
  const withStatus = await supabase
    .from('profiles')
    .select(profileSelectWithStatus)
    .eq('id', id)
    .maybeSingle();

  if (!withStatus.error && withStatus.data) return normalizeProfile(withStatus.data as Partial<ProfileRow>);
  if (!isMissingStatusColumn(withStatus.error)) {
    if (withStatus.error) throw withStatus.error;
    return null;
  }

  const withoutStatus = await supabase
    .from('profiles')
    .select(baseProfileSelect)
    .eq('id', id)
    .maybeSingle();

  if (withoutStatus.error) throw withoutStatus.error;
  return withoutStatus.data ? normalizeProfile(withoutStatus.data as Partial<ProfileRow>) : null;
};

export const saveProfile = async (profile: ProfileRow): Promise<void> => {
  const { error } = await supabase.rpc('admin_manage_profile', {
    action: 'upsert' satisfies AdminProfileAction,
    profile_id: profile.id,
    username: profile.username,
    display_name: profile.display_name,
    email: profile.email,
    role: profile.role || 'user',
    status: profile.status || 'active',
    avatar_url: profile.avatar_url || '',
  });

  if (error) throw error;
};

export const deleteProfile = async (id: string): Promise<void> => {
  const { error } = await supabase.rpc('admin_manage_profile', {
    action: 'delete' satisfies AdminProfileAction,
    profile_id: id,
  });
  if (error) throw error;
};

export const updateProfileStatus = async (id: string, status: ProfileStatus): Promise<void> => {
  const { error } = await supabase.rpc('admin_manage_profile', {
    action: 'suspend' satisfies AdminProfileAction,
    profile_id: id,
    status,
  });
  if (error) throw error;
};
