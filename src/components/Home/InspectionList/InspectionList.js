import React from 'react';
import Appbar from '../Appbar/Appbar';
import {Grow} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'

import InspectionTable from './Table/InspectionTable';
;

const InspectionList = () =>{

  return(
    <>
      <Appbar/>
      <Grow in>
        <div>
            <InspectionTable/> 
        </div>
      </Grow>
    </>
    
  )
};

export default InspectionList;

