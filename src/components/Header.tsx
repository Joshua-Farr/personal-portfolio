import styled from "styled-components";
import { MdOutlineMail } from "react-icons/md";
import { BsLinkedin } from "react-icons/bs";
import { FaGithubSquare } from "react-icons/fa";
import { Sling as Hamburger } from "hamburger-react";
import { useState } from "react";

export const Header = () => {
  const HeaderWrapper = styled.div`
    height: 4em;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    @media only screen and (max-width: 450px) {
      flex-direction: column;
    }

    @media only screen and (max-width: 650px) {
      display: none;
    }
  `;

  const MobileHeaderWrapper = styled.div`
    @media only screen and (min-width: 650px) {
      display: none;
    }

    @media only screen and (max-width: 650px) {
      display: visible;
      height: 4em;
      padding-top: 1em;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
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
    color: black;

    &:hover {
      cursor: pointer;
      color: #535bf2;
    }
  `;

  const LinkWrapper = styled.div`
    // width: 200px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  `;

  const MobileMenu = styled.div`
    height: 100vh;
    width: 100%;
    background-color: #3b3b3b;

    display: flex;
    flex-direction: column;
    align-items: flex-start;

    position: fixed;
    top: 0;
    left: 0;
    z-index: 9;
  `;

  const MobileLinks = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 5em;
    font-size: 2.5em;
    color: black;
    text-align: left;
    margin-left: 1em;
  `;

  const MobileSocialWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 1em;
    font-size: 0em;
  `;

  const [isOpen, setOpen] = useState(false);

  const toggleBurger = () => {
    setOpen((prev) => !prev);
  };

  return (
    <>
      <HeaderWrapper>
        <StyledName>JOSHFARR</StyledName>
        <LinkWrapper>
          <div style={{ display: "flex", gap: "1em", marginRight: "3em" }}>
            <StyledLink data-scroll href="#about">
              About
            </StyledLink>
            <StyledLink data-scroll href="#work">
              Work
            </StyledLink>
            <StyledLink
              href="src/assets/Joshua Farr Resume - Software Engineering.pdf"
              download="Joshua Farr Resume - Software Engineering"
            >
              Resume
            </StyledLink>
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

      <>
        <MobileHeaderWrapper>
          <div style={{ zIndex: "12" }}>
            <Hamburger
              direction="right"
              label="Show menu"
              rounded
              distance="sm"
              easing="ease-in"
              color={isOpen ? "white" : "black"}
              size={40}
              toggled={isOpen}
              toggle={setOpen}
            />
          </div>

          <></>
          <StyledName>JOSHFARR</StyledName>
        </MobileHeaderWrapper>

        {isOpen && (
          <MobileMenu>
            <>
              <MobileLinks>
                <StyledLink
                  data-scroll
                  href="#about"
                  onClick={() => toggleBurger()}
                >
                  About
                </StyledLink>
                <StyledLink
                  data-scroll
                  href="#work"
                  onClick={() => toggleBurger()}
                >
                  Work
                </StyledLink>
                <StyledLink
                  href="src/assets/Joshua Farr Resume - Software Engineering.pdf"
                  download="Joshua Farr Resume - Software Engineering"
                  onClick={() => toggleBurger()}
                >
                  Resume
                </StyledLink>

                <MobileSocialWrapper>
                  <StyledLink href="https://www.linkedin.com/in/joshuaafarr/">
                    <MdOutlineMail size={"1.45em"} />
                  </StyledLink>
                  <StyledLink href="https://www.linkedin.com/in/joshuaafarr/">
                    <BsLinkedin />
                  </StyledLink>
                  <StyledLink href="https://github.com/Joshua-Farr">
                    <FaGithubSquare size={"1.2em"} />
                  </StyledLink>
                </MobileSocialWrapper>
              </MobileLinks>
            </>
          </MobileMenu>
        )}
      </>
    </>
  );
};
