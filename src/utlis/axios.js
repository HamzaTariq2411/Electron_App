import axios from "axios";

export const fetchApi = axios.create({
  // baseURL:process.env.REACT_APP_API_URL,
  baseURL:'http://127.0.0.1:8000/api/',
  headers: { "Content-Type": "application/json" },
});


