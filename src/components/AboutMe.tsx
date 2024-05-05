import styled from "styled-components"

export const AboutMe = () =>{


    const StyledTitle = styled.h1`
        font-size: 3rem;
        margin-bottom: 1rem;
    `

    const StyledParagraph = styled.p`
        maxWidth: 750px; 
        fontWeight: 300;
        margin-bottom: 1rem;
        margin-top: 1rem;
    `

    const ProfilePicture = styled.img`
        border-radius: 50%;
        width: 200px;
        height: 200px;
        margin-bottom: 3rem;
    `

    const AboutMeWrapper = styled.div`
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: left;
        width: 650px;
        margin-inline: auto;
    `

    return (
        <>
            <AboutMeWrapper >
            <ProfilePicture src="src/assets/pictures/stock-image.jpg"></ProfilePicture>
            <StyledTitle>About Me</StyledTitle>
            <>
                <h3>I love doing jigsaw puzzles</h3>
                <StyledParagraph>Growing up, I spent many weekends at my grandparents doing Jigsaw puzzles together - I think this is where my love of problem solving (and frosted sugar cookies) initially started - a passion that has shaped my own professional career and led me to initially pursue a degree where I could do just that. 
                </StyledParagraph>
                <h3>Before I became a developer, I spent 4 years as a process improvement engineer at Asurion helping to make our employees lives easier.</h3>
                <StyledParagraph>During this time, I worked closely with technical product managers and their developers to enhance the performance of tools used by both our in-field technicians and their leaders. Using skills acquired as a lean six-sigma black belt to drive our decisions, ultimately saving Asurion over $12,000,000 per year in operational costs!
                </StyledParagraph>

                <h3>I quickly learned how to effectively bridge the gap between Asurion's operations and technology teams.</h3>


                <h3>Over time, I felt the need to play a larger hands-on role within the product developement cycle.</h3>
                <StyledParagraph>This led me to delve deeper into software engineering, where I could directly contribute to the creation and improvment of technology products. I began a course of self-study and sought out the help of senior engineering mentors to help guide my journey, ultimately finding opportunities to directly contribute to Asurion's production code base.</StyledParagraph>

                <h3>Moving forward, I want to continue working with talented product managers & other engineers helping to bridge the gap between operations and technology all while helping to produce fantastic products that users love.</h3>

            </>
            </AboutMeWrapper>
        </>
    )
}