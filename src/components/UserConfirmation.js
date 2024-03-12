import React from 'react';

const UserConfirmation = ({ data, onRestart }) => {
    console.log(data.photo)
  return (
    <div>
      <h2>Подтверждение данных</h2>
      <p>Имя: {data.name}</p>
      <p>Дата рождения: {data.dateOfBirth}</p>
      {data.photo && <img src={data.photo} alt="User" style={{ width: '100px', height: '100px' }} />}
      <button onClick={onRestart}>Начать заново</button>
    </div>
  );
};

export default UserConfirmation;