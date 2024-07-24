import { AUTH_SIGNIN,AUTH_LOGOUT,START_LOADING,END_LOADING,AUTH_CHANGE_PASSWORD} from "../constant/actionTypes";

const defaultState = {
    authData:null,
    message:null,
}

export default(state = defaultState,action) =>{
    switch(action.type){
        case AUTH_SIGNIN:
            localStorage.setItem('profile', JSON.stringify({...action?.payload.data}));

            return {
                ...state,
                authData : action?.payload.data,
                message: action?.payload?.data?.message
            };
        case AUTH_LOGOUT:
            localStorage.clear();
            return{
                ...state,
                authData:null
            }
        case AUTH_CHANGE_PASSWORD:
            return{
                ...state,
                message: action?.payload?.data?.message
            }
        case START_LOADING:
            return{
                ...state,
                isLoading:true
            }
        case END_LOADING:
            return{
                ...state,
                isLoading:false
            }
        default:
            return state;
    }
}