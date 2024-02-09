import { useCurrentUserStore } from '../../hooks';
import { Member } from './Member';
import { StyledMemberList } from './style';

export const MemberList = () => {
  const { members } = useCurrentUserStore();

  return (
    <StyledMemberList>
      {members?.map((member) => (
        <Member key={member.docId} memberInfo={member.data}></Member>
      ))}
    </StyledMemberList>
  );
};
