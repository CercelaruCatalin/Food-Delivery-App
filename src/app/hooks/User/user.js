import { useState, useCallback } from 'react';
import { validateEmail, validatePhone, validateDate } from './userUtils';

export function useUser(initialState = {}) {
    // Ensure initialState has default values to avoid issues
    const [user, setUser] = useState({
        id: null,
        email: "",
        password: "",
        name: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        streetAddress: "",
        postalCode: "",
        city: "",
        dateOfBirth: "",
        latitude: null,
        longitude: null,
        ...initialState // Merge with provided initialState
    });
    
    const updateField = useCallback((field, value) => {
        setUser(prevState => ({ ...prevState, [field]: value }));
    }, []);
   
    const updateUser = useCallback((updates) => {
        setUser(prevState => ({ ...prevState, ...updates }));
    }, []);
    
    const setUserId = useCallback((id) => {
        setUser(prevState => ({ ...prevState, id }));
    }, []);
   
    const setEmail = useCallback((email) => {
        setUser(prevState => ({ ...prevState, email }));
    }, []);
   
    const setPassword = useCallback((password) => {
        setUser(prevState => ({ ...prevState, password }));
    }, []);
   
    const setFirstName = useCallback((name) => {
        setUser(prevState => ({ ...prevState, firstName: name }));
    }, []);
   
    const setLastName = useCallback((name) => {
        setUser(prevState => ({ ...prevState, lastName: name }));
    }, []);
   
    const setPhoneNumber = useCallback((phoneNumber) => {
        setUser(prevState => ({ ...prevState, phoneNumber }));
    }, []);
   
    const setStreetAddress = useCallback((streetAddress) => {
        setUser(prevState => ({ ...prevState, streetAddress }));
    }, []);
   
    const setPostalCode = useCallback((postalCode) => {
        setUser(prevState => ({ ...prevState, postalCode }));
    }, []);
   
    const setCity = useCallback((city) => {
        setUser(prevState => ({ ...prevState, city }));
    }, []);
   
    const setDateOfBirth = useCallback((date) => {
        setUser(prevState => ({ ...prevState, dateOfBirth: date }));
    }, []);

    const setLongitude = useCallback((longitude) => {
        setUser(prevState => ({ ...prevState, longitude }));
    }, []);

    const setLatitude = useCallback((latitude) => {
        setUser(prevState => ({ ...prevState, latitude }));
    }, []);
   
    return {
        user,
        updateField,
        updateUser,
        setUserId,
        setEmail,
        setPassword,
        setFirstName,
        setLastName,
        setPhoneNumber,
        setStreetAddress,
        setPostalCode,
        setCity,
        setDateOfBirth,
        setLatitude,
        setLongitude
    };
}