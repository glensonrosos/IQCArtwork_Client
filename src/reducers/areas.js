import { GET_AREAS,START_LOADING_HOME,END_LOADING_HOME } from "../constant/actionTypes";

const defaultState = {
    isLoading: false,
    areas:[],
}

export default(state = defaultState,action) =>{
    switch(action.type){
        case GET_AREAS:
            return {
                ...state,
                areas: action.payload
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