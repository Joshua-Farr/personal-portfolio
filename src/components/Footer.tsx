import { BsLinkedin } from "react-icons/bs"
import { FaGithubSquare } from "react-icons/fa"
import { MdOutlineMail } from "react-icons/md"
import styled from "styled-components"

export const Footer = () => {

    const FooterWrapper = styled.div`
        margin-top: 4em;
        margin-bottom: 2em;
        text-align: center;    
        dispaly: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
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
        flex-direction: row;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        text-align: left;
        `

    const Copyright = styled.h5`
        margin-top: 5em;        
    `
    return (
        <>
        <FooterWrapper>

            <StyledConnect>
                <div >
                    <h2 style={{color: "white", marginBottom: ".25em"}}>
                        Let's team up and make something awesome.
                    </h2>
                        If you're on the lookout for a developer, have any questions, or simply want to chat, I'm all ears!                
                </div>
                <StyledButton>Get in touch</StyledButton>
            </StyledConnect>
            
            {/* <StyledLink>
                <MdOutlineMail />
            </StyledLink>
            <StyledLink>
                <BsLinkedin />
            </StyledLink>
         */}


            <Copyright>Website built in React.js by Josh Farr | Copyright © 2024</Copyright>
            <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "1em", marginTop: "2em"}}>
                <StyledLink>
                    <MdOutlineMail size= {"1.45em"}/>
                </StyledLink>
                <StyledLink href="https://www.linkedin.com/in/joshuaafarr/">
                    <BsLinkedin />
                </StyledLink>
                <StyledLink href="https://github.com/Joshua-Farr">
                    <FaGithubSquare size= {"1.2em"}/>
                </StyledLink>
            </div>


        </FooterWrapper>
        </>
    )
}