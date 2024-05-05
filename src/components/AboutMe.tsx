import styled from "styled-components";

export const AboutMe = () => {

const SectionWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4em;

    @media only screen and (max-width: 450px)  {
        flex-direction: column-reverse;
        gap: 1em;
      }    
`

  const AboutMeWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    max-width: 850px;
  `;

  const StyledTitle = styled.h1`
    font-size: 3rem;
    margin-bottom: 1rem;
  `;

  const StyledParagraph = styled.p`
    font-size: 1.2rem;
    font-weight: 300;
    margin-bottom: 1em;
    margin-top: 1em;
    max-width: 600px;

        @media only screen and (max-width: 450px)  {
            font-size: 1rem;

        }
    
  `;

  const ProfilePicture = styled.img`
    border-radius: 50%;
    width: 350px;
    height: 350px;
    margin-bottom: 3rem;


    @media only screen and (max-width: 450px)  {    
        width: 200px;
        height: 200px;
        margin-bottom: 0;

    }
  `;

  const EmphasizedSentence = styled.h3`
    max-width: 600px;
    font-size: 1.33rem;
  `;

  return (
    <SectionWrapper>
      <AboutMeWrapper>
        <div id="about"></div>
        <StyledTitle>About Me</StyledTitle>
        <>
          <StyledParagraph>
            I absolutely love doing jigsaw puzzles. Growing up, I spent many weekends at my
            grandparents doing hundreds of puzzles together. I think this is where my love of problem solving (and frosted sugar cookies) initially
            started - a passion that has shaped my own professional career and
            led me to initially pursue a degree where I could do just that.
          </StyledParagraph>
          <EmphasizedSentence>
            Before I dove into software engineering, I spent four years in process improvement at Asurion. My goal? To make things run smoother and more efficiently for our operations team.
          </EmphasizedSentence>
          <StyledParagraph>
            
During this time, I collaborated closely with technical product managers and their developers to boost the performance of tools used by both our in-field technicians and their leaders.
          </StyledParagraph>

          <EmphasizedSentence>
            I quickly learned how to effectively bridge the gap between
            Asurion's operations and technology teams.
          </EmphasizedSentence>

          <StyledParagraph>
            Using skills acquired as a lean six-sigma black belt to drive our
            decisions, ultimately saving Asurion over $12,000,000 per year in
            operational costs!
          </StyledParagraph>

          <EmphasizedSentence>
          Over time, I wanted to get more hands-on in the product development cycle.
          </EmphasizedSentence>
          <StyledParagraph>
This pushed me to move further into software engineering, where I could jump right into shaping and refining technology products. I started teaching myself and reached out to seasoned engineering mentors for guidance, eventually landing chances to directly add to Asurion's production codebase.
          </StyledParagraph>

          <EmphasizedSentence>
            
Looking ahead, my goal is to keep collaborating as a developer with talented product managers and engineers to solve the puzzle I enjoy the most - creating amazing products that users love. 
          </EmphasizedSentence> 
        </>
      </AboutMeWrapper>
      <ProfilePicture src="src\assets\pictures\headshot.jpg"></ProfilePicture>
    </SectionWrapper>
  );
};
