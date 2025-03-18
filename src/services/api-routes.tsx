import axios, { AxiosError, AxiosResponse } from "axios";

const api = axios.create();

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    console.log("error interceptor", error);

    return Promise.reject(error);
  }
);

export default api;
