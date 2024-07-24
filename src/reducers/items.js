import { CREATE_ITEM,EDIT_ITEM,GET_ITEMS,SET_MESSAGE_NULL,CLEAR_ITEM_TABLE,START_LOADING_HOME,END_LOADING_HOME,GET_ITEMS_BY_SEARCH } from "../constant/actionTypes";

const defaultState = {
    isLoading: false,
    items:[],
    currentPage:1,
    numberOfPages:1,
    total:1,
    message: null,
}


export default(state = defaultState,action) =>{
    switch(action.type){
        case GET_ITEMS:
        case GET_ITEMS_BY_SEARCH:
            const {items,currentPage,numberOfPages } = action.payload;
            return {
                ...state,
                items,
                currentPage,
                numberOfPages,
                message: null,
            };
        case CREATE_ITEM:
          if(action.payload?.message === 'duplicate')
            return {
                ...state,
                message:'duplicate',
            }
         else
            return {
                ...state,
                message:'good',
                items :[
                    ...state.items, 
                    action.payload
                ]
            };
        case EDIT_ITEM:
            if(action.payload?.message === 'edit duplicate')
                return {
                    ...state,
                    message:'edit duplicate',
                    }
                else
                    return {
                        ...state,
                        message:'edit good',
                        items : state.items.map((i)=> i._id === action.payload._id ? action.payload : i)
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
        case CLEAR_ITEM_TABLE:
            return{
                ...state,
                items:[]
            }
        default:
            return state;
    }
}