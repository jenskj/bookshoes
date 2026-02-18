export interface PrimaryNavItem {
  label: string;
  shortLabel: string;
  to: string;
}

export const PRIMARY_NAV_ITEMS: PrimaryNavItem[] = [
  { label: 'Dashboard', shortLabel: 'Home', to: '/home' },
  { label: 'Meetings', shortLabel: 'Meet', to: '/meetings' },
  { label: 'Library', shortLabel: 'Books', to: '/books' },
  { label: 'Clubs', shortLabel: 'Clubs', to: '/clubs' },
];
