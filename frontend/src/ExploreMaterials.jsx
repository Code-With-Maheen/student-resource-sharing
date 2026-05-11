import axios from "axios";
import { useEffect, useState } from "react";
import "./ExploreMaterials.css";
import MaterialCard from "./MaterialCard";

const API = import.meta.env.VITE_API || "http://localhost:8000";

function ExploreMaterials({ userName, refreshCounts }) {
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMaterials();
  }, []);

  async function fetchMaterials() {
    try {
      const res = await axios.get(`${API}/materials`);
      setMaterials(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  function handleAfterSave() {
    fetchMaterials();
    if (refreshCounts) refreshCounts();
  }

  const filteredMaterials = materials.filter((item) => {
    const text = `${item.title} ${item.description} ${item.subject} ${item.semester}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="materials-section">
      <h1>Explore Materials</h1>
      <p className="muted-text">Only public materials are shown here.</p>

      <input
        className="search-input"
        type="text"
        placeholder="Search by title, subject, semester..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredMaterials.length === 0 ? (
        <p className="empty-text">No public materials found.</p>
      ) : (
        <div className="materials-grid">
          {filteredMaterials.map((item) => (
            <MaterialCard
              key={item.id}
              item={item}
              userName={userName}
              onSave={handleAfterSave}
              alreadySaved={item.savedBy?.includes(userName)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ExploreMaterials;