const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Cart is managed client-side via localStorage; these routes are for future server-side cart sync
router.get('/', protect, (req, res) => res.json({ items: [] }));

module.exports = router;
