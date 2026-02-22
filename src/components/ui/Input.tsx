import { alpha, styled } from '@mui/material/styles';

export const UIInput = styled('input')(({ theme }) => ({
  width: '100%',
  borderRadius: 4,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: alpha(
    theme.palette.background.paper,
    theme.palette.mode === 'dark' ? 0.72 : 0.98
  ),
  color: theme.palette.text.primary,
  caretColor: theme.palette.primary.main,
  padding: theme.spacing(0.75, 1),
  '::placeholder': {
    color: alpha(theme.palette.text.secondary, 0.9),
  },
  ':focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 1,
  },
}));

export const UITextarea = styled('textarea')(({ theme }) => ({
  width: '100%',
  borderRadius: 4,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: alpha(
    theme.palette.background.paper,
    theme.palette.mode === 'dark' ? 0.72 : 0.98
  ),
  color: theme.palette.text.primary,
  caretColor: theme.palette.primary.main,
  minHeight: 90,
  resize: 'vertical',
  padding: theme.spacing(0.75, 1),
  '::placeholder': {
    color: alpha(theme.palette.text.secondary, 0.9),
  },
  ':focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 1,
  },
}));
