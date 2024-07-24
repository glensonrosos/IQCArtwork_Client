import * as api from '../api';
import {CREATE_MOLD,FIND_MOLD,COUNT_NEAR_VALIDATION,GET_MOLDS_BY_ITEM_ID,EDIT_MOLD_WITH_ID,START_LOADING_HOME,END_LOADING_HOME,EXPORT_REPORT,CLEAR_MOLD_STATE} from '../constant/actionTypes';

export const createMold = (id,newMold) => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING_HOME});
        const { data } = await api.createMold(id,newMold);

        dispatch({type: CREATE_MOLD, payload: data});

        dispatch({type: END_LOADING_HOME});

    }catch(error){
        console.log(error);
    }
}

export const getMoldsByItemId = (id) => async (dispatch) =>{

    try{
        dispatch({type:START_LOADING_HOME});

        const {data} = await api.getMoldsByItemId(id);

        dispatch({type: GET_MOLDS_BY_ITEM_ID,payload:data});

        dispatch({type:END_LOADING_HOME});
    }catch(error){
        console.log(error)
    }
}

export const findMold = (search) => async (dispatch) =>{

    try{
        dispatch({type:START_LOADING_HOME});

        const {data} = await api.findMold(search);

        dispatch({type: FIND_MOLD,payload:data});

        dispatch({type:END_LOADING_HOME});
    }catch(error){
        console.log(error)
    }
}

export const countNearValidation = () => async (dispatch) =>{
    try{
        dispatch({type:START_LOADING_HOME});

        const {data} = await api.countNearValidation();
        dispatch({type: COUNT_NEAR_VALIDATION,payload:data});

        dispatch({type:END_LOADING_HOME});
    }catch(error){
        console.log(error)
    }
}

export const editMoldWithId = (id,editedMold) => async (dispatch) =>{
    try{
        dispatch({type:START_LOADING_HOME});

        const {data} = await api.editMoldWithId(id,editedMold);

        dispatch({type: EDIT_MOLD_WITH_ID,payload:data});

        dispatch({type:END_LOADING_HOME});
    }catch(error){
        console.log(error)
    }
}




export const exportReport = (report) => async (dispatch) =>{
    try{
        dispatch({type:START_LOADING_HOME});

        const {data} = await api.exportReport(report);

        dispatch({type: EXPORT_REPORT,payload:data});

        dispatch({type:END_LOADING_HOME});
    }catch(error){
        console.log(error)
    }
}

export const clearMoldState = () => async (dispatch) =>{
    dispatch({type: CLEAR_MOLD_STATE});
}
