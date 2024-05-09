import "./App.css";
import { MainPage } from "./components/MainPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PomoCode } from "./components/PomoCode";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route>
          <Route path="/" element={<MainPage />} />
          <Route path="/pomocode" element={<PomoCode />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
