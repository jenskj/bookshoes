import { alpha, styled } from '@mui/material/styles';

export const UICard = styled('article')(({ theme }) => ({
  borderRadius: 10,
  border: `1px solid ${alpha(theme.palette.divider, 0.95)}`,
  background:
    `linear-gradient(
      158deg,
      ${alpha(theme.palette.common.white, 0.05)} 0%,
      ${alpha(theme.palette.common.white, 0.015)} 34%,
      transparent 72%
    ),
    linear-gradient(
      180deg,
      ${alpha(theme.palette.background.paper, 0.98)} 0%,
      ${alpha(theme.palette.background.paper, 0.9)} 100%
    )`,
  boxShadow:
    '0 12px 26px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
}));
