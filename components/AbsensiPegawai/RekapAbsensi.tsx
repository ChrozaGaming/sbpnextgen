"use client";

import React, { useState, useEffect } from 'react';
import RekapAbsensiExport from '@/components/RekapAbsensiExport';

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

const RekapAbsensi: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [useMonthFilter, setUseMonthFilter] = useState<boolean>(true); // Default to monthly view
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dates, setDates] = useState<string[]>([]);
  const [attendanceData, setAttendanceData] = useState<UserAttendance[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Set current month on load
  useEffect(() => {
    const currentDate = new Date();
    setMonth((currentDate.getMonth() + 1).toString());
  }, []);

  // Define months for dropdown
  const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' }
  ];

  // Get years for dropdown (last 5 years)
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Filter out superadmin users
  const filteredAttendanceData = attendanceData.filter(
    (user) => user.role.toLowerCase() !== "superadmin"
  );

  // Function to check if a date is a weekend (Saturday or Sunday)
  const isWeekend = (dateString: string): boolean => {
    const date = new Date(dateString);
    const day = date.getDay(); // 0 is Sunday, 6 is Saturday
    return day === 0 || day === 6;
  };

  const fetchAttendanceData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = useMonthFilter 
        ? { month: parseInt(month), year: parseInt(year) }
        : { startDate, endDate };
      console.log("Fetching with params:", params);
      const response = await fetch('/api/absensipegawai/rekapabsensi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? 'Failed to fetch attendance data');
      }

      const data = await response.json();
      console.log("Received data:", data);
      setDates(data.dates ?? []);
      // Process the attendance data to set weekend days to "libur"
      const processedAttendanceData = (data.attendanceData ?? []).map((user: UserAttendance) => ({
        ...user,
        attendance: (user.attendance || []).map((record: AttendanceRecord) => ({
          ...record,
          // If it's a weekend day, set status to "libur" regardless of the original value
          status: isWeekend(record.date) ? "libur" : record.status
        }))
      }));
      setAttendanceData(processedAttendanceData);
      // Log status distribution for debugging
      const statusCounts = { hadir: 0, terlambat: 0, alpha: 0, libur: 0, other: 0 };
      processedAttendanceData.forEach((user: UserAttendance) => {
        user.attendance?.forEach((record: AttendanceRecord) => {
          if (record.status === 'hadir') statusCounts.hadir++;
          else if (record.status === 'terlambat') statusCounts.terlambat++;
          else if (record.status === 'alpha') statusCounts.alpha++;
          else if (record.status === 'libur') statusCounts.libur++;
          else statusCounts.other++;
        });
      });
      console.log("Status distribution:", statusCounts);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil data absensi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAttendanceData();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });
  };

  // Enhanced date formatting to show day name
  const formatDateWithDay = (dateString: string) => {
    const date = new Date(dateString);
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const dayName = dayNames[date.getDay()];
    return `${dayName}, ${formatDate(dateString)}`;
  };

  const getStatusClass = (status: string) => {
    const normalizedStatus = status?.toLowerCase()?.trim() || '';
    switch (normalizedStatus) {
      case 'hadir':
        return 'bg-green-100 text-green-800';
      case 'terlambat':
        return 'bg-yellow-100 text-yellow-800';
      case 'alpha':
        return 'bg-red-100 text-red-800';
      case 'libur':
        return 'bg-blue-100 text-blue-800';
      default:
        console.warn(`Unknown status encountered: ${status}`);
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const normalizedStatus = status?.toLowerCase()?.trim() || '';
    switch (normalizedStatus) {
      case 'hadir':
        return 'Hadir';
      case 'terlambat':
        return 'Terlambat';
      case 'alpha':
        return 'Alpha';
      case 'libur':
        return 'Hari Libur'; // Changed from 'Libur' to 'Hari Libur'
      default:
        console.warn(`Unknown status label encountered: ${status}`);
        return status || 'Unknown';
    }
  };

  // Get report title for PDF export
  const getReportTitle = () => {
    if (useMonthFilter) {
      const monthName = months.find(m => m.value === parseInt(month))?.label ?? '';
      return `Rekap Bulan ${monthName} ${year}`;
    } else {
      return `Rekap ${startDate} - ${endDate}`;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Rekap Absensi Pegawai</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="useMonthFilter"
              checked={useMonthFilter}
              onChange={(e) => setUseMonthFilter(e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600"
            />
            <label htmlFor="useMonthFilter" className="text-sm font-medium">
              Rekap Bulanan
            </label>
          </div>

          {useMonthFilter ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="month-select" className="block text-sm font-medium mb-1">Bulan</label>
                <select
                  id="month-select"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Pilih Bulan</option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="year-select" className="block text-sm font-medium mb-1">Tahun</label>
                <select
                  id="year-select"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium mb-1">Tanggal Mulai</label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium mb-1">Tanggal Akhir</label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isLoading ? 'Loading...' : 'Tampilkan Rekap'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      {dates.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-auto">
          <div className="print:hidden p-4 bg-gray-50 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {getReportTitle()}
              </h2>
              <div className="text-sm text-gray-500">
                Total: {filteredAttendanceData.length} pegawai
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-100 print:hidden">
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-green-100 border border-green-800 mr-1"></span>
                <span className="text-xs text-gray-700">Hadir</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-yellow-100 border border-yellow-800 mr-1"></span>
                <span className="text-xs text-gray-700">Terlambat</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-red-100 border border-red-800 mr-1"></span>
                <span className="text-xs text-gray-700">Alpha</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-100 border border-blue-800 mr-1"></span>
                <span className="text-xs text-gray-700">Hari Libur (Sabtu/Minggu)</span>
              </div>
            </div>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th scope="col" className="sticky left-16 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Pegawai
                </th>
                {dates.map((date) => {
                  const isWeekendDay = isWeekend(date);
                  return (
                    <th 
                      key={date} 
                      scope="col" 
                      className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                        isWeekendDay ? 'bg-blue-50 text-blue-700' : 'text-gray-500'
                      }`}
                    >
                      {formatDateWithDay(date)}
                      {isWeekendDay && (
                        <div className="text-blue-700 text-[10px] font-normal mt-1">
                          Hari Libur
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendanceData.map((user: UserAttendance, index: number) => (
                <tr key={user.userId}>
                  <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="sticky left-16 z-10 bg-white px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                    <div className="text-sm text-gray-500">{user.role}</div>
                  </td>
                  {user.attendance.map((record: AttendanceRecord) => {
                    const isWeekendDay = isWeekend(record.date);
                    return (
                      <td 
                        key={`${user.userId}-${record.date}`} 
                        className={`px-6 py-4 whitespace-nowrap text-sm text-center ${isWeekendDay ? 'bg-blue-50' : ''}`}
                      >
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(record.status)}`}>
                          {getStatusLabel(record.status)}
                        </span>
                        {!isWeekendDay && record.waktuAbsen && (
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(`2000-01-01T${record.waktuAbsen}`).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Export to PDF component */}
      {dates.length > 0 && (
        <RekapAbsensiExport
          title={getReportTitle()}
          dates={dates}
          attendanceData={filteredAttendanceData}
          isDisabled={isLoading}
          isWeekend={isWeekend} // Pass the isWeekend function to the export component
        />
      )}
    </div>
  );
};

export default RekapAbsensi;
