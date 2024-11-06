import axios from 'axios';

const API = axios.create({baseURL: 'http://10.0.1.221:5000/ia'});

//ITEM
export const getItems = (page) => API.get(`/items?page=${page}`);
export const findItems = (item) => API.post(`/items/findItems`,item);
export const getItemById = (id) => API.get(`/items/${id}/getItemById`);
export const createItem = (newItem) => API.post(`/items`,newItem);
export const editItem = (id,editedItem) => API.patch(`/items/${id}/editItem`,editedItem);

//DEFECT DATA
export const getDefectDatas = (option) => API.get(`/defectDatas/${encodeURIComponent(option.inspectionId)}/${encodeURIComponent(option.passType)}`);
export const createDefectData = (newDefectDatas) => API.post(`/defectDatas`,newDefectDatas);
export const checkEmptyDefect = (newDefectDatasVal) => API.post(`/defectDatas/checkEmptyDefect`,newDefectDatasVal);

//INSPECTIONS
export const getInspectionById = (id) => API.get(`/inspections/${id}/getInspectionById`);
export const getInspections = (page) => API.get(`/inspections?page=${page}`);
export const getInspectionsBySearch = (search) => API.get(`/inspections/search?itemcode=${search.itemcode}&color=${search.color}&datestart=${search.datestart}&dateend=${search.dateend}&buyer=${search.buyer}&supplier=${search.supplier}&material=${search.material}&unfinished=${search.unfinished}&page=${search.page}`);
export const createInspection = (newInspection) => API.post(`/inspections`,newInspection);

export const getExportReportList = (report) => API.post(`/inspections/getExportReportList`,report);
export const getExportSumReport = (report) => API.post(`/inspections/getExportSumReport`,report);
export const getExportDefectsReport = (report) => API.post(`/inspections/getExportDefectsReport`,report);

export const editInspection = (id,editedInspection) => API.patch(`/inspections/${id}/editInspection`,editedInspection);


// DELIVERIES
export const getDeliveriesByMoldId = (id) => API.get(`/deliveries/${id}/getDeliveriesByMoldId`);
export const deleteDeliveriesByMoldId = (id) => API.delete(`/deliveries/${id}/deleteDeliveriesByMoldId`);
export const addDelivery = (id,newDelivery) => API.post(`/deliveries/${id}/addDelivery`,newDelivery);
export const findPO = (details) => API.post(`/deliveries/findPO`,details);
export const editDelivery = (id,newDelivery) => API.patch(`/deliveries/${id}/editDelivery`,newDelivery);

//BUYER
export const getBuyers = () => API.get(`/buyers`);

//BUYER
export const getAreas = () => API.get(`/areas`);

//BUYER
export const getDefects = () => API.get(`/defects`);

//SUPPLIERS
export const getSuppliers = () => API.get(`/suppliers`);

//MATERIALS
export const getMaterials = () => API.get(`/materials`);

// AUTH
export const signIn = (user) => API.post(`/auth/signIn`,user);
export const changePassword = (user) => API.post('/auth/changePassword',user);