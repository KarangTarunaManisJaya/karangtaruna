CREATE TABLE `financeTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transactionCode` varchar(40) NOT NULL,
	`transactionType` enum('Pemasukan','Pengeluaran') NOT NULL,
	`category` varchar(100) NOT NULL,
	`description` varchar(240) NOT NULL,
	`amount` int NOT NULL,
	`transactionDate` timestamp NOT NULL DEFAULT (now()),
	`paymentMethod` enum('Tunai','Transfer','QRIS') NOT NULL DEFAULT 'Tunai',
	`status` enum('Terverifikasi','Menunggu') NOT NULL DEFAULT 'Terverifikasi',
	`createdBy` varchar(160),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financeTransactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `financeTransactions_transactionCode_unique` UNIQUE(`transactionCode`)
);
