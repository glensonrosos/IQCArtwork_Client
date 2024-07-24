import { GET_MATERIALS,START_LOADING_HOME,END_LOADING_HOME } from "../constant/actionTypes";

const defaultState = {
    isLoading: false,
    materials:[],
}

export default(state = defaultState,action) =>{
    switch(action.type){
        case GET_MATERIALS:
            return {
                ...state,
                materials: action.payload
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