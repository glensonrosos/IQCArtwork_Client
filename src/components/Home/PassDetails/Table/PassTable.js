import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, IconButton, Autocomplete, TextField,CircularProgress,Backdrop, Tooltip,Typography,Snackbar,Alert } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Add, Delete, Save } from '@mui/icons-material';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAreas } from '../../../../actions/areas';
import { getDefects } from '../../../../actions/defects';
import {createDefectData,getDefectDatas} from '../../../../actions/defectDatas';

import { AUTH_LOGOUT } from '../../../../constant/actionTypes';
import decode from 'jwt-decode';

import moment from 'moment';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PassTable = ({setSharedStateRef,sharedStateRef}) => {


  const dispatch = useDispatch();
  const navigate = useNavigate();

  const query = useQuery();
  const queryId = query.get('id') || null;
  const [passType, setPassType] = useState('firstPassDefect');
  const [passText, setPassText] = useState({
    text: '1st Pass - Defect Qty',
    color: '#00d2d3',
  });

  sharedStateRef.passType = passType;
  setSharedStateRef.setPassType = setPassType;

  const [rows, setRows] = useState([]);
  const { areas, isLoading: areaLoading } = useSelector((state) => state.areas);
  const { defects, isLoading: defectLoading } = useSelector((state) => state.defects);
  const { defectDatas,defectDetailsLogs, isLoading: defectDataLoading } = useSelector((state) => state.defectDatas);

  const [inputArea, setInputArea] = useState([]);
  const [inputDefect, setInputDefect] = useState([]);

  useEffect(() => {
    dispatch(getAreas());
    dispatch(getDefects());
  }, [dispatch]);

  useEffect(() => {
    //['firstPassDefect', 'firstPassPullOut', 'secondPassPullOut']
    if(passType == 'firstPassDefect')
        setPassText({ text: '1st Pass - Defect Qty', color: '#0abde3'})
    else if(passType == 'firstPassPullOut')
        setPassText({ text: '1st Pass - Pull-Out Qty', color: '#ff9f43'})
    else if(passType == 'secondPassPullOut')
        setPassText({ text: '2nd Pass - Pull-Out Qty', color: '#ee5253'})
    if(queryId != null){
      console.log(`getDefectDatas called useffect`)
      dispatch(getDefectDatas({inspectionId:queryId,passType}));
    }
  }, [passType,queryId]);

  useEffect(()=>{
    if(!defectDataLoading){
      setRows(defectDatas);
    }
  },[defectDatas,defectDataLoading])

  useEffect(() => {
    if (areas?.length > 0 && defects?.length > 0 && !defectLoading && !areaLoading) {
      setInputArea(areas);
      setInputDefect(defects);
    }
  }, [areas, defects]);

  const [snackbar, setSnackbar] = useState(null);
  const handleCloseSnackbar = () => setSnackbar(null);

  const RenderDefect = (newRow) => {
    const [value, setValue] = useState(newRow?.defect || null);

    return (
      <Autocomplete
        disablePortal
        id="combo-box-defect"
        options={inputDefect}
        clearOnEscape
        onChange={(event, newValue) => {
          const updatedRows = rows.map((row) =>
            row.id === newRow.id ? { ...row, defect: newValue || null } : row
          );
          setRows(updatedRows);
          setValue(newValue);
        }}
        getOptionLabel={(option) => option.name || ''}
        value={value}
        size="small"
        fullWidth
        renderInput={(params) => (
          <TextField
            {...params}
            InputProps={{
              ...params.InputProps,
              sx: { fontSize: 12 },
            }}
            InputLabelProps={{
              sx: { fontSize: 12 },
            }}
          />
        )}
      />
    );
  };

  const RenderArea = (newRow) => {
    const [value, setValue] = useState(newRow?.area || null);

    return (
      <Autocomplete
        disablePortal
        id="combo-box-area"
        options={inputArea}
        clearOnEscape
        onChange={(event, newValue) => {
          const updatedRows = rows.map((row) =>
            row.id === newRow.id ? { ...row, area: newValue || null } : row
          );
          setRows(updatedRows);
          setValue(newValue);
        }}
        getOptionLabel={(option) => option.name || ''}
        value={value}
        size="small"
        fullWidth
        renderInput={(params) => (
          <TextField
            {...params}
            InputProps={{
              ...params.InputProps,
              sx: { fontSize: 12 },
            }}
            InputLabelProps={{
              sx: { fontSize: 12 },
            }}
          />
        )}
      />
    );
  };

  const onDeleteRow = (id) => {
    const updatedRows = rows.filter((row) => row.id !== id);
    setRows(updatedRows);
   // setSnackbar({ children: 'Row deleted successfully', severity: 'success' });
  };

  const onAddRow = () => {

    let flag = true;
  
    if(queryId == null) {
        setSnackbar({ children: `Inspection Details Empty`, severity: 'error' });
        flag = false;
    }
    if(flag){
        // Calculate the new ID based on the max existing row ID
        const maxId = rows.length > 0 ? Math.max(...rows.map((row) => row.id)) : 0;
        const newRow = {
          id: maxId + 1,
          defect: null,
          area: null,
          majorQty: 0,
          numericData: '',
        };
        setRows((prevRows) => [...prevRows, newRow]);
        //setSnackbar({ children: 'Row added successfully', severity: 'success' });
    }  

  };

  const RenderDelete = (rowSelected) => {
    return (
      <IconButton
        onClick={() => onDeleteRow(rowSelected.id)}
        aria-label="delete"
        variant="contained"
        size="small"
        color="error"
        sx={{ border: 1, mt: 0.2 }}
      >
        <Delete sx={{ fontSize: 20 }} />
      </IconButton>
    );
  };

  const RenderAdd = () => {
    return (
      <IconButton
        onClick={onAddRow}
        aria-label="add"
        variant="outlined"
        size="small"
        color="success"
        sx={{ border: 1, mt: 0.2, backgroundColor: '#fff', ':hover': { backgroundColor: '#fff' } }}
      >
        <Add sx={{ fontSize: 20 }} />
      </IconButton>
    );
  };

  const columns = [
    {
      field: 'option',
      renderHeader: RenderAdd,
      renderCell: (params) => RenderDelete(params.row),
      width: 55,
      maxWidth: 55,
      minWidth: 55,
      disableColumnMenu: true,
      disableColumnFilter: true,
      sortable: false,
    },
    {
      field: 'id',
      headerName: '#',
      type: 'number',
      editable: false,
      width: 50,
      maxWidth: 50,
      minWidth: 50,
    },
    {
      field: 'defect',
      headerName: 'Defect',
      width: 300,
      minWidth: 200,
      maxWidth: 400,
      renderCell: (params) => RenderDefect(params.row),
    },
    {
      field: 'area',
      headerName: 'Area',
      width: 200,
      minWidth: 180,
      maxWidth: 300,
      renderCell: (params) => RenderArea(params.row),
    },
    {
      field: 'majorQty',
      headerName: 'Major Qty',
      type: 'number',
      editable: true,
      width: 65,
      minWidth: 65,
      maxWidth: 65,
    },
    {
      field: 'numericData',
      headerName: 'Numeric Data',
      type: 'string',
      editable: true,
      width: 200,
      maxWidth: 200,
      minWidth: 80,
    },
  ];

  const handleProcessRowUpdate = (newRow) => {
    const updatedRows = rows.map((row) => (row.id === newRow.id ? newRow : row));
    setRows(updatedRows);
    return newRow;
  };

  const handleProcessRowUpdateError = (error) => {
    setSnackbar({ children: 'Error during update', severity: 'error' });
  };

  const onSaveChanges = async () => {
      let flag = true;

      if(queryId == null) {
          setSnackbar({ children: `Inspection Details Empty`, severity: 'error' });
          flag = false;
      }
      if(rows.length === 0) {
        setSnackbar({ children: `No Data to be Save`, severity: 'error' });
        flag = false;
      }

      // check if one of the rows are invalid
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        // Check if any of the conditions are met
        if (row.defect === null || row.area === null || row.majorQty < 1) {
          setSnackbar({ children: `Defect, Area, MajorQty cannot be less than 1 or empty`, severity: 'error' });
          flag = false;
          break; // Exit the loop once a failure condition is found
        }
      }

      if(flag){
        const newUser = `${user?.result?.firstname} ${user?.result?.lastname}`;
        
        await dispatch(createDefectData({ inspectionId:queryId,passType:passType,defectDetails:rows,editedBy:newUser}));
        await  dispatch(getDefectDatas({inspectionId:queryId,passType}));
      }  
  }

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
   },[rows,onSaveChanges]);
 
   const handleLogout = () =>{
     dispatch({type: AUTH_LOGOUT});
     navigate(`/login`);
     setUser(null);
   }
   // USER

  return (
    <Paper elevation={20} sx={{ padding: 1 }}>
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={areaLoading || defectLoading || defectDataLoading }>
            <CircularProgress color="inherit" />
        </Backdrop>
      <Grid container spacing={2} direction="row" justifyContent="space-between">
        <Grid xs={6} md={6} lg={6}>
          <Typography variant="h5">
            <span
              style={{
                backgroundColor: passText.color,
                color: '#fff',
                borderRadius: 5,
                paddingLeft: 2,
                paddingRight: 2,
              }}
            >{passText.text}
            </span>
          </Typography>
        </Grid>
        <Grid xs={4} md={4} lg={4}>

        <Tooltip 
            title={
                <Typography color="inherit">
                <span style={{color:'#fab1a0'}}>
                    Last edit : {defectDetailsLogs?.editedBy || 'NA'} - {moment(defectDetailsLogs?.updatedAt).fromNow()}
                </span>
                </Typography>
            }
            placement="bottom">     
            <Button size="small" variant="contained" color="success" startIcon={<Save />} fullWidth  onClick={onSaveChanges}> Save Changes </Button>
        </Tooltip>
        </Grid>
      </Grid>

      <Grid container spacing={2} justifyContent="center">
        <Grid xs={12} md={12} lg={12}>
          <Paper elevation={10} sx={{ width: '100%', overflow: 'hidden' }}>
            <Box sx={{ maxHeight: 600, width: '100%', mt: 2 }}>
              <div style={{ height: 500, width: '100%' }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  rowHeight={100}
                  getRowId={(row) => row.id}
                  processRowUpdate={handleProcessRowUpdate}
                  processRowUpdateError={handleProcessRowUpdateError}
                  getRowHeight={() => 'auto'}
                  getEstimatedRowHeight={() => 200}
                  pageSizeOptions={[20]}
                  showCellVerticalBorder
                  showColumnVerticalBorder
                  density="standard"
                  sx={{
                    '& .MuiDataGrid-columnHeaderTitle': {
                      whiteSpace: 'break-spaces',
                      lineHeight: 1,
                    },
                    '&.MuiDataGrid-root .MuiDataGrid-columnHeader--alignRight .MuiDataGrid-columnHeaderTitleContainer': {
                      pl: 1,
                    },
                    '& .MuiDataGrid-cell': {
                      border: 1,
                      borderRight: 1,
                      borderTop: 0,
                      borderLeft: 0,
                      borderBottom: 1,
                      borderColor: 'primary.light',
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
                      bgcolor: '#95a5a6',
                      '&:hover': {
                        bgcolor: '#7f8c8d',
                      },
                    },
                    overflow: 'scroll',
                  }}
                />
              </div>
            </Box>
          </Paper>
        </Grid>
      </Grid>
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

export default PassTable;
