const express = require("express");

const {
  executeQuery,
  getTables,
  getTableData,
} = require("../controllers/sqlController");

const router = express.Router();

// ============================================================
// EXECUTE SQL QUERY
// ============================================================

router.post("/execute", executeQuery);

// ============================================================
// GET ALL TABLE NAMES
// ============================================================

router.get("/tables", getTables);

// ============================================================
// GET SPECIFIC TABLE DATA
// ============================================================

router.get("/tables/:tableName", getTableData);

module.exports = router;