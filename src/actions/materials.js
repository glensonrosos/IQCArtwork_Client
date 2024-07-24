import * as api from '../api';
import { GET_MATERIALS,START_LOADING_HOME,END_LOADING_HOME } from '../constant/actionTypes';

export const getMaterials = () => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING_HOME});
        const {data} = await api.getMaterials();
        dispatch({type: GET_MATERIALS,payload:data});
        dispatch({type: END_LOADING_HOME});
    }catch(error){
        console.log(error.message)
    }
}