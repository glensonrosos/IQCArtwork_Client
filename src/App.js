import React,{} from 'react';
import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom';
import Login from './components/Login/Login';
import InspectionList from './components/Home/InspectionList/InspectionList';
import PassDetails from './components/Home/PassDetails/PassDetails';

// datetime
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'


const App = () =>{

    // const auth = JSON.parse(localStorage.getItem('profile'));
    // console.log(` app ${auth}`);

    return(
        <BrowserRouter>
            <LocalizationProvider dateAdapter={AdapterMoment}>
            <Routes>
                <Route index path="/" element={<Navigate to="/inspection-list"/>} />   
                <Route path="/login" element={<Login/>} />
                <Route path="/inspection-list" element={<InspectionList/>} />
                <Route path="/inspection-list/search" element={<InspectionList/>} />
                <Route path="/pass-details/" element={<PassDetails/>} />
                <Route path="*" element={<Navigate to="/inspection-list"/>} />
            </Routes>
            </LocalizationProvider>
        </BrowserRouter>
    )
}

export default App;