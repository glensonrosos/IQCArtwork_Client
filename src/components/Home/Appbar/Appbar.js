import React,{useState,useEffect} from 'react';
import {AppBar,Box,Toolbar,Typography,IconButton,Alert,Snackbar
  ,MenuItem,Menu,Link,Button,TextField,Dialog,DialogActions,DialogContent,DialogTitle,
} from '@mui/material/';
import AccountCircle from '@mui/icons-material/AccountCircle'

import { useIdleTimer } from 'react-idle-timer'

import Grid from '@mui/material/Unstable_Grid2';
import {useDispatch,useSelector} from 'react-redux';
import { changePassword } from '../../../actions/auth';
import { useNavigate,useLocation } from 'react-router';
import { AUTH_LOGOUT } from '../../../constant/actionTypes';
import decode from 'jwt-decode';


export default function MenuAppBar() {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location  = useLocation();

  //idle state
  const [state, setState] = useState('Active')
  const [count, setCount] = useState(0)
  const [remaining, setRemaining] = useState(0)

  const onIdle = () => {
    setState('Idle')
  }

  const onActive = () => {
    setState('Active')
  }

  const onAction = () => {
    setCount(count + 1)
  }

  const { getRemainingTime } = useIdleTimer({
    onIdle,
    onActive,
    onAction,
    timeout: 180_000, // 3 minutes no activity it will refresh the page
    throttle: 500
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(Math.ceil(getRemainingTime() / 1000))
    }, 500)

    return () => {
      clearInterval(interval)
    }
  });

  useEffect(() => {
    if(state === 'Idle'){
      window.location.reload();
    }
  },[state]);

  //idle state

  const {isLoading,message} = useSelector(state=> state.auth);

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
  },[]);

  const handleLogout = () =>{
    dispatch({type: AUTH_LOGOUT});
    navigate(`/login`);
    setUser(null);
  }

  const[userPass,setUserPass] = useState({
    oldPassword:null,
    newPassword:null,
    retypePassword:null
  });

  // SNACKBAR
  const [snackbar, setSnackbar] = useState(null);
  const handleCloseSnackbar = () => setSnackbar(null);

  useEffect(()=>{
   
    if(!isLoading && message !== null){
      if(message === 'success'){
        setSnackbar({ children: `Successfully Change Password`, severity: 'success' });
        handleCloseDialog();
      }else if(message === 'incorrect old password'){
        setSnackbar({ children: `Invalid Current Password`, severity: 'error' });
      }
    }
  },[isLoading,message])

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };



  const handleCloseMenu = () => {
    setAnchorEl(null);
    handleOpenDialog();
  };
  //  uncomment code below to enable authentication



  

  const [openDialog, setOpenDialog] = React.useState(false);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChangePassword = () =>{
    if(userPass.newPassword !== userPass.retypePassword)
      setSnackbar({ children: `Retype password is in correct`, severity: 'error' });
    else
      dispatch(changePassword({username:user?.result?.username,
          oldPassword:userPass.oldPassword,
          newPassword:userPass.newPassword
        })); 
  }

  const onChangePassInput = (name,e) =>{
    setUserPass({
      ...userPass,
      [name]: e.target.value
    })
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
       {/* <>
        <h1>React Idle Timer</h1>
        <h2>useIdleTimer</h2>
        <br />
        <p>Current State: {state}</p>
        <p>Action Events: {count}</p>
        <p>{remaining} seconds remaining</p>
      </> */}
      <AppBar position="static" color="info">
        <Toolbar>
          <Link variant="h6" href="/"  sx={{ flexGrow: 1,color:"#fff",textDecoration:"none", fontSize:32 }}>
            Mold Monitoring
          </Link>
          {/* <Button variant="contained" color="success" href="/mold-monitoring" sx={{mr:5}}>
            Mold Monitoring
          </Button>
          <Button variant="contained" color="error" href="/mold-details" sx={{mr:5}}>
            Mold Details
          </Button> */}
          {
            <div>
              <Grid container rowSpacing={1} direction="row" justifyContent="center" alignItems="center" columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              <Typography>{`${user?.result?.firstname} ${user?.result?.lastname}`}</Typography>  
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              </Grid>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
              >
                <MenuItem onClick={handleCloseMenu}>Change Password</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
            }
        </Toolbar>
      </AppBar>

{/* dialog box */}
    <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
        <Box component="form" noValidate autoComplete="off"
            sx={{
                '& .MuiTextField-root': { m: 1, width: '50ch' },
            }}>
          <TextField id="outlined-basic" onChange={(e) => onChangePassInput("oldPassword",e)} label="Old Password" variant="outlined" fullWidth/>
          <TextField id="outlined-basic" onChange={(e) => onChangePassInput("newPassword",e)} label="New Password" variant="outlined" fullWidth/>
          <TextField id="outlined-basic" onChange={(e) => onChangePassInput("retypePassword",e)} label="Retype Password" variant="outlined" fullWidth/>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" color="warning">Cancel</Button>
          <Button onClick={handleChangePassword} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
        {!!snackbar && (
            <Snackbar
              open
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              autoHideDuration={5000}
              onClose={handleCloseSnackbar}
            > 
              <Alert {...snackbar} onClose={handleCloseSnackbar} variant="filled" />
            </Snackbar>
          )}
    </Box>
  );
}