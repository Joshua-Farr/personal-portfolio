import styled from "styled-components";
import { Footer } from "./Footer";
import { Header } from "./Header";
import ScrollToTop from "./ScrollToTop";

export const CedhNexus = () => {
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
      <StyledH1>
        Magic: The Gathering<br></br>Commander Practice Tool
      </StyledH1>
      <StyledSubtitle style={{ textAlign: "center" }}>
        A web-based application designed to help players practice and improve
        their gameplay in the Magic: The Gathering Competitive Commander format.
      </StyledSubtitle>
      <StyledImage src="/sample-img.png" />
      <CaseStudyWrapper>
        <StyledSectionTitle>About</StyledSectionTitle>
        <StyledParagraph>
          I developed a web-based tool to help players practice and improve
          their gameplay in the Magic: The Gathering Commander format. This
          project was driven by my own experiences and challenges as a new
          player, aiming to create a solution that benefits both myself and the
          broader Magic: The Gathering community.
        </StyledParagraph>

        <Divider></Divider>
        <StyledSectionTitle>Project Purpose and Goal</StyledSectionTitle>
        <StyledParagraph>
          The primary goal of this project was to create a practice tool for the
          Commander format of Magic: The Gathering. This format involves four
          players each with 100-card singleton decks, and the game's dynamic
          nature requires strategic planning from the initial hand. Given my
          limited time to play in person, I needed a way to practice and improve
          my gameplay efficiently. The tool allows players to simulate games,
          evaluate starting hands, and receive feedback based on various in-game
          scenarios and deck compositions.
        </StyledParagraph>

        <Divider></Divider>
        <StyledSectionTitle>Problems and Thought Process</StyledSectionTitle>
        <StyledParagraph>
          One of the initial challenges I faced was practicing effectively
          without frequent in-person games. I often posted pictures of my hands
          in Discord communities to get feedback, but the advice varied greatly
          depending on game-specific factors such as turn order and commander
          matchups. To address this, I envisioned a tool that could simulate
          these variables and provide more consistent and practical feedback.
        </StyledParagraph>
        <StyledParagraph>
          To build the tool, I leveraged an existing API called Scryfall to
          fetch card images and data. Initially, I scraped the database of
          tournament-winning decks to identify the most popular commanders. The
          biggest technical hurdle was handling the API calls efficiently. My
          initial approach was to make 15 asynchronous API calls to retrieve
          card data, but I soon encountered browser limitations on concurrent
          connections, which severely impacted performance.
        </StyledParagraph>
        <StyledParagraph>
          To solve this, I implemented a queuing system to manage the API calls.
          This system adhered to the API’s rate limits by spacing out the calls
          and preventing throttling. However, I eventually discovered that the
          Scryfall API allowed batch requests, enabling me to fetch multiple
          cards in a single call, which significantly improved performance.
        </StyledParagraph>

        <Divider></Divider>
        <StyledSectionTitle>Lessons Learned</StyledSectionTitle>
        <StyledParagraph>
          This project taught me the importance of understanding and optimizing
          API interactions. Initially, I faced performance issues due to
          excessive concurrent API calls, but by implementing a queuing system
          and utilizing the API’s batch request capability, I improved the
          tool’s efficiency and responsiveness.
        </StyledParagraph>
        <StyledParagraph>
          Creating a tool for a community brought valuable insights into user
          feedback and iterative development. After releasing the minimal viable
          product to my Discord community, I received extensive feedback that
          highlighted various issues and potential improvements. I used GitHub
          to track these issues and rolled out fixes gradually, enhancing the
          tool based on real user experiences.
        </StyledParagraph>
        <StyledParagraph>
          Additionally, I learned the value of automating and simplifying user
          interactions. To facilitate easy decklist uploads, I developed an NPM
          package that uses Playwright to create a virtual browser, intercept
          decklist JSON objects, and parse them for use in the tool. This
          automation reduced the steps required for users to upload their
          decklists, improving the overall user experience.
        </StyledParagraph>
        <StyledParagraph>
          Overall, this project demonstrated my ability to identify a personal
          need, develop a technical solution, and iterate based on user
          feedback. The tool is now actively used by over 200 unique users
          daily, showcasing its value and effectiveness in helping Magic: The
          Gathering players improve their Commander gameplay.
        </StyledParagraph>
      </CaseStudyWrapper>
      <Footer />
      <ScrollToTop />
    </>
  );
};
