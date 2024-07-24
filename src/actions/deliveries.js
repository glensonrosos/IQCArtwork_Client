import * as api from '../api';
import { ADD_DELIVERY,EDIT_DELIVERY,FIND_PO,GET_DELIVERIES_BY_MOLD_ID,DELETE_DELIVERIES_BY_MOLD_ID,START_LOADING_HOME,END_LOADING_HOME } from '../constant/actionTypes';

export const addDelivery = (id,newDelivery) => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING_HOME});
        const { data } = await api.addDelivery(id,newDelivery);

        dispatch({type: ADD_DELIVERY, payload: data});

        dispatch({type: END_LOADING_HOME});

    }catch(error){
        console.log(error);
    }
}

export const editDelivery = (id,newDelivery) => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING_HOME});
        const { data } = await api.editDelivery(id,newDelivery);

        dispatch({type: EDIT_DELIVERY, payload: data});

        dispatch({type: END_LOADING_HOME});

    }catch(error){
        console.log(error);
    }
}

export const getDeliveriesByMoldId = (id) => async (dispatch) =>{
    try{
        dispatch({type:START_LOADING_HOME});

        const {data} = await api.getDeliveriesByMoldId(id);

        dispatch({type: GET_DELIVERIES_BY_MOLD_ID,payload:data});

        dispatch({type:END_LOADING_HOME});
    }catch(error){
        console.log(error)
    }
}

export const findPO = (details) => async (dispatch) =>{
    try{
        dispatch({type:START_LOADING_HOME});

        const {data} = await api.findPO(details);

        dispatch({type: FIND_PO,payload:data});

        dispatch({type:END_LOADING_HOME});
    }catch(error){
        console.log(error)
    }
}

export const deleteDeliveriesByMoldId = (id) => async (dispatch) =>{
    try{
        dispatch({type:START_LOADING_HOME});

        const {data} = await api.deleteDeliveriesByMoldId(id);

        dispatch({type: DELETE_DELIVERIES_BY_MOLD_ID,payload:data});

        dispatch({type:END_LOADING_HOME});
    }catch(error){
        console.log(error)
    }
}