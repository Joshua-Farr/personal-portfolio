// import { BsPuzzleFill } from "react-icons/bs"

import styled from "styled-components";

export const HeroSection = () => {


    const HeroWrapper = styled.div`
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: calc(100vh - 4em);

        border: 2px solid red;
    
    `

    const StyledH1 = styled.h1`
        font-Size: 6em; 
        margin-bottom: 1rem;

        @media only screen and (max-width: 750px)  {
            font-size: 4rem;
        }

        @media only screen and (max-width: 450px)  {
            font-size: 3rem;
        }

    `

    const StyledH3 = styled.h3`
        maxWidth: 750px; 
        font-weight: 300;

        @media only screen and (max-width: 450px)  {
            font-size: 1rem;
        }
    
    `

    const StyledParagraph = styled.p`
        font-size: 1.2rem;
        font-weight: 300;
        margin-bottom: 1em;
        margin-top: 1em;
        max-width: 750px;
    
        @media only screen and (max-width: 450px)  {
            font-size: 1rem;
        }
    `;
    



  return (
    <HeroWrapper>
        <StyledH1>Hi, I'm Josh</StyledH1>
        <StyledParagraph>
          I'm a Nashville-based software engineer & jigsaw-puzzle enthusiast who
          loves to find simple and elegant solutions to complex front-end
          problems. I believe in building products that both delight & enhance
          the overall user experience.
        </StyledParagraph>
    </HeroWrapper>
  );
};
