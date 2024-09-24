import { combineReducers } from "redux";
import inspections from './inspections';
import items from './items';
import buyers from "./buyers";
import areas from "./areas";
import defects from "./defects";
import materials from "./materials";
import suppliers from "./suppliers";
import auth from './auth';
import defectDatas from './defectDatas';

export default combineReducers({
    inspections,
    items,
    areas,
    defects,
    buyers,
    materials,
    suppliers,
    auth,
    defectDatas
});