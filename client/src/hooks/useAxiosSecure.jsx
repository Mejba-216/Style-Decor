import axios from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import useAuth from './useAuth';

const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
});

const useAxiosSecure = () => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Intercept request
    const reqInterceptor = axiosSecure.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor response
    const resInterceptor = axiosSecure.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.log('Axios error:', error);

        const statusCode = error.response?.status;
        if (statusCode === 401 || statusCode === 403) {
          logOut()
            .then(() => {
              navigate('/login');
            })
            .catch((err) => {
              console.error('Logout error:', err);
              navigate('/login');
            });
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosSecure.interceptors.request.eject(reqInterceptor);
      axiosSecure.interceptors.response.eject(resInterceptor);
    };
  }, [user, logOut, navigate]);

  return axiosSecure;
};

export default useAxiosSecure;
