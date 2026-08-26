const { parseProductQuery } = require('../validators/productQuery');
const productsRepository = require('../repositories/productsRepository');

const DEFAULT_PAGE_SIZE = Number(process.env.DEFAULT_PAGE_SIZE) || 12;
const MAX_PAGE_SIZE = Number(process.env.MAX_PAGE_SIZE) || 48;

function listProducts(req, res, next) {
  try {
    const filters = parseProductQuery(req.query, {
      defaultPageSize: DEFAULT_PAGE_SIZE,
      maxPageSize: MAX_PAGE_SIZE,
    });

    const { rows, total } = productsRepository.findProducts(filters);
    const categoryFacets = productsRepository.findCategoryFacets(filters);
    const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));

    // If the caller asked for a page beyond the results (e.g. after a
    // filter change shrinks the set), tell them clearly instead of
    // silently returning an empty array that looks like "no results".
    const pageInRange = filters.page <= totalPages;

    res.json({
      data: pageInRange ? rows : [],
      pagination: {
        page: filters.page,
        pageSize: filters.pageSize,
        total,
        totalPages,
        hasNextPage: filters.page < totalPages,
        hasPrevPage: filters.page > 1,
      },
      facets: {
        categories: categoryFacets,
      },
      appliedFilters: {
        categories: filters.categories,
        minPrice: filters.minPrice,
        maxPrice: Number.isFinite(filters.maxPrice) ? filters.maxPrice : null,
        minRating: filters.minRating,
        sort: filters.sort,
        search: filters.search || null,
      },
    });
  } catch (err) {
    next(err);
  }
}

function getMeta(_req, res, next) {
  try {
    const priceBounds = productsRepository.getPriceBounds();
    const categoryFacets = productsRepository.findCategoryFacets({
      categories: [],
      minPrice: 0,
      maxPrice: Infinity,
      minRating: 0,
      search: '',
    });
    res.json({ priceBounds, categories: categoryFacets });
  } catch (err) {
    next(err);
  }
}

module.exports = { listProducts, getMeta };
