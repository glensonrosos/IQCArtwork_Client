import React, { useState, useEffect } from 'react';
import { DataGridPro,GridToolbarContainer,GridToolbarColumnsButton  } from '@mui/x-data-grid-pro';
import {Box,TextField,Dialog,DialogTitle,IconButton,ListItemText ,DialogContent,Autocomplete,Paper,Pagination,PaginationItem,Stack, FormControlLabel,Checkbox,Button,Backdrop,CircularProgress,Snackbar,Alert, Typography, Tooltip} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionActions from '@mui/material/AccordionActions'
import {Assessment, ExpandMore,Save,Close} from '@mui/icons-material/';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment';

import Slide from '@mui/material/Slide';

import { AUTH_LOGOUT } from '../../../../constant/actionTypes';
import decode from 'jwt-decode';

import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

import { useSelector,useDispatch } from 'react-redux';

import {getBuyers} from '../../../../actions/buyers';
import {getMaterials} from '../../../../actions/materials';
import {getSuppliers} from '../../../../actions/suppliers';

import {getInspections,getInspectionsBySearch,getExportReportList,getExportSumReport,getExportDefectsReport,setInspectionMessageNull,setInspectionClearStates,
  getExportItemsSummaryReport,getExportSuppliersSummaryReport} from '../../../../actions/inspections';

import {useNavigate,useLocation} from 'react-router-dom';


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function useQuery(){
  return new URLSearchParams(useLocation().search);
}

