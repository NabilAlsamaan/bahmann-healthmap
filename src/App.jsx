import { useState, useEffect, useMemo } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import logo from "./assets/bahman-logo.png";



const API_URL = "http://localhost:5000";

const authFetch = (url, options = {}) => {
  const token = localStorage.getItem("token");

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
};

const emptyPraxis = {
  name_der_praxis: "",
  kategorie: "DXA",
  angebotene_leistungen: "",
  strasse: "",
  plz: "",
  ort: "",
  latitude: "",
  longitude: "",
  telefon: "",
  website: "",
  selbstzahler: "",
  preis_in_euro: "",
  status: "aktiv",
  interne_notiz: "",
  region: "Region Hannover",
  verifiziert: 0,
};

const createCustomIcon = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const icons = {
  DXA: createCustomIcon("blue"),
  BIA: createCustomIcon("green"),
  Bluttest: createCustomIcon("red"),
  "DEXA Premium": createCustomIcon("orange"),
  nearest: createCustomIcon("yellow"),
  user: createCustomIcon("violet"),
};

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

function FitBounds({ providers }) {
  const map = useMap();

  useEffect(() => {
    if (!providers.length) return;

    const bounds = L.latLngBounds(providers.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [70, 70] });
  }, [providers, map]);

  return null;
}

function LocationButton({ setUserLocation, providers, setNearestProviderId }) {
  const map = useMap();

  const goToUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation wird nicht unterstützt.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        map.flyTo([latitude, longitude], 15, { duration: 1.4 });

        if (providers.length > 0) {
          const nearest = providers
            .map((p) => ({
              ...p,
              distance: getDistanceKm(latitude, longitude, p.lat, p.lng),
            }))
            .sort((a, b) => a.distance - b.distance)[0];

          setNearestProviderId(nearest.id);
          alert(`Nächste Praxis: ${nearest.name} (${nearest.distance.toFixed(1)} km)`);
        }
      },
      () => alert("Standort konnte nicht gefunden werden.")
    );
  };

  return (
    <button
      className="location-button"
      onClick={goToUserLocation}
      title="Mein Standort und nächste Praxis"
    >
      ⌖
    </button>
  );
}

