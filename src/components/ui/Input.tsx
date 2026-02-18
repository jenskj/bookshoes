import { styled } from '@mui/material/styles';

export const UIInput = styled('input')(({ theme }) => ({
  width: '100%',
  borderRadius: 4,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: '#0f131c',
  color: theme.palette.text.primary,
  padding: theme.spacing(0.7, 0.85),
  ':focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 1,
  },
}));

export const UITextarea = styled('textarea')(({ theme }) => ({
  width: '100%',
  borderRadius: 4,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: '#0f131c',
  color: theme.palette.text.primary,
  minHeight: 90,
  resize: 'vertical',
  padding: theme.spacing(0.72, 0.85),
  ':focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 1,
  },
}));
