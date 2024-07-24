import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Box, Button, Checkbox,Snackbar,Alert, Typography, Pagination, PaginationItem, Stack, } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

import { useDispatch, useSelector } from 'react-redux'

import {useNavigate,useLocation} from 'react-router-dom';

import { getItems,setMessageNull,getItemsBySearch} from '../../../../actions/items';
import { getMoldsByItemId } from '../../../../actions/molds';

function useQuery(){
    return new URLSearchParams(useLocation().search);
  }

const ItemTable = ({setSharedStateRef,sharedStateRef }) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { isLoading, items, message, numberOfPages } = useSelector(state => state.items);

    const query = useQuery();
    const queryPage = query.get('page') || 1;
    const searchItemCode = query.get('itemcode');
    const searchItemDesc = query.get('itemdesc');
    const searchSupplier = query.get('supplier');
    const searchBuyer = query.get('buyer');
    const searchMaterial = query.get('material');
    const searchMoldMaterial = query.get('moldmaterial');

    
    const [snackbar, setSnackbar] = React.useState(null);
    const handleCloseSnackbar = () => setSnackbar(null);


    useEffect(() => {
        navigate(`/mold-details?page=1`);
        dispatch(getItems(1));
    }, [dispatch]);
    
    const columns = [
        { id: 'select', label: '', maxWidth: 10 },
        { id: 'itemcode', label: 'Item Code', minWidth: 30 },
        { id: 'itemdescription', label: 'Item Description', minWidth: 30 },
        { id: 'supplier', label: 'Supplier', minWidth: 30 },
        { id: 'buyer', label: 'Buyer', minWidth: 30 },
        { id: 'material', label: 'Material', minWidth: 30 },
        { id: 'moldMaterial', label: 'Mold Mat.', minWidth: 30 },
    ];

    function createData(select, itemcode, itemdescription, supplier, buyer, material,moldMaterial) {
        return { select, itemcode, itemdescription, supplier, buyer, material,moldMaterial };
    }

    const [rows, setRows] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const rowsData = [];

    const handleCheckboxChange = (item) => {
        const index = itemIndex(item);
        setSelectedIndex(index === selectedIndex ? -1 : index);
        setSharedStateRef.setItemSelected(item);
       
    };

   
    const handleColumnClick = (item) => {
        const index = itemIndex(item);
        setSelectedIndex(index === selectedIndex ? -1 : index);
        setSharedStateRef.setItemSelected(item);
      
        dispatch(getMoldsByItemId(item?._id));
    };

    const itemIndex = (item) => {
        return items.findIndex(i => i._id === item._id);
    };

    useEffect(() => {
        
        if (!isLoading) {
            setRows([]);
            
            items?.map(item => {
                rowsData.push(
                    createData(
                        <Checkbox
                            checked={selectedIndex === itemIndex(item)}
                            onChange={() => handleCheckboxChange(item)}
                            size='small'
                            style={{ padding: 0 }} />,
                        <Typography sx={{ color: "#d63031", cursor: "pointer" }} variant='body1'
                            onClick={() => { setSharedStateRef.current({ ...item,prevSupplier:item.supplier }); setSharedStateRef.button(true) }}>{item.itemCode}</Typography>
                        , item.itemDescription, item.supplier.name, item.buyer.name, item.material.name,item.moldMaterial.name));
                return null;
            });
            setRows([...rowsData]);
           
        }
    }, [isLoading, items, selectedIndex]);

    useEffect(() =>{
        setSelectedIndex(-1);
    },[sharedStateRef.isAddItemCalled])


    useEffect(() =>{
        if(!isLoading && message === 'duplicate'){
            setSnackbar({ children: `ItemCode with Supplier Inputed already exist`, severity: 'error' });
            dispatch(setMessageNull());
        }
        else if (!isLoading && message === 'good'){
            setSnackbar({ children: `Succesfully Added Item`, severity: 'success' });
            dispatch(setMessageNull());
        }
        // edit
        else if(!isLoading && message === 'edit duplicate'){
            setSnackbar({ children: `ItemCode with Supplier Inputed already exist`, severity: 'error' });
            dispatch(setMessageNull());
        }
        else if (!isLoading && message === 'edit good'){
            setSnackbar({ children: `Succesfully Added Item`, severity: 'success' });
            dispatch(setMessageNull());
        }
        
    },[isLoading,message]);


    const handleChangePage = (newPage) =>{
        setSelectedIndex(-1);
       
        if((searchItemCode == null || searchItemCode == '') && 
            (searchItemDesc == null || searchItemDesc == '') && 
            (searchBuyer == null || searchBuyer == '') && 
            (searchSupplier == null ||  searchSupplier == '') &&
            (searchMaterial == null ||  searchMaterial == '') &&
            (searchMoldMaterial == null ||  searchMoldMaterial == '')){
        
          dispatch(getItems(newPage));      
          navigate(`/mold-details?page=${newPage}`);
        }else{
            dispatch(getItemsBySearch({
                itemcode: searchItemCode || '',
                itemdesc: searchItemDesc || '',
                buyer: searchBuyer || '',
                supplier: searchSupplier || '',
                material:searchMaterial || '',
                moldMaterial:searchMoldMaterial || '',
                page: newPage}));
            navigate(`/mold-details/search?itemcode=${searchItemCode || ''}&itemdesc=${searchItemDesc || ''}&supplier=${searchSupplier || ''}&buyer=${searchBuyer || ''}&material=${searchMaterial || ''}&moldMaterial=${searchMoldMaterial || ''}&page=${newPage}`);
        } 
      }

    return (

        <Paper elevation={20} sx={{ padding: 1 }}>
            <Typography variant="h5"> Item List </Typography><br />
            <Grid container spacing={2} justifyContent="center">
                <Grid xs={12} md={12} lg={12}>
                    <Paper elevation={10} sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer sx={{ maxHeight: 500 }}>
                            <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 650 }} size="small">
                                <TableHead>
                                    <TableRow>
                                        {columns.map((column) => (
                                            <TableCell
                                                key={column.id}
                                                align={column.align}
                                                style={{ minWidth: column.minWidth }}
                                                sx={{ borderLeft: '1px solid #fff', backgroundColor: '#222f3e', color: '#fff' }}
                                            >
                                                {column.label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.map((row, i) => {
                                        return (
                                            <TableRow hover role="checkbox" tabIndex={-1} key={i}>
                                                {columns.map((column, columnIndex) => {
                                                    const value = row[column.id];
                                                    return (
                                                        <TableCell 
                                                            key={column.id} 
                                                            align={column.align} 
                                                            sx={{ borderLeft: '1px solid grey' }}
                                                            onClick={() => columnIndex === 0 && handleColumnClick(items[i])}>
                                                            {column.format && typeof value === 'number'
                                                                ? column.format(value)
                                                                : value}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                    <Grid container spacing={2} alignItems="end" justifyContent="end">
                        <Grid xs={12} md={12} lg={12}>
                            <Box sx={{ mt: 3 }}> </Box>
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
                </Grid>
            </Grid>
        </Paper>

    )
};

export default ItemTable;
