import React, { useEffect,useState } from 'react';
import {Box,Paper,Dialog,AppBar,Toolbar,Typography,Table,TableContainer,TableRow,TableHead,TableBody,TableCell,DialogContent,TextField,Autocomplete,Button,Badge,Backdrop,Tooltip,CircularProgress,Snackbar,Alert,IconButton} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

import {Save,Search,Clear,Pageview} from '@mui/icons-material';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionActions from '@mui/material/AccordionActions'
import {ExpandMore,Close} from '@mui/icons-material/';

import { TableVirtuoso } from 'react-virtuoso';

import Slide from '@mui/material/Slide';


import {getBuyers} from '../../../../actions/buyers';
import {getMaterials} from '../../../../actions/materials';
import {getSuppliers} from '../../../../actions/suppliers';
import {findItems,setItemMessageNull} from '../../../../actions/items';
import {createInspection,setInspectionMessageNull,getInspectionById,editInspection} from '../../../../actions/inspections';



import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment';

import { useSelector,useDispatch } from 'react-redux';

import {useNavigate,useLocation} from 'react-router-dom';

import { AUTH_LOGOUT } from '../../../../constant/actionTypes';
import decode from 'jwt-decode';
import { getItemById } from '../../../../api';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

function useQuery(){
    return new URLSearchParams(useLocation().search);
  }

