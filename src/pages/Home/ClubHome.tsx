import { Meetings } from '../Meetings/Meetings';
import { StyledPageSection, StyledPageTitle } from '../styles';

export const ClubHome = () => {
  return (
    <>
      <StyledPageSection>
        <StyledPageTitle>Upcoming meetings</StyledPageTitle>
        <Meetings isPreview={true} />
      </StyledPageSection>

      <StyledPageSection>
        <StyledPageTitle>Upcoming meetings</StyledPageTitle>
      </StyledPageSection>
    </>

    // To do: find out how the news section should figure on the active home page
    // <StyledNewsSection>
    //   <StyledPageTitle>News</StyledPageTitle>
    //   <Updates />
    // </StyledNewsSection>
  );
};
