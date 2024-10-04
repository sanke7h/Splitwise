-- MySQL dump 10.13  Distrib 8.0.39, for Linux (x86_64)
--
-- Host: localhost    Database: splitwise
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account` (
  `accountid` int NOT NULL AUTO_INCREMENT,
  `userid` int DEFAULT NULL,
  `accountno` varchar(50) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`accountid`),
  KEY `userid` (`userid`),
  CONSTRAINT `account_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aggregate`
--

DROP TABLE IF EXISTS `aggregate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aggregate` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userid` int DEFAULT NULL,
  `receiverid` int DEFAULT NULL,
  `status` int DEFAULT '0',
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  `amount` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userid` (`userid`),
  KEY `receiverid` (`receiverid`),
  CONSTRAINT `aggregate_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `user` (`userId`),
  CONSTRAINT `aggregate_ibfk_2` FOREIGN KEY (`receiverid`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aggregate`
--

LOCK TABLES `aggregate` WRITE;
/*!40000 ALTER TABLE `aggregate` DISABLE KEYS */;
/*!40000 ALTER TABLE `aggregate` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `update_date_before_update` BEFORE UPDATE ON `aggregate` FOR EACH ROW BEGIN
    SET NEW.date = CURRENT_TIMESTAMP;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `expenseid` int NOT NULL AUTO_INCREMENT,
  `groupid` int DEFAULT NULL,
  `description` varchar(50) DEFAULT NULL,
  `userid` int DEFAULT NULL,
  `currency` varchar(20) DEFAULT NULL,
  `amount` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  PRIMARY KEY (`expenseid`),
  KEY `groupid` (`groupid`),
  KEY `userid` (`userid`),
  CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`groupid`) REFERENCES `grup` (`groupid`),
  CONSTRAINT `expenses_ibfk_2` FOREIGN KEY (`userid`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `friends`
--

DROP TABLE IF EXISTS `friends`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `friends` (
  `friendid` int NOT NULL AUTO_INCREMENT,
  `user1` int DEFAULT NULL,
  `user2` int DEFAULT NULL,
  PRIMARY KEY (`friendid`),
  KEY `user1` (`user1`),
  KEY `user2` (`user2`),
  CONSTRAINT `friends_ibfk_1` FOREIGN KEY (`user1`) REFERENCES `user` (`userId`),
  CONSTRAINT `friends_ibfk_2` FOREIGN KEY (`user2`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `friends`
--

LOCK TABLES `friends` WRITE;
/*!40000 ALTER TABLE `friends` DISABLE KEYS */;
/*!40000 ALTER TABLE `friends` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grup`
--

DROP TABLE IF EXISTS `grup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grup` (
  `groupid` int NOT NULL AUTO_INCREMENT,
  `groupname` varchar(25) NOT NULL,
  `adminid` int NOT NULL,
  `group_pic` varchar(100) DEFAULT 'images/images.jpeg',
  `random` int DEFAULT NULL,
  PRIMARY KEY (`groupid`),
  KEY `fk_adminId` (`adminid`),
  CONSTRAINT `fk_adminId` FOREIGN KEY (`adminid`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grup`
--

LOCK TABLES `grup` WRITE;
/*!40000 ALTER TABLE `grup` DISABLE KEYS */;
INSERT INTO `grup` VALUES (1,'group1',1,'images/images.jpeg',NULL),(2,'group2',1,'images/images.jpeg',NULL),(3,'group3',4,'images/images.jpeg',1997);
/*!40000 ALTER TABLE `grup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `memberships`
--

DROP TABLE IF EXISTS `memberships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `memberships` (
  `membership_id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `groupid` int DEFAULT NULL,
  PRIMARY KEY (`membership_id`),
  KEY `fk_userId` (`groupid`),
  KEY `fk_groupId` (`userId`),
  CONSTRAINT `fk_groupId` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `memberships`
--

LOCK TABLES `memberships` WRITE;
/*!40000 ALTER TABLE `memberships` DISABLE KEYS */;
INSERT INTO `memberships` VALUES (1,4,1),(2,4,2),(3,5,2),(4,4,3);
/*!40000 ALTER TABLE `memberships` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `paymentid` int NOT NULL AUTO_INCREMENT,
  `expenseid` int DEFAULT NULL,
  `userid` int DEFAULT NULL,
  `receiverid` int DEFAULT NULL,
  `amount` double(10,2) DEFAULT NULL,
  `status` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  PRIMARY KEY (`paymentid`),
  KEY `expenseid` (`expenseid`),
  KEY `userid` (`userid`),
  KEY `receiverid` (`receiverid`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`expenseid`) REFERENCES `expenses` (`expenseid`),
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`userid`) REFERENCES `account` (`userid`),
  CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`receiverid`) REFERENCES `expenses` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reminders`
--

DROP TABLE IF EXISTS `reminders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reminders` (
  `rem_id` int NOT NULL AUTO_INCREMENT,
  `userid` int DEFAULT NULL,
  `receiverid` int DEFAULT NULL,
  `amount` int NOT NULL,
  `mark_read` int DEFAULT '0',
  PRIMARY KEY (`rem_id`),
  KEY `userid` (`userid`),
  KEY `receiverid` (`receiverid`),
  CONSTRAINT `reminders_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `user` (`userId`),
  CONSTRAINT `reminders_ibfk_2` FOREIGN KEY (`receiverid`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reminders`
--

LOCK TABLES `reminders` WRITE;
/*!40000 ALTER TABLE `reminders` DISABLE KEYS */;
/*!40000 ALTER TABLE `reminders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `requests`
--

DROP TABLE IF EXISTS `requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `requests` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `groupid` int DEFAULT NULL,
  `status` int DEFAULT '2',
  PRIMARY KEY (`request_id`),
  KEY `userId` (`userId`),
  KEY `groupid` (`groupid`),
  CONSTRAINT `requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`),
  CONSTRAINT `requests_ibfk_2` FOREIGN KEY (`groupid`) REFERENCES `grup` (`groupid`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `requests`
--

LOCK TABLES `requests` WRITE;
/*!40000 ALTER TABLE `requests` DISABLE KEYS */;
INSERT INTO `requests` VALUES (1,4,2,1),(2,5,2,1);
/*!40000 ALTER TABLE `requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `userId` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(25) DEFAULT NULL,
  `Email` varchar(30) NOT NULL,
  `PASSWORD` varchar(100) NOT NULL,
  `profile_pic` varchar(100) DEFAULT 'images/images.jpeg',
  PRIMARY KEY (`userId`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'1','abc@gmail.com','$2b$12$bjeE5F4lSp9MpYwB9zwhxuuWP4jO.yyAeBd2tnk7QwtJknzznsIhK','images/images.jpeg'),(4,'2','def@gmail.com','$2b$12$IAIdKxSkYr285VXs/CxFD.8I1dPPOnGhOtiALY.zFyYvnB.QnXZyG','images/images.jpeg'),(5,'3','ghi@gmail.com','$2b$12$XdjfqenfUrm8ExT144cYRur6aDPXMbVWWuRRlMh.MZ54aZamrIJE.','images/images.jpeg'),(8,'vrush','vrush@gmail.com','$2b$12$VfKnCZYKleosWJV2BSeu7eK91oLeLXzKMz/.Mc2PMadd1LIb5iv4y','images/images.jpeg'),(9,'sanke','sank@gmail.com','$2b$12$OM3hDUw4ulygB4ldjrUZuOFWvbjsoFsEImhPgUCxF/ERKb66QwN3G','images/images.jpeg'),(14,'4','jkl@gmail.com','$2b$12$SeO1Sse7DXrMRkugpOfcyOD6UwNsvWjIH2bZqMLbmBIc1USeNbEXa','images/images.jpeg'),(15,'5','mno@gmail.com','$2b$12$wlcZB/eDpIybCfYmCDvC9O.zgAH92BL0cEOtmgWwiuS.1u.eHLrza','static/images/1721571691848.jpg');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-04  9:30:54
