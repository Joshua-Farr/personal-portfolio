import { BsLinkedin } from "react-icons/bs"
import { MdOutlineMail } from "react-icons/md"
import styled from "styled-components"

export const Footer = () => {

    const FooterWrapper = styled.div`
        margin-top: 4em;
        margin-bottom: 2em;
        text-align: center;    
    `

    const StyledLink = styled.a`
        display: flex;
        flex-direction: row;
        justify-content: center;

        &:hover{
            cursor: pointer;
        }
    `


    const StyledButton = styled.button`
        color: #ffffff;
        padding: 1.25em 2em;
        background-color: transparent;
        border: 1px solid #5BE9B9;
        padding: .5em 2em;
        border-radius: 17px;
        font-weight: 500;
        margin-left: 2em;


        &:hover{
            cursor: pointer;
            background-color: #5BE9B9;
            color: #3B3B3B;

        }
    `


    const StyledConnect = styled.div`
        color: white;
        background-color: #141C3A;
        height: 10em;
        border-radius: 17px;
        padding: 2rem; 
        borderRadius: 10px;
        box-shadow: 0px 3px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
    `

    const Copyright = styled.h5`
    margin-top: 5em;
    `
    return (
        <>
        <FooterWrapper>

            <StyledConnect>
                Interested in working together? Let's meet up! I'll buy the coffee.
                <StyledButton>Get Started</StyledButton>
            </StyledConnect>
            
            {/* <StyledLink>
                <MdOutlineMail />
            </StyledLink>
            <StyledLink>
                <BsLinkedin />
            </StyledLink>
         */}
            <Copyright>Website built in React.js by Josh Farr | Copyright © 2024</Copyright>


        </FooterWrapper>
        </>
    )
}