-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: bryrb8vptbobryfsboyq-mysql.services.clever-cloud.com:3306
-- Tiempo de generación: 02-10-2023 a las 13:12:06
-- Versión del servidor: 8.0.22-13
-- Versión de PHP: 8.2.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `bryrb8vptbobryfsboyq`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administrador`
--

CREATE TABLE `administrador` (
  `ID_ADMINISTRADOR` int NOT NULL,
  `NOMBRE_ADMIN` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `CONTRASENIA_ADMIN` varchar(10) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `administrador`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `calificacion_platillo`
--

CREATE TABLE `calificacion_platillo` (
  `ID_CALIFICACION` int NOT NULL,
  `ID_USUARIO` int DEFAULT NULL,
  `ID_PLATILLO` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `departamento`
--

CREATE TABLE `departamento` (
  `ID_DEPARTAMENTO` int NOT NULL,
  `NOMBRE_DEPARTAMENTO` varchar(15) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `departamento`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `origen_platillo`
--

CREATE TABLE `origen_platillo` (
  `ID_ORIGEN` int NOT NULL,
  `ID_DEPARTAMENTO` int DEFAULT NULL,
  `ID_PLATILLO` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `platillo_tipico`
--

CREATE TABLE `platillo_tipico` (
  `ID_PLATILLO` int NOT NULL,
  `TITULO_PLATILLO` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `DESCRIPCION_PLATILLO` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `IMAGEN_PLATILLO` longblob NOT NULL,
  `URL_VIDEO` longblob NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `ID_USUARIO` int NOT NULL,
  `NOMBRE_USUARIO` varchar(15) COLLATE utf8mb4_general_ci NOT NULL,
  `CONTRASENIA_USUARIO` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `CORREO_USUARIO` varchar(30) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administrador`
--
ALTER TABLE `administrador`
  ADD PRIMARY KEY (`ID_ADMINISTRADOR`);

--
-- Indices de la tabla `calificacion_platillo`
--
ALTER TABLE `calificacion_platillo`
  ADD PRIMARY KEY (`ID_CALIFICACION`),
  ADD KEY `FK_CALIFICA_CALIFICA_USUARIO` (`ID_USUARIO`),
  ADD KEY `FK_CALIFICA_CALIFICAD_PLATILLO` (`ID_PLATILLO`);

--
-- Indices de la tabla `departamento`
--
ALTER TABLE `departamento`
  ADD PRIMARY KEY (`ID_DEPARTAMENTO`);

--
-- Indices de la tabla `origen_platillo`
--
ALTER TABLE `origen_platillo`
  ADD PRIMARY KEY (`ID_ORIGEN`),
  ADD KEY `FK_ORIGEN_P_ORIGINA_DEPARTAM` (`ID_DEPARTAMENTO`),
  ADD KEY `FK_ORIGEN_P_PERTENECE_PLATILLO` (`ID_PLATILLO`);

--
-- Indices de la tabla `platillo_tipico`
--
ALTER TABLE `platillo_tipico`
  ADD PRIMARY KEY (`ID_PLATILLO`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`ID_USUARIO`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `administrador`
--
ALTER TABLE `administrador`
  MODIFY `ID_ADMINISTRADOR` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `calificacion_platillo`
--
ALTER TABLE `calificacion_platillo`
  MODIFY `ID_CALIFICACION` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `departamento`
--
ALTER TABLE `departamento`
  MODIFY `ID_DEPARTAMENTO` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `origen_platillo`
--
ALTER TABLE `origen_platillo`
  MODIFY `ID_ORIGEN` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `platillo_tipico`
--
ALTER TABLE `platillo_tipico`
  MODIFY `ID_PLATILLO` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `ID_USUARIO` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `calificacion_platillo`
--
ALTER TABLE `calificacion_platillo`
  ADD CONSTRAINT `FK_CALIFICA_CALIFICA_USUARIO` FOREIGN KEY (`ID_USUARIO`) REFERENCES `usuario` (`ID_USUARIO`),
  ADD CONSTRAINT `FK_CALIFICA_CALIFICAD_PLATILLO` FOREIGN KEY (`ID_PLATILLO`) REFERENCES `platillo_tipico` (`ID_PLATILLO`);

--
-- Filtros para la tabla `origen_platillo`
--
ALTER TABLE `origen_platillo`
  ADD CONSTRAINT `FK_ORIGEN_P_ORIGINA_DEPARTAM` FOREIGN KEY (`ID_DEPARTAMENTO`) REFERENCES `departamento` (`ID_DEPARTAMENTO`),
  ADD CONSTRAINT `FK_ORIGEN_P_PERTENECE_PLATILLO` FOREIGN KEY (`ID_PLATILLO`) REFERENCES `platillo_tipico` (`ID_PLATILLO`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
