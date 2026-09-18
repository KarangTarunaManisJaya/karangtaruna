CREATE TABLE `assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`category` varchar(80) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`condition` enum('Baik','Perlu perbaikan','Rusak') NOT NULL DEFAULT 'Baik',
	`location` varchar(120),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentType` enum('Surat','Proposal','Laporan') NOT NULL,
	`title` varchar(200) NOT NULL,
	`documentNumber` varchar(80),
	`status` enum('Draft','Diproses','Disetujui','Arsip') NOT NULL DEFAULT 'Draft',
	`description` text,
	`ownerName` varchar(160),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberCode` varchar(32) NOT NULL,
	`name` varchar(160) NOT NULL,
	`gender` enum('Laki-laki','Perempuan') NOT NULL,
	`phone` varchar(32),
	`email` varchar(320),
	`address` text,
	`position` varchar(80) NOT NULL DEFAULT 'Anggota',
	`status` enum('Aktif','Tidak aktif') NOT NULL DEFAULT 'Aktif',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `members_id` PRIMARY KEY(`id`),
	CONSTRAINT `members_memberCode_unique` UNIQUE(`memberCode`)
);
