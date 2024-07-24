import * as api from '../api';
import { GET_ITEMS,CREATE_ITEM,EDIT_ITEM,START_LOADING_HOME,CLEAR_ITEM_TABLE,END_LOADING_HOME,SET_MESSAGE_NULL,GET_ITEMS_BY_SEARCH } from '../constant/actionTypes';

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

export const getItemsBySearch = (search) => async (dispatch) =>{
    try{
        dispatch({type:START_LOADING_HOME});
        //clearItemTable();
        const {data} = await api.getItemsBySearch(search);
        dispatch({type: GET_ITEMS_BY_SEARCH,payload:data});
        dispatch({type:END_LOADING_HOME});
    }catch(error){
        console.log(error)
    }
}

export const clearItemTable = () => async (dispatch) =>{
    try{
        dispatch({type: CLEAR_ITEM_TABLE});
    }catch(error){
        console.log(error)
    }
}



export const createItem = (newItem) => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING_HOME});
        const { data } = await api.createItem(newItem);

        dispatch({type: CREATE_ITEM, payload: data});

        dispatch({type: END_LOADING_HOME});

    }catch(error){
        console.log(error);
    }
}

export const editItem = (id,editedItem) => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING_HOME});
        const { data } = await api.editItem(id,editedItem);

        dispatch({type: EDIT_ITEM, payload: data});

        dispatch({type: END_LOADING_HOME});

    }catch(error){
        console.log(error);
    }
}

export const setMessageNull = () => async (dispatch) =>{
    dispatch({type: SET_MESSAGE_NULL});
}