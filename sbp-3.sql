-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: May 04, 2025 at 04:27 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

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
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_stock_in` (IN `p_kode` VARCHAR(50), IN `p_jumlah` INT, IN `p_tanggal_masuk` DATE)   BEGIN  
    UPDATE stok SET 
        stok_masuk = stok_masuk + p_jumlah, 
        stok_sisa = stok_sisa + p_jumlah, 
        tanggal_masuk = p_tanggal_masuk, 
        updated_at = CURRENT_TIMESTAMP 
    WHERE kode = p_kode;  
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `reduce_stock` (IN `p_kode` VARCHAR(50), IN `p_jumlah` INT, IN `p_tanggal_keluar` DATE)   BEGIN  
    UPDATE stok SET 
        stok_keluar = stok_keluar + p_jumlah, 
        stok_sisa = stok_sisa - p_jumlah, 
        tanggal_keluar = p_tanggal_keluar, 
        updated_at = CURRENT_TIMESTAMP 
    WHERE kode = p_kode AND stok_sisa >= p_jumlah;  
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `reset_all_autoincrement` ()   BEGIN  
    DECLARE done INT DEFAULT 0;  
    DECLARE table_name VARCHAR(255);  
    DECLARE cur CURSOR FOR SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE();  
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;  
    
    OPEN cur;  
    read_loop: LOOP  
        FETCH cur INTO table_name;  
        IF done THEN LEAVE read_loop; END IF;  
        
        SET @row_count_query = CONCAT('SELECT COUNT(*) INTO @row_count FROM ', table_name);  
        PREPARE stmt_row_count FROM @row_count_query;  
        EXECUTE stmt_row_count;  
        DEALLOCATE PREPARE stmt_row_count;  
        
        IF @row_count = 0 THEN  
            SET @reset_query = CONCAT('ALTER TABLE ', table_name, ' AUTO_INCREMENT = 1');  
            PREPARE stmt_reset FROM @reset_query;  
            EXECUTE stmt_reset;  
            DEALLOCATE PREPARE stmt_reset;  
        END IF;  
    END LOOP;  
    CLOSE cur;  
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `reset_autoincrement` (IN `table_name` VARCHAR(255))   BEGIN  
    SET @query = CONCAT('ALTER TABLE ', table_name, ' AUTO_INCREMENT = 1');  
    PREPARE stmt FROM @query;  
    EXECUTE stmt;  
    DEALLOCATE PREPARE stmt;  
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `reset_surat_jalan_autoincrement` ()   BEGIN  
    SET @query = 'ALTER TABLE surat_jalan AUTO_INCREMENT = 1';  
    PREPARE stmt FROM @query;  
    EXECUTE stmt;  
    DEALLOCATE PREPARE stmt;  
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `reset_table_autoincrement` (IN `table_name` VARCHAR(255))   BEGIN  
    SET @query = CONCAT('ALTER TABLE ', table_name, ' AUTO_INCREMENT = 1');  
    PREPARE stmt FROM @query;  
    EXECUTE stmt;  
    DEALLOCATE PREPARE stmt;  
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `barang_surat_jalan`
--

CREATE TABLE `barang_surat_jalan` (
  `id` int(11) NOT NULL,
  `surat_jalan_id` int(11) NOT NULL,
  `barang_id` int(11) NOT NULL,
  `jumlah` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kategori_material`
--

