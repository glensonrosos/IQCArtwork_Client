import { CREATE_DEFECT_DATA,GET_DEFECT_DATAS,SET_MESSAGE_NULL,START_LOADING_HOME,END_LOADING_HOME } from "../constant/actionTypes";

const defaultState = {
    isLoading: false,
    defectDatas:[],
    defectDetailsLogs:null,
    currentPage:1,
    numberOfPages:1,
    total:1,
    message: null,
}


export default(state = defaultState,action) =>{
    switch(action.type){
        case GET_DEFECT_DATAS:
            return {
                ...state,
                defectDatas: action.payload?.defectDetails,
                defectDetailsLogs: action.payload,
                message: null,
            };
        case CREATE_DEFECT_DATA:
            if(action.payload?.message === 'duplicate')
                return {
                    ...state,
                    message: 'duplicate',
                }
            else if(action.payload?.message === 'good')
                return {
                    ...state,
                    message:'good',
                    defectDatas :action.payload?.defectDatas
            };
        case START_LOADING_HOME:
            return{
                ...state,
                isLoading:true
            }
        case END_LOADING_HOME:
            return{
                ...state,
                isLoading:false
            }
        case SET_MESSAGE_NULL:
            return{
                ...state,
                message:null,
            }
        default:
            return state;
    }
}