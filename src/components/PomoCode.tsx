import styled from "styled-components";
import { Footer } from "./Footer";
import { Header } from "./Header";
import ScrollToTop from "./ScrollToTop";

export const PomoCode = () => {
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
        <StyledH1>PomoCode</StyledH1>
        <StyledSubtitle style={{ textAlign: "center" }}>
          PomoCode is a timer designed to enhance both a developers productivity
          and time management all while reducing the risk of burnout.
        </StyledSubtitle>

        <StyledImage src="/pomodoro.png" />

        <StyledSubtitle>
          Based off the Pomodoro Technique invented by Francesco Cirillo in the
          late 1980s, this timer is built around the idea of doing intervals of
          focused work sessions, typically 25 minutes in duration, followed by
          short work breaks to optimize efficiency.
        </StyledSubtitle>
        <StyledLinkWrapper>
          <StyledLinkTitle>Want to see more?</StyledLinkTitle>
          <>
            <StyledLink>Live site</StyledLink>
            <StyledLink>Source code</StyledLink>
          </>
        </StyledLinkWrapper>

        <StyledSectionTitle>About</StyledSectionTitle>
        <StyledParagraph>
          I built this single-page application from scratch, completely in
          React. The timer includes the ability for the user to set custom work
          and break times, pause the timers as needed, as well as change the
          color for the countdown display.
        </StyledParagraph>
        <StyledParagraph>
          After several successful working sessions, the timer automatically
          sets a longer break time for the user to prevent burnout.
        </StyledParagraph>

        <Divider></Divider>
        <StyledSectionTitle>Project Purpose and Goal</StyledSectionTitle>
        <StyledParagraph>
          I've been using the Pomodoro technique since college to help me stay
          focused while working. However, I've usually just used the
          built-in-timer on my phone to set the work and break intervals.
        </StyledParagraph>
        <StyledParagraph>
          For this project, I wanted to eliminate the need for me to manually
          set and reset the work/break timers on my phone, thus eliminating any
          temptation to check notifications, open other apps, etc. I also liked
          the idea of building a web app because something that I could pull up
          in a browser could as another reminder to stay focused on my work,
          rather than mindlessly surfing the web.
        </StyledParagraph>
        <StyledParagraph>
          <b>
            I knew that working with time in both JavaScript and in React was
            challenging for many developers so I wanted to to create something
            for myself to see if I could figure out how to build something that
            incorporated the two together.
          </b>
        </StyledParagraph>

        <Divider></Divider>
        <StyledSectionTitle>Problems and Thought Process</StyledSectionTitle>
        {/* <StyledParagraph><b>The feature that took the most time to perfect was the timer itself.</b></StyledParagraph> */}
        <StyledParagraph>
          The feature that took the most time to perfect was the timer itself
        </StyledParagraph>
        <StyledParagraph>
          The reason being that I needed to find a good way to start and pause a
          timer as well as keep track of the current time elapsed so that I
          could pass this information into the Spinner component which would
          then do some calculations to figure out how much of the circle to
          display.
        </StyledParagraph>
        <StyledParagraph>
          I solved this by using the <b>useState</b>, <b>useEffect</b>, and
          <b>useRef</b> React hooks in addition to the <b>setInterval</b>
          javaScript method.
        </StyledParagraph>
        <StyledParagraph style={{ marginBottom: "0" }}>
          Upon clicking the timer, it immediately invokes setTimerActive which
          updates the application state (timerActive) from its initial state of
          false to true.
        </StyledParagraph>
        <StyledImage src="/state-img.png" />
        <StyledParagraph style={{ marginBottom: "0", marginTop: "1em" }}>
          This useEffect listens for any changes to the timerActive state and
          passes the currently selected timer's value to the startTimer
          function.
        </StyledParagraph>
        <StyledImage src="/timer-active.png" />
        <StyledParagraph>
          One of the biggest issues with the project was preventing unessary
          re-renders due to the the UI changing every second. The solution was
          using the timerLength showin here. This uses the useRef React hook so
          that I can store the time left on the timer across renders without
          causing the application to re-render as it gets updated every second
          while the timer is active.
        </StyledParagraph>
        <StyledParagraph>
          <b>
            startTimer is where the majority of the timer's functionality
            occurs.
          </b>
        </StyledParagraph>
        <StyledParagraph>
          When called, it gets the current time via new Date() and creates a 1
          second setInterval with a callback function that calculates the
          difference between the time that the function was originally called
          and the current time. This expression gives us how much time has
          passed in milliseconds which I then convert to seconds and subtract
          from the current time on the timer.
        </StyledParagraph>
        <StyledImage src="/start-timer.png" />

        <StyledParagraph style={{ marginTop: "0" }}>
          Once the timer was started,
          <b>
            I needed a way to be able to reference the interval later so that
            the time calculations would stop when when the timer was paused.
          </b>
          Similarly to the timerLength, the interval.current in here is another
          useRef hook that, allows me to keep a continuous reference to the
          active interval so that I can reference it later when using
          clearInterval later on to stop the timer. Otherwise the timer would
          just keep on going.
        </StyledParagraph>
        <StyledParagraph>
          <b>
            Another issue that I ran into was figuring out how to display the
            time left.
          </b>{" "}
          Since timerLength is stored in seconds I couldn't just display that
          value so I created calculateMinutes and calculateSeconds which returns
          numbers that can be passed to formatToTime which turns them into
          strings that can be properly displayed in the timer UI.
        </StyledParagraph>
        <StyledParagraph>
          The reason this functionality is necessary is because on a typical
          timer 60 seconds is shown as 1:00 (with two trailing zeroes) rather
          than 00:60 and 9 seconds is shown as 0:09 (leading zero) rather than
          00:9. The formatToTime function this ensures that the times are
          displayed correctly and used to update the interface is finally
          updated.
        </StyledParagraph>

        <StyledImage src="/format-time.png" />

        <Divider></Divider>
        <StyledSectionTitle>Lessons Learned</StyledSectionTitle>
        <StyledParagraph>
          This is a project that I originally thought I could get done quickly
          since it didn't seem to be all that difficult, without many moving
          parts (pun intended). I ended up completing it over the course of a
          couple of weeks because the issues with rendering and keeping state in
          the context of an interval were new concepts to me.
          <b>
            This project taught me not underestimate the time needed to complete
            a task, especially if it involves using new technologies or
            techniques.
          </b>
        </StyledParagraph>
        <StyledParagraph>
          Since completing this project,
          <b>
            I've had the opportunity to work on several other projects at
            Asurion where I needed to fix issues in our call center reporting
            that that used the Date functionality
          </b>
          to calculate the value of different call center metrics. During those
          times, I was able to lean on the knowledge gained from this project to
          help me understand all the intricacies and issues that might occur
          when starting and stopping timers.
        </StyledParagraph>
      </CaseStudyWrapper>
      <Footer />
      <ScrollToTop />
    </>
  );
};
