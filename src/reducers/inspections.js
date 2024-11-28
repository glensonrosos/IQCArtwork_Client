import { CREATE_INSPECTION,GET_INSPECTIONS,GET_EXPORT_REPORT_LIST,GET_INSPECTIONS_BY_SEARCH,START_LOADING_HOME,END_LOADING_HOME,SET_MESSAGE_NULL,GET_INSPECTION_BY_ID, 
    EDIT_INSPECTION,GET_EXPORT_DEFECTS_REPORT,GET_EXPORT_SUM_REPORT,GET_EXPORT_SUPPLIERS_SUM_REPORT,GET_EXPORT_ITEMS_SUM_REPORT,SET_CLEAR_STATES} from "../constant/actionTypes";

const defaultState = {
    isLoading: false,
    inspections:[],
    currentPage:1,
    numberOfPages:1,
    total:1,
    message: null,
    inspectionsList:[],
    defectDataList:[],
    exportSumReport:[],
    exportSuppliersSumReport:[],
    exportItemsSumReport:[],
    exportDefectsReport:[],
    affectedRowsInspection:[]
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
                    exportSumReport:[],
                    exportDefectsReport:[],
                    exportSuppliersSumReport:[],
                    exportItemsSumReport:[],
                    inspectionsList: action.payload?.inspectionsList,
                    defectDataList:  action.payload?.defectDataList,
                }
            else if(action.payload?.message == 'export no')
                return{
                    ...state,
                    message: 'export no',
                }
        case GET_EXPORT_SUM_REPORT:
            if(action.payload?.message == 'export sum')
                return{
                    ...state,
                    message: 'export sum',
                    inspectionsList: [],
                    defectDataList: [],
                    exportDefectsReport:[],
                    exportSuppliersSumReport:[],
                    exportItemsSumReport:[],
                    exportSumReport: action.payload?.exportSumReport,
                }
            else if(action.payload?.message == 'export no')
                return{
                    ...state,
                    message: 'export no',
                }
        case GET_EXPORT_SUPPLIERS_SUM_REPORT:
            if(action.payload?.message == 'export suppliers sum')
                return{
                    ...state,
                    message: 'export suppliers sum',
                    inspectionsList: [],
                    defectDataList: [],
                    exportDefectsReport:[],
                    exportSumReport:[],
                    exportItemsSumReport:[],
                    exportSuppliersSumReport:action.payload?.exportSuppliersSumReport,
                    affectedRowsInspection: action.payload?.affectedRowsInspection,
                }
            else if(action.payload?.message == 'export no')
                return{
                    ...state,
                    message: 'export no',
                }
        case GET_EXPORT_ITEMS_SUM_REPORT:
            if(action.payload?.message == 'export items sum')
                return{
                    ...state,
                    message: 'export items sum',
                    inspectionsList: [],
                    defectDataList: [],
                    exportDefectsReport:[],
                    exportSumReport:[],
                    exportSuppliersSumReport:[],
                    exportItemsSumReport:action.payload?.exportItemsSumReport,
                    affectedRowsInspection: action.payload?.affectedRowsInspection,
                }
            else if(action.payload?.message == 'export no')
                return{
                    ...state,
                    message: 'export no',
                }
        case GET_EXPORT_DEFECTS_REPORT:
            if(action.payload?.message == 'export defects')
                return{
                    ...state,
                    message: 'export defects',
                    inspectionsList:[],
                    defectDataList:[],
                    exportSumReport:[],
                    exportSuppliersSumReport:[],
                    exportItemsSumReport:[],
                    exportDefectsReport: action.payload?.exportDefectsReport,
                    affectedRowsInspection: action.payload?.affectedRowsInspection,
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
        case SET_CLEAR_STATES:
            return{
                isLoading: false,
                inspections:[],
                currentPage:1,
                numberOfPages:1,
                total:1,
                message: null,
                inspectionsList:[],
                defectDataList:[],
                exportSumReport:[],
                exportDefectsReport:[],
                exportSuppliersSumReport:[],
                exportItemsSumReport:[],
            }
        default:
            return state;
    }
}