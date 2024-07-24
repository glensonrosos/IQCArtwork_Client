import * as api from '../api';
import { GET_SUPPLIERS,START_LOADING_HOME,END_LOADING_HOME } from '../constant/actionTypes';

export const getSuppliers = () => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING_HOME});
        const {data} = await api.getSuppliers();
        dispatch({type: GET_SUPPLIERS,payload:data});
        dispatch({type: END_LOADING_HOME});
    }catch(error){
        console.log(error.message)
    }
}