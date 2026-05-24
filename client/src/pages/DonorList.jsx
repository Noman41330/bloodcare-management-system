import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";

function DonorList() {
  const [searchParams] = useSearchParams();
  const [donors, setDonors] = useState([]);
  const [search, setSearch] = useState("");
  const [bloodFilter, setBloodFilter] = useState(
          searchParams.get("bloodGroup") || ""
        );
  const [districtFilter, setDistrictFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const donorsPerPage = 5;

  // editDonor = selected donor for edit modal
  const [editDonor, setEditDonor] = useState(null);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/donors");
      setDonors(res.data.donors);
    } catch (error) {
      setMessage("Failed to load donors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this donor?"
    );

    if (!confirmDelete) return;

    try {
      const res = await axios.delete(`http://localhost:5000/api/donors/${id}`);
      setMessage(res.data.message);
      fetchDonors();
    } catch (error) {
      setMessage("Failed to delete donor");
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/donors/${id}/availability`
      );

      setMessage(res.data.message);
      fetchDonors();
    } catch (error) {
      setMessage("Failed to update availability");
    }
  };

  const handleEditChange = (e) => {
    setEditDonor({
      ...editDonor,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateDonor = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.put(
        `http://localhost:5000/api/donors/${editDonor._id}`,
        editDonor
      );

      setMessage(res.data.message);
      setEditDonor(null);
      fetchDonors();
    } catch (error) {
      setMessage("Failed to update donor");
    }
  };

  const uniqueDistricts = [
    ...new Set(donors.map((donor) => donor.district).filter(Boolean)),
  ];

  const filteredDonors = donors.filter((donor) => {
    const matchesSearch =
      donor.name.toLowerCase().includes(search.toLowerCase()) ||
      donor.phone.toLowerCase().includes(search.toLowerCase()) ||
      donor.district.toLowerCase().includes(search.toLowerCase()) ||
      donor.address.toLowerCase().includes(search.toLowerCase());

    const matchesBlood =
      bloodFilter === "" || donor.bloodGroup === bloodFilter;

    const matchesDistrict =
      districtFilter === "" || donor.district === districtFilter;

    return matchesSearch && matchesBlood && matchesDistrict;
  });

  // Pagination calculation
    const indexOfLastDonor = currentPage * donorsPerPage;
    const indexOfFirstDonor = indexOfLastDonor - donorsPerPage;
    const currentDonors = filteredDonors.slice(indexOfFirstDonor, indexOfLastDonor);

    const totalPages = Math.ceil(filteredDonors.length / donorsPerPage);

    const clearFilters = () => {
      setSearch("");
      setBloodFilter("");
      setDistrictFilter("");
    };

    // Export donor data as CSV
  const exportCSV = () => {
    const headers = [
      "Name",
      "Phone",
      "Blood Group",
      "District",
      "Address",
      "Availability",
    ];

    const rows = filteredDonors.map((donor) => [
      donor.name,
      donor.phone,
      donor.bloodGroup,
      donor.district,
      donor.address,
      donor.availability || "Available",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "donors.csv";
    link.click();
  };

    const exportPDF = () => {
    const doc = new jsPDF();

    doc.text("Blood Donor Report", 14, 15);

    const tableColumn = [
      "Name",
      "Blood",
      "Phone",
      "District",
      "Status",
    ];

    const tableRows = filteredDonors.map((donor) => [
      donor.name,
      donor.bloodGroup,
      donor.phone,
      donor.district,
      donor.availability,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
    });

    doc.save("blood-donors.pdf");
  };

  const navigate = useNavigate();

  return (
    <div className="donor-list-page">
      <div className="page-heading">
        <div>
          <h1>Donor Control Panel</h1>
          <p>Edit, search, filter, delete and manage donor availability.</p>
        </div>

        <a href="/donor-register" className="primary-action small">
          Add New Donor
        </a>

        <button className="export-btn" onClick={exportCSV}>
            Export CSV
          </button>

          <button className="pdf-btn" onClick={exportPDF}>
            Export PDF
          </button>
      </div>
      

      <div className="advanced-filter-card">
        <div className="search-field wide">
          <label>Search Donor</label>
          <input
            type="text"
            placeholder="Search by name, phone, district or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="search-field">
          <label>Blood Group</label>
          <select
            value={bloodFilter}
            onChange={(e) => setBloodFilter(e.target.value)}
          >
            <option value="">All Groups</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>

        <div className="search-field">
          <label>District</label>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
          >
            <option value="">All Districts</option>
            {uniqueDistricts.map((district) => (
              <option value={district} key={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        <button className="clear-btn" onClick={clearFilters}>
          Clear Filter
        </button>
      </div>

      <div className="search-summary">
        <div>
          <strong>{filteredDonors.length}</strong>
          <span> donors found</span>
        </div>

        <p>
          Showing result from <b>{donors.length}</b> registered donors
        </p>
      </div>

      {message && <div className="message-box">{message}</div>}

      <div className="table-card">
        {loading ? (
          <p className="table-message">Loading donors...</p>
        ) : filteredDonors.length === 0 ? (
          <p className="table-message">No donor found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Photo</th>
                <th>Donor</th>
                <th>Blood</th>
                <th>Phone</th>
                <th>District</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentDonors.map((donor) => (
                <tr
                  key={donor._id}
                  className="clickable-row"
                  onClick={() => navigate(`/donors/${donor._id}`)}
                >
                  <td>
                    <img
                      className="donor-photo"
                      src={`http://localhost:5000${donor.photo}`}
                      alt={donor.name}
                    />
                  </td>

                  <td>
                    <strong>{donor.name}</strong>
                    <span>{donor.address}</span>
                  </td>

                  <td>
                    <span className="blood-pill">{donor.bloodGroup}</span>
                  </td>

                  <td>{donor.phone}</td>

                  <td>{donor.district}</td>

                  <td>
                    <button
                      className={
                        donor.availability === "Unavailable"
                          ? "status-btn off"
                          : "status-btn"
                      }
                      onClick={() => handleToggleAvailability(donor._id)}
                    >
                      {donor.availability || "Available"}
                    </button>
                  </td>

                  <td>
                    <div className="action-group">
                      <button
                          className="edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(donor);
                          }}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(donor._id);
                          }}
                        >
                          Delete
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          
        )}
      </div>

      <div className="pagination">
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        Previous
      </button>

      <span>
        Page {currentPage} of {totalPages || 1}
      </span>

      <button
        disabled={currentPage === totalPages || totalPages === 0}
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        Next
      </button>
    </div>

      {/* Edit Modal */}
      {editDonor && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <div className="modal-header">
              <h2>Edit Donor</h2>
              <button onClick={() => setEditDonor(null)}>×</button>
            </div>

            <form onSubmit={handleUpdateDonor}>
              <div className="form-grid">
                <div className="field">
                  <label>Name</label>
                  <input
                    name="name"
                    value={editDonor.name}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="field">
                  <label>Phone</label>
                  <input
                    name="phone"
                    value={editDonor.phone}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="field">
                  <label>Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={editDonor.bloodGroup}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div className="field">
                  <label>District</label>
                  <input
                    name="district"
                    value={editDonor.district}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="field">
                  <label>Availability</label>
                  <select
                    name="availability"
                    value={editDonor.availability || "Available"}
                    onChange={handleEditChange}
                  >
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>

                <div className="field full">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={editDonor.address}
                    onChange={handleEditChange}
                    required
                  />
                </div>
              </div>

              <button className="submit-btn" type="submit">
                Update Donor
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DonorList;