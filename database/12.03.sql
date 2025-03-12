-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: sistema_ocorrencias
-- ------------------------------------------------------
-- Server version	8.0.41

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
-- Table structure for table `alunos`
--

DROP TABLE IF EXISTS `alunos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alunos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `turma` varchar(50) NOT NULL,
  `curso` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_aluno` (`nome`,`turma`,`curso`)
) ENGINE=InnoDB AUTO_INCREMENT=15694 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alunos`
--

LOCK TABLES `alunos` WRITE;
/*!40000 ALTER TABLE `alunos` DISABLE KEYS */;
/*!40000 ALTER TABLE `alunos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `infracoes`
--

DROP TABLE IF EXISTS `infracoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `infracoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `descricao` text NOT NULL,
  `tipo` enum('LEVE','GRAVE','GRAVÍSSIMA') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `infracoes`
--

LOCK TABLES `infracoes` WRITE;
/*!40000 ALTER TABLE `infracoes` DISABLE KEYS */;
INSERT INTO `infracoes` VALUES (2,'Aluno faltou à aula sem apresentar justificativa.','LEVE'),(3,'Aluno chegou atrasado repetidamente.','LEVE'),(4,'Aluno foi desrespeitoso com o professor durante a aula.','GRAVE'),(5,'Aluno proferiu palavras ofensivas contra um colega.','GRAVE'),(6,'Aluno agrediu fisicamente um colega ou professor.','GRAVÍSSIMA'),(7,'Aluno danificou bens da instituição.','GRAVÍSSIMA'),(8,'Narrativa de Extensão','LEVE'),(10,'Narrativa de Extensão','GRAVE');
/*!40000 ALTER TABLE `infracoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ocorrencias`
--

DROP TABLE IF EXISTS `ocorrencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ocorrencias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aluno_id` int NOT NULL,
  `servidor_id` int NOT NULL,
  `tipo` enum('LEVE','GRAVE','GRAVÍSSIMA') NOT NULL,
  `local` varchar(255) NOT NULL,
  `descricao` text NOT NULL,
  `data_hora` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `infracao_id` int NOT NULL,
  `imagem` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `aluno_id` (`aluno_id`),
  KEY `servidor_id` (`servidor_id`),
  CONSTRAINT `ocorrencias_ibfk_1` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ocorrencias_ibfk_2` FOREIGN KEY (`servidor_id`) REFERENCES `servidores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ocorrencias`
--

LOCK TABLES `ocorrencias` WRITE;
/*!40000 ALTER TABLE `ocorrencias` DISABLE KEYS */;
/*!40000 ALTER TABLE `ocorrencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servidores`
--

DROP TABLE IF EXISTS `servidores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servidores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `siape` varchar(20) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `tipo` enum('ADMIN','SERVIDOR') DEFAULT 'SERVIDOR',
  `alterou_senha` tinyint(1) DEFAULT '0',
  `admin` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `matricula_siape` (`siape`),
  UNIQUE KEY `siape` (`siape`)
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servidores`
--

LOCK TABLES `servidores` WRITE;
/*!40000 ALTER TABLE `servidores` DISABLE KEYS */;
INSERT INTO `servidores` VALUES (61,'Alan Teixeira de Oliveira','alan.oliveira@ifnmg.edu.br','1958324','1958324','SERVIDOR',0,0),(62,'Annanda Mendes Costa','annanda.costa@ifnmg.edu.br','1335735','1335735','SERVIDOR',0,0),(63,'Antonio Clarette Santiago Tavares','antonio.tavares@ifnmg.edu.br','1845324','1845324','SERVIDOR',0,0),(64,'Arnaldo Henrique Mayr','arnaldo.mayr@ifnmg.edu.br','1886992','1886992','SERVIDOR',0,0),(65,'Claudia Adriana Souza Santos','claudia.santos@ifnmg.edu.br','3121603','3121603','SERVIDOR',0,0),(66,'Daiane Prates Mendonca','daiane.mendonca@ifnmg.edu.br','2261944','2261944','SERVIDOR',0,0),(67,'Daniel Silva Moraes','daniel.moraes@ifnmg.edu.br','3324372','3324372','SERVIDOR',0,0),(68,'Dayane Patricia Cunha de Franca','dayane.franca@ifnmg.edu.br','2262516','2262516','SERVIDOR',0,0),(69,'Deivison Porto de Sousa','deivison.sousa@ifnmg.edu.br','1384715','1384715','SERVIDOR',0,0),(70,'Edimilson Alves Barbosa','edimilson.barbosa@ifnmg.edu.br','1150028','1150028','SERVIDOR',0,0),(71,'Ednilton Moreira Gama','ednilton.gama@ifnmg.edu.br','1812438','1812438','SERVIDOR',0,0),(72,'Eduardo Charles Barbosa Ayres','eduardo.ayres@ifnmg.edu.br','2178484','2178484','SERVIDOR',0,0),(73,'Emanuelly Alves Pelogio','emanuelly.pelogio@ifnmg.edu.br','2261930','2261930','SERVIDOR',0,0),(74,'Eyleen Nabyla Alvarenga Niitsuma','eyleen.alvarenga@ifnmg.edu.br','1898271','1898271','SERVIDOR',0,0),(75,'Gessimar Nunes Camelo','gessimar.camelo@ifnmg.edu.br','1323584','1323584','SERVIDOR',0,0),(76,'Irene Candida dos Reis Alves','irene.alves@ifnmg.edu.br','3344678','3344678','SERVIDOR',0,0),(77,'Jairo Lucas Souza Barros','jairo.barros@ifnmg.edu.br','3342776','3342776','SERVIDOR',0,0),(78,'Jefferson Rodrigues de Souza','jefferson.souza@ifnmg.edu.br','2325535','2325535','SERVIDOR',0,0),(79,'Joan Bralio Mendes Pereira Lima','joan.lima@ifnmg.edu.br','1749641','1749641','SERVIDOR',0,0),(80,'Joao Alison Alves Oliveira','joao.oliveira@ifnmg.edu.br','1090578','1090578','SERVIDOR',0,0),(81,'Joaquim Neto de Sousa Santos','joaquim.santos@ifnmg.edu.br','1732101','1732101','SERVIDOR',0,0),(82,'Jose Maria Gomes Neves','jose.neves@ifnmg.edu.br','2215404','2215404','SERVIDOR',0,0),(83,'Keila de Oliveira Diniz','keila.diniz@ifnmg.edu.br','1147437','1147437','SERVIDOR',0,0),(84,'Leila Conceicao de Paula Miranda','leila.miranda@ifnmg.edu.br','1885050','1885050','SERVIDOR',0,0),(85,'Leomir Batista Neres','leomir.neres@ifnmg.edu.br','1219858','1219858','SERVIDOR',0,0),(86,'Leonan Teixeira de Oliveira','lonan.oliveira@ifnmg.edu.br','3196447','3196447','SERVIDOR',0,0),(87,'Ludmila Ameno Ribeiro Martins Santiago','ludmila.santiago@ifnmg.edu.br','1115641','1115641','SERVIDOR',0,0),(88,'Luiz Celio Souza Rocha','luiz.rocha@ifnmg.edu.br','2636875','2636875','SERVIDOR',0,0),(89,'Marco Aurelio Madureira de Carvalho','marco.madureira@ifnmg.edu.br','1147467','1147467','SERVIDOR',0,0),(90,'Marcos Vinicius Montanari','marcos.montanari@ifnmg.edu.br','1925806','123456','ADMIN',1,0),(91,'Marcus Leonardo Figueiredo Silva','marcus.silva@ifnmg.edu.br','1300885','1300885','SERVIDOR',0,0),(92,'Mariana Mapelli de Paiva','mariana.paiva@ifnmg.edu.br','2262724','2262724','SERVIDOR',0,0),(93,'Mateus Sena Lopes','mateus.lopes@ifnmg.edu.br','1120239','1120239','SERVIDOR',0,0),(94,'Nemia Ribeiro Alves Lopes','nemia.lopes@ifnmg.edu.br','1341395','1341395','SERVIDOR',0,0),(95,'Paulo Sergio Henrique dos Santos','paulo.santos@ifnmg.edu.br','2885351','2885351','SERVIDOR',0,0),(96,'Philippe Araujo Leboeuf','philippe.leboeuf@ifnmg.edu.br','1581454','1581454','SERVIDOR',0,0),(97,'Roberta Pereira Matos','roberta.matos@ifnmg.edu.br','2732648','2732648','SERVIDOR',0,0),(98,'Rondinei Almeida da Silva','rondinei.silva@ifnmg.edu.br','1090720','1090720','SERVIDOR',0,0),(99,'Suzana Viana Mota','suzana.mota@ifnmg.edu.br','2004878','2004878','SERVIDOR',0,0),(100,'Tania Maria Mares Figueiredo','tania.mares@ifnmg.edu.br','1814861','1814861','SERVIDOR',0,0),(101,'Uendel Goncalves de Almeida','uendel.almeida@ifnmg.edu.br','1888576','1888576','SERVIDOR',0,0),(102,'Vico Mendes Pereira Lima','vico.lima@ifnmg.edu.br','1885016','1885016','SERVIDOR',0,0),(103,'Carlos','carlos@ifnmg.edu.br','1111111','123456','ADMIN',1,0);
/*!40000 ALTER TABLE `servidores` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-12 11:16:17
