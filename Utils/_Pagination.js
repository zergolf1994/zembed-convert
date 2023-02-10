"use strict";

module.exports = (page, total = 0, limit = 10) => {
  const currentPage = parseInt(page) ? parseInt(page) : 1;
  const countPage = Math.ceil(total / parseInt(limit)) || 1;
  const startRow = currentPage == 1 ? 0 : (currentPage - 1) * limit;
  const endRow = parseInt(limit);
  const PerPage = parseInt(limit);
  return { countPage, currentPage, startRow, endRow, PerPage };
};
