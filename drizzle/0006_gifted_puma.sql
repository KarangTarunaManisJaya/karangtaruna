ALTER TABLE `documents` ADD `documentCategory` varchar(80) DEFAULT 'Umum' NOT NULL;--> statement-breakpoint
ALTER TABLE `documents` ADD `recipientName` varchar(180);--> statement-breakpoint
ALTER TABLE `documents` ADD `eventDate` timestamp;--> statement-breakpoint
ALTER TABLE `documents` ADD `eventTime` varchar(40);--> statement-breakpoint
ALTER TABLE `documents` ADD `eventLocation` varchar(180);