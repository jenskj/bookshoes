import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { formatDate } from '@utils';
import { MeetingComment } from '@types';
import {
  StyledActions,
  StyledComment,
  StyledCommentContent,
  StyledCommentInfo,
  StyledCommentSourceDetails,
  StyledCommentText,
  StyledDate,
  StyledName,
  StyledTitle,
} from './styles';
import {
  Tooltip,
  IconButton,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { supabase } from '@lib/supabase';
import { useState, useEffect } from 'react';
import { CommentForm, MeetingCommentForm } from './CommentForm';

interface CommentProps {
  comment: MeetingComment;
  commentIndex: number;
  onDeleteComment: () => void;
  onUpdateExistingComment: (comment: MeetingCommentForm) => void;
}

export const Comment = ({
  comment: {
    text,
    title,
    user: { displayName, photoURL, uid },
    dateAdded,
  },
  onDeleteComment,
  onUpdateExistingComment,
}: CommentProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [editActive, setEditActive] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id ?? null));
  }, []);

  const dateForFormat = typeof dateAdded === 'string' ? dateAdded : (dateAdded as { seconds?: number })?.seconds ? new Date((dateAdded as { seconds: number }).seconds * 1000) : null;

  return (
    <StyledComment>
      <Avatar src={photoURL} />
      <StyledCommentContent>
        {editActive ? (
          <CommentForm
            onCancelEdit={() => setEditActive(false)}
            onUpdateExistingComment={onUpdateExistingComment}
            editForm={{ text, title }}
          />
        ) : (
          <>
            <StyledCommentInfo>
              <StyledCommentSourceDetails>
                <StyledName>{displayName}</StyledName>
                {dateForFormat ? (
                  <StyledDate>{formatDate(dateForFormat, true)}</StyledDate>
                ) : null}
              </StyledCommentSourceDetails>
              {uid === currentUserId ? (
                <StyledActions>
                  <Tooltip title="Edit comment">
                    <IconButton
                      onClick={() => setEditActive(true)}
                      size={isMobile ? 'small' : 'large'}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete comment">
                    <IconButton
                      onClick={onDeleteComment}
                      size={!isMobile ? 'small' : 'large'}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </StyledActions>
              ) : null}
            </StyledCommentInfo>
            {title ? <StyledTitle>{title}</StyledTitle> : null}
            <StyledCommentText>{text}</StyledCommentText>
          </>
        )}
      </StyledCommentContent>
    </StyledComment>
  );
};
