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

  const StyledLink = styled.a`
    color: #ffffff;
    padding: 1.25em 2em;
    background-color: transparent;
    border: 1px solid #5be9b9;
    padding: 0.5em 2em;
    border-radius: 17px;
    font-weight: 500;

    &:hover {
      color: black;
      cursor: pointer;
      background-color: #5be9b9;
    }
  `;

  const StyledLinkWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 1em;
    color: white;
    background-color: #141c3a;
    border-radius: 17px;
    padding: 1rem;
    width: 100%;

    margin-bottom: 2em;
    margin-top: 2em;

    @media only screen and (max-width: 450px), (max-width: 750px) {
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  `;

  const StyledLinkTitle = styled.h2`
    color: white;
    margin-right: auto;
    margin-left: 1em;
    @media only screen and (max-width: 450px), (max-width: 750px) {
      margin: auto;
    }
  `;

  return (
    <>
      <Header />
      <CaseStudyWrapper>
        <StyledH1>MintRoad</StyledH1>
        <StyledSubtitle style={{ textAlign: "center" }}>
          MintRoad is a customizable e-commerce storefront application built for
          small businesses to overcome the initial hurdle of selling online.
        </StyledSubtitle>
        <StyledImage src="/mintroad-img.png" />
        <StyledParagraph>
          This multi-page web app contains features like the ability to list
          products, build a customizable online storefront, track inventory, and
          analyze their performance via an integrated analytics dashboard. All
          these features are hand-picked to allow entrepreneurs easy access to
          the online sales world.
        </StyledParagraph>

        <StyledLinkWrapper>
          <StyledLinkTitle>Want to see more?</StyledLinkTitle>
          <StyledLink>Live site</StyledLink>
          <StyledLink>Source code</StyledLink>
        </StyledLinkWrapper>
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
        <StyledParagraph>
          The primary goal of this project was to build an intuitive and
          efficient storefront interface. I wanted to ensure that products could
          be displayed within a limited screen area, allowing users to easily
          navigate through the offerings. By creating a dynamic and responsive
          UI, I aimed to enhance the overall user experience, minimizing
          decision fatigue and presenting products in a clear and appealing
          manner.
        </StyledParagraph>
        <StyledSectionTitle>Problems and Thought Process</StyledSectionTitle>
        <StyledParagraph>
          One of the main challenges I faced was implementing a dynamic
          storefront that maintained a fixed sidebar while allowing the main
          content to scroll. To address this, I utilized routes to fix the left
          sidebar component, providing the right side with the freedom to
          scroll. This solution resulted in a clean and intuitive interface that
          was easy to navigate.
        </StyledParagraph>
        <StyledParagraph>
          Designing a user-friendly interface that minimized decision fatigue
          was also crucial. Inspired by Instagram’s grid layout, I focused on
          simplicity, highlighting images with concise text. This approach
          streamlined the purchasing decision process, making it straightforward
          for users.
        </StyledParagraph>
        <StyledParagraph>
          Managing a large object containing all product details, such as
          quantity, price, and images, posed another challenge. I addressed this
          by employing a robust state management system, ensuring seamless
          integration and easy data retrieval for the storefront.
        </StyledParagraph>

        <StyledParagraph>
          Ensuring a solid project architecture was vital for handling
          functionalities like an analytics dashboard, inventory management, and
          the storefront itself. To achieve this, I front-loaded much of the
          work, drawing out the project structure and mapping routes and
          components in advance. This careful planning helped me avoid potential
          bugs and facilitated a smoother development process.
        </StyledParagraph>
        <StyledSectionTitle>Lessons Learned</StyledSectionTitle>

        <StyledParagraph>
          This project reinforced the importance of thorough initial planning,
          often referred to as "nemawashi" in Japanese. By mapping out the
          project structure and building relationships within the project
          components early on, I was able to prevent future complications and
          streamline the development process.
        </StyledParagraph>
        <StyledParagraph>
          Using Material UI for styled components proved to be a game-changer.
          Its ease of use and theming capabilities allowed me to develop quickly
          while maintaining consistent styling across the application. This
          project highlighted the benefits of utilizing modern UI libraries to
          enhance development efficiency.
        </StyledParagraph>
        <StyledParagraph>
          Effective state management was crucial for handling complex data
          structures. This project underscored the importance of robust state
          management systems in building scalable applications, ensuring that
          all product information was tracked and integrated seamlessly.
        </StyledParagraph>
        <StyledParagraph>
          Strategic project management was invaluable. By thinking through the
          project architecture before diving into development, I saved time and
          avoided unnecessary rework. This approach proved to be highly
          effective and is a strategy I will continue to employ in future
          projects.
        </StyledParagraph>
      </CaseStudyWrapper>
      <Footer />
      <ScrollToTop />
    </>
  );
};
