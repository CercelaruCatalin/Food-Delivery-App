import pool from '../config/db.js';

const getRestaurant = async (restaurantId) => {
    try{
        const result = await pool.query('SELECT * FROM restaurants where id = $1', [restaurantId]);
        return result.rows[0];

    }catch (err) {
        console.error('Error getting restaurant', err);
        throw new Error("Error getting restaurant");
      }
};

const getAllRestaurants = async () => {
    try{
        const restaurants = await pool.query('SELECT * FROM restaurants');
        return restaurants;

    }catch (err) {
        console.error('Error getting restaurant', err);
        throw new Error("Error getting restaurant");
      }
};

const getAllRestaurantsFromCity = async (city, categoryFilter = null) => {
    try {
        let query = 'SELECT * FROM restaurants WHERE city = $1';
        const queryParams = [city];
        
        // Daca este furnizat un filtru de categorie, filtram dupa acea categorie
        if (categoryFilter) {
            // Utilizam operatorul @> pentru a verifica daca array-ul contine valoarea
            query += " AND categories @> ARRAY[$2]";
            queryParams.push(categoryFilter);
        }
        
        const restaurants = await pool.query(query, queryParams);
        return restaurants;
    } catch (err) {
        console.error('Error getting restaurants', err);
        throw new Error("Error getting restaurants");
    }
};

export{
    getRestaurant,
    getAllRestaurants,
    getAllRestaurantsFromCity
}