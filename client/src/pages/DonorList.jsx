import { useEffect, useState } from "react";
import axios from "axios";

function DonorList() {
  // donors = all donors from database
  const [donors, setDonors] = useState([]);

  // search = search box text
  const [search, setSearch] = useState("");

  // bloodFilter = selected blood group
  const [bloodFilter, setBloodFilter] = useState("");

  // districtFilter = selected district
  const [districtFilter, setDistrictFilter] = useState("");

  // loading = loading status
  const [loading, setLoading] = useState(true);

  // message = success/error message
  const [message, setMessage] = useState("");

  // Fetch donors from backend
  const fetchDonors = async () => {
    try {
      setLoading(true);

      // GET API = get all donor data from MongoDB
      const res = await axios.get("http://localhost:5000/api/donors");

      setDonors(res.data.donors);
    } catch (error) {
      setMessage("Failed to load donors");
    } finally {
      setLoading(false);
    }
  };

  // useEffect = run once when page opens
  useEffect(() => {
    fetchDonors();
  }, []);

  // Delete donor
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this donor?"
    );

    if (!confirmDelete) return;

    try {
      // DELETE API = remove donor from MongoDB
      const res = await axios.delete(`http://localhost:5000/api/donors/${id}`);

      setMessage(res.data.message);

      // Reload donors after delete
      fetchDonors();
    } catch (error) {
      setMessage("Failed to delete donor");
    }
  };

  // Unique districts = create district dropdown from donor data
  const uniqueDistricts = [
    ...new Set(donors.map((donor) => donor.district).filter(Boolean)),
  ];

  // filteredDonors = frontend search/filter result
  const filteredDonors = donors.filter((donor) => {
    // Search by name, phone, district, address
    const matchesSearch =
      donor.name.toLowerCase().includes(search.toLowerCase()) ||
      donor.phone.toLowerCase().includes(search.toLowerCase()) ||
      donor.district.toLowerCase().includes(search.toLowerCase()) ||
      donor.address.toLowerCase().includes(search.toLowerCase());

    // Blood group filter
    const matchesBlood =
      bloodFilter === "" || donor.bloodGroup === bloodFilter;

    // District filter
    const matchesDistrict =
      districtFilter === "" || donor.district === districtFilter;

    return matchesSearch && matchesBlood && matchesDistrict;
  });

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setBloodFilter("");
    setDistrictFilter("");
  };

  return (
    <div className="donor-list-page">
      <div className="page-heading">
        <div>
          <h1>Donor Search</h1>
          <p>Search and filter registered blood donors instantly.</p>
        </div>

        <a href="/donor-register" className="primary-action small">
          Add New Donor
        </a>
      </div>

      {/* Search Area */}
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

      {/* Search Result Summary */}
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

      {/* Donor Table */}
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
                <th>Address</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredDonors.map((donor) => (
                <tr key={donor._id}>
                  <td>
                    <img
                      className="donor-photo"
                      src={`http://localhost:5000${donor.photo}`}
                      alt={donor.name}
                    />
                  </td>

                  <td>
                    <strong>{donor.name}</strong>
                    <span>
                      {new Date(donor.createdAt).toLocaleDateString()}
                    </span>
                  </td>

                  <td>
                    <span className="blood-pill">{donor.bloodGroup}</span>
                  </td>

                  <td>{donor.phone}</td>

                  <td>{donor.district}</td>

                  <td>{donor.address}</td>

                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(donor._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default DonorList;