import styled from "styled-components";

export const ProjectPreviewCard = () => {
  const ProjectTitle = styled.h1`
    font-size: 2rem;
    font-weight: 700;
    color: #3b3b3b;
    margin-top: 1em;
  `;

  const Card = styled.div`
    max-width: 500px;
    border-radius: 17px;
    padding: 2rem;
    borderradius: 10px;
    box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.2);
  `;

  const StyledButton = styled.a`
    border: 2px solid #551a8b;
    padding: 0.5em 2em;
    border-radius: 17px;
    background-color: #551a8b;
    color: white;

    &:hover {
      color: white;
      backgroun-color: #535bf2;
      transition: background-color 0.5s;
      transition-behavior: normal;
      transition-duration: 0.75s;
      transition-timing-function: ease;
      transition-delay: 0s;
    }
  `;

  return (
    <Card>
      <img
        src="src/assets/pictures/sample-img.png"
        alt=" "
        style={{ maxWidth: "100%", borderRadius: "5px" }}
      />

      <ProjectTitle>Project Title</ProjectTitle>
      <p
        style={{ maxWidth: "375px", marginTop: "0.5rem", marginBottom: "2rem" }}
      >
        Here is a super small description of the project. Lorem ipsum dolor, sit
        amet consectetur adipisicing.
      </p>

      <StyledButton href="">Project Details</StyledButton>
    </Card>
  );
};
