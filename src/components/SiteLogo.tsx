import styled from "styled-components";

export const SiteLogo = () => {
  const LogoWrapper = styled.div`
    border: 3px solid black;
    width: 50px;
    height: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
  `;

  const StyledLetters = styled.div`
    margin: 12;
    letter-spacing: 8px;
    text-align: right;
  `;

  return (
    <LogoWrapper>
      <StyledLetters>JO</StyledLetters>
      <StyledLetters>SH</StyledLetters>
    </LogoWrapper>
  );
};
