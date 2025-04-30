-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Waktu pembuatan: 16 Feb 2025 pada 09.42
-- Versi server: 8.0.31
-- Versi PHP: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sbp`
--

DELIMITER $$
--
-- Prosedur
--
DROP PROCEDURE IF EXISTS `add_stock_in`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_stock_in` (IN `p_kode` VARCHAR(50), IN `p_jumlah` INT, IN `p_tanggal_masuk` DATE)   BEGIN
    UPDATE stok
    SET stok_masuk = stok_masuk + p_jumlah,
        stok_sisa = stok_sisa + p_jumlah,
        tanggal_masuk = p_tanggal_masuk,
        updated_at = CURRENT_TIMESTAMP
    WHERE kode = p_kode;
END$$

DROP PROCEDURE IF EXISTS `reduce_stock`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `reduce_stock` (IN `p_kode` VARCHAR(50), IN `p_jumlah` INT, IN `p_tanggal_keluar` DATE)   BEGIN
    UPDATE stok
    SET stok_keluar = stok_keluar + p_jumlah,
        stok_sisa = stok_sisa - p_jumlah,
        tanggal_keluar = p_tanggal_keluar,
        updated_at = CURRENT_TIMESTAMP
    WHERE kode = p_kode AND stok_sisa >= p_jumlah;
END$$

DROP PROCEDURE IF EXISTS `reset_all_autoincrement`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `reset_all_autoincrement` ()   BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE table_name VARCHAR(255);
    DECLARE cur CURSOR FOR
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = DATABASE(); -- Gunakan database saat ini

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO table_name;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Periksa apakah tabel kosong
        SET @row_count_query = CONCAT('SELECT COUNT(*) INTO @row_count FROM ', table_name);
        PREPARE stmt_row_count FROM @row_count_query;
        EXECUTE stmt_row_count;
        DEALLOCATE PREPARE stmt_row_count;

        -- Reset auto-increment jika tabel kosong
        IF @row_count = 0 THEN
            SET @reset_query = CONCAT('ALTER TABLE ', table_name, ' AUTO_INCREMENT = 1');
            PREPARE stmt_reset FROM @reset_query;
            EXECUTE stmt_reset;
            DEALLOCATE PREPARE stmt_reset;
        END IF;
    END LOOP;

    CLOSE cur;
END$$

DROP PROCEDURE IF EXISTS `reset_autoincrement`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `reset_autoincrement` (IN `table_name` VARCHAR(255))   BEGIN
    SET @query = CONCAT('ALTER TABLE ', table_name, ' AUTO_INCREMENT = 1');
    PREPARE stmt FROM @query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$

DROP PROCEDURE IF EXISTS `reset_surat_jalan_autoincrement`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `reset_surat_jalan_autoincrement` ()   BEGIN
    SET @query = 'ALTER TABLE surat_jalan AUTO_INCREMENT = 1';
    PREPARE stmt FROM @query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$

DROP PROCEDURE IF EXISTS `reset_table_autoincrement`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `reset_table_autoincrement` (`table_name` VARCHAR(255))   BEGIN
    SET @query = CONCAT('ALTER TABLE ', table_name, ' AUTO_INCREMENT = 1');
    PREPARE stmt FROM @query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `barang_surat_jalan`
--

DROP TABLE IF EXISTS `barang_surat_jalan`;
CREATE TABLE IF NOT EXISTS `barang_surat_jalan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `surat_jalan_id` int NOT NULL,
  `barang_id` int NOT NULL,
  `jumlah` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `surat_jalan_id` (`surat_jalan_id`),
  KEY `barang_id` (`barang_id`)
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `barang_surat_jalan`
--

INSERT INTO `barang_surat_jalan` (`id`, `surat_jalan_id`, `barang_id`, `jumlah`) VALUES
(2, 2, 31, 1),
(3, 3, 31, 1),
(4, 4, 37, 1),
(5, 5, 37, 3),
(6, 6, 33, 1),
(7, 7, 33, 1),
(8, 11, 37, 1),
(9, 11, 32, 3),
(10, 12, 37, 1),
(11, 12, 32, 1),
(12, 12, 36, 5);

-- --------------------------------------------------------

--
-- Struktur dari tabel `kategori_material`
--

DROP TABLE IF EXISTS `kategori_material`;
CREATE TABLE IF NOT EXISTS `kategori_material` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(50) NOT NULL,
  `keterangan` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `kategori_material`
--

INSERT INTO `kategori_material` (`id`, `nama`, `keterangan`, `created_at`, `updated_at`) VALUES
(1, 'Material', 'Kategori untuk material epoxy', '2024-12-18 16:51:21', '2024-12-18 16:51:21'),
(2, 'Alat', 'Kategori untuk peralatan kerja', '2024-12-18 16:51:21', '2024-12-18 16:51:21'),
(3, 'Consumable', 'Kategori untuk barang habis pakai', '2024-12-18 16:51:21', '2024-12-18 16:51:21');

-- --------------------------------------------------------

--
-- Struktur dari tabel `purchase_orders`
--

DROP TABLE IF EXISTS `purchase_orders`;
CREATE TABLE IF NOT EXISTS `purchase_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `po_number` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `supplier` varchar(100) NOT NULL,
  `address` text NOT NULL,
  `attention` varchar(100) DEFAULT NULL,
  `note` text,
  `shipping_address` text NOT NULL,
  `bank` varchar(100) DEFAULT NULL,
  `account` varchar(100) DEFAULT NULL,
  `attention_pay_term` varchar(100) DEFAULT NULL,
  `order_by` varchar(100) NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `subtotal` decimal(15,2) NOT NULL,
  `tax` decimal(15,2) NOT NULL,
  `grand_total` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `purchase_orders`
