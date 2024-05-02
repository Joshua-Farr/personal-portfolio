import { ProjectPreviewCard } from "./ProjectPreviewCard"


export const MainPage = () => {
    return ( 
        <>
        <div style={{display: "flex", flexDirection: "column", justifyContent: "center", border: "2px solid red", height: "100vh"}}>
            <div style={{marginLeft: "3em",}}>
                <h1 style={{fontSize: "6em", marginBottom: "1rem"}}>Hi, I'm Josh.</h1>
                <h3 style={{maxWidth: "750px"}}>
                    I'm a Nashville-based software engineer who loves to find simple & elegant solutions to complex front-end problems.
                </h3>
            </div>
        </div>
        <div style={{display:"grid", gridTemplateColumns: "1fr 1fr", justifyContent: "center", border: "2px solid green"}}>

            <ProjectPreviewCard/>
            <ProjectPreviewCard/>
            <ProjectPreviewCard/>
            <ProjectPreviewCard/>
        </div>
            </>
    )
}