ALTER TABLE `documents` ADD `signerLeftName` varchar(160);--> statement-breakpoint
ALTER TABLE `documents` ADD `signerLeftRole` varchar(100);--> statement-breakpoint
ALTER TABLE `documents` ADD `signerRightName` varchar(160);--> statement-breakpoint
ALTER TABLE `documents` ADD `signerRightRole` varchar(100);--> statement-breakpoint
ALTER TABLE `documents` ADD `copies` text;