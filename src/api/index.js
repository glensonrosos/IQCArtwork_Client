import axios from 'axios';

const API = axios.create({baseURL: 'http://10.0.1.221:5000/mm'});

//ITEM
export const getItems = (page) => API.get(`/items?page=${page}`);
export const getItemsBySearch = (search) => API.get(`/items/search?itemcode=${search.itemcode}&itemdesc=${search.itemdesc}&buyer=${search.buyer}&supplier=${search.supplier}&material=${search.material}&moldMaterial=${search.moldMaterial}&page=${search.page}`);
export const createItem = (newItem) => API.post(`/items`,newItem);
export const editItem = (id,editedItem) => API.patch(`/items/${id}/editItem`,editedItem);

//MOLD
export const getMolds = () => API.get(`/molds`);
export const countNearValidation = () => API.get(`/molds/countNearValidation`);
export const getMoldsByItemId = (id) => API.get(`/molds/${id}/getMoldsByItemId`);
export const createMold = (id,newMold) => API.post(`/molds/${id}/createMold`,newMold);
export const findMold = (search) => API.post(`/molds/findMold`,search);
export const exportReport = (report) => API.post(`/molds/exportReport`,report);
export const editMoldWithId = (id,editMold) => API.patch(`/molds/${id}/editMoldWithId`,editMold);


// DELIVERIES
export const getDeliveriesByMoldId = (id) => API.get(`/deliveries/${id}/getDeliveriesByMoldId`);
export const deleteDeliveriesByMoldId = (id) => API.delete(`/deliveries/${id}/deleteDeliveriesByMoldId`);
export const addDelivery = (id,newDelivery) => API.post(`/deliveries/${id}/addDelivery`,newDelivery);
export const findPO = (details) => API.post(`/deliveries/findPO`,details);
export const editDelivery = (id,newDelivery) => API.patch(`/deliveries/${id}/editDelivery`,newDelivery);

//BUYER
export const getBuyers = () => API.get(`/buyers`);

//SUPPLIERS
export const getSuppliers = () => API.get(`/suppliers`);

//MATERIALS
export const getMaterials = () => API.get(`/materials`);

//MOLD MATERIALS
export const getMoldMaterials = () => API.get(`/moldMaterials`);

//MOLDS

// AUTH
export const signIn = (user) => API.post(`/auth/signIn`,user);
export const changePassword = (user) => API.post('/auth/changePassword',user);