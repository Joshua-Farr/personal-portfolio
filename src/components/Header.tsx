import styled from "styled-components";
import { MdOutlineMail } from "react-icons/md";
import { BsLinkedin } from "react-icons/bs";
import { FaGithubSquare } from "react-icons/fa";

export const Header = () => {
  const HeaderWrapper = styled.div`
    height: 4em;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    @media only screen and (max-width: 450px)  {
      flex-direction: column;
    }
  `;

  const StyledName = styled.span`
    font-size: 1.25rem;
    font-weight: 500;
  `;

  const StyledLink = styled.a`
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: #551A8B

    &:hover {
      cursor: pointer;
      color: #535bf2
    }
  `;

  const LinkWrapper = styled.div`
    // width: 200px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  `;


  return (
    <HeaderWrapper>
      <StyledName>JOSHFARR</StyledName>
      <LinkWrapper>
        <div style={{ display: "flex", gap: "1em", marginRight: "3em" }}>
          <StyledLink data-scroll href="#about">About</StyledLink>
          <StyledLink data-scroll  href="#work">Work</StyledLink>
          <StyledLink href="src/assets/Joshua Farr Resume - Software Engineering.pdf" download="Joshua Farr Resume - Software Engineering">Resume</StyledLink>
        </div>
        <div style={{ display: "flex", gap: "1em" }}>
        <StyledLink href="https://www.linkedin.com/in/joshuaafarr/">
            <MdOutlineMail size={"1.45em"} />
          </StyledLink>
          <StyledLink href="https://www.linkedin.com/in/joshuaafarr/">
            <BsLinkedin />
          </StyledLink>
          <StyledLink href="https://github.com/Joshua-Farr">
            <FaGithubSquare size={"1.2em"} />
          </StyledLink>
        </div>
      </LinkWrapper>
    </HeaderWrapper>
  );
};
