import styled from "styled-components"
import { MdOutlineMail } from "react-icons/md";
import { BsLinkedin } from "react-icons/bs";


export const Header = () => {

    const HeaderWrapper = styled.div`
        height: 4em;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    `

    const StyledName = styled.span`
        font-size: 1.25rem;
        font-weight: 500;
    `

    const StyledLink = styled.a`
        display: flex;
        flex-direction: column;
        justify-content: center;

        &:hover{
            cursor: pointer;
        }
    `

    const LinkWrapper = styled.div`
        // width: 200px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    `

    return (
            <HeaderWrapper>    
                <StyledName>
                    JOSHFARR.DEV
                </StyledName>
                <LinkWrapper>
                    <div style={{display: "flex", gap: "1em", marginRight: "3em"}}>
                        <StyledLink>About</StyledLink>
                        <StyledLink>Work</StyledLink>
                        <StyledLink>Resume</StyledLink>
                    </div>
                    <div style={{display: "flex", gap: "1em"}}>
                        <StyledLink>
                            <MdOutlineMail />
                        </StyledLink>
                        <StyledLink>
                            <BsLinkedin />
                        </StyledLink>
                    </div>
                </LinkWrapper>
            </HeaderWrapper>
        )
}