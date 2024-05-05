// import { Footer } from "./Footer"
import styled from "styled-components";
import { AboutMe } from "./AboutMe";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { HeroSection } from "./HeroSection";
import { Skills } from "./Skills";
import { WorkExamples } from "./WorkExamples";

export const MainPage = () => {
  const Divider = styled.div`
    width: calc(27.5%);
    border: 3px solid black;
    margin-bottom: 6em;
    margin-top: 6em;
    margin-left: auto;
    margin-right: auto;

    @media only screen and (max-width: 450px)  {
      border: 2px solid black;
      width: 200px;

    }
  `;

  return (
    <>
      <Header />
      <HeroSection />
      <AboutMe id="about"/>
      <Divider />
      <Skills />
      <Divider />
      <WorkExamples />
      <Footer />
    </>
  );
};
