import styled from "styled-components";
import { IndividualSkill } from "./IndividualSkill";

export const Skills = () => {
  const StyledTitle = styled.h1`
    font-size: 3rem;
    margin-bottom: 1rem;
  `;

  const StyledParagraph = styled.p`
    font-size: 1.2rem;
    font-weight: 300;
    margin-bottom: 3em;
    margin-top: 1em;
    max-width: 700px;

    @media only screen and (max-width: 450px) {
      font-size: 1rem;
    }
  `;

  const SkillTitle = styled.h2`
    margin-bottom: 0.75em;

    @media only screen and (max-width: 450px) {
      text-align: center;
    }
  `;

  const SkillGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3em;

    @media only screen and (max-width: 450px), (max-width: 750px) {
      grid-template-columns: 1fr;
    }
  `;

  const SkillColumns = styled.div`
    display: flex;
    flex-wrap: wrap;
    // border: 2px solid red;
    gap: 1em;

    @media only screen and (max-width: 450px) {
      justify-content: center;
    }
  `;

  const SkillParagraphWrapper = styled.div`
    display: flex;
  `;

  const SkillWrapper = styled.div`
    display: flex;
    flex-direction: column;

    @media only screen and (max-width: 450px) {
      justify-content: center;
    }
  `;

  return (
    <>
      <StyledTitle>My Skills</StyledTitle>
      <SkillParagraphWrapper>
        {/* <StyledImage src="src/assets/pictures/skills-canva.png"></StyledImage> */}
        <StyledParagraph>
          In addition to holding a <b>Lean Six Sigma Black Belt</b>{" "}
          certification, I am also an{" "}
          <b>AWS Certified Developer - Associate (DVA-C02)</b> and a proud
          graduate of the Scrimba Front-end Developer School. <br></br>
          <div style={{ height: ".85em" }}></div>
          Currently, I'm sharpening my proficiency in functional programming,
          delving into the book, Grokking Simplicity as part of my ongoing
          development learning journey.
        </StyledParagraph>
      </SkillParagraphWrapper>

      <SkillGrid>
        <SkillWrapper>
          <SkillTitle>Languages:</SkillTitle>
          <SkillColumns>
            <IndividualSkill>JavaScript</IndividualSkill>
            <IndividualSkill>SQL</IndividualSkill>
            <IndividualSkill>HTML/CSS</IndividualSkill>
          </SkillColumns>
        </SkillWrapper>

        <SkillWrapper>
          <SkillTitle>Developer Tools:</SkillTitle>
          <SkillColumns>
            <IndividualSkill>Git</IndividualSkill>
            <IndividualSkill>VS Code</IndividualSkill>
            <IndividualSkill>Visual Studio</IndividualSkill>
            <IndividualSkill>NPM</IndividualSkill>
          </SkillColumns>
        </SkillWrapper>
        <SkillWrapper>
          <SkillTitle>Frameworks/Libraries:</SkillTitle>
          <SkillColumns>
            <IndividualSkill>React</IndividualSkill>
            <IndividualSkill>Node.js</IndividualSkill>
            <IndividualSkill>Jest</IndividualSkill>
            <IndividualSkill>Material-UI</IndividualSkill>
            <IndividualSkill>Redux</IndividualSkill>
            <IndividualSkill>Styled Components</IndividualSkill>
            <IndividualSkill>React Router</IndividualSkill>
            <IndividualSkill>Vite</IndividualSkill>
          </SkillColumns>
        </SkillWrapper>

        <SkillWrapper>
          <SkillTitle>Other Skills:</SkillTitle>
          <SkillColumns>
            <IndividualSkill>Agile</IndividualSkill>
            <IndividualSkill>APIs</IndividualSkill>
            <IndividualSkill>Unit Testing</IndividualSkill>
            <IndividualSkill>Continuous Integration</IndividualSkill>
            {/* <IndividualSkill>Version Control</IndividualSkill> */}
            {/* <IndividualSkill>Problem-solving</IndividualSkill> */}
            {/* <IndividualSkill>Performance Optimization</IndividualSkill> */}
            {/* <IndividualSkill>Team Collaboration</IndividualSkill> */}
            <IndividualSkill>Project Management</IndividualSkill>
            {/* <IndividualSkill>Critical Thinking</IndividualSkill> */}
            <IndividualSkill>UI/UX Design</IndividualSkill>
            {/* <IndividualSkill>Web Development</IndividualSkill> */}
            {/* <IndividualSkill>Debugging</IndividualSkill> */}
            {/* <IndividualSkill>Software Development Life Cycle</IndividualSkill>
                <IndividualSkill>Object-Oriented Programming</IndividualSkill> */}
            <IndividualSkill>Data Structures</IndividualSkill>
            <IndividualSkill>Design Patterns</IndividualSkill>
            {/* <IndividualSkill>Algorithms</IndividualSkill>
                <IndividualSkill>Cloud Computing</IndividualSkill>
                <IndividualSkill>DevOps</IndividualSkill>
                <IndividualSkill>Scalability</IndividualSkill> */}
            {/* <IndividualSkill>Analytical Skills</IndividualSkill> */}
          </SkillColumns>
        </SkillWrapper>
      </SkillGrid>
    </>
  );
};
