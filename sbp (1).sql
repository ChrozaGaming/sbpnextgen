-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: May 02, 2025 at 08:32 AM
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
(3, 'ANJHERR', '2025-05-30', 'adada', 'dadada', 'ADAD', 'Transfer', 'ADADAD', 'BCA', '2341234234', 'Berhasil', 'Admin', 40000020.00, 40000020.00, 4400002.20, 44400022.20, '2025-04-30 08:51:04', '2025-04-30 08:51:04');

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
(4, 3, 'adada', 'dadadada', 1, 'pcs', 40000020.00, 40000020.00);

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
(1, 'PO-2024-001', 'Pengadaan Bahan Baku A', '2024-05-01', 25.00, 'onprogress', 150000000.00, 145000000.00, 100000000.00, 45000000.00, 'Termin 1 dibayar', 'PT Sinar Buana Prima'),
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
(15, 'Pekanbaru', '82341F2', '2025-06-13', 'W888AK', 'IAD31231', 'Pekerjaan Proyek', '2025-04-30 03:29:32', '2025-04-30 03:29:32');

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
(10, 15, 1, 3.00, 'kg', NULL, 'MAT-001', 'Material 1');

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
-- Error reading structure for table sbp.v_stok_report: #1142 - SHOW VIEW command denied to user &#039;pras&#039;@&#039;localhost&#039; for table `sbp`.`v_stok_report`

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `surat_jalan_detail`
--
ALTER TABLE `surat_jalan_detail`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

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
