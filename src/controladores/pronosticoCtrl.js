import { conmysql } from '../db.js';


// Obtener todos los pronósticos
export const getPronosticos = async (req, res) => {
    try {
        const [result] = await conmysql.query('SELECT * FROM pronostico');
        res.json(result);
    } catch (error) {
        return res.status(500).json({ message: "Error al consultar pronósticos" });
    }
};

// Obtener un pronóstico por ID
export const getPronosticoPorId = async (req, res) => {
    try {
        const [result] = await conmysql.query('SELECT * FROM pronostico WHERE id_pron = ?', [req.params.id]);
        if (result.length <= 0) return res.status(404).json({
            id_pron: 0,
            message: "Pronóstico no encontrado"
        });
        res.json(result[0]);
    } catch (error) {
        return res.status(500).json({ message: 'Error del lado del servidor' });
    }
};

// Crear un nuevo pronóstico
export const postPronostico = async (req, res) => {
    try {
        const { id_usr, id_par, id_res, valor } = req.body;
        const [rows] = await conmysql.query(
            'INSERT INTO pronostico (id_usr, id_par, id_res, valor, fecha_registro) VALUES (?, ?, ?, ?, NOW())',
            [id_usr, id_par, id_res, valor]
        );
        res.send({ id: rows.insertId });
    } catch (error) {
        return res.status(500).json({ message: 'Error al insertar el pronóstico' });
    }
};

// Actualizar un pronóstico
export const putPronostico = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_usr, id_par, id_res, valor } = req.body;
        const [result] = await conmysql.query(
            'UPDATE pronostico SET id_usr = ?, id_par = ?, id_res = ?, valor = ? WHERE id_pron = ?',
            [id_usr, id_par, id_res, valor, id]
        );

        if (result.affectedRows <= 0) return res.status(404).json({ message: "Pronóstico no encontrado" });
        const [rows] = await conmysql.query('SELECT * FROM pronostico WHERE id_pron = ?', [id]);
        res.json(rows[0]);
    } catch (error) {
        return res.status(500).json({ message: 'Error del lado del servidor' });
    }
};

// Actualizar parcialmente un pronóstico
export const patchPronostico = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_usr, id_par, id_res, valor } = req.body;
        const [result] = await conmysql.query(
            `UPDATE pronostico SET 
                id_usr = IFNULL(?, id_usr),
                id_par = IFNULL(?, id_par),
                id_res = IFNULL(?, id_res),
                valor = IFNULL(?, valor)
            WHERE id_pron = ?`,
            [id_usr, id_par, id_res, valor, id]
        );

        if (result.affectedRows <= 0) return res.status(404).json({ message: "Pronóstico no encontrado" });
        const [rows] = await conmysql.query('SELECT * FROM pronostico WHERE id_pron = ?', [id]);
        res.json(rows[0]);
    } catch (error) {
        return res.status(500).json({ message: 'Error del lado del servidor' });
    }
};

// Eliminar un pronóstico
export const deletePronostico = async (req, res) => {
    try {
        const [rows] = await conmysql.query('DELETE FROM pronostico WHERE id_pron = ?', [req.params.id]);
        if (rows.affectedRows <= 0) return res.status(404).json({
            id_pron: 0,
            message: "No se pudo eliminar el pronóstico"
        });
        res.sendStatus(202);
    } catch (error) {
        return res.status(500).json({ message: "Error del lado del servidor" });
    }

    
};

// Obtener los usuarios que acertaron el pronóstico
export const getUsuariosQueAcertaron = async (req, res) => {
    try {
        const query = `
            SELECT u.id_usr, u.nombre
            FROM pronostico p
            JOIN usuario u ON p.id_usr = u.id_usr
            JOIN resultado r ON p.id_res = r.id_res
            WHERE p.valor = r.valor
        `;
        const [result] = await conmysql.query(query);
        res.json(result);
    } catch (error) {
        return res.status(500).json({ message: "Error al consultar los usuarios que acertaron" });
    }
};


export const getGanador = async (req, res) => {
    try {
        // Realizar la consulta con SUM para obtener el total de aciertos
        const [rows] = await conmysql.query(`
            SELECT u.id_usr, u.nombres, SUM(p.valor) AS total_aciertos
            FROM usuario u
            JOIN pronostico p ON u.id_usr = p.id_usr
            GROUP BY u.id_usr, u.nombres
            ORDER BY total_aciertos DESC
            LIMIT 1
        `);

        // Verificar si se obtuvo al menos un resultado
        if (rows.length > 0) {
            // Retornar el primer ganador
            res.json(rows[0]);
        } else {
            // Si no hay ganadores, responder con un error 404
            res.status(404).json({ message: 'No se encontró un ganador' });
        }
    } catch (error) {
        // Mostrar el error en consola y enviar un mensaje de error
        console.error('Error al obtener el ganador:', error.message);
        res.status(500).json({ message: 'Error al obtener el ganador' });
    }
};


