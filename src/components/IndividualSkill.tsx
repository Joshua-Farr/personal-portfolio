import styled from "styled-components";

export const IndividualSkill = ({ children }: any) => {
  const BulletPoint = styled.img``;
  const IndividualSkillWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0.5rem;
    border-radius: 10px;
    box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.2);

    &:hover {
      transform: scale(1.1);
    }
  `;

  return (
    <IndividualSkillWrapper>
      <BulletPoint
        src="/puzzle-piece.svg"
        style={{ height: ".75em", width: ".75em", paddingRight: ".19em" }}
      />
      {children}
    </IndividualSkillWrapper>
  );
};
