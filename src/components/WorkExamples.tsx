import styled from "styled-components";
import { ProjectPreviewCard } from "./ProjectPreviewCard";

export const WorkExamples = () => {
  const StyledTitle = styled.h1`
    font-size: 3rem;
    margin-bottom: 1rem;
  `;

  const StyledParagraph = styled.p`
    font-size: 1.2rem;
    font-weight: 300;
    margin-bottom: 1em;
    margin-top: 1em;
    max-width: 750px;

    @media only screen and (max-width: 450px), (max-width: 750px) {
      font-size: 1rem;
    }
  `;

  const ProjectGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 3em;

    @media only screen and (max-width: 450px), (max-width: 750px) {
      grid-template-columns: 1fr;
    }
  `;

  return (
    <>
      <div id="work"></div>

      <StyledTitle>My Work</StyledTitle>
      <StyledParagraph>
        Here are a few of the different coding projects that I've recently
        worked on. <br></br>
        <b>Each one is accompanied by a detailed case study</b>, highlighting my
        continued growth as a developer and showcasing the diverse range of
        technologies and methodologies I've worked with along the way.
      </StyledParagraph>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "2em",
        }}
      >
        <ProjectGrid>
          <ProjectPreviewCard
            name="PodCraft: cEDH Nexus"
            description="Simulation of a competitive 4-player pod, designed to help players practice mulligans for competitive Magic: The
Gathering cEDH events."
            route=""
            featuredImage="/sample-img.png"
          />
          {/* ManaForge: cEDH Pod Battle Simulator ??? */}
          <ProjectPreviewCard
            name="PomoCode"
            description="Interval timer for the motivated programmer who wants to work in small, hyper-focused sprints without the risk of burning out."
            route="pomocode"
            featuredImage="/pomodoro.png"
          />
          <ProjectPreviewCard
            name="StoreBoost"
            description="A customizable e-commerce storefront application built for small businesses to overcome the initial hurdle of selling online."
            route=""
            featuredImage="/sample-img.png"
          />
          <ProjectPreviewCard
            name="TBD"
            description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga iure deserunt, odio provident praesentium nobis."
            route=""
            featuredImage="/sample-img.png"
          />
        </ProjectGrid>
      </div>
    </>
  );
};
