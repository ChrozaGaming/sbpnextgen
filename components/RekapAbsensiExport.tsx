/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface AttendanceRecord {
  date: string;
  status: string;
  waktuAbsen: string | null;
  keterangan: string | null;
}

interface UserAttendance {
  userId: number;
  username: string;
  name: string;
  role: string;
  attendance: AttendanceRecord[];
}

interface RekapAbsensiExportProps {
  title: string;
  dates: string[];
  attendanceData: UserAttendance[];
  isDisabled: boolean;
  isWeekend: (dateString: string) => boolean;
}

// Menambahkan tipe untuk jsPDF dengan lastAutoTable
interface ExtendedJsPDF extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

const RekapAbsensiExport: React.FC<RekapAbsensiExportProps> = ({
  title,
  dates,
  attendanceData,
  isDisabled,
  isWeekend,
}) => {
  // Format date for filename
  const formatDateForFilename = (date: Date): string => {
    return date.toISOString().split("T")[0].replace(/-/g, "");
  };

  // Function to group dates by month
  const groupDatesByMonth = (dateList: string[]): { [key: string]: string[] } => {
    const grouped: { [key: string]: string[] } = {};
    
    dateList.forEach((date) => {
      const [year, month] = date.split("-");
      const key = `${year}-${month}`;
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      
      grouped[key].push(date);
    });

    return grouped;
  };

  // Function to format time from datetime string
  const formatTime = (datetime: string | null): string => {
    if (!datetime) return "";

    try {
      // Handle MySQL datetime format (YYYY-MM-DD HH:MM:SS)
      if (datetime.includes("-") && datetime.includes(":")) {
        const date = new Date(datetime);
        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.warn("Invalid date format:", datetime);
          return "";
        }
        return date.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }
      // Handle time-only format (HH:MM:SS)
      else if (datetime.includes(":")) {
        const timeParts = datetime.split(":");
        return `${timeParts[0]}:${timeParts[1]}`;
      }
      return datetime; // Return as-is for unknown formats
    } catch (e) {
      console.warn("Error formatting time:", e);
      return "";
    }
  };

  // Function to create a placeholder string for status that will be replaced with colored cell
  const getStatusPlaceholder = (status: string, waktuAbsen: string | null): string => {
    const normalizedStatus = status?.toLowerCase()?.trim() || "";
    const timeStr = waktuAbsen ? formatTime(waktuAbsen) : "";
    return `STATUS:${normalizedStatus}|${timeStr}`;
  };

  // Menambahkan fungsi untuk memisahkan logika pengaturan dokumen dasar
  const setupDocumentBasics = (doc: jsPDF): void => {
    // Add title with styling
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    const titleWidth = (doc.getStringUnitWidth(title) * doc.getFontSize()) / doc.internal.scaleFactor;
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(title, (pageWidth - titleWidth) / 2, 15); // Centered title

    // Add subtitle information
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const today = new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    doc.text(`Dicetak pada: ${today}`, 15, 25);
  };

  // Fungsi untuk membuat legend warna
  const addColorLegend = (doc: jsPDF): void => {
    // Add color legend
    doc.setFillColor(144, 238, 144); // Light green
    doc.rect(15, 30, 5, 5, "F");
    doc.text("Hadir", 22, 34);

    doc.setFillColor(255, 255, 0); // Yellow
    doc.rect(45, 30, 5, 5, "F");
    doc.text("Terlambat", 52, 34);

    doc.setFillColor(255, 99, 71); // Red
    doc.rect(85, 30, 5, 5, "F");
    doc.text("Alpha", 92, 34);

    doc.setFillColor(200, 200, 200); // Gray
    doc.rect(125, 30, 5, 5, "F");
    doc.text("Libur", 132, 34);

    doc.setFillColor(240, 240, 240); // Light Gray
    doc.rect(155, 30, 5, 5, "F");
    doc.text("Tidak Ada Data", 162, 34);
  };

  // Fungsi untuk memproses data kehadiran per bulan
  const processMonthData = (
    doc: ExtendedJsPDF, 
    monthYear: string, 
    monthDates: string[], 
    filteredAttendanceData: UserAttendance[],
    startY: number
  ): number => {
    const [year, month] = monthYear.split("-");
    const monthName = new Date(
      parseInt(year),
      parseInt(month) - 1,
      1
    ).toLocaleDateString("id-ID", { month: "long" });

    // Add month header
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text(`${monthName} ${year}`, 15, startY);
    startY += 7;

    // Prepare table headers
    const tableHeaders = ["No", "Username", "Jabatan"];

    // Get days in month for column headers
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      tableHeaders.push(day.toString().padStart(2, "0"));
    }

    // Prepare table body data
    const tableData = prepareTableData(filteredAttendanceData, year, month, daysInMonth);

    // Generate the table
    autoTable(doc, {
      startY: startY,
      head: [tableHeaders],
      body: tableData,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: [50, 50, 50],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 8 }, // No column
        1: { cellWidth: 25 }, // Username column
        2: { cellWidth: 20 }, // Role column
      },
      didDrawCell: handleCellDrawing.bind(null, doc),
    });

    return doc.lastAutoTable.finalY + 15;
  };

  // Fungsi untuk menyiapkan data tabel
  const prepareTableData = (
    filteredData: UserAttendance[], 
    year: string, 
    month: string, 
    daysInMonth: number
  ): string[][] => {
    return filteredData.map((user, index) => {
      const rowData = [(index + 1).toString(), user.username, user.role];

      // Add data for each day of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${month}-${day.toString().padStart(2, "0")}`;

        // Check if it's a weekend
        if (isWeekend(dateStr)) {
          rowData.push("STATUS:libur|");
          continue;
        }

        const record = user.attendance.find((a) => a.date === dateStr);
        if (record) {
          rowData.push(getStatusPlaceholder(record.status, record.waktuAbsen));
        } else {
          rowData.push("STATUS:nodata|");
        }
      }

      return rowData;
    });
  };

  // Fungsi untuk menangani pewarnaan sel
  const handleCellDrawing = (doc: jsPDF, data: any): void => {
    // Only color and add time text for date cells (skip headers, No, Username, Jabatan)
    if (data.section === "body" && data.column.index >= 3) {
      const cell = data.cell;

      // Check if cell contains our status placeholder
      if (cell.raw && typeof cell.raw === "string" && cell.raw.startsWith("STATUS:")) {
        const parts = cell.raw.replace("STATUS:", "").split("|");
        const status = parts[0];
        const time = parts[1] ?? "";

        applyCellStyling(doc, cell, status, time);

        // Clear the placeholder text (crucial for correct rendering)
        cell.text = [""];
      }
    }
  };

  // Fungsi untuk menerapkan styling pada sel
  const applyCellStyling = (doc: jsPDF, cell: any, status: string, time: string): void => {
    switch (status) {
      case "hadir":
        doc.setFillColor(144, 238, 144); // Light green
        doc.rect(cell.x, cell.y, cell.width, cell.height, "F");
        
        // Add time text for hadir
        if (time && time !== "Invalid Date") {
          addTextToCell(doc, time, cell, 0, 0, 0);
        }
        break;
        
      case "terlambat":
        doc.setFillColor(255, 255, 0); // Yellow
        doc.rect(cell.x, cell.y, cell.width, cell.height, "F");
        
        // Add time text for terlambat
        if (time && time !== "Invalid Date") {
          addTextToCell(doc, time, cell, 0, 0, 0);
        }
        break;
        
      case "alpha":
        doc.setFillColor(255, 99, 71); // Red
        doc.rect(cell.x, cell.y, cell.width, cell.height, "F");
        break;
        
      case "libur":
        doc.setFillColor(200, 200, 200); // Gray
        doc.rect(cell.x, cell.y, cell.width, cell.height, "F");
        addTextToCell(doc, "Libur", cell, 50, 50, 50);
        break;
        
      case "nodata":
        doc.setFillColor(240, 240, 240); // Light Gray
        doc.rect(cell.x, cell.y, cell.width, cell.height, "F");
        addTextToCell(doc, "", cell, 100, 100, 100);
        break;
    }
  };

  // Fungsi untuk menambahkan teks ke sel
  const addTextToCell = (
    doc: jsPDF, 
    text: string, 
    cell: any, 
    r: number, 
    g: number, 
    b: number
  ): void => {
    doc.setTextColor(r, g, b);
    doc.setFontSize(6);
    doc.text(
      text,
      cell.x + cell.width / 2,
      cell.y + cell.height / 2,
      {
        align: "center",
        baseline: "middle",
      }
    );
  };

  // Fungsi untuk menambahkan nomor halaman
  const addPageNumbers = (doc: jsPDF): void => {
    const pageCount = doc.internal.pages.length;
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        doc.internal.pageSize.getWidth() - 30,
        doc.internal.pageSize.getHeight() - 10
      );
    }
  };

  // Fungsi utama untuk export PDF
  const exportToPDF = (): void => {
    // Filter out superadmin users
    const filteredAttendanceData = attendanceData.filter(
      (user) => user.role.toLowerCase() !== "superadmin"
    );

    const doc = new jsPDF("landscape", "mm", "a4") as ExtendedJsPDF;

    // Setup basic document properties and design
    setupDocumentBasics(doc);
    addColorLegend(doc);

    // Process data by month
    const groupedDates = groupDatesByMonth(dates);
    let startY = 40;

    Object.entries(groupedDates).forEach(([monthYear, monthDates]) => {
      // Process each month's data and get the new Y position
      startY = processMonthData(doc, monthYear, monthDates, filteredAttendanceData, startY);

      // Add new page if needed for next month
      if (startY > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        startY = 20;
      }
    });

    // Add page numbers
    addPageNumbers(doc);

    // Save the PDF
    const filename = `Rekap_Absensi_${formatDateForFilename(new Date())}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="mt-6 print:hidden">
      <button
        onClick={exportToPDF}
        disabled={isDisabled}
        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Export ke PDF A4
      </button>
    </div>
  );
};

export default RekapAbsensiExport;
