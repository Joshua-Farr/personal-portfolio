import styled from "styled-components";
import { Footer } from "./Footer";
import { Header } from "./Header";
import ScrollToTop from "./ScrollToTop";

export const MintRoad = () => {
  const CaseStudyWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 700px;
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

    @media only screen and (max-width: 450px), (max-width: 750px) {
      font-size: 1rem;
    }
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
      <StyledH1>MintRoad</StyledH1>
      <StyledSubtitle style={{ textAlign: "center" }}>
        MintRoad is a customizable e-commerce storefront application built for
        small businesses to overcome the initial hurdle of selling online.
      </StyledSubtitle>
      <StyledImage src="/pomodoro.png" />
      <CaseStudyWrapper>
        <StyledParagraph>
          This multi-page web app contains features like the ability to list
          products, build a customizable online storefront, track inventory, and
          analyze their performance via an integrated analytics dashboard. All
          these features are hand-picked to allow entrepreneurs easy access to
          the online sales world.
        </StyledParagraph>

        <Divider></Divider>
        <StyledSectionTitle>About</StyledSectionTitle>

        <StyledParagraph>
          The idea of being able to provide services or products to people
          anywhere around the world all while making money for it is something
          that I've always been interested in. With the ever-increasing number
          of people starting "side hustles" I wanted to build an application
          that could help those individuals get started monetizing quickly
          without having to jump through too many hoops like you would with
          setting up a something like a Shopify store.
        </StyledParagraph>

        <Divider></Divider>
        <StyledSectionTitle>Project Purpose and Goal</StyledSectionTitle>

        <StyledParagraph></StyledParagraph>
      </CaseStudyWrapper>
      <Footer />
      <ScrollToTop />
    </>
  );
};
