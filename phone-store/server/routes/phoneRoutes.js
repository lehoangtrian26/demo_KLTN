const express = require('express');
const router = express.Router();
const { getPhones, getPhoneBySlug, getPhonesByBrand, getFeaturedPhones } = require('../controllers/phoneController');

router.get('/', getPhones);
router.get('/featured', getFeaturedPhones);
router.get('/brand/:brand', getPhonesByBrand);
router.get('/:slug', getPhoneBySlug);

module.exports = router;
