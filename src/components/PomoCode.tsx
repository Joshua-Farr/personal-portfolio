import styled from "styled-components"
import { Footer } from "./Footer"
import { Header } from "./Header"

export const PomoCode = () =>{

    const CaseStudyWrapper = styled.div`
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 700px;
        margin-inline: auto;
    `


    const Callout = styled.div`
    color: white;
    background-color: #141c3a;
    border-radius: 17px;
    padding: 1rem;
    borderradius: 10px;
    box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    text-align: left;
    margin-block: 1em;

    @media only screen and (max-width: 450px), (max-width: 750px)  {
        flex-direction: column;
        align-items: flex-start;
      }
  `;

    const StyledH1 = styled.h1`
        font-Size: 3em; 
        margin-top: 1rem;
        text-align: center;

    `

    const StyledSubtitle = styled.p`
        font-size: 1.2rem;
        font-weight: 300;
        margin-bottom: 1em;
        margin-top: 1em;
    `


    const StyledParagraph = styled.p`
        font-size: 1.2rem;
        font-weight: 300;
        margin-bottom: 1em;
        text-align: left;
    `

    const StyledImage = styled.img`
        width: 100%;
    `

    const StyledSectionTitle = styled.h1`
        font-size: 2rem;
        margin-right: auto;    
    `

    const Divider = styled.div`
        width: calc(27.5%);
        border: 3px solid black;
        margin-bottom: 2em;
        margin-top: 2em;
        margin-left: auto;
        margin-right: auto;

        font-size: 1.2rem;
        font-weight: 300;

        @media only screen and (max-width: 450px)  {
        border: 2px solid black;
        width: 200px;

        }
    `;



    return(
        <>
        <Header />
    <CaseStudyWrapper>
    

        <StyledH1>PomoCode</StyledH1>
        <StyledSubtitle style={{textAlign: "center"}}>
            
            PomoCode is a timer designed to enhance both a developers productivity and time management all while reducing the risk of burnout.
            </StyledSubtitle>

        <StyledImage src="public/pomodoro.png"/>

        <StyledSubtitle>Based off the Pomodoro Technique invented by Francesco Cirillo in the late 1980s, this timer is built around the idea of doing intervals of focused work sessions, typically 25 minutes in duration, followed by short work breaks to optimize efficiency. </StyledSubtitle>

        <Divider></Divider>
        <StyledSectionTitle>About</StyledSectionTitle>
        <StyledParagraph>I built this single-page application from scratch, completely in React. The timer includes the ability for the user to set custom work and break times, pause the timers as needed, as well as change the color for the countdown display.</StyledParagraph>
        <StyledParagraph>After several successful working sessions, the timer automatically sets a longer break time for the user to prevent burnout.</StyledParagraph>

        <Divider></Divider>
        <StyledSectionTitle>Project Purpose and Goal</StyledSectionTitle>
        <StyledParagraph>I've been using the Pomodoro technique since college to help me stay focused while working. However, I've usually just used the built-in-timer on my phone to set the work and break intervals.</StyledParagraph>
        <StyledParagraph>For this project, I wanted to eliminate the need for me to manually set and reset the work/break timers on my phone, thus eliminating any temptation to check notifications, open other apps, etc. I also liked the idea of building a web app because something that I could pull up in a browser could as another reminder to stay focused on my work, rather than mindlessly surfing the web. </StyledParagraph>
        <StyledParagraph>I  knew that working with time in both JavaScript and in React was challenging for many developers so I wanted to to create something for myself to see if I could figure out how to build something that incorporated the two together. </StyledParagraph>


        <Divider></Divider>
        <StyledSectionTitle>Problems and Thought Process</StyledSectionTitle>
        {/* <StyledParagraph><b>The feature that took the most time to perfect was the timer itself.</b></StyledParagraph> */}
<Callout>The feature that took the most time to perfect was the timer itself</Callout>
        <StyledParagraph>The reason being that I needed to find a good way to start and pause a timer as well as keep track of the current time elapsed so that I could pass this information into the Spinner component which would then do some calculations to figure out how much of the circle to display. </StyledParagraph>
        <StyledParagraph>I solved this by using the <b>useState</b>, <b>useEffect</b>, and <b>useRef</b> React hooks in addition to the <b>setInterval</b> javaScript method. </StyledParagraph>
        <StyledParagraph style={{marginBottom:"0"}}>Upon clicking the timer, it immediately invokes setTimerActive which updates the application state (timerActive) from its initial state of false to true. </StyledParagraph>
        <iframe src="https://carbon.now.sh/embed?bg=rgba%28255%2C255%2C255%2C1%29&t=cobalt&wt=none&l=javascript&width=680&ds=false&dsyoff=20px&dsblur=68px&wc=false&wa=true&pv=56px&ph=56px&ln=false&fl=1&fm=Hack&fs=14px&lh=133%25&si=false&es=2x&wm=false&code=const%2520%255BtimerActive%252C%2520setTimerActive%255D%2520%253D%2520useState%28false%29%253B%250A"
        style={{width: "100%", height: "100%", border:"0", transform: "scale(1)", overflow: "hidden"}}
        scrolling="no"
        sandbox="allow-scripts allow-same-origin">
        </iframe>
        <StyledParagraph style={{marginBottom:"0", marginTop: "1em"}}>This useEffect listens for any changes to the timerActive state and passes the currently selected timer's value to the startTimer function. </StyledParagraph>
        <iframe
  src="https://carbon.now.sh/embed?bg=rgba%28255%2C255%2C255%2C1%29&t=cobalt&wt=none&l=javascript&width=700&ds=false&dsyoff=20px&dsblur=68px&wc=false&wa=false&pv=56px&ph=56px&ln=false&fl=1&fm=Hack&fs=14px&lh=133%25&si=false&es=2x&wm=false&code=useEffect%28%28%29%2520%253D%253E%2520%257B%250A%2520%2520%2520%2520if%2520%28timerActive%29%2520%257B%250A%2520%2520%2520%2520%2520%2520startTimer%28timerLength.current%29%253B%250A%2520%2520%2520%2520%257D%2520else%2520%257B%250A%2520%2520%2520%2520%2520%2520clearInterval%28interval.current%29%253B%250A%2520%2520%2520%2520%257D%250A%257D%252C%2520%255BtimerActive%255D%29%253B"
  style={{width: "700px", height: "271px", border:"0", transform: "scale(1)", overflow:"hidden"}}
  scrolling="no"
  sandbox="allow-scripts allow-same-origin">
</iframe>

<StyledParagraph>One of the biggest issues with the project was preventing unessary re-renders due to the the UI changing every second. The solution was using the timerLength showin here. This uses the useRef React hook so that I can store the time left on the timer across renders without causing the application to re-render as it gets updated every second while the timer is active.</StyledParagraph>
<StyledParagraph><b>startTimer is where the majority of the timer's functionality occurs.</b></StyledParagraph>
<StyledParagraph>When called, it gets the current time via new Date() and creates a 1 second setInterval with a callback function that calculates the difference between the time that the function was originally called and the current time. This expression gives us how much time has passed in milliseconds which I then convert to seconds and subtract from the current time on the timer. </StyledParagraph>
<iframe
 src="https://carbon.now.sh/embed?bg=rgba%28255%2C255%2C255%2C1%29&t=cobalt&wt=none&l=javascript&width=700&ds=false&dsyoff=20px&dsblur=68px&wc=true&wa=false&pv=56px&ph=56px&ln=false&fl=1&fm=Hack&fs=14px&lh=143%25&si=false&es=2x&wm=false&code=const%2520startTimer%2520%253D%2520%28length%253A%2520number%29%2520%253D%253E%2520%257B%250A%2520%2520const%2520startTime%2520%253D%2520new%2520Date%28%29%250A%250A%2520%2520interval.current%2520%253D%2520setInterval%28%28%29%2520%253D%253E%2520%257B%250A%2520%2520%2520%2520const%2520updatedTime%2520%253D%2520Date.now%28%29%250A%250A%2520%2520%2520%2520const%2520timeDiff%2520%253D%2520updatedTime%2520-%2520startTime.getTime%28%29%250A%2520%2520%2520%2520const%2520roundedTimeDiff%2520%253D%2520Math.round%28timeDiff%2520%252F%25201000%29%250A%2520%2520%2520%2520timerLength.current%2520%253D%2520length%2520-%2520roundedTimeDiff%2520%252F%252060%250A%250A%2520%2520%2520%2520%252F%252FOther%2520additional%2520timer%2520code%2520not%2520shown%250A%2520%2520%2520%2520const%2520calculatedMin%2520%253D%2520calculateMinutes%28timerLength.current%29%250A%2520%2520%2520%2520const%2520calculatedSeconds%2520%253D%2520calculateSeconds%28timerLength.current%29%250A%250A%2520%2520%2520%2520setTime%28formatToTime%28calculatedMin%252C%2520calculatedSeconds%29%29%250A%2520%2520%257D%252C%25201000%29%250A%257D%250A"
 style={{width: "800px", height: "603px", border:"0", transform: "scale(1)", overflow:"hidden",}}
  sandbox="allow-scripts allow-same-origin"
  scrolling="no"
  >
</iframe>

        <StyledParagraph style={{marginTop: "0"}}>Once the timer was started, I needed a way to be able to reference the interval later so that the time calculations would stop when when the timer was paused.  Similarly to the timerLength, the interval.current in here  is another useRef hook that, allows me to keep a continuous reference to the active interval so that I can reference it later when using clearInterval later on to stop the timer. Otherwise the timer would just keep on going. </StyledParagraph>
        <StyledParagraph>Another issue that I ran into was figuring out how to display the time left . Since timerLength is stored in seconds I couldn't just display that value so I created calculateMinutes and calculateSeconds which returns numbers that can be passed to formatToTime which turns them into strings that can be properly displayed in the timer UI. </StyledParagraph>
        <StyledParagraph>The reason this functionality is necessary is because on a typical timer 60 seconds is shown as 1:00 (with two trailing zeroes) rather than 00:60 and 9 seconds is shown as 0:09 (leading zero) rather than 00:9. The formatToTime function this ensures that the times are displayed correctly and used to update the interface is finally updated. </StyledParagraph>

        <iframe
  src="https://carbon.now.sh/embed?bg=rgba%28255%2C255%2C255%2C1%29&t=cobalt&wt=none&l=javascript&width=700&ds=false&dsyoff=20px&dsblur=68px&wc=true&wa=false&pv=56px&ph=56px&ln=false&fl=1&fm=Hack&fs=14px&lh=143%25&si=false&es=2x&wm=false&code=const%2520formatToTime%2520%253D%2520%28minutes%253A%2520number%252C%2520seconds%253A%2520number%29%2520%253D%253E%2520%257B%250A%2520%2520let%2520formattedMinutes%2520%253D%2520%2560%2524%257Bminutes%257D%2560%250A%2520%2520let%2520formattedSeconds%2520%253D%2520%27%27%250A%250A%2520%2520if%2520%28seconds%2520%253C%253D%25209%29%2520%257B%250A%2520%2520%2520%2520formattedSeconds%2520%253D%2520%25600%2524%257Bseconds%257D%2560%250A%2520%2520%257D%2520else%2520if%2520%28seconds%2520%253D%253D%253D%252060%29%2520%257B%250A%2520%2520%2520%2520formattedSeconds%2520%253D%2520%256000%2560%250A%2520%2520%257D%2520else%2520%257B%250A%2520%2520%2520%2520formattedSeconds%2520%253D%2520%2560%2524%257Bseconds%257D%2560%250A%2520%2520%257D%250A%2520%2520return%2520%2560%2524%257BformattedMinutes%257D%253A%2524%257BformattedSeconds%257D%2560%250A%257D%250A"
  style={{width: "800px", height: "603px", border:"0", transform: "scale(1)", overflow:"hidden",}}
  sandbox="allow-scripts allow-same-origin">
</iframe>


    <Divider></Divider>
    <StyledSectionTitle>Lessons Learned</StyledSectionTitle>



    </CaseStudyWrapper>
        <Footer />
        </>
    )
    
}