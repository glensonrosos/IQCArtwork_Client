import React,{useEffect,useState} from 'react';


import { Box,Button,Backdrop,CircularProgress,Typography,AppBar,Toolbar,IconButton,Table,TableBody,TableCell,
  TableContainer,TableHead,TableRow,Snackbar,Alert,Paper,Autocomplete,TextField,FormControl,InputLabel,Select,MenuItem } from '@mui/material';


import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import Grid from '@mui/material/Unstable_Grid2';

import {Add,Close} from '@mui/icons-material';
import Slide from '@mui/material/Slide';

import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment';

import { TableVirtuoso } from 'react-virtuoso';


import {addDelivery,editDelivery,getDeliveriesByMoldId,deleteDeliveriesByMoldId} from '../../../../actions/deliveries';
import {editMoldWithId,findMold} from '../../../../actions/molds'

import { useDispatch,useSelector } from 'react-redux';
import molds from '../../../../reducers/molds';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


const HistoryMold = ({ openHistoryModal, handleCloseHistoryModal, moldSelected, itemSelected }) =>{

  const dispatch = useDispatch();

  const [user,setUser] = useState(JSON.parse(localStorage.getItem('profile')));
  const userDepartment = user?.result?.department?.department;

  const {suppliers} = useSelector(state=> state.suppliers);
  const { isLoading, message, deliveries} = useSelector(state => state.deliveries);
  const { isLoading:mIsLoading, moldSelected:mMoldSelected,itemSelected:mItemSelected,message:mMessage} = useSelector(state => state.molds);

  //const {buyers} = useSelector(state=> state.buyers);

  const [inputSupplier,setInputSupplier] = useState([]);
  //const [inputItemCode,setInputItemCode] = useState([]);

  // i stop here
  const [moldSelectedGet, setMoldSelectedValGet] = useState(null);
  const [itemSelectedGet, setItemSelectedGet] = useState(null);

  const [findMoldCalled,setFindMoldCalled] = useState(false);

  useEffect(() =>{
    setInputSupplier(suppliers);
    setMoldSelectedValGet({...moldSelected});
    setItemSelectedGet({...itemSelected});
  },[suppliers,moldSelected,itemSelected]);

  useEffect(()=>{
    if(!mIsLoading && mMessage == 'found' && mItemSelected != null && mMoldSelected != null) {
      setMoldSelectedValGet({...mMoldSelected});
      setItemSelectedGet({...mItemSelected});

      if(findMoldCalled){
        dispatch(getDeliveriesByMoldId(mMoldSelected?._id));
        setFindMoldCalled(false);
        //alert('getDeliveriesByMoldId');
      }

      setSnackbar({ children: `Mold found`, severity: 'success' });
    }else if(!mIsLoading && mMessage == 'not found'){
      setSnackbar({ children: `No Mold Found, Please double check your ItemCode and Mold # if correct`, severity: 'error' });
    }
  },[mMoldSelected,mItemSelected,mIsLoading,mMessage,findMoldCalled]);

  useEffect(()=>{
    if(itemSelectedGet != null && moldSelectedGet != null && !findMoldCalled){
        setMoldInput({
          ...moldInput,
          itemCode: itemSelectedGet?.itemCode,
          moldNumber: moldSelectedGet?.moldNumber,
          supplier: itemSelectedGet?.supplier
        });
    }
  },[moldSelectedGet,itemSelectedGet,findMoldCalled]);


  function createData(id,rowid, delivery, accept, reject, qty, purchpo,createdby,remarks) {
    return { id,rowid, delivery, accept, reject, qty, purchpo,createdby,remarks };
  }

  const [rows,setRows] = useState([]);
  const [modalData,setModalData] = useState({
    totalRows:0,
    remainingLife:0,
    totalRej: 0,
    totalQty:0,
    totalAcc:0,
  });


  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColumn, setSelectedColumn] = React.useState('purchpo');

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleChange =(e) => {
    setSelectedColumn(e.target.value);
    setSearchQuery('')
  };

  useEffect(()=>{
    if(!isLoading && message == 'exceed'){
      setSnackbar({ children: `Exceeded mold life, please review the items, `, severity: 'error' });
    }else if (!isLoading && message === 'good'){
      setSnackbar({ children: `Succesfully Added`, severity: 'success' });
      dispatch(getDeliveriesByMoldId(moldSelectedGet._id)); 
    }
    else if (!isLoading && message === 'edited'){
      setSnackbar({ children: `Succesfully Edited`, severity: 'success' });
      dispatch(getDeliveriesByMoldId(moldSelectedGet._id)); 
    }

  },[isLoading,message]);

  useEffect(() => {
    if (!isLoading) {

      let totalQty = 0;
      let totalRej = 0;
      let totalAcc = 0;

      const filteredRows = deliveries.map((del, index) => {
        totalQty += del.qty;
        totalRej += del.reject;
        totalAcc += del.accept;

        return createData(
          del._id,
          <Typography sx={{ color: "#d63031", cursor: "pointer", textDecoration:'underline' }} variant='body1'
            onClick={()=>{

            setInput({
                _id:del._id,
                poNumber:del.poNumber,
                delivery:del.delivery,
                accept:del.accept,
                reject:del.reject,
                qty:del.qty,
                remarks:del.remarks 
            });

            setEditInput({
              _id:del._id,
              poNumber:del.poNumber,
              delivery:del.delivery,
              accept:del.accept,
              reject:del.reject,
              qty:del.qty,
              remarks:del.remarks
            })

            setIsEdit(true);

            }}
          >{index+1}</Typography>,
          moment(del.delivery).format('L'),
          del.accept,
          del.reject,
          del.qty,
          del.poNumber,
          del.lastEditdBy,
          del.remarks
        );
        
      }).filter(row => {
        const searchText = searchQuery.toLowerCase();
        if (searchText === '') return true; // Return true for all rows if search query is empty
        switch (selectedColumn) {
          case 'delivery':
            return handleDateSearch(row['delivery'], searchText);
          case 'accept':
          case 'reject':
          case 'qty':
            return handleNumericSearch(row[selectedColumn], searchText);
          case 'purchpo':
          case 'createdby':
          case 'remarks':
            return row[selectedColumn]?.toLowerCase()?.includes(searchText);
          default:
            return true;
        }
      });

      setModalData({
        totalRows: deliveries?.length,
        remainingLife: (parseInt(moldSelectedGet?.life) + parseInt(moldSelectedGet?.additionalLife)) - parseInt(totalQty),
        totalQty,
        totalAcc,
        totalRej,
      })

      setRows(filteredRows);


    }
  }, [isLoading, deliveries, searchQuery, selectedColumn, moldSelectedGet]);
  
  // Function to handle numeric search for 'Acc', 'Rej', and 'Qty' columns
  const handleNumericSearch = (value, searchText) => {
    if (searchText.startsWith('>')) {
      const num = parseFloat(searchText.substring(1));
      return parseFloat(value) > num;
    } else if (searchText.startsWith('<')) {
      const num = parseFloat(searchText.substring(1));
      return parseFloat(value) < num;
    } else {
      return parseInt(value) === parseInt(searchText);
    }
  };
  
  // Function to handle date search for 'IQC Delivery' column
  const handleDateSearch = (value, searchText) => {
    if (searchText.includes('-')) {
      const [start, end] = searchText.split('-').map(date => moment(date.trim(), 'MM/DD/YYYY'));
      const date = moment(value, 'MM/DD/YYYY');
      return date.isBetween(start, end, null, '[]');
    } else {
      const date = moment(value, 'MM/DD/YYYY');
      return date.isSame(moment(searchText, 'MM/DD/YYYY'));
    }
  };




  useEffect(() =>{
    //if remaining life reaches 10% of total life , update conditions accordingly
    const nearValidation = (parseInt(moldSelectedGet?.life) + parseInt(moldSelectedGet?.additionalLife)) * 0.10 ;

    if(parseInt(nearValidation) >= parseInt(modalData.remainingLife) && moldSelectedGet?.condition?.name == "good"){

      dispatch(editMoldWithId(moldSelectedGet?._id,{...moldSelectedGet,
        condition:{ label: 'Near Validation', name: 'near_validation',color: 'warning'},
        lastEditdBy:`${user?.result?.firstname} ${user?.result?.lastname}`}));
    }else if(parseInt(nearValidation) < parseInt(modalData.remainingLife) && moldSelectedGet?.condition?.name == "near_validation"){
      dispatch(editMoldWithId(moldSelectedGet?._id,{...moldSelectedGet,
        condition:{ label: 'Good', name: 'good',color: 'success'},
        lastEditdBy:`${user?.result?.firstname} ${user?.result?.lastname}`}));
    }
  },[modalData.remainingLife]);



  const [input,setInput] = useState({
      _id:null,
      poNumber:null,
      delivery:null,
      accept:null,
      reject:null,
      qty:null,
      remarks:null 
  });

  const [moldInput,setMoldInput] = useState({
    supplier:null,
    itemCode:null,
    moldNumber:null
  });

  const [editInput,setEditInput] = useState({
    _id:null,
    poNumber:null,
    delivery:null,
    accept:null,
    reject:null,
    qty:null,
    remarks:null 
});

  const [isEdit,setIsEdit] = useState(false);
  

  const clearInputs = () =>{
    setInput({
      poNumber:null,
      delivery:null,
      accept:null,
      reject:null,
      qty:null,
      remarks:null
    });

    setIsEdit(false);
  }

  const handleOnChangeInput = (name,e,val=null) =>{
    if(name === "delivery"){
        setInput({
        ...input,
        [name]: e
        });
    }
    else if(name === 'qty'){
      return;
    }
    else if(name === 'accept' || name === 'reject'){
        setInput({
          ...input,
          [name]: e.target.value,
          qty: parseInt(e.target.value) + parseInt( name === 'accept' ? input.reject : input.accept)    
      });
    }  
    else
        setInput({
            ...input,
            [name]: e.target.value 
        });
    }

 

  const [snackbar, setSnackbar] = useState(null);
  const handleCloseSnackbar = () => setSnackbar(null);

  const columns = [
    {
      width: 15,
      label: '#',
      dataKey: 'rowid',
    },
    {
      width: 70,
      label: 'IQC Delivery',
      dataKey: 'delivery',
      
    },
    {
      width: 20,
      label: 'Acc',
      dataKey: 'accept',
      numeric: true,
    },
    {
      width: 20,
      label: 'Rej',
      dataKey: 'reject',
      numeric: true,
    },
    {
      width: 20,
      label: 'Qty',
      dataKey: 'qty',
      numeric: true,
    },
    {
      width: 100,
      label: 'Purching PO',
      dataKey: 'purchpo',
    },
    {
      width: 100,
      label: 'Last Edited By',
      dataKey: 'createdby',
    },
    {
      width: 200,
      label: 'Remarks',
      dataKey: 'remarks',
    },
    
  ];
  
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

  const handleOnChangeMoldInput = (name,e,val=null) =>{
      if(name === "supplier"){
          setMoldInput({
              ...moldInput,
              [name]: val 
          });
      }
      else
          setMoldInput({
              ...moldInput,
              [name]: e.target.value 
          });
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
            {column.dataKey === 'reject' ? <span style={{color:'red'}}>{row[column.dataKey]}</span> : row[column.dataKey]}
          </TableCell>
        ))}
      </React.Fragment>
    );
  }

  const EditDelivery = async () =>{

        let flag = true;

        if(userDepartment !== "Production" && userDepartment !== "Administrator"){
          setSnackbar({ children: `You are not allowed to make this action`, severity: 'warning'});
          flag = false;
        }

        if(moldSelectedGet?.condition?.name === 'bad') {
          setSnackbar({ children: `cannot edit delivery, mold condition is BAD `, severity: 'error' });
          flag = false;
        }

        const poNumberStr = /^[a-zA-Z0-9-]{3,40}$/;
        if(!poNumberStr.test(input.poNumber) || input.poNumber == null) {
            setSnackbar({ children: `PO Number inputed is invalid, `, severity: 'error' });
            flag = false;
        }

        const compValidationDate = moment(input.delivery).isBetween(moment('2000','YYYY'), moment().add(3,'y'));
        if(!compValidationDate){
            setSnackbar({ children: `Delivery Date Inputed is Invalid`, severity: 'error' });
            flag = false;
        }

        const newAccept = parseInt(input.accept) < 0 || parseInt(input.accept) > 999999 || input.accept == null
        if(newAccept){
            setSnackbar({ children: `Accept inputed is invalid, `, severity: 'error' });
            flag = false;
        }
        const newReject = parseInt(input.reject) < 0 || parseInt(input.reject) > 999999 || input.reject == null
        if(newReject){
          setSnackbar({ children: `Reject inputed is invalid, `, severity: 'error' });
          flag = false;
        }

        if(parseInt(input.qty) < 0 || parseInt(input.qty) > 999999 || input.qty == null){
          setSnackbar({ children: `Qty inputed is invalid, `, severity: 'error' });
          flag = false;
        }

        // MUST HAVE A TRAPPING CANNOT ADD DUE TO EXCEED MOLD USED.
        const newRemainingLife = parseInt(modalData.remainingLife) + parseInt(editInput.qty);
        const newRemaining = parseInt(newRemainingLife) - parseInt(input.qty);

        if(newRemaining < 0){
          setSnackbar({ children: `Exceeds ramaining Life, Please Validate Mold Delivery `, severity: 'error' });
          flag = false;
        }   

        if(flag && isEdit){

            await dispatch(editDelivery(input._id,{
              poNumber: input.poNumber.toUpperCase(),
              delivery: input.delivery,
              accept:input.accept,
              reject:input.reject,
              qty:input.qty,
              remarks:input.remarks,
              lastEditdBy:`${user?.result?.firstname} ${user?.result?.lastname}`,
              //updatedAt
            }))

            clearInputs();
        }

  }

  const AddDelivery = async () =>{

        let flag = true;

        if(userDepartment !== "Production" && userDepartment !== "Administrator"){
          setSnackbar({ children: `You are not allowed to make this action`, severity: 'warning'});
          flag = false;
        }

        if(moldSelectedGet?.condition?.name === 'bad') {
          setSnackbar({ children: `cannot add delivery, mold condition is BAD `, severity: 'error' });
          flag = false;
        }

        const poNumberStr = /^[a-zA-Z0-9-]{3,40}$/;
        if(!poNumberStr.test(input.poNumber) || input.poNumber == null) {
            setSnackbar({ children: `PO Number inputed is invalid, `, severity: 'error' });
            flag = false;
        }

        const compValidationDate = moment(input.delivery).isBetween(moment('2000','YYYY'), moment().add(3,'y'));
        if(!compValidationDate){
            setSnackbar({ children: `Delivery Date Inputed is Invalid`, severity: 'error' });
            flag = false;
        }

        if(parseInt(input.accept) < 0 || parseInt(input.accept) > 999999 || input.accept == null){
            setSnackbar({ children: `Accept inputed is invalid, `, severity: 'error' });
            flag = false;
        }

        if(parseInt(input.reject) < 0 || parseInt(input.reject) > 999999 || input.reject == null){
          setSnackbar({ children: `Reject inputed is invalid, `, severity: 'error' });
          flag = false;
        }

        if(parseInt(input.qty) < 0 || parseInt(input.qty) > 999999 || input.qty == null){
          setSnackbar({ children: `Qty inputed is invalid, `, severity: 'error' });
          flag = false;
        }

        // MUST HAVE A TRAPPING CANNOT ADD DUE TO EXCEED MOLD USED.

        const newRemaining = parseInt(modalData.remainingLife) - parseInt(input.qty);

        if(newRemaining < 0){
          setSnackbar({ children: `Cannot Proceed Delivery, Exceeds ramaining Life`, severity: 'error' });
          flag = false;
        }   

        if(flag && !isEdit){
            await dispatch(addDelivery(moldSelectedGet._id,{...input,poNumber:input.poNumber.toUpperCase(),itemId:itemSelectedGet._id,
              moldId:moldSelectedGet._id,lastEditdBy:`${user?.result?.firstname} ${user?.result?.lastname}`}));

            clearInputs();
        }
    }

    const onFindMold = () => {
      let flag = true;

      const findSupplier = inputSupplier.find(buy => buy?._id === moldInput.supplier?._id);
      if(findSupplier === undefined || findSupplier === null){
          setSnackbar({ children: `Supplier inputed is invalid`, severity: 'error' });
          flag = false;
      }

      const itemNumberRegx = /^(?:[a-zA-Z0-9]+-?){3,15}$/;
      if(!itemNumberRegx.test(moldInput.itemCode)) {
          setSnackbar({ children: `Item Code inputed is invalid, `, severity: 'error' });
          flag = false;
      }

      const moldNumberRegx = /^(?:[a-zA-Z0-9]+-?){1,15}$/;
      if(!moldNumberRegx.test(moldInput.moldNumber)) {
          setSnackbar({ children: `Mold # inputed is invalid, `, severity: 'error' });
          flag = false;
      }

      if(flag){

        dispatch(findMold({
          supplierId: moldInput.supplier?._id,
          itemCode:moldInput.itemCode.toUpperCase(),
          moldNumber:moldInput.moldNumber.toUpperCase()
        }));

        setRows([]);

        setFindMoldCalled(true);
      }
    }
    
  
   
  return(
     <>
      {/* Dialog bulk edit */}
        <Dialog
            open={openHistoryModal}
            onClose={()=>{clearInputs();handleCloseHistoryModal(); }}
            fullWidth
            TransitionComponent={Transition}
            PaperProps={{
              style: {
                  margin: 0,
                  width: '100%',
                  height: '100%',
                  maxHeight: '100%',
                  borderRadius: 0,
                  },
            }}
            maxWidth="auto"
        >
          <AppBar sx={{ position: 'relative' }}>
          <Toolbar sx={{backgroundColor:'#dfe6e9'}}>
          <Box display="flex" sx={{flex:1}} flexDirection="row">
           
           <Autocomplete
                    size='small'
                    disablePortal
                    id="supplierId"
                    options={inputSupplier}
                    clearOnEscape 
                    onChange={(e,v)=>handleOnChangeMoldInput("supplier",e,v)}
                    getOptionLabel={(option) => option.name}
                    sx={{ width: 250, backgroundColor:'#fff', }}
                    value={moldInput?.supplier}
                    renderInput={(params) => <TextField {...params} label="Supplier" onKeyDown={(e) => { if (e.key === 'Enter') {onFindMold();}}} />}
                />
           <TextField  label="ItemCode" sx={{backgroundColor:'#fff',width: 250,ml:5}} 
              onChange={(e,v)=>handleOnChangeMoldInput("itemCode",e,v)} value={moldInput.itemCode || ''} variant="outlined" size='small' 
              onKeyDown={(e) => { if (e.key === 'Enter') {onFindMold();}}}/>

           <TextField  label="Mold #" sx={{backgroundColor:'#fff',width: 80,ml:5}}  
              onChange={(e,v)=>handleOnChangeMoldInput("moldNumber",e,v)} value={moldInput.moldNumber || ''} variant="outlined" size='small' 
              onKeyDown={(e) => { if (e.key === 'Enter') {onFindMold();}}}/>

          <Button onClick={onFindMold} variant="contained" sx={{ml:5 }} color="primary">Find Mold</Button>
          </Box>
            <IconButton
                edge="start"
                color="inherit"
                onClick={()=>{clearInputs();handleCloseHistoryModal(); }}
                aria-label="close"
                sx={{color:'#d63031'}}
              >
              <Close />
            </IconButton>
          </Toolbar>
        </AppBar>
    
        <DialogContent>
        <Grid container spacing={1} alignItems="center" justifyContent="center">
            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={mIsLoading || isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
            <Grid md={8} lg={8}>
            <Box>
                <Box display="flex" flexDirection="row" justifyContent="space-between" pl={1} pr={1} pb={1}>
                    <Grid flexGrow={1} alignItems="center" justifyContent="center">
                      <Grid item flexDirection="row" justifyContent="space-between" alignItems="center">
                        <Box display="flex" flexDirection="row" justifyContent="space-between">
                          <Typography  variant='h6' color="green">
                              Rows : {modalData.totalRows}
                          </Typography>
                          <Typography variant='h6' color="red">
                              Life Remaining :{modalData.remainingLife}
                          </Typography>
                          <Typography variant='h6' color="blue">
                              Life: {moldSelectedGet?.life}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item flexDirection="row" justifyContent="space-between" alignItems="center">
                        <Box display="flex" flexDirection="row" justifyContent="space-between" >
                        <Typography variant='p'>
                              Addiotional Life: <span style={{color:'red'}}>{moldSelectedGet?.additionalLife}</span>
                          </Typography>
                          <Typography  variant='p'>
                               Accepted : <span style={{color:'red'}}>{modalData.totalAcc}</span>
                          </Typography>
                          <Typography variant='p'>
                               Rejected : <span style={{color:'red'}}>{modalData.totalRej}</span>
                          </Typography>
                          <Typography variant='p'>
                               Qty : <span style={{color:'red'}}>{modalData.totalQty}</span>
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box alignSelf="center">
                    <FormControl >
                    <InputLabel id="demo-simple-select-label" >Search Column</InputLabel>
                        <Select
                            value={selectedColumn}
                            label="Search Column"
                            size='small'
                            sx={{minWidth:150}}
                            onChange={handleChange}
                        >
                            <MenuItem value='purchpo'>Purch PO#</MenuItem>
                            <MenuItem value='createdby'>Created By</MenuItem>
                            <MenuItem value='delivery'>IQC Delivery</MenuItem>
                            <MenuItem value='accept'>Accept</MenuItem>
                            <MenuItem value='reject'>Reject</MenuItem>
                            <MenuItem value='qty'>Qty</MenuItem>
                            <MenuItem value='remarks'>Remarks</MenuItem>
                            
                        </Select>
                    </FormControl>
                    <TextField sx={{ml:1}} size='small' onChange={handleSearchInputChange} value={searchQuery}  label="SEARCH" variant="outlined"  />
                    </Box>
                </Box>
                <div style={{ height: 500, width: '100%' }}>
                <Paper elevation={10} style={{ height: 450, width: '100%' }}>
                  <TableVirtuoso
                    data={rows}
                    components={VirtuosoTableComponents}
                    fixedHeaderContent={fixedHeaderContent}
                    itemContent={rowContent}
                  />
                </Paper>
                  {/* UNCOMMENT THIS TO IMPLEMENT DELETE DELIVERIES */}
                  {/* <br/> <br/> <br/> <br/>
                  <Button onClick={()=>{
                      const answer = window.confirm("Are sure you want to RESET / DELETE all Deliveries with this mold");
                      if (answer) {
                          //some code
                          dispatch(deleteDeliveriesByMoldId(moldSelectedGet._id));
                          setMoldSelectedValGet({...moldSelected,additionalLife:0});
                          dispatch(editMoldWithId(moldSelectedGet?._id,{...moldSelectedGet,
                            delivered:0,
                            additionalLife:0,
                            condition:{ label: 'Good', name: 'good',color: 'success'},
                            remarks:"",
                            lastEditdBy:`${user?.result?.firstname} ${user?.result?.lastname}`}));
                      }
                      else {
                          //some code
                      }
                  }} variant="contained" color="error">Delete All Deliveries</Button> */}
                </div>
            </Box>
            </Grid>
            <Grid  md={4} lg={4} sx={{mt:-7}}>
            <Typography sx={{fontSize:20}} variant="p" component="div">
            Mold #: <span style={{backgroundColor:'#d63031',color:'#fff',borderRadius:5,paddingLeft:5,paddingRight:5}}>{moldSelectedGet?.moldNumber || 'NA'}</span> |
              Supplier: <span style={{backgroundColor:'#0984e3',color:'#fff',borderRadius:5,paddingLeft:2,paddingRight:2}}>{itemSelectedGet?.supplier?.name || 'NA'}</span> <br/> 
              ItemCode: <span style={{backgroundColor:'#0984e3',color:'#fff',borderRadius:5,paddingLeft:2,paddingRight:2}}>{itemSelectedGet?.itemCode || 'NA'}</span> |
              Buyer: <span style={{backgroundColor:'#00b894',color:'#fff',borderRadius:5,paddingLeft:2,paddingRight:2}}>{itemSelectedGet?.buyer?.name || 'NA'}</span>
            </Typography>
            <Box component="form" noValidate autoComplete="off"
                    sx={{
                        '& .MuiTextField-root': { m: 1, width: '50ch' },
                    }}>
                <TextField  label="Purchasing PO Number" onChange={(e)=>handleOnChangeInput("poNumber",e)} value={input.poNumber || ''} variant="outlined" size='small' fullWidth/>
                <DatePicker label="IQC Delivery" maxDate={moment().add(3,'y')} size='small' minDate={moment('2000','YYYY')}  onChange={(e)=>handleOnChangeInput("delivery",e)} value={moment(input.delivery)} />
                <TextField  label="Accept" type='number' onChange={(e)=>handleOnChangeInput("accept",e)} value={input.accept || ''} size='small' variant="outlined" fullWidth/>
                <TextField  label="Reject" type='number' onChange={(e)=>handleOnChangeInput("reject",e)} value={input.reject || ''} size='small' variant="outlined" fullWidth/>
                <TextField  label="Qty" type='number'  value={input.qty || ''} size='small' variant="outlined" fullWidth/>
                <TextField
                    id="outlined-multiline-static"
                    label="Remarks"
                    multiline
                    size='small'
                    onChange={(e)=>handleOnChangeInput("remarks",e)} 
                    value={input.remarks || ''}
                    rows={3}
                    />
                </Box>
                <Grid container spacing={2} direction="row" alignItems="center" justifyContent="center" sx={{mt:2}}>
                  <Grid xs={6} md={6} lg={6}> 
                    <Button onClick={clearInputs} variant="contained" color="warning">Clear Inputs</Button>
                  </Grid>
                  <Grid xs={6} md={6} lg={6}> 
                    <Button onClick={isEdit ? EditDelivery : AddDelivery} color={isEdit ? 'success' : 'primary'} variant="contained">{isEdit ? `Edit Delivery` : `Add Delivery`}</Button>
                  </Grid>
                </Grid>
            </Grid>
        </Grid>
        </DialogContent>
        <DialogActions>
          
        </DialogActions>
        </Dialog>
    {/* Dialog for bulk edit */}
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

export default HistoryMold;

 
 
 
 