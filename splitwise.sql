-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: localhost    Database: splitwise
-- ------------------------------------------------------
-- Server version	8.0.36-0ubuntu0.22.04.1

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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aggregate`
--

LOCK TABLES `aggregate` WRITE;
/*!40000 ALTER TABLE `aggregate` DISABLE KEYS */;
INSERT INTO `aggregate` VALUES (12,57,56,1,'2024-03-27 01:40:45',100),(13,58,57,0,'2024-03-21 17:34:06',300),(14,59,57,0,'2024-03-21 17:34:06',300),(15,59,56,0,'2024-03-21 17:36:38',700),(16,57,61,0,'2024-03-27 03:15:22',144),(17,58,61,0,'2024-03-27 03:15:22',240),(18,60,61,0,'2024-03-27 03:15:22',96),(19,59,55,0,'2024-03-27 10:46:15',510),(20,65,55,1,'2024-03-27 10:47:08',500);
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
  `currency` varchar(20) DEFAULT NULL,
  `description` varchar(50) DEFAULT NULL,
  `amount` int NOT NULL,
  `groupid` int DEFAULT NULL,
  `userid` int DEFAULT NULL,
  `random` int DEFAULT NULL,
  PRIMARY KEY (`expenseid`),
  KEY `groupid` (`groupid`),
  KEY `userid` (`userid`),
  CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`groupid`) REFERENCES `grup` (`groupid`),
  CONSTRAINT `expenses_ibfk_2` FOREIGN KEY (`userid`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
INSERT INTO `expenses` VALUES (28,NULL,'Lunch',300,19,57,9771),(29,NULL,'Popcorn',100,19,56,8644),(30,NULL,'Dinner',300,19,56,4632),(32,NULL,'Canteen',480,20,61,451),(33,NULL,'Dinner',1000,19,55,8386);
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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `friends`
--

LOCK TABLES `friends` WRITE;
/*!40000 ALTER TABLE `friends` DISABLE KEYS */;
INSERT INTO `friends` VALUES (2,55,57),(3,55,60),(4,55,59),(5,55,58),(6,55,61),(9,58,60),(10,58,61),(11,58,57),(12,56,55),(13,56,57),(14,56,59),(15,56,58),(16,65,55),(17,65,57),(18,65,59);
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
  `group_pic` varchar(100) DEFAULT 'static/images/images.jpeg',
  `Random` int DEFAULT NULL,
  PRIMARY KEY (`groupid`),
  KEY `B` (`adminid`),
  CONSTRAINT `B` FOREIGN KEY (`adminid`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grup`
--

