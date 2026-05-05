require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

let db;

const connectWithRetry = () => {
  db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  db.connect((err) => {
    if (err) {
      console.log("MySQL noch nicht bereit. Neuer Versuch in 3 Sekunden...");
      console.log("Fehler:", err.code);
      setTimeout(connectWithRetry, 3000);
    } else {
      console.log("MySQL verbunden");
    }
  });
};

connectWithRetry();


const writeLog = (adminUsername, actionType, description) => {
  const sql =
    "INSERT INTO admin_logs (admin_username, action_type, description) VALUES (?, ?, ?)";

  db.query(sql, [adminUsername || "unbekannt", actionType, description]);
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Kein Token vorhanden" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token fehlt" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token ungültig oder abgelaufen" });
  }
};

const parseCsvLine = (line) => {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ";" && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
};

const normalizeHeader = (header) =>
  header
    .trim()
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .replaceAll(" ", "_");

app.get("/", (req, res) => {
  res.send("Backend läuft");
});

app.get("/api/praxen", (req, res) => {
  const sql = "SELECT * FROM praxen ORDER BY id DESC";

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM users WHERE username = ?";

  db.query(sql, [username], async (err, result) => {
    if (err) return res.status(500).json({ error: "Serverfehler" });

    if (result.length === 0) {
      return res.status(401).json({ error: "Benutzer nicht gefunden" });
    }

    const user = result[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: "Falsches Passwort" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    writeLog(user.username, "LOGIN", "Admin hat sich angemeldet");

    res.json({
      success: true,
      token,
      role: user.role,
      username: user.username,
    });
  });
});

app.put("/api/admin/change-password", verifyToken, (req, res) => {
  const { username, oldPassword, newPassword } = req.body;

  const sql = "SELECT * FROM users WHERE username = ?";

  db.query(sql, [username], async (err, result) => {
    if (err) return res.status(500).json({ error: "Serverfehler" });

    if (result.length === 0) {
      return res.status(404).json({ error: "Benutzer nicht gefunden" });
    }

    const user = result[0];
    const passwordIsCorrect = await bcrypt.compare(
      oldPassword,
      user.password_hash
    );

    if (!passwordIsCorrect) {
      return res.status(401).json({ error: "Altes Passwort ist falsch" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    db.query(
      "UPDATE users SET password_hash = ? WHERE username = ?",
      [newHash, username],
      (err) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Passwort konnte nicht geändert werden" });
        }

        writeLog(
          req.user.username,
          "PASSWORT",
          `Passwort für ${username} geändert`
        );

        res.json({ success: true, message: "Passwort erfolgreich geändert" });
      }
    );
  });
});

app.get("/api/admins", verifyToken, (req, res) => {
  const sql = "SELECT id, username, role, created_at FROM users ORDER BY id ASC";

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post("/api/admins", verifyToken, async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Benutzername und Passwort fehlen" });
  }

  const hash = await bcrypt.hash(password, 10);

  const sql =
    "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)";

  db.query(sql, [username, hash, role || "admin"], (err) => {
    if (err) return res.status(500).json(err);

    writeLog(req.user.username, "ADMIN_ERSTELLT", `Admin ${username} erstellt`);
    res.json({ success: true });
  });
});

app.delete("/api/admins/:id", verifyToken, (req, res) => {
  const currentUsername = req.user.username;

  const checkSql = "SELECT username FROM users WHERE id = ?";

  db.query(checkSql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(404).json({ error: "Admin nicht gefunden" });
    }

    if (result[0].username === currentUsername) {
      return res
        .status(400)
        .json({ error: "Eigener Account kann nicht gelöscht werden" });
    }

    db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err) => {
      if (err) return res.status(500).json(err);

      writeLog(
        currentUsername,
        "ADMIN_GELOESCHT",
        `Admin ${result[0].username} gelöscht`
      );

      res.json({ success: true });
    });
  });
});

