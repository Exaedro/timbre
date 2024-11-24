-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 24-11-2024 a las 02:45:01
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `timbre`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuraciontimbre`
--

CREATE TABLE `configuraciontimbre` (
  `ConfigID` int(11) NOT NULL,
  `HorarioID` int(11) DEFAULT NULL,
  `EventoID` int(11) DEFAULT NULL,
  `Activo` tinyint(1) DEFAULT 1,
  `FechaCreacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `eventos`
--

CREATE TABLE `eventos` (
  `EventoID` int(11) NOT NULL,
  `NombreEvento` varchar(100) NOT NULL,
  `Fecha` date NOT NULL,
  `TimbreActivo` tinyint(1) DEFAULT 0,
  `Descripcion` text DEFAULT NULL,
  `FechaCreacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historialtimbre`
--

CREATE TABLE `historialtimbre` (
  `HistorialID` int(11) NOT NULL,
  `HorarioID` int(11) DEFAULT NULL,
  `EventoID` int(11) DEFAULT NULL,
  `FechaAccion` datetime DEFAULT current_timestamp(),
  `TipoAccion` enum('Sonido','Modificacion') NOT NULL,
  `Descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios`
--

CREATE TABLE `horarios` (
  `HorarioID` int(11) NOT NULL,
  `NombreHorario` varchar(50) NOT NULL,
  `HoraInicio` time NOT NULL,
  `Activo` tinyint(1) DEFAULT 1,
  `FechaCreacion` datetime DEFAULT current_timestamp(),
  `duracion` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `horarios`
--

INSERT INTO `horarios` (`HorarioID`, `NombreHorario`, `HoraInicio`, `Activo`, `FechaCreacion`, `duracion`) VALUES
(1, 'Timbre 1', '07:35:00', 1, '2024-11-23 00:00:00', 1),
(2, 'Timbre 2', '08:35:00', 1, '2024-11-23 00:00:00', 1),
(3, 'Timbre 3', '09:35:00', 1, '2024-11-23 00:00:00', 1),
(4, 'Timbre 4', '09:55:00', 1, '2024-11-23 00:00:00', 1),
(5, 'Timbre 5', '10:55:00', 1, '2024-11-23 00:00:00', 1),
(6, 'Timbre 6', '11:55:00', 1, '2024-11-23 00:00:00', 1),
(7, 'Timbre 7', '12:55:00', 1, '2024-11-23 00:00:00', 1),
(8, 'Timbre 8', '13:55:00', 1, '2024-11-23 00:00:00', 1),
(9, 'Timbre 9', '14:55:00', 1, '2024-11-23 00:00:00', 1),
(10, 'Timbre 10', '15:15:00', 1, '2024-11-23 00:00:00', 1),
(11, 'Timbre 11', '16:15:00', 1, '2024-11-23 00:00:00', 1),
(12, 'Timbre 12', '17:15:00', 1, '2024-11-23 00:00:00', 1),
(13, 'Timbre 13', '17:35:00', 1, '2024-11-23 00:00:00', 1),
(14, 'Timbre 14', '18:35:00', 1, '2024-11-23 00:00:00', 1),
(15, 'Timbre 15', '19:35:00', 1, '2024-11-23 00:00:00', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `UsuarioID` int(11) NOT NULL,
  `NombreUsuario` varchar(50) NOT NULL,
  `Contrasena` varchar(255) NOT NULL,
  `FechaCreacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`UsuarioID`, `NombreUsuario`, `Contrasena`, `FechaCreacion`) VALUES
(1, 'root', '$2b$10$uzhvNHG6w70UrIh7QTwgzu46ejK8QRliXiCG97/eQeg67NmvQTLhq', '2024-11-23 16:09:52');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `configuraciontimbre`
--
ALTER TABLE `configuraciontimbre`
  ADD PRIMARY KEY (`ConfigID`),
  ADD KEY `HorarioID` (`HorarioID`),
  ADD KEY `EventoID` (`EventoID`);

--
-- Indices de la tabla `eventos`
--
ALTER TABLE `eventos`
  ADD PRIMARY KEY (`EventoID`);

--
-- Indices de la tabla `historialtimbre`
--
ALTER TABLE `historialtimbre`
  ADD PRIMARY KEY (`HistorialID`),
  ADD KEY `HorarioID` (`HorarioID`),
  ADD KEY `EventoID` (`EventoID`);

--
-- Indices de la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD PRIMARY KEY (`HorarioID`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`UsuarioID`),
  ADD UNIQUE KEY `NombreUsuario` (`NombreUsuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `configuraciontimbre`
--
ALTER TABLE `configuraciontimbre`
  MODIFY `ConfigID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `eventos`
--
ALTER TABLE `eventos`
  MODIFY `EventoID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `historialtimbre`
--
ALTER TABLE `historialtimbre`
  MODIFY `HistorialID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `horarios`
--
ALTER TABLE `horarios`
  MODIFY `HorarioID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `UsuarioID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `configuraciontimbre`
--
ALTER TABLE `configuraciontimbre`
  ADD CONSTRAINT `configuraciontimbre_ibfk_1` FOREIGN KEY (`HorarioID`) REFERENCES `horarios` (`HorarioID`),
  ADD CONSTRAINT `configuraciontimbre_ibfk_2` FOREIGN KEY (`EventoID`) REFERENCES `eventos` (`EventoID`);

--
-- Filtros para la tabla `historialtimbre`
--
ALTER TABLE `historialtimbre`
  ADD CONSTRAINT `historialtimbre_ibfk_1` FOREIGN KEY (`HorarioID`) REFERENCES `horarios` (`HorarioID`),
  ADD CONSTRAINT `historialtimbre_ibfk_2` FOREIGN KEY (`EventoID`) REFERENCES `eventos` (`EventoID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
