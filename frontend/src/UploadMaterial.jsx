import { useState } from "react";
import "./UploadMaterial.css";

const API = import.meta.env.VITE_API || "http://localhost:8000";

function UploadMaterial({ setPage, userName }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    semester: "",
    tags: "",
    visibility: "public"
  });

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e) {
    setFile(e.target.files[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!file) {
      alert("Please select a file");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("subject", form.subject);
    formData.append("semester", form.semester);
    formData.append("tags", form.tags);
    formData.append("visibility", form.visibility);
    formData.append("uploadedBy", userName);
    formData.append("file", file);

    try {
      const res = await fetch(`${API}/upload`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        alert("Material uploaded successfully!");
        setPage("user-dashboard");
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      alert("Server error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="upload-page">
      <div className="upload-box">
        <h1>Upload Material</h1>

        <form onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
          />

          <input
            name="subject"
            placeholder="Subject"
            value={form.subject}
            onChange={handleChange}
            required
          />

          <input
            name="semester"
            placeholder="Semester"
            value={form.semester}
            onChange={handleChange}
            required
          />

          <input
            name="tags"
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={handleChange}
          />

          <select
            name="visibility"
            value={form.visibility}
            onChange={handleChange}
          >
            <option value="public">Public - Everyone can see</option>
            <option value="private">Private - Only me</option>
          </select>

          <input
            type="file"
            onChange={handleFileChange}
            required
          />

          <button type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>

        <button className="back-btn" onClick={() => setPage("user-dashboard")}>
          Back
        </button>
      </div>
    </div>
  );
}

export default UploadMaterial;