// App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout"; // Import the layout
import RoomPage from "./components/RoomPage"; // Import RoomPage component
import MainComponent from "./components/MainComponent"; // Import MainComponent

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<MainComponent />} /> 
          <Route path="/room/:roomName" element={<RoomPage />} /> 
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
