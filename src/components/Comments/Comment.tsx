import { useState } from 'react';
import { formatDate } from '@utils';
import { MeetingComment } from '@types';
import { useCurrentUserStore } from '@hooks';
import { CommentForm, MeetingCommentForm } from './CommentForm';
import {
  StyledActionButton,
  StyledActions,
  StyledCitation,
  StyledComment,
  StyledCommentAvatar,
  StyledCommentContent,
  StyledCommentInfo,
  StyledCommentSourceDetails,
  StyledCommentText,
  StyledDate,
  StyledName,
  StyledSpoiler,
  StyledTitle,
} from './styles';

interface CommentProps {
  comment: MeetingComment;
  viewerPage: number;
  onDeleteComment: () => void;
  onUpdateExistingComment: (comment: MeetingCommentForm) => void;
}

const initialsFromName = (name: string) => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (!parts.length) return '?';
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
};

export const Comment = ({
  comment: {
    text,
    title,
    citation,
    spoiler,
    user: { displayName, uid },
    dateAdded,
  },
  onDeleteComment,
  onUpdateExistingComment,
  viewerPage,
}: CommentProps) => {
  const { currentUser } = useCurrentUserStore();
  const [editActive, setEditActive] = useState(false);
  const [isSpoilerRevealed, setIsSpoilerRevealed] = useState(false);
  const revealAfterPage = spoiler?.revealAfterPage || citation?.page || 0;
  const shouldHideSpoiler =
    Boolean(spoiler?.enabled) && viewerPage > 0 && viewerPage < revealAfterPage;

  return (
    <StyledComment>
      <StyledCommentAvatar>
        {initialsFromName(displayName || '')}
      </StyledCommentAvatar>
      <StyledCommentContent>
        {editActive ? (
          <CommentForm
            onCancelEdit={() => setEditActive(false)}
            onUpdateExistingComment={onUpdateExistingComment}
            editForm={{ text, title, citation, spoiler }}
          />
        ) : (
          <>
            <StyledCommentInfo>
              <StyledCommentSourceDetails>
                <StyledName>{displayName}</StyledName>
                <StyledDate>
                  {dateAdded ? formatDate(dateAdded, true) : 'Unknown time'}
                </StyledDate>
              </StyledCommentSourceDetails>
              {uid === currentUser?.docId ? (
                <StyledActions>
                  <StyledActionButton
                    type="button"
                    onClick={() => setEditActive(true)}
                    className="focus-ring"
                  >
                    Edit
                  </StyledActionButton>
                  <StyledActionButton
                    type="button"
                    onClick={onDeleteComment}
                    className="focus-ring"
                  >
                    Delete
                  </StyledActionButton>
                </StyledActions>
              ) : null}
            </StyledCommentInfo>
            <StyledCitation>
              Note on Page [{citation?.page ?? '--'}]
              {citation?.chapter ? ` / ${citation.chapter}` : ''}
            </StyledCitation>
            {title ? <StyledTitle>{title}</StyledTitle> : null}
            {shouldHideSpoiler && !isSpoilerRevealed ? (
              <StyledSpoiler
                type="button"
                className="focus-ring"
                onClick={() => setIsSpoilerRevealed(true)}
              >
                Spoiler hidden until page {revealAfterPage}. Tap to reveal.
              </StyledSpoiler>
            ) : (
              <StyledCommentText>{text}</StyledCommentText>
            )}
          </>
        )}
      </StyledCommentContent>
    </StyledComment>
  );
};
