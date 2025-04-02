import { Alert, Avatar, Box, Button, Card, CardContent, Collapse, Divider, FormControl, IconButton, InputLabel, List, ListItem, ListItemAvatar, ListItemText, ListSubheader, MenuItem, Paper, Select, SelectChangeEvent, TextField, Typography } from "@mui/material";
import React, { useEffect } from "react";
import WalletIcon from '@mui/icons-material/Wallet';
import AddIcon from '@mui/icons-material/Add';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL;

export interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string;
}

export interface NetworkAddress {
    _id: string;
    address: string;
    networkId: string;
    isDefault: boolean;
}

export interface AddressBook {
    _id: string;
    networkAddresses: NetworkAddress[]
}

export interface Token {
    address: string;
    symbol: string;
    decimals: number;
    logo: string;
      
}

export interface Network {
    _id: string;
    name: string;
    code: string;
    logo: string;
    supportedTokens: Token[];
}

export interface Payment {
    payId: string;
    userId: string;
    methods: string;
    amount: string;
    status: string;
    expiredAt: string;
    remainingAmount: string;
}
export interface PaymentDisplay {
    payId: string;
    userId: string;
    methods: string;
    amount: string;
    status: string;
    expiredAt: string;
    remainingAmount: string;
    message: string;
}

export interface PaymentMethod {
    token: string;
    address: string;
    network: string;
    networkId: string;
    networkLogo: string;
    tokenLogo: string;
    method: string;
}

