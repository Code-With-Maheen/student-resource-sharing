import axios from "axios";
import { useEffect, useState } from "react";
import MaterialCard from "./MaterialCard";
import "./SavedMaterials.css";

const API = import.meta.env.VITE_API || "http://localhost:8000";

function SavedMaterials({ userName }) {
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    fetchSaved();
  }, []);

  async function fetchSaved() {
    try {
      const res = await axios.get(`${API}/saved-materials/${userName}`);
      setMaterials(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="materials-section">
      <h1>Saved Materials</h1>
      <p className="muted-text">Public materials you saved.</p>

      {materials.length === 0 ? (
        <p className="empty-text">No saved materials yet.</p>
      ) : (
        <div className="materials-grid">
          {materials.map((item) => (
            <MaterialCard
  key={item.id}
  item={item}
  userName={userName}
  alreadySaved={true}
  onSave={fetchSaved}   
/>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedMaterials;