import { useEffect, useState } from "react";
import "./AdminDashboard.css";

function AdminDashboard({ setPage, userName }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
 const [editingMaterial, setEditingMaterial] = useState(null);
const [showMaterialModal, setShowMaterialModal] = useState(false); 

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
    status: "active",
  });

  const [materialForm, setMaterialForm] = useState({
  title: "",
  description: "",
  subject: "",
  semester: "",
});

  const API = import.meta.env.VITE_API;

  useEffect(() => {
  fetchUsers();
  fetchMaterials();
}, []);

  async function fetchUsers() {
    try {
      const res = await fetch(`${API}/users`);
      const data = await res.json();

      if (res.ok) {
        setUsers(data);
      } else {
        alert(data.detail || "Failed to fetch users");
      }
    } catch (error) {
      console.log("Fetch users error:", error);
      alert("Server error while fetching users");
    } finally {
      setLoading(false);
    }
  }

  async function fetchMaterials() {
  try {
    const res = await fetch(`${API}/admin/materials`);
    const data = await res.json();

    if (res.ok) {
      setMaterials(data);
    } else {
      alert(data.detail || "Failed to fetch materials");
    }
  } catch (error) {
    console.log("Fetch materials error:", error);
    alert("Server error while fetching materials");
  } finally {
    setLoadingMaterials(false);
  }
}