const User: React.FC = () => {
    
    const [profile, setProfile] = React.useState<UserProfile | null>(null);
    const [addressbook, setAddressbook] = React.useState<AddressBook| null>(null);
    const [isAdding, setIsAdding] = React.useState(false);
    const [networks, setNetworks] = React.useState<Network[]>([]);
    const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([]);
    const [chosenMethods, setChosenMethods] = React.useState<string[]>([]);

    const onChoosePaymentMethod = (event: SelectChangeEvent<typeof chosenMethods>) => {
        const {
            target: { value },
          } = event;
        setChosenMethods(
            typeof value === 'string' ? value.split(',') : value,
        );
    }

    const navigate = useNavigate();
    
    const getProfile = async () => {
        const response = await fetch(`${apiUrl}/user/profile`, {
        credentials: 'include',
        });
        if (response.status === 401) {
            setProfile(null); 
            navigate('/login');
            return;
        }
        const data = await response.json();
        setProfile(data.data);
    }

    const getAddressbook = async () => {
        const response = await fetch(`${apiUrl}/address-book`, {
        credentials: 'include',
        });
        const data = await response.json();
        setAddressbook(data.data);
    }

    const getNetworks = async () => {
        const response = await fetch(`${apiUrl}/network`, {
        credentials: 'include',
        });
        const data = await response.json();
        setNetworks(data.data);
    }

    const fetchPaymentMethods = async () => {
        const response = await fetch(`${apiUrl}/payment/methods`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        if (data.error === false) {
            setPaymentMethods(data.data);
        } else {
            console.error(data.message);
        }
    }

    const [networkChosen, setNetworkChosen] = React.useState<string>("");
    const [addressChosen, setAddressChosen] = React.useState<string>("");

    const handleChooseNetwork = (event: SelectChangeEvent) => {
        setNetworkChosen(event.target.value);
    };

    useEffect(() => {
        getProfile();
        getNetworks();
        fetchPayments();
        fetchPaymentMethods();
    },[])

    useEffect(() => {
        if (profile) {
            getAddressbook();
        }
    }, [profile])


    const submitCreateNetworkAddress = async () => {
        if (addressbook === null || networkChosen === "" || addressChosen === "") {
            console.error('Addressbook or networkChosen or addressChosen is null');
            return;
        }
        const response = await fetch(`${apiUrl}/address-book/network-address`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                captcha: 'captcha',

                addressBookId: addressbook._id,
                networkAddress: {
                    address: addressChosen,
                    networkId: networkChosen,
                    isDefault: true,
                },
            }),
        });
        const data = await response.json();
        if (data.error === false) {
            setAddressbook(data.data);
            setNetworkChosen("");
            setAddressChosen("");
            setIsAdding(false);
        } else {
            console.error(data.message);
        }
    }

    // const [networKAddressChosen, setNetworkAddressChoosen] = React.useState<string>("");
    // const handleChoseNetworkAddress = (event: SelectChangeEvent) => {
    //     setNetworkAddressChoosen(event.target.value);
    // };
    // const [tokenChosen, setTokenChosen] = React.useState<string[]>([]);
    // const handleChoseToken = (event: SelectChangeEvent<typeof tokenChosen>) => {
    //     const {
    //         target: { value },
    //       } = event;
    //     setTokenChosen(
    //         typeof value === 'string' ? value.split(',') : value,
    //     );
    // };

    function isAmountValid(amount: string): boolean {
        const regex = /^\d+(\.\d{1,2})?$/; // Regex to match numbers with up to 2 decimal places
        return regex.test(amount);
    }

    const [amount, setAmount] = React.useState<string>('');
    const [expiresIn, setExpiresIn] = React.useState<string>('');
    const [message, setMessage] = React.useState<string>('');
    const [openAlert, setOpenAlert] = React.useState(false);
    const [alertMessage, setAlertMessage] = React.useState<string>('');
    const [alertSeverity, setAlertSeverity] = React.useState<'success' | 'error'>('success');
    
    const handleOpenAlert = (message: string, severity: 'success' | 'error') => {
        setAlertMessage(message);
        setAlertSeverity(severity);
        setOpenAlert(true);
    };

    const logout = async () => {
        const response = await fetch(`${apiUrl}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        
        if (response.status === 200) {
            setProfile(null);
            setAddressbook(null);
            setNetworks([]);
            setNetworkChosen("");
            setAddressChosen("");
            // setNetworkAddressChoosen("");
            // setTokenChosen([]);
            setAmount('');
            setExpiresIn('');
            setMessage('');
            setOpenAlert(false);
            window.location.reload();
        } else {
            // console.error(data.message);
        }
    }

    useEffect(() => {
        if (openAlert) {
            const timer = setTimeout(() => {
                setOpenAlert(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [openAlert]);

    const createPayment = async () => {
        if (addressbook === null ||  amount === '' || expiresIn === '' || message.length > 100) {
            handleOpenAlert('Please fill all fields', 'error');
            return;
        }
        const expiresInMinutes = (Number(expiresIn) * 60 * 1000).toString();
        const response = await fetch(`${apiUrl}/payment`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                methods: chosenMethods,
                amount: amount,
                expiresIn: expiresInMinutes,
                message: message,
            }),
        });
        const data = await response.json();
        if (data.error === false) {
            handleOpenAlert(data.message, 'success');
            setAmount('');
            setExpiresIn('');
            setMessage('');
            // setNetworkAddressChoosen("");
            // setTokenChosen([]);
            fetchPayments();
            setShowAmountError(false);
            setShowExpiresInError(false);
        } else {
            handleOpenAlert(data.message, 'error');
        }
    }

    // payId: entity._id,
    //   userId: entity.userId,
    //   methods: entity.methods,
    //   amount: entity.amount,
    //   status: entity.status,
    //   expiredAt: entity.expiredAt,
    //   remainingAmount: entity.remainingAmount,

    const [rows, setRows] = React.useState<Payment[]>([]);

    const paginationModel = { page: 1, pageSize: 10 };

    const fetchPayments = async () => {
        const response = await fetch(`${apiUrl}/payment`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        if (data.error === false) {
            setRows(data.data.data);
        } else {
            console.error(data.message);
        }
    }

    const columns: GridColDef[] = [
        { field: 'payId', headerName: 'Pay ID', width: 300 },
        { 
            field: 'methods', 
            headerName: 'Methods', 
            width: 650,
            renderCell: (params) => {
                const items = params.value as string[];
                return (
                    <Box sx={{
                        display: 'grid',
                        gridTemplateRows: `repeat(${items.length}, 1fr)`,
                        minHeight: '60px',
                        width: '100%',
                    }}>
                    {
                        items.map((item, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1.5fr 5fr",
                                    borderLeft: "1px solid rgba(224, 224, 224, 1)", // Fix border issue
                                    borderRight: "1px solid rgba(224, 224, 224, 1)", // Fix border issue
                                    borderBottom: index === items.length - 1 ? "none" : "1px solid rgba(224, 224, 224, 1)", // Fix border issue
                                }}
                            >
                                <Box className="flex justify-center items-center">{item.split(":")[0]}</Box>
                                <Box sx={{ borderLeft: '1px solid rgba(224, 224, 224, 1)', borderRight: '1px solid rgba(224, 224, 224, 1)'}} className="flex justify-center items-center">{item.split(":")[1]}</Box>
                                <Box className="flex justify-center items-center">{item.split(":")[2]}</Box>
                            </Box>
                            
                            ))
                    }
                    </Box>
                );
            },
        },
        { field: 'amount', headerName: 'Amount', width: 70, align: 'center' },
        { field: 'remainingAmount', headerName: 'Remaining Amount', width: 140, align: 'center' },
        {
          field: 'status',
          headerName: 'Status',
          width: 90,
        },
        {
          field: 'expiredAt',
          headerName: 'Expired At',
          width: 180,
          renderCell: (params) => {
            const date = new Date(params.value).toLocaleString(); // Convert to readable format
            return <span>{date}</span>;
          },
        },
        {
            field: 'message',
            headerName: 'Message',
          },
    ];

    const [showAmountError, setShowAmountError] = React.useState(false);
    const [showExpiresInError, setShowExpiresInError] = React.useState(false);

    const onAmountChageKeyUp = () => {
        setShowAmountError(true);
    }
    const onExpiresInChageKeyUp = () => {
        setShowExpiresInError(true);
    }

    
    return (
            <div className="flex flex-col h-full w-full">
            <Button
                variant="outlined" 
                onClick={() => navigate('/gateway')} 
                size="small"
                sx={{ m: 1, minWidth: 100 }}
            >
                Go to Gateway
            </Button>
            <Box sx={{ width: '100%', position: "fixed", top: 0, left: 0, zIndex: 1000 }}>
                <Collapse in={openAlert}>
                    <Alert
                    severity={alertSeverity}
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => {
                                setOpenAlert(false);
                            }}
                        >
                        <CloseIcon fontSize="inherit" />
                        </IconButton>
                    }
                    sx={{ mb: 2 }}
                    >
                    {alertMessage}
                    </Alert>
                </Collapse>
            </Box>
            
            {
                profile && (
                    <div className="flex flex-col justify-end w-full">
                        <Card sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flex: '1 0 auto' }}>
                            <Typography component="div" variant="h5">
                                {profile.firstName} {profile.lastName}
                            </Typography>
                            <Typography
                                variant="subtitle1"
                                component="div"
                                sx={{ color: 'text.secondary', ml:1 }}
                            >
                                {profile.email}
                            </Typography>
                            <Button
                                onClick={logout}
                            >
                                Logout
                            </Button>
                            </CardContent>
                        </Box>
                        {/* <CardMedia
                            component="img"
                            sx={{ width: 151 }}
                            image={profile.avatarUrl}
                            alt="User Avatar"
                        /> */}
                        </Card>
                    </div>
                )
            }
            <div className="h-2"></div>
            <Divider flexItem />
            <div className="h-2"></div>

            {
                addressbook && (
                    <List 
                        sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
                        component="nav"
                        aria-labelledby="nested-list-subheader"
                        subheader={
                            <div className="flex flex-row gap-2">
                                <ListSubheader component="div" id="nested-list-subheader">
                                Address Book
                                </ListSubheader>
                                <IconButton 
                                    color="primary" aria-label="Add address book"
                                    onClick={() => setIsAdding(!isAdding)}
                                >
                                    {isAdding ? <CloseIcon /> : <AddIcon />}
                                </IconButton>
                            </div>
                        }
                    >   
                        {
                            isAdding && (
                                <ListItem>
                                    <FormControl variant="standard" sx={{ m: 1, minWidth: 180 }}>
                                        <InputLabel id="demo-simple-select-standard-label">Network</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-standard-label"
                                            id="demo-simple-select-standard"
                                            value={networkChosen}
                                            onChange={handleChooseNetwork}
                                            label="Network"
                                            >
                                            {
                                                networks.map((network) => (
                                                    <MenuItem key={network._id} value={network._id}>
                                                        <div className="flex flex-row gap-2">
                                                            <img src={network.logo} alt={network.name} className="w-5 h-5" />
                                                            {network.name}
                                                        </div>
                                                    </MenuItem>
                                                ))
                                            }
                                        </Select>
                                    </FormControl>
                                    <TextField 
                                            id="standard-basic" label="Address" variant="standard" 
                                            sx={{ m: 1, minWidth: 500 }}
                                            value={addressChosen}
                                            onChange={(e) => setAddressChosen(e.target.value)}
                                    />
                                    <Button 
                                        variant="contained"
                                        onClick={submitCreateNetworkAddress}
                                        size="small"
                                        sx={{ m: 1, minWidth: 100 }}
                                        disabled={networkChosen === "" || addressChosen === ""}
                                        color="primary"
                                    >
                                        Submit
                                    </Button>
                                </ListItem>
                            
                            )
                        }
                        {
                            addressbook.networkAddresses.map((address) => (
                                <ListItem key={address._id}>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <WalletIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={address.address} secondary={address.networkId} />
                                </ListItem>
                            ))
                        }
                    </List>
                )
            }

            <div className="h-2"></div>
            <Divider flexItem />
            <div className="h-2"></div>

            <Typography variant="overline" gutterBottom sx={{ display: 'block' }}>
                Create payment
            </Typography>
            {
                profile &&
                <div className="flex flex-col gap-5 ml-3 w-250">
                    <div className="flex flex-row gap-2 justify-between">
                        {/* <div className="flex">
                            <FormControl variant="standard" sx={{ m: 1, minWidth: 300 }}>
                                <InputLabel id="select-payment-network-label">Select payment methods</InputLabel>
                                <Select
                                    labelId="select-payment-network-label"
                                    id="select-payment-network"
                                    value={networKAddressChosen}
                                    onChange={handleChoseNetworkAddress}
                                    label="Select payment Network"
                                    >
                                    {
                                        addressbook?.networkAddresses.map((networkAddress) => (
                                            <MenuItem key={networkAddress._id} value={networkAddress.networkId}>
                                                <div className="flex flex-row gap-2">
                                                    <img src={networks.find(n => n._id == networkAddress.networkId)?.logo} alt={networkAddress.address} className="w-5 h-5" />
                                                    {networks.find(n => n._id == networkAddress.networkId)?.name} - {networkAddress.address}
                                                </div>
                                            </MenuItem>
                                        ))
                                    }
                                </Select>
                            </FormControl>
                        </div> */}
                        <div className="flex">
                            <FormControl 
                                variant="standard" 
                                sx={{ m: 1, minWidth: 700 }} 
                            >
                            <InputLabel id="select-payment-token-label">Select payment Methods</InputLabel>
                                <Select
                                    labelId="select-payment-token-label"
                                    id="select-payment-token"
                                    value={chosenMethods}
                                    onChange={onChoosePaymentMethod}
                                    label="Select payment methods"
                                    multiple
                                    >
                                    {
                                        paymentMethods.map((method, idx) => (
                                            <MenuItem key={idx} value={method.method}>
                                                <div className="flex flex-row gap-2">
                                                    <img src={method.tokenLogo} alt={method.address} className="w-5 h-5" />
                                                    <img src={method.networkLogo} alt={method.network} className="w-5 h-5" />
                                                    {`${method.network} - ${method.token} - ${method.address.substring(0, 5)}...${method.address.substring(method.address.length - 5)}`}
                                                </div>
                                            </MenuItem>
                                        ))
                                    }
                                </Select>
                            </FormControl>
                        </div>
                    </div>
                    <div className="flex flex-row gap-2 justify-around">
                        <TextField 
                            label="Amount" 
                            color="secondary" 
                            sx={{ width: 200 }}
                            variant="standard"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            error={!isAmountValid(amount) && showAmountError}
                            onKeyUp={onAmountChageKeyUp}
                            helperText={!isAmountValid(amount) && showAmountError ? "Invalid amount" : ""}
                        />
                        <TextField 
                            label="Expires in minutes" 
                            color="success" 
                            sx={{ width: 200 }}
                            variant="standard"
                            value={expiresIn}
                            onChange={(e) => setExpiresIn(e.target.value)}
                            onKeyUp={onExpiresInChageKeyUp}
                            error={(isNaN(Number(expiresIn)) || Number(expiresIn) <= 0) && showExpiresInError}
                            helperText={(isNaN(Number(expiresIn)) || Number(expiresIn) <= 0) && showExpiresInError ? "Invalid expires in" : ""}
                        />
                    </div>
                    <TextField
                        id="message-multiline-payment"
                        label="Message"
                        multiline
                        rows={4}
                        placeholder="Message"
                        variant="standard"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        sx={{ m: 1, minWidth: 500 }}
                        error={message.length > 100}
                        helperText={message.length > 100 ? "Message is too long" : ""}
                    />
                    <Button 
                        variant="contained"
                        onClick={createPayment}
                        size="small"
                        sx={{ m: 1, minWidth: 100 }}
                        disabled={amount === '' || expiresIn === '' || message.length > 100 || !isAmountValid(amount) || isNaN(Number(expiresIn)) || Number(expiresIn) <= 0 || chosenMethods.length === 0}
                        color="primary"
                    >
                        Create
                    </Button>
                </div>
            }
            
            <div className="h-2"></div>
            <Divider flexItem />
            <div className="h-2"></div>
            <Typography variant="overline" gutterBottom sx={{ display: 'block' }}>
                    Yours payment
            </Typography>
            <div className="h-2"></div>
            {
                profile &&
                <Paper sx={{  width: '100%' }}>
                    <DataGrid
                        getRowId={(row) => row.payId}
                        getRowHeight={() => 'auto'}
                        rows={rows}
                        columns={columns}
                        initialState={{ pagination: { paginationModel } }}
                        pageSizeOptions={[5, 10]}
                        sx={{ border: 0 }}
                    />
                </Paper>
        }
            </div>
    )
}

export default User;