function App() {
  const [providers, setProviders] = useState([]);
  const [allPraxen, setAllPraxen] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [nearestProviderId, setNearestProviderId] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [infoPopup, setInfoPopup] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(Boolean(localStorage.getItem("token")));
  const [currentUsername, setCurrentUsername] = useState(
    localStorage.getItem("username") || ""
  );

  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [adminView, setAdminView] = useState("praxen");
  const [adminSearch, setAdminSearch] = useState("");

  const [praxisForm, setPraxisForm] = useState(emptyPraxis);
  const [editingPraxis, setEditingPraxis] = useState(null);

  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({
    username: "",
    password: "",
    role: "admin",
  });

  const [passwordChange, setPasswordChange] = useState({
    username: "",
    oldPassword: "",
    newPassword: "",
  });

  const [logs, setLogs] = useState([]);

  const [csvFile, setCsvFile] = useState(null);
  const [selectedImportRegion, setSelectedImportRegion] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const expiresAt = localStorage.getItem("expiresAt");

    if (expiresAt && Date.now() > Number(expiresAt)) {
      localStorage.clear();
      setIsAdmin(false);
      setCurrentUsername("");
      setAdminPanelOpen(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const expiresAt = localStorage.getItem("expiresAt");

      if (expiresAt && Date.now() > Number(expiresAt)) {
        localStorage.clear();
        setIsAdmin(false);
        setCurrentUsername("");
        setAdminPanelOpen(false);
        alert("Sitzung abgelaufen. Bitte erneut anmelden.");
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const mapPraxisForMap = (item) => ({
    id: item.id,
    name: item.name_der_praxis,
    category: item.kategorie,
    services: item.angebotene_leistungen,
    address: `${item.strasse}, ${item.plz} ${item.ort}`,
    phone: item.telefon,
    website: item.website,
    selfPay: item.selbstzahler,
    price: item.preis_in_euro,
    verified: Number(item.verifiziert) === 1,
    lat: parseFloat(item.latitude),
    lng: parseFloat(item.longitude),
    raw: item,
  });

  const loadPraxen = async () => {
    try {
      const response = await fetch(`${API_URL}/api/praxen`);
      const data = await response.json();

      setAllPraxen(data);

      const visible = data
        .filter((item) => item.status === "aktiv")
        .filter((item) => (selectedRegion ? item.region === selectedRegion : true))
        .map(mapPraxisForMap)
        .filter((p) => !Number.isNaN(p.lat) && !Number.isNaN(p.lng));

      setProviders(visible);
    } catch (error) {
      console.error("Fehler beim Laden der Praxen:", error);
    }
  };

  useEffect(() => {
    if (selectedRegion) {
      loadPraxen();
    } else {
      setProviders([]);
    }
  }, [selectedRegion]);

  const filteredProviders = useMemo(() => {
    if (selectedCategory === "Alle") return providers;
    return providers.filter((provider) => provider.category === selectedCategory);
  }, [providers, selectedCategory]);

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        const expiresAt = Date.now() + 30 * 60 * 1000;

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", data.username);
        localStorage.setItem("expiresAt", expiresAt.toString());

        setIsAdmin(true);
        setCurrentUsername(data.username);
        setLoginOpen(false);
        setUsername("");
        setPassword("");

        alert("Admin Login erfolgreich");
      } else {
        alert("Login fehlgeschlagen");
      }
    } catch (error) {
      console.error(error);
      alert("Serverfehler");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("expiresAt");

    setIsAdmin(false);
    setCurrentUsername("");
    setAdminPanelOpen(false);

    alert("Abgemeldet");
  };

  const loadAdmins = async () => {
    const response = await authFetch(`${API_URL}/api/admins`);
    const data = await response.json();
    setAdmins(data);
  };

  const createAdmin = async () => {
    if (!newAdmin.username || !newAdmin.password) {
      alert("Benutzername und Passwort ausfüllen");
      return;
    }

    const response = await authFetch(`${API_URL}/api/admins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newAdmin, createdBy: currentUsername }),
    });

    if (response.ok) {
      alert("Admin erstellt");
      setNewAdmin({ username: "", password: "", role: "admin" });
      loadAdmins();
      loadLogs();
    } else {
      alert("Admin konnte nicht erstellt werden");
    }
  };

  const deleteAdmin = async (id, adminUsername) => {
    if (adminUsername === currentUsername) {
      alert("Du kannst deinen eigenen Account nicht löschen.");
      return;
    }

    if (!window.confirm(`Admin ${adminUsername} wirklich löschen?`)) return;

    const response = await authFetch(`${API_URL}/api/admins/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentUsername }),
    });

    if (response.ok) {
      alert("Admin gelöscht");
      loadAdmins();
      loadLogs();
    } else {
      alert("Admin konnte nicht gelöscht werden");
    }
  };

  const changeAdminPassword = async () => {
    if (
      !passwordChange.username ||
      !passwordChange.oldPassword ||
      !passwordChange.newPassword
    ) {
      alert("Alle Passwortfelder ausfüllen");
      return;
    }

    const response = await authFetch(`${API_URL}/api/admin/change-password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passwordChange),
    });

    if (response.ok) {
      alert("Passwort geändert");
      setPasswordChange({
        username: "",
        oldPassword: "",
        newPassword: "",
      });
      loadLogs();
    } else {
      alert("Passwort konnte nicht geändert werden");
    }
  };

  const savePraxis = async () => {
    if (!praxisForm.name_der_praxis || !praxisForm.latitude || !praxisForm.longitude) {
      alert("Praxisname, Latitude und Longitude sind Pflichtfelder");
      return;
    }

    const method = editingPraxis ? "PUT" : "POST";
    const url = editingPraxis
      ? `${API_URL}/api/praxen/${editingPraxis.id}`
      : `${API_URL}/api/praxen`;

    const response = await authFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...praxisForm,
        verifiziert: Number(praxisForm.verifiziert),
        adminUsername: currentUsername,
      }),
    });

    if (response.ok) {
      alert(editingPraxis ? "Praxis aktualisiert" : "Praxis hinzugefügt");
      setPraxisForm(emptyPraxis);
      setEditingPraxis(null);
      setAdminView("praxen");
      loadPraxen();
      loadLogs();
    } else {
      alert("Speichern fehlgeschlagen");
    }
  };

  const startEditPraxis = (praxis) => {
    setEditingPraxis(praxis);
    setPraxisForm({
      ...emptyPraxis,
      ...praxis,
      verifiziert: Number(praxis.verifiziert || 0),
    });
    setAdminView("form");
  };

  const deactivatePraxis = async (praxis) => {
    if (!window.confirm(`${praxis.name_der_praxis} deaktivieren?`)) return;

    const response = await authFetch(`${API_URL}/api/praxen/${praxis.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminUsername: currentUsername }),
    });

    if (response.ok) {
      alert("Praxis wurde deaktiviert");
      loadPraxen();
      loadLogs();
    } else {
      alert("Deaktivieren fehlgeschlagen");
    }
  };

  const loadLogs = async () => {
    const response = await authFetch(`${API_URL}/api/admin-logs`);
    const data = await response.json();
    setLogs(data);
  };

  const handleCsvImport = async () => {
    if (!csvFile) {
      alert("Bitte CSV Datei auswählen");
      return;
    }

    if (!selectedImportRegion) {
      alert("Bitte Region auswählen");
      return;
    }

    const formData = new FormData();
    formData.append("csv", csvFile);
    formData.append("region", selectedImportRegion);
    formData.append("adminUsername", currentUsername);

    try {
      const response = await fetch(`${API_URL}/api/praxen/import-csv`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert("CSV erfolgreich importiert");
        setCsvFile(null);
        loadPraxen();
        loadLogs();
      } else {
        alert("Import fehlgeschlagen");
      }
    } catch (error) {
      console.error(error);
      alert("Serverfehler");
    }
  };

  const deactivateRegion = async () => {
    if (!selectedImportRegion) {
      alert("Bitte zuerst eine Region auswählen");
      return;
    }

    if (
      !window.confirm(
        `Wirklich alle Praxen der Region "${selectedImportRegion}" deaktivieren?`
      )
    ) {
      return;
    }

    const response = await authFetch(
      `${API_URL}/api/praxen/region/${encodeURIComponent(selectedImportRegion)}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminUsername: currentUsername }),
      }
    );

    const data = await response.json();

    if (data.success) {
      alert(`${data.affectedRows} Praxen wurden deaktiviert`);
      loadPraxen();
      loadLogs();
    } else {
      alert("Region konnte nicht deaktiviert werden");
    }
  };

  const exportCSV = () => {
    const headers = [
      "id",
      "name_der_praxis",
      "kategorie",
      "angebotene_leistungen",
      "strasse",
      "plz",
      "ort",
      "latitude",
      "longitude",
      "telefon",
      "website",
      "selbstzahler",
      "preis_in_euro",
      "status",
      "region",
      "verifiziert",
      "updated_at",
    ];

    const rows = allPraxen.map((p) =>
      headers
        .map((h) => `"${String(p[h] ?? "").replaceAll('"', '""')}"`)
        .join(";")
    );

    const csv = [headers.join(";"), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "praxen_export.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const filteredAdminPraxen = allPraxen.filter((p) => {
    const search = adminSearch.toLowerCase();

    return (
      p.name_der_praxis?.toLowerCase().includes(search) ||
      p.ort?.toLowerCase().includes(search) ||
      p.kategorie?.toLowerCase().includes(search) ||
      p.region?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="splash-screen">
        <div className="logo-animation-wrapper">
          <img src={logo} alt="Bahmann Logo" className="logo-img animated-logo" />
          <h1 className="splash-title">HealthMap</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {loginOpen && (
        <div className="login-popup-overlay" onClick={() => setLoginOpen(false)}>
          <div className="login-popup glass-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-login-popup" onClick={() => setLoginOpen(false)}>
              ✕
            </button>

            <h2>Admin Login</h2>
            <p className="login-subtitle">Anmeldung für Praxis- und Laborverwaltung</p>

            <input
              type="text"
              placeholder="Benutzername"
              className="login-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              type="password"
              placeholder="Passwort"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="login-button" onClick={handleLogin}>
              Einloggen
            </button>
          </div>
        </div>
      )}

      {adminPanelOpen && (
        <div className="admin-overlay" onClick={() => setAdminPanelOpen(false)}>
          <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
            <button className="admin-close" onClick={() => setAdminPanelOpen(false)}>
              ✕
            </button>

            <h2>Admin Panel</h2>
            <p className="admin-current-user">Angemeldet als: {currentUsername}</p>

            <div className="admin-tabs">
              <button onClick={() => setAdminView("praxen")}>Praxen verwalten</button>
              <button
                onClick={() => {
                  setEditingPraxis(null);
                  setPraxisForm(emptyPraxis);
                  setAdminView("form");
                }}
              >
                Neue Praxis
              </button>
              <button
                onClick={() => {
                  setAdminView("admins");
                  loadAdmins();
                }}
              >
                Admins verwalten
              </button>
              <button
                onClick={() => {
                  setAdminView("csv-import");
                }}
              >
                CSV Import
              </button>
              <button
                onClick={() => {
                  setAdminView("logs");
                  loadLogs();
                }}
              >
                Admin-Log
              </button>
              <button onClick={exportCSV}>CSV Export</button>
              <button onClick={logout}>Logout</button>
            </div>

            {adminView === "praxen" && (
              <div>
                <input
                  className="admin-search"
                  placeholder="Praxen suchen nach Name, Ort, Kategorie oder Region..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                />

                <div className="admin-list">
                  {filteredAdminPraxen.map((praxis) => (
                    <div className="admin-card" key={praxis.id}>
                      <div>
                        <strong>
                          {praxis.name_der_praxis}{" "}
                          {Number(praxis.verifiziert) === 1 && (
                            <span className="verified-badge">verifiziert</span>
                          )}
                        </strong>

                        <p>
                          {praxis.kategorie} — {praxis.ort} — {praxis.region}
                        </p>

                        <p>
                          Status: <strong>{praxis.status}</strong> | Letzte Änderung:{" "}
                          {praxis.updated_at
                            ? new Date(praxis.updated_at).toLocaleString("de-DE")
                            : "Keine Angabe"}
                        </p>
                      </div>

                      <div className="admin-actions">
                        <button onClick={() => startEditPraxis(praxis)}>
                          Bearbeiten
                        </button>

                        <button
                          className="danger"
                          onClick={() => deactivatePraxis(praxis)}
                          disabled={praxis.status === "inaktiv"}
                        >
                          Deaktivieren
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {adminView === "form" && (
              <div className="admin-form">
                <h3>{editingPraxis ? "Praxis bearbeiten" : "Neue Praxis hinzufügen"}</h3>

                <input
                  placeholder="Name der Praxis"
                  value={praxisForm.name_der_praxis || ""}
                  onChange={(e) =>
                    setPraxisForm({ ...praxisForm, name_der_praxis: e.target.value })
                  }
                />

                <select
                  value={praxisForm.kategorie || "DXA"}
                  onChange={(e) =>
                    setPraxisForm({ ...praxisForm, kategorie: e.target.value })
                  }
                >
                  <option value="DXA">DXA</option>
                  <option value="BIA">BIA</option>
                  <option value="Bluttest">Bluttest</option>
                  <option value="DEXA Premium">DEXA Premium</option>
                </select>

                <input
                  placeholder="Angebotene Leistungen"
                  value={praxisForm.angebotene_leistungen || ""}
                  onChange={(e) =>
                    setPraxisForm({
                      ...praxisForm,
                      angebotene_leistungen: e.target.value,
                    })
                  }
                />

                <input
                  placeholder="Straße"
                  value={praxisForm.strasse || ""}
                  onChange={(e) =>
                    setPraxisForm({ ...praxisForm, strasse: e.target.value })
                  }
                />

                <input
                  placeholder="PLZ"
                  value={praxisForm.plz || ""}
                  onChange={(e) =>
                    setPraxisForm({ ...praxisForm, plz: e.target.value })
                  }
                />

                <input
                  placeholder="Ort"
                  value={praxisForm.ort || ""}
                  onChange={(e) =>
                    setPraxisForm({ ...praxisForm, ort: e.target.value })
                  }
                />

                <input
                  placeholder="Latitude"
                  value={praxisForm.latitude || ""}
                  onChange={(e) =>
                    setPraxisForm({ ...praxisForm, latitude: e.target.value })
                  }
                />

                <input
                  placeholder="Longitude"
                  value={praxisForm.longitude || ""}
                  onChange={(e) =>
                    setPraxisForm({ ...praxisForm, longitude: e.target.value })
                  }
                />

                <input
                  placeholder="Telefon"
                  value={praxisForm.telefon || ""}
                  onChange={(e) =>
                    setPraxisForm({ ...praxisForm, telefon: e.target.value })
                  }
                />

                <input
                  placeholder="Website"
                  value={praxisForm.website || ""}
                  onChange={(e) =>
                    setPraxisForm({ ...praxisForm, website: e.target.value })
                  }
                />

                <input
                  placeholder="Selbstzahler"
                  value={praxisForm.selbstzahler || ""}
                  onChange={(e) =>
                    setPraxisForm({ ...praxisForm, selbstzahler: e.target.value })
                  }
                />

                <input
                  placeholder="Preis in Euro"
                  value={praxisForm.preis_in_euro || ""}
                  onChange={(e) =>
                    setPraxisForm({ ...praxisForm, preis_in_euro: e.target.value })
                  }
                />

                <select
                  value={praxisForm.status || "aktiv"}
                  onChange={(e) =>
                    setPraxisForm({ ...praxisForm, status: e.target.value })
                  }
                >
                  <option value="aktiv">aktiv</option>
                  <option value="in Prüfung">in Prüfung</option>
                  <option value="inaktiv">inaktiv</option>
                </select>

                <select
                  value={praxisForm.region || "Region Hannover"}
                  onChange={(e) =>
                    setPraxisForm({ ...praxisForm, region: e.target.value })
                  }
                >
                  <option value="Region Hannover">Region Hannover</option>
                  <option value="Braunschweig">Braunschweig</option>
                  <option value="Osnabrück">Osnabrück</option>
                  <option value="Oldenburg">Oldenburg</option>
                  <option value="Göttingen">Göttingen</option>
                  <option value="Wolfsburg">Wolfsburg</option>
                  <option value="Hildesheim">Hildesheim</option>
                </select>

                <select
                  value={Number(praxisForm.verifiziert || 0)}
                  onChange={(e) =>
                    setPraxisForm({
                      ...praxisForm,
                      verifiziert: Number(e.target.value),
                    })
                  }
                >
                  <option value={0}>nicht verifiziert</option>
                  <option value={1}>verifiziert</option>
                </select>

                <textarea
                  placeholder="Interne Notiz"
                  value={praxisForm.interne_notiz || ""}
                  onChange={(e) =>
                    setPraxisForm({ ...praxisForm, interne_notiz: e.target.value })
                  }
                />

                <button className="admin-save" onClick={savePraxis}>
                  Speichern
                </button>
              </div>
            )}

            {adminView === "admins" && (
              <div className="admin-list">
                <h3>Neuen Admin erstellen</h3>

                <div className="admin-form small">
                  <input
                    placeholder="Benutzername"
                    value={newAdmin.username}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, username: e.target.value })
                    }
                  />

                  <input
                    type="password"
                    placeholder="Passwort"
                    value={newAdmin.password}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, password: e.target.value })
                    }
                  />

                  <select
                    value={newAdmin.role}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, role: e.target.value })
                    }
                  >
                    <option value="admin">admin</option>
                    <option value="superadmin">superadmin</option>
                  </select>

                  <button className="admin-save" onClick={createAdmin}>
                    Admin hinzufügen
                  </button>
                </div>

                <h3>Passwort ändern</h3>

                <div className="admin-form small">
                  <input
                    placeholder="Admin Benutzername"
                    value={passwordChange.username}
                    onChange={(e) =>
                      setPasswordChange({
                        ...passwordChange,
                        username: e.target.value,
                      })
                    }
                  />

                  <input
                    type="password"
                    placeholder="Altes Passwort"
                    value={passwordChange.oldPassword}
                    onChange={(e) =>
                      setPasswordChange({
                        ...passwordChange,
                        oldPassword: e.target.value,
                      })
                    }
                  />

                  <input
                    type="password"
                    placeholder="Neues Passwort"
                    value={passwordChange.newPassword}
                    onChange={(e) =>
                      setPasswordChange({
                        ...passwordChange,
                        newPassword: e.target.value,
                      })
                    }
                  />

                  <button className="admin-save" onClick={changeAdminPassword}>
                    Passwort ändern
                  </button>
                </div>

                <h3>Vorhandene Admins</h3>

                {admins.map((admin) => (
                  <div className="admin-card" key={admin.id}>
                    <div>
                      <strong>{admin.username}</strong>
                      <p>
                        Rolle: {admin.role} | Erstellt:{" "}
                        {new Date(admin.created_at).toLocaleString("de-DE")}
                      </p>
                    </div>

                    <div className="admin-actions">
                      <button
                        onClick={() =>
                          setPasswordChange({
                            username: admin.username,
                            oldPassword: "",
                            newPassword: "",
                          })
                        }
                      >
                        Passwort ändern
                      </button>

                      {admin.username !== currentUsername && (
                        <button
                          className="danger"
                          onClick={() => deleteAdmin(admin.id, admin.username)}
                        >
                          Löschen
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {adminView === "csv-import" && (
              <div className="csv-import-section">
                <div className="csv-hint-box">
                  <h3>CSV Import Hinweis</h3>

                  <p>Die CSV-Datei muss folgende Spaltennamen exakt enthalten:</p>

                  <ul>
                    <li>Name der Praxis</li>
                    <li>Kategorie</li>
                    <li>Angebotene Leistungen</li>
                    <li>Strasse</li>
                    <li>PLZ</li>
                    <li>Ort</li>
                    <li>Latitude</li>
                    <li>Longitude</li>
                    <li>Telefon</li>
                    <li>Website</li>
                    <li>Selbstzahler</li>
                    <li>Preis in Euro</li>
                  </ul>

                  <p className="csv-warning">
                    Wichtig: CSV UTF-8 speichern und Semikolon (;) als Trennzeichen verwenden.
                  </p>

                  <p className="csv-warning">
                    Latitude und Longitude müssen Dezimalzahlen sein, z. B. 52.3752459 und 9.7359770.
                  </p>
                </div>

                <div className="csv-upload-box">
                  <h3>CSV Datei importieren</h3>

                  <select
                    value={selectedImportRegion}
                    onChange={(e) => setSelectedImportRegion(e.target.value)}
                    className="admin-input"
                  >
                    <option value="">Region wählen</option>
                    <option value="Region Hannover">Region Hannover</option>
                    <option value="Braunschweig">Braunschweig</option>
                    <option value="Osnabrück">Osnabrück</option>
                    <option value="Oldenburg">Oldenburg</option>
                    <option value="Göttingen">Göttingen</option>
                    <option value="Wolfsburg">Wolfsburg</option>
                    <option value="Hildesheim">Hildesheim</option>
                  </select>

                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files[0])}
                    className="admin-input"
                  />

                  <button className="admin-save" onClick={handleCsvImport}>
                    CSV importieren
                  </button>

                  <button className="admin-danger-button" onClick={deactivateRegion}>
                    Ausgewählte Region deaktivieren
                  </button>
                </div>
              </div>
            )}

            {adminView === "logs" && (
              <div className="admin-list">
                <h3>Admin-Log</h3>

                {logs.map((log) => (
                  <div className="admin-card" key={log.id}>
                    <div>
                      <strong>{log.action_type}</strong>
                      <p>{log.description}</p>
                      <p>
                        Admin: {log.admin_username} |{" "}
                        {new Date(log.created_at).toLocaleString("de-DE")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {infoPopup && (
        <div className="info-popup-overlay" onClick={() => setInfoPopup(null)}>
          <div className="info-popup glass-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-info-popup" onClick={() => setInfoPopup(null)}>
              ✕
            </button>

            {infoPopup === "dxa" && (
              <>
                <h2>DXA / DEXA</h2>
                <p>DXA steht für Dual X-ray Absorptiometry.</p>
                <p>DEXA steht für Dual-Energy X-ray Absorptiometry.</p>
                <p>
                  Beide Begriffe beschreiben eine bildgebende Methode mit zwei
                  unterschiedlichen Röntgenenergien.
                </p>
                <ul>
                  <li>Körperfettanteil</li>
                  <li>Muskelmasse</li>
                  <li>Knochendichte</li>
                  <li>Körperzusammensetzung</li>
                </ul>
              </>
            )}

            {infoPopup === "bia" && (
              <>
                <h2>BIA</h2>
                <p>BIA steht für Bioelektrische Impedanzanalyse.</p>
                <p>
                  Dabei wird ein schwacher Strom durch den Körper geleitet, um
                  Körperfett, Muskelmasse und Wasseranteil zu bestimmen.
                </p>
              </>
            )}

            {infoPopup === "support" && (
              <>
                <h2>Support</h2>
                <p>Bei Fragen zur HealthMap kannst du Bahmann Coaching kontaktieren.</p>
                <p>
                  <strong>E-Mail:</strong>{" "}
                  <a href="mailto:kontakt@janbahmann.de">kontakt@janbahmann.de</a>
                </p>
                <p>
                  <strong>Website:</strong>{" "}
                  <a href="https://www.janbahmann.de/" target="_blank" rel="noreferrer">
                    www.janbahmann.de
                  </a>
                </p>

                  <p>
                  <strong>Telefon:</strong>{" "}
                  <a href="tel:+491635219537">+49 163 521 9537</a>
                </p>
              </>
            )}

            {infoPopup === "region-soon" && (
              <>
                <h2>Weitere Regionen folgen</h2>
                <p>Weitere geprüfte Praxen und Labore werden zukünftig ergänzt.</p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="app-shell">
        <div className="app-header">
          <img src={logo} alt="Bahmann Logo" className="header-logo" />

          <button className="menu-button glass-control" onClick={() => setSidebarOpen(true)}>
            ☰
          </button>

          <div>
            <h1>HealthMap</h1>
            <p className="subtitle">
              Finde DXA-, BIA- und Bluttest-Anbieter in deiner Region.
            </p>
          </div>

          <div className="region-selector">
            <select
              value={selectedRegion}
              onChange={(e) => {
                const value = e.target.value;

                if (value === "coming-soon") {
                  setInfoPopup("region-soon");
                  return;
                }

                setNearestProviderId(null);
                setSelectedRegion(value);
              }}
            >
              <option value="">Region auswählen</option>
              <option value="Region Hannover">Region Hannover</option>
              <option value="Braunschweig">Braunschweig</option>
              <option value="Osnabrück">Osnabrück</option>
              <option value="Oldenburg">Oldenburg</option>
              <option value="Göttingen">Göttingen</option>
              <option value="Wolfsburg">Wolfsburg</option>
              <option value="Hildesheim">Hildesheim</option>
            </select>

            <p className="coming-soon">Weitere Regionen können per CSV ergänzt werden.</p>
          </div>
        </div>

        <div className="map-wrapper">
          {sidebarOpen && (
            <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
          )}

          <div className={sidebarOpen ? "sidebar open" : "sidebar"}>
            <div className="sidebar-header">
              <h3>HealthMap Menü</h3>
              <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
                ✕
              </button>
            </div>

            <div className="sidebar-content">
              <button className="sidebar-item" onClick={() => setInfoPopup("dxa")}>
                Was ist DXA / DEXA?
              </button>

              <button className="sidebar-item" onClick={() => setInfoPopup("bia")}>
                Was ist BIA?
              </button>

              <button className="sidebar-item" onClick={() => setInfoPopup("support")}>
                Support
              </button>

              {isAdmin ? (
                <>
                  <button
                    className="sidebar-item"
                    onClick={() => {
                      setAdminPanelOpen(true);
                      setSidebarOpen(false);
                      loadPraxen();
                    }}
                  >
                    Admin Panel
                  </button>

                  <button className="sidebar-item" onClick={logout}>
                    Abmelden
                  </button>
                </>
              ) : (
                <button className="sidebar-item" onClick={() => setLoginOpen(true)}>
                  Anmelden
                </button>
              )}
            </div>
          </div>

          <div className="map-filter-control glass-control">
            <button
              className="filter-icon-button"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              ▾ Filter
            </button>

            <div className={filterOpen ? "filter-menu open" : "filter-menu"}>
              {["Alle", "DXA", "BIA", "DEXA Premium", "Bluttest"].map((category) => (
                <button
                  key={category}
                  className={selectedCategory === category ? "active-filter" : ""}
                  onClick={() => setSelectedCategory(category)}
                >
                  {selectedCategory === category ? "✓ " : ""}
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="map-legend glass-control">
            <div><span className="legend-color blue"></span> DXA</div>
            <div><span className="legend-color green"></span> BIA</div>
            <div><span className="legend-color red"></span> Bluttest</div>
            <div><span className="legend-color orange"></span> DEXA Premium</div>
            <div><span className="legend-color yellow"></span> Nächste Praxis</div>
          </div>

          <MapContainer
            center={[52.6367, 9.8451]}
            zoom={8}
            style={{ height: "100%", width: "100%" }}
          >
            <FitBounds providers={filteredProviders} />

            <LayersControl position="bottomleft">
              <LayersControl.BaseLayer checked name="Modern hell">
                <TileLayer
                  attribution="&copy; CARTO &copy; OpenStreetMap contributors"
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer name="Standard">
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>
            </LayersControl>

            {userLocation && (
              <Marker position={userLocation} icon={icons.user}>
                <Popup>
                  <div className="popup-card">
                    <h3>Dein Standort</h3>
                    <p>Von hier aus wird die nächste Praxis berechnet.</p>
                  </div>
                </Popup>
              </Marker>
            )}

            <LocationButton
              setUserLocation={setUserLocation}
              providers={filteredProviders}
              setNearestProviderId={setNearestProviderId}
            />

            {filteredProviders.map((provider) => (
              <Marker
                key={provider.id}
                position={[provider.lat, provider.lng]}
                icon={
                  provider.id === nearestProviderId
                    ? icons.nearest
                    : icons[provider.category] || icons["DEXA Premium"]
                }
                eventHandlers={{
                  mouseover: (e) => e.target.openPopup(),
                }}
              >
                <Popup>
                  <div className="popup-card">
                    <div className="popup-topline">
                      <span className={`popup-category ${provider.category.replace(" ", "-")}`}>
                        {provider.category}
                      </span>
                      {provider.verified && <span className="popup-verified">✓ geprüft</span>}
                    </div>

                    <h3>{provider.name}</h3>

                    <p><strong>Leistungen:</strong> {provider.services}</p>
                    <p><strong>Adresse:</strong> {provider.address}</p>
                    <p><strong>Telefon:</strong> {provider.phone || "Keine Angabe"}</p>
                    <p><strong>Preis:</strong> {provider.price || "Keine Angabe"}</p>

                    {provider.website && (
                      <a href={provider.website} target="_blank" rel="noreferrer">
                        Website öffnen →
                      </a>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default App;