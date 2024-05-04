import styled from "styled-components"
import { ProjectPreviewCard } from "./ProjectPreviewCard"

export const WorkExamples = () =>{

    const StyledTitle = styled.h1`
        font-size: 3rem;
        margin-bottom: 1rem;
    
    `

    const StyledParagraph = styled.p`
        maxWidth: 750px; 
        fontWeight: 300;
        margin-bottom: 1rem;
    `


    return (

        <>
        <StyledTitle>My Work</StyledTitle>
        <StyledParagraph>Hello I am a styled paragraph. Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid harum quibusdam sunt optio, sequi nostrum sed perspiciatis. A corporis, hic tempora exercitationem qui voluptatem labore, ducimus facilis incidunt quis quas. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Excepturi quos perferendis autem, minima fugiat odit dicta facilis eum natus sequi officiis sit obcaecati eius dolorem expedita odio, est illo quas.</StyledParagraph>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", marginTop: "2em"}}>
            <div style={{display:"grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", gap: "3em"}}>
                <ProjectPreviewCard/>
                <ProjectPreviewCard/>
                <ProjectPreviewCard/>
                <ProjectPreviewCard/>
            </div>
        </div>
        </>
    )
}