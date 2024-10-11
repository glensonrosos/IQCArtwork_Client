import { CREATE_INSPECTION,GET_INSPECTIONS,GET_EXPORT_REPORT_LIST,GET_INSPECTIONS_BY_SEARCH,START_LOADING_HOME,END_LOADING_HOME,SET_MESSAGE_NULL,GET_INSPECTION_BY_ID, EDIT_INSPECTION} from "../constant/actionTypes";

const defaultState = {
    isLoading: false,
    inspections:[],
    currentPage:1,
    numberOfPages:1,
    total:1,
    message: null,
    inspectionsList:[],
    defectDataList:[],
}


export default(state = defaultState,action) =>{
    switch(action.type){
       
        case GET_INSPECTIONS:
        case GET_INSPECTIONS_BY_SEARCH:
            const {inspections,currentPage,numberOfPages } = action.payload;
            return {
                ...state,
                inspections,
                currentPage,
                numberOfPages,
                message:null,
            }
        case EDIT_INSPECTION:
            if(action.payload?.message === 'edit duplicate')
                return {
                    ...state,
                    message:'edit duplicate',
                    }
            else
                return {
                    ...state,
                    message:'edit good',
                    inspections :[
                        action.payload
                    ]
                };
        case CREATE_INSPECTION:
            if(action.payload?.message === 'duplicate')
                return {
                    ...state,
                    message: 'duplicate',
                }
            else if(action.payload?.message === 'good')
                return {
                    ...state,
                    message:'good',
                    inspections :[
                        action.payload?.inspection
                    ]
            };
        case GET_INSPECTION_BY_ID:
            if(action.payload?.message === 'no found')
                return {
                    ...state,
                    inspections:[],
                    message: 'no found',
                }
            else if(action.payload?.message === 'found')
                return {
                    ...state,
                    message:'found',
                    inspections :action.payload?.inspection
            };
        case GET_EXPORT_REPORT_LIST:
            if(action.payload?.message == 'export list')
                return{
                    ...state,
                    message: 'export list',
                    inspectionsList: action.payload?.inspectionsList,
                    defectDataList:  action.payload?.defectDataList,
                }
            else if(action.payload?.message == 'export no')
                return{
                    ...state,
                    message: 'export no',
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
        case SET_MESSAGE_NULL:
            return{
                ...state,
                message:null,
            }
        default:
            return state;
    }
}