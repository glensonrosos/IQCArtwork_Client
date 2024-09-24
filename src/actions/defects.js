import * as api from '../api';
import { GET_DEFECTS,START_LOADING_HOME,END_LOADING_HOME } from '../constant/actionTypes';

export const getDefects = () => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING_HOME});
        const {data} = await api.getDefects();
        dispatch({type: GET_DEFECTS,payload:data});
        dispatch({type: END_LOADING_HOME});
    }catch(error){
        console.log(error.message)
    }
}