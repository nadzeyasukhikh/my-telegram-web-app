import React, { useState } from "react";
import UserForm from "./components/UserForm";
import WebcamCapture from "./components/WebcamCapture";
import UserConfirmation from "./components/UserConfirmation"; 

function App() {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    name: "",
    dateOfBirth: "",
    photo: null,
  });

  const handleUserFormSubmit = (formData) => {
    setUserData({ ...userData, ...formData });
    setStep(2);
  };

  const handleCapture = (imageSrc) => {
    console.log(imageSrc); 
    setUserData({ ...userData, photo: imageSrc });
    console.log(userData); 
    setStep(3);
  };

  const handleRestart = () => {
    setStep(1);
    setUserData({
      name: "",
      dateOfBirth: "",
      photo: null,
    });
  };
  
  const [fullScreen, setFullScreen] = useState(true);

  const toggleScreenMode = () => {
    setFullScreen(!fullScreen);
  };

  return (
    <div className={`container ${fullScreen ? 'full-screen' : 'three-quarters-screen'}`}>
      {step === 1 && <UserForm onSubmit={handleUserFormSubmit} />}
      {step === 2 && <WebcamCapture onCapture={handleCapture} />}
      {step === 3 && (
        <UserConfirmation data={userData} onRestart={handleRestart} />
      )}<br></br>
       <button onClick={toggleScreenMode}>Switch mode</button>
    </div>
  );
}

export default App;
