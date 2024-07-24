import { GET_DELIVERIES_BY_MOLD_ID,ADD_DELIVERY,FIND_PO,EDIT_DELIVERY,START_LOADING_HOME,END_LOADING_HOME,DELETE_DELIVERIES_BY_MOLD_ID } from "../constant/actionTypes";

const defaultState = {
    isLoading: false,
    deliveries:[],
    message: null,
    poList:[]
}


export default(state = defaultState,action) =>{
    switch(action.type){
        case GET_DELIVERIES_BY_MOLD_ID:
            return {
                ...state,
                deliveries: action.payload,
                message:null,
            }
        case ADD_DELIVERY:
            if(action.payload?.message == 'exceed')
                return {
                    ...state,
                    message: 'exceed',
                }
            else
                return {
                    ...state,
                    message:'good',
                    deliveries :[
                        ...state.deliveries, 
                        action.payload
                    ]
                };
        case EDIT_DELIVERY:
            if(action.payload?.message == 'exceed')
                return {
                    ...state,
                    message: 'exceed',
                }
            else
                return {
                    ...state,
                    message:'edited',
                    deliveries : state.deliveries.map((i)=> i._id === action.payload._id ? action.payload : i)
                };
        case DELETE_DELIVERIES_BY_MOLD_ID:
            if(action.payload?.message == 'deleted')
                return {
                    ...state,
                    deliveries:[],
                }
            else
                return state
        case FIND_PO:
            if(action.payload?.message == 'not found'){
                return {
                    ...state,
                    message:"not found",
                    poList:[],
                }
            }else if(action.payload?.message == 'po found'){
                return {
                    ...state,
                    message:"po found",
                    poList:action.payload.poList,
                }
            }
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