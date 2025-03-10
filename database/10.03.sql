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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alunos`
--

LOCK TABLES `alunos` WRITE;
/*!40000 ALTER TABLE `alunos` DISABLE KEYS */;
INSERT INTO `alunos` VALUES (2,'Ciclano','ZOO0123','Técnico em Zootecnia'),(3,'dedr','0125','Técnico em Administração'),(4,'João da Silva','3A','Desenvolvimento de Sistemas'),(5,'Ruim demais','0123','Técnico em Agropecuária'),(7,'Marcos','012555','Técnico em Agropecuária');
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
INSERT INTO `ocorrencias` VALUES (7,2,1,'LEVE','Laboratório de Desenvolvimento de Sistemas','dfgdfdfgdfgdfg','2025-03-06 22:34:00',3,NULL),(9,3,1,'LEVE','Laboratório de Desenvolvimento de Sistemas','hfghdfgh','2025-03-07 00:50:00',7,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servidores`
--

LOCK TABLES `servidores` WRITE;
/*!40000 ALTER TABLE `servidores` DISABLE KEYS */;
INSERT INTO `servidores` VALUES (1,'Carlos Silva','carlos@ifnmg.edu.br','123456','147852369','ADMIN',1,1),(3,'Novo Servidor','novo@ifnmg.edu.br','654321','123456','SERVIDOR',1,0),(5,'João Silva','joao@ifnmg.edu.br','1925806','123456','SERVIDOR',0,0),(6,'Teste','teste@ifnmg.edu.br','444414','999999','SERVIDOR',0,0),(7,'Fulano','fulano@ifnmg.edu.br','1456289','qwerty','ADMIN',1,0),(17,'asd','asd@gmail.com','676767','123456','ADMIN',1,0);
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

-- Dump completed on 2025-03-10 12:27:17
