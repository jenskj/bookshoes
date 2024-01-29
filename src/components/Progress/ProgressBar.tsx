import EditIcon from '@mui/icons-material/Edit';
import { Avatar, IconButton, Tooltip } from '@mui/material';
import { FormEvent, useMemo, useState } from 'react';
import { BookProgressLog, MemberInfo } from '../../types';
import {
  StyledEditContainer,
  StyledPageNumberForm,
  StyledPercentage,
  StyledProgressBar,
  StyledProgressBarContainer,
  StyledProgressFullWidthContainer,
  StyledProgressPin,
  StyledTextField,
  StyledToolTip,
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
}: ProgressBarProps) => {
  const [inputActive, setInputActive] = useState<boolean>(false);
  const [pageNumber, setPageNumber] = useState<number>(0);

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Make better validation
    if (event.currentTarget.checkValidity()) {
      handleUpdateProgress(pageNumber);
    } else {
      event.currentTarget.reportValidity();
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event.currentTarget.value === undefined) {
      setInputActive(false);
    } else {
      handleUpdateProgress(Number(event.currentTarget.value));
    }
  };
  return (
    <StyledProgressBarContainer>
      <StyledPercentage>{memoizedProgress || 0}%</StyledPercentage>
      <StyledProgressBar>
        <StyledProgressFullWidthContainer progress={memoizedProgress || 0}>
          <StyledProgressPin>
            <Tooltip title={progressData?.user.displayName}>
              <IconButton sx={{ p: 0 }}>
                <Avatar
                  sx={{ width: 32, height: 32 }}
                  alt={progressData?.user.displayName || 'Avatar'}
                  src={progressData?.user.photoURL || ''}
                />
              </IconButton>
            </Tooltip>
          </StyledProgressPin>
        </StyledProgressFullWidthContainer>
      </StyledProgressBar>
      <StyledEditContainer>
        <StyledToolTip isVisible={!inputActive} title="New progress">
          <IconButton
            onClick={() => setInputActive((prev) => !prev)}
            size="small"
          >
            <EditIcon />
          </IconButton>
        </StyledToolTip>
        <StyledPageNumberForm
          isVisible={inputActive}
          onSubmit={(e) => handleSubmit(e)}
        >
          <StyledTextField
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
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => handleBlur(e)}
            onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Escape') {
                setInputActive(false);
              }
            }}
          />
        </StyledPageNumberForm>
      </StyledEditContainer>
    </StyledProgressBarContainer>
  );
};
