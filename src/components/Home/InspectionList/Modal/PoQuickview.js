import React,{useState,useEffect} from 'react';


import { Box,Button,Snackbar,Alert,Autocomplete,TextField,AppBar,Toolbar,IconButton,TableContainer,
    Paper,Table,TableHead,TableRow,TableBody,TableCell,Backdrop,CircularProgress,
    Typography,} from '@mui/material';


import { TableVirtuoso } from 'react-virtuoso';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';

import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment';

import {Close} from '@mui/icons-material';

import {findPO} from '../../../../actions/deliveries'
import { useDispatch,useSelector } from 'react-redux';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });


const PoQuickview = ({ openPoQuickviewModal, handleClosePoQuickviewModal }) =>{

    const {suppliers,isLoading:isLoadingSupplier} = useSelector(state=> state.suppliers);
    const {isLoading:isLoadingDeliveries,message,poList} = useSelector(state=> state.deliveries);

    const dispatch = useDispatch();

    const [inputSupplier,setInputSupplier] = useState([]);

    useEffect(() =>{
        if(!isLoadingSupplier)
            setInputSupplier(suppliers);
      },[suppliers,isLoadingSupplier]);

    const [input,setInput] = useState({
        poNumber:null,
        itemCode:null,
        supplier:null,
    });

    const [snackbar, setSnackbar] = useState(null);
    const handleCloseSnackbar = () => setSnackbar(null);

    const handleOnChangeInput = (name,e,val=null) =>{
       if(name === "supplier"){
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

    function createData(id,rowid,ponumber,delivery,qty,supplier,itemcode,buyer,moldnumber,createdby) {
        return { id,rowid,ponumber,delivery,qty,supplier,itemcode,buyer,moldnumber,createdby };
    }

    const onFindPO = () =>{
      let flag = true;

      const itemCodeStr = /^[a-zA-Z0-9-]{0,30}$/;
      if(!itemCodeStr.test(input.itemCode)) {
          setSnackbar({ children: `ItemCode inputed is invalid, `, severity: 'error' });
          flag = false;
      }

      const poNumberStr = /^[a-zA-Z0-9-]{3,30}$/;
      if(!poNumberStr.test(input.poNumber) || input.poNumber == null) {
          setSnackbar({ children: `PO Number inputed is invalid, `, severity: 'error' });
          flag = false;
      }

      if(flag){

          dispatch(findPO({
            itemCode: input?.itemCode?.toUpperCase() || null,
            poNumber: input?.poNumber?.toUpperCase() || null,
            supplierId: input?.supplier?._id
          }));

          setRows([]);

      }
    };
    const rowsData = [];
    const [totalQty,setTotalQty] = useState(0);

    useEffect(()=>{

        if(message === "po found" && !isLoadingDeliveries && poList.length > 0){

          setRows([]);
          let rowNum = 1;
          setTotalQty(0);

          poList?.map(item => {
              rowsData.push(
                createData(item._id,rowNum++,item.poNumber,moment(item.delivery).format('L'),item.qty,item.supplierName,item.itemCode,item.buyerName,item.moldNumber,item.lastEditdBy));
                setTotalQty(prev => prev + item.qty);
              return null;
          });
          setRows([...rowsData]);
        }else if(message === "not found" && !isLoadingDeliveries){
          setTotalQty(0);
          setSnackbar({ children: `No data match with the search`, severity: 'error' });
        }

    },[message,isLoadingDeliveries,poList]);

    const columns = [
        {
          width: 15,
          label: '#',
          dataKey: 'rowid',
          numeric: true,
        },
        {
          width: 90,
          label: 'PO Number',
          dataKey: 'ponumber',
        },
        {
          width: 70,
          label: 'IQC Delivery',
          dataKey: 'delivery',
        },
        {
          width: 20,
          label: 'Qty',
          dataKey: 'qty',
          numeric: true,
        },
        {
          width: 90,
          label: 'Supplier',
          dataKey: 'supplier',
        },
        {
          width: 70,
          label: 'Item Code',
          dataKey: 'itemcode',
        },
        {
            width: 70,
            label: 'Buyer',
            dataKey: 'buyer',
        },
        {
            width: 20,
            label: 'Mold #',
            dataKey: 'moldnumber',
          },
        {
          width: 100,
          label: 'Last Edited By',
          dataKey: 'createdby',
        },
      ];
    
      const [rows,setRows] = useState([]);

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
                {column.dataKey === 'qty' ? <span style={{color:'red'}}>{row[column.dataKey]}</span> : row[column.dataKey]}
              </TableCell>
            ))}
          </React.Fragment>
        );
      }
    


  return(
     <>
        {/* dialog box */}
      <Dialog open={openPoQuickviewModal} onClose={handleClosePoQuickviewModal}
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

                    <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoadingDeliveries || isLoadingSupplier}>
                        <CircularProgress color="inherit" />
                    </Backdrop>

                    <Box display="flex" sx={{flex:1}} flexDirection="row">
                    <TextField  label="PO Number" sx={{backgroundColor:'#fff',width: 200}}  
                        onChange={(e,v)=>handleOnChangeInput("poNumber",e,v)} value={input.poNumber || ''} variant="outlined" size='small'
                        onKeyDown={(e) => { if (e.key === 'Enter') {onFindPO();}}} />
                    <Autocomplete
                        size='small'
                        disablePortal
                        id="supplierId"
                        options={inputSupplier}
                        clearOnEscape 
                        onChange={(e,v)=>handleOnChangeInput("supplier",e,v)}
                        getOptionLabel={(option) => option.name}
                        sx={{ width: 200, backgroundColor:'#fff',ml:5 }}
                        value={input?.supplier}
                    // isOptionEqualToValue={(option, value) => option.name === value.name}
                        renderInput={(params) => <TextField {...params} label="Supplier" onKeyDown={(e) => { if (e.key === 'Enter') {onFindPO();}}} />}
                    />
                   
                    <TextField  label="ItemCode" sx={{backgroundColor:'#fff',width: 200,ml:5}} 
                        onChange={(e,v)=>handleOnChangeInput("itemCode",e,v)} value={input.itemCode || ''} variant="outlined" size='small'
                        onKeyDown={(e) => { if (e.key === 'Enter') {onFindPO();}}} />
                    <Typography sx={{color:'red',alignSelf:"center",ml:5}}>
                      Total : {totalQty}
                    </Typography>
                    <Button onClick={onFindPO} variant="contained" sx={{ml:5 }} color="primary">Find PO</Button>
                    </Box>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={()=>{
                                //clearInputs();
                                handleClosePoQuickviewModal(); }}
                            aria-label="close"
                            sx={{color:'#d63031'}}
                        >
                        <Close />
                        </IconButton>
                    </Toolbar>
                    
                    </AppBar>
        <DialogContent>
            <Paper style={{ height: 500, width: '100%' }}>
                <Typography variant="p" color="error">
                 <br/>Note: PO Number is required |  Supplier and ItemCode are optional 
                 </Typography>
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
  )
};

export default PoQuickview;

