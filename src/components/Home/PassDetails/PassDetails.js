import React, {useRef} from 'react';
import Appbar from '../Appbar/Appbar';
import Form from './Form/Form';
import PassTable from './Table/PassTable.js';
import {Box} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

import {Grow} from '@mui/material';

const PassDetails = () =>{

  const sharedStateRef = useRef(null);
  const setSharedStateRef = useRef(null);

  return(
    <>
      <Appbar/>
      <Grid container spacing={2} direction="row" justifyContent="center" sx={{mb:2}}> 
          <Grid xs={6} md={6} lg={6} mt={2}>
            <Form sharedStateRef={sharedStateRef} setSharedStateRef={setSharedStateRef}/>
          </Grid>
          <Grid xs={6} md={6} lg={6} mt={2}>
            <PassTable setSharedStateRef={setSharedStateRef} sharedStateRef={sharedStateRef} />
          </Grid>
      </Grid>
    </>
  )
};

export default PassDetails;

