import { Link } from "react-router-dom";
import styled from "styled-components";

export const ProjectPreviewCard = ({
  name,
  description,
  route,
  featuredImage,
}: {
  name: string;
  description: string;
  route: string;
  featuredImage: string;
}) => {
  const Card = styled.div`
    max-width: 500px;
    border-radius: 17px;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.2);
    @media only screen and (max-width: 450px) {
      display: flex;
      flex-direction: column;
      align-items: center;
      jsutify-content: center;
    }
  `;

  const ProjectTitle = styled.h1`
    font-size: 2rem;
    font-weight: 700;
    color: #3b3b3b;
    margin-top: 1em;

    @media only screen and (max-width: 450px) {
      margin-top: 0.5em;
    }
  `;

  const ProjectDescription = styled.p`
    max-width: 375px;
    margin-top: 0.5rem;
    margin-bottom: 2rem;

    @media only screen and (max-width: 450px) {
      font-size: 0.8rem;
    }
  `;
  const StyledButton = styled.a`
    border: 2px solid #551a8b;
    padding: 0.5em 2em;
    border-radius: 17px;
    background-color: #551a8b;
    color: white;
    text-align: center;

    &:hover {
      color: white;
      backgroun-color: #535bf2;
      transition: background-color 0.5s;
      transition-behavior: normal;
      transition-duration: 0.75s;
      transition-timing-function: ease;
      transition-delay: 0s;
    }

    @media only screen and (max-width: 450px) {
      margin-top: 0.25em;
      width: 100%;
    }
  `;

  return (
    <Card>
      <img
        src={featuredImage}
        alt=" "
        style={{ maxWidth: "100%", borderRadius: "5px" }}
      />

      <ProjectTitle>{name}</ProjectTitle>
      <ProjectDescription>{description}</ProjectDescription>

      <Link to={`/${route}`}>
        <StyledButton>Project Details</StyledButton>
      </Link>
    </Card>
  );
};