LOCK TABLES `grup` WRITE;
/*!40000 ALTER TABLE `grup` DISABLE KEYS */;
INSERT INTO `grup` VALUES (19,'Bowling',55,'static/images/images.jpeg',7321),(20,'Trek',55,'static/images/images.jpeg',7520),(21,'test',65,'static/images/images.jpeg',3856);
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
  KEY `userId` (`userId`),
  KEY `groupid` (`groupid`),
  CONSTRAINT `memberships_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`),
  CONSTRAINT `memberships_ibfk_2` FOREIGN KEY (`groupid`) REFERENCES `grup` (`groupid`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `memberships`
--

LOCK TABLES `memberships` WRITE;
/*!40000 ALTER TABLE `memberships` DISABLE KEYS */;
INSERT INTO `memberships` VALUES (33,55,19),(34,55,20),(35,57,19),(36,60,20),(37,59,19),(39,61,20),(42,57,20),(47,58,20),(49,65,19),(50,65,21),(51,55,21);
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
  `userid` int DEFAULT NULL,
  `receiverid` int DEFAULT NULL,
  `amount` double(10,2) DEFAULT NULL,
  `expenseid` int DEFAULT NULL,
  `status` int DEFAULT '2',
  PRIMARY KEY (`paymentid`),
  KEY `expenseid` (`expenseid`),
  KEY `userid` (`userid`),
  KEY `receiverid` (`receiverid`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`expenseid`) REFERENCES `expenses` (`expenseid`),
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`userid`) REFERENCES `user` (`userId`),
  CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`receiverid`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (34,56,57,600.00,28,1),(35,58,57,300.00,28,2),(36,59,57,300.00,28,2),(37,57,56,100.00,29,1),(38,59,56,100.00,29,2),(39,57,56,600.00,30,1),(40,59,56,600.00,30,2),(41,57,61,144.00,32,2),(42,58,61,240.00,32,2),(43,60,61,96.00,32,2),(44,59,55,510.00,33,2),(45,65,55,500.00,33,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=205 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reminders`
--

LOCK TABLES `reminders` WRITE;
/*!40000 ALTER TABLE `reminders` DISABLE KEYS */;
INSERT INTO `reminders` VALUES (184,58,57,300,0),(185,59,57,300,0),(186,59,56,700,0),(187,57,61,144,0),(188,58,61,240,0),(189,60,61,96,0),(190,59,55,510,0),(191,58,57,300,0),(192,59,57,300,0),(193,59,56,700,0),(194,57,61,144,0),(195,58,61,240,0),(196,60,61,96,0),(197,59,55,510,0),(198,58,57,300,0),(199,59,57,300,0),(200,59,56,700,0),(201,57,61,144,0),(202,58,61,240,0),(203,60,61,96,0),(204,59,55,510,0);
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
  CONSTRAINT `requests_ibfk_2` FOREIGN KEY (`groupid`) REFERENCES `grup` (`groupid`),
  CONSTRAINT `chk_status` CHECK ((`status` in (0,1,2)))
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `requests`
--

LOCK TABLES `requests` WRITE;
/*!40000 ALTER TABLE `requests` DISABLE KEYS */;
INSERT INTO `requests` VALUES (36,58,19,1),(37,59,19,1),(38,60,20,1),(39,61,20,1),(40,56,19,1),(41,64,19,2),(42,64,19,2),(43,NULL,19,2);
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
  `Name` varchar(25) NOT NULL,
  `Email` varchar(30) NOT NULL,
  `PASSWORD` varchar(100) NOT NULL,
  `profile_pic` varchar(100) DEFAULT 'static/images/images.png',
  PRIMARY KEY (`userId`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (55,'Hitesh','hitesh@gmail.com','$2b$12$i5KQlRj6Vr6NOX39svx5JORiUK.u.VfHs.0zR7Ow2dIpTlbL84j9a','static/images/images.png'),(56,'Palla','palla@gmail.com','$2b$12$.5TuLUCdtkFEiK58QFapOe1ZltyvlmccVVfQQz0mBQKfY4nuYqkq.','static/images/images.png'),(57,'Aman','aman67@gmail.com','$2b$12$GbX6DTPxn0nUJLXhA3AFKOnew08tJ/ZA5HBucxObDkN7BAI0ey/fm','static/images/images.png'),(58,'Rajesh','rajesh@gmail.com','$2b$12$jLOBKws0w6cIk53nAW7v5ObTKR68y7EEGtMzPvBnLp09R0.8F043m','static/images/images.png'),(59,'Shyam','shyamm@gmail.com','$2b$12$sJuWbeNjzInBeiprAsie9O57rMbyNNIG0NYCB/HKJTfpgcPzrNwZq','static/images/images.png'),(60,'Kiran','kiranb@gmail.com','$2b$12$RTLVJ7YdIKj5kNxcX8ZbnuW9mRYbK8uA93g75305ebzK41lucVXFe','static/images/images.png'),(61,'Gowtham','gowtham@gmail.com','$2b$12$0jpm/dUMT59hSoUin1BhXOTo0Mhb2FqcBg4XnOVgp952BGsLuuK5y','static/images/images.png'),(64,'a','a@b.com','$2b$12$w2eoY1oeVtDD7LpHjjh1LORFuOI60XNe3sIyfBPm8EDZAuxzDfMSC','static/images/images.png'),(65,'Nitin','nitin@k.com','$2b$12$Kp.NSkWYTTdUTRjN2bvwg.fNpEGiYPk4g2DsLkjQL.WwzKVZhHCTa','static/images/images.png'),(66,'vrushank','vrushamk@k.com','$2b$12$LRgOBM.KuSNe5xtFyHMQMuhMlW6spS1oJUuty.18LS1XiSmam8k0y','static/images/images.png'),(67,'Sanketh','sanky@k.com','$2b$12$29dh5BV0vrFcfJw56d016OmUxkE1T2PRiecq33L7US1MSBOvNKwH6','static/images/images.png'),(68,'Ram','ram@k.com','$2b$12$pdHnVOtp3Y6ynk9/Jnmw0usGHx.ucDIRLKJJoq.UP2P0SqMSM8nhK','static/images/1712523511386.jpg');
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

-- Dump completed on 2024-10-28 19:19:42
