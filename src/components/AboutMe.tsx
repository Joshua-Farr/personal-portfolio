import styled from "styled-components";

export const AboutMe = () => {
  const AboutMeWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    max-width: 850px;
    // margin-inline: auto;
  `;

  const StyledTitle = styled.h1`
    font-size: 3rem;
    margin-bottom: 1rem;
  `;

  const StyledParagraph = styled.p`
    fontweight: 300;
    margin-bottom: 1rem;
    margin-top: 1rem;
    max-width: 600px;
  `;

  const ProfilePicture = styled.img`
    border-radius: 50%;
    width: 350px;
    height: 350px;
    margin-bottom: 3rem;
  `;

  const EmphasizedSentence = styled.h3`
    max-width: 600px;
  `;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "4em",
      }}
    >
      <AboutMeWrapper>
        <StyledTitle>About Me</StyledTitle>
        <>
          <StyledParagraph>
            I love doing jigsaw puzzles. Growing up, I spent many weekends at my
            grandparents doing Jigsaw puzzles together - I think this is where
            my love of problem solving (and frosted sugar cookies) initially
            started - a passion that has shaped my own professional career and
            led me to initially pursue a degree where I could do just that.
          </StyledParagraph>
          <EmphasizedSentence>
            Before I became a developer, I spent 4 years as a process
            improvement engineer at Asurion helping to make our employees lives
            easier.
          </EmphasizedSentence>
          <StyledParagraph>
            During this time, I worked closely with technical product managers
            and their developers to enhance the performance of tools used by
            both our in-field technicians and their leaders.
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
            Over time, I felt the need to play a larger hands-on role within the
            product developement cycle.
          </EmphasizedSentence>
          <StyledParagraph>
            This led me to dive deeper into software engineering, where I could
            directly contribute to the creation and improvment of technology
            products. I began a course of self-study and sought out the help of
            senior engineering mentors to help guide my journey, ultimately
            finding opportunities to directly contribute to Asurion's production
            code base.
          </StyledParagraph>

          <EmphasizedSentence>
            Moving forward, I want to continue working as a developer with
            talented product managers & engineers helping to create fantastic
            products that users adore.
          </EmphasizedSentence>
        </>
      </AboutMeWrapper>
      <ProfilePicture src="src\assets\pictures\headshot.jpg"></ProfilePicture>
    </div>
  );
};
