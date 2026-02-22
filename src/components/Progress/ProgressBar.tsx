import { supabase } from '@lib/supabase';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import { Avatar, IconButton, TextField, Tooltip } from '@mui/material';
import { BookProgressLog, MemberInfo } from '@types';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  StyledButtonContainer,
  StyledEditContainer,
  StyledIconButton,
  StyledMemberName,
  StyledPageNumberForm,
  StyledPercentage,
  StyledProgressBar,
  StyledProgressBarContainer,
  StyledProgressFullWidthContainer,
  StyledProgressPin,
} from './styles';

interface ProgressBarProps {
  progressData?: BookProgressLog;
  totalPages: number;
  member: MemberInfo;
  onUpdateProgress: (page: number) => void;
}

export const ProgressBar = ({
  progressData,
  totalPages,
  onUpdateProgress,
  member,
}: ProgressBarProps) => {
  const [inputActive, setInputActive] = useState<boolean>(false);
  const [pageNumber, setPageNumber] = useState<number>(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id ?? null));
  }, []);

  // useMemo is necessary here because rerendering the component causes the progress to reset to 0, which looks very buggy on screen
  const memoizedProgress = useMemo(() => {
    if (progressData?.currentPage && totalPages) {
      return Math.round((progressData?.currentPage / totalPages) * 100);
    }
  }, [totalPages, progressData?.currentPage]);

  const handleUpdateProgress = (pageNumber: number) => {
    if (pageNumber !== progressData?.currentPage) {
      onUpdateProgress(pageNumber);
    }
    setInputActive(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement | HTMLDivElement>) => {
    event.preventDefault();
    // Make better validation
    handleUpdateProgress(pageNumber);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const newProgress = event.currentTarget.value;
    if (!newProgress || Number(newProgress) === progressData?.currentPage) {
      setInputActive(false);
    } else {
      handleUpdateProgress(Number(newProgress));
    }
  };
  return (
    <StyledProgressBarContainer
      dragListener={false}
      value={memoizedProgress || 0}
    >
      <StyledPercentage>{memoizedProgress || 0}%</StyledPercentage>
      <StyledProgressBar>
        <StyledProgressFullWidthContainer progress={memoizedProgress || 0}>
          <StyledProgressPin>
            <Tooltip title={member.displayName}>
              <IconButton sx={{ p: 0 }}>
                <Avatar
                  sx={{ width: 32, height: 32 }}
                  alt={member.displayName || 'Avatar'}
                  src={member.photoURL || ''}
                />
              </IconButton>
            </Tooltip>
          </StyledProgressPin>
        </StyledProgressFullWidthContainer>
      </StyledProgressBar>
      <StyledEditContainer>
        {member.uid === currentUserId ? (
          <>
            <Tooltip
              title={inputActive ? null : 'Log current page'}
            >
              <StyledButtonContainer
                onClick={() => setInputActive((prev) => !prev)}
              >
                <StyledIconButton isVisible={!inputActive} size="small">
                  <BookmarkAddIcon />
                </StyledIconButton>
                <StyledMemberName isVisible={!inputActive}>
                  {member.displayName}
                </StyledMemberName>
              </StyledButtonContainer>
            </Tooltip>
            <StyledPageNumberForm
              isVisible={inputActive}
              title="Update progress"
              onSubmit={(e) => handleSubmit(e)}
            >
              <TextField
                variant="outlined"
                size="small"
                label="Page"
                autoFocus={true}
                disabled={!inputActive}
                type="number"
                inputProps={{ min: 0, max: totalPages }}
                InputLabelProps={{
                  disableAnimation: true,
                  shrink: true,
                }}
                inputRef={(input: HTMLInputElement) => {
                  if (input) {
                    input.focus();
                  }
                }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPageNumber(Number(e.target.value))
                }
                onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                  handleBlur(e)
                }
                onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Escape') {
                    setInputActive(false);
                  }
                }}
              />
            </StyledPageNumberForm>
          </>
        ) : (
          <Tooltip title={member.displayName}>
            <StyledMemberName>{member.displayName}</StyledMemberName>
          </Tooltip>
        )}
      </StyledEditContainer>
    </StyledProgressBarContainer>
  );
};
