CREATE TABLE `blood_pressure_readings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`systolic` int NOT NULL,
	`diastolic` int NOT NULL,
	`pulse` int NOT NULL,
	`readingDate` timestamp NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `blood_pressure_readings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`context` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `glucose_readings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`value` decimal(5,1) NOT NULL,
	`readingDate` timestamp NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `glucose_readings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_news_articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`content` text,
	`source` varchar(255) NOT NULL,
	`sourceUrl` text,
	`category` varchar(100) NOT NULL,
	`publishedDate` timestamp NOT NULL,
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `health_news_articles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lab_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`filename` varchar(255) NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileType` varchar(50) NOT NULL,
	`uploadDate` timestamp NOT NULL,
	`extractedData` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lab_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medication_doses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`medicationId` int NOT NULL,
	`userId` int NOT NULL,
	`scheduledDate` timestamp NOT NULL,
	`takenAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `medication_doses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`dosage` varchar(255) NOT NULL,
	`frequency` varchar(255) NOT NULL,
	`schedule` enum('day','night','both') NOT NULL,
	`notes` text,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medications_id` PRIMARY KEY(`id`)
);
