const express = require('express');
const { listProducts, getMeta } = require('../controllers/productsController');

const router = express.Router();

// GET /api/products?category=Audio,Wearables&minPrice=50&maxPrice=200&minRating=4&sort=rating_desc&page=1&pageSize=12
router.get('/', listProducts);

// GET /api/products/meta -> price bounds + full category list, used to
// render filter controls before any filtering has happened.
router.get('/meta', getMeta);

module.exports = router;
