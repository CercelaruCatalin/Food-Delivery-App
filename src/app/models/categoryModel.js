import pool from '../config/db.js';

const getAllCategories = async () => {
    try {
        const categories = await pool.query('SELECT * FROM categories ORDER BY name');
        return categories;
    } catch (err) {
        console.error('Error getting categories', err);
        throw new Error("Error getting categories");
    }
};

export {
    getAllCategories
}