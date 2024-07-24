import React,{useState,useEffect} from 'react';


import { Box,Button,Snackbar,Alert,Autocomplete,TextField,Backdrop,CircularProgress,Typography} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import {exportReport,clearMoldState} from '../../../../actions/molds';

import { exportToExcel } from 'react-json-to-excel';

import moment from 'moment'

import { useDispatch,useSelector } from 'react-redux';


const ReportsMold = ({ openReportsModal, handleCloseReportsModal }) =>{

    const dispatch = useDispatch();

    const {suppliers} = useSelector(state=> state.suppliers);
    const {buyers} = useSelector(state=> state.buyers);
    const {isLoading,exportMolds,message,nearValidationMolds} = useSelector(state => state.molds);

    const [inputSupplier,setInputSupplier] = useState([]);
    const [inputBuyer,setInputBuyer] = useState([]);
    
    const [input,setInput] = useState({
        itemCode:null,
        supplier:null,
        buyer:null,
        condition:[],
    });
    const [inputNearValidation,setInputNearValidation] = useState([]);

    const [generateReportLoading,setGenerateReportLoading] = useState(false);

    useEffect(() =>{
        if(!isLoading && exportMolds.length > 0 && message === "export"){

            const dataExport = exportMolds.map(ex =>{
                return {
                    "Item Code": ex.itemCode,
                    "Buyer": ex.buyerName,
                    "Material":ex.materialName,
                    "Mold Material":ex.moldMaterialName,
                    "Supplier": ex.supplierName,
                    "Mold #": ex.moldNumber,
                    "Life Remaining": ex.life,
                    "PEBA Owned": ex.owned ? "Yes" : "No",
                    "Condition": ex.conditionName,
                    "Total Delivered": ex.delivered,
                    "Last Edited By" : ex.lastEditdBy,
                    "Last Updated":moment(ex.updatedAt).format('L'),
                    "Remarks" : ex.remarks
                };
            })



            exportToExcel(dataExport, `Mold-Report-${moment().format('L')}`);
           // loading done and clear exportMolds state

           inputClear();
           handleCloseReportsModal();
        
           
           dispatch(clearMoldState());
        }
        else if(!isLoading && exportMolds.length === 0 && message === "no itemcode found")
            setSnackbar({ children: `No Molds matches the search, If you dont know the exact ItemCode you can leave it blank`, severity: 'error' });
        else if(!isLoading && exportMolds.length === 0 && message === "export")
            setSnackbar({ children: `No Data found, `, severity: 'error' });
        setGenerateReportLoading(false);

        if(!isLoading){
            setInputNearValidation(nearValidationMolds);
        }

    },[isLoading,exportMolds,message,nearValidationMolds])


    useEffect(()=>{
        setInputSupplier(suppliers);
        setInputBuyer(buyers);
    },[suppliers,buyers]);


    const inputClear = () =>{
        setInput({
            itemCode:null,
            supplier:null,
            buyer:null,
            condition: [],
        });
    }

    const conditions = [
        { label: 'Good', name: 'good',color: 'success'},
        { label: 'Bad', name: 'bad',color: 'error'},
        { label: 'Near Validation', name: 'near_validation',color: 'warning'},
        { label: 'For Validation', name:'for_validation',color: 'primary'},
      ];

    const [snackbar, setSnackbar] = useState(null);
    const handleCloseSnackbar = () => setSnackbar(null);

    const handleOnChangeInput = (name,e,val=null) =>{
        if(name === "condition" || name === "supplier" || name === "buyer"){
            setInput({
                ...input,
                [name]: val 
            });
        }
        else
            setInput({
                ...input,
                [name]: e.target.value 
            });
    }

    const generateReport = async () =>{

        let flag = true;

        const itemCodeReg = /^[a-zA-Z0-9-]*$/;
        if(!itemCodeReg.test(input.itemCode)) {
            setSnackbar({ children: `Item Code Number inputed is invalid, `, severity: 'error' });
            flag = false;
        }

        const findSupplier = inputSupplier.find(con => con?.name === input.supplier?.name);
        const findBuyer = inputBuyer.find(buy => buy?.name === input.buyer?.name);

        if(findSupplier === undefined || findSupplier === null){
            if(findBuyer === undefined || findBuyer === null){
                setSnackbar({ children: `Supplier or Buyer is required`, severity: 'error' });
                flag = false;
            }
        }
       
        if(findBuyer === undefined || findBuyer === null){
            if(findSupplier === undefined || findSupplier === null){
                setSnackbar({ children: `Buyer or Supplier is required`, severity: 'error' });
                flag = false;
            }
        }

        if(input?.condition?.length === 0){
           
            setSnackbar({ children: `Condition is required`, severity: 'error' });
            flag = false;
        }
        if(flag){

           // alert(JSON.stringify(input));
            setGenerateReportLoading(true);

            await dispatch(exportReport({itemCode:input?.itemCode?.toUpperCase(), supplierId:input?.supplier?._id,buyerId:input?.buyer?._id, condition: input?.condition }));
            // start loading
        }
    }


  return(
     <>
        {/* dialog box */}
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={generateReportLoading}>
            <CircularProgress color="inherit" />
        </Backdrop>
      <Dialog open={openReportsModal} onClose={handleCloseReportsModal}>
        <DialogTitle>Mold Report </DialogTitle>
        <DialogContent>
            <Box component="form" noValidate autoComplete="off"
                    sx={{
                        '& .MuiTextField-root': { m: 1, width: '50ch' },
                    }}>
                <TextField label="Item Code" onChange={(e)=>handleOnChangeInput("itemCode",e)} value={input.itemCode || ''} variant="outlined" size='small' fullWidth
                 onKeyDown={(e) => { if (e.key === 'Enter') {generateReport();}}}/>
                <Autocomplete
                    size='small'
                    disablePortal
                    id="supplierId"
                    options={inputSupplier}
                    clearOnEscape 
                    onChange={(e,v)=>handleOnChangeInput("supplier",e,v)}
                    getOptionLabel={(option) => option.name}
                    sx={{ width: 250 }}
                    value={input?.supplier}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    renderInput={(params) => <TextField {...params} label="Supplier" onKeyDown={(e) => { if (e.key === 'Enter') {generateReport();}}} />}
                />

                <Autocomplete
                    size='small'
                    disablePortal
                    id="buyerId"
                    options={inputBuyer}
                    clearOnEscape
                    onChange={(e,v)=>handleOnChangeInput("buyer",e,v)}
                    getOptionLabel={(option) => option.name}
                    sx={{ width: 250 }}
                    value={input?.buyer}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    renderInput={(params) => <TextField {...params} label="Buyer" onKeyDown={(e) => { if (e.key === 'Enter') {generateReport();}}} />}
                />
               
                <Autocomplete
                    multiple
                    id="tags-standard"
                    size='small'
                    options={conditions}
                    getOptionLabel={(option) => option.label} 
                    onChange={(e,v)=>handleOnChangeInput("condition",e,v)}
                    
                    renderInput={(params) => <TextField {...params} label="Condition" variant="standard"/>}
                    sx={{ width: 250 }}
                /> 
                
                </Box>
                <Box sx={{mt:2}}>
                    <Typography variant="p" color="error" >
                        Note: ItemCode is optional | Condition is required,<br/>Supplier or Buyer are required
                    </Typography>
                </Box>
                {/* </Grid>
            </Grid> */}
        </DialogContent>
        <DialogActions>
            <Button onClick={handleCloseReportsModal} variant="contained" color="warning">Cancel</Button>
            <Button onClick={generateReport} variant="contained">Generate Report</Button>
        </DialogActions>
        </Dialog>
        <div>
            {!!snackbar && (
                <Snackbar
                    open
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    onClose={handleCloseSnackbar}
                    autoHideDuration={4000}
                > 
                    <Alert {...snackbar} onClose={handleCloseSnackbar} variant="filled" />
                </Snackbar>
            )}
        </div>
     </>
  )
};

export default ReportsMold;

