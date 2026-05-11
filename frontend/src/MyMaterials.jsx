import axios from "axios";
import { useEffect, useState } from "react";
import MaterialCard from "./MaterialCard";
import "./MyMaterials.css";

const API = import.meta.env.VITE_API || "http://localhost:8000";

function MyMaterials({ userName, setPage }) {
  const [materials, setMaterials] = useState([]);
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchMyMaterials();
  }, []);

  async function fetchMyMaterials() {
    try {
      const res = await axios.get(`${API}/my-materials/${userName}`);
      setMaterials(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this material?")) return;

    try {
      await axios.delete(`${API}/materials/${id}`);
      fetchMyMaterials();
    } catch (err) {
      alert("Delete failed");
    }
  }

  async function handleVisibility(id) {
    try {
      await axios.patch(`${API}/materials/${id}/visibility`);
      fetchMyMaterials();
    } catch (err) {
      alert("Visibility update failed");
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();

    try {
      await axios.put(`${API}/materials/${editing.id}`, {
        title: editing.title,
        description: editing.description,
        subject: editing.subject,
        semester: editing.semester,
        tags: editing.tagsText
          ? editing.tagsText.split(",").map(t => t.trim())
          : []
      });

      setEditing(null);
      fetchMyMaterials();
    } catch (err) {
      alert("Update failed");
    }
  }

  const filteredMaterials = materials.filter((item) => {
    if (filter === "all") return true;
    return item.visibility === filter;
  });

  const publicCount = materials.filter((m) => m.visibility === "public").length;
  const privateCount = materials.filter((m) => m.visibility === "private").length;

  return (
    <div className="materials-section">
      <h1>My Materials</h1>
      <p className="muted-text">Your public and private uploads.</p>

      <div className="my-stats-row">
        <span>Total: {materials.length}</span>
        <span>Public: {publicCount}</span>
        <span>Private: {privateCount}</span>
      </div>

      <div className="filter-row">
        <button
          className={filter === "all" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("all")}
        >
          All
        </button>

        <button
          className={filter === "public" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("public")}
        >
          Public
        </button>

        <button
          className={filter === "private" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("private")}
        >
          Private
        </button>

        <button className="upload-small-btn" onClick={() => setPage("upload")}>
          + Upload New
        </button>
      </div>

      {editing && (
        <div className="edit-box">
          <h2>Edit Material</h2>

          <form onSubmit={handleUpdate}>
            <input
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              placeholder="Title"
              required
            />

            <textarea
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              placeholder="Description"
              required
            />

            <input
              value={editing.subject}
              onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
              placeholder="Subject"
              required
            />

            <input
              value={editing.semester}
              onChange={(e) => setEditing({ ...editing, semester: e.target.value })}
              placeholder="Semester"
              required
            />

            <input
              value={editing.tagsText}
              onChange={(e) => setEditing({ ...editing, tagsText: e.target.value })}
              placeholder="Tags comma separated"
            />

            <div className="edit-actions">
              <button type="submit" className="save-edit-btn">Save Changes</button>
              <button type="button" className="cancel-edit-btn" onClick={() => setEditing(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredMaterials.length === 0 ? (
        <p className="empty-text">No materials found.</p>
      ) : (
        <div className="materials-grid">
          {filteredMaterials.map((item) => (
            <MaterialCard
              key={item.id}
              item={item}
              userName={userName}
              onSave={undefined}
              isOwner={true}
              onEdit={() =>
                setEditing({
                  ...item,
                  tagsText: item.tags ? item.tags.join(", ") : ""
                })
              }
              onDelete={() => handleDelete(item.id)}
              onVisibilityToggle={() => handleVisibility(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyMaterials;