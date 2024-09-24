import * as api from '../api';
import { GET_AREAS,START_LOADING_HOME,END_LOADING_HOME } from '../constant/actionTypes';

export const getAreas = () => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING_HOME});
        const {data} = await api.getAreas();
        dispatch({type: GET_AREAS,payload:data});
        dispatch({type: END_LOADING_HOME});
    }catch(error){
        console.log(error.message)
    }
}