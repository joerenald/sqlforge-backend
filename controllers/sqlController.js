const pool = require("../config/db");

// ============================================================
// EXECUTE USER SQL QUERY
// ============================================================

const executeQuery = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "SQL query is required.",
      });
    }

    const sql = query.trim();

    // Only SELECT queries are allowed
    if (!/^select\b/i.test(sql)) {
      return res.status(403).json({
        success: false,
        message: "Only SELECT queries are allowed.",
      });
    }

    const [rows, fields] = await pool.query(sql);

    const columns = fields.map((field) => field.name);

    res.json({
      success: true,
      columns,
      rows,
      rowCount: rows.length,
    });
  } catch (error) {
    console.error("SQL Error:", error.message);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// GET ALL TABLE NAMES
// ============================================================

const getTables = async (req, res) => {
  console.log("GET /api/sql/tables called");

  try {
    console.log("Attempting MySQL connection...");
    console.log("DB_HOST:", process.env.DB_HOST);
    console.log("DB_PORT:", process.env.DB_PORT);
    console.log("DB_USER:", process.env.DB_USER);
    console.log("DB_NAME:", process.env.DB_NAME);

    const [rows] = await pool.query("SHOW TABLES");

    console.log("MySQL query successful.");
    console.log("Tables found:", rows);

    const tables = rows.map((row) => Object.values(row)[0]);

    res.json({
      success: true,
      tables,
    });
  } catch (error) {
    console.error("Get tables error:", error);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error errno:", error.errno);
    console.error("Error syscall:", error.syscall);
    console.error("Error hostname:", error.hostname);

    res.status(500).json({
      success: false,
      message: "Unable to fetch database tables.",
    });
  }
};

// ============================================================
// GET TABLE STRUCTURE + RECORDS
// ============================================================

const getTableData = async (req, res) => {
  try {
    const { tableName } = req.params;

    if (!tableName) {
      return res.status(400).json({
        success: false,
        message: "Table name is required.",
      });
    }

    // --------------------------------------------------------
    // Validate table exists
    // --------------------------------------------------------

    const [tableRows] = await pool.query("SHOW TABLES");

    const availableTables = tableRows.map(
      (row) => Object.values(row)[0]
    );

    if (!availableTables.includes(tableName)) {
      return res.status(404).json({
        success: false,
        message: "Table not found.",
      });
    }

    // --------------------------------------------------------
    // Get columns
    // --------------------------------------------------------

    const [columns] = await pool.query(
      `SHOW COLUMNS FROM \`${tableName}\``
    );

    // --------------------------------------------------------
    // Get records
    // --------------------------------------------------------

    const [rows] = await pool.query(
      `SELECT * FROM \`${tableName}\``
    );

    res.json({
      success: true,
      table: tableName,
      columns: columns.map((column) => ({
        name: column.Field,
        type: column.Type,
        nullable: column.Null,
        key: column.Key,
        default: column.Default,
        extra: column.Extra,
      })),
      rows,
      rowCount: rows.length,
    });
  } catch (error) {
    console.error("Get table data error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch table data.",
    });
  }
};

// ============================================================
// EXPORT CONTROLLERS
// ============================================================

module.exports = {
  executeQuery,
  getTables,
  getTableData,
};