--

INSERT INTO `purchase_orders` (`id`, `po_number`, `date`, `supplier`, `address`, `attention`, `note`, `shipping_address`, `bank`, `account`, `attention_pay_term`, `order_by`, `total_amount`, `subtotal`, `tax`, `grand_total`, `created_at`, `updated_at`) VALUES
(1, 'ada', '2025-02-10', 'dada', 'adadad', 'dada', 'UP Bp. Wasdi', 'dad', '', '', '', 'Vina', '200000.00', '200000.00', '22000.00', '222000.00', '2025-02-10 14:06:11', '2025-02-10 14:06:11'),
(2, 'xaxaxa', '2025-02-10', 'dxaxax', 'xaxax', 'axax', 'axax', 'axax', 'BCA', '0183635414', 'HILMY RAIHAN ALKINDY', 'Wiwik', '90000.00', '90000.00', '9900.00', '99900.00', '2025-02-10 14:11:52', '2025-02-10 14:11:52');

-- --------------------------------------------------------

--
-- Struktur dari tabel `purchase_order_items`
--

DROP TABLE IF EXISTS `purchase_order_items`;
CREATE TABLE IF NOT EXISTS `purchase_order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `purchase_order_id` int NOT NULL,
  `item_description` text NOT NULL,
  `item_code` varchar(50) NOT NULL,
  `quantity` int NOT NULL,
  `unit` enum('kg','kgset','pail','galon5liter','galon10liter','pcs','lonjor','liter','literset','sak','unit') NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `purchase_order_id` (`purchase_order_id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `purchase_order_items`
--

INSERT INTO `purchase_order_items` (`id`, `purchase_order_id`, `item_description`, `item_code`, `quantity`, `unit`, `unit_price`, `amount`) VALUES
(1, 1, 'adad', 'adada', 4, 'kg', '50000.00', '200000.00'),
(2, 2, 'adada', 'dada', 3, 'pail', '30000.00', '90000.00');

-- --------------------------------------------------------

--
-- Struktur dari tabel `rekap_po`
--

