"use client";
import React from "react";
import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  page: number;
  limit: number;
  hasMore: boolean;
  onPageChange: (newPage: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ page, limit, hasMore, onPageChange }) => {
  return (
    <div className="flex items-center space-x-2 mt-4">
      <Button variant="outline" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        Poprzednia
      </Button>
      <span className="text-sm">Strona {page}</span>
      <Button variant="outline" onClick={() => onPageChange(page + 1)} disabled={!hasMore}>
        Następna
      </Button>
    </div>
  );
};

export default PaginationControls;
