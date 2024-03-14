import {
  StyledFabOption,
  StyledFabText,
  StyledFabWrapper,
  StyledFloatingActionButton,
} from './styles';
import AddIcon from '@mui/icons-material/Add';
import { Typography } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import { MouseEvent, useState } from 'react';

export interface FabOption {
  title: string;
  options?: string[];
}

interface FloatingActionButtonProps {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  furtherOptions?: FabOption[];
}

export const FloatingActionButton = ({
  onClick,
  furtherOptions,
}: FloatingActionButtonProps) => {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const handleAddButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (furtherOptions?.length) {
      setOptionsOpen(!optionsOpen);
    }
    onClick(e);
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (optionsOpen) {
      setOptionsOpen(false);
    }
  };

  return (
    <StyledFabWrapper onClick={handleOutsideClick} optionsOpen={optionsOpen}>
      <StyledFloatingActionButton
        color="primary"
        aria-label="add new meeting"
        onClick={handleAddButtonClick}
        variant={optionsOpen ? 'extended' : 'circular'}
      >
        <AddIcon />
      </StyledFloatingActionButton>
      <>
        {/* I'm parking this whole business for a while to focus on getting core feature up and working. Good ideas though */}
        {optionsOpen && furtherOptions?.length ? (
          <AnimatePresence>
            {furtherOptions.map((furtherOption, index) => (
              <>
                <StyledFabOption>
                  <Typography variant="caption">
                    {furtherOption.title}
                  </Typography>
                  {furtherOption.options?.map((option, index) => (
                    <StyledFloatingActionButton
                      key={furtherOption.title}
                      optionNumber={index + 2}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      variant="extended"
                    >
                      <StyledFabText isVisible={true}>
                        {furtherOption.options}
                      </StyledFabText>
                    </StyledFloatingActionButton>
                  ))}
                </StyledFabOption>
              </>
            ))}
          </AnimatePresence>
        ) : null}
      </>
    </StyledFabWrapper>
  );
};
