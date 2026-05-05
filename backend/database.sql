-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: bewerbungsaufgabe_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_logs`
--

DROP TABLE IF EXISTS `admin_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_username` varchar(100) DEFAULT NULL,
  `action_type` varchar(100) DEFAULT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_logs`
--

LOCK TABLES `admin_logs` WRITE;
/*!40000 ALTER TABLE `admin_logs` DISABLE KEYS */;
INSERT INTO `admin_logs` VALUES (1,'unbekannt','PRAXIS_DEAKTIVIERT','Praxis ID 10 deaktiviert','2026-05-03 13:16:20'),(2,'unbekannt','PRAXIS_BEARBEITET','Hausarztpraxis Isernhagen HB bearbeitet','2026-05-03 13:17:35'),(3,'admin','LOGIN','Admin hat sich angemeldet','2026-05-03 13:18:10'),(4,'admin','ADMIN_ERSTELLT','Admin nabil erstellt','2026-05-03 13:18:28'),(5,'nabil','LOGIN','Admin hat sich angemeldet','2026-05-03 13:18:50'),(6,'nabil','ADMIN_GELOESCHT','Admin admin gelöscht','2026-05-03 13:19:04'),(7,'nabil','LOGIN','Admin hat sich angemeldet','2026-05-03 13:19:32'),(8,'nabil','LOGIN','Admin hat sich angemeldet','2026-05-04 10:09:12'),(9,'nabil','LOGIN','Admin hat sich angemeldet','2026-05-04 10:10:06'),(10,'nabil','LOGIN','Admin hat sich angemeldet','2026-05-04 10:17:22'),(11,'nabil','LOGIN','Admin hat sich angemeldet','2026-05-04 10:30:51'),(12,'nabil','PRAXIS_BEARBEITET','Dr. Berndt & Partner MVZ bearbeitet','2026-05-04 10:31:08'),(13,'nabil','PRAXIS_BEARBEITET','Dr. Berndt & Partner MVZ bearbeitet','2026-05-04 15:17:00'),(14,'nabil','PRAXIS_BEARBEITET','LADR Laborzentrum Hannover bearbeitet','2026-05-04 15:17:10'),(15,'nabil','PRAXIS_BEARBEITET','Hausarzt Zentrum List bearbeitet','2026-05-04 15:17:32'),(16,'nabil','PRAXIS_BEARBEITET','Dr. Berndt & Partner MVZ bearbeitet','2026-05-04 15:17:42'),(17,'nabil','PRAXIS_BEARBEITET','LADR Laborzentrum Hannover bearbeitet','2026-05-04 15:17:52'),(18,'nabil','PRAXIS_BEARBEITET','MVZ Medizinisches Labor Hannover bearbeitet','2026-05-04 15:18:05'),(19,'nabil','PRAXIS_BEARBEITET','Dr. Berndt & Partner MVZ bearbeitet','2026-05-04 15:18:11'),(20,'nabil','PRAXIS_BEARBEITET','LADR Laborzentrum Hannover bearbeitet','2026-05-04 15:18:18'),(21,'nabil','PRAXIS_BEARBEITET','Hausarzt Zentrum List bearbeitet','2026-05-04 15:18:25'),(22,'nabil','PRAXIS_BEARBEITET','Hausarztpraxis Isernhagen HB bearbeitet','2026-05-04 15:18:39'),(23,'nabil','PRAXIS_BEARBEITET','SPINE + SPORT bearbeitet','2026-05-04 15:18:50'),(24,'nabil','PRAXIS_BEARBEITET','SPINE + SPORT bearbeitet','2026-05-04 15:18:59'),(25,'nabil','PRAXIS_BEARBEITET','Dominik Machner Gesundheitspraxis  bearbeitet','2026-05-04 15:19:08'),(26,'nabil','PRAXIS_BEARBEITET','Orthopädie Praxis Nordstadt bearbeitet','2026-05-04 15:19:23'),(27,'nabil','PRAXIS_BEARBEITET','Orthopädie Garbsen bearbeitet','2026-05-04 15:19:40'),(28,'nabil','PRAXIS_BEARBEITET','Frauenärztliche Gemeinschaftspraxis bearbeitet','2026-05-04 15:19:53'),(29,'nabil','PRAXIS_BEARBEITET','Orthopädie am Raschplatz bearbeitet','2026-05-04 15:20:08'),(30,'nabil','PRAXIS_BEARBEITET','Privatpraxis Orthocentrum-Laatzen bearbeitet','2026-05-04 15:20:20'),(31,'nabil','PRAXIS_BEARBEITET','Röntgenpraxis Georgstrasse bearbeitet','2026-05-04 15:20:32'),(32,'nabil','LOGIN','Admin hat sich angemeldet','2026-05-04 16:57:03'),(33,'nabil','LOGIN','Admin hat sich angemeldet','2026-05-05 13:09:37');
/*!40000 ALTER TABLE `admin_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `praxen`
--

DROP TABLE IF EXISTS `praxen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `praxen` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name_der_praxis` varchar(255) NOT NULL,
  `kategorie` varchar(100) DEFAULT NULL,
  `angebotene_leistungen` text,
  `strasse` varchar(255) DEFAULT NULL,
  `plz` varchar(10) DEFAULT NULL,
  `ort` varchar(100) DEFAULT NULL,
  `latitude` varchar(100) DEFAULT NULL,
  `longitude` varchar(100) DEFAULT NULL,
  `telefon` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `selbstzahler` varchar(50) DEFAULT NULL,
  `preis_in_euro` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'aktiv',
  `interne_notiz` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `region` varchar(100) DEFAULT 'Region Hannover',
  `verifiziert` tinyint(1) DEFAULT '0',
  `body_composition` tinyint(1) DEFAULT '0',
  `nur_knochendichte` tinyint(1) DEFAULT '0',
  `quelle_verifizierung` text,
  `verifizierungsdatum` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `praxen`
--

LOCK TABLES `praxen` WRITE;
/*!40000 ALTER TABLE `praxen` DISABLE KEYS */;
INSERT INTO `praxen` VALUES (1,'Röntgenpraxis Georgstrasse','DEXA Premium','Body Composition; Knochendichte','Georgstrasse. 16','30159','Hannover','52.3752459','9.7359770','0511 1237170','http://roentgenpraxis-georgstrasse.de/','Ja','Auf Anfrage','aktiv',NULL,'2026-05-04 15:20:32','Region Hannover',1,0,0,NULL,NULL),(2,'Privatpraxis Orthocentrum-Laatzen','DXA','Knochendichte Messung ','Würzburger Straße. 13','30880','Laatzen','52.3090860','9.8075925','0511  51534030','https://www.toportho.de/','Ja','Auf Anfrage ','aktiv',NULL,'2026-05-04 15:20:20','Region Hannover',0,0,0,NULL,NULL),(3,'Orthopädie am Raschplatz','DXA','Knochendichte Messung ','Runde Straße. 10','30161','Hannover','52.3795433','9.7394298','0511 9209330 ','https://orthopaedieamraschplatz.de/','Ja','Auf Anfrage','aktiv',NULL,'2026-05-04 15:20:08','Region Hannover',1,0,0,NULL,NULL),(4,'Frauenärztliche Gemeinschaftspraxis','DXA','Knochendichte Messung ','Podbielskistraße. 311','30659','Hannover','52.4082691','9.7994766','0511 640 40 10','https://frauenaerztinnen-hannover.de/','Ja','Auf Anfrage','aktiv',NULL,'2026-05-04 15:19:53','Region Hannover',0,0,0,NULL,NULL),(5,'Orthopädie Garbsen','DXA','Knochendichte Messung ','Höltyplatz. 5','30823','Garbsen','52.4056596','9.6163887','05137 73011','https://orthopaedie-garbsen.de/','Ja','Auf Anfrage','aktiv',NULL,'2026-05-04 15:19:40','Region Hannover',0,0,0,NULL,NULL),(6,'Dr. med. F. Mansouri und Kollegen Fachärzte für Orthopädie & Unfallchirurgie','BIA','Messung von Körperfett & Muskelmasse','Schillerstr. 34 ','30159','Hannover','52.3756609','9.7361458','0511 322 405','https://www.xn--hannover-orthopde-4qb.de/',NULL,NULL,'aktiv',NULL,'2026-05-03 11:16:45','Region Hannover',0,0,0,NULL,NULL),(7,'Orthopädie Praxis Nordstadt','BIA','Messung von Körperfett & Muskelmasse','Haltenhoffstraße 41 (Haus G)','30167','Hannover','52.3915525','9.7149379','0511 715566','https://www.orthopaediepraxis-nordstadt.de/','Ja','Auf Anfrage','aktiv',NULL,'2026-05-04 15:19:23','Region Hannover',0,0,0,NULL,NULL),(8,'Dominik Machner Gesundheitspraxis ','BIA','Messung von Körperfett & Muskelmasse','Podbielskistraße 325','30659','Hannover','52.4069358','9.8010751','0511 640 41 320 ','https://gesundeshannover.de/','Ja','  ab 70 ,00','aktiv',NULL,'2026-05-04 15:19:08','Region Hannover',1,0,0,NULL,NULL),(9,'SPINE + SPORT','BIA','Messung von Körperfett & Muskelmasse','Herrenhäuser Kirchweg 38','30167','Hannover','52.3909141','9.7062971',' 0511 87813878','https://www.spine-sport.de/','Ja','Auf Anfrage','aktiv',NULL,'2026-05-04 15:18:59','Region Hannover',1,0,0,NULL,NULL),(10,'Hausarztpraxis Isernhagen HB','BIA','Messung von Körperfett & Muskelmasse','Weizenkamp 4','30916','Isernhagen','52.4756595','9.7982550','0511 775684','https://www.praxis-isernhagen.de/','Ja','Auf Anfrage','aktiv',NULL,'2026-05-04 15:18:39','Region Hannover',0,0,0,NULL,NULL),(11,'MVZ Medizinisches Labor Hannover','Bluttest','Blutabnehmen','Am TÜV 6','30519','Hannover','52.3363261','9.7782678','0511 856220','https://www.labor-limbach-hannover.de/','Ja','Auf Anfrage','aktiv',NULL,'2026-05-04 15:18:05','Region Hannover',1,0,0,NULL,NULL),(12,'Hausarzt Zentrum List','Bluttest','Blutabnehmen','Jakobistraße 46','30163','Hannover','52.3912120','9.7425356','0511  662933','https://www.hausarzt-zentrum-list.de/','Ja','Auf Anfrage','aktiv',NULL,'2026-05-04 15:18:25','Region Hannover',1,0,0,NULL,NULL),(13,'LADR Laborzentrum Hannover','Bluttest','Blutabnehmen','Oldenburger Allee 31','30659','Hannover','52.4204370','9.8243427','0511 901360','https://www.ladr.de/','Ja','Auf Anfrage','aktiv',NULL,'2026-05-04 15:18:18','Region Hannover',1,0,0,NULL,NULL),(14,'Dr. Berndt & Partner MVZ','Bluttest','Blutabnehmen','Voßstraße 24','30161','Hannover','52.3885702','9.7411503','0511 620025','https://www.praxis-dr-berndt.de/','Ja','Auf Anfrage ','aktiv',NULL,'2026-05-04 15:18:11','Region Hannover',1,0,0,NULL,NULL);
/*!40000 ALTER TABLE `praxen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'nabil','$2b$10$gDJgPPscn/HfSoW0c0bHJ.xSRMdWwA9QdEKLPlEgBtZlSOkCJz8v.','admin','2026-05-03 13:18:28');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-05 15:48:07
