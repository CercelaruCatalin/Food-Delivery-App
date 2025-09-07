import pool from '../config/db.js';
import { validateEmail } from '../hooks/User/userUtils.js';

// tipurile de utilizatori
const USER_TYPES = {
  USER: 'user',
  COURIER: 'courier'
};

// Configuratia pentru fiecare tip de utilizator
const USER_CONFIG = {
  [USER_TYPES.USER]: {
    table: 'users',
    displayName: 'User'
  },
  [USER_TYPES.COURIER]: {
    table: 'couriers',
    displayName: 'Courier'
  }
};

//  validarea tipului de utilizator
const validateUserType = (typeOfUser) => {
  return Object.values(USER_TYPES).includes(typeOfUser);
};

// configuratie bazata pe tipul de utilizator
const getUserConfig = (typeOfUser) => {
  if (!validateUserType(typeOfUser)) {
    throw new Error(`Invalid user type: ${typeOfUser}`);
  }
  return USER_CONFIG[typeOfUser];
};

const getUserIdByEmail = async (email, typeOfUser) => {
  if (!validateEmail(email)) {
    throw new Error("Invalid email");
  }

  const config = getUserConfig(typeOfUser);
  
  try {
    const result = await pool.query(
      `SELECT id FROM ${config.table} WHERE email = $1`,
      [email]
    );
    
    return result.rows.length > 0 ? result.rows[0].id : null;
  } catch (err) {
    console.error(`Error finding ${config.displayName.toLowerCase()} by email:`, err);
    throw new Error(`Error finding ${config.displayName.toLowerCase()} ID by email`);
  }
};

const resolveUserId = async (identifier, typeOfUser = USER_TYPES.USER) => {
  if (validateEmail(identifier)) {
    return await getUserIdByEmail(identifier, typeOfUser);
  }
  return identifier;
};

const createUser = async (email, hashedPassword, typeOfUser = USER_TYPES.USER, firstName = null, lastName = null, phoneNumber = null) => {
  const config = getUserConfig(typeOfUser);
  
  try{
    if (!validateEmail(email)) {
      throw new Error("Invalid email");
    }

    if(config.table === 'users'){
      const result = await pool.query(
        `INSERT INTO ${config.table} (email, password) VALUES ($1, $2) RETURNING id, email`,
        [email, hashedPassword]
      );

      deleteGuestUser(email);

      return result.rows[0];

    }else if(config.table === 'couriers'){
      const fullName = `${firstName} ${lastName}`.trim();
      
      const result = await pool.query(
        `INSERT INTO ${config.table} (email, password, name, phone) VALUES ($1, $2, $3, $4) RETURNING id, email`,
      [email, hashedPassword, fullName, phoneNumber]
      );

      deleteGuestUser(email);

      return result.rows[0];
    }
    
   } catch (err) {
    console.error(`Error creating ${config.displayName.toLowerCase()}:`, err);
    throw new Error(`Error creating ${config.displayName.toLowerCase()}`);
  }
};

const deleteGuestUser = async (email) => {
   if (!validateEmail(email)) {
    throw new Error("Invalid email");
  }
  
  try {
    await pool.query(
      `DELETE FROM guest_users WHERE email = $1`,
      [email]
    );

    return ;
  } catch (err) {
    console.error(`Error deleting guest user`, err);
    throw new Error(`Error deleting guest user`);
  }
}

