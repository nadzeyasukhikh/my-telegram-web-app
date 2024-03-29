import React, { useState } from "react";
import UserForm from "./components/UserForm";
import WebcamCapture from "./components/WebcamCapture";
import UserConfirmation from "./components/UserConfirmation"; 
import { Routes, Route, useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate(); 

  const [userData, setUserData] = useState({
    name: "",
    dateOfBirth: "",
    photo: null,
  });

  const handleUserFormSubmit = (formData) => {
    setUserData({ ...userData, ...formData });
    
    navigate("/capture");
  };

  const handleCapture = (imageSrc) => {   
    setUserData({ ...userData, photo: imageSrc });
   
    navigate("/confirmation");
  };

  const handleRestart = () => {
    setUserData({
      name: "",
      dateOfBirth: "",
      photo: null,
    });
  
    navigate("/");
  };

  const [fullScreenMode, setFullScreenMode] = useState(true);

const toggleScreenMode = () => {
  setFullScreenMode(!fullScreenMode);
};


  return (
    <div className={`container ${fullScreenMode ? 'full-screen' : 'three-quarters-screen'}`}>
       <Routes>
        <Route path="/" element={
          <UserForm 
            onSubmit={handleUserFormSubmit} 
            initialData={userData}  
          />
        } />
        <Route path="/capture" element={
          <WebcamCapture 
            onCapture={handleCapture} 
            initialData={userData} 
          />
        } />
        <Route path="/confirmation" element={
          <UserConfirmation 
            data={userData} 
            onRestart={handleRestart} 
          />
        } />
      </Routes>
      <br />
      <button onClick={toggleScreenMode}>Switch mode</button>
    </div>
  );
}

export default App;