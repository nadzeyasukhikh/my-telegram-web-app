import React from 'react';

const UserConfirmation = ({ data, onRestart }) => {
    console.log(data.photo)
  return (
    <div>
      <h2>Data confirmation</h2>
      <p>Name: {data.name}</p>
      <p>Date of Birth: {data.dateOfBirth}</p>
      {data.photo && <img src={data.photo} alt="User" style={{ width: '100px', height: '100px' }} />}<br></br>
      <button onClick={onRestart}>Start again</button>
    </div>
  );
};

export default UserConfirmation;