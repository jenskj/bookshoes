import { SignIn } from '@components/TopMenu/SignIn';
import {
  StyledHowItWorks,
  StyledHowItem,
  StyledLandingHero,
  StyledLandingMock,
  StyledLandingRoot,
  StyledLandingStat,
  StyledLandingStats,
  StyledLandingSubline,
  StyledLandingTease,
  StyledLandingTitle,
  StyledMockNote,
  StyledMockPhone,
  StyledMockSpoiler,
  StyledVisualBlock,
} from './styles';

export const Landing = () => {
  return (
    <StyledLandingRoot>
      <StyledLandingHero className="fade-up">
        <div>
          <StyledLandingTitle>Read with Intent.</StyledLandingTitle>
          <StyledLandingSubline>
            The digital book club for readers who analyze, debate, and digest.
            Build shared momentum. Elevate discourse.
          </StyledLandingSubline>
          <SignIn label="Join the Circle" />
        </div>
        <StyledVisualBlock aria-hidden>
          <span />
          <span />
          <span />
        </StyledVisualBlock>
      </StyledLandingHero>

      <StyledLandingStats className="fade-up">
        <StyledLandingStat>15,000+ pages discussed this month</StyledLandingStat>
        <StyledLandingStat>1,200 active sprint milestones</StyledLandingStat>
        <StyledLandingStat>89% weekly accountability completion</StyledLandingStat>
      </StyledLandingStats>

      <StyledHowItWorks className="fade-up">
        <StyledHowItem>
          <h3>The Selection</h3>
          <p>Vote democratically on curated candidates. No decision drift.</p>
        </StyledHowItem>
        <StyledHowItem>
          <h3>The Sprint</h3>
          <p>Set shared milestones and compare pace against the group.</p>
        </StyledHowItem>
        <StyledHowItem>
          <h3>The Discourse</h3>
          <p>Cite exact passages, annotate in context, and debate details.</p>
        </StyledHowItem>
      </StyledHowItWorks>

      <StyledLandingTease className="fade-up">
        <StyledLandingMock>
          <h3>Interface Tease</h3>
          <p className="mono">Marginalia / Chapter 5 / Threaded Note</p>
          <StyledMockPhone>
            <StyledMockNote>
              <strong>Note on Page [142]</strong>
              <p>The duality of power and duty is explicit in this section.</p>
            </StyledMockNote>
            <StyledMockSpoiler>
              [Spoiler Blur] Tap to reveal after page 158.
            </StyledMockSpoiler>
            <StyledMockNote>
              <strong>Note on Page [167]</strong>
              <p>The argument reframes the chapter’s opening thesis.</p>
            </StyledMockNote>
          </StyledMockPhone>
        </StyledLandingMock>
      </StyledLandingTease>
    </StyledLandingRoot>
  );
};
