"use client";

import React from "react";
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
  const row: Record<string, string> = { ilce };
  gunler.forEach((gun) => {
    const ilceData = data[gun]["İlçe"][ilce];
    row[gun] = ilceData ? ilceData.map((p: any) => p.name).join(", ") : "-";
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
    cell: (info: any) => info.getValue(),
  })),
];

export default function Home() {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<any[]>([]);
  const [selectedRowId, setSelectedRowId] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: tableData.length });

  const table = useReactTable({
    data: tableData,
    columns,
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
    globalFilterFn: (row, columnId, filterValue) => {
      return String(row.getValue(columnId)).toLowerCase().includes(filterValue.toLowerCase());
    },
  });

  // Pagination controls
  const pageSizes = [10, 20, 50, 100, tableData.length];

  return (
    <div style={{ minHeight: "100vh", background: "#1E1E1E", padding: 24, paddingTop: 0 }}>
      <style>{`
        body { background: #1E1E1E !important; }
        ::selection { background: #006064; color: #E0E0E0; }
        input::placeholder { color: #888; }
        .fixed-controls {
          background: #1E1E1E;
          padding-bottom: 8px;
          padding-top: 24px;
          position: sticky;
          top: 0;
        }
      `}</style>
      <div className="fixed-controls">
        <input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Tabloda ara..."
          style={{
            marginBottom: 16,
            padding: 10,
            width: 260,
            background: "#2D2D2D",
            color: "#E0E0E0",
            border: "1px solid #444444",
            borderRadius: 6,
            outline: "none",
          }}
        />
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
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
                      top: 139,
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
