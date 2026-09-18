CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(180) NOT NULL,
	`eventDate` timestamp NOT NULL,
	`location` varchar(160),
	`category` varchar(80) NOT NULL DEFAULT 'Kegiatan',
	`status` enum('Terjadwal','Selesai','Dibatalkan') NOT NULL DEFAULT 'Terjadwal',
	`description` text,
	`createdBy` varchar(160),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`excerpt` varchar(300) NOT NULL,
	`content` text NOT NULL,
	`category` varchar(80) NOT NULL DEFAULT 'Kegiatan',
	`publishedAt` timestamp NOT NULL DEFAULT (now()),
	`authorName` varchar(160),
	`status` enum('Terbit','Draft') NOT NULL DEFAULT 'Terbit',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `news_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','treasurer','secretary','member') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `financeTransactions` ADD `receiptKey` varchar(255);--> statement-breakpoint
ALTER TABLE `financeTransactions` ADD `receiptUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `financeTransactions` ADD `receiptName` varchar(180);