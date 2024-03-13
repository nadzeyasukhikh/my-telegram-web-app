import React, { useState } from "react";
import UserForm from "./components/UserForm";
import WebcamCapture from "./components/WebcamCapture";
import UserConfirmation from "./components/UserConfirmation";
import { Routes, Route, Navigate } from "react-router-dom";

function App() {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    name: "",
    dateOfBirth: "",
    photo: null,
  });

  const handleUserFormSubmit = (formData) => {
    setUserData({ ...userData, ...formData });
    setStep(2); // Переходим на следующий шаг после получения данных от пользователя
  };

  const handleCapture = (imageSrc) => {
    setUserData({ ...userData, photo: imageSrc });
    setStep(3); // Переходим на следующий шаг после получения фотографии
  };

  const handleRestart = () => {
    setStep(1); // Сбрасываем шаг на начальное значение
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
      <Routes>
        <Route path="/" element={<UserForm onSubmit={handleUserFormSubmit} />} />
        <Route path="/capture" element={<WebcamCapture onCapture={handleCapture} />} />
        <Route
          path="/confirmation"
          element={<UserConfirmation data={userData} onRestart={handleRestart} />}
        />
        {/* Переход на следующий шаг после получения данных от бота */}
        {step === 2 && <Navigate to="/capture" />}
        {step === 3 && <Navigate to="/confirmation" />}
      </Routes>
      <br></br>
      <button onClick={toggleScreenMode}>Switch mode</button>
    </div>
  );
}

export default App;
