import { FIND_ITEMS,GET_ITEMS,GET_ITEM_BY_ID,SET_MESSAGE_NULL,START_LOADING_HOME,END_LOADING_HOME } from "../constant/actionTypes";

const defaultState = {
    isLoading: false,
    items:[],
    currentPage:1,
    numberOfPages:1,
    total:1,
    message: null,
    selectedItem: null,
}


export default(state = defaultState,action) =>{
    switch(action.type){
        case GET_ITEMS:
            const {items,currentPage,numberOfPages } = action.payload;
            return {
                ...state,
                items,
                currentPage,
                numberOfPages,
                message: null,
                selectedItem: null
            };
        case GET_ITEM_BY_ID:
        case FIND_ITEMS:
            if(action.payload?.message === 'no found'){
                return {
                    ...state,
                    message:"no found",
                    items: [],
                }
            }else if(action.payload?.message === 'item found'){
                return {
                    ...state,
                    items: action.payload?.items,
                    message: "item found",
                }
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