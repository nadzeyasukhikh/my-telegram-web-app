import React, { useRef, useState } from 'react';
import Webcam from "react-webcam";
import { useDispatch } from 'react-redux';
import { setPhoto } from '../features/user/userSlice';

const WebcamCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [showConfirmButton, setShowConfirmButton] = useState(false);
  const dispatch = useDispatch();

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    setShowConfirmButton(true); 
    dispatch(setPhoto(imageSrc));
  }, [webcamRef, dispatch]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        setImage(e.target.result);
        setShowConfirmButton(true); 
        dispatch(setPhoto(e.target.result));
      };
      
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleConfirm = () => {
    if (image) {
      onCapture(image); 
    }
  }
  

  return (
    <>
       <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        style={{ maxWidth: '100%', maxHeight: '300px' }} 
      /><br></br>
      <button onClick={capture}>Make a photo</button>
      <input type="file" onChange={handleImageChange} />
      {image && (
        <>
          <img src={image} alt="Capture" style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px' }} /><br></br>
          {showConfirmButton && <button onClick={handleConfirm}>Confirm photo</button>}
        </>
      )}
    </>
  );
};

export default WebcamCapture;