CREATE TABLE `kategori_material` (
  `id` int(11) NOT NULL,
  `nama` varchar(50) NOT NULL,
  `keterangan` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_orders`
--

CREATE TABLE `purchase_orders` (
  `id` int(11) NOT NULL,
  `po_number` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `supplier` varchar(100) NOT NULL,
  `address` text NOT NULL,
  `attention` varchar(100) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `shipping_address` text NOT NULL,
  `bank` varchar(100) DEFAULT NULL,
  `account` varchar(100) DEFAULT NULL,
  `attention_pay_term` varchar(100) DEFAULT NULL,
  `order_by` varchar(100) NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `subtotal` decimal(15,2) NOT NULL,
  `tax` decimal(15,2) NOT NULL,
  `grand_total` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `purchase_orders`
--

INSERT INTO `purchase_orders` (`id`, `po_number`, `date`, `supplier`, `address`, `attention`, `note`, `shipping_address`, `bank`, `account`, `attention_pay_term`, `order_by`, `total_amount`, `subtotal`, `tax`, `grand_total`, `created_at`, `updated_at`) VALUES
(1, '12313123', '2025-05-13', 'adada', 'dadad', 'adada', 'dadad', 'dada', '', '', '', 'admin', 2200000.00, 2200000.00, 242000.00, 2442000.00, '2025-04-30 07:48:45', '2025-04-30 07:48:45'),
(2, 'adadadada', '2025-05-15', 'adadadad', 'adadadad', 'adadadadad', 'adadad', 'adadadad', 'adada', 'dadada', 'adadada', '3i2daa', 400000.00, 400000.00, 44000.00, 444000.00, '2025-04-30 08:34:29', '2025-04-30 08:34:29'),
(3, 'ANJHERR', '2025-05-30', 'adada', 'dadada', 'ADAD', 'Transfer', 'ADADAD', 'BCA', '2341234234', 'Berhasil', 'Admin', 40000020.00, 40000020.00, 4400002.20, 44400022.20, '2025-04-30 08:51:04', '2025-04-30 08:51:04'),
(4, 'FXS-123123', '2025-05-04', 'PT. JNE ', 'JL MOJOLANGU, KAB PASURUAN', 'Tes', 'Bagus', 'JL RAJAWALI III KAB JOMBANG', 'Bank BCA', '0812312312', 'Pak George', 'Sunaryadi', 2440000.00, 2440000.00, 268400.00, 2708400.00, '2025-05-04 02:08:06', '2025-05-04 02:08:06');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_order_items`
--

CREATE TABLE `purchase_order_items` (
  `id` int(11) NOT NULL,
  `purchase_order_id` int(11) NOT NULL,
  `item_description` text NOT NULL,
  `item_code` varchar(50) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit` enum('kg','kgset','pail','galon5liter','galon10liter','pcs','lonjor','liter','literset','sak','unit') NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `amount` decimal(15,2) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `purchase_order_items`
--

INSERT INTO `purchase_order_items` (`id`, `purchase_order_id`, `item_description`, `item_code`, `quantity`, `unit`, `unit_price`, `amount`) VALUES
(1, 1, 'adad', 'adad', 3, 'kg', 400000.00, 1200000.00),
(2, 1, 'adada', 'dadad', 5, 'kgset', 200000.00, 1000000.00),
(3, 2, 'adada', 'adadadada', 1, 'galon5liter', 400000.00, 400000.00),
(4, 3, 'adada', 'dadadada', 1, 'pcs', 40000020.00, 40000020.00),
(5, 4, 'CAT DUCOTEX', 'HF-1312', 4, 'pcs', 600000.00, 2400000.00),
(6, 4, 'CAT ALCOTEX', 'VFA-1312', 1, 'pcs', 40000.00, 40000.00);

-- --------------------------------------------------------

--
-- Table structure for table `rekap_po`
--

CREATE TABLE `rekap_po` (
  `id` int(11) NOT NULL,
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
  `nama_perusahaan` varchar(255) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `rekap_po`
--

INSERT INTO `rekap_po` (`id`, `no_po`, `judulPO`, `tanggal`, `status`, `progress`, `nilai_penawaran`, `nilai_po`, `biaya_pelaksanaan`, `profit`, `keterangan`, `nama_perusahaan`) VALUES
(1, 'PO-2024-001', 'Pengadaan Bahan Baku A', '2024-05-01', 25.00, 'finish', 150000000.00, 145000000.00, 100000000.00, 45000000.00, 'Termin 1 dibayar', 'PT Sinar Buana Prima'),
(2, 'PO-2024-002', 'Jasa Konstruksi Proyek B', '2024-05-10', 100.00, 'finish', 300000000.00, 290000000.00, 230000000.00, 60000000.00, 'Selesai tanpa kendala', 'PT Bangun Beton Sejahtera'),
(3, 'PO-2024-003', 'Pengadaan Alat Produksi C', '2024-06-03', 60.00, 'onprogress', 50000000.00, 48000000.00, 35000000.00, 13000000.00, 'Menunggu pengiriman tahap 2', 'PT Teknomas Nusantara'),
(4, 'PO-2024-004', 'Renovasi Gedung D', '2024-04-25', 80.00, 'onprogress', 100000000.00, 98000000.00, 75000000.00, 23000000.00, 'Pekerjaan finishing', 'PT Arsitek Muda Prima'),
(5, '913123123', 'AUDIT REKAP DATA', '2025-05-22', 1900.00, 'onprogress', 3000000.00, 200000.00, 10000.00, 190000.00, 'On Progress', 'PT. SINARMAS LAND'),
(6, 'Tes', 'QDADAD', '2025-05-23', -80.00, 'onprogress', 300000.00, 20000.00, 100000.00, -80000.00, 'Selesai', 'PT Bangun Beton Sejahtera');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(191) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stok`
--

CREATE TABLE `stok` (
  `id` int(11) NOT NULL,
  `kode` varchar(50) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `kategori` enum('material','alat','consumable') NOT NULL,
  `sub_kategori_id` int(11) NOT NULL,
  `stok_masuk` int(11) DEFAULT 0,
  `stok_keluar` int(11) DEFAULT 0,
  `stok_sisa` int(11) DEFAULT 0,
  `satuan` enum('kg','kgset','pail','galon5liter','galon10liter','pcs','lonjor','liter','literset','sak','unit') NOT NULL,
  `lokasi` varchar(50) NOT NULL,
  `tanggal_entry` date NOT NULL,
  `tanggal_masuk` date DEFAULT NULL,
  `tanggal_keluar` date DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `stok`
--

INSERT INTO `stok` (`id`, `kode`, `nama`, `kategori`, `sub_kategori_id`, `stok_masuk`, `stok_keluar`, `stok_sisa`, `satuan`, `lokasi`, `tanggal_entry`, `tanggal_masuk`, `tanggal_keluar`, `keterangan`, `created_at`, `updated_at`) VALUES
(39, 'MAT-001', 'Material 1', 'material', 151, 5, 2, 3, 'kg', 'Gudang', '2025-05-02', '2025-05-02', '2025-05-02', 'pembelian', '2025-05-02 14:57:11', '2025-05-02 14:59:40');

-- --------------------------------------------------------

--
-- Table structure for table `stok_gudang`
--

CREATE TABLE `stok_gudang` (
  `id` int(11) NOT NULL,
  `sub_kategori_id` int(11) NOT NULL,
  `kode` varchar(50) NOT NULL,
  `stok_masuk` int(11) NOT NULL DEFAULT 0,
  `stok_keluar` int(11) NOT NULL DEFAULT 0,
  `tanggal_masuk` date DEFAULT NULL,
  `tanggal_keluar` date DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sub_kategori_material`
--

CREATE TABLE `sub_kategori_material` (
  `id` int(11) NOT NULL,
  `kategori_id` int(11) NOT NULL,
  `kode_item` varchar(20) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `satuan` enum('kg','kgset','pail','galon5liter','galon10liter','pcs','lonjor','liter','literset','sak','unit') NOT NULL,
  `status` enum('aman','rusak','cacat','sisa') DEFAULT 'aman',
  `keterangan` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `sub_kategori_material`
--

INSERT INTO `sub_kategori_material` (`id`, `kategori_id`, `kode_item`, `nama`, `brand`, `satuan`, `status`, `keterangan`, `created_at`, `updated_at`) VALUES
(151, 1, 'MAT-001', 'Material 1', 'AVIAN', 'kg', 'aman', NULL, '2025-04-30 02:12:23', '2025-04-30 02:12:23');

-- --------------------------------------------------------

--
-- Table structure for table `surat_jalan`
--

CREATE TABLE `surat_jalan` (
  `id` int(11) NOT NULL,
  `tujuan` text NOT NULL,
  `nomor_surat` varchar(50) NOT NULL,
  `tanggal` date NOT NULL,
  `nomor_kendaraan` varchar(50) DEFAULT NULL,
  `no_po` varchar(50) DEFAULT NULL,
  `keterangan_proyek` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `surat_jalan`
--

INSERT INTO `surat_jalan` (`id`, `tujuan`, `nomor_surat`, `tanggal`, `nomor_kendaraan`, `no_po`, `keterangan_proyek`, `created_at`, `updated_at`) VALUES
(13, 'Singosari', 'NFAFA131', '2025-05-08', 'W233PQX', '912313', 'Pekerjaan', '2025-04-30 03:17:32', '2025-04-30 03:17:32'),
(14, 'Batam', '82342', '2025-04-30', 'W3222PQX', '98234124', 'Pekerjaan', '2025-04-30 03:18:23', '2025-04-30 03:18:23'),
(15, 'Pekanbaru', '82341F2', '2025-06-13', 'W888AK', 'IAD31231', 'Pekerjaan Proyek', '2025-04-30 03:29:32', '2025-04-30 03:29:32'),
(16, 'PT Meiji', '123123', '2025-05-14', 'W1224QX', '4646464', 'Pengerjaan Epoxy ', '2025-05-02 14:59:40', '2025-05-02 14:59:40');

-- --------------------------------------------------------

--
-- Table structure for table `surat_jalan_detail`
--

CREATE TABLE `surat_jalan_detail` (
  `id` int(11) NOT NULL,
  `surat_jalan_id` int(11) DEFAULT NULL,
  `no_urut` int(11) DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `weight` varchar(50) DEFAULT NULL,
  `kode_barang` varchar(50) DEFAULT NULL,
  `nama_barang` varchar(255) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `surat_jalan_detail`
--

INSERT INTO `surat_jalan_detail` (`id`, `surat_jalan_id`, `no_urut`, `quantity`, `unit`, `weight`, `kode_barang`, `nama_barang`) VALUES
(8, 13, 1, 1.00, 'kg', NULL, 'MAT-001', 'Material 1'),
(9, 14, 1, 1.00, 'kg', NULL, 'MAT-001', 'Material 1'),
(10, 15, 1, 3.00, 'kg', NULL, 'MAT-001', 'Material 1'),
(11, 16, 1, 2.00, 'kg', NULL, 'MAT-001', 'Material 1');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('superadmin','adminpenawaran','adminkeuangan','picproject','admingudang','timsurvei','timteknis','timproduksi','qualitycontrol','adminpurchasing','timmarketing','supervisorproject','projectmanager') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `name`, `email`, `password`, `role`) VALUES
(1, 'wiwik', '', 'wiwik@gmail.com', '$2a$10$pa2KcrExhlAvdoXo0G4Xce0Q/eDeo976y4G6PF.rbG2du/9h6z8HC', 'adminkeuangan'),
(2, 'hilmyraihankindy@gmail.com', '', 'hilmy@gmail.com', '$2a$10$oakoIR/gNlUGrrhScprYBOm2p/VYlYSQ37CPfWX2.mRr81r3bPpy2', 'superadmin'),
(3, 'Hilmy Raihan', '', 'hilmyraihankindy@gmail.com', '$2a$10$M1SUy5tDoAw5ohQ2TJ7O1ejFshMRf6wsErUBGvlRUtzwr13c6NYLC', NULL),
(4, '', 'Hilmy Raihan Alkindy', 'gradana98@gmail.com', '', NULL),
(5, 'prasetyosbp', '', 'pras@gmail.com', '$2a$10$XAV.TtZJo.fmfONlZ4m.EeoApLIFGQOPlHD9Ttx3vYilnYcjlSVFK', 'admingudang');

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_stok_report`
-- (See below for the actual view)
--
CREATE TABLE `v_stok_report` (
`kode` varchar(50)
,`nama` varchar(100)
,`kategori` enum('material','alat','consumable')
,`kategori_nama` varchar(50)
,`sub_kategori_nama` varchar(100)
,`brand` varchar(100)
,`status` enum('aman','rusak','cacat','sisa')
,`stok_masuk` int(11)
,`stok_keluar` int(11)
,`stok_sisa` int(11)
,`satuan` enum('kg','kgset','pail','galon5liter','galon10liter','pcs','lonjor','liter','literset','sak','unit')
,`lokasi` varchar(50)
,`tanggal_entry` date
,`tanggal_masuk` date
,`tanggal_keluar` date
,`keterangan` text
);

-- --------------------------------------------------------

--
-- Structure for view `v_stok_report`
--
DROP TABLE IF EXISTS `v_stok_report`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_stok_report`  AS SELECT `s`.`kode` AS `kode`, `s`.`nama` AS `nama`, `s`.`kategori` AS `kategori`, `km`.`nama` AS `kategori_nama`, `skm`.`nama` AS `sub_kategori_nama`, `skm`.`brand` AS `brand`, `skm`.`status` AS `status`, `s`.`stok_masuk` AS `stok_masuk`, `s`.`stok_keluar` AS `stok_keluar`, `s`.`stok_sisa` AS `stok_sisa`, `s`.`satuan` AS `satuan`, `s`.`lokasi` AS `lokasi`, `s`.`tanggal_entry` AS `tanggal_entry`, `s`.`tanggal_masuk` AS `tanggal_masuk`, `s`.`tanggal_keluar` AS `tanggal_keluar`, `s`.`keterangan` AS `keterangan` FROM ((`stok` `s` join `sub_kategori_material` `skm` on(`s`.`sub_kategori_id` = `skm`.`id`)) join `kategori_material` `km` on(`skm`.`kategori_id` = `km`.`id`)) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `barang_surat_jalan`
--
ALTER TABLE `barang_surat_jalan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `surat_jalan_id` (`surat_jalan_id`),
  ADD KEY `barang_id` (`barang_id`);

--
-- Indexes for table `kategori_material`
--
ALTER TABLE `kategori_material`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_order_id` (`purchase_order_id`);

--
-- Indexes for table `rekap_po`
--
ALTER TABLE `rekap_po`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_token` (`token`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_expires_at` (`expires_at`);

--
-- Indexes for table `stok`
--
ALTER TABLE `stok`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode` (`kode`),
  ADD KEY `sub_kategori_id` (`sub_kategori_id`),
  ADD KEY `idx_kategori` (`kategori`),
  ADD KEY `idx_tanggal_entry` (`tanggal_entry`);

--
-- Indexes for table `stok_gudang`
--
ALTER TABLE `stok_gudang`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sub_kategori_id` (`sub_kategori_id`);

--
-- Indexes for table `sub_kategori_material`
--
ALTER TABLE `sub_kategori_material`
  ADD PRIMARY KEY (`id`),
  ADD KEY `kategori_id` (`kategori_id`),
  ADD KEY `idx_kode_item` (`kode_item`);

--
-- Indexes for table `surat_jalan`
--
ALTER TABLE `surat_jalan`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `surat_jalan_detail`
--
ALTER TABLE `surat_jalan_detail`
  ADD PRIMARY KEY (`id`),
  ADD KEY `surat_jalan_id` (`surat_jalan_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `barang_surat_jalan`
--
ALTER TABLE `barang_surat_jalan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `kategori_material`
--
ALTER TABLE `kategori_material`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `rekap_po`
--
ALTER TABLE `rekap_po`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `stok`
--
ALTER TABLE `stok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `stok_gudang`
--
ALTER TABLE `stok_gudang`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sub_kategori_material`
--
ALTER TABLE `sub_kategori_material`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=152;

--
-- AUTO_INCREMENT for table `surat_jalan`
--
ALTER TABLE `surat_jalan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `surat_jalan_detail`
--
ALTER TABLE `surat_jalan_detail`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
