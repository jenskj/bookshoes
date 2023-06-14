import styled from '@emotion/styled';

interface StyledBookCardProps {
  coverUrl: string;
}
export const StyledBookCard = styled.div<StyledBookCardProps>(
  ({ coverUrl }) => ({
    backgroundImage: `url('${coverUrl}')`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundBlendMode: 'multiply',
    backgroudColor: '#00000030',
    width: '100%',
    height: 250,
  })
);

export const StyledBookDetailsHeader = styled.div(({ theme }) => ({
  textAlign: 'center',
}));

export const StyledBookBanner = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: theme.spacing[1],
}));

export const StyledBookTitle = styled.div(() => ({
  fontSize: '1.2rem',
  fontWeight: 'bold',
  marginTop: '0.5rem',
  marginBottom: '0.25rem',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

export const StyledBookAuthor = styled.div(() => ({
  fontSize: '1rem',
  color: '#666',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

export const StyledBookDescriptionContainer = styled.div(() => ({
  
}));
export const StyledBookDescription = styled.div(() => ({
  fontSize: '1rem',
  color: '#666',
}));
