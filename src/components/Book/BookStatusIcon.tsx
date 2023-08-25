import React, { ReactElement, useEffect, useState } from 'react';
import { SvgIconComponent } from '@mui/icons-material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckIcon from '@mui/icons-material/Check';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { StyledBookStatusIcon } from './styles';

interface BookStatusIconProps {
  readStatus?: string;
}

export const BookStatusIcon = ({ readStatus }: BookStatusIconProps) => {
  const [icon, setIcon] = useState<ReactElement<SvgIconComponent>>(
    <StarBorderIcon />
  );

  useEffect(() => {
    let newIcon: ReactElement<SvgIconComponent> = <StarBorderIcon />;
    switch (readStatus) {
      case 'read':
        newIcon = <CheckIcon />;
        break;
      case 'reading':
        newIcon = <MenuBookIcon />;
        break;
      case 'candidate':
        newIcon = <StarIcon />;
        break;
    }
    if (newIcon) {
      setIcon(newIcon);
    }
  }, [readStatus]);

  return <StyledBookStatusIcon title={readStatus} children={icon} />; // add readStatus as enum with titles
};
