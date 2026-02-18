import { styled } from '@mui/material/styles';

export const UICard = styled('article')(({ theme }) => ({
  borderRadius: 10,
  border: `1px solid ${theme.palette.divider}`,
  background:
    'linear-gradient(145deg, rgba(255, 255, 255, 0.02), rgba(23, 27, 36, 0.95))',
  boxShadow: '0 10px 24px rgba(0, 0, 0, 0.24)',
}));
