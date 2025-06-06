"use client";

import React, { useState } from "react";
import pazarYerleriData from "../data/pazar-yerleri.json";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import "../assets/styles/styles.scss";

const data: any = pazarYerleriData;
const gunler = Object.keys(data);

const ilcelerSet = new Set<string>();
gunler.forEach((gun) => {
  const ilceler = Object.keys(data[gun]["İlçe"]);
  ilceler.forEach((ilce) => ilcelerSet.add(ilce));
});
const ilceler = Array.from(ilcelerSet);

// Tabloya uygun veri formatı
const tableData = ilceler.map((ilce) => {
  const row: Record<string, string | string[]> = { ilce };
  gunler.forEach((gun) => {
    const ilceData = data[gun]["İlçe"][ilce];
    row[gun] = ilceData ? ilceData.map((p: any) => p.name) : ["-"];
  });
  return row;
});

// Kolon tanımları
const columns: ColumnDef<any>[] = [
  {
    accessorKey: "ilce",
    header: () => "İlçe",
    cell: (info) => info.getValue(),
  },
  ...gunler.map((gun) => ({
    accessorKey: gun,
    header: () => gun,
    cell: (info: any) => {
      const value = info.getValue();
      const ilce = info.row.original.ilce;
      // useState hook burada kullanılamaz, üst componentte state tutulmalı
      // Bu yüzden custom bir RowCell componenti ile state yönetelim
      return (
        <PazarCell
          value={value}
          ilce={ilce}
          gun={gun}
          data={data}
        />
      );
    },
  })),
];

