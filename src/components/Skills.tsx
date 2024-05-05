import styled from "styled-components";

export const Skills = () => {
  const StyledTitle = styled.h1`
    font-size: 3rem;
    margin-bottom: 1rem;
  `;

  const StyledParagraph = styled.p`
    max-width: 600px;
    fontweight: 300;
    margin-bottom: 3rem;
  `;

  const SkillGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-gap: 3em;
  `;

  const SkillCard = styled.div`
    border-radius: 17px;
    padding: 0.75em;
    borderradius: 10px;
    box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.2);
  `;
  const StyledLi = styled.li``;

  return (
    <>
      <StyledTitle>My Skills</StyledTitle>
      <StyledParagraph>
        In addition to holding a <b>Lean Six Sigma Black Belt</b> certification,
        I am also an <b>AWS Certified Developer - Associate (DVA-C02)</b> and a
        proud graduate of the Scrimba Front-end Developer School. Currently, I'm
        sharpening my proficiency in functional programming, delving into
        Grokking Simplicity as part of my ongoing development journey within our
        developer book club.
      </StyledParagraph>
      <SkillGrid>
        <>
          <h2>Languages:</h2>
          <ul>
            <StyledLi>JavaScript</StyledLi>
            <StyledLi>SQL</StyledLi>
            <StyledLi>HTML/CSS</StyledLi>
          </ul>
        </>

        <>
          <h2>Developer Tools:</h2>
          <ul>
            <StyledLi>Git</StyledLi>
            <StyledLi>VS Code</StyledLi>
            <StyledLi>Visual Studio</StyledLi>
            <StyledLi>NPM</StyledLi>
          </ul>
        </>
        <>
          <h2>Frameworks/Libraries:</h2>
          <ul>
            <StyledLi>React</StyledLi>
            <StyledLi>Node.js</StyledLi>
            <StyledLi>Jest</StyledLi>
            <StyledLi>Material-UI</StyledLi>
            <StyledLi>Redux</StyledLi>
            <StyledLi>Styled Components</StyledLi>
            <StyledLi>React Router</StyledLi>
            <StyledLi>Vite</StyledLi>
          </ul>
        </>

        <>
          <h2>Other Skills:</h2>
          <ul>
            <StyledLi>Agile</StyledLi>
            <StyledLi>APIs</StyledLi>
            <StyledLi>Unit Testing</StyledLi>
            <StyledLi>Continuous Integration</StyledLi>
            {/* <StyledLi>Version Control</StyledLi> */}
            {/* <StyledLi>Problem-solving</StyledLi> */}
            {/* <StyledLi>Performance Optimization</StyledLi> */}
            {/* <StyledLi>Team Collaboration</StyledLi> */}
            <StyledLi>Project Management</StyledLi>
            {/* <StyledLi>Critical Thinking</StyledLi> */}
            <StyledLi>UI/UX Design</StyledLi>
            {/* <StyledLi>Web Development</StyledLi> */}
            {/* <StyledLi>Debugging</StyledLi> */}
            {/* <StyledLi>Software Development Life Cycle</StyledLi>
                <StyledLi>Object-Oriented Programming</StyledLi> */}
            <StyledLi>Data Structures</StyledLi>
            <StyledLi>Design Patterns</StyledLi>
            {/* <StyledLi>Algorithms</StyledLi>
                <StyledLi>Cloud Computing</StyledLi>
                <StyledLi>DevOps</StyledLi>
                <StyledLi>Scalability</StyledLi> */}
            {/* <StyledLi>Analytical Skills</StyledLi> */}
          </ul>
        </>
      </SkillGrid>
    </>
  );
};
