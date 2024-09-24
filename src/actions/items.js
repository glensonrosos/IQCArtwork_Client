import * as api from '../api';
import { GET_ITEMS,CREATE_ITEM,EDIT_ITEM,FIND_ITEMS,GET_ITEM_BY_ID,START_LOADING_HOME,CLEAR_ITEM_TABLE,END_LOADING_HOME,SET_MESSAGE_NULL,GET_ITEMS_BY_SEARCH } from '../constant/actionTypes';

export const getItems = (page) => async (dispatch) =>{
    try{
        dispatch({type:START_LOADING_HOME});
        const {data} = await api.getItems(page);
        dispatch({type: GET_ITEMS,payload:data});
        dispatch({type:END_LOADING_HOME});
    }catch(error){
        console.log(error)
    }
}

export const findItems = (item) => async (dispatch) =>{
    try{
       dispatch({type:START_LOADING_HOME});

        const {data} = await api.findItems(item);

        dispatch({type: FIND_ITEMS,payload:data});

       dispatch({type:END_LOADING_HOME});
       
    }catch(error){
        console.log(error)
    }
}

export const getItemById = (id) => async (dispatch) =>{
    try{
       dispatch({type:START_LOADING_HOME});

        const {data} = await api.getItemById(id);

        dispatch({type: GET_ITEM_BY_ID,payload:data});

       dispatch({type:END_LOADING_HOME});
       
    }catch(error){
        console.log(error)
    }
}

export const setItemMessageNull = () => async (dispatch) =>{
    dispatch({type: SET_MESSAGE_NULL});
}