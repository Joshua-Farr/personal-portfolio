// import { BsPuzzleFill } from "react-icons/bs"

export const HeroSection = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "calc(100vh - 4em)",
      }}
    >
      <div>
        <h1 style={{ fontSize: "6em", marginBottom: "1rem" }}>Hi, I'm Josh</h1>
        <h3 style={{ maxWidth: "750px", fontWeight: "300" }}>
          I'm a Nashville-based software engineer & jigsaw puzzle enthusiast who
          loves to find simple and elegant solutions to complex front-end
          problems. I believe in building products that both delight & enhance
          the overall user experience.
        </h3>
      </div>
    </div>
  );
};
