import styled from "styled-components"

export const ProjectPreviewCard = () =>
    {


        const ProjectTitle = styled.span`
            font-size: 2rem;
            font-weight: 700;
        `


        const Card = styled.div`
            max-width: 500px; 
            border-radius: 17px;
            padding: 2rem; 
            // border: 2px solid red; 
            borderRadius: 10px;
            box-shadow: 0px 3px 15px rgba(0,0,0,0.2);




        `

        const StyledButton = styled.a`

            border: 2px solid #646cff;
            padding: .5em 2em;
            border-radius: 17px;
            margin-top: 50em;

            &:hover{
                background-color: #646cff;
                color: white;

                transition: background-color .5s;
                transition-behavior: normal;
                transition-duration: .75s;
                transition-timing-function: ease;
                transition-delay: 0s;


            }

        `

        return (
            <Card>
                <img src="src/assets/pictures/sample-img.png" alt=" " style={{maxWidth: "100%", borderRadius: "5px"}}/>

                <ProjectTitle>Project Title</ProjectTitle>
                <p style={{maxWidth: "375px"}}>Here is a super small description of the project. Lorem ipsum dolor, sit amet consectetur adipisicing.</p>

                <StyledButton href="">Learn more</StyledButton>
            </Card>

        )
    }