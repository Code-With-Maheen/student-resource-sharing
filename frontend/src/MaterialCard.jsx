import axios from "axios";
import { useState } from "react";
import "./MaterialCard.css";

const API = import.meta.env.VITE_API || "http://localhost:8000";

function MaterialCard({
  item,
  userName,
  onSave,
  alreadySaved,
  isOwner,
  onEdit,
  onDelete,
  onVisibilityToggle
}) {
  const [saved, setSaved] = useState(alreadySaved || false);
  const [saving, setSaving] = useState(false);

  const isOwnMaterial = item.uploadedBy === userName;

  async function handleSave() {
    if (saved || saving || isOwnMaterial) return;

    setSaving(true);

    try {
      await axios.post(`${API}/save-material/${item.id}/${userName}`);
      setSaved(true);
      if (onSave) onSave();
    } catch (err) {
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleUnsave() {
    if (saving) return;

    setSaving(true);

    try {
      await axios.post(`${API}/unsave-material/${item.id}/${userName}`);
      setSaved(false);
      if (onSave) onSave();
    } catch (err) {
      alert("Unsave failed");
    } finally {
      setSaving(false);
    }
  }

  function handleDownload() {
    window.open(`${API}/download/${item.filename}`);
  }

  return (
    <div className="material-card">
      <div className="material-card-header">
        <h3>{item.title}</h3>
        <span className={`visibility-badge ${item.visibility === "private" ? "private" : "public"}`}>
          {item.visibility === "private" ? "Private" : "Public"}
        </span>
      </div>

      <p>{item.description}</p>

      <div className="material-info">
        <span><b>Subject:</b> {item.subject}</span>
        <span><b>Semester:</b> {item.semester}</span>
        <span><b>Uploaded By:</b> {item.uploadedBy}</span>
      </div>

      {item.tags && item.tags.length > 0 && (
        <div className="tags-box">
          {item.tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <button className="download-btn" onClick={handleDownload}>
        Download
      </button>

      {onSave !== undefined && !isOwner && !isOwnMaterial && (
        <button
          className="save-btn"
          onClick={saved ? handleUnsave : handleSave}
          disabled={saving}
        >
          {saving ? "Please wait..." : saved ? "Unsave" : "Save"}
        </button>
      )}

      {onSave !== undefined && !isOwner && isOwnMaterial && (
        <button className="save-btn" disabled>
          Your Upload
        </button>
      )}

      {isOwner && (
        <div className="owner-actions">
          <button className="edit-btn" onClick={onEdit}>
            Edit
          </button>

          <button className="visibility-btn" onClick={onVisibilityToggle}>
            {item.visibility === "public" ? "Make Private" : "Make Public"}
          </button>

          <button className="delete-btn" onClick={onDelete}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default MaterialCard;