async function handleDeleteMaterial(id) {
  const ok = window.confirm("Are you sure you want to delete this material?");
  if (!ok) return;

  try {
    const res = await fetch(`${API}/admin/materials/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (res.ok) {
      fetchMaterials();
    } else {
      alert(data.detail || "Delete material failed");
    }
  } catch (error) {
    console.log("Delete material error:", error);
    alert("Server error while deleting material");
  }
}

async function handleToggleVisibility(id) {
  try {
    const res = await fetch(`${API}/admin/materials/${id}/visibility`, {
      method: "PATCH",
    });

    const data = await res.json();

    if (res.ok) {
      fetchMaterials();
    } else {
      alert(data.detail || "Visibility update failed");
    }
  } catch (error) {
    console.log("Toggle visibility error:", error);
    alert("Server error while updating visibility");
  }
}

function openMaterialEdit(material) {
  setEditingMaterial(material);

  setMaterialForm({
    title: material.title,
    description: material.description,
    subject: material.subject,
    semester: material.semester,
  });

  setShowMaterialModal(true);
}

function closeMaterialModal() {
  setShowMaterialModal(false);
  setEditingMaterial(null);
}

function handleMaterialChange(e) {
  const { name, value } = e.target;
  setMaterialForm((prev) => ({ ...prev, [name]: value }));
}

async function handleMaterialSave(e) {
  e.preventDefault();

  try {
    const res = await fetch(`${API}/admin/materials/${editingMaterial.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(materialForm),
    });

    const data = await res.json();

    if (res.ok) {
      fetchMaterials();
      closeMaterialModal();
    } else {
      alert(data.detail || "Update failed");
    }
  } catch (err) {
    alert("Server error");
  }
}

  function openAddModal() {
    setEditingUser(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      role: "user",
      status: "active",
    });
    setShowModal(true);
  }

  function openEditModal(user) {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || "",
      password: "",
      role: user.role,
      status: user.status,
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingUser(null);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSave(e) {
    e.preventDefault();

    try {
      if (editingUser) {
        const res = await fetch(`${API}/users/${editingUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            status: formData.status,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.detail || "Update failed");
          return;
        }
      } else {
        const res = await fetch(`${API}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.detail || "Add user failed");
          return;
        }
      }

      fetchUsers();
      closeModal();
    } catch (error) {
      console.log("Save error:", error);
      alert("Server error");
    }
  }

  async function handleDelete(id) {
    const ok = window.confirm("Are you sure you want to delete this user?");
    if (!ok) return;

    try {
      const res = await fetch(`${API}/users/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        fetchUsers();
      } else {
        alert(data.detail || "Delete failed");
      }
    } catch (error) {
      console.log("Delete error:", error);
      alert("Server error while deleting user");
    }
  }

  function handleLogout() {
    setPage("home");
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo-box">
          <h2>StudyShare</h2>
          <p>Admin Panel</p>
        </div>

        <nav className="admin-sidebar-nav">
          <button className="admin-nav-item active">Dashboard</button>
          <button className="admin-nav-item" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </aside>

      <main className="admin-main-content">
        <div className="admin-topbar">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome, {userName}</p>
          </div>

          <button className="admin-add-btn" onClick={openAddModal}>
            + Add User
          </button>
        </div>

        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <h3>Total Users</h3>
            <p>{users.length}</p>
          </div>
        </div>

        <div className="admin-table-card">
          <div className="admin-table-header">
            <h2>Registered Users</h2>
          </div>

          {loading ? (
            <p className="admin-loading-text">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="admin-loading-text">No users found.</p>
          ) : (
            <div className="admin-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id}>
                      <td>{index + 1}</td>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>{user.phone || "-"}</td>
                      <td>
                        <span className={`admin-badge role-${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge status-${user.status}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <div className="admin-action-buttons">
                          <button
                            className="admin-edit-btn"
                            onClick={() => openEditModal(user)}
                          >
                            Edit
                          </button>

                          <button
                            className="admin-delete-btn"
                            onClick={() => handleDelete(user.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-box">
              <div className="admin-modal-header">
                <h3>{editingUser ? "Edit User" : "Add User"}</h3>
                <button className="admin-close-btn" onClick={closeModal}>
                  ×
                </button>
              </div>

              <form onSubmit={handleSave} className="admin-modal-form">
                <div className="admin-form-grid">
                  <div>
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label>Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  {!editingUser && (
                    <div>
                      <label>Password</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label>Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="active">Active</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                </div>

                <div className="admin-modal-actions">
                  <button
                    type="button"
                    className="admin-cancel-btn"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="admin-save-btn">
                    {editingUser ? "Save Changes" : "Add User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="admin-table-card" style={{ marginTop: 24 }}>
  <div className="admin-table-header">
    <h2>All Materials</h2>
  </div>

  {loadingMaterials ? (
    <p className="admin-loading-text">Loading materials...</p>
  ) : materials.length === 0 ? (
    <p className="admin-loading-text">No materials found.</p>
  ) : (
    <div className="admin-table-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Subject</th>
            <th>Semester</th>
            <th>Uploaded By</th>
            <th>Visibility</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {materials.map((material, index) => (
            <tr key={material.id}>
              <td>{index + 1}</td>
              <td>{material.title}</td>
              <td>{material.subject}</td>
              <td>{material.semester}</td>
              <td>{material.uploadedBy}</td>
              <td>
                <span
                  className={`admin-badge ${
                    material.visibility === "public"
                      ? "status-active"
                      : "status-blocked"
                  }`}
                >
                  {material.visibility}
                </span>
              </td>
              <td>
                <div className="admin-action-buttons">
                  <button
                    className="admin-edit-btn"
                    onClick={() =>
                      window.open(`${API}/download/${material.filename}`)
                    }
                  >
                    Download
                  </button>
                   
                   <button
  className="admin-edit-btn"
  onClick={() => openMaterialEdit(material)}
>
  Edit
</button>

                  <button
                    className="admin-edit-btn"
                    onClick={() => handleToggleVisibility(material.id)}
                  >
                    Toggle
                  </button>

                  <button
                    className="admin-delete-btn"
                    onClick={() => handleDeleteMaterial(material.id)}
                  >
                    Delete
                  </button>

                  
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>
{showMaterialModal && (
  <div className="admin-modal-overlay">
    <div className="admin-modal-box">
      <h3>Edit Material</h3>

      <form onSubmit={handleMaterialSave}>
        <input
          name="title"
          value={materialForm.title}
          onChange={handleMaterialChange}
          placeholder="Title"
          required
        />

        <textarea
          name="description"
          value={materialForm.description}
          onChange={handleMaterialChange}
          placeholder="Description"
          required
        />

        <input
          name="subject"
          value={materialForm.subject}
          onChange={handleMaterialChange}
          placeholder="Subject"
          required
        />

        <input
          name="semester"
          value={materialForm.semester}
          onChange={handleMaterialChange}
          placeholder="Semester"
          required
        />

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" className="admin-save-btn">
            Save
          </button>

          <button
            type="button"
            className="admin-cancel-btn"
            onClick={closeMaterialModal}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}
      </main>
    </div>
  );
}

export default AdminDashboard;