// Hücrede tooltip ve border yönetimi için ayrı bir component
function PazarCell({ value, ilce, gun, data }: { value: string[]; ilce: string; gun: string; data: any }) {
  const [tooltipIdx, setTooltipIdx] = React.useState<number | null>(null);
  if (!Array.isArray(value)) return value;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
      {value.map((name: string, idx: number) => {
        const pazarObj = data[gun]["İlçe"][ilce]?.[idx];
        const address = pazarObj?.address || "-";
        return (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              position: "relative",
              borderBottom: idx !== value.length - 1 ? "1px solid #444" : undefined,
              padding: "4px 0",
            }}
          >
            <span>{name}</span>
            {name !== "-" && (
              <>
                <span
                  style={{
                    cursor: "pointer",
                    color: "#00ADB5",
                    fontSize: 18,
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                  onClick={() => setTooltipIdx(idx)}
                  title="Adres Göster"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"
                      fill="#00ADB5"
                    />
                  </svg>
                </span>
                {tooltipIdx === idx && (
                  <AddressTooltip address={address} name={name} onClose={() => setTooltipIdx(null)} />
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AddressTooltip({ address, onClose, name }: { address: string; onClose: () => void; name?: string }) {
  // Adresin başına pazar adı ekle
  let full = address;
  if (name && name !== "-") {
    full = `${name} ${address}`;
  }
  const encoded = full.replace(/\s+/g, "+").replace(/\//g, "%2F");
  const mapsUrl = `https://www.google.com/maps/search/${encoded}`;

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      const tooltip = document.getElementById("address-tooltip");
      if (tooltip && !tooltip.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      id="address-tooltip"
      style={{
        position: "absolute",
        top: 28,
        left: 0,
        zIndex: 1000,
        background: "#2D2D2D",
        color: "#E0E0E0",
        border: "1px solid #444444",
        borderRadius: 8,
        padding: "16px 24px 16px 16px",
        minWidth: 220,
        boxShadow: "0 2px 16px #0008",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "none",
          border: "none",
          color: "#FF6F61",
          fontWeight: "bold",
          fontSize: 18,
          cursor: "pointer",
        }}
        aria-label="Kapat"
      >
        ×
      </button>
      <a
        href={mapsUrl}
        target="_new"
        style={{ color: "#00ADB5", textDecoration: "underline", fontSize: 14, wordBreak: "break-word" }}
      >
        {address}
      </a>
    </div>
  );
}

const defaultColumn = {
  enableGlobalFilter: true,
};

export default function Home() {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<any[]>([]);
  const [selectedRowId, setSelectedRowId] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: tableData.length });

  const table = useReactTable({
    data: tableData,
    columns,
    defaultColumn,
    state: {
      globalFilter,
      sorting,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      // Tüm hücrelerde arama: satırdaki tüm hücrelerin değerlerini string olarak birleştirip filtre uygula
      return Object.values(row.original)
        .flat()
        .join(" ")
        .toLowerCase()
        .includes(filterValue.toLowerCase());
    },
  });

  // Pagination controls
  const pageSizes = [10, 20, 50, 100, tableData.length];

  return (
    <div style={{ minHeight: "100vh", background: "#1E1E1E", padding: 24, paddingTop: 0 }}>
      <h1>Bursa Pazar Yerleri Tablosu</h1>
      <p>Günlere Göre Bursa Semt Pazarları ve Adresleri</p>
      <div className="fixed-controls">
        <div className="fixed-controls-flex">
          <input
            className="search-box"
            value={globalFilter}

            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Tabloda ara..."
            style={{
              padding: 10,
              width: 260,
              background: "#2D2D2D",
              color: "#E0E0E0",
              border: "1px solid #444444",
              borderRadius: 6,
              outline: "none",
            }}
          />
          <div className="pagination-box" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              style={{ background: '#2D2D2D', color: '#E0E0E0', border: '1px solid #444444', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', opacity: table.getCanPreviousPage() ? 1 : 0.5 }}
            >{"|<"}</button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              style={{ background: '#2D2D2D', color: '#E0E0E0', border: '1px solid #444444', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', opacity: table.getCanPreviousPage() ? 1 : 0.5 }}
            >{"<"}</button>
            <span style={{ color: '#E0E0E0' }}>
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              style={{ background: '#2D2D2D', color: '#E0E0E0', border: '1px solid #444444', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', opacity: table.getCanNextPage() ? 1 : 0.5 }}
            >{" > "}</button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              style={{ background: '#2D2D2D', color: '#E0E0E0', border: '1px solid #444444', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', opacity: table.getCanNextPage() ? 1 : 0.5 }}
            >{" >| "}</button>
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              style={{ background: '#2D2D2D', color: '#E0E0E0', border: '1px solid #444444', borderRadius: 4, padding: '4px 10px' }}
            >
              {pageSizes.map(size => (
                <option key={size} value={size}>{size === tableData.length ? 'Tümü' : size}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div style={{ borderRadius: 10, boxShadow: "0 2px 16px #0004", background: "#2D2D2D" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", background: "#2D2D2D", color: "#E0E0E0" }}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      border: "1px solid #444444",
                      padding: 10,
                      background: "#2D2D2D",
                      color: "#E0E0E0",
                      textTransform: "capitalize",
                      cursor: "pointer",
                      userSelect: "none",
                      transition: "background 0.2s",
                      position: "sticky",
                      top: 95, // Geri alındı: top 0 yerine top 95
                      zIndex: 1
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === "asc"
                      ? " ▲"
                      : header.column.getIsSorted() === "desc"
                        ? " ▼"
                        : ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                style={{
                  background:
                    selectedRowId === row.id
                      ? "#006064"
                      : row.getIsSelected()
                        ? "#006064"
                        : row.index % 2 === 0
                          ? "#2D2D2D"
                          : "#232323",
                  color: selectedRowId === row.id ? "#E0E0E0" : "#E0E0E0",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onClick={() => setSelectedRowId(row.id)}
                onMouseEnter={e => (e.currentTarget.style.background = selectedRowId === row.id ? "#006064" : "#3A3A3A")}
                onMouseLeave={e => (e.currentTarget.style.background = selectedRowId === row.id ? "#006064" : row.index % 2 === 0 ? "#2D2D2D" : "#232323")}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    data-label={
                      cell.column.columnDef.header
                        ? (typeof cell.column.columnDef.header === 'function'
                          ? '' // If header is a function, leave data-label empty or provide a fallback string
                          : cell.column.columnDef.header)
                        : ''
                    }
                    style={{
                      border: "1px solid #444444",
                      padding: 10,
                      textTransform: "capitalize",
                      background: "inherit",
                      color: "inherit",
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