DROP TABLE IF EXISTS `rekap_po`;
CREATE TABLE IF NOT EXISTS `rekap_po` (
  `id` int NOT NULL AUTO_INCREMENT,
  `no_po` varchar(50) DEFAULT NULL,
  `judulPO` varchar(255) DEFAULT NULL,
  `tanggal` date DEFAULT NULL,
  `status` decimal(10,2) DEFAULT NULL,
  `progress` enum('onprogress','finish') DEFAULT 'onprogress',
  `nilai_penawaran` decimal(15,2) DEFAULT NULL,
  `nilai_po` decimal(15,2) DEFAULT NULL,
  `biaya_pelaksanaan` decimal(15,2) DEFAULT NULL,
  `profit` decimal(15,2) DEFAULT NULL,
  `keterangan` varchar(255) DEFAULT NULL,
  `nama_perusahaan` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `rekap_po`
--

INSERT INTO `rekap_po` (`id`, `no_po`, `judulPO`, `tanggal`, `status`, `progress`, `nilai_penawaran`, `nilai_po`, `biaya_pelaksanaan`, `profit`, `keterangan`, `nama_perusahaan`) VALUES
(15, '4502011189', 'JASA GANTI TALANG INPUTAN THERMAL#2', '2024-01-23', '82.88', 'finish', '6675000.00', '6675000.00', '3650000.00', '3025000.00', '', 'PT TRIAS SENTOSA KRIAN'),
(16, '4508003437', 'BIO SEPTIC TANK TOILET METZ#3 KAPASITAS 5000 LTR', '2024-02-16', '44.16', 'finish', '58000000.00', '58000000.00', '40233000.00', '17767000.00', '', 'PT TRIAS SENTOSA KRIAN'),
(17, '4502011 - 394 DAN 395', 'MODIFIKASI PONDASI CHILLER', '2024-03-27', '74.23', 'onprogress', '26134250.00', '26134250.00', '15000000.00', '11134250.00', '', 'PT TRIAS SENTOSA KRIAN'),
(19, '4502011838', 'PEMBUATAN BAK KONTROL PIT CABLE MDB PET#2', '2024-08-15', '83.62', 'onprogress', '5325000.00', '5325000.00', '2900000.00', '2425000.00', '', 'PT TRIAS SENTOSA KRIAN');

-- --------------------------------------------------------

--
-- Struktur dari tabel `sessions`
--

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_token` (`token`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `token`, `created_at`, `expires_at`, `is_active`) VALUES
(16, 5, '59ec23d73aade84928458e32aab0d29da26544d47fe2a169ecfc2c4313e0cfd7', '2024-12-18 07:08:07', '2024-12-19 07:08:08', 1),
(17, 5, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImVtYWlsIjoicHJhc0BnbWFpbC5jb20iLCJpYXQiOjE3MzQ1MDU3NzQsImV4cCI6MTczNDU5MjE3NH0.GB7HweXhO40XLNT48LuRs3CBFxSnWqUX0jU-nkbV6Zg', '2024-12-18 07:09:34', '2024-12-19 07:09:34', 1),
(18, 5, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImVtYWlsIjoicHJhc0BnbWFpbC5jb20iLCJpYXQiOjE3MzQ1MDYwOTAsImV4cCI6MTczNDU5MjQ5MH0.fEMaRxFfHfav8NzkazyzKyUarbZZScmaTLGUuzcqMdE', '2024-12-18 07:14:50', '2024-12-19 07:14:50', 1),
(19, 5, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImVtYWlsIjoicHJhc0BnbWFpbC5jb20iLCJpYXQiOjE3MzQ1MDYxMTYsImV4cCI6MTczNDU5MjUxNn0.zT2YCNIQHONxw1m2qO9d_0jRRwvh1IJhUrQ9WTF2P1I', '2024-12-18 07:15:16', '2024-12-19 07:15:16', 1);

-- --------------------------------------------------------

--
-- Struktur dari tabel `stok`
--

DROP TABLE IF EXISTS `stok`;
CREATE TABLE IF NOT EXISTS `stok` (
  `id` int NOT NULL AUTO_INCREMENT,
  `kode` varchar(50) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `kategori` enum('material','alat','consumable') NOT NULL,
  `sub_kategori_id` int NOT NULL,
  `stok_masuk` int DEFAULT '0',
  `stok_keluar` int DEFAULT '0',
  `stok_sisa` int DEFAULT '0',
  `satuan` enum('kg','kgset','pail','galon5liter','galon10liter','pcs','lonjor','liter','literset','sak','unit') NOT NULL,
  `lokasi` varchar(50) NOT NULL,
  `tanggal_entry` date NOT NULL,
  `tanggal_masuk` date DEFAULT NULL,
  `tanggal_keluar` date DEFAULT NULL,
  `keterangan` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode` (`kode`),
  KEY `sub_kategori_id` (`sub_kategori_id`),
  KEY `idx_kategori` (`kategori`),
  KEY `idx_tanggal_entry` (`tanggal_entry`)
) ENGINE=MyISAM AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `stok`
--

