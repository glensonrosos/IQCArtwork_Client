import * as api from '../api';
import { AUTH_SIGNIN,START_LOADING,END_LOADING,AUTH_CHANGE_PASSWORD } from '../constant/actionTypes';

export const signIn = (userData,navigate) => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING});
        const data = await api.signIn(userData);
        dispatch({type: AUTH_SIGNIN,payload:data});

        dispatch({type: END_LOADING});
    }catch(error){
        console.log(error.message)
    }
}

export const changePassword = (user) => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING});
        const data = await api.changePassword(user);
       
        dispatch({type: AUTH_CHANGE_PASSWORD,payload:data});
        dispatch({type: END_LOADING});
    }catch(error){
        console.log(error.message)
    }
}