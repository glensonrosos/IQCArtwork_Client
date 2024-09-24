import { GET_DEFECTS,START_LOADING_HOME,END_LOADING_HOME } from "../constant/actionTypes";

const defaultState = {
    isLoading: false,
    defects:[],
}

export default(state = defaultState,action) =>{
    switch(action.type){
        case GET_DEFECTS:
            return {
                ...state,
                defects: action.payload
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