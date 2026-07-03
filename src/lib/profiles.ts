import { supabase } from './supabase';

export type ProfileStatus = 'Active' | 'Banned';

export interface ProfileRow {
  id: string;
  username: string | null;
  display_name: string | null;
  email: string | null;
  role: string | null;
  avatar_url: string | null;
  status: ProfileStatus;
}

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
  status: profile.status || 'Active',
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

export const saveProfile = async (profile: ProfileRow): Promise<void> => {
  const payload = {
    id: profile.id,
    username: profile.username,
    display_name: profile.display_name,
    email: profile.email,
    role: profile.role || 'user',
    avatar_url: profile.avatar_url || '',
    status: profile.status || 'Active',
  };
  const withStatus = await supabase
    .from('profiles')
    .upsert(payload);

  if (!withStatus.error) return;
  if (!isMissingStatusColumn(withStatus.error)) throw withStatus.error;

  const { status, ...payloadWithoutStatus } = payload;
  const withoutStatus = await supabase.from('profiles').upsert(payloadWithoutStatus);
  if (withoutStatus.error) throw withoutStatus.error;
};

export const deleteProfile = async (id: string): Promise<void> => {
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) throw error;
};

export const updateProfileStatus = async (id: string, status: ProfileStatus): Promise<void> => {
  const { error } = await supabase.from('profiles').update({ status }).eq('id', id);
  if (isMissingStatusColumn(error)) return;
  if (error) throw error;
};