const Form = ({setSharedStateRef,sharedStateRef}) =>{

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const query = useQuery();
    const queryId = query.get('id');


    const {suppliers,isLoading:supplierLoading} = useSelector(state=> state.suppliers);
    const {buyers,isLoading:buyerLoading} = useSelector(state=> state.buyers);
    const {materials,isLoading:materialLoading} = useSelector(state=> state.materials);
    const {items,message:itemMessage,isLoading:itemLoading} = useSelector(state=> state.items);
    const [selectedItem,setSelectedItem] = useState({
        item:null
    });
    const {inspections,message:inspectionMessage,isLoading:inspectionLoading} = useSelector(state=> state.inspections);

    const [input,setInput] = useState({
        supplier:null,
        material:null,
        buyer:null,
        date:moment(),
        item:null,
        itemCode:'',
        itemDescription:'',
        deliveryQty:'',
        totalMinWork:'',
        weight:'',
        remarks:'',
        totalGoodQty:0,
        totalPullOutQty:0,
        firstPass:{
            defectQty:0,
            totalGoodQty:0,
            totalPullOutQty:0
        },
        secondPass:{
            totalGoodQty:0,
            totalPullOutQty:0
        },
        unfinished:0
    });

    const [inputSupplier,setInputSupplier] = useState([]);
    const [inputMaterial,setInputMaterial] = useState([]);
    const [inputBuyer,setInputBuyer] = useState([]);
    const [buttonQueryId,setbuttonQueryId] = useState(queryId);
    const [prevInputState, setPrevInputState] = useState([]);
   
    useEffect(()=>{
        setInput({
            ...input,
            totalGoodQty: Number(input.firstPass.totalGoodQty) + Number(input.secondPass.totalGoodQty),
            totalPullOutQty: Number(input.firstPass.totalPullOutQty) + Number(input.secondPass.totalPullOutQty),
            unfinished: Number(input.deliveryQty) - ((Number(input.firstPass.totalGoodQty) + Number(input.secondPass.totalGoodQty))
                + (Number(input.firstPass.totalPullOutQty) + Number(input.secondPass.totalPullOutQty)))
        })
    },[input.firstPass,input.secondPass,input.deliveryQty]);

   useEffect(()=>{
        if(buttonQueryId !== 0){
            console.log(`called dispatch ${buttonQueryId}`);
            dispatch(getInspectionById(buttonQueryId));
        }
        dispatch(getSuppliers());
        dispatch(getBuyers());
        dispatch(getMaterials());
    },[buttonQueryId,dispatch]);

    useEffect(()=>{
        if(!inspectionLoading){
           if(inspectionMessage === 'edit duplicate'){
                setSnackbar({ children: `Duplicate entry cannot update`, severity: 'error' });
                setInput(prevInputState);
            }
            else if(inspectionMessage === 'edit good')
                setSnackbar({ children: `Successfully updated`, severity: 'success' });
            else if(inspectionMessage === 'no found')
                navigate(`/inspection-list`);   // redirect if no inspection id found via link search
        }
    },[inspectionLoading,inspectionMessage]);

   useEffect(()=>{
        if(suppliers?.length > 0 && buyers?.length > 0 && materials?.length > 0){
         setInputSupplier(suppliers);
         setInputMaterial(materials);
         setInputBuyer(buyers);
        }
    },[materials,buyers,suppliers]);

    useEffect(() =>{
        if(inspectionMessage === 'found' && !inspectionLoading && inspections !== null && !buyerLoading && inputBuyer) {
            console.log('called input');
            const initialInput = {
                supplier:inspections.supplier, //
                material:inspections.material,//
                buyer: inspections.buyer,//
                date: moment(inspections.date),
                item:inspections.item,//
                itemCode:inspections.item.itemCode, //
                itemDescription:inspections.item.itemDescription, //
                deliveryQty:inspections.deliveryQty,
                totalMinWork:inspections.totalMinWork,
                weight:inspections.weight,
                remarks:inspections.remarks,
                totalGoodQty:inspections.totalGoodQty,
                totalPullOutQty:inspections.totalPullOutQty,
                firstPass:{
                    defectQty:inspections.firstPass.defectQty,
                    totalGoodQty:inspections.firstPass.totalGoodQty,
                    totalPullOutQty:inspections.firstPass.totalPullOutQty
                },
                secondPass:{
                    totalGoodQty:inspections.secondPass.totalGoodQty,
                    totalPullOutQty:inspections.secondPass.totalPullOutQty
                }
            }
            setInput(initialInput);
            setPrevInputState(initialInput);
        }
        if(!inspectionLoading){
            if(inspectionMessage === 'duplicate'){
                setSnackbar({ children: `Duplicate Entry (Date and Item Code) `, severity: 'error' });
            }else if(inspectionMessage === 'good'){
                setSnackbar({ children: `Successfully Added`, severity: 'success' });

                navigate(`/pass-details?id=${inspections[0]?._id}`);
                setbuttonQueryId(inspections[0]?._id);
            }
        }
        dispatch(setInspectionMessageNull());
    },[inspectionLoading,inputBuyer,buyerLoading]);

    const [snackbar, setSnackbar] = useState(null);
    const handleCloseSnackbar = () => setSnackbar(null);

   const handleOnChangeInput = (name,e,val=null) =>{
    if (name.includes('.')) {
        const keys = name.split('.');
        setInput(prevInput => ({
            ...prevInput,
            [keys[0]]: {
                ...prevInput[keys[0]],
                [keys[1]]: e.target.value
            }
        }));
    }
    else if(name === "date"){
        setInput({
        ...input,
        [name]: e
        });
    }else if(name === "material" || name === "buyer" || name === "supplier"){
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

    const onSaveChanges = async () =>{
        let flag = true;
        
        const validateDate = moment(input.date).isBetween(moment('2000','YYYY'), moment().add(3,'y'));
        if(!validateDate){
            setSnackbar({ children: `Inspection Date Inputed is Invalid`, severity: 'error' });
            flag = false;
        }
  
        const itemCodeStr = /^[a-zA-Z0-9-]{1,30}$/;
        if(!itemCodeStr.test(input.itemCode)) {
            setSnackbar({ children: `ItemCode inputed is invalid, `, severity: 'error' });
            flag = false;
        }

        if(input.itemDescription === '') {
            setSnackbar({ children: `No Item selected, `, severity: 'error' });
            flag = false;
        }

        const findSupplier = inputSupplier.find(buy => buy?._id === input.supplier?._id);
        if(findSupplier === undefined || findSupplier === null){
            setSnackbar({ children: `Supplier inputed is invalid`, severity: 'error' });
            flag = false;
        }
        const findBuyer = inputBuyer.find(buy => buy?._id === input.buyer?._id);
        if(findBuyer === undefined || findBuyer === null){
            setSnackbar({ children: `Buyer inputed is invalid`, severity: 'error' });
            flag = false;
        }
        const findMaterial = inputMaterial.find(buy => buy?._id === input.material?._id);
        if(findMaterial === undefined || findMaterial === null){
            setSnackbar({ children: `Material inputed is invalid`, severity: 'error' });
            flag = false;
        }
        if(parseInt(input.deliveryQty) < 0 || parseInt(input.deliveryQty) > 999999 || input.deliveryQty == ''){
            setSnackbar({ children: `Delivery Qty inputed is invalid, `, severity: 'error' });
            flag = false;
        }
        if((parseInt(input.totalGoodQty) + parseInt(input.totalPullOutQty)) > parseInt(input.deliveryQty)){
            setSnackbar({ children: `Total Good and Pull-Out Qty must not greater than Delivered Qty`, severity: 'error' });
            flag = false;
        }
        if(parseInt(input.totalMinWork) < 0 || parseInt(input.totalMinWork) > 999999 || input.totalMinWork == ''){
            setSnackbar({ children: `Total Time(min) inputed is invalid, `, severity: 'error' });
            flag = false;
        }
        if(parseInt(input.weight) < 0 || parseInt(input.weight) > 999999 || input.weight == ''){
            setSnackbar({ children: `Weight inputed is invalid, `, severity: 'error' });
            flag = false;
        }
        if(Number(input.unfinished) < 0){
            setSnackbar({ children: `Total Good and Pull-Out Qty must not greater than Delivered Qty`, severity: 'error' });
            flag = false;
        }
        const newUser = `${user?.result?.firstname} ${user?.result?.lastname}`;
        if(flag && buttonQueryId === ''){
           
            dispatch(createInspection({...input,editedBy:newUser}));
        }
        else if(flag && buttonQueryId !== ''){
            dispatch(editInspection(queryId,{...input,editedBy:newUser}));
            console.log(` update inspection ${JSON.stringify(input)}`)
            //alert('update inspection');
        }
    };

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
    },[onSaveChanges]);
    
    const handleLogout = () =>{
        dispatch({type: AUTH_LOGOUT});
        navigate(`/login`);
        setUser(null);
    }
    // USER

    // DIALOG ITEM START

    const [rows,setRows] = useState([]);
    const [itemInput,setItemInput] = useState({
        itemCode:''
    })
    const handleOnChangeItemInput = (name,e,val=null) =>{
        setItemInput({
            [name]: e.target.value 
        });
    }

    const [openItemModal, setOpenItemModal] = useState(false);
    const handleOpenItemModal = () => {
        setOpenItemModal(true);
    };
    const handleCloseItemModal = () => {
        setOpenItemModal(false);
    };

    const VirtuosoTableComponents = {
        Scroller: React.forwardRef((props, ref) => (
          <TableContainer component={Paper} {...props} ref={ref}  />
        )),
        Table: (props) => (
          <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }}  />
        ),
        TableHead,
        TableRow: ({ item: _item, ...props }) => <TableRow {...props} />,
        TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
      };

      function fixedHeaderContent() {
        return (
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.dataKey}
                variant="head"
                align={column.numeric || false ? 'right' : 'left'}
                style={{ width: column.width }}
                sx={{borderLeft: '1px solid #fff',backgroundColor:'#222f3e',color:'#fff'}}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        );
      }

      function rowContent(_index, row) {
        return (
          <React.Fragment>
            {columns.map((column) => (
              <TableCell
                key={column.dataKey}
                align={column.numeric || false ? 'right' : 'left'}
                sx={{borderLeft: '1px solid grey'}}
              >
                {/* {row[column.dataKey]} */}
                 {row[column.dataKey]}
              </TableCell>
            ))}
          </React.Fragment>
        );
      }

      const columns = [
        {
          width: 15,
          label: '#',
          dataKey: 'rowid',
          numeric: true,
        },
        {
          width: 120,
          label: 'Item Code',
          dataKey: 'itemCode',
        },
        {
          width: 600,
          label: 'Item Description',
          dataKey: 'itemDescription',
        },
      ];

      const onFindItems = () =>{
        let flag = true;
  
        const itemCodeStr = /^[a-zA-Z0-9-]{1,30}$/;
        if(!itemCodeStr.test(itemInput.itemCode)) {
            setSnackbar({ children: `ItemCode inputed is invalid, `, severity: 'error' });
            flag = false;
        }
        if(flag){
            dispatch(findItems({ itemCode: itemInput.itemCode.toUpperCase() || '' }));
        }
    };

    function createData(id,rowid,itemCode,itemDescription) {
        return { id,rowid,itemCode,itemDescription };
    }

    const rowsData = [];

    useEffect(()=>{
        if(itemMessage === "item found" && !itemLoading){
          setRows([]);
          let rowNum = 1;

          console.log(`item => ${JSON.stringify(items)}`)

          items?.map(itm => {
              rowsData.push(createData(itm._id,rowNum++,<Typography onClick={()=>{
                setInput({
                    ...input,
                    item: itm,
                    itemCode: itm.itemCode,
                    itemDescription: itm.itemDescription,
                })
                handleCloseItemModal();
                setSnackbar({ children: `Successfully Item updated`, severity: 'success' });
              }} sx={{textDecoration: 'underline', cursor: 'pointer',color:'#E74C3C',fontSize:20}}>{itm.itemCode}</Typography>,itm.itemDescription));
              return null;
          });
          setRows([...rowsData]);
        }else if(itemMessage === "not found" && !itemLoading){
          setSnackbar({ children: `No data match with the search`, severity: 'error' });
        }

    },[itemMessage,items]);

    // DIALOG ITEM END

    
   
    return (
            <Paper elevation={6} sx={{padding:2}}>
                    <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={supplierLoading}>
                        <CircularProgress color="inherit" />
                    </Backdrop>
                    <Grid container spacing={2} direction="row" justifyContent="center">
                        <Grid xs={6} md={6} lg={6}>
                            <Box component="form" noValidate autoComplete="off"  sx={{
                            '& .MuiTextField-root': { m: 1, width: '40ch' },
                        }}>
                                <DatePicker label="Inspection Start" size='small' maxDate={moment().add(3,'y')} minDate={moment('2000','YYYY')} onChange={(e)=>handleOnChangeInput("date",e)} value={input.date}/>
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
    
                                <Box sx={{
                                        '& .MuiTextField-root': { m: 1, width: '35ch' },
                                    }}>
                                  <Grid container spacing={1} direction="row" justifyContent="space-between">
                                       
                                       <Grid xs={8} md={8} lg={8}>
                                            <TextField size='small' disabled value={input.itemCode}  label="Item Code" variant="outlined" />
                                        </Grid>
                                        <Grid xs={2} md={2} lg={2}>
                                            <IconButton onClick={handleOpenItemModal} aria-label="delete" variant="contained" size='small' color='error' sx={{border:1,mt:0.5}}>
                                                <Search sx={{fontSize:20}}/>
                                            </IconButton>
                                        </Grid>
                                       
                                    </Grid>
                                    </Box>
                                  <TextField size='small' value={input.itemDescription} disabled  multiline rows={2} fullWidth label="Item Description" variant="outlined" />

                                  
                                  <TextField size='small'value={input.weight} type='number' onChange={(e)=>handleOnChangeInput("weight",e)} fullWidth label="Weight" variant="outlined" />
                            </Box>
                        </Grid>
                        <Grid xs={6} md={6} lg={6}>
                            <Box component="form" noValidate autoComplete="off"  sx={{
                            '& .MuiTextField-root': { m: 1, width: '40ch' },
                            m:2
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
                              
                             
                             <TextField size='small' type='number' value={input.deliveryQty} onChange={(e)=>handleOnChangeInput("deliveryQty",e)} fullWidth label="Delivery Qty" variant="outlined" />
                             <TextField size='small' type='number' value={input.totalMinWork} onChange={(e)=>handleOnChangeInput("totalMinWork",e)} fullWidth label="Total Time(min)" variant="outlined" />
                             <TextField size='small' value={input.remarks} onChange={(e)=>handleOnChangeInput("remarks",e)}  multiline rows={2} fullWidth label="Remarks" variant="outlined" />
                            </Box>
                           
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} direction="row" justifyContent="center">
                        <Grid xs={4} md={4} lg={4}>
                            <TextField size='small' type='number' value={input.totalGoodQty}  fullWidth label="Total Good" color="primary" focused variant="outlined" />
                        </Grid>
                        <Grid xs={4} md={4} lg={4}>
                            <TextField size='small' type='number' value={input.totalPullOutQty}  fullWidth label="Total Pull-out" color="error" focused variant="outlined" />
                        </Grid>
                        <Grid xs={4} md={4} lg={4}>
                            <Tooltip 
                                title={
                                    <Typography color="inherit">
                                    <span style={{color:'#fab1a0'}}>
                                        Last edit : {inspections?.editedBy || 'NA'} - {moment(inspections?.updatedAt).fromNow()}
                                    </span>
                                    </Typography>
                                }
                                placement="bottom">     
                                <Button size='medium' variant="contained" color={buttonQueryId === '' ? `primary` : `success`} startIcon={<Save/>} fullWidth onClick={onSaveChanges}  > {buttonQueryId === '' ? `Add Inspection` : `Update Changes`}</Button>
                            </Tooltip>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} direction="row" justifyContent="center" sx={{mt:1}}>
                    <Grid xs={12} md={12} lg={12}>
                    <div>
                        <Accordion >
                            <AccordionSummary
                            expandIcon={<ExpandMore />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                            sx={{
                                backgroundColor: "#0984e3",
                                color:"#fff"
                            }}
                            >
                            Major Defect (1st Pass)
                            </AccordionSummary>
                            <AccordionDetails>

                            <Grid container spacing={2} direction="row" justifyContent="center">
                                <Grid xs={12} md={12} lg={12}>
                                    <Box component="form" noValidate autoComplete="off"  sx={{
                                    '& .MuiTextField-root': { m: 1, width: '30ch' },
                                }}>
                                    <Grid container spacing={2} direction="row">
                                        <Grid xs={12} md={12} lg={12} >
                                            <TextField size='small' type='number' value={input?.firstPass?.defectQty} onChange={(e)=>handleOnChangeInput("firstPass.defectQty",e)} fullWidth label="Defect Qty" variant="outlined" />
                                            <Button size='small' variant="contained" sx={{mt:1.5}} color='primary' startIcon={<Save/>} onClick={()=>{setSharedStateRef.setPassType('firstPassDefect')}}>Breakdown</Button>
                                        </Grid>
                                    </Grid>
                                    
                                            <TextField size='small' type='number' value={input?.firstPass?.totalGoodQty} onChange={(e)=>handleOnChangeInput("firstPass.totalGoodQty",e)} fullWidth label="Total Good" variant="outlined" />
                                    
                                    <Grid container spacing={2} direction="row">
                                        <Grid xs={12} md={12} lg={12} >
                                            <TextField size='small' type='number' value={input?.firstPass?.totalPullOutQty} onChange={(e)=>handleOnChangeInput("firstPass.totalPullOutQty",e)} fullWidth label="Total Pull-out" variant="outlined" />
                                            <Button size='small' variant="contained" sx={{mt:1.5}} color='primary' startIcon={<Save/>} onClick={()=>{setSharedStateRef.setPassType('firstPassPullOut')}}>Breakdown</Button>
                                        </Grid>
                                    </Grid>
                                    </Box>
                                    </Grid>
                            </Grid>
                        


                            </AccordionDetails>
                        </Accordion>
                        <Accordion >
                            <AccordionSummary
                            expandIcon={<ExpandMore />}
                            aria-controls="panel2-content"
                            id="panel2-header"
                            sx={{
                                backgroundColor: "#d63031",
                                color:"#fff"
                            }}
                            >
                            Pull-out (2nd Pass)
                            </AccordionSummary>
                            <AccordionDetails>

                            <Grid container spacing={2} direction="row" justifyContent="center">
                                <Grid xs={12} md={12} lg={12}>
                                    <Box component="form" noValidate autoComplete="off"  sx={{
                                    '& .MuiTextField-root': { m: 1, width: '30ch' },
                                }}>
                                 
                                    
                                    <TextField size='small'value={input?.secondPass?.totalGoodQty} onChange={(e)=>handleOnChangeInput("secondPass.totalGoodQty",e)} fullWidth label="Total Good" variant="outlined" />
                                    
                                    <Grid container spacing={2} direction="row">
                                        <Grid xs={12} md={12} lg={12} >
                                            <TextField size='small'value={input?.secondPass?.totalPullOutQty} onChange={(e)=>handleOnChangeInput("secondPass.totalPullOutQty",e)} fullWidth label="Total Pull-out" variant="outlined" />
                                            <Button size='small' variant="contained" sx={{mt:1.5}} color='primary' startIcon={<Save/>}onClick={()=>{setSharedStateRef.setPassType('secondPassPullOut')}}>Breakdown</Button>
                                        </Grid>
                                    </Grid>
                                    </Box>
                                    </Grid>
                            </Grid>
                                

                            </AccordionDetails>
                        </Accordion>
                        
                        </div>
                        </Grid>
                            <>
                                {/* dialog box */}
                                <Dialog open={openItemModal} onClose={handleCloseItemModal}
                                    TransitionComponent={Transition}
                                    PaperProps={{
                                    style: {
                                        margin: 0,
                                        width: '100%',
                                        height: '90%',
                                        maxHeight: '90%',
                                        borderRadius: 0,
                                        },
                                    }}
                                    maxWidth="lg">
                                        <AppBar sx={{ position: 'relative' }}>
                                            <Toolbar sx={{backgroundColor:'#dfe6e9'}}>

                                                <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={itemLoading}>
                                                    <CircularProgress color="inherit" />
                                                </Backdrop>

                                                <Box display="flex" sx={{flex:1}} flexDirection="row" justifyContent='center' alignItems='center'>
                                               
                                                <TextField  label="ItemCode" sx={{backgroundColor:'#fff',width: 200,ml:5}} 
                                                    onChange={(e,v)=>handleOnChangeItemInput("itemCode",e,v)} value={itemInput.itemCode || ''} variant="outlined" size='small'
                                                    onKeyDown={(e) => { if (e.key === 'Enter') {onFindItems();}}} />
                                              
                                                <Button onClick={onFindItems} variant="contained" sx={{ml:5 }} color="primary">Search item</Button>
                                                </Box>
                                                    <IconButton
                                                        edge="start"
                                                        color="inherit"
                                                        onClick={()=>{
                                                            //clearInputs();
                                                            handleCloseItemModal(); }}
                                                        aria-label="close"
                                                        sx={{color:'#d63031'}}
                                                    >
                                                    <Close />
                                                    </IconButton>
                                                </Toolbar>
                                                
                                                </AppBar>
                                    <DialogContent>
                                        <Paper style={{ height: 500, width: '100%' }}>
                                            <TableVirtuoso
                                                sx={{mt:3}}
                                                data={rows}
                                                components={VirtuosoTableComponents}
                                                fixedHeaderContent={fixedHeaderContent}
                                                itemContent={rowContent}
                                            />
                                        </Paper>
                                    </DialogContent>
                                    
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
                    </Grid>

            </Paper>
          
    )
};

export default Form;