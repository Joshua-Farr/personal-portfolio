// import { Footer } from "./Footer"
import { Header } from "./Header"
import { ProjectPreviewCard } from "./ProjectPreviewCard"


export const MainPage = () => {
    return ( 
        <>
            <Header/>
            <div style={{display: "flex", flexDirection: "column", border: "2px solid red", justifyContent: "center", height: "calc(100vh - 4em)"}}>
                <div >
                    <h1 style={{fontSize: "6em", marginBottom: "1rem"}}>Hi, I'm Josh.</h1>
                    <h3 style={{maxWidth: "750px", fontWeight: "300"}}>
                        I'm a Nashville-based software engineer & jigsaw puzzle enthusiast who loves to find simple and elegant solutions to complex front-end problems. 
                        I believe in building products that both delight & enhance the overall user experience.
                        {/* I'm devoted to developing front-end designs that epitomize simplicity and minimalism, streamlining the user experience while maximizing impact and functionality. */}
                    </h3>
                </div>
            </div>
            {/* <div style={{}}> */}
            <div style={{display:"grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", border: "2px solid green", gap: "3em"}}>
                <ProjectPreviewCard/>
                <ProjectPreviewCard/>
                <ProjectPreviewCard/>
                <ProjectPreviewCard/>
            </div>
        </>
    )
}