INSERT INTO `stok` (`id`, `kode`, `nama`, `kategori`, `sub_kategori_id`, `stok_masuk`, `stok_keluar`, `stok_sisa`, `satuan`, `lokasi`, `tanggal_entry`, `tanggal_masuk`, `tanggal_keluar`, `keterangan`, `created_at`, `updated_at`) VALUES
(37, 'PFT-253-2K-SB-Pastel', 'Top Coat PFT-253-2K SB Pastel Green', 'material', 131, 9, 6, 3, 'kgset', 'RAK A-1', '2025-01-14', '2025-01-15', NULL, 'pembelian', '2025-01-14 17:38:36', '2025-01-15 03:15:17'),
(31, 'PFT-253-2K-SB-LeafGr', 'Top Coat PFT-253-2K SB Leaf Green', 'alat', 128, 3, 1, 0, 'kgset', 'RAK A-2', '2024-12-24', '2024-12-24', NULL, 'returbarangproyek', '2024-12-24 08:20:48', '2025-01-14 17:35:41'),
(32, 'GEH-006', 'Epoxy Self Levelling A (Varian)', 'material', 137, 8, 4, 4, 'kg', 'RAK A-1', '2024-12-24', '2024-12-24', NULL, 'returbarangproyek', '2024-12-24 08:21:01', '2025-01-15 03:15:17'),
(33, 'SF-PU-CT2-Clear', 'SF-PU-CT2 Clear', 'material', 125, 3, 2, 1, 'kgset', 'RAK A-1', '2024-12-24', '2024-12-24', NULL, 'returbarangproyek', '2024-12-24 08:21:12', '2025-01-15 02:50:39'),
(34, 'MAT001', 'Besi Beton', 'material', 1, 100, 20, 80, 'lonjor', 'Gudang A', '2024-12-01', '2024-12-01', NULL, 'Material bangunan untuk struktur.', '2024-12-24 08:22:26', '2024-12-24 08:22:26'),
(35, 'ALT001', 'Bor Listrik', 'alat', 2, 5, 2, 3, 'unit', 'Gudang B', '2024-12-02', '2024-12-02', NULL, 'Alat untuk pengeboran.', '2024-12-24 08:22:26', '2024-12-24 08:22:26'),
(36, 'CON001', 'Cat Tembok', 'consumable', 3, 50, 15, 35, 'galon10liter', 'Gudang C', '2024-12-03', '2024-12-03', NULL, 'Cat untuk tembok interior.', '2024-12-24 08:22:26', '2025-01-15 03:15:17');

-- --------------------------------------------------------

--
-- Struktur dari tabel `stok_gudang`
--

DROP TABLE IF EXISTS `stok_gudang`;
CREATE TABLE IF NOT EXISTS `stok_gudang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sub_kategori_id` int NOT NULL,
  `kode` varchar(50) NOT NULL,
  `stok_masuk` int NOT NULL DEFAULT '0',
  `stok_keluar` int NOT NULL DEFAULT '0',
  `tanggal_masuk` date DEFAULT NULL,
  `tanggal_keluar` date DEFAULT NULL,
  `keterangan` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sub_kategori_id` (`sub_kategori_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `sub_kategori_material`
--

DROP TABLE IF EXISTS `sub_kategori_material`;
CREATE TABLE IF NOT EXISTS `sub_kategori_material` (
  `id` int NOT NULL AUTO_INCREMENT,
  `kategori_id` int NOT NULL,
  `kode_item` varchar(20) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `satuan` enum('kg','kgset','pail','galon5liter','galon10liter','pcs','lonjor','liter','literset','sak','unit') NOT NULL,
  `status` enum('aman','rusak','cacat','sisa') DEFAULT 'aman',
  `keterangan` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `kategori_id` (`kategori_id`),
  KEY `idx_kode_item` (`kode_item`)
) ENGINE=MyISAM AUTO_INCREMENT=151 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `sub_kategori_material`
--

