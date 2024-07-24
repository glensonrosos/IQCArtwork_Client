import React, {useRef} from 'react';
import Appbar from '../Appbar/Appbar';
import AddItem from './AddItem/AddItem';
import ItemTable from './Table/ItemTable';
import MoldTable from './Table/MoldTable';
import {Box} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

import {Grow} from '@mui/material';

const InspectionList = () =>{

  const sharedStateRef = useRef(null);
  const setSharedStateRef = useRef(null);

  return(
    <>
      <Appbar/>
      <Grid container spacing={2} direction="row" justifyContent="center" sx={{mb:2}}> 
          <Grid xs={6} md={6} lg={6} mt={2}>
            {/* <AddItem sharedStateRef={sharedStateRef} setSharedStateRef={setSharedStateRef}/>
             <Box mt={2}></Box>
            <ItemTable setSharedStateRef={setSharedStateRef} sharedStateRef={sharedStateRef} /> */}
          </Grid>
          <Grid xs={6} md={6} lg={6} mt={2}>
            {/* <MoldTable sharedStateRef={sharedStateRef} setSharedStateRef={setSharedStateRef}/> */}
          </Grid>
      </Grid>
    </>
  )
};

export default InspectionList;

