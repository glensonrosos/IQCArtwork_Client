import * as api from '../api';
import { GET_BUYERS,START_LOADING_HOME,END_LOADING_HOME } from '../constant/actionTypes';

export const getBuyers = () => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING_HOME});
        const {data} = await api.getBuyers();
        dispatch({type: GET_BUYERS,payload:data});
        dispatch({type: END_LOADING_HOME});
    }catch(error){
        console.log(error.message)
    }
}