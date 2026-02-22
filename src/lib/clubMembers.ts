import { supabase } from '@lib/supabase';
import type { Member } from '@types';
import { mapMemberRow } from './mappers';

export const fetchClubMembersWithProfiles = async (
  clubId: string
): Promise<Member[]> => {
  const { data: membersData } = await supabase
    .from('club_members')
    .select('*')
    .eq('club_id', clubId);

  const membersList = membersData ?? [];
  if (!membersList.length) {
    return [];
  }

  const userIds = Array.from(
    new Set(
      membersList
        .map((member) => member.user_id as string | null)
        .filter((userId): userId is string => Boolean(userId))
    )
  );

  const { data: usersData } = userIds.length
    ? await supabase
        .from('users')
        .select('id, display_name, photo_url')
        .in('id', userIds)
    : { data: [] as Array<Record<string, unknown>> };

  const usersMap = new Map(
    (usersData ?? []).map((user: Record<string, unknown>) => [user.id, user])
  );

  return membersList.map((memberRow) => {
    const userId = memberRow.user_id as string | undefined;
    const user = userId ? usersMap.get(userId) ?? {} : {};
    return mapMemberRow(memberRow, {
      user_id: memberRow.user_id,
      display_name: user.display_name,
      photo_url: user.photo_url,
    });
  });
};

export const mapClubMemberRowWithProfile = async (
  row: Record<string, unknown>
): Promise<Member | undefined> => {
  const userId = row.user_id as string | undefined;
  if (!row.id || !userId) return undefined;

  const { data: user } = await supabase
    .from('users')
    .select('display_name, photo_url')
    .eq('id', userId)
    .maybeSingle();

  return mapMemberRow(row, {
    user_id: userId,
    display_name: user?.display_name,
    photo_url: user?.photo_url,
  });
};
