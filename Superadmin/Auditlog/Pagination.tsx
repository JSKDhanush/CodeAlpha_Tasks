"use client";

import React from "react";
import styles from "./Pagination.module.css";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
  itemsPerPage: number;
  handleItemsPerPageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  totalItems: number;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  handlePageChange,
  itemsPerPage,
  handleItemsPerPageChange,
  totalItems,
}) => {
  // Safeguard against invalid values
  const safeCurrentPage = Math.max(1, Number(currentPage) || 1);
  const safeItemsPerPage = Number(itemsPerPage) || 10;
  const safeTotalItems = Number(totalItems) || 0;

  const startItem = (safeCurrentPage - 1) * safeItemsPerPage + 1;
  const endItem = Math.min(safeCurrentPage * safeItemsPerPage, safeTotalItems);

  // Generate page numbers for display (e.g., 1, 2, 3, 4)
  const pageNumbers = [];
  const maxPageButtons = 5; // Limit to 5 page buttons for simplicity
  let startPage = Math.max(1, safeCurrentPage - 2);
  let endPage = Math.min(totalPages, safeCurrentPage + 2);

  if (endPage - startPage < maxPageButtons - 1) {
    if (startPage === 1) {
      endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    } else if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className={styles.paginationContainer}>
      <div className={styles.pagination}>
        <div className={styles.pageControls}>
          {safeCurrentPage !== 1 && (
            <button
              className={styles.pageButton}
              onClick={() => handlePageChange(safeCurrentPage - 1)}
            >
              &lt;
            </button>
          )}
          {pageNumbers.map((number) => (
            <button
              key={number}
              className={`${styles.pageButton} ${
                safeCurrentPage === number ? styles.activePage : ""
              }`}
              onClick={() => handlePageChange(number)}
            >
              {number}
            </button>
          ))}
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(safeCurrentPage + 1)}
            disabled={
              safeCurrentPage === totalPages || safeTotalItems <= safeItemsPerPage
            }
          >
            &gt;
          </button>
        </div>
        <div className={styles.pageSize}>
          <select
            className={styles.pageSizeSelect}
            value={safeItemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            {[10, 20, 30, 40, 50].map((option) => (
              <option key={option} value={option}>
                {option}/page
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Pagination;