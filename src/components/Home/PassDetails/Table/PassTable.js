import React, { useState, useEffect,useRef } from 'react';
import Paper from '@mui/material/Paper';
import { DataGrid,useGridApiRef } from '@mui/x-data-grid';
import { Box, Button, IconButton, Autocomplete, TextField,CircularProgress,Backdrop, Tooltip,Typography,Snackbar,Alert } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Add, Delete, Save } from '@mui/icons-material';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAreas } from '../../../../actions/areas';
import { getDefects } from '../../../../actions/defects';
import {createDefectData,getDefectDatas,checkEmptyDefect} from '../../../../actions/defectDatas';

import { AUTH_LOGOUT } from '../../../../constant/actionTypes';
import decode from 'jwt-decode';

import moment from 'moment';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PassTable = ({setSharedStateRef,sharedStateRef}) => {


  const dispatch = useDispatch();
  const navigate = useNavigate();
  const apiRef = useGridApiRef();

  const query = useQuery();
  const queryId = query.get('id') || null;
  const [passType, setPassType] = useState({
    name:'firstPassDefect',
    firstDefect:0,
    firstPullOut:0,
    secondPullOut:0
  });

  const [passText, setPassText] = useState({
    text: '1st Pass - Defect Qty',
    color: '#00d2d3',
  });

  sharedStateRef.passType = passType;
  setSharedStateRef.setPassType = setPassType;

  sharedStateRef.passText = passText.text || '';

  const [rows, setRows] = useState([]);
  const [majorQtyVal, setMajorQtyVal] = useState(0);
  const { areas, isLoading: areaLoading } = useSelector((state) => state.areas);
  const { defects, isLoading: defectLoading } = useSelector((state) => state.defects);
  const { defectDatas,defectDetailsLogs, isLoading: defectDataLoading, emptyDefect } = useSelector((state) => state.defectDatas);

  const [inputArea, setInputArea] = useState([]);
  const [inputDefect, setInputDefect] = useState([]);

  useEffect(() => {
    dispatch(getAreas());
    dispatch(getDefects());
  }, [dispatch]);

  useEffect(() => {
    //['firstPassDefect', 'firstPassPullOut', 'secondPassPullOut']
    if(passType.name == 'firstPassDefect')
        setPassText({ text: '1st Pass - Defect Qty', color: '#0abde3'})
    else if(passType.name == 'firstPassPullOut')
        setPassText({ text: '1st Pass - Pull-Out Qty', color: '#ff9f43'})
    else if(passType.name == 'secondPassPullOut')
        setPassText({ text: '2nd Pass - Pull-Out Qty', color: '#ee5253'})
    if(queryId != null){
      console.log(`getDefectDatas called useffect`)
      dispatch(getDefectDatas({inspectionId:queryId,passType:passType.name}));
    }
  }, [passType.name,queryId]);

  useEffect(()=>{
    if(!defectDataLoading){
      setRows(defectDatas);
     console.log(`defectDatas => ${defectDatas}`);
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
        autoFocus
        id="combo-box-defect"
        options={inputDefect}
        autoHighlight
        clearOnEscape
        filterOptions={(options, state) =>
          options.filter((option) =>
            option.name.toLowerCase().includes(state.inputValue.toLowerCase())
          )
        } // Custom filter to allow partial matches
        onChange={(event, newValue) => {
          const updatedRows = rows.map((row) =>
            row.id === newRow.id ? { ...row, defect: newValue || null } : row
          );
          setRows(updatedRows);
          setValue(newValue);
        }}
        onKeyDown={(e)=>{
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.stopPropagation();
          }
        }}
        getOptionLabel={(option) => option.name || ''}
        inputValue={value?.name || ''}
        onInputChange={(event, newInputValue) => {
          if (event) {
            event.stopPropagation(); // Prevent unintended events
          }
          setValue((prev) =>
            prev?.name !== newInputValue ? { ...prev, name: newInputValue } : prev
          );
        }}
        value={value}
        size="small"
        fullWidth
        renderInput={(params) => (
          <TextField
            {...params}
            InputProps={{
              ...params.InputProps,
              sx: { fontSize: 12 },
              onKeyDown: (e) => {
                if (e.key === ' ') {
                  e.stopPropagation(); // Prevent spacebar from triggering unintended focus
                }
              },
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
        autoHighlight
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
        onKeyDown={(event) => {
          if (event.key === 'Tab') {
            event.preventDefault(); // Prevent default Tab behavior
            const gridApi = apiRef.current; // Assuming `apiRef` is a reference to the DataGrid API
            gridApi.setCellFocus(newRow.id, 'majorQty'); // Focus on the next cell (majorQty)
            gridApi.startCellEditMode({
              id: newRow.id,
              field: 'majorQty',
            });
          }
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.stopPropagation();
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            InputProps={{
              ...params.InputProps,
              sx: { fontSize: 12 },
              onKeyDown: (e) => {
                if (e.key === ' ') {
                  e.stopPropagation(); // Prevent spacebar from triggering unintended focus
                }
              },
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
    // Check if the row with the given id exists in the current rows
    const rowExists = rows.some((row) => row.id === id);
  
    if (!rowExists) {
      console.warn(`Row with id ${id} not found`); // Optional: Log a warning for debugging
      return; // Exit the function without updating the state
    }
  
    // Filter out the row with the given id and update the state
    const updatedRows = rows.filter((row) => row.id !== id);
    setRows(updatedRows);
  };
  
  const onAddRow = () => {

    let flag = true;
  
    if(queryId == null) {
        setSnackbar({ children: `Inspection Details Empty`, severity: 'error' });
        flag = false;
    }

    if(passType.name === 'firstPassDefect' && parseInt(passType.firstDefect) === 0 ){
      setSnackbar({ children: 'Add row is not allow, since the Qty is 0', severity: 'error' });
      flag = false;
    }else if(passType.name === 'firstPassPullOut' && parseInt(passType.firstPullOut) === 0){
      setSnackbar({ children: 'Add row is not allow, since the Qty is 0', severity: 'error' });
      flag = false;
    }else if(passType.name === 'secondPassPullOut'&& parseInt(passType.secondPullOut) === 0){
      setSnackbar({ children: 'Add row is not allow, since the Qty is 0', severity: 'error' });
      flag = false;
    }


    if(flag){
       
      setRows((prevRows) => {
        const maxId = prevRows.length > 0 ? Math.max(...prevRows.map((row) => row.id)) : 0;
        const newRow = {
          id: maxId + 1,
          defect: null,
          area: null,
          majorQty: 1,
          numericData: '',
        };
        return [...prevRows, newRow];
      });
        
    }  

  };

  const RenderDelete = (rowSelected) => {
    const rowExists = rows.some((row) => row.id === rowSelected.id);
  
    // Disable the delete button if the row doesn't exist
    return rowExists ? (
      <IconButton
        onClick={() => {
          // Prevent further clicks until deletion is handled
          if (rowExists) onDeleteRow(rowSelected.id);
        }}
        aria-label="delete"
        variant="contained"
        size="small"
        color="error"
        sx={{ border: 1, mt: 0.2 }}
      >
        <Delete sx={{ fontSize: 20 }} />
      </IconButton>
    ) : null;
  };

  const RenderAdd = () => {
    return (
      <IconButton
        onClick={onAddRow}  // Call onAddRow to add a new row
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
      editable: false,
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
      valueGetter: (params) => params.row.defect?.name || '', // For sorting and filtering
      sortComparator: (v1, v2) => v1.localeCompare(v2), // Optional: Customize sorting behavior
    },
    {
      field: 'area',
      headerName: 'Area',
      width: 200,
      minWidth: 180,
      maxWidth: 300,
      renderCell: (params) => RenderArea(params.row),
      valueGetter: (params) => params.row.area?.name || '', // For sorting and filtering
      sortComparator: (v1, v2) => v1.localeCompare(v2), // Optional: Customize sorting behavior
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

  const handleProcessRowUpdate = (newRow,oldRow) => {

    setMajorQtyVal(newRow.majorQty);

    const updatedRows = rows.map((row) => (row.id === newRow.id ? newRow : row));
    setRows(updatedRows);

    const qty = parseInt(newRow.majorQty);

    if(qty < 1){
      setSnackbar({ children: 'Lesser to 1 Qty is Invalid', severity: 'error' });
      return oldRow
    }
    else if(passType.name == 'firstPassDefect' && qty > parseInt(passType.firstDefect)){
      setSnackbar({ children: 'Qty must be equal or lesser to 1st Pass Defect total', severity: 'error' });
      return oldRow
    }else if(passType.name == 'firstPassPullOut' && qty > parseInt(passType.firstPullOut)){
      setSnackbar({ children: 'Qty must be equal or lesser to 1st Pass PullOut total', severity: 'error' });
      return oldRow
    }else if(passType.name == 'secondPassPullOut' && qty > parseInt(passType.secondPullOut)){
      setSnackbar({ children: 'Qty must be equal or lesser to 2nd Pass PullOut total', severity: 'error' });
      return oldRow
    }else{
      return newRow;
    }
  };

  const handleProcessRowUpdateError = (error) => {
    setSnackbar({ children: 'Error during update', severity: 'error' });
  };

  const findDuplicateIds = (data) => {
    const seen = new Set();
    const duplicateIds = new Set();
  
    data.forEach((item) => {
      // Check if defect and area objects are not null and have _id
      if (item.defect && item.defect._id && item.area && item.area._id) {
        const key = `${item.defect._id}_${item.area._id}`;
        if (seen.has(key)) {
          duplicateIds.add(item.id); // Add the id to duplicateIds if this combination already exists
        } else {
          seen.add(key); // Otherwise, add the combination to the seen set
        }
      } else {
        console.warn(`Missing required fields in item with id: ${item.id}`);
      }
    });
  
    return [...duplicateIds]; // Return an array of duplicate ids
  };

  const onSaveChanges = async () => {
      let flag = true;

      if(queryId == null) {
          setSnackbar({ children: `Inspection Details Empty`, severity: 'error' });
          flag = false;
      }

      // check if one of the rows are invalid
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        // Check if any of the conditions are met
        if (row.defect === null || row.area === null) {
          setSnackbar({ children: `Invalid Defect or Area inputed`, severity: 'error' });
          flag = false;
          break; // Exit the loop once a failure condition is found
        }


        if(passType.name == 'firstPassDefect' && parseInt(row.majorQty) > parseInt(passType.firstDefect)){
          setSnackbar({ children: `Invalid MajorQty inputed`, severity: 'error' });
          flag = false;
        }else if(passType.name == 'firstPassPullOut' && parseInt(row.majorQty) > parseInt(passType.firstPullOut)){
          setSnackbar({ children: `Invalid MajorQty inputed`, severity: 'error' });
          flag = false;
        }else if(passType.name == 'secondPassPullOut' && parseInt(row.majorQty) > parseInt(passType.secondPullOut)){
          setSnackbar({ children: `Invalid MajorQty inputed`, severity: 'error' });
          flag = false;
        }

      }

      if(findDuplicateIds(rows).length > 0){
        setSnackbar({ children: `Duplicate entry row: ${findDuplicateIds(rows)}`, severity: 'error' });
        flag = false;
      }

   

      if(flag){
        const newUser = `${user?.result?.firstname} ${user?.result?.lastname}`;

        setSnackbar({ children: `Successfully Save Changes`, severity: 'success' });
        
        await dispatch(createDefectData({ inspectionId:queryId,passType:passType.name,defectDetails:rows,editedBy:newUser}));
        await dispatch(getDefectDatas({inspectionId:queryId,passType:passType.name}));

        // update checkEmptyDefect
        await dispatch(checkEmptyDefect({ inspectionId:queryId}));
        
      }  
  }

  const handleProcessEditCellProps = async (params) => {
    if (params.field === 'majorQty') {
      // Delay focus to ensure the edit is committed
      setTimeout(() => {
        apiRef.current.setCellFocus(params.id, params.field);
      }, 0);
    }
    return params;
  };

   // USER
   const [user,setUser] = useState(JSON.parse(localStorage.getItem('profile')));
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
                  apiRef={apiRef}
                  rowHeight={100}
                  getRowId={(row) => row.id}
                  processRowUpdate={handleProcessRowUpdate}
                  processRowUpdateError={handleProcessRowUpdateError}
                  getRowHeight={() => 'auto'}
                  getEstimatedRowHeight={() => 200}
                  pageSizeOptions={[20]}
                  showCellVerticalBorder
                  showColumnVerticalBorder
                  processEditCellProps={handleProcessEditCellProps} // Handle focus after edit
                  experimentalFeatures={{ newEditingApi: true }}
                  density="standard"
                  onCellEditStop={(params, event) => {
                    const { key } = event;
                    const { field, id } = params;
                
                    if (key === 'Enter' && field === 'majorQty' ) {
                      event.preventDefault(); // Prevent the default behavior
                
                      // Add a slight delay to allow the editing state to transition
                      setTimeout(() => {
                        apiRef.current.setCellFocus(id, field); // Refocus the cell
                        apiRef.current.startCellEditMode({ id, field:'numericData' }); // Start editing again if needed
                      });
                    }else if (key === 'Enter' && field === 'numericData' ) {
                      event.preventDefault(); // Prevent the default behavior
                
                      // Add a slight delay to allow the editing state to transition
                      setTimeout(() => {
                        apiRef.current.setCellFocus(id, field); // Refocus the cell
                        //apiRef.current.startCellEditMode({ id, field:'numericData' }); // Start editing again if needed
                      });
                    }

                    //field === 'numericData'
                  }}
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
