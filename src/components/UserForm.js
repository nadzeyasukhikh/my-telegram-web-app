import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setName, setDateOfBirth } from "../features/user/userSlice";

function UserForm({ onSubmit }) {
  const [name, setNameValue] = useState("");
  const [dateOfBirth, setDateOfBirthValue] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(setName(name));
    dispatch(setDateOfBirth(dateOfBirth));
    onSubmit({ name, dateOfBirth });
   
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name">Name:</label>
      <input
        id="name"
        type="text"
        value={name}
        onChange={(e) => setNameValue(e.target.value)}
      />

      <label htmlFor="dateOfBirth">Date of Birth:</label>
      <input
        id="dateOfBirth"
        type="date"
        value={dateOfBirth}
        onChange={(e) => setDateOfBirthValue(e.target.value)}
      />

      <button type="submit">Submit</button>
    </form>
  );
}

export default UserForm;
