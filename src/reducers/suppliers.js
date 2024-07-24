import { GET_SUPPLIERS,START_LOADING_HOME,END_LOADING_HOME } from "../constant/actionTypes";

const defaultState = {
    isLoading: false,
    suppliers:[],
}

export default(state = defaultState,action) =>{
    switch(action.type){
        case GET_SUPPLIERS:
            return {
                ...state,
                suppliers: action.payload
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
        default:
            return state;
    }
}