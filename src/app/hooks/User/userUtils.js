
export const validateEmail = (email) => {
    return typeof email === 'string' && email.includes('@');
};

export const validatePhone = (phone) => {
    return typeof phone === 'string' && phone.length === 11;
};

export const validateDate = (date) => {
    return date instanceof Date && !isNaN(date.valueOf());
};

/*
    const setLastName = (name) => {
        if (typeof name === 'string' && name.trim() !== '') {
            setCustomer(prevState => ({ ...prevState, lastName: name }));
        } else {
            throw new Error("Last name must be a non-empty string");
        }
    };
*/
