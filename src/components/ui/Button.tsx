import { styled } from '@mui/material/styles';
import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface UIButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  compact?: boolean;
}

const StyledUIButton = styled('button', {
  shouldForwardProp: (prop) => prop !== 'variant' && prop !== 'compact',
})<Required<Pick<UIButtonProps, 'variant' | 'compact'>>>(
  ({ theme, variant, compact }) => ({
    '--button-focus-outline':
      theme.palette.mode === 'light'
        ? theme.palette.primary.dark
        : theme.palette.primary.light,
    '--button-focus-shadow':
      theme.palette.mode === 'light'
        ? 'rgba(152, 141, 72, 0.28)'
        : 'rgba(203, 189, 102, 0.26)',
    borderRadius: 4,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: 'transparent',
    color: theme.palette.text.secondary,
    cursor: 'pointer',
    padding: compact ? theme.spacing(0.3, 0.55) : theme.spacing(0.6, 1.1),
    fontSize: compact ? '0.68rem' : '0.74rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    transition: 'all 150ms ease',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      color: theme.palette.primary.light,
    },
    '&:disabled': {
      opacity: 0.45,
      cursor: 'not-allowed',
    },
    '&:focus-visible': {
      outline: '2px solid var(--button-focus-outline)',
      outlineOffset: 2,
      boxShadow: '0 0 0 4px var(--button-focus-shadow)',
    },
    ...(variant === 'primary'
      ? {
          borderColor:
            theme.palette.mode === 'light'
              ? theme.palette.primary.dark
              : theme.palette.primary.main,
          backgroundColor:
            theme.palette.mode === 'light'
              ? 'rgba(197, 183, 88, 0.26)'
              : 'rgba(197, 183, 88, 0.14)',
          color:
            theme.palette.mode === 'light'
              ? theme.palette.primary.dark
              : theme.palette.primary.light,
          '&:hover': {
            backgroundColor: theme.palette.primary.main,
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          },
        }
      : {}),
    ...(variant === 'secondary'
      ? {
          borderColor: theme.palette.secondary.main,
          backgroundColor: 'rgba(63, 111, 78, 0.12)',
          color: theme.palette.secondary.light,
          '&:hover': {
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.background.default,
          },
        }
      : {}),
    ...(variant === 'danger'
      ? {
          borderColor: '#8b4d4d',
          color: '#dd9f81',
          '&:hover': {
            borderColor: '#b86262',
            color: '#f0b39a',
          },
        }
      : {}),
  })
);

export const UIButton = ({
  children,
  variant = 'ghost',
  compact = false,
  type = 'button',
  ...rest
}: UIButtonProps) => {
  return (
    <StyledUIButton
      type={type}
      variant={variant}
      compact={compact}
      {...rest}
    >
      {children}
    </StyledUIButton>
  );
};
