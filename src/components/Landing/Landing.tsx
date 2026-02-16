import { SignIn } from '@components/TopMenu/SignIn';
import { WHATS_NEW } from '@lib/whats-new';
import type { WhatsNewType } from '@lib/whats-new';
import {
  StyledLandingHero,
  StyledLandingRoot,
  StyledLandingTagline,
  StyledLandingTitle,
  StyledSignInWrapper,
  StyledWhatsNewItem,
  StyledWhatsNewList,
  StyledWhatsNewSection,
} from './styles';

const typeLabel: Record<WhatsNewType, string> = {
  feature: 'New',
  fix: 'Fix',
  improvement: 'Improvement',
};

export const Landing = () => {
  return (
    <StyledLandingRoot>
      <StyledLandingHero>
        <StyledLandingTagline>
          Manage your book club: pick books, schedule meetings, and track what
          everyone is reading.
        </StyledLandingTagline>
        <StyledSignInWrapper>
          <SignIn />
        </StyledSignInWrapper>
      </StyledLandingHero>

      <StyledWhatsNewSection as="section">
        <h2>What&apos;s New</h2>
        <StyledWhatsNewList>
          {WHATS_NEW.map((entry) => (
            <StyledWhatsNewItem key={entry.id}>
              <small>
                {entry.date} · {typeLabel[entry.type]}
              </small>
              <strong>{entry.title}</strong>
              {entry.description}
            </StyledWhatsNewItem>
          ))}
        </StyledWhatsNewList>
      </StyledWhatsNewSection>
    </StyledLandingRoot>
  );
};
