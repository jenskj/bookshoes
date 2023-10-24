import React from 'react';
import { Update } from './Update';
import { StyledUpdateContainer } from './styles';

export const Updates = () => {
  const update1 = [
    'Billederne skulle gerne have fået noget bedre kvalitet.',
    'Bog- og mødedata bliver nu cachet, så det loader lidt hurtigere',
    'Brugeroplysninger gemmes nu, så der kan implementeres bruger-specifik data, f. eks. progress',
    'Der er tilføjet Avatar i top-højre side',
    'Diverse ændringer i boglistevisningens styling',
  ];

  return (
    <StyledUpdateContainer>
      <Update bullets={update1} date="19-10-2023" />
    </StyledUpdateContainer>
  );
};
