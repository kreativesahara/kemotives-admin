import {axiosPrivate} from '../api/axios';
import useAuth from './useAuth';

const useRefreshToken = () => {
    const { setAuth } = useAuth();
    const refresh = async () => {
        try {
           
            const response = await axiosPrivate.get('/api/refresh');
            const { id, firstname, lastname, email, roles, accessToken } = response.data;

            if (!response.data) {
                setAuth(null);
                return null;
            }else{
                setAuth((prev) => {
                    return ({
                        ...prev,
                        id: id,
                        firstname: firstname,
                        lastname: lastname,
                        email: email,
                        roles: roles,
                        accessToken: accessToken,
                    });
                });
            }         
         
        } catch (err) {         
            return null;
        }
    };
    return refresh;
};

export default useRefreshToken;
