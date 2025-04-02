import { Button } from "@mui/material";
import React from "react";
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL;
const redirectUrl = import.meta.env.VITE_REDIRECT_URL;
const Login: React.FC = () => {

    const [value, setValue] = React.useState('1');
    const navigate = useNavigate();
    const goToGateway = () => { 
        navigate('/gateway');
    }

    const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
      setValue(newValue);
    };

    const handleLogin =  async () => {
        const redirectUri = encodeURIComponent(redirectUrl); // Replace with your redirect URL
        window.location.href = `${apiUrl}/auth/google/login?redirectUri=${redirectUri}`; // Replace with your NestJS API URL
    };

    return (
            <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
                  <TabList onChange={handleChange} aria-label="lab API tabs example">
                    <Tab label="User" value="1" />
                    <Tab label="Gateway" value="2" />
                  </TabList>
                </Box>
                <TabPanel value="1">
                    <Button
                        variant="outlined" 
                        onClick={handleLogin} 
                        size="small"
                    >
                        Login with Google
                    </Button>
                </TabPanel>
                <TabPanel value="2">
                    <Button
                        variant="outlined" 
                        onClick={goToGateway} 
                        size="small"
                    >
                        Go to gateway
                    </Button>
               </TabPanel>
            </TabContext>
    )
}

export default Login;