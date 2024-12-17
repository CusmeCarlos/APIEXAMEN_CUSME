import { conmysql } from '../db.js';

export const getGanador = async (req, res) => {
    try {
      const [result] = await conmysql.promise().query(`
        SELECT u.id_usr, u.nombres, SUM(p.valor) AS total_aciertos
        FROM usuario u
        JOIN pronostico p ON u.id_usr = p.id_usr
        GROUP BY u.id_usr, u.nombres
        ORDER BY total_aciertos DESC
        LIMIT 1
      `);
  
      console.log("Resultado de la consulta:", result);
  
      if (result.length === 0) {
        return res.status(404).json({ message: "No hay ganador aún" });
      }
  
      res.json(result[0]); // Devuelve el primer resultado
    } catch (error) {
      console.error("Error al obtener el ganador:", error); // Aquí se muestra el error completo
      res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
  };
  