const findUser = async (identifier, typeOfUser) => {
  const userId = await resolveUserId(identifier, typeOfUser);
  const config = getUserConfig(typeOfUser);
  
  try {
    const result = await pool.query(
      `SELECT * FROM ${config.table} WHERE id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    
    // DEBUG: Log the raw database result
    console.log("Database result for user:", {
      id: user.id,
      email: user.email,
      latitude: user.latitude,
      longitude: user.longitude,
      latitudeType: typeof user.latitude,
      longitudeType: typeof user.longitude
    });
    
    return user;
  } catch (err) {
    console.error(`Error finding ${config.displayName.toLowerCase()}:`, err);
    throw new Error(`Error finding ${config.displayName.toLowerCase()}`);
  }
};

// Functie generica pentru actualizarea unui camp
const updateUserField = async (identifier, field, value, typeOfUser = USER_TYPES.USER) => {
  const userId = await resolveUserId(identifier, typeOfUser);

  if (!userId) {
    throw new Error("No user found");
  }

  const config = getUserConfig(typeOfUser);
  
  try {

    const result = await pool.query(
      `UPDATE ${config.table} SET ${field} = $1 WHERE id = $2 RETURNING *`,
      [value, userId]
    );
    return result.rows[0];
  } catch (err) {
    console.error(`Error updating ${config.displayName.toLowerCase()} ${field}:`, err);
    throw new Error(`Error updating ${config.displayName.toLowerCase()} ${field}`);
  }
};

const updateUserProfile = async (userId, data, typeOfUser = USER_TYPES.USER) => {
  
  const config = getUserConfig(typeOfUser);
  try{
  
    const { rows } = await pool.query(
      `UPDATE ${config.table} SET
        name = COALESCE($1, name),
        phone_number = COALESCE($2, phone_number),
        street_address = COALESCE($3, street_address),
        postal_code = COALESCE($4, postal_code),
        city = COALESCE($5, city),
        date_of_birth = COALESCE($6, date_of_birth)
      WHERE id = $7
      RETURNING *`,
      [
        data.name,
        data.phoneNumber,
        data.streetAddress,
        data.postalCode,
        data.city,
        data.dateOfBirth,
        userId
      ]
    );
    return rows[0];

  }catch(err){
    console.error(`Error updating profile ${config.displayName.toLowerCase()}:`, err);
    throw new Error(`Error updating pofie ${config.displayName.toLowerCase()}`);
  }
};

const updateUserPassword = async (identifier, newHashedPassword, typeOfUser = USER_TYPES.USER) => {
  return await updateUserField(identifier, 'password', newHashedPassword, typeOfUser);
};

const updateUserPhone = async (identifier, phoneNumber, typeOfUser = USER_TYPES.USER) => {
  return await updateUserField(identifier, 'phone_number', phoneNumber, typeOfUser);
};

const updateUserStreetAddress = async (identifier, streetAddress, typeOfUser = USER_TYPES.USER) => {
  return await updateUserField(identifier, 'street_address', streetAddress, typeOfUser);
};

const updateUserPostalCode = async (identifier, postalCode, typeOfUser = USER_TYPES.USER) => {
  return await updateUserField(identifier, 'postal_code', postalCode, typeOfUser);
};

const updateUserCity = async (identifier, city, typeOfUser = USER_TYPES.USER) => {
  return await updateUserField(identifier, 'city', city, typeOfUser);
};

const updateUserName = async (identifier, name, typeOfUser = USER_TYPES.USER) => {
  return await updateUserField(identifier, 'name', name, typeOfUser);
};

const updateUserImage = async (identifier, userImage, typeOfUser = USER_TYPES.USER) => {
  return await updateUserField(identifier, 'image', userImage, typeOfUser);
};

const updateUserEmail = async (identifier, newEmail, typeOfUser = USER_TYPES.USER) => {
  if (!validateEmail(newEmail)) {
    throw new Error("Invalid new email");
  }
  return await updateUserField(identifier, 'email', newEmail, typeOfUser);
};

const deleteUser = async (identifier, typeOfUser = USER_TYPES.USER) => {
  const userId = await resolveUserId(identifier, typeOfUser);
  if (!userId) {
    throw new Error("No user found");
  }

  const config = getUserConfig(typeOfUser);
  
  try {
    const result = await pool.query(
      `DELETE FROM ${config.table} WHERE id = $1`,
      [userId]
    );
    if (result.rowCount === 0) {
      throw new Error("No user found with this ID");
    }
    return `${config.displayName} deleted successfully`;
  } catch (err) {
    console.error(`Error deleting ${config.displayName.toLowerCase()}:`, err);
    throw new Error(`Error deleting ${config.displayName.toLowerCase()}`);
  }
};

// Add these functions to your user model file

const updateUserCoordinates = async (identifier, latitude, longitude, typeOfUser = USER_TYPES.USER) => {
  const userId = await resolveUserId(identifier, typeOfUser);
  if (!userId) {
    throw new Error("No user found");
  }
  const config = getUserConfig(typeOfUser);
  
  try {
    const result = await pool.query(
      `UPDATE ${config.table} SET latitude = $1, longitude = $2 WHERE id = $3 RETURNING *`,
      [latitude, longitude, userId]
    );
    return result.rows[0];
  } catch (err) {
    console.error(`Error updating ${config.displayName.toLowerCase()} coordinates:`, err);
    throw new Error(`Error updating ${config.displayName.toLowerCase()} coordinates`);
  }
};

const getUserCoordinates = async (identifier, typeOfUser = USER_TYPES.USER) => {
  const userId = await resolveUserId(identifier, typeOfUser);
  
  if (!userId) {
    throw new Error("No user found");
  }

  const config = getUserConfig(typeOfUser);
  
  try {
    const result = await pool.query(
      `SELECT latitude, longitude FROM ${config.table} WHERE id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return {
      latitude: result.rows[0].latitude,
      longitude: result.rows[0].longitude
    };
  } catch (err) {
    console.error(`Error getting ${config.displayName.toLowerCase()} coordinates:`, err);
    throw new Error(`Error getting ${config.displayName.toLowerCase()} coordinates`);
  }
};

const updateUserLocation = async(userEmail, latitude, longitude, city = null) => {
  const client = await pool.connect();
  
  try {
    const query = `
      UPDATE users 
      SET latitude = $1, longitude = $2, updated_at = NOW() 
      WHERE email = $3
      RETURNING id, email, latitude, longitude, updated_at
    `;
    
    const result = await client.query(query, [latitude, longitude, userEmail]);
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    return result.rows[0];
  } finally {
    client.release();
  }
}


// Export the new functions
export { 
  USER_TYPES,
  createUser,
  findUser,
  resolveUserId,
  updateUserProfile,
  updateUserPassword,
  updateUserEmail,
  updateUserPhone,
  updateUserName,
  updateUserImage,
  updateUserStreetAddress,
  updateUserPostalCode,
  updateUserCity,
  updateUserCoordinates,  // Make sure this is exported
  getUserCoordinates,     // Make sure this is exported
  deleteUser,
  updateUserLocation
};