app.post("/api/praxen", verifyToken, (req, res) => {
  const {
    name_der_praxis,
    kategorie,
    angebotene_leistungen,
    strasse,
    plz,
    ort,
    latitude,
    longitude,
    telefon,
    website,
    selbstzahler,
    preis_in_euro,
    status,
    interne_notiz,
    region,
    verifiziert,
  } = req.body;

  const sql = `
    INSERT INTO praxen (
      name_der_praxis, kategorie, angebotene_leistungen, strasse, plz, ort,
      latitude, longitude, telefon, website, selbstzahler, preis_in_euro,
      status, interne_notiz, region, verifiziert
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name_der_praxis,
    kategorie,
    angebotene_leistungen,
    strasse,
    plz,
    ort,
    latitude,
    longitude,
    telefon,
    website,
    selbstzahler,
    preis_in_euro,
    status || "aktiv",
    interne_notiz,
    region || "Region Hannover",
    verifiziert ? 1 : 0,
  ];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json(err);

    writeLog(
      req.user.username,
      "PRAXIS_ERSTELLT",
      `${name_der_praxis} erstellt`
    );

    res.json({ success: true });
  });
});

app.put("/api/praxen/:id", verifyToken, (req, res) => {
  const {
    name_der_praxis,
    kategorie,
    angebotene_leistungen,
    strasse,
    plz,
    ort,
    latitude,
    longitude,
    telefon,
    website,
    selbstzahler,
    preis_in_euro,
    status,
    interne_notiz,
    region,
    verifiziert,
  } = req.body;

  const sql = `
    UPDATE praxen
    SET
      name_der_praxis = ?,
      kategorie = ?,
      angebotene_leistungen = ?,
      strasse = ?,
      plz = ?,
      ort = ?,
      latitude = ?,
      longitude = ?,
      telefon = ?,
      website = ?,
      selbstzahler = ?,
      preis_in_euro = ?,
      status = ?,
      interne_notiz = ?,
      region = ?,
      verifiziert = ?,
      updated_at = NOW()
    WHERE id = ?
  `;

  const values = [
    name_der_praxis,
    kategorie,
    angebotene_leistungen,
    strasse,
    plz,
    ort,
    latitude,
    longitude,
    telefon,
    website,
    selbstzahler,
    preis_in_euro,
    status || "aktiv",
    interne_notiz,
    region || "Region Hannover",
    verifiziert ? 1 : 0,
    req.params.id,
  ];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json(err);

    writeLog(
      req.user.username,
      "PRAXIS_BEARBEITET",
      `${name_der_praxis} bearbeitet`
    );

    res.json({ success: true });
  });
});

app.delete("/api/praxen/:id", verifyToken, (req, res) => {
  const sql =
    "UPDATE praxen SET status = 'inaktiv', updated_at = NOW() WHERE id = ?";

  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json(err);

    writeLog(
      req.user.username,
      "PRAXIS_DEAKTIVIERT",
      `Praxis ID ${req.params.id} deaktiviert`
    );

    res.json({ success: true });
  });
});

app.delete("/api/praxen/region/:region", verifyToken, (req, res) => {
  const region = req.params.region;

  const sql =
    "UPDATE praxen SET status = 'inaktiv', updated_at = NOW() WHERE region = ?";

  db.query(sql, [region], (err, result) => {
    if (err) return res.status(500).json(err);

    writeLog(
      req.user.username,
      "REGION_DEAKTIVIERT",
      `Alle Praxen der Region ${region} wurden deaktiviert`
    );

    res.json({ success: true, affectedRows: result.affectedRows });
  });
});

app.post(
  "/api/praxen/import-csv",
  verifyToken,
  upload.single("csv"),
  (req, res) => {
    const region = req.body.region;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "Keine CSV-Datei hochgeladen" });
    }

    if (!region) {
      fs.unlinkSync(req.file.path);
      return res
        .status(400)
        .json({ success: false, error: "Keine Region ausgewählt" });
    }

    const content = fs.readFileSync(req.file.path, "utf8");
    fs.unlinkSync(req.file.path);

    const lines = content
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .filter((line) => line.trim() !== "");

    if (lines.length < 2) {
      return res
        .status(400)
        .json({ success: false, error: "CSV enthält keine Daten" });
    }

    const headers = parseCsvLine(lines[0]).map(normalizeHeader);
    const rows = lines.slice(1);

    const requiredHeaders = [
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
    ];

    const missingHeaders = requiredHeaders.filter(
      (header) => !headers.includes(header)
    );

    if (missingHeaders.length > 0) {
      return res.status(400).json({
        success: false,
        error: "CSV-Spalten fehlen",
        missingHeaders,
      });
    }

    const sql = `
      INSERT INTO praxen (
        name_der_praxis, kategorie, angebotene_leistungen, strasse, plz, ort,
        latitude, longitude, telefon, website, selbstzahler, preis_in_euro,
        status, interne_notiz, region, verifiziert
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    let imported = 0;

    const insertPromises = rows.map((line) => {
      const values = parseCsvLine(line);
      const row = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });

      const insertValues = [
        row.name_der_praxis,
        row.kategorie || "DXA",
        row.angebotene_leistungen,
        row.strasse,
        row.plz,
        row.ort,
        row.latitude,
        row.longitude,
        row.telefon,
        row.website,
        row.selbstzahler,
        row.preis_in_euro,
        "aktiv",
        "",
        region,
        row.verifiziert === "1" || row.verifiziert?.toLowerCase() === "ja"
          ? 1
          : 0,
      ];

      return new Promise((resolve, reject) => {
        db.query(sql, insertValues, (err) => {
          if (err) {
            reject(err);
          } else {
            imported++;
            resolve();
          }
        });
      });
    });

    Promise.all(insertPromises)
      .then(() => {
        writeLog(
          req.user.username,
          "CSV_IMPORT",
          `${imported} Einträge für ${region} importiert`
        );

        res.json({ success: true, imported });
      })
      .catch((err) => {
        console.error("CSV Import Fehler:", err);
        res
          .status(500)
          .json({ success: false, error: "CSV Import fehlgeschlagen" });
      });
  }
);

app.get("/api/admin-logs", verifyToken, (req, res) => {
  const sql = "SELECT * FROM admin_logs ORDER BY created_at DESC";

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Backend läuft: http://localhost:${PORT}`);
  console.log(`🌐 Frontend öffnen: http://localhost:3000\n`);
});