const InspectionTable = () => {

  const query = useQuery();
  const queryPage = query.get('page') || 1;
  const itemCode = query.get('itemcode') || '';
  const color = query.get('color') || '';
  const dateStart = query.get('datestart') || '';
  const dateEnd = query.get('dateend') || '';
  const supplier = query.get('supplier') || '';
  const buyer = query.get('buyer') || '';
  const material = query.get('material') || '';
  const unfinished = query.get('unfinished') || '';

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {suppliers,isLoading:supplierLoading} = useSelector(state=> state.suppliers);
  const {buyers,isLoading:buyerLoading} = useSelector(state=> state.buyers);
  const {materials,isLoading:materialLoading} = useSelector(state=> state.materials);
  const {inspections,message:inspectionMessage,isLoading:inspectionLoading,numberOfPages,inspectionsList,defectDataList,
    exportSumReport,exportSuppliersSumReport,exportItemsSumReport,exportDefectsReport,affectedRowsInspection } = useSelector(state=> state.inspections);
  
  const[input,setInput] = useState({
    itemCode: null,
    supplier:null,
    material:null,
    color:null,
    buyer:null,
    dateStart:null,
    dateEnd:null,
    unfinished:false,
  });

  const[inputReport,setInputReport] = useState({
    itemCode: [],
    supplier:[],
    color:[],
    material:null,
    buyer:null,
    dateStart:null,
    dateEnd:null,
    unfinished:false,
  });


  const [inputSupplier,setInputSupplier] = useState([]);
  const [inputMaterial,setInputMaterial] = useState([]);
  const [inputBuyer,setInputBuyer] = useState([]);

  const [inputSupplierReport,setInputSupplierReport] = useState([]);
  const [inputMaterialReport,setInputMaterialReport] = useState([]);
  const [inputBuyerReport,setInputBuyerReport] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const [snackbar, setSnackbar] = useState(null);
  const handleCloseSnackbar = () => setSnackbar(null);

  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const handleChangePage = (newPage) =>{
    if(itemCode == '' && color == ''&& dateStart == '' && dateEnd == '' && supplier == '' && buyer == ''
        && supplier == '' && material == '' && unfinished == ''){
          console.log(`handleChangePage true`);
      navigate(`/inspection-list?page=${newPage}`);
      dispatch(getInspections(newPage));
    } 
    else{
      console.log(`handleChangePage false`);
      console.log(`date start => ${dateStart != '' ? moment(dateStart, 'MM-DD-YYYY') : '' }`);
      console.log(`supplier obj => ${supplier != '' ? inputSupplier.find(sup => supplier == sup?.name)._id : ''}`);

      dispatch(getInspectionsBySearch({
        itemcode: itemCode != '' ? itemCode : '',
        itemcode: color != '' ? color : '',
        datestart: dateStart != '' ? moment(dateStart, 'MM-DD-YYYY') : '',
        dateend: dateEnd != '' ? moment(dateEnd, 'MM-DD-YYYY') : '',
        buyer: buyer != '' ? inputBuyer.find(buy => buyer == buy?.name)._id : '',
        supplier: supplier != '' ? inputSupplier.find(sup => supplier == sup?.name)._id : '',
        material: material != '' ? inputMaterial.find(mat => material == mat?.name)._id : '',
        unfinished: unfinished != '' ? unfinished : '',
        page:newPage}));

        navigate(`/inspection-list/search?itemcode=${itemCode || ''}&color=${color || ''}&datestart=${dateStart && dateStart !== '' ? moment(dateStart).format('MM-DD-YYYY') : ''}&dateend=${dateEnd && dateEnd !== '' ? moment(dateEnd).format('MM-DD-YYYY') : ''}&supplier=${supplier || ''}&buyer=${buyer || ''}&material=${material || ''}&unfinished=${unfinished || ''}&page=${newPage}`);
    }
  }

  useEffect(()=>{
      navigate(`/inspection-list?page=1`);
      dispatch(getInspections(1));

      dispatch(getSuppliers());
      dispatch(getBuyers());
      dispatch(getMaterials());
  },[dispatch]);


  useEffect(()=>{
    if(!inspectionLoading && inspectionMessage == 'export list' && inspectionsList.length > 0 && defectDataList.length > 0){
      // Define the header data in a single row
      const headerData = [
        ["Date Start", "Date End", "ItemCode", "Color", "Material", "Buyer", "Supplier"]
      ];

      // Define the search criteria data
      const searchCriteriaData = [];
      const maxLength = Math.max(
        inputReport?.itemCode?.length || 0,
        inputReport?.color?.length || 0,
        inputReport?.supplier?.length || 0,
        1 // Ensure at least one row for dateStart and dateEnd
      );

      // Loop through the maximum length and populate data
      for (let index = 0; index < maxLength; index++) {
        const itemCodeValue = inputReport?.itemCode?.[index] || "";
        const colorValue = inputReport?.color?.[index] || "";
        const supplierValue = inputReport?.supplier?.[index]?.name || "";

        searchCriteriaData.push([
          index === 0 ? (inputReport?.dateStart ? moment(inputReport.dateStart).format("MM-DD-YYYY") : "") : "", // Date Start
          index === 0 ? (inputReport?.dateEnd ? moment(inputReport.dateEnd).format("MM-DD-YYYY") : "") : "", // Date End
          itemCodeValue, // ItemCode
          colorValue, // Color
          index === 0 ? (inputReport?.material?.name || "") : "", // Material
          index === 0 ? (inputReport?.buyer?.name || "") : "", // Buyer
          supplierValue // Supplier
        ]);
      }

      // Handle case where no rows were generated but dateStart and dateEnd are mandatory
      if (searchCriteriaData.length === 0) {
        searchCriteriaData.push([
          inputReport?.dateStart ? moment(inputReport.dateStart).format("MM-DD-YYYY") : "", // Date Start
          inputReport?.dateEnd ? moment(inputReport.dateEnd).format("MM-DD-YYYY") : "", // Date End
          "", // ItemCode
          "", // Color
          inputReport?.material?.name || "", // Material
          inputReport?.buyer?.name || "", // Buyer
          "" // Supplier
        ]);
      }

      // Add a few empty rows for spacing
      const emptyRows = Array(2).fill([]); // Adjust the number of empty rows as needed

      // Map inspectionsList into rows of data
      const inspectionsRows = inspectionsList.map((inspection) => [
        inspection.RowId,
        inspection.Date,
        inspection.Supplier,
        inspection.ItemCode,
        inspection.ItemDescription,
        inspection.ColorFinish,
        inspection.Buyer,
        inspection.Material,
        inspection.Weight,
        inspection.TotalMinWork,
        inspection.DeliveryQty,
        inspection.TotalGoodQty,
        inspection.TotalPullOutQty,
        inspection.FirstPass_Defect,
        inspection.FirstPass_Good,
        inspection.FirstPass_PullOut,
        inspection.SecondPass_Good,
        inspection.SecondPass_PullOut,
        inspection.Unfinished,
        inspection.DateClosure
      ]);

      // Define the inspections list header row
      const inspectionsHeader = [
        "RowId", "Date", "Supplier", "ItemCode", "ItemDescription", "ColorFinish",
        "Buyer", "Material", "Weight","TotalMinWork", "DeliveryQty", "Total Good",
        "Total PullOut", "(1P) Defect", "(1P) Good", "(1P) PullOut",
        "(2P) Good", "(2P) PullOut", "Unfinished", "DateClosure"
      ];

      // Combine everything into a single sheet data array
      const searchData = [...headerData, ...searchCriteriaData,];
      const sheetData = [inspectionsHeader, ...inspectionsRows];

      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Convert sheetData into a sheet and append it to the workbook
      const wsInspections = XLSX.utils.aoa_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(wb, wsInspections, "InspectionList");

      // Add defectDataList to a new sheet
      const wsDefects = XLSX.utils.json_to_sheet(defectDataList);
      XLSX.utils.book_append_sheet(wb, wsDefects, "DefectList");

       // Add defectDataList to a new sheet
       const wsSearch = XLSX.utils.aoa_to_sheet(searchData);
       XLSX.utils.book_append_sheet(wb, wsSearch, "SearchCriteria");

      // Write to a buffer and save the file using FileSaver
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, 'inspection_and_defects_list.xlsx');

      
      setSnackbar({ children: `Exporting report `, severity: 'success' });

      dispatch(setInspectionMessageNull());
    }
    else if(!inspectionLoading && inspectionMessage == 'export sum' && exportSumReport.length > 0 ){
       // Define the header data in a single row
       const headerData = [
        ["Date Start", "Date End", "ItemCode", "Color", "Material", "Buyer", "Supplier"]
      ];

       // Define the search criteria data
       const searchCriteriaData = [];
       const maxLength = Math.max(
         inputReport?.itemCode?.length || 0,
         inputReport?.color?.length || 0,
         inputReport?.supplier?.length || 0,
         1 // Ensure at least one row for dateStart and dateEnd
       );
 
       // Loop through the maximum length and populate data
       for (let index = 0; index < maxLength; index++) {
         const itemCodeValue = inputReport?.itemCode?.[index] || "";
         const colorValue = inputReport?.color?.[index] || "";
         const supplierValue = inputReport?.supplier?.[index]?.name || "";
 
         searchCriteriaData.push([
           index === 0 ? (inputReport?.dateStart ? moment(inputReport.dateStart).format("MM-DD-YYYY") : "") : "", // Date Start
           index === 0 ? (inputReport?.dateEnd ? moment(inputReport.dateEnd).format("MM-DD-YYYY") : "") : "", // Date End
           itemCodeValue, // ItemCode
           colorValue, // Color
           index === 0 ? (inputReport?.material?.name || "") : "", // Material
           index === 0 ? (inputReport?.buyer?.name || "") : "", // Buyer
           supplierValue // Supplier
         ]);
       }
 
       // Handle case where no rows were generated but dateStart and dateEnd are mandatory
       if (searchCriteriaData.length === 0) {
         searchCriteriaData.push([
           inputReport?.dateStart ? moment(inputReport.dateStart).format("MM-DD-YYYY") : "", // Date Start
           inputReport?.dateEnd ? moment(inputReport.dateEnd).format("MM-DD-YYYY") : "", // Date End
           "", // ItemCode
           "", // Color
           inputReport?.material?.name || "", // Material
           inputReport?.buyer?.name || "", // Buyer
           "" // Supplier
         ]);
       }

      // Add a few empty rows for spacing
      const emptyRows = Array(2).fill([]); // Adjust the number of empty rows as needed

      // Map inspectionsList into rows of data
      const inspectionsRows = exportSumReport.map((inspection) => [
        inspection.RowId,
        inspection.Supplier,
        inspection.ItemCode,
        inspection.ItemDescription,
        inspection.ColorFinish,
        inspection.Buyer,
        inspection.Material,
        inspection.DeliveryQty,
        inspection.TotalGoodQty,
        inspection.TotalPullOutQty,
        inspection.FirstPass_Defect,
        inspection.FirstPass_Good,
        inspection.FirstPass_PullOut,
        inspection.SecondPass_Good,
        inspection.SecondPass_PullOut,
        inspection.Unfinished,
      ]);

      // Define the inspections list header row
      const inspectionsHeader = [
        "RowId","Supplier", "Item Code", "Item Description","Color Finish","Buyer", "Material", "Delivery Qty",
        "Overall Good","Overall PullOut","(1P) Defect overall", "(1P) Good overall", "(1P) PullOut overall",
        "(2P) Good overall", "(2P) PullOut overall","Unfinished overall",
      ];

      // Combine everything into a single sheet data array
      const sheetData = [inspectionsHeader, ...inspectionsRows];
      const searchData = [...headerData, ...searchCriteriaData,]

      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Convert sheetData into a sheet and append it to the workbook
      const wsInspections = XLSX.utils.aoa_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(wb, wsInspections, "InspectionList");

      // Add defectDataList to a new sheet
      const wsSearch = XLSX.utils.aoa_to_sheet(searchData);
      XLSX.utils.book_append_sheet(wb, wsSearch, "SearchCriteria");

      // Write to a buffer and save the file using FileSaver
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, 'groupBy_supplier_item_buyer_material_summary.xlsx');

      
      setSnackbar({ children: `Exporting report `, severity: 'success' });

      dispatch(setInspectionMessageNull());
    }
    else if(!inspectionLoading && inspectionMessage == 'export suppliers sum' && exportSuppliersSumReport.length > 0 && affectedRowsInspection.length > 0  ){
      // Define the header data in a single row
      const headerData = [
        ["Date Start", "Date End", "ItemCode", "Color", "Material", "Buyer", "Supplier"]
      ];

      // Define the search criteria data
      const searchCriteriaData = [];
      const maxLength = Math.max(
        inputReport?.itemCode?.length || 0,
        inputReport?.color?.length || 0,
        inputReport?.supplier?.length || 0,
        1 // Ensure at least one row for dateStart and dateEnd
      );

      // Loop through the maximum length and populate data
      for (let index = 0; index < maxLength; index++) {
        const itemCodeValue = inputReport?.itemCode?.[index] || "";
        const colorValue = inputReport?.color?.[index] || "";
        const supplierValue = inputReport?.supplier?.[index]?.name || "";

        searchCriteriaData.push([
          index === 0 ? (inputReport?.dateStart ? moment(inputReport.dateStart).format("MM-DD-YYYY") : "") : "", // Date Start
          index === 0 ? (inputReport?.dateEnd ? moment(inputReport.dateEnd).format("MM-DD-YYYY") : "") : "", // Date End
          itemCodeValue, // ItemCode
          colorValue, // Color
          index === 0 ? (inputReport?.material?.name || "") : "", // Material
          index === 0 ? (inputReport?.buyer?.name || "") : "", // Buyer
          supplierValue // Supplier
        ]);
      }

      // Handle case where no rows were generated but dateStart and dateEnd are mandatory
      if (searchCriteriaData.length === 0) {
        searchCriteriaData.push([
          inputReport?.dateStart ? moment(inputReport.dateStart).format("MM-DD-YYYY") : "", // Date Start
          inputReport?.dateEnd ? moment(inputReport.dateEnd).format("MM-DD-YYYY") : "", // Date End
          "", // ItemCode
          "", // Color
          inputReport?.material?.name || "", // Material
          inputReport?.buyer?.name || "", // Buyer
          "" // Supplier
        ]);
      }

      // Add a few empty rows for spacing
      const emptyRows = Array(2).fill([]); // Adjust the number of empty rows as needed

      // Map inspectionsList into rows of data
      const inspectionsRows = exportSuppliersSumReport.map((inspection) => [
        inspection.RowId,
        inspection.Supplier,
        inspection.DeliveryQty,
        inspection.TotalGoodQty,
        inspection.TotalPullOutQty,
        inspection.FirstPass_Defect,
        inspection.FirstPass_Good,
        inspection.FirstPass_PullOut,
        inspection.SecondPass_Good,
        inspection.SecondPass_PullOut,
        inspection.Unfinished,
      ]);

      // Define the inspections list header row
      const inspectionsHeader = [
        "RowId","Supplier", "Delivery Qty",
        "Overall Good","Overall PullOut","(1P) Defect overall", "(1P) Good overall", "(1P) PullOut overall",
        "(2P) Good overall", "(2P) PullOut overall","Unfinished overall",
      ];

      const affectedRows = affectedRowsInspection.map((inspection) => [
        inspection.itemCode,
        inspection.color,
        inspection.supplier,
        inspection.buyer,
        inspection.material,
      ]);

      const affectedHeaderData = [
        ["ItemCode", "Color", "Supplier", "Buyer", "Material"]
      ];
      

      // Combine everything into a single sheet data array
      const sheetData = [inspectionsHeader, ...inspectionsRows];
      const searchData = [...headerData, ...searchCriteriaData,]
      const affectedRowsData =[...affectedHeaderData,...affectedRows];

      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Convert sheetData into a sheet and append it to the workbook
      const wsInspections = XLSX.utils.aoa_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(wb, wsInspections, "InspectionBySupplier");

      // Add defectDataList to a new sheet
      const wsAffected = XLSX.utils.aoa_to_sheet(affectedRowsData);
      XLSX.utils.book_append_sheet(wb, wsAffected, "AffectedRowsData");

      // Add defectDataList to a new sheet
      const wsSearch = XLSX.utils.aoa_to_sheet(searchData);
      XLSX.utils.book_append_sheet(wb, wsSearch, "SearchCriteria");

      // Write to a buffer and save the file using FileSaver
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, 'by_supplier_summary.xlsx');

      
      setSnackbar({ children: `Exporting report `, severity: 'success' });

      dispatch(setInspectionMessageNull());
    }
    else if(!inspectionLoading && inspectionMessage == 'export items sum' && exportItemsSumReport.length > 0 && affectedRowsInspection.length > 0  ){
      // Define the header data in a single row
      const headerData = [
        ["Date Start", "Date End", "ItemCode", "Color", "Material", "Buyer", "Supplier"]
      ];

      // Define the search criteria data
      const searchCriteriaData = [];
      const maxLength = Math.max(
        inputReport?.itemCode?.length || 0,
        inputReport?.color?.length || 0,
        inputReport?.supplier?.length || 0,
        1 // Ensure at least one row for dateStart and dateEnd
      );

      // Loop through the maximum length and populate data
      for (let index = 0; index < maxLength; index++) {
        const itemCodeValue = inputReport?.itemCode?.[index] || "";
        const colorValue = inputReport?.color?.[index] || "";
        const supplierValue = inputReport?.supplier?.[index]?.name || "";

        searchCriteriaData.push([
          index === 0 ? (inputReport?.dateStart ? moment(inputReport.dateStart).format("MM-DD-YYYY") : "") : "", // Date Start
          index === 0 ? (inputReport?.dateEnd ? moment(inputReport.dateEnd).format("MM-DD-YYYY") : "") : "", // Date End
          itemCodeValue, // ItemCode
          colorValue, // Color
          index === 0 ? (inputReport?.material?.name || "") : "", // Material
          index === 0 ? (inputReport?.buyer?.name || "") : "", // Buyer
          supplierValue // Supplier
        ]);
      }

      // Handle case where no rows were generated but dateStart and dateEnd are mandatory
      if (searchCriteriaData.length === 0) {
        searchCriteriaData.push([
          inputReport?.dateStart ? moment(inputReport.dateStart).format("MM-DD-YYYY") : "", // Date Start
          inputReport?.dateEnd ? moment(inputReport.dateEnd).format("MM-DD-YYYY") : "", // Date End
          "", // ItemCode
          "", // Color
          inputReport?.material?.name || "", // Material
          inputReport?.buyer?.name || "", // Buyer
          "" // Supplier
        ]);
      }

      // Add a few empty rows for spacing
      const emptyRows = Array(2).fill([]); // Adjust the number of empty rows as needed

      // Map inspectionsList into rows of data
      const inspectionsRows = exportItemsSumReport.map((inspection) => [
        inspection.RowId,
        inspection.ItemCode,
        inspection.ItemDescription,
        inspection.ColorFinish,
        inspection.DeliveryQty,
        inspection.TotalGoodQty,
        inspection.TotalPullOutQty,
        inspection.FirstPass_Defect,
        inspection.FirstPass_Good,
        inspection.FirstPass_PullOut,
        inspection.SecondPass_Good,
        inspection.SecondPass_PullOut,
        inspection.Unfinished,
      ]);

      // Define the inspections list header row
      const inspectionsHeader = [
        "RowId","Item Code","Item Description","Color Finish", "Delivery Qty",
        "Overall Good","Overall PullOut","(1P) Defect overall", "(1P) Good overall", "(1P) PullOut overall",
        "(2P) Good overall", "(2P) PullOut overall","Unfinished overall",
      ];

      const affectedRows = affectedRowsInspection.map((inspection) => [
        inspection.itemCode,
        inspection.color,
        inspection.supplier,
        inspection.buyer,
        inspection.material,
      ]);

      const affectedHeaderData = [
        ["ItemCode", "Color", "Supplier", "Buyer", "Material"]
      ];

      // Combine everything into a single sheet data array
      const sheetData = [inspectionsHeader, ...inspectionsRows];
      const searchData = [...headerData, ...searchCriteriaData,]
      const affectedRowsData =[...affectedHeaderData,...affectedRows];

      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Convert sheetData into a sheet and append it to the workbook
      const wsInspections = XLSX.utils.aoa_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(wb, wsInspections, "InspectionByItem");

      // Add defectDataList to a new sheet
      const wsAffected = XLSX.utils.aoa_to_sheet(affectedRowsData);
      XLSX.utils.book_append_sheet(wb, wsAffected, "AffectedRowsData");

      // Add defectDataList to a new sheet
      const wsSearch = XLSX.utils.aoa_to_sheet(searchData);
      XLSX.utils.book_append_sheet(wb, wsSearch, "SearchCriteria");

      // Write to a buffer and save the file using FileSaver
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, 'by_item_summary.xlsx');

      
      setSnackbar({ children: `Exporting report `, severity: 'success' });

      dispatch(setInspectionMessageNull());
    }
    else if(!inspectionLoading && inspectionMessage == 'export defects' && exportDefectsReport.length > 0 && affectedRowsInspection.length > 0 ){
        // Define the header data in a single row
        const headerData = [
          ["Date Start", "Date End", "ItemCode", "Color", "Material", "Buyer", "Supplier"]
        ];
  
      // Define the search criteria data
      const searchCriteriaData = [];
      const maxLength = Math.max(
        inputReport?.itemCode?.length || 0,
        inputReport?.color?.length || 0,
        inputReport?.supplier?.length || 0,
        1 // Ensure at least one row for dateStart and dateEnd
      );

      // Loop through the maximum length and populate data
      for (let index = 0; index < maxLength; index++) {
        const itemCodeValue = inputReport?.itemCode?.[index] || "";
        const colorValue = inputReport?.color?.[index] || "";
        const supplierValue = inputReport?.supplier?.[index]?.name || "";

        searchCriteriaData.push([
          index === 0 ? (inputReport?.dateStart ? moment(inputReport.dateStart).format("MM-DD-YYYY") : "") : "", // Date Start
          index === 0 ? (inputReport?.dateEnd ? moment(inputReport.dateEnd).format("MM-DD-YYYY") : "") : "", // Date End
          itemCodeValue, // ItemCode
          colorValue, // Color
          index === 0 ? (inputReport?.material?.name || "") : "", // Material
          index === 0 ? (inputReport?.buyer?.name || "") : "", // Buyer
          supplierValue // Supplier
        ]);
      }

      // Handle case where no rows were generated but dateStart and dateEnd are mandatory
      if (searchCriteriaData.length === 0) {
        searchCriteriaData.push([
          inputReport?.dateStart ? moment(inputReport.dateStart).format("MM-DD-YYYY") : "", // Date Start
          inputReport?.dateEnd ? moment(inputReport.dateEnd).format("MM-DD-YYYY") : "", // Date End
          "", // ItemCode
          "", // Color
          inputReport?.material?.name || "", // Material
          inputReport?.buyer?.name || "", // Buyer
          "" // Supplier
        ]);
      }

      const affectedRows = affectedRowsInspection.map((inspection) => [
        inspection.itemCode,
        inspection.color,
        inspection.supplier,
        inspection.buyer,
        inspection.material,
      ]);

      const affectedHeaderData = [
        ["ItemCode", "Color", "Supplier", "Buyer", "Material"]
      ];

      // Map inspectionsList into rows of data
      const inspectionsRows = exportDefectsReport.map((inspection) => [
        inspection.defectName,
        inspection.areaName,
        inspection.firstPassDefect,
        inspection.firstPassPullOut,
        inspection.secondPassPullOut,
      ]);

      // Define the inspections list header row
      const inspectionsHeader = [
        "Defect Name","Area Name","(1P) Defect Qty", "(1P) PullOut Qty","(2P) PullOut Qty",
      ];

      // Combine everything into a single sheet data array
      const sheetData = [inspectionsHeader, ...inspectionsRows];
      const searchData = [...headerData, ...searchCriteriaData];
      const affectedRowsData =[...affectedHeaderData,...affectedRows];

      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Convert sheetData into a sheet and append it to the workbook
      const wsInspections = XLSX.utils.aoa_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(wb, wsInspections, "OverAllDefects");

      // Add defectDataList to a new sheet
      const wsAffected = XLSX.utils.aoa_to_sheet(affectedRowsData);
      XLSX.utils.book_append_sheet(wb, wsAffected, "AffectedRowsData");

      // Add defectDataList to a new sheet
      const wsSearch = XLSX.utils.aoa_to_sheet(searchData);
      XLSX.utils.book_append_sheet(wb, wsSearch, "SearchCriteria");

      // Write to a buffer and save the file using FileSaver
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, 'overall_defects.xlsx');

      
      setSnackbar({ children: `Exporting report `, severity: 'success' });

      dispatch(setInspectionMessageNull());
    }
    else if(!inspectionLoading && inspectionMessage == 'export no'){
      setSnackbar({ children: `No Data found`, severity: 'error' });
      console.log('called error')
      dispatch(setInspectionMessageNull());
    }
    setIsLoading(false);
},[dispatch,inspectionLoading,inspectionMessage,inspectionsList,defectDataList,exportSumReport,exportSuppliersSumReport,exportDefectsReport,affectedRowsInspection]);

 

  useEffect(()=>{
    if(suppliers?.length > 0 && buyers?.length > 0 && materials?.length > 0){
     setInputSupplier(suppliers);
     setInputMaterial(materials);
     setInputBuyer(buyers);

     setInputSupplierReport(suppliers);
     setInputMaterialReport(materials);
     setInputBuyerReport(buyers);
    }
},[materials,buyers,suppliers]);


  const [rows, setRows] = useState([]);

  const handleOnChangeInput = (name,e,val=null) =>{
      if(name === "dateStart" || name === "dateEnd"){
          setInput({
          ...input,
          [name]: e
          });
      }else if(name === "material" || name === "buyer" || name === "supplier"){
          setInput({
              ...input,
              [name]: val 
          });
      }else if(name === "unfinished"){
            setInput({
                ...input,
                [name]: e.target.checked
            });
      }
      else
          setInput({
              ...input,
              [name]: e.target.value 
          });
    }

    const handleOnChangeInputReport = (name, e, val = null) => {
      if (name === "dateStart" || name === "dateEnd") {
        setInputReport((prev) => ({
          ...prev,
          [name]: e,
        }));
      } else if (name === "supplier") {
        setInputReport((prev) => ({
          ...prev,
          [name]: val ? [...val] : [],
        }));
      } else if (name === "material" || name === "buyer") {
        setInputReport((prev) => ({
          ...prev,
          [name]: val,
        }));
      } else if (name === "unfinished") {
        setInputReport((prev) => ({
          ...prev,
          [name]: e.target.checked,
        }));
      } else if (name === "itemCode" || name === "color") {
        // Split the value by commas and store it as an array
        const valueArray = e.target.value.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
        
        // Handle removal if an item is deleted and only non-empty values are kept
        setInputReport((prev) => ({
          ...prev,
          [name]: valueArray,
        }));
      } else {
        setInputReport((prev) => ({
          ...prev,
          [name]: e.target.value,
        }));
      }
    };
    
  

    const onSearch = () =>{

      let newDateStart = moment(input?.dateStart).isBetween(moment('2000','YYYY'), moment().add(3,'y'));
      let newDateEnd = moment(input?.dateEnd).isBetween(moment('2000','YYYY'), moment().add(3,'y'));

      if( !newDateStart || !newDateEnd ){
        setSnackbar({ children: `Date Range inputed is invalid`, severity: 'error' });
      }else if((input?.itemCode == null || input?.itemCode == '') && 
          (input?.color == null || input?.color == '') && 
          (input?.dateStart == null || input?.dateStart == '') && 
          (input?.dateEnd == null || input?.dateEnd == '') && 
          (input?.supplier?._id == null ||  input?.supplier?._id == '') &&
          (input?.buyer?._id == null ||  input?.buyer?._id == '') &&
          (input?.material?._id == null ||  input?.material?._id == '') && input?.unfinished == false){
              setRows([]);
              navigate(`/inspection-list?page=1`);
              dispatch(getInspections(1));
             
              console.log(`called getInspections`)
      }else{
          setRows([]);
          dispatch(getInspectionsBySearch({
              itemcode: input?.itemCode || '',
              color: input?.color || '',
              datestart: input?.dateStart || '',
              dateend: input?.dateEnd || '',
              buyer: input?.buyer?._id || '',
              supplier: input?.supplier?._id || '',
              material: input?.material?._id || '',
              unfinished: input?.unfinished || '',
              page:1}));
          
            console.log(`/inspection-list/search?itemcode=${input?.itemCode || ''}&color=${input?.color || ''}&datestart=${input?.dateStart && input?.dateStart !== '' ? moment(input?.dateStart).format('MM-DD-YYYY') : ''}&dateend=${input?.dateEnd && input?.dateEnd !== '' ? moment(input?.dateEnd).format('MM-DD-YYYY') : ''}&supplier=${input?.supplier?.name  || ''}&buyer=${input?.buyer?.name  || ''}&material=${input?.material?.name || ''}&unfinished=${input?.unfinished || ''}&page=1`);
          navigate(`/inspection-list/search?itemcode=${input?.itemCode || ''}&color=${input?.color || ''}&datestart=${input?.dateStart && input?.dateStart !== '' ? moment(input?.dateStart).format('MM-DD-YYYY') : ''}&dateend=${input?.dateEnd && input?.dateEnd !== '' ? moment(input?.dateEnd).format('MM-DD-YYYY') : ''}&supplier=${input?.supplier?.name  || ''}&buyer=${input?.buyer?.name  || ''}&material=${input?.material?.name || ''}&unfinished=${input?.unfinished || ''}&page=1`);
      }
    }


    const onClear = () =>{
       setInput({
        itemCode:'',
        color:'',
        supplier:null,
        material:null,
        buyer:null,
        dateStart:null,
        dateEnd:null,
        unfinished:false,
      });
    }

    const onClearReport = () =>{
      setInputReport({
       itemCode:'',
       color:'',
       supplier:null,
       material:null,
       buyer:null,
       dateStart:null,
       dateEnd:null,
       unfinished:false,
     });
   }

  useEffect(() => {
    const hideWatermark = () => {
      const watermark = document.querySelector('div[style*="position: absolute"][style*="color: rgba(130, 130, 130, 0.62)"]');
      if (watermark) {
        watermark.style.zIndex = -10000;
      }
    };
    hideWatermark();
    console.log('glenson cute');
    const intervalId = setInterval(hideWatermark, 100);
    return () => clearInterval(intervalId);
  }, []);

  const rowsData = [];

  useEffect(() => {

    if(!inspectionLoading && inspections.length > 0){
      setRows([]);

      inspections?.map(i => {
        rowsData.push(
          createData(i?._id,moment(i?.date).format('MM-DD-YYYY'),i?.supplier?.name, i?.item?.itemCode, i?.item?.itemDescription,i?.item?.color,
          moment(i?.totalMinWork?.start, 'HH:mm').format('h:mm A'),moment(i?.totalMinWork?.end, 'HH:mm').format('h:mm A'),
            i?.buyer?.name, i?.material?.name,i?.weight,i?.deliveryQty,i?.firstPass?.defectQty, i?.firstPass?.totalGoodQty,i?.firstPass?.totalPullOutQty,
            i?.secondPass?.totalGoodQty,i?.secondPass?.totalPullOutQty, i?.totalGoodQty, i?.totalPullOutQty, i?.unfinished,moment(i?.dateClosure).format('MM-DD-YYYY'),i?.emptyDefect,i?.passIssues));
        return null;
      });
      setRows([...rowsData]);
    }

  }, [inspectionLoading,inspections]);

  function createData(id, inspectiondate, supplier, itemcode, itemdescription,color,timestart,timeend, buyer, material, weight, deliveryqty, firstpassmajor, firstpassgood, firstpasspullout, secondpassgood, secondpasspullout, totalgood, totalpullout, unfinished,dateclosure,emptyDefect,passIssues) {
    return { id, inspectiondate, supplier, itemcode, itemdescription,color,timestart,timeend, buyer, material, weight, deliveryqty, firstpassmajor, firstpassgood, firstpasspullout, secondpassgood, secondpasspullout, totalgood, totalpullout, unfinished,dateclosure,emptyDefect,passIssues };
  }

  const RenderDate = (row) =>{
    return(
      <Typography 
          onClick={() => { 
            // clear states
            dispatch(setInspectionClearStates());
            
            navigate(`/pass-details?id=${row?.id}`);
           }} 
          sx={{ textDecoration: 'underline', cursor: 'pointer' }}
        >
        {row.inspectiondate}
      </Typography>
    )
  };

  const CustomizeToolBar = ()=>(
    <GridToolbarContainer>
      {/* <GridToolbarExport  
          printOptions={{ disableToolbarButton: true }}
          csvOptions={{
            fileName: 'customerDataBase',
            utf8WithBom: true,
          }}
          /> */}
          <GridToolbarColumnsButton />
    </GridToolbarContainer>
  )


  const columns = [
    { field: 'inspectiondate', headerName: 'Inspection Date', renderCell: (params) => RenderDate(params.row),  headerClassName: 'pin-header',width:120},
    { field: 'supplier', headerName: 'Supplier', headerClassName: 'pin-header',width:120 },
    { field: 'itemcode', headerName: 'Item Code', headerClassName: 'pin-header',width:120 },
    { field: 'itemdescription', headerName: 'Item Description',  headerClassName: 'pin-header',width:200},
    { field: 'color', headerName: 'Color Finish',  headerClassName: 'pin-header',width:150},
    { field: 'timestart', headerName: 'T-start',  headerClassName: 'pin-header',width:80},
    { field: 'timeend', headerName: 'T-end',  headerClassName: 'pin-header',width:80},
    { field: 'buyer', headerName: 'Buyer', headerClassName: 'pin-header',width:120},
    { field: 'material', headerName: 'Material', headerClassName: 'pin-header',width:120},
    { field: 'weight', headerName: 'Weight',headerClassName:'pin-header',width:70},
    { field: 'deliveryqty', headerName: 'Delivery Qty',headerClassName:'pin-header',width:70 },
    { field: 'firstpassmajor', headerName: 'Defect',headerClassName:'pullout-header', width:70},
    { field: 'firstpassgood', headerName: 'Good', width:70},
    { field: 'firstpasspullout', headerName: 'Pull-Out',headerClassName:'defect-header', width:70},
    { field: 'secondpassgood', headerName: 'Good', width:70},
    { field: 'secondpasspullout', headerName: 'Pull-Out',headerClassName:'defect-header',width:70 },
    { field: 'totalgood', headerName: 'Good', width:70},
    { field: 'totalpullout', headerName: 'Pull-Out',headerClassName:'defect-header',width:70 },
    { field: 'unfinished', headerName: 'Un finished',headerClassName:'pullout-header', width:70},
    { field: 'dateclosure', headerName: 'Date Closure',headerClassName:'pullout-header', width:120},
    { field: 'emptyDefect', headerName: 'Is Empty Data'},
    { field: 'passIssues', headerName: 'Pass Issues'}
  ];

  const headerGroupCustom = (title) =>{
    return ( 
      <Typography>{title}</Typography>
    )
  }

  const columnGroupingModel = [
    {
      groupId: 'FirstPass',
      renderHeaderGroup: (params) => headerGroupCustom('First Pass'),
      headerAlign:"center",
      headerClassName: 'defect-header',
      children: [
        { field: 'firstpassmajor' },
        { field: 'firstpassgood' },
        { field: 'firstpasspullout' },
      ]
    },
    {
      groupId: 'SecondPass',
      renderHeaderGroup: (params) => headerGroupCustom('Second Pass'),
      headerAlign:"center",
      children: [
        { field: 'secondpassgood' },
        { field: 'secondpasspullout' },
      ]
    },
    {
      groupId: 'total',
      renderHeaderGroup: (params) => headerGroupCustom('Total'),
      headerAlign:"center",
      headerClassName: 'defect-header',
      children: [
        { field: 'totalgood' },
        { field: 'totalpullout' },
      ]
    }
  ];

  // USER
  const [user,setUser] = useState(JSON.parse(localStorage.getItem('profile')));

  useEffect(()=>{
      const token = user?.token;
      if(token){
      const decodedToken = decode(token);
      if(decodedToken.exp * 1000 < new Date().getTime())
          handleLogout();
      }else{
      handleLogout();
      }
  },[onSearch,rows]);
  
  const handleLogout = () =>{
      dispatch({type: AUTH_LOGOUT});
      navigate(`/login`);
      setUser(null);
  }
  // USER

  const [openReportModal, setOpenReportModal] = useState(false);
  const handleOpenReportModal = () => {
      setOpenReportModal(true);
  };
  const handleCloseReportModal = () => {
      setOpenReportModal(false);
  };

  const onExportReportList = () =>{
      let newDateStart = moment(inputReport?.dateStart).isBetween(moment('2000','YYYY'), moment().add(3,'y'));
      let newDateEnd = moment(inputReport?.dateEnd).isBetween(moment('2000','YYYY'), moment().add(3,'y'));

      let flag = true;
     
      if (inputReport?.itemCode.length > 0) {
        const hasShortItem = inputReport?.itemCode.some((itm) => itm.length < 3);
        if (hasShortItem) {
          flag = false; // Set flag to false if any item is too short
          setSnackbar({
            children: `ItemCode inputted must have a minimum of 3 characters per item, separated by commas.`,
            severity: 'error',
          });
        }
      }

      if (inputReport?.color.length > 0) {
        const hasShortItem = inputReport?.color.some((itm) => itm.length < 3);
        if (hasShortItem) {
          flag = false; // Set flag to false if any item is too short
          setSnackbar({
            children: `Color inputted must have a minimum of 3 characters per item, separated by commas.`,
            severity: 'error',
          });
        }
      }

      if( !newDateStart || !newDateEnd ){
         flag = false;
         setSnackbar({ children: `Date Range inputed is invalid`, severity: 'error' });

      }
      if(flag === true){
        dispatch(getExportReportList({
          itemcode: inputReport?.itemCode || [],
          color: inputReport?.color || [],
          datestart: inputReport?.dateStart || '',
          dateend: inputReport?.dateEnd || '',
          buyer: inputReport?.buyer?._id || '',
          supplier: inputReport?.supplier || [],
          material: inputReport?.material?._id || ''}));
  
          setIsLoading(true);
      }
  }

  const onExportReportSum = () =>{
      let newDateStart = moment(inputReport?.dateStart).isBetween(moment('2000','YYYY'), moment().add(3,'y'));
      let newDateEnd = moment(inputReport?.dateEnd).isBetween(moment('2000','YYYY'), moment().add(3,'y'));

      let flag = true;
     
      if (inputReport?.itemCode.length > 0) {
        const hasShortItem = inputReport?.itemCode.some((itm) => itm.length < 3);
        if (hasShortItem) {
          flag = false; // Set flag to false if any item is too short
          setSnackbar({
            children: `ItemCode inputted must have a minimum of 3 characters per item, separated by commas.`,
            severity: 'error',
          });
        }
      }

      if (inputReport?.color.length > 0) {
        const hasShortItem = inputReport?.color.some((itm) => itm.length < 3);
        if (hasShortItem) {
          flag = false; // Set flag to false if any item is too short
          setSnackbar({
            children: `Color inputted must have a minimum of 3 characters per item, separated by commas.`,
            severity: 'error',
          });
        }
      }

      if( !newDateStart || !newDateEnd ){
         flag = false;
         setSnackbar({ children: `Date Range inputed is invalid`, severity: 'error' });

      }
      if(flag === true){
        dispatch(getExportSumReport({
          itemcode: inputReport?.itemCode || '',
          color: inputReport?.color || '',
          datestart: inputReport?.dateStart || '',
          dateend: inputReport?.dateEnd || '',
          buyer: inputReport?.buyer?._id || '',
          supplier: inputReport?.supplier || [],
          material: inputReport?.material?._id || ''}));
  
          setIsLoading(true);
      }
  }

  const onExportReportDefects= () =>{
      let newDateStart = moment(inputReport?.dateStart).isBetween(moment('2000','YYYY'), moment().add(3,'y'));
      let newDateEnd = moment(inputReport?.dateEnd).isBetween(moment('2000','YYYY'), moment().add(3,'y'));

      let flag = true;
     
      if (inputReport?.itemCode.length > 0) {
        const hasShortItem = inputReport?.itemCode.some((itm) => itm.length < 3);
        if (hasShortItem) {
          flag = false; // Set flag to false if any item is too short
          setSnackbar({
            children: `ItemCode inputted must have a minimum of 3 characters per item, separated by commas.`,
            severity: 'error',
          });
        }
      }

      if (inputReport?.color.length > 0) {
        const hasShortItem = inputReport?.color.some((itm) => itm.length < 3);
        if (hasShortItem) {
          flag = false; // Set flag to false if any item is too short
          setSnackbar({
            children: `Color inputted must have a minimum of 3 characters per item, separated by commas.`,
            severity: 'error',
          });
        }
      }

      if( !newDateStart || !newDateEnd ){
         flag = false;
         setSnackbar({ children: `Date Range inputed is invalid`, severity: 'error' });

      }
      if(flag === true){
        dispatch(getExportDefectsReport({
          itemcode: inputReport?.itemCode || '',
          color: inputReport?.color || '',
          datestart: inputReport?.dateStart || '',
          dateend: inputReport?.dateEnd || '',
          buyer: inputReport?.buyer?._id || '',
          supplier: inputReport?.supplier || [],
          material: inputReport?.material?._id || ''}));
  
          setIsLoading(true);
      }
  }

  const onExportReportSuppliersSummary= () =>{

    let newDateStart = moment(inputReport?.dateStart).isBetween(moment('2000','YYYY'), moment().add(3,'y'));
    let newDateEnd = moment(inputReport?.dateEnd).isBetween(moment('2000','YYYY'), moment().add(3,'y'));

    let flag = true;
   
    if (inputReport?.itemCode.length > 0) {
      const hasShortItem = inputReport?.itemCode.some((itm) => itm.length < 3);
      if (hasShortItem) {
        flag = false; // Set flag to false if any item is too short
        setSnackbar({
          children: `ItemCode inputted must have a minimum of 3 characters per item, separated by commas.`,
          severity: 'error',
        });
      }
    }

    if (inputReport?.color.length > 0) {
      const hasShortItem = inputReport?.color.some((itm) => itm.length < 3);
      if (hasShortItem) {
        flag = false; // Set flag to false if any item is too short
        setSnackbar({
          children: `Color inputted must have a minimum of 3 characters per item, separated by commas.`,
          severity: 'error',
        });
      }
    }

    if( !newDateStart || !newDateEnd ){
       flag = false;
       setSnackbar({ children: `Date Range inputed is invalid`, severity: 'error' });

    }
    if(flag === true){
      dispatch(getExportSuppliersSummaryReport({
        itemcode: inputReport?.itemCode || '',
        color: inputReport?.color || '',
        datestart: inputReport?.dateStart || '',
        dateend: inputReport?.dateEnd || '',
        buyer: inputReport?.buyer?._id || '',
        supplier: inputReport?.supplier || [],
        material: inputReport?.material?._id || ''}));

        setIsLoading(true);
    }
  }

  const onExportReportItemsSummary= () =>{


    let newDateStart = moment(inputReport?.dateStart).isBetween(moment('2000','YYYY'), moment().add(3,'y'));
    let newDateEnd = moment(inputReport?.dateEnd).isBetween(moment('2000','YYYY'), moment().add(3,'y'));

    let flag = true;
   
    if (inputReport?.itemCode.length > 0) {
      const hasShortItem = inputReport?.itemCode.some((itm) => itm.length < 3);
      if (hasShortItem) {
        flag = false; // Set flag to false if any item is too short
        setSnackbar({
          children: `ItemCode inputted must have a minimum of 3 characters per item, separated by commas.`,
          severity: 'error',
        });
      }
    }

    if (inputReport?.color.length > 0) {
      const hasShortItem = inputReport?.color.some((itm) => itm.length < 3);
      if (hasShortItem) {
        flag = false; // Set flag to false if any item is too short
        setSnackbar({
          children: `Color inputted must have a minimum of 3 characters per item, separated by commas.`,
          severity: 'error',
        });
      }
    }

    if( !newDateStart || !newDateEnd ){
       flag = false;
       setSnackbar({ children: `Date Range inputed is invalid`, severity: 'error' });

    }
    if(flag === true){
      dispatch(getExportItemsSummaryReport({
        itemcode: inputReport?.itemCode || '',
        color: inputReport?.color || '',
        datestart: inputReport?.dateStart || '',
        dateend: inputReport?.dateEnd || '',
        buyer: inputReport?.buyer?._id || '',
        supplier: inputReport?.supplier || [],
        material: inputReport?.material?._id || ''}));

        setIsLoading(true);
    }
  }

  return (
    <Paper elevation={20} sx={{ padding: 1 }}>
      <Grid container spacing={2} justifyContent="center">
        <Grid xs={12} md={12} lg={12}>
        {/* INPUTS START */}
        <Box mt={2}>
            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={supplierLoading || buyerLoading || materialLoading || inspectionLoading || isLoading} >
                <CircularProgress color="inherit" />
            </Backdrop>
                  <Grid container spacing={2} justifyContent="center" sx={{mb:1}}>  
                  <Grid xs={12} md={12} lg={12}>
                  <div>
                        <Accordion >
                            <AccordionSummary
                            expandIcon={<ExpandMore />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                            sx={{
                                backgroundColor: "#2e86de",
                                color:"#fff",
                                fontSize:20
                            }}
                            >
                            <Box display="flex" justifyContent="space-between" alignItems="center" width="90%">
                              <Box>
                                <Typography>Search Option</Typography>
                              </Box>

                              <Box>
                                <Box>
                                  <Button variant="contained" onClick={(e) => {e.stopPropagation();handleOpenReportModal();}} color="success" size="medium" startIcon={<Assessment />}>Export Report</Button>
                                  <Button variant="contained" sx={{ml:5}} onClick={()=>{navigate(`/pass-details?id=`)}} color="secondary" size="medium" startIcon={<Save/>}   >Add Inspection </Button>
                                </Box>
                              </Box>
                            </Box>
                            </AccordionSummary>
                            <AccordionDetails>

                            <Paper elevation={6}>
                      <Grid container spacing={1} justifyContent="center">
                      <Grid xs={6} md={12} lg={12}> 
                      </Grid>
                      <Grid xs={6} md={3} lg={3}>
                          <Box component="form" noValidate autoComplete="off"
                          sx={{
                              '& .MuiTextField-root': { m: 1, width: '30ch' },
                              '& .MuiInputBase-root': {
                                  fontSize: '0.875rem',  // Adjust the font size
                                  padding: '2px 8px',   // Adjust the padding to reduce the height
                                  height: '40px',       // Set a specific height
                                },
                          }}
                          >
                              <DatePicker label="Inspection Start" size='small' maxDate={moment().add(3,'y')} minDate={moment('2000','YYYY')} onChange={(e)=>handleOnChangeInput("dateStart",e)} value={input?.dateStart}/>
                              <DatePicker label="Inspection End" size='small' maxDate={moment().add(3,'y')} minDate={moment('2000','YYYY')} onChange={(e)=>handleOnChangeInput("dateEnd",e)} value={input?.dateEnd}/>
                          </Box>
                      </Grid>
                      <Grid xs={6} md={3} lg={3}>
                          <Box component="form" noValidate autoComplete="off"
                          sx={{
                              '& .MuiTextField-root': { m: 1, width: '30ch' },
                          }}
                          >
                            <TextField  value={input?.itemCode} onChange={(e)=>handleOnChangeInput("itemCode",e)} fullWidth label="ItemCode" size='small' variant="outlined" />
                            <Autocomplete
                                  disablePortal
                                  options={inputSupplier}
                                  clearOnEscape
                                  onChange={(e,v)=>handleOnChangeInput("supplier",e,v)}
                                  getOptionLabel={(option) => option.name}
                                  value={input?.supplier}
                                  size='small'
                                  isOptionEqualToValue={(option, value) => option.value === value.value}
                                  sx={{ width: 250 }}
                                  renderInput={(params) => <TextField {...params} label="Supplier" />}
                                  />
                          </Box>
                      </Grid>
                      
                      <Grid xs={6} md={3} lg={3}>
                          <Box component="form" noValidate autoComplete="off"
                          sx={{
                              '& .MuiTextField-root': { m: 1, width: '30ch' },
                              '& .MuiButton-root': { m: 1, width: '30ch' },
                          }}>
                            <Autocomplete
                                  disablePortal
                                  id="combo-box-demo"
                                  options={inputBuyer}
                                  clearOnEscape
                                  onChange={(e,v)=>handleOnChangeInput("buyer",e,v)}
                                  getOptionLabel={(option) => option.name}
                                  value={input?.buyer}
                                  size='small'
                                  isOptionEqualToValue={(option, value) => option.value === value.value}
                                  sx={{ width: 250 }}
                                  renderInput={(params) => <TextField {...params} label="Buyer" />}
                                  />

                              <Autocomplete
                                  disablePortal
                                  id="combo-box-demo"
                                  options={inputMaterial}
                                  clearOnEscape
                                  onChange={(e,v)=>handleOnChangeInput("material",e,v)}
                                  getOptionLabel={(option) => option.name}
                                  value={input?.material}
                                  size='small'
                                  isOptionEqualToValue={(option, value) => option.value === value.value}
                                  sx={{ width: 250 }}
                                  renderInput={(params) => <TextField {...params} label="Material" />}
                                  />
                              </Box>
                          </Grid>
                          <Grid xs={6} md={3} lg={3} sx={{ ml:-10}}>
                          <Box component="form" noValidate autoComplete="off"
                           sx={{
                            '& .MuiTextField-root': { m: 1, width: 'auto' },
                            '& .MuiButton-root': { m: 1, width: 'auto' },
                          }}
                          >
                           <Grid container spacing={1} justifyContent="space-between" alignItems="center" direction="row">
                              <Grid xs={6} md={8} lg={8}>
                                  <TextField  value={input?.color} onChange={(e)=>handleOnChangeInput("color",e)} fullWidth label="Color Finish" size='small' variant="outlined" />
                              </Grid>
                             
                            </Grid>  

                            <Grid container spacing={1} justifyContent="space-between" alignItems="center" direction="row">
                              <Grid xs={4} md={4} lg={4}>
                                <FormControlLabel
                                      label="Unfinished"
                                      control={<Checkbox
                                      checked={input?.unfinished}
                                      onChange={(e)=>handleOnChangeInput("unfinished",e)} />}
                                />
                              </Grid>
                              <Grid xs={4} md={4} lg={4}>
                              <Button variant="contained" color="primary" onClick={onClear} size="medium" fullWidth startIcon={<Save/>}> Clear</Button>
                              </Grid>
                              <Grid xs={4} md={4} lg={4}>
                              <Button variant="outlined" color="primary" onClick={onSearch} size="medium" fullWidth startIcon={<Save/>}> Search </Button>
                              </Grid>
                            </Grid>
                              
                              </Box>
                          </Grid>

                      </Grid>
                  </Paper>
                            </AccordionDetails>
                        </Accordion>
                       
                        </div>
                 
                  </Grid>
                  
                  
              </Grid>
                  
            
          </Box>
          {/* INPUTS END */}

          <Paper elevation={10} style={{ height: 500, width: '100%' }}>
            <DataGridPro
              rowHeight={40}

              pageSizeOptions={[20]}
              showCellVerticalBorder
              showColumnVerticalBorder
              //disableRowSelectionOnClick={true}
              slots={{
                toolbar: CustomizeToolBar,
              }}
              density="compact"

              rows={rows}
              columns={columns}
              columnGroupingModel={columnGroupingModel}
              experimentalFeatures={{ columnGrouping: true }}

             
             
              initialState={{
                pinnedColumns: { left: ['inspectiondate', 'supplier', 'itemcode', 'itemdescription', 'buyer', 'material'] },
                columns: {
                  columnVisibilityModel: {
                    emptyDefect: false,
                    passIssues: false,
                    timestart: false,
                    timeend: false,
                    dateclosure: false,
                  },
                }
              }}

              getRowClassName={(params)=>{
                if (params.row.unfinished !== 0) {
                  return 'unfinished-zero'; // Apply this class when unfinished is 0
                }

                return '';
              }}
              
              getCellClassName={(params)=>{

                
                if (params.field === 'itemcode' && params.row.emptyDefect == true) {
                  return 'false-itemcode-cell';
                }

                if (params.field === 'firstpassmajor' && params.row.passIssues.firstDefect === 1) {
                  return 'false-itemcode-cell';
                }
                if (params.field === 'firstpasspullout' && params.row.passIssues.firstPullOut === 1) {
                  return 'false-itemcode-cell';
                }
                if (params.field === 'secondpasspullout' && params.row.passIssues.secondPullOut === 1) {
                  return 'false-itemcode-cell';
                }

                return  params.field === "firstpassgood" 
                || params.field === "totalgood"  
                || params.field === "totalpullout"
                ? "highlight" : ""
              }}

              sx={{
                '& .MuiDataGrid-row.unfinished-zero': {
                  backgroundColor: '#ffcccc', 
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  whiteSpace: 'break-spaces',
                  lineHeight: 1,
                },
                '& .MuiDataGrid-root .MuiDataGrid-columnHeader--alignRight .MuiDataGrid-columnHeaderTitleContainer': {
                  pl: 1,
                },
                "& .MuiDataGrid-cell": {
                  border: 1,
                  borderRight: 1,
                  borderTop: 0,
                  borderLeft: 0,
                  borderBottom: 1,
                  borderColor: 'primary.light',
                  fontSize: 12,
                },
                boxShadow: 2,
                borderColor: 'primary.light',
                '& .MuiDataGrid-cell:hover': {
                  color: 'primary.main',
                },
                '& .MuiDataGrid-columnHeader': {
                  border: 1,
                  borderColor: 'primary',
                  backgroundColor: 'primary.main',
                  color: '#fff',
                },
                '.highlight': {
                  bgcolor: "#dfe6e9",
                  "&:hover": {
                    bgcolor: "#b2bec3",
                  },
                },
                '.false-itemcode-cell': {
                  backgroundColor: '#2d3436', // Set the background color for itemcode column when value is false
                  color: '#fff', // You can also change the text color if needed
                },
                overflow: "scroll",
                '& .Mui-selected': {
                  backgroundColor: '#f6e58d !important',
                  color: '#000',
                },
                '& .pin-header': {
                  backgroundColor: 'primary.main',
                  color: '#fff',
                },
                '& .defect-header': {
                  backgroundColor: '#d63031',
                  color: '#fff',
                },
                '& .pullout-header': {
                  backgroundColor: '#f0932b',
                  color: '#fff',
                },
              }}
            />
          </Paper>
          <Grid container spacing={2} alignItems="end" justifyContent="end">
              <Grid xs={12} md={11} lg={11}>
                <Box sx={{mt:3}}> </Box>
              <Stack spacing={2}>
                <Pagination 
                  count={numberOfPages} 
                  page={Number(queryPage) || 1}
                  variant="outlined" 
                  shape="rounded" 
                  color="secondary"
                  renderItem={(item)=>(
                    <PaginationItem 
                      { ...item }
                      component={Button}
                      onClick={()=>handleChangePage(item.page)}
                    />
                  )}
                  />
              </Stack>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
        {/* dialog box */}
        <Dialog open={openReportModal} onClose={handleCloseReportModal}
          TransitionComponent={Transition}
          PaperProps={{
          style: {
              margin: 0,
              width: '80%',
              height: '80%',
              maxHeight: '90%',
              borderRadius: 0,
              },
          }}
          maxWidth="lg">
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                Export Report
            </DialogTitle>
            <IconButton
              aria-label="close"
              onClick={handleCloseReportModal}
              sx={(theme) => ({
                position: 'absolute',
                right: 8,
                top: 8,
                color: theme.palette.grey[500],
              })}
            >
              <Close />
            </IconButton>
          <DialogContent>
          
          <Grid container spacing={1} direction="row" justifyContent="center">
                <Grid xs={4} md={4} lg={4}>
                    <Box component="form" noValidate autoComplete="off"  sx={{
                    '& .MuiTextField-root': { m: 1, width: '40ch' },
                }}>
                    <DatePicker label="Inspection Start" size='small' maxDate={moment().add(3,'y')} minDate={moment('2000','YYYY')} onChange={(e)=>handleOnChangeInputReport("dateStart",e)} value={inputReport?.dateStart}/>
                    <DatePicker label="Inspection End" size='small' maxDate={moment().add(3,'y')} minDate={moment('2000','YYYY')} onChange={(e)=>handleOnChangeInputReport("dateEnd",e)} value={inputReport?.dateEnd}/>  
                    <Tooltip 
                      title={
                              <Typography color="inherit">
                              <span style={{color:'#fff'}}>
                                  accepts multiple values separated by commas minimum of 3 characters, example  <span style={{color:'#fab1a0'}}>"pf9,982,blk"</span>
                              </span>
                              </Typography>
                          } placement="right"
                      arrow>
                       <TextField  onChange={(e) => handleOnChangeInputReport("itemCode", e)}  fullWidth label="ItemCode" size='small' variant="outlined" />
                    </Tooltip>
                    
                    <Tooltip
                      title={
                              <Typography color="inherit">
                              <span style={{color:'#fff'}}>
                                  accepts multiple values separated by commas minimum of 3 characters, example  <span style={{color:'#fab1a0'}}>"red,age,gra"</span>
                              </span>
                              </Typography>
                          } placement="right"
                      arrow>
                       <TextField onChange={(e) => handleOnChangeInputReport("color", e)}  fullWidth label="Color" size='small' variant="outlined" />
                    </Tooltip>
                      <Autocomplete
                          disablePortal
                          id="combo-box-demo"
                          options={inputMaterialReport}
                          clearOnEscape
                          onChange={(e,v)=>handleOnChangeInputReport("material",e,v)}
                          getOptionLabel={(option) => option.name}
                          value={inputReport?.material}
                          size='small'
                          isOptionEqualToValue={(option, value) => option.value === value.value}
                          sx={{ width: 250 }}
                          renderInput={(params) => <TextField {...params} label="Material" />}
                          />
                      <Typography className="" sx={{mt:15}}>Note: Color inputed, depends only on the itemCode data retrieve</Typography>
                    </Box>
                </Grid>
                <Grid xs={4} md={4} lg={4}>
                <Box component="form" noValidate autoComplete="off"  sx={{
                    '& .MuiTextField-root': { m: 1, width: '40ch' },
                }}>
                      {/*  */}
                      <Autocomplete
                              disablePortal
                              id="combo-box-demo"
                              options={inputBuyerReport}
                              clearOnEscape
                              onChange={(e,v)=>handleOnChangeInputReport("buyer",e,v)}
                              getOptionLabel={(option) => option.name}
                              value={inputReport?.buyer}
                              size='small'
                              isOptionEqualToValue={(option, value) => option.value === value.value}
                              sx={{ width: 250 }}
                              renderInput={(params) => <TextField {...params} label="Buyer" />}
                              />
                        <Autocomplete
                              multiple
                              disablePortal
                              options={inputSupplierReport}
                              clearOnEscape
                              onChange={(e, value) => handleOnChangeInputReport("supplier", e, value)}
                              getOptionLabel={(option) => option.name}
                              value={inputReport?.supplier || []}
                              size="small"
                              isOptionEqualToValue={(option, value) => option.name === value.name}
                              sx={{ width: 250 }}
                              renderInput={(params) => <TextField {...params} label="Supplier" />}
                              renderOption={(props, option, { selected }) => (
                                  <li {...props}>
                                      <Checkbox checked={selected} />
                                      <ListItemText primary={option.name} />
                                  </li>
                              )}
                          />
                    </Box>
                </Grid>
                <Grid xs={4} md={4} lg={4}>
                <Box component="form" noValidate autoComplete="off"  sx={{
                    '& .MuiTextField-root': { m: 1, width: '40ch' },
                }}>
                    <Grid container spacing={3} justifyContent="flex-start" alignItems="flex-start " direction="row">
                        <Grid xs={10} md={10} lg={10}>
                          <Button variant="contained" color="primary" onClick={onExportReportList} size="medium" fullWidth startIcon={<Assessment/>}>{` (Inspecion,Defects) List`}</Button>
                        </Grid>
                        <Grid xs={10} md={10} lg={10}>
                          <Button variant="contained" color="success" sx={{fontSize:10}} onClick={onExportReportSum} size="medium" fullWidth startIcon={<Assessment/>}>  {`Summary(supplier,itemcode,buyer,material)`} </Button>
                        </Grid>
                        <Grid xs={10} md={10} lg={10}>
                          <Button variant="contained" color="warning" onClick={onExportReportDefects} size="medium" fullWidth startIcon={<Assessment/>}> Defects Datas </Button>
                        </Grid>
                        <Grid xs={10} md={10} lg={10}>
                          <Button variant="contained" color="success" onClick={onExportReportSuppliersSummary} size="medium" fullWidth startIcon={<Assessment/>}> Suppliers Summary </Button>
                        </Grid>
                        <Grid xs={10} md={10} lg={10}>
                          <Button variant="contained" color="primary" onClick={onExportReportItemsSummary} size="medium" fullWidth startIcon={<Assessment/>}> Items Summary </Button>
                        </Grid>
                        <Grid xs={8} md={8} lg={8}>
                          <Button variant="outlined" color="error" onClick={onClearReport} size="medium" fullWidth startIcon={<Save/>}> Clear</Button>
                        </Grid>
                    </Grid>
                    </Box>
                </Grid>
          </Grid>

          </DialogContent>
        </Dialog>
      <div>
          {!!snackbar && (
              <Snackbar
                  open
                  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                  onClose={handleCloseSnackbar}
                  autoHideDuration={4000}
              > 
                  <Alert {...snackbar} onClose={handleCloseSnackbar} variant="filled" />
              </Snackbar>
          )}
      </div>
    </Paper>
  );
};

export default InspectionTable;
