import styled from "styled-components";
import { Footer } from "./Footer";
import { Header } from "./Header";
import ScrollToTop from "./ScrollToTop";

export const MintRoad = () => {
  const CaseStudyWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 700px;
    margin-inline: auto;
  `;

  const StyledH1 = styled.h1`
    font-size: 3em;
    margin-top: 1rem;
    text-align: center;
  `;

  const StyledSubtitle = styled.p`
    font-size: 1.2rem;
    font-weight: 300;
    margin-bottom: 1em;
    margin-top: 1em;
  `;

  const StyledParagraph = styled.p`
    font-size: 1.2rem;
    font-weight: 300;
    margin-bottom: 1em;
    text-align: left;
  `;

  const StyledImage = styled.img`
    width: 100%;
  `;

  const StyledSectionTitle = styled.h1`
    font-size: 2rem;
    margin-right: auto;
  `;

  const Divider = styled.div`
    width: calc(27.5%);
    border: 3px solid black;
    margin-bottom: 2em;
    margin-top: 2em;
    margin-left: auto;
    margin-right: auto;

    font-size: 1.2rem;
    font-weight: 300;

    @media only screen and (max-width: 450px) {
      border: 2px solid black;
      width: 200px;
    }
  `;

  return (
    <>
      <Header />
      <CaseStudyWrapper></CaseStudyWrapper>
      <Footer />
      <ScrollToTop />
    </>
  );
};