INSERT INTO `sub_kategori_material` (`id`, `kategori_id`, `kode_item`, `nama`, `brand`, `satuan`, `status`, `keterangan`, `created_at`, `updated_at`) VALUES
(140, 1, 'GHDS-2400-M', 'Epoxy Mortar', 'GYUNG DO', 'kg', 'aman', 'Epoxy Mortar dengan ratio 4:2, harga normal Rp 68.000/kg, harga per galon Rp 272.000', '2024-12-24 01:41:10', '2024-12-24 01:41:10'),
(141, 1, 'GEH-007', 'Epoxy Mortar (Varian)', 'GYUNG DO', 'kg', 'aman', 'Epoxy Mortar dengan ratio 2:1, harga normal Rp 145.000/kg, harga per galon Rp 290.000', '2024-12-24 01:41:10', '2024-12-24 01:41:10'),
(142, 1, 'GHDF-1544-Series', 'Acrylic Urethane Finish', 'GYUNG DO', 'pail', 'aman', 'Acrylic Urethane Finish dengan ratio 5:0,5, harga normal Rp 116.000/kg, diskon Rp 580.000', '2024-12-24 01:41:10', '2024-12-24 01:41:10'),
(143, 1, 'HAD-6227', 'Acrylic Urethane Finish (Varian)', 'GYUNG DO', 'pail', 'aman', 'Acrylic Urethane Finish dengan ratio 0,5, harga normal Rp 253.000/kg, diskon Rp 126.500', '2024-12-24 01:41:10', '2024-12-24 01:41:10'),
(138, 1, 'GHDS-3400-Series', 'Epoxy Self Levelling B', 'GYUNG DO', 'kg', 'aman', 'Epoxy Self Levelling dengan ratio 6:1, harga normal Rp 70.000/kg, harga per galon Rp 420.000', '2024-12-24 01:41:10', '2024-12-24 01:41:10'),
(139, 1, 'GHDS-4400-Series', 'Epoxy Self Levelling C', 'GYUNG DO', 'kg', 'aman', 'Epoxy Self Levelling dengan ratio 4:2, harga normal Rp 90.000/kg, harga per galon Rp 666.000', '2024-12-24 01:41:10', '2024-12-24 01:41:10'),
(137, 1, 'GEH-006', 'Epoxy Self Levelling A (Varian)', 'GYUNG DO', 'kg', 'aman', 'Epoxy Self Levelling dengan ratio 1:1, harga normal Rp 153.000/kg, harga per galon Rp 463.000', '2024-12-24 01:41:10', '2024-12-24 01:41:10'),
(144, 1, 'EPT-060-MK', 'Thinner EPT-060-MK', 'GYUNG DO', 'kg', 'aman', 'Thinner dengan ratio 20:1, harga normal Rp 29.000/kg, harga per galon Rp 580.000', '2024-12-24 01:41:10', '2024-12-24 01:41:10'),
(136, 1, 'GHDS-2400-Series', 'Epoxy Self Levelling A', 'GYUNG DO', 'kg', 'aman', 'Epoxy Self Levelling dengan ratio 5:1, harga normal Rp 62.000/kg, harga per galon Rp 310.000', '2024-12-24 01:41:10', '2024-12-24 01:41:10'),
(131, 1, 'PFT-253-2K-SB-Pastel', 'Top Coat PFT-253-2K SB Pastel Green', 'PROPAN', 'kgset', 'aman', 'Top Coat warna Pastel Green RAL 6019, kemasan 20ksp, harga normal Rp 3.243.243/kg, diskon Rp 2.340.000', '2024-12-24 01:38:07', '2024-12-24 01:38:07'),
(132, 1, 'GHDF-1400-Clear', 'Epoxy Primer Clear', 'GYUNG DO', 'kg', 'aman', 'Epoxy Primer dengan ratio 4:1, harga normal Rp 54.000/kg, harga per galon Rp 216.000', '2024-12-24 01:41:10', '2024-12-24 01:41:10'),
(129, 1, 'PFT-253-2K-SB-MaizeY', 'Top Coat PFT-253-2K SB Maize Yellow', 'PROPAN', 'kgset', 'aman', 'Top Coat warna Maize Yellow 2328, kemasan 20ksp, harga normal Rp 3.243.243/kg, diskon Rp 2.340.000', '2024-12-24 01:38:07', '2024-12-24 01:38:07'),
(130, 1, 'PFT-253-2K-SB-Traffi', 'Top Coat PFT-253-2K SB Traffic Yellow', 'PROPAN', 'kgset', 'aman', 'Top Coat warna Traffic Yellow, kemasan 20ksp, harga normal Rp 3.891.892/kg, diskon Rp 2.808.000', '2024-12-24 01:38:07', '2024-12-24 01:38:07'),
(128, 2, 'PFT-253-2K-SB-LeafGr', 'Top Coat PFT-253-2K SB Leaf Green', 'PROPAN', 'kgset', 'aman', 'Top Coat warna Leaf Green 8416, kemasan 20ksp, harga normal Rp 3.243.243/kg, diskon Rp 2.340.000', '2024-12-24 01:38:07', '2024-12-24 03:07:28'),
(126, 1, 'SF-PU-CT2-2', 'SF-PU-CT2 (Non Warna Tunggal)', 'S&G', 'kgset', 'aman', 'Epoxy PU ratio 4:2 dengan varian non warna tunggal, harga normal Rp 300.000/kg', '2024-12-24 01:35:30', '2024-12-24 01:35:30'),
(125, 1, 'SF-PU-CT2-Clear', 'SF-PU-CT2 Clear', 'S&G', 'kgset', 'aman', 'Epoxy PU Clear dengan ratio 4:2, harga normal Rp 300.000/kg', '2024-12-24 01:35:30', '2024-12-24 01:35:30'),
(123, 1, 'SF-PU-CT2-1mm', 'SF-PU-CT2 1mm', 'S&G', 'kgset', 'aman', 'Epoxy PU dengan ratio 4:2:10, harga normal Rp 110.000/kg', '2024-12-24 01:35:30', '2024-12-24 01:35:30'),
(124, 1, 'SF-PU-CT2', 'SF-PU-CT2', 'S&G', 'kgset', 'aman', 'Epoxy PU dengan ratio 4:2, harga normal Rp 330.000/kg', '2024-12-24 01:35:30', '2024-12-24 01:35:30'),
(114, 1, 'SF-67', 'SF-67 Anti Kimia', 'S&G', 'kgset', 'aman', 'Epoxy anti kimia dengan ratio 5:2, harga normal Rp 400.000/kg', '2024-12-24 01:35:30', '2024-12-24 01:35:30'),
(115, 1, 'SF-SC10', 'SF-SC10', 'S&G', 'kgset', 'aman', 'Epoxy dengan ratio 5:0,5, harga normal Rp 120.000/kg', '2024-12-24 01:35:30', '2024-12-24 01:35:30'),
(116, 1, 'SF-SC10-1', 'SF-SC10 (Varian)', 'S&G', 'kgset', 'aman', 'Epoxy dengan ratio 5:1, harga normal Rp 120.000/kg', '2024-12-24 01:35:30', '2024-12-24 01:35:30'),
(117, 1, 'SF-16W', 'SF-16W', 'S&G', 'kgset', 'aman', 'Epoxy dengan ratio 5:1, harga normal Rp 180.000/kg', '2024-12-24 01:35:30', '2024-12-24 01:35:30'),
(118, 1, 'SF-17W', 'SF-17W', 'S&G', 'kgset', 'aman', 'Epoxy dengan ratio 5:1, harga normal Rp 205.000/kg', '2024-12-24 01:35:30', '2024-12-24 01:35:30'),
(119, 1, 'SF-29W', 'SF-29W', 'S&G', 'kgset', 'aman', 'Epoxy dengan ratio 5:0,5, harga normal Rp 120.000/kg', '2024-12-24 01:35:30', '2024-12-24 01:35:30'),
(120, 1, 'SF-P1W', 'SF-P1W', 'S&G', 'kgset', 'aman', 'Epoxy dengan ratio 5:1, harga normal Rp 205.000/kg', '2024-12-24 01:35:30', '2024-12-24 01:35:30'),
(121, 1, 'SF-ICR-EP', 'SF-ICR EP', 'S&G', 'kgset', 'aman', 'Epoxy dengan ratio 3,5:1,5:15,5, harga normal Rp 50.000/kg', '2024-12-24 01:35:30', '2024-12-24 01:35:30'),
(122, 1, 'SF-ICR-PU-MF', 'SF-ICR PU MF', 'S&G', 'kgset', 'aman', 'Epoxy PU dengan ratio 3,5:1,4:10, harga normal Rp 80.000/kg', '2024-12-24 01:35:30', '2024-12-24 01:35:30'),
(106, 1, 'SF-P1-Clear', 'SF-P1 Clear', 'S&G', 'kgset', 'aman', 'Epoxy dengan ratio 4:1, harga normal Rp 170.000/kg', '2024-12-24 01:35:30', '2024-12-24 01:35:30'),
(107, 1, 'SF-P2-Clear', 'SF-P2 Clear', 'S&G', 'kgset', 'aman', 'Epoxy dengan ratio 4:2, harga normal Rp 325.000/kg', '2024-12-24 01:35:30', '2024-12-24 01:35:30'),
(108, 1, 'SF-10', 'SF-10', 'S&G', 'kgset', 'aman', 'Epoxy dengan ratio 5:1, harga normal Rp 210.000/kg', '2024-12-24 01:35:30', '2024-12-24 01:35:30'),
(109, 1, 'SF-M30', 'SF-M30', 'S&G', 'kgset', 'aman', 'Epoxy dengan ratio 5:1, harga normal Rp 245.000/kg', '2024-12-24 01:35:30', '2024-12-24 01:35:30'),
(110, 1, 'SF-11', 'SF-11', 'S&G', 'kgset', 'aman', 'Epoxy dengan ratio 6:1, harga normal Rp 195.000/kg', '2024-12-24 01:35:30', '2024-12-24 01:35:30'),
(111, 1, 'SF-18', 'SF-18', 'S&G', 'kgset', 'aman', 'Epoxy dengan ratio 6:1,5, harga normal Rp 200.000/kg', '2024-12-24 01:35:30', '2024-12-24 01:35:30'),
(112, 1, 'SF-22', 'SF-22', 'S&G', 'kgset', 'aman', 'Epoxy dengan ratio 6:1,5, harga normal Rp 210.000/kg', '2024-12-24 01:35:30', '2024-12-24 01:35:30'),
(113, 1, 'SF-25', 'SF-25', 'S&G', 'kgset', 'aman', 'Epoxy dengan ratio 6:2, harga normal Rp 230.000/kg', '2024-12-24 01:35:30', '2024-12-24 01:35:30'),
(145, 1, 'GUT-021-S', 'Thinner GUT-021-S', 'GYUNG DO', 'kg', 'aman', 'Thinner dengan ratio 20:1, harga normal Rp 30.000/kg, harga per galon Rp 600.000', '2024-12-24 01:41:10', '2024-12-24 01:41:10'),
(150, 1, 'EPX-CT-32', 'Cat Sbp', 'SBP', 'kgset', 'aman', 'Isi Keterangan', '2024-12-24 06:08:10', '2024-12-24 06:08:10');

