import { GET_MOLD_MATERIALS,START_LOADING_HOME,END_LOADING_HOME } from "../constant/actionTypes";

const defaultState = {
    isLoading: false,
    moldMaterials:[],
}

export default(state = defaultState,action) =>{
    switch(action.type){
        case GET_MOLD_MATERIALS:
            return {
                ...state,
                moldMaterials: action.payload
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