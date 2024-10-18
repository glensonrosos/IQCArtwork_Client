import * as api from '../api';
import { GET_DEFECT_DATAS, CREATE_DEFECT_DATA,CHECK_EMPTY_DEFECT,START_LOADING_HOME,END_LOADING_HOME,SET_MESSAGE_NULL } from '../constant/actionTypes';

export const getDefectDatas = ({inspectionId,passType}) => async (dispatch) =>{
    try{
        dispatch({type:START_LOADING_HOME});
        const {data} = await api.getDefectDatas({inspectionId,passType});
        dispatch({type: GET_DEFECT_DATAS,payload:data});
        dispatch({type:END_LOADING_HOME});
    }catch(error){
        console.log(error)
    }
}

export const createDefectData = (newDefectData) => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING_HOME});
        const { data } = await api.createDefectData(newDefectData);
        dispatch({type: CREATE_DEFECT_DATA, payload: data});
        dispatch({type: END_LOADING_HOME});
    }catch(error){
        console.log(error);
    }
}


export const checkEmptyDefect = (newDefectData) => async (dispatch) =>{
    try{
        dispatch({type: START_LOADING_HOME});
        const { data } = await api.checkEmptyDefect(newDefectData);
        dispatch({type: CHECK_EMPTY_DEFECT, payload: data});
        dispatch({type: END_LOADING_HOME});
    }catch(error){
        console.log(error);
    }
}

export const setItemMessageNull = () => async (dispatch) =>{
    dispatch({type: SET_MESSAGE_NULL});
}