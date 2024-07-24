import React, { useEffect,useState } from 'react';
import {Box,Paper,Typography,TextField,Autocomplete,Button,Badge,Backdrop,Tooltip,CircularProgress,Snackbar,Alert} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

import {Save,SystemUpdateAlt,Search,Clear,Pageview} from '@mui/icons-material';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import {getBuyers} from '../../../../actions/buyers';
import {getMaterials} from '../../../../actions/materials';
import {getMoldMaterials} from '../../../../actions/moldMaterials';
import {getSuppliers} from '../../../../actions/suppliers';
import {countNearValidation} from '../../../../actions/molds';
import {createItem,editItem,getItemsBySearch,getItems} from '../../../../actions/items';

import { useSelector,useDispatch } from 'react-redux';

import {useNavigate,useLocation} from 'react-router-dom';

import PoQuickview from '../Modal/PoQuickview';
import  ReportsMold from '../Modal/ReportsMold';

import { AUTH_LOGOUT } from '../../../../constant/actionTypes';
import decode from 'jwt-decode';



const AddItem = ({sharedStateRef,setSharedStateRef}) =>{
    const dispatch = useDispatch();
    const navigate = useNavigate();


    const {buyers,isLoading:buyerLoading} = useSelector(state=> state.buyers);
    const {materials,isLoading:materialLoading} = useSelector(state=> state.materials);
    const {moldMaterials,isLoading:moldMaterialLoading} = useSelector(state=> state.moldMaterials);
    const {suppliers,isLoading:supplierLoading} = useSelector(state=> state.suppliers);
    const {isLoading:moldLoading,nearValidationMolds} = useSelector(state=> state.molds);

    const [user,setUser] = useState(JSON.parse(localStorage.getItem('profile')));
    const userDepartment = user?.result?.department?.department;

    const handleLogout = () =>{
      dispatch({type: AUTH_LOGOUT});
      navigate(`/login`);
      setUser(null);
    }


    useEffect(()=>{
        dispatch(getBuyers());
        dispatch(getMaterials());
        dispatch(getMoldMaterials());
        dispatch(getSuppliers());
        dispatch(countNearValidation());
        //alert('useEffect => get all options for buyer,material,supplier');
    },[dispatch])

    const [input,setInput] = useState({
        _id:null,
        itemCode:null,
        itemDescription:null,
        supplier:null,
        buyer:null,
        material:null,
        moldMaterial:null,
        prevSuplier:null
    });

    const [openReportsModal, setOpenReportsModal] = useState(false);
    const handleOpenReportsModal = () => {
            setOpenReportsModal(true);
    };
    const handleCloseReportsModal = () => {
        setOpenReportsModal(false);
    };

    const [openPoQuickviewModal, setOpenPoQuickviewModal] = useState(false);
    const handleOpenPoQuickviewModal = () => {
            setOpenPoQuickviewModal(true);
    };
    const handleClosePoQuickviewModal = () => {
        setOpenPoQuickviewModal(false);
    };

    const [isEditButton,setIsEditButton] = useState(false);
    const [isAddItemCalled, setIsAddItemCalled] = useState(0);

    sharedStateRef.current = input;
    setSharedStateRef.current = setInput;

    sharedStateRef.isAddItemCalled = isAddItemCalled;
    setSharedStateRef.setIsAddItemCalled = setIsAddItemCalled;

    setSharedStateRef.button = setIsEditButton;

    const [inputBuyer,setInputBuyer] = useState([]);
    const [inputMaterial,setInputMaterial] = useState([]);
    const [inputMoldMaterial,setInputMoldMaterial] = useState([]);
    const [inputSupplier,setInputSupplier] = useState([]);
    const [inputNearValidation,setInputNearValidation] = useState([]);
    const [nearValidationTooltip,setNearValidationTooltip] = useState('');

    useEffect(()=>{

        const token = user?.token;
        if(token){
          const decodedToken = decode(token);
          if(decodedToken.exp * 1000 < new Date().getTime())
            handleLogout();
        }else{
          handleLogout();
        }

        if(buyers.length > 0 && suppliers.length > 0 && materials.length > 0 && moldMaterials.length > 0 && !moldLoading ){
            setInput({
                _id:null,
                itemCode:null,
                itemDescription:null,
                supplier:null,
                buyer:null,
                material:null,
                moldMaterial:null,
                prevSuplier:null,
            });
            setInputBuyer(buyers);
            setInputMaterial(materials);
            setInputMoldMaterial(moldMaterials);
            setInputSupplier(suppliers);
            setInputNearValidation(nearValidationMolds);

           //alert(`useEffect => ${user?.result?.role}`);
            const namesString = nearValidationMolds.map(obj => obj?.itemId?.name).join(', ');
            setNearValidationTooltip(namesString);
        }

    },[buyers,materials,moldMaterials,suppliers,user,nearValidationMolds]);

    const handleOnChangeInput = (name,e,val=null) =>{
        
        if(name === "buyer" || name === "material" || name === "moldMaterial" || name === "supplier"){
            setInput({
                ...input,
                [name]: val 
            });
        }else
            setInput({
                ...input,
                [name]: e.target.value 
            });
        }

    const [snackbar, setSnackbar] = React.useState(null);
    const handleCloseSnackbar = () => setSnackbar(null);

    const searchItem =  () =>{

        setIsAddItemCalled(prev => prev + 1);
        
        if((input?.itemCode == null || input?.itemCode == '') && 
            (input?.itemDescription == null || input?.itemDescription == '') && 
            (input?.buyer?._id == null || input?.buyer?._id == '') && 
            (input?.supplier?._id == null ||  input?.supplier?._id == '') &&
            (input?.material?._id == null ||  input?.material?._id == '') &&
            (input?.moldMaterial?._id == null ||  input?.moldMaterial?._id == '')){
                dispatch(getItems(1));
                navigate(`/mold-details?page=1`);
        
        }else{
            
            dispatch(getItemsBySearch({
                itemcode: input?.itemCode || '',
                itemdesc: input?.itemDescription || '',
                buyer: input?.buyer?._id || '',
                supplier: input?.supplier?._id || '',
                material: input?.material?._id || '',
                moldMaterial: input?.moldMaterial?._id || '',
                page:1}));
        
            navigate(`/mold-details/search?itemcode=${input?.itemCode || ''}&itemdesc=${input?.itemDescription || ''}&supplier=${input?.supplier?._id  || ''}&buyer=${input?.buyer?._id  || ''}&material=${input?.material?._id || ''}&moldMaterial=${input?.moldMaterial?._id || ''}&page=1`);
        }
    }

    const AddItem = async () =>{

        let flag = true;
        setIsAddItemCalled(prev => prev + 1);


        if(userDepartment !== "Purchasing" && userDepartment !== "Administrator"){
            setSnackbar({ children: `You are not allowed to make this action`, severity: 'warning' });
            flag = false;
        }

        const itemNumberReg = /^(?:[a-zA-Z0-9]+-?){3,15}$/;
        if(!itemNumberReg.test(input.itemCode)) {
            setSnackbar({ children: `Item Code inputed is invalid, `, severity: 'error' });
            flag = false;
        }

        const itemDescReg = /^[a-zA-Z0-9!@#$%^&*()_+-=,.<>?;:'"\[\]{}|\\/\s]{3,100}$/;
        if(!itemDescReg.test(input.itemDescription)){
            setSnackbar({ children: `Item Description inputed is invalid, `, severity: 'error' });
            flag = false;
        }

        const findBuyer = inputBuyer.find(buy => buy?._id === input.buyer?._id);
        if(findBuyer === undefined || findBuyer === null){
            setSnackbar({ children: `Buyer inputed is invalid`, severity: 'error' });
            flag = false;
        }

        const findSupplier = inputSupplier.find(buy => buy?._id === input.supplier?._id);
        if(findSupplier === undefined || findSupplier === null){
            setSnackbar({ children: `Supplier inputed is invalid`, severity: 'error' });
            flag = false;
        }

        const findMaterial = inputMaterial.find(buy => buy?._id === input.material?._id);
        if(findMaterial === undefined || findMaterial === null){
            setSnackbar({ children: `Material inputed is invalid`, severity: 'error' });
            flag = false;
        }

        const findMoldMaterial = inputMoldMaterial.find(buy => buy?._id === input.moldMaterial?._id);
        if(findMoldMaterial === undefined || findMoldMaterial === null){
            setSnackbar({ children: `Mold Material inputed is invalid`, severity: 'error' });
            flag = false;
        }

        if(flag){

           await dispatch(createItem({...input,itemCode:input.itemCode.toUpperCase(),lastEditdBy:`${user?.result?.firstname} ${user?.result?.lastname}`}));
            setInput({
                _id:null,
                itemCode:null,
                itemDescription:null,
                supplier:null,
                buyer:null,
                material:null,
                moldMaterial:null,
                prevSuplier:null
            });

            navigate(`/mold-details?page=1`);
            await dispatch(getItems(1));
           // setSnackbar({ children: `Successfully added`, severity: 'success' });
        }
    }

    const EditItem = async () =>{
        let flag = true;
        setIsAddItemCalled(prev => prev + 1);

        if(userDepartment !== "Purchasing" && userDepartment !== "Administrator"){
            setSnackbar({ children: `You are not allowed to make this action`, severity: 'warning' });
            flag = false;
        }

        const itemDescReg = /^[a-zA-Z0-9!@#$%^&*()_+-=,.<>?;:'"\[\]{}|\\/\s]{3,100}$/;
        if(!itemDescReg.test(input.itemDescription)){
            setSnackbar({ children: `Item Description inputed is invalid, `, severity: 'error' });
            flag = false;
        }

        const findBuyer = inputBuyer.find(buy => buy?._id === input.buyer?._id);
        if(findBuyer === undefined || findBuyer === null){
            setSnackbar({ children: `Buyer inputed is invalid`, severity: 'error' });
            flag = false;
        }

        const findSupplier = inputSupplier.find(buy => buy?._id === input.supplier?._id);
        if(findSupplier === undefined || findSupplier === null){
            setSnackbar({ children: `Supplier inputed is invalid`, severity: 'error' });
            flag = false;
        }

        const findMaterial = inputMaterial.find(buy => buy?._id === input.material?._id);
        if(findMaterial === undefined || findMaterial === null){
            setSnackbar({ children: `Material inputed is invalid`, severity: 'error' });
            flag = false;
        }

        const findMoldMaterial = inputMoldMaterial.find(buy => buy?._id === input.moldMaterial?._id);
        if(findMoldMaterial === undefined || findMoldMaterial === null){
            setSnackbar({ children: `Mold Material inputed is invalid`, severity: 'error' });
            flag = false;
        }

        if(flag){

            await dispatch(editItem(input._id,{...input,lastEditdBy:`${user?.result?.firstname} ${user?.result?.lastname}`}));
            setInput({
                _id:null,
                itemCode:null,
                itemDescription:null,
                supplier:null,
                buyer:null,
                material:null,
                moldMaterial:null,
                prevSuplier:null
            });
            setIsEditButton(false);
            
        }
    }

    const clearItem = () =>{
        setInput({
            _id:null,
            itemCode:null,
            itemDescription:null,
            supplier:null,
            buyer:null,
            material:null,
            moldMaterial:null,
            prevSuplier:null
        });

        setIsEditButton(false);
    }

    return (

        <Accordion  sx={{
            backgroundColor: "#222f3e",
            color:"#fff"
        }}
        defaultExpanded={true}>
        <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
        >
        <Typography variant="h6"> Search / Add Item</Typography>
        </AccordionSummary>
        <AccordionDetails>

            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={buyerLoading || materialLoading || supplierLoading || moldMaterialLoading || moldLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>

            <PoQuickview openPoQuickviewModal={openPoQuickviewModal} handleClosePoQuickviewModal={handleClosePoQuickviewModal}/>
            <ReportsMold openReportsModal={openReportsModal} handleCloseReportsModal={handleCloseReportsModal}/>

            <Paper elevation={6} sx={{padding:2}}>
                    <Grid container spacing={2} direction="row" justifyContent="space-between">
                        <Grid xs={6} md={6} lg={6}>
                            <Typography variant="h6"> Search / Add Item </Typography><br/>
                        </Grid>
                        <Grid xs={3} md={3} lg={3}>
                            <Button size='small' variant="contained" color="secondary" startIcon={<Pageview/>}  onClick={handleOpenPoQuickviewModal}  >PO Quickview </Button>
                        </Grid>
                        <Grid xs={3} md={3} lg={3}>

                            <Badge badgeContent={inputNearValidation?.length} color="error">
                                <Tooltip title={nearValidationTooltip} placement="right-start">
                                    <Button size='small' variant="contained" color="success" startIcon={<SystemUpdateAlt/>}  onClick={handleOpenReportsModal}  >Mold Report </Button>
                                </Tooltip>
                            </Badge>

                        </Grid>
                    </Grid>
                    <Grid container spacing={2} direction="row" justifyContent="center">
                        <Grid xs={6} md={6} lg={6}>
                            <Box component="form" noValidate autoComplete="off"  sx={{
                            '& .MuiTextField-root': { m: 1, width: '40ch' },
                        }}>
                                <TextField size='small' 
                                    disabled={isEditButton}
                                 onChange={(e)=>handleOnChangeInput("itemCode",e)} value={input.itemCode || ''} fullWidth label="Item Code" variant="outlined" />
                                <TextField size='small' onChange={(e)=>handleOnChangeInput("itemDescription",e)} value={input.itemDescription || ''}  multiline rows={2} fullWidth label="Item Description" variant="outlined" />
                                <Autocomplete
                                    //disabled={isEditButton}
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
                                    renderInput={(params) => <TextField {...params} label="Supplier" />}
                                /> 
                            </Box>
                        </Grid>
                        <Grid xs={6} md={6} lg={6}>
                            <Box component="form" noValidate autoComplete="off"  sx={{
                            '& .MuiTextField-root': { m: 1, width: '40ch' },
                        }}>
                            <Autocomplete
                                size='small'
                                disablePortal
                                id="buyerssId"
                                options={inputBuyer}
                                clearOnEscape 
                                onChange={(e,v)=>handleOnChangeInput("buyer",e,v)}
                                getOptionLabel={(option) => option.name}
                                sx={{ width: 250 }}
                                value={input?.buyer}
                                isOptionEqualToValue={(option, value) => option.value === value.value}
                                renderInput={(params) => <TextField {...params} label="Buyer" />}
                            />
                            <Autocomplete
                                size='small'
                                disablePortal
                                id="materialsId"
                                options={inputMaterial}
                                clearOnEscape 
                                onChange={(e,v)=>handleOnChangeInput("material",e,v)}
                                getOptionLabel={(option) => option.name}
                                sx={{ width: 250 }}
                                value={input?.material}
                                isOptionEqualToValue={(option, value) => option.value === value.value}
                                renderInput={(params) => <TextField {...params} label="Material" />}
                            />
                            <Autocomplete
                                size='small'
                                disablePortal
                                id="moldMaterialsId"
                                options={inputMoldMaterial}
                                clearOnEscape 
                                onChange={(e,v)=>handleOnChangeInput("moldMaterial",e,v)}
                                getOptionLabel={(option) => option.name}
                                sx={{ width: 250 }}
                                value={input?.moldMaterial}
                                isOptionEqualToValue={(option, value) => option.value === value.value}
                                renderInput={(params) => <TextField {...params} label="Mold Material" />}
                            />
                            </Box>
                           
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} direction="row" justifyContent="center">
                        <Grid xs={4} md={4} lg={4}>
                            <Button size='small' variant="contained" color={isEditButton ? `success` : `primary`} startIcon={<Save/>} fullWidth onClick={isEditButton ? EditItem :AddItem}  > {isEditButton ? `Edit Item` : `Add Item`} </Button>
                        </Grid>
                        <Grid xs={4} md={4} lg={4}>
                            <Button size='small' variant="contained" color="error" startIcon={<Clear/>} fullWidth onClick={clearItem}  > Clear </Button>
                        </Grid>
                        <Grid xs={4} md={4} lg={4}>
                            <Button size='small' variant="contained" color="warning" startIcon={<Search/>} fullWidth onClick={searchItem}  > Search Item </Button>  
                        </Grid>
                    </Grid>
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
            </Paper>
            </AccordionDetails>
            </Accordion>
    )
};

export default AddItem;