-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: smesystem
-- ------------------------------------------------------
-- Server version	8.0.41

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
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `supplier_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `fk_category_supplier` (`supplier_id`),
  CONSTRAINT `fk_category_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Bags and Backpacks',6),(2,'Bike Accessories',4),(3,'Bluetooth Speakers',1),(4,'Brand New Car',4),(5,'Camera',1),(6,'Camping Gear',6),(7,'Car Accessories',4),(8,'Chargers and Cables',1),(9,'Chocolates',5),(10,'Coffee and Tea',5),(11,'Cookware',5),(12,'Dishes',5),(13,'Drones',1),(14,'Facial Tools',2),(15,'Fitness Gear',6),(16,'Fragrances',2),(17,'Furniture',5),(18,'Garage Solutions',4),(19,'GPS Devices',1),(20,'Hard Drive & SSD',1),(21,'Headphones & Earbuds',1),(22,'Healthy Drinks',5),(23,'Jewelry',2),(24,'Kids Clothes',2),(25,'Kitchen Appliances',5),(26,'Laptop Chargers',1),(27,'Laptop Keyboards',1),(28,'Laptop Stands',1),(29,'Laptop and PC',1),(30,'Makeups',2),(31,'Men Clothes',2),(32,'Men Shoes',3),(33,'Mouse',1),(34,'Nail Care',2),(35,'Ladies Clothes',2),(36,'Tablets',1),(37,'SPORT BALLS',6),(38,'Water Bottles',5),(39,'Smart Watch',1),(41,'Smart Phones',1),(42,'Lady Shoes',2),(43,'Sun Glasses',2);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category_images`
--

DROP TABLE IF EXISTS `category_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `image` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `category_images_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category_images`
--

LOCK TABLES `category_images` WRITE;
/*!40000 ALTER TABLE `category_images` DISABLE KEYS */;
INSERT INTO `category_images` VALUES (69,39,'Uploads/image-1746952749413-975257547.jpeg','2025-05-11 08:38:30'),(71,41,'uploads/image-1747233873873-502921698.jpeg','2025-05-14 14:41:41'),(72,41,'uploads/image-1747233877014-849870276.jpeg','2025-05-14 14:44:37'),(73,42,'uploads/image-1747298919593-689286561.jpeg','2025-05-15 08:48:39'),(74,43,'uploads/image-1747336319515-17805443.jpeg','2025-05-15 19:11:59'),(75,8,'uploads/image-1747409598915-776861190.jpeg','2025-05-16 15:33:19');
/*!40000 ALTER TABLE `category_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category_images_backup`
--

DROP TABLE IF EXISTS `category_images_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category_images_backup` (
  `id` int NOT NULL DEFAULT '0',
  `category_id` int NOT NULL,
  `image` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category_images_backup`
--

