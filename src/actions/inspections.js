import * as api from '../api';
import {CREATE_INSPECTION,START_LOADING_HOME,EDIT_INSPECTION,END_LOADING_HOME,SET_MESSAGE_NULL,GET_INSPECTION_BY_ID,GET_INSPECTIONS_BY_SEARCH, GET_INSPECTIONS} from '../constant/actionTypes';


export const getInspections = (page) => async (dispatch) =>{
    try{
        dispatch({type:START_LOADING_HOME});
        const {data} = await api.getInspections(page);
        dispatch({type: GET_INSPECTIONS,payload:data});
        dispatch({type:END_LOADING_HOME});
    }catch(error){
        console.log(error)
    }
}

export const getInspectionsBySearch = (search) => async (dispatch) =>{
    try{
        dispatch({type:START_LOADING_HOME});
        //clearItemTable();
        const {data} = await api.getInspectionsBySearch(search);
        dispatch({type: GET_INSPECTIONS_BY_SEARCH,payload:data});
        dispatch({type:END_LOADING_HOME});
    }catch(error){
        console.log(error)
    }
}

export const createInspection = (newInspection) => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING_HOME});
        const { data } = await api.createInspection(newInspection);

        dispatch({type: CREATE_INSPECTION, payload: data});

        dispatch({type: END_LOADING_HOME});

    }catch(error){
        console.log(error);
    }
}

export const editInspection = (id,editedInspection) => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING_HOME});
        const { data } = await api.editInspection(id,editedInspection);

        dispatch({type: EDIT_INSPECTION, payload: data});

        dispatch({type: END_LOADING_HOME});

    }catch(error){
        console.log(error);
    }
}

export const getInspectionById = (id) => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING_HOME});
        const {data} = await api.getInspectionById(id);
        dispatch({type: GET_INSPECTION_BY_ID,payload:data});
        dispatch({type: END_LOADING_HOME});
    }catch(error){
        console.log(error.message)
    }
}


export const setInspectionMessageNull = () => async (dispatch) =>{
    dispatch({type: SET_MESSAGE_NULL});
}

