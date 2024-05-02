import styled from "styled-components"

export const Header = () => {
    const HeaderWrapper = styled.div`
        background-color: #F6F4F1;
        height: 3em;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding-inline: 2em;
    `

    const StyledName = styled.span`
        font-size: 1.25rem;
        font-weight: 400;

    `

    const StyledLink = styled.a`
    

    `

    const LinkWrapper = styled.div`
    width: 300px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    
    `


    return (
            <HeaderWrapper>    
                <StyledName>
                    JOSHUA FARR
                </StyledName>
                <LinkWrapper>
                    <StyledLink>About</StyledLink>
                    <StyledLink>Work</StyledLink>
                    <StyledLink>Resume</StyledLink>
                </LinkWrapper>
            </HeaderWrapper>
        )
}