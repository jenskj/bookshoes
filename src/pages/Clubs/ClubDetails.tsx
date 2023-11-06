import { Button } from '@mui/material';
import {
  CollectionReference,
  DocumentReference,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db, firestore } from '../../firestore';
import {
  ClubInfo,
  FirestoreClub,
  FirestoreMember,
  MemberInfo,
} from '../../types';
import { addNewClubMember, deleteDocument, updateDocument } from '../../utils';
import { StyledPageTitle } from '../styles';
import { StyledClubDetailsContainer } from './styles';

export const ClubDetails = () => {
  const { id } = useParams();
  const [club, setClub] = useState<ClubInfo>({ name: '', isPrivate: false });
  const [isMember, setIsMember] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      updateClub();
    }
  }, [id]);

  const updateClub = async () => {
    if (id) {
      const membersRef = collection(db, 'clubs', id, 'members');
      const clubRef = doc(db, 'clubs', id);
      if (clubRef) {
        // Get club from firestore
        getDoc(clubRef).then((res) => {
          const newClub: FirestoreClub = {
            docId: res.id,
            data: res.data() as ClubInfo,
          };

          // Get members
          if (membersRef) {
            getDocs(membersRef).then((res) => {
              const members: FirestoreMember[] = res.docs.map((member) => ({
                docId: member.id,
                data: member.data() as MemberInfo,
              }));
              setClub({ ...newClub.data, members });
              setIsMember(
                members.some(
                  (member) =>
                    member.data?.user?.id &&
                    member.data.user.id === auth.currentUser?.uid
                )
              );
            });
          }
        });
      }
    }
  };

  const onLeaveClub = async () => {
    if (id) {
      const membersRef = collection(db, 'clubs', id, 'members');
      const currentMember = club?.members?.find(
        (member) => member.data.user.id === auth.currentUser?.uid
      );
      if (membersRef?.path && currentMember) {
        deleteDocument(membersRef?.path, currentMember.docId);
        if (auth.currentUser?.uid) {
          // Change user's activeClub to the one they've just joined
          updateDocument(
            'users',
            { activeClub: deleteField() },
            auth.currentUser?.uid
          );
        }
        updateClub();
      }
    }
  };

  const onJoinClub = async () => {
    if (id) {
      addNewClubMember(id).then(() => {
        if (isMember) {
          return alert('You are already a member of this group');
        }
        if (auth.currentUser?.uid) {
          // Change user's activeClub to the one they've just joined
          updateDocument(
            'users',
            { activeClub: firestore.doc('clubs/' + id) },
            auth.currentUser?.uid
          );
        }
        updateClub();
      });
    }
  };

  return (
    <StyledClubDetailsContainer>
      <StyledPageTitle>
        {club?.name} is {club?.isPrivate ? 'private' : 'not private'}
      </StyledPageTitle>
      <Button variant="contained" onClick={isMember ? onLeaveClub : onJoinClub}>
        {`${isMember ? 'Leave' : 'Join'} club`}
      </Button>
    </StyledClubDetailsContainer>
  );
};
