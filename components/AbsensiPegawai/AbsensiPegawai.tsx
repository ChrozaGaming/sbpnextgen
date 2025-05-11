// app/components/AbsenPegawai.tsx
import React, { useState, useEffect } from "react";
import { Clock, Check, AlertTriangle, XCircle, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const AbsenPegawai = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [status, setStatus] = useState<"open" | "late" | "closed">("open");
  const [absensiStatus, setAbsensiStatus] = useState<{
    sudahAbsen: boolean;
    tanggal?: string;
    waktu?: string;
    status?: string;
  }>({ sudahAbsen: false });
  const [statusLoading, setStatusLoading] = useState(true);
  const { user } = useAuth();

  // Format tanggal untuk tampilan
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Format waktu untuk tampilan
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Periksa status absensi ketika komponen dimuat
  useEffect(() => {
    checkAbsensiStatus();
  }, []);

  // Update waktu saat ini setiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      updateAbsensiStatus(now);
    }, 1000);

    // Initial status check
    updateAbsensiStatus(new Date());

    return () => clearInterval(timer);
  }, []);

  // Periksa status absensi dari API
  const checkAbsensiStatus = async () => {
    try {
      setStatusLoading(true);
      const response = await fetch("/api/absensipegawai/status");

      if (!response.ok) {
        throw new Error("Gagal memuat status absensi");
      }

      const data = await response.json();
      setAbsensiStatus(data);
    } catch (err) {
      console.error("Error checking absensi status:", err);
    } finally {
      setStatusLoading(false);
    }
  };

  // Function untuk menentukan status absensi berdasarkan waktu saat ini
  const updateAbsensiStatus = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Batasi absensi hanya pada jam kerja (misalnya 07:00-17:00)
    if (hours < 7 || hours > 17) {
      setStatus("closed"); // Di luar jam kerja
    } else if (hours < 9 || (hours === 9 && minutes <= 30)) {
      setStatus("open"); // Sebelum 09:30 - Open
    } else if (hours === 9 && minutes > 30) {
      setStatus("late"); // Antara 09:31 - 10:00 - Late
    } else {
      setStatus("closed"); // Setelah 10:00 - Closed
    }
  };

  // Fungsi untuk submit absensi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status === "late" && !keterangan.trim()) {
      setError("Keterangan wajib diisi karena Anda terlambat");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/absensipegawai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keterangan }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Absensi berhasil dicatat!");
        setKeterangan("");
        // Setelah berhasil absen, refresh status absensi
        checkAbsensiStatus();
      } else {
        setError(data.message || "Gagal mencatat absensi");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mencatat absensi");
      console.error("Error submitting absensi:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mendapatkan informasi status absensi untuk tampilan
  const getStatusInfo = () => {
    // Jika sudah absen, tampilkan status dari data absensi
    if (absensiStatus.sudahAbsen) {
      const statusText =
        {
          hadir: "Hadir",
          terlambat: "Terlambat",
          alpha: "Alpha",
        }[absensiStatus.status || ""] || "Unknown";

      const statusColor =
        {
          hadir: "text-green-600 dark:text-green-400",
          terlambat: "text-amber-600 dark:text-amber-400",
          alpha: "text-red-600 dark:text-red-400",
        }[absensiStatus.status || ""] || "text-gray-600 dark:text-gray-400";

      const statusIcon = {
        hadir: <Check className="h-6 w-6 text-green-600 dark:text-green-400" />,
        terlambat: (
          <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        ),
        alpha: <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />,
      }[absensiStatus.status || ""] || (
        <Clock className="h-6 w-6 text-gray-600 dark:text-gray-400" />
      );

      return {
        text: `Anda Sudah Absen - ${statusText}`,
        color: statusColor,
        icon: statusIcon,
        description: `Absensi dilakukan pada pukul ${
          absensiStatus.waktu || "-"
        }`,
      };
    }

    // Jika belum absen, tampilkan status berdasarkan waktu saat ini
    if (status === "open") {
      return {
        text: "Silakan Absen Sekarang",
        color: "text-green-600 dark:text-green-400",
        icon: <Check className="h-6 w-6 text-green-600 dark:text-green-400" />,
        description:
          'Waktu absensi tersedia, status akan tercatat sebagai "Hadir"',
      };
    } else if (status === "late") {
      return {
        text: "Anda Terlambat",
        color: "text-amber-600 dark:text-amber-400",
        icon: (
          <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        ),
        description:
          'Waktu absensi telah lewat, status akan tercatat sebagai "Terlambat"',
      };
    } else {
      return {
        text: "Absensi Ditutup",
        color: "text-red-600 dark:text-red-400",
        icon: <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />,
        description:
          "Mohon tunggu sampai waktu untuk melakukan absensi telah tiba",
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-indigo-600 dark:bg-indigo-700 p-6 text-white">
          <h1 className="text-2xl font-bold">Absensi Pegawai</h1>
          <p className="mt-2 opacity-80">
            {user?.name
              ? `Selamat datang, ${user.name}`
              : "Silahkan lakukan absensi hari ini"}
          </p>
        </div>

        {/* Time and Date Display */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tanggal
                </p>
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  {formatDate(currentTime)}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Waktu Saat Ini - WIB
                </p>
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  {formatTime(currentTime)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status information */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            {statusLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-3"></div>
                <div>Memuat status absensi...</div>
              </div>
            ) : (
              <>
                <span
                  className={`flex items-center justify-center h-10 w-10 rounded-full bg-opacity-20 dark:bg-opacity-20 mr-3 ${statusInfo.color.replace(
                    "text",
                    "bg"
                  )}`}
                >
                  {statusInfo.icon}
                </span>
                <div>
                  <h2 className={`text-lg font-medium ${statusInfo.color}`}>
                    {statusInfo.text}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {statusInfo.description}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Jika sudah absen, tampilkan detail absensi */}
        {!statusLoading && absensiStatus.sudahAbsen && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-4">
              Detail Absensi Hari Ini
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tanggal
                  </p>
                  <p className="font-medium">{absensiStatus.tanggal}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Waktu Absen
                  </p>
                  <p className="font-medium">{absensiStatus.waktu}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Status
                  </p>
                  <p
                    className={`font-medium ${
                      absensiStatus.status === "hadir"
                        ? "text-green-600 dark:text-green-400"
                        : absensiStatus.status === "terlambat"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {absensiStatus.status === "hadir"
                      ? "Hadir"
                      : absensiStatus.status === "terlambat"
                      ? "Terlambat"
                      : "Alpha"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Form - hanya tampilkan jika belum absen */}
        {!absensiStatus.sudahAbsen && (
          <form onSubmit={handleSubmit} className="p-6">
            {/* Information/Warnings */}
            {status === "late" && (
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-amber-800 dark:text-amber-300 text-sm">
                  Anda terlambat. Silakan berikan keterangan untuk keterlambatan
                  Anda.
                </p>
              </div>
            )}
            {status === "closed" && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-300 text-sm">
                  Maaf, waktu absensi telah ditutup. Anda dinyatakan alpha untuk
                  hari ini jika belum absen.
                </p>
              </div>
            )}

            {/* Feedback messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-300 text-sm">
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-300 text-sm">
                  {success}
                </p>
              </div>
            )}

            {/* Keterangan input field */}
            <div className="mb-6">
              <label
                htmlFor="keterangan"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Keterangan{" "}
                {status === "late" && <span className="text-red-500">*</span>}
              </label>
              <textarea
                id="keterangan"
                name="keterangan"
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Masukkan keterangan (opsional)"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                required={status === "late"}
              />
              {status === "late" && (
                <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                  Keterangan wajib diisi karena Anda terlambat
                </p>
              )}
            </div>

            {/* Submit button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || status === "closed" || success !== ""}
                className={`py-2 px-6 rounded-lg font-medium transition-all ${
                  status === "closed" || success !== ""
                    ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 dark:bg-indigo-700 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95"
                }`}
              >
                {loading ? "Memproses..." : "Absen Sekarang"}
              </button>
            </div>
          </form>
        )}

        {/* Info text */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/40 text-xs text-gray-500 dark:text-gray-400">
          <p>Catatan:</p>
          <ul className="list-disc list-inside mt-1 ml-2 space-y-1">
            <li>09:00 - 09:30 WIB: Status Hadir</li>
            <li>
              09:31 - 10:00 WIB: Status Terlambat (wajib dengan keterangan)
            </li>
            <li>Diatas 10:00 WIB: Status Alpha (absensi ditutup)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AbsenPegawai;
