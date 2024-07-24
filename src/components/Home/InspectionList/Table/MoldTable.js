import React,{useState,useEffect} from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Box,Button,FormControl,IconButton,InputLabel,Select,MenuItem,TextField,Link,Chip,Tooltip,Typography,Pagination,PaginationItem,Stack} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'
import {Save,LocalShipping, Edit,} from '@mui/icons-material';

import { getDeliveriesByMoldId } from '../../../../actions/deliveries';
import { getMoldsByItemId} from '../../../../actions/molds';
import { useDispatch,useSelector } from 'react-redux'
import moment from 'moment';

import { TableVirtuoso } from 'react-virtuoso';

// MODAL
import AddMold from '../Modal/AddMold';
import EditDeleteMold from '../Modal/EditDeleteMold';
import HistoryMold from '../Modal/HistoryMold';


const MoldTable = ({sharedStateRef,setSharedStateRef}) =>{

    const dispatch = useDispatch();
    const { isLoading, molds } = useSelector(state => state.molds);

    const [rows, setRows] = useState([]);

    const [itemSelected,setItemSelected] = useState(null);
    const [moldSelected,setMoldSelected] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedColumn, setSelectedColumn] = React.useState('mold');

    const handleSearchInputChange = (event) => {
      setSearchQuery(event.target.value);
    };

    const handleChange =(e) => {
      setSelectedColumn(e.target.value);
      setSearchQuery('')
    };


    function createData(select,moldnumber, validationdate, moldlife,condition,remarks) {
        return { select,moldnumber, validationdate, moldlife,condition,remarks };
    }

    useEffect(() => {
      if (!isLoading && molds) {
          const filteredRows = molds.map(item => {
              return createData(
                <Grid container direction="column" justifyContent="flex-start" alignItems="flex-start">
                    <Grid xs={6} md={6} lg={6} >
                        <IconButton onClick={async () => {
                            await setMoldSelected(item);

                            handleOpenEditDeleteModal(); 
                          }} aria-label="delete" size='small' color='primary' sx={{border:1,mt:0.5}}>
                            <Edit sx={{fontSize:20}}/>
                        </IconButton>
                    </Grid>
                    <Grid xs={6} md={6} lg={6}>
                        <IconButton onClick={async () =>{
                            await setMoldSelected(item);
                            dispatch(getDeliveriesByMoldId(item._id)); 
                            handleOpenHistoryModal(); 
                          }} aria-label="delete" size='small' color='success' sx={{border:1,mt:0.5}}>
                            <LocalShipping sx={{fontSize:20}} />
                        </IconButton>
                    </Grid>               
                </Grid>
                ,item?.moldNumber,moment(item?.validationDate).format('L'),
                `${(parseInt(item?.life || 0) + parseInt(item?.additionalLife || 0)) - parseInt(item?.delivered || 0)}`,
                <Chip label={item?.condition?.label} 
                    color={item?.condition?.color} 
                size='medium' variant="contained" />
                ,item?.remarks
            );
          }).filter(row => {
            const searchText = searchQuery.toLowerCase();
            switch (selectedColumn) {
                case 'mold':
                    return row.moldnumber.toLowerCase().includes(searchText);
                case 'validationDate':
                    // Check if the search query is empty
                    if (searchText.trim() === '') {
                        return true; // Return all rows
                    }
                    // Check if the search query contains a hyphen indicating a date range
                    if (searchText.includes('-')) {
                        const [startDate, endDate] = searchText.split('-').map(date => date.trim());
                        const validationDate = moment(row.validationdate, 'MM/DD/YYYY');
                        return validationDate.isBetween(moment(startDate, 'MM/DD/YYYY'), moment(endDate, 'MM/DD/YYYY'), null, '[]');
                    } else {
                        // Otherwise, check for an exact match
                        return row.validationdate.toLowerCase() === searchText;
                    }
                case 'life':
                    // Check if the search query is empty
                    if (searchText.trim() === '') {
                        return true; // Return all rows
                    }
                    // Check if the search query starts with '>' or '<'
                    if (searchText.startsWith('>')) {
                        const value = parseInt(searchText.substring(1));
                        return parseInt(row.moldlife) > value;
                    } else if (searchText.startsWith('<')) {
                        const value = parseInt(searchText.substring(1));
                        return parseInt(row.moldlife) < value;
                    } else {
                        // Otherwise, check for an exact match
                        return parseInt(row.moldlife) === parseInt(searchText);
                    }
                case 'condition':
                    return row.condition.props.label.toLowerCase().includes(searchText);
                case 'remarks':
                    return row?.remarks?.toLowerCase()?.includes(searchText);
                default:
                    return true;
            }
        });
          setRows(filteredRows);
      }
  }, [isLoading, molds, searchQuery, selectedColumn]);
  

    //REFS
    sharedStateRef.itemSelected = itemSelected;
    setSharedStateRef.setItemSelected = setItemSelected;

    const [openAddModal, setOpenAddModal] = useState(false);
    const handleOpenAddModal = () => {
        if(itemSelected)
            setOpenAddModal(true);
    };
    const handleCloseAddModal = () => {
        setOpenAddModal(false);
    };

    const [openEditDeleteModal, setOpenEditDeleteModal] = useState(false);
    const handleOpenEditDeleteModal = () => {
        setOpenEditDeleteModal(true);
    };
    const handleCloseEditDeleteModal = () => {
        setOpenEditDeleteModal(false);
    };

    const [openHistoryModal, setOpenHistoryModal] = useState(false);
    const handleOpenHistoryModal = () => {
        setOpenHistoryModal(true);
    };
    const handleCloseHistoryModal = () => {
        // reload modal table
        dispatch(getMoldsByItemId(itemSelected?._id));
        setOpenHistoryModal(false);
    };

    const columns = [
        { dataKey: 'select', label: '',width:5},
        { dataKey: 'moldnumber', label: 'Mold #',width: 5},
        { dataKey: 'validationdate', label: 'Validation Date',width:25},
        { dataKey: 'moldlife', label: 'Remaing Life', width: 10},
        { dataKey: 'condition', label: 'Condition', width: 45},
        { dataKey: 'remarks', label: 'Remarks', width: 90 },
      ];

    // VERTOSO TABLE START
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
                style={{ width: column.width,paddingTop:1,paddingBottom:1 }}
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
                sx={{borderLeft: '1px solid grey',paddingTop:0.5,paddingBottom:0.5}}
              >
                {row[column.dataKey]}
              </TableCell>
            ))}
          </React.Fragment>
        );
      }

    // VERTOSO TABLE END
    
    return (
        <Paper elevation={20} sx={{padding:1}}> 
           {/*  Dialogs */}
           <AddMold openAddModal={openAddModal} itemSelected={itemSelected} handleCloseAddModal={handleCloseAddModal}/>
           <EditDeleteMold openEditDeleteModal={openEditDeleteModal} moldSelected={moldSelected} itemSelected={itemSelected} handleCloseEditDeleteModal={handleCloseEditDeleteModal}/>
           <HistoryMold openHistoryModal={openHistoryModal} handleCloseHistoryModal={handleCloseHistoryModal} moldSelected={moldSelected} itemSelected={itemSelected}/>
         <Typography variant="h5"> Mold Details </Typography>
            <Grid container spacing={2} direction="row" justifyContent="center">
                <Grid xs={4} md={4} lg={4} mt={2} spacing={15}>
                    <Typography variant="p">ItemCode: <span style={{fontWeight:'bold',color:'#c0392b',textDecoration:"underline"}}>{itemSelected?.itemCode || ''}</span> </Typography><br/><br/>
                    <Typography variant="p">Desc: <span style={{fontWeight:'bold',color:'#c0392b',textDecoration:"underline"}}>{itemSelected?.itemDescription || ''}</span></Typography><br/> <br/>
                    <Button variant="contained" color="primary" size="small"  startIcon={<Save/>} onClick={handleOpenAddModal}  > Add Mold </Button>
                </Grid>
                <Grid xs={4} md={4} lg={4} mt={2}>
                    <Typography variant="p">Buyer: <span style={{fontWeight:'bold',color:'#c0392b',textDecoration:"underline"}}>{itemSelected?.buyer?.name || ''}</span> </Typography><br/><br/>
                    <Typography variant="p">Supplier: <span style={{fontWeight:'bold',color:'#c0392b',textDecoration:"underline"}}>{itemSelected?.supplier?.name || ''} </span></Typography><br/><br/>
                    <Typography variant="p">Mold Mat: <span style={{fontWeight:'bold',color:'#c0392b',textDecoration:"underline"}}>{itemSelected?.moldMaterial?.name || ''} </span></Typography>
                </Grid>
                <Grid xs={4} md={4} lg={4} mt={2}>
                    <Typography variant="p">Material: <span style={{fontWeight:'bold',color:'#c0392b',textDecoration:"underline"}}>{itemSelected?.material?.name || ''}</span></Typography><br/><br/>
                    <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label" >Column</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={selectedColumn}
                            label="Column"
                            size='small'
                            onChange={handleChange}
                        >
                            <MenuItem value='mold'>Mold #</MenuItem>
                            <MenuItem value='validationDate'>Validation Date</MenuItem>
                            <MenuItem value='life'>Life</MenuItem>
                            <MenuItem value='condition'>Condition</MenuItem>
                            <MenuItem value='remarks'>Remarks</MenuItem>
                        </Select>
                    </FormControl><br/><br/>
                    <TextField size='small' onChange={handleSearchInputChange} value={searchQuery} fullWidth label="SEARCH" variant="outlined" />
                </Grid>
            </Grid>
        <Grid container spacing={2} justifyContent="center">  
            <Grid xs={12} md={12} lg={12}>
            <Paper elevation={10} style={{ height: molds.length > 0 ? 500 : 200, width: 'auto'}}>
                <TableVirtuoso
                    data={rows}
                    components={VirtuosoTableComponents}
                    fixedHeaderContent={fixedHeaderContent}
                    itemContent={rowContent}
                  />
                </Paper>
            </Grid>
        </Grid>
        </Paper>
    )
};

export default MoldTable;