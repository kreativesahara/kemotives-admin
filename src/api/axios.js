import axios from 'axios';
const BASE_URL = 'https://backend.diksxcars.co.ke' || import.meta.env.VITE_API_URL;
// const BASE_URL = 'http://localhost:4000' || import.meta.env.VITE_API_URL;

export default axios.create({
    baseURL: BASE_URL 
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: {
         'Content-Type': 'application/json',
         'Access-Control-Allow-Origin': '*'
         },
    withCredentials: true
});