-- --------------------------------------------------------

--
-- Struktur dari tabel `surat_jalan`
--

DROP TABLE IF EXISTS `surat_jalan`;
CREATE TABLE IF NOT EXISTS `surat_jalan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tujuan` text NOT NULL,
  `nomor_surat` varchar(50) NOT NULL,
  `tanggal` date NOT NULL,
  `nomor_kendaraan` varchar(50) DEFAULT NULL,
  `no_po` varchar(50) DEFAULT NULL,
  `keterangan_proyek` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `surat_jalan`
--

INSERT INTO `surat_jalan` (`id`, `tujuan`, `nomor_surat`, `tanggal`, `nomor_kendaraan`, `no_po`, `keterangan_proyek`, `created_at`, `updated_at`) VALUES
(1, 'dede', 'dedede', '2025-01-15', 'dedede', 'dede', NULL, '2025-01-14 17:31:26', '2025-01-14 17:31:26'),
(2, 'dede', 'dede', '2025-01-15', 'dede', 'dede', NULL, '2025-01-14 17:33:07', '2025-01-14 17:33:07'),
(3, 'dadadad', 'dada', '2025-01-15', 'dada', 'dadadad', NULL, '2025-01-14 17:35:41', '2025-01-14 17:35:41'),
(4, 'dede', 'deded', '2025-01-15', 'ded', 'ede', NULL, '2025-01-14 17:38:56', '2025-01-14 17:38:56'),
(5, 'dada', 'dada', '2025-01-15', 'dad', 'adadadad', NULL, '2025-01-14 17:50:31', '2025-01-14 17:50:31'),
(6, 'dedede', 'dedede', '2025-01-15', 'dada', 'dada', 'dadadadad', '2025-01-15 02:49:22', '2025-01-15 02:49:22'),
(7, 'adada', 'dadadad', '2025-01-15', 'ada', 'dadad', 'adada', '2025-01-15 02:50:39', '2025-01-15 02:50:39'),
(8, 'adad', 'adadada', '2024-10-31', 'da', 'dadada', 'dadad', '2025-01-15 03:11:40', '2025-01-15 03:11:40'),
(9, 'adad', 'adadada', '2024-10-31', 'da', 'dadada', 'dadad', '2025-01-15 03:11:46', '2025-01-15 03:11:46'),
(10, 'adad', 'adadada', '2024-10-31', 'da', 'dadada', 'dadad', '2025-01-15 03:11:46', '2025-01-15 03:11:46'),
(11, 'adada', 'adad', '2025-01-15', 'adad', 'adad', 'adad', '2025-01-15 03:14:22', '2025-01-15 03:14:22'),
(12, 'PT. Meiji Indonesian Pharmaceutical Industries Jl. Mojoparon No.1, Mojokopek, Latek, Kec. Rembang, Pasuruan, Jawa Timur 67153abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz', 'dada', '2023-06-13', 'dada', 'dada', 'Proyek ini bertujuan untuk pengembangan perangkat lunak yang dapat membantu meningkatkan efisiensi manajemen. Agar bisa selalu konsisten dalam menghadapi gempuran duniawi \n', '2025-01-15 03:15:17', '2025-01-15 08:46:14');

