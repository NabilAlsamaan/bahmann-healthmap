require("dotenv").config();

const mysql = require("mysql2");
const bcrypt = require("bcryptjs");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const username = "admin";
const password = "admin123";
const role = "superadmin";

bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;

  db.query(
    "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
    [username, hash, role],
    (err) => {
      if (err) {
        console.error(err);
        console.log("User existiert vielleicht schon → wir updaten ihn");

        db.query(
          "UPDATE users SET password_hash = ?, role = ? WHERE username = ?",
          [hash, role, username],
          (err) => {
            if (err) throw err;

            console.log("Admin wurde aktualisiert");
            db.end();
          }
        );
      } else {
        console.log("Admin wurde erstellt");
        db.end();
      }
    }
  );
});