import React, { useState } from "react";
import { db } from "../firebase";  // ใช้ Firebase Firestore
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

function AddTopic() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState("หัวข้อ 1");
  const [description, setDescription] = useState("");
  const [membersPerGroup, setMembersPerGroup] = useState(4);
  const [maxGroups, setMaxGroups] = useState(5);
  const [status, setStatus] = useState("active");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!currentUser) {
        setError("Please log in first.");
        return;
      }

      await addDoc(collection(db, "topics"), {
        name: name,
        description: description,
        membersPerGroup: Number(membersPerGroup),
        maxGroups: Number(maxGroups),
        status: status,
        createdAt: serverTimestamp(),
      });

      alert("Topic added successfully");
      navigate("/topp8/admin");
    } catch (err) {
      setError("Error adding topic: " + err.message);
    }
  };

  return (
    <div className="admin-form">
      <h2>เพิ่มหัวข้อใหม่</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="ชื่อหัวข้อ"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />



        <input
          type="number"
          placeholder="สมาชิกต่อกลุ่ม"
          value={membersPerGroup}
          onChange={(e) => setMembersPerGroup(e.target.value)}
          min={1}
          required
        />

        <input
          type="number"
          placeholder="จำนวนกลุ่มสูงสุด"
          value={maxGroups}
          onChange={(e) => setMaxGroups(e.target.value)}
          min={1}
          required
        />

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>

        <button type="submit">บันทึกหัวข้อ</button>
      </form>
    </div>
  );
}

export default AddTopic;