-- --------------------------------------------------------

--
-- Struktur dari tabel `surat_jalan_detail`
--

DROP TABLE IF EXISTS `surat_jalan_detail`;
CREATE TABLE IF NOT EXISTS `surat_jalan_detail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `surat_jalan_id` int DEFAULT NULL,
  `no_urut` int DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `weight` varchar(50) DEFAULT NULL,
  `kode_barang` varchar(50) DEFAULT NULL,
  `nama_barang` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `surat_jalan_id` (`surat_jalan_id`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `surat_jalan_detail`
--

INSERT INTO `surat_jalan_detail` (`id`, `surat_jalan_id`, `no_urut`, `quantity`, `unit`, `weight`, `kode_barang`, `nama_barang`) VALUES
(1, 1, 1, '1.00', 'pail', '20 kg', 'DAE-560', 'DAE - White'),
(2, 1, 2, '5.00', 'gln', '6 kg set', 'SF-M30', 'Starkfloor Mortar'),
(3, 1, 3, '2.00', 'gln', '5 kg set', 'SF-P1-Clear', 'Starkfloor Primer'),
(4, 2, 1, '1.00', 'gln', '7,5 kgset', 'SF-22-ral 9001', 'Starkfloor 22 - Cream'),
(5, 3, 1, '3.00', 'pail', '15,8 kg', '263-ral 7032', 'Sikafloor 263 SL HC - Pabble Grey (A)'),
(6, 3, 2, '3.00', 'gln', '4,2 kg', NULL, 'Hardener Sikafloor 263 SL HC (B)'),
(7, 4, 1, '4.00', 'pail', '3kg set', '-', '-');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('superadmin','adminpenawaran','adminkeuangan','picproject','admingudang','timsurvei','timteknis','timproduksi','qualitycontrol','adminpurchasing','timmarketing','supervisorproject','projectmanager') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `name`, `email`, `password`, `role`) VALUES
(1, 'wiwik', '', 'wiwik@gmail.com', '$2a$10$pa2KcrExhlAvdoXo0G4Xce0Q/eDeo976y4G6PF.rbG2du/9h6z8HC', 'adminkeuangan'),
(2, 'hilmyraihankindy@gmail.com', '', 'hilmy@gmail.com', '$2a$10$oakoIR/gNlUGrrhScprYBOm2p/VYlYSQ37CPfWX2.mRr81r3bPpy2', NULL),
(3, 'Hilmy Raihan', '', 'hilmyraihankindy@gmail.com', '$2a$10$M1SUy5tDoAw5ohQ2TJ7O1ejFshMRf6wsErUBGvlRUtzwr13c6NYLC', NULL),
(4, '', 'Hilmy Raihan Alkindy', 'gradana98@gmail.com', '', NULL),
(5, 'prasetyosbp', '', 'pras@gmail.com', '$2a$10$XAV.TtZJo.fmfONlZ4m.EeoApLIFGQOPlHD9Ttx3vYilnYcjlSVFK', 'adminpenawaran');

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `v_stok_report`
-- (Lihat di bawah untuk tampilan aktual)
--
DROP VIEW IF EXISTS `v_stok_report`;
CREATE TABLE IF NOT EXISTS `v_stok_report` (
`brand` varchar(100)
,`kategori` enum('material','alat','consumable')
,`kategori_nama` varchar(50)
,`keterangan` text
,`kode` varchar(50)
,`lokasi` varchar(50)
,`nama` varchar(100)
,`satuan` enum('kg','kgset','pail','galon5liter','galon10liter','pcs','lonjor','liter','literset','sak','unit')
,`status` enum('aman','rusak','cacat','sisa')
,`stok_keluar` int
,`stok_masuk` int
,`stok_sisa` int
,`sub_kategori_nama` varchar(100)
,`tanggal_entry` date
,`tanggal_keluar` date
,`tanggal_masuk` date
);

-- --------------------------------------------------------

--
-- Struktur untuk view `v_stok_report`
--
DROP TABLE IF EXISTS `v_stok_report`;

DROP VIEW IF EXISTS `v_stok_report`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_stok_report`  AS SELECT `s`.`kode` AS `kode`, `s`.`nama` AS `nama`, `s`.`kategori` AS `kategori`, `km`.`nama` AS `kategori_nama`, `skm`.`nama` AS `sub_kategori_nama`, `skm`.`brand` AS `brand`, `skm`.`status` AS `status`, `s`.`stok_masuk` AS `stok_masuk`, `s`.`stok_keluar` AS `stok_keluar`, `s`.`stok_sisa` AS `stok_sisa`, `s`.`satuan` AS `satuan`, `s`.`lokasi` AS `lokasi`, `s`.`tanggal_entry` AS `tanggal_entry`, `s`.`tanggal_masuk` AS `tanggal_masuk`, `s`.`tanggal_keluar` AS `tanggal_keluar`, `s`.`keterangan` AS `keterangan` FROM ((`stok` `s` join `sub_kategori_material` `skm` on((`s`.`sub_kategori_id` = `skm`.`id`))) join `kategori_material` `km` on((`skm`.`kategori_id` = `km`.`id`)))  ;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

DELIMITER $$
--
-- Event
--
DROP EVENT IF EXISTS `reset_autoincrement_event`$$
CREATE DEFINER=`root`@`localhost` EVENT `reset_autoincrement_event` ON SCHEDULE EVERY 1 SECOND STARTS '2024-12-01 16:09:39' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
    CALL reset_all_autoincrement();
END$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
