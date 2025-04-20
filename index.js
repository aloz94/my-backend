const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: "localhost",
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 5432,
});

app.get("/customers", async (req, res) => {
  const result = await pool.query("SELECT * FROM customers");
  res.json(result.rows);
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

app.post("/register", async (req, res) => {
    const client = await pool.connect();
  
    const {
      firstName,
      lastName,
      phone,
      email,
      password,
      dogName,
      dogBreed,
      dogAge,
      dogSize
    } = req.body;
  
    try {
      // Save customer first
      const customerResult = await client.query(
        `INSERT INTO customers (first_name, last_name, phone, email, password_hash)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [firstName, lastName, phone, email, password]
      );
  
      const customerId = customerResult.rows[0].id;
  
      // Then save dog
      await client.query(
        `INSERT INTO pets (customer_id, name, breed, age, size)
         VALUES ($1, $2, $3, $4, $5)`,
        [customerId, dogName, dogBreed, dogAge, dogSize]
      );
  
      res.json({ success: true });
    } catch (err) {
      
      cconsole.error("❌ SERVER ERROR:", err.message, err.stack);

      res.status(500).json({ error: "Something went wrong" });
    } finally {
      client.release();
    }
  });
  