LOCK TABLES `category_images_backup` WRITE;
/*!40000 ALTER TABLE `category_images_backup` DISABLE KEYS */;
INSERT INTO `category_images_backup` VALUES (1,1,'uploads/category_bags_and_backpacks.jpg','2025-05-09 07:55:52'),(2,2,'uploads/category_bike_accessories.jpg','2025-05-09 07:55:52'),(3,3,'uploads/category_bluetooth_speakers.jpg','2025-05-09 07:55:52'),(4,4,'uploads/category_brand_new_cars.jpg','2025-05-09 07:55:52'),(5,5,'uploads/category_camera.jpg','2025-05-09 07:55:52'),(6,6,'uploads/category_camping_gear.jpg','2025-05-09 07:55:52'),(7,7,'uploads/category_car_accessories.jpg','2025-05-09 07:55:52'),(8,8,'uploads/category_chargers_and_cables.jpg','2025-05-09 07:55:52'),(9,9,'uploads/category_chocolates.jpg','2025-05-09 07:55:52'),(10,10,'uploads/category_coffee_and_tea.jpg','2025-05-09 07:55:52'),(11,11,'uploads/category_cookware.jpg','2025-05-09 07:55:52'),(12,12,'uploads/category_dishes.jpg','2025-05-09 07:55:52'),(13,13,'uploads/category_drones.jpg','2025-05-09 07:55:52'),(14,14,'uploads/category_facial_tools.jpg','2025-05-09 07:55:52'),(15,15,'uploads/category_fitness_gear.jpg','2025-05-09 07:55:52'),(16,16,'uploads/category_fragrances.jpg','2025-05-09 07:55:52'),(17,17,'uploads/category_furniture.jpg','2025-05-09 07:55:52'),(18,18,'uploads/category_garage_solutions.jpg','2025-05-09 07:55:52'),(19,19,'uploads/category_gps_devices.jpg','2025-05-09 07:55:52'),(20,20,'uploads/category_hard_drive_and_ssd.jpg','2025-05-09 07:55:52'),(21,21,'uploads/category_headphones_and_earbuds.jpg','2025-05-09 07:55:52'),(22,22,'uploads/category_healthy_drinks.jpg','2025-05-09 07:55:52'),(23,23,'uploads/category_jewelry.jpg','2025-05-09 07:55:52'),(24,24,'uploads/category_kids_clothes.jpg','2025-05-09 07:55:52'),(25,25,'uploads/category_kitchen_appliances.jpg','2025-05-09 07:55:52'),(26,26,'uploads/category_laptop_chargers.jpg','2025-05-09 07:55:52'),(27,27,'uploads/category_laptop_keyboards.jpg','2025-05-09 07:55:52'),(28,28,'uploads/category_laptop_stands.jpg','2025-05-09 07:55:52'),(29,29,'uploads/category_laptop_and_pc.jpg','2025-05-09 07:55:52'),(30,30,'uploads/category_makeups.jpg','2025-05-09 07:55:52'),(31,31,'uploads/category_men_clothes.jpg','2025-05-09 07:55:52'),(32,32,'uploads/category_men_shoes.jpg','2025-05-09 07:55:52'),(33,33,'uploads/category_mouse.jpg','2025-05-09 07:55:52'),(34,34,'uploads/category_nail_care.jpg','2025-05-09 07:55:52');
/*!40000 ALTER TABLE `category_images_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `transaction_id` int NOT NULL,
  `phone_number` varchar(15) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `transaction_id` (`transaction_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `supplier_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `fk_supplier` (`supplier_id`),
  CONSTRAINT `fk_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (2,'Black Leather Back',2000.00,26,'uploads/image-1747234400169-611964405.jpeg',1,6),(4,'Portable Drones',10000.00,5,'uploads/image-1746837588875-320437077.jpeg',13,1),(9,'Leather Retro',2000.00,18,'uploads/image-1747303297090-960985078.jpeg',1,6),(10,'Green Push Lock',1600.00,6,'uploads/image-1747297127056-259941432.jpeg',1,6),(11,'Mountain Bike',9000.00,4,'uploads/image-1747296511879-114613612.jpeg',2,4),(12,'Bike Helmet',3000.00,2,'uploads/image-1746794771928-458272038.jpeg',2,4),(13,'Bike Light ',1000.00,4,'uploads/image-1746794817846-27089525.jpeg',2,4),(14,'Subaru Outback',9999999.97,0,'Uploads/image-1746976846820-907014488.jpeg',4,4),(16,'Isuzu',20000000.00,15,'uploads/image-1746796050860-515694002.jpeg',4,4),(17,'Cannon',150000.00,2,'uploads/image-1746796207704-726004383.jpeg',5,1),(18,'Black chocolate ',200.00,2,'uploads/image-1746831259290-562669464.jpeg',9,5),(19,'Neon Speaker',3000.00,0,'uploads/image-1746831382654-710055763.jpeg',3,1),(20,' Camping Tent ',10000.00,1,'uploads/image-1746831471816-512569267.jpeg',6,6),(21,'Type C charger',500.00,39,'uploads/image-1746831599019-142669209.jpeg',8,1),(22,'Black Coffee',100.00,31,'uploads/image-1746831675316-85516774.jpeg',10,5),(23,'Hotpot',5000.00,9,'uploads/image-1746831767912-153365026.jpeg',11,5),(24,'Samsum Galaxy',20000.00,46,'uploads/image-1747405371655-288843679.jpeg',36,1),(25,'Volley Ball',4500.00,19,'uploads/image-1746837304485-945016074.jpeg',37,6),(26,'Nice dress',2000.00,10,'uploads/image-1746907112747-81888539.jpeg',24,2),(27,'HP Silver laptop',50000.00,3,'Uploads/image-1746921044946-109267450.jpeg',29,1),(28,'Stainless Steel Bottle 1_18L 2 Pack',300.00,7,'Uploads/image-1746921198482-631436247.jpeg',38,5),(29,'Ladies Pink Suit',2000.00,10,'Uploads/image-1746921310756-228703916.jpeg',35,2),(30,'Leather Seat 5 seater',150000.00,3,'Uploads/image-1746951933549-910618520.jpeg',17,5),(31,'Fish Ugali',300.00,10,'Uploads/image-1746952078718-771305163.jpeg',12,5),(32,'Chicken Pizza',1000.00,2,'Uploads/image-1746952117724-493356028.jpeg',12,5),(33,'Beef Burger',500.00,10,'Uploads/image-1746952187937-37317002.jpeg',12,5),(34,'Nail Jelly',300.00,19,'Uploads/image-1746952426523-92438981.jpeg',34,2),(35,'Leather Shoes',12000.00,10,'Uploads/image-1746952542402-506090000.jpeg',32,3),(36,'Timberland',5000.00,5,'Uploads/image-1746952621834-235079725.jpeg',32,3),(37,'Smart Watch',2000.00,10,'Uploads/image-1746952777491-23052154.jpeg',39,1),(39,'Chapo Nyama',300.00,6,'Uploads/image-1746977804714-779630544.jpeg',12,5),(40,'Sony Camera',120000.00,10,'uploads/image-1747230851634-66011138.jpeg',5,1),(43,'Samsung',19000.00,28,'uploads/image-1747233761968-64674686.jpeg',41,1),(44,'Block heels',2000.00,19,'uploads/image-1747302561172-64060728.jpeg',42,2),(45,'Aviator',600.00,10,'uploads/image-1747407048981-573348186.jpeg',43,2),(46,'Round – Circular lenses',200.00,8,'uploads/image-1747407091780-85203320.jpeg',43,2),(47,'Wraparound ,Curved frame',100.00,16,'uploads/image-1747407137620-700613165.jpeg',43,2),(48,'Cat-Eye – Stylish',500.00,18,'uploads/image-1747407175631-341989272.jpeg',43,2),(49,'Iconic thick plastic frame',700.00,30,'uploads/image-1747407220803-599939166.jpeg',43,2),(50,'Ankle Boots',1500.00,17,'uploads/image-1747407457327-897869130.jpeg',42,2),(51,'Ballet Flats',150.00,7,'uploads/image-1747407542209-928434440.jpeg',42,2),(52,'Stiletto Heel',1000.00,19,'uploads/image-1747407622364-803064796.jpeg',42,2),(53,'Designer Shoes',1200.00,37,'uploads/image-1747407671989-270897078.jpeg',42,2),(54,'Buckle Strap High Heels',800.00,6,'uploads/image-1747407759839-664597170.jpeg',42,2),(55,'iPhone 14 pro',30000.00,18,'uploads/image-1747407991517-269739588.jpeg',41,1),(56,'samsung z flip',25000.00,2,'uploads/image-1747408046628-679606946.jpeg',41,1),(57,'Samsung Galaxy S20',15000.00,0,'uploads/image-1747408152896-744402330.jpeg',41,1),(58,'samsung galaxy s24 ultra',24999.98,1,'uploads/image-1747408210253-369643248.jpeg',41,1),(59,'iphone 11',18000.00,1,'uploads/image-1747408263254-950570831.jpeg',41,1),(60,'Smart Watch Techwear - Black',2000.00,3,'uploads/image-1747408406234-482691507.jpeg',39,1),(61,'Apple Watch',1500.00,5,'uploads/image-1747408465752-149983487.jpeg',39,1),(62,'Fossil Hybrid',1700.00,1,'uploads/image-1747408534425-719590056.jpeg',39,1),(63,'Collapsible Water Bottles',200.00,9,'uploads/image-1747408770639-11805369.jpeg',38,5),(64,'Brita Water Bottle',1000.00,2,'uploads/image-1747408849258-497866960.jpeg',38,5),(65,'Aquamist',10.00,3,'uploads/image-1747408889816-930869290.jpeg',38,5),(66,'Adidas',3000.00,1,'uploads/image-1747408968127-445880876.jpeg',37,6),(67,'Oxford Blue',1200.00,1,'uploads/image-1747409062998-383143663.jpeg',35,2),(68,'Impressive business Suit',1500.00,0,'uploads/image-1747409103740-60645833.jpeg',35,2),(69,'Jeans',500.00,2,'uploads/image-1747409142067-509712093.jpeg',35,2),(70,'White Eyelet',1500.00,4,'uploads/image-1747409186680-26630109.jpeg',35,2),(71,'Blender',2000.00,7,'uploads/image-1747409304039-827876847.jpeg',25,5),(72,'Dispenser',2000.00,1,'uploads/image-1747409345215-937822002.jpeg',25,5),(73,'Refrigerator',12000.00,3,'uploads/image-1747409419653-64595366.jpeg',25,5),(74,'Charger code for Jbl speakers',200.00,2,'uploads/image-1747409531534-161321257.jpeg',8,1),(75,'Samsung 2A travel charger',200.00,7,'uploads/image-1747409633575-75446247.jpeg',8,1),(76,'Range Rover',20000000.00,0,'uploads/image-1747414864230-851875791.jpeg',4,4);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `address` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'ElectroTech Solutions','contact@electrotech.com','+1234567890','123 Tech Park, Silicon City','2025-05-10 16:29:38'),(2,'FashionTrendz','support@fashiontrendz.com','+1234567891','456 Style Avenue, Fashion City','2025-05-10 16:29:39'),(3,'StepIn Style','info@stepinstyle.com','+1234567892','789 Footwear Lane, Style City','2025-05-10 16:29:39'),(4,'AutoWorld','sales@autoworld.com','+1234567893','101 Motor Road, Auto City','2025-05-10 16:29:39'),(5,'HomeHaven','care@homehaven.com','+1234567894','202 Comfort Street, Home City','2025-05-10 16:29:39'),(6,'AdventureGear','contact@adventuregear.com','+1234567895','303 Outdoor Trail, Adventure City','2025-05-10 16:29:39');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction_items`
--

DROP TABLE IF EXISTS `transaction_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transaction_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `transaction_id` (`transaction_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `transaction_items_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transaction_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction_items`
--

LOCK TABLES `transaction_items` WRITE;
/*!40000 ALTER TABLE `transaction_items` DISABLE KEYS */;
INSERT INTO `transaction_items` VALUES (12,7,10,2,1500.00),(13,8,10,2,1500.00),(14,9,14,1,9999999.97),(15,10,14,1,9999999.97),(16,11,14,1,9999999.97),(17,12,10,1,1500.00),(18,13,27,1,50000.00),(19,14,27,1,50000.00),(20,15,10,1,1500.00),(22,17,18,1,200.00),(23,18,18,1,200.00),(24,19,21,1,500.00),(25,20,19,1,3000.00),(26,21,19,1,3000.00),(27,22,19,1,3000.00),(28,23,19,1,3000.00),(29,24,18,1,200.00),(30,25,24,1,20000.00),(31,26,18,2,200.00),(32,27,25,1,4500.00),(33,27,39,1,300.00),(34,28,17,1,150000.00),(35,29,18,8,200.00),(39,33,16,1,20000000.00),(40,34,16,1,20000000.00),(41,34,23,1,5000.00),(42,35,24,1,20000.00),(44,37,2,1,2000.00),(45,37,44,1,2000.00),(46,37,43,1,19000.00),(47,38,22,3,100.00),(48,39,9,3,2000.00),(49,39,22,2,100.00),(50,39,28,1,300.00),(51,39,34,1,300.00),(60,42,9,3,2000.00),(61,43,9,3,2000.00),(62,44,43,1,19000.00),(63,44,10,4,1600.00),(64,45,9,4,2000.00),(65,46,9,3,2000.00),(66,47,2,3,2000.00);
/*!40000 ALTER TABLE `transaction_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `phone_number` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (1,3,50.00,'2025-05-11 19:39:28',NULL),(3,2,1050.00,'2025-05-11 19:45:53',NULL),(4,2,1000.00,'2025-05-11 19:52:57',NULL),(5,2,1000.00,'2025-05-11 19:52:59',NULL),(6,2,1000.00,'2025-05-11 20:02:44',NULL),(7,3,3000.00,'2025-05-11 21:32:45',NULL),(8,3,3000.00,'2025-05-11 21:32:48',NULL),(9,3,9999999.97,'2025-05-11 21:33:44',NULL),(10,3,9999999.97,'2025-05-11 21:33:46',NULL),(11,3,9999999.97,'2025-05-11 21:33:47',NULL),(12,5,1500.00,'2025-05-11 21:35:31',NULL),(13,5,50000.00,'2025-05-11 21:37:28',NULL),(14,5,50000.00,'2025-05-11 21:37:30',NULL),(15,3,1500.00,'2025-05-11 22:48:57',NULL),(16,3,19999999.96,'2025-05-11 22:50:00',NULL),(17,2,200.00,'2025-05-11 23:27:55',NULL),(18,2,200.00,'2025-05-11 23:27:56',NULL),(19,2,500.00,'2025-05-12 08:42:00',NULL),(20,2,3000.00,'2025-05-12 17:47:59',NULL),(21,2,3000.00,'2025-05-12 17:48:03',NULL),(22,2,3000.00,'2025-05-12 17:48:06',NULL),(23,2,3000.00,'2025-05-12 17:48:07',NULL),(24,2,200.00,'2025-05-12 19:40:07',NULL),(25,3,20000.00,'2025-05-12 20:06:41',NULL),(26,2,400.00,'2025-05-12 21:34:11',NULL),(27,2,4800.00,'2025-05-13 07:10:11',NULL),(28,2,150000.00,'2025-05-14 08:03:06',NULL),(29,2,1600.00,'2025-05-14 08:06:18',NULL),(30,2,64000.00,'2025-05-14 09:29:30',NULL),(31,2,800.00,'2025-05-14 11:13:55',NULL),(32,2,800.00,'2025-05-14 11:28:21',NULL),(33,2,20000000.00,'2025-05-14 11:50:15',NULL),(34,2,20005000.00,'2025-05-14 12:02:59',NULL),(35,2,20000.00,'2025-05-14 12:11:12',NULL),(37,8,23000.00,'2025-05-15 10:22:26',NULL),(38,2,300.00,'2025-05-15 23:06:13',NULL),(39,2,6800.00,'2025-05-16 03:38:12',NULL),(42,2,6000.00,'2025-05-16 08:56:34',NULL),(43,2,6000.00,'2025-05-16 08:57:36',NULL),(44,2,25400.00,'2025-05-16 08:59:36',NULL),(45,2,8000.00,'2025-05-16 09:01:26',NULL),(46,2,6000.00,'2025-05-16 09:13:27',NULL),(47,2,6000.00,'2025-05-16 16:59:06',NULL);
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `is_admin` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'Admin User','admin@smesystem.com','$2b$10$DSOBsxzve1D48JcGeT1du.r3FEtNq3lXhWCaFTf.oRE9eEQisg8i2',1,'2025-05-09 16:04:33'),(3,'Simon Kamau','simonngangaka@gmail.com','$2b$10$nDJeJP4pTK6MfPrgSD1Nx.GX2mIbDjMGZCjvxv0q.Bdiixtjlp2G2',0,'2025-05-10 00:37:28'),(4,'Kelly Chanai','kellynyachiro@gmail.com','$2b$10$knD137QrX7IYZ1ljkYSZr.PqL8MVjMEAiflh1y8ZAlKqH97Ltx2yG',0,'2025-05-11 19:43:11'),(5,'Daisy cheptoo','daisy001@gmail.com','$2b$10$Y2g4gECY385I8nXMGR.9NeRA7qwMTIHsCPC9MHtFKXW34oFITmlf.',0,'2025-05-11 21:34:54'),(6,'kelly chanai','kellychanai@gmail.com','$2b$10$HCJbZGC.c7UC.T46pAmr.uOWT.Qd1AEuEw5K1x54xI.MGJ70X8o6i',0,'2025-05-11 22:33:04'),(7,'mark Muraya','markmuraya001@gmail.com','$2b$10$cqvQGXIMkGGe1lJ2jvQal.OIV5ZLOX63DgDKQmHvm/7RWH2pItvue',0,'2025-05-14 14:21:22'),(8,'Shadrack karanja','shadrackkaranja@gmai.com','$2b$10$ZUSI65RtTVvR13MunElx4eTxym2OAQiCycZvWSoudDs8fLW0kIy6e',0,'2025-05-15 10:22:15');
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

-- Dump completed on 2025-05-16 23:15:59
