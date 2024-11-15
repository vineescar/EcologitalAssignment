import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, AppBar, Toolbar, Typography, Drawer, Button, List, ListItemButton, ListItemText, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Divider } from "@mui/material";

const drawerWidth = 150;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<{ id: string, name: string }[]>([]); 
  const [roomName, setRoomName] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string>(""); 
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:4000/api/layout") 
      .then(response => {
        setRooms(response.data); 
      })
      .catch(error => {
        console.error("Error fetching rooms:", error);
      });
  }, []); 

  const handleAddRoom = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setRoomName("");
  };

  const handleSaveRoom = () => {
    if (roomName.trim()) {
      axios.post("http://localhost:4000/api/room", { name: roomName.trim() })
        .then(response => {
          setRooms(prevRooms => [...prevRooms, response.data]); 
          setError(""); 
          handleCloseDialog();

          navigate(`/room/${response.data.name}`);
        })
        .catch(error => {
          if (error.response && error.response.status === 409) {
            setError("Room name already exists."); 
          } else {
            console.error("Error saving room:", error);
            setError("An error occurred while saving the room."); 
          }
        });
    } else {
      setError("Please enter a room name."); 
    }
  };
  
const handleRoomClick = (roomName: string) => {
  setSelectedRoom(roomName);
  navigate(`/room/${roomName}`); 
};


  return (
    <Box sx={{ display: "flex", position: "relative" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          position: "absolute",
          zIndex: 1100,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto", padding: 2 }}>
          <Button variant="contained" color="primary" onClick={handleAddRoom} sx={{ marginBottom: 2,backgroundColor: '#BB2D26' }}>
            Add Room
          </Button>
          <List sx={{ width: '100%', bgcolor: 'background.paper', padding: 2 }}>
            {rooms.map((room, index) => (
              <div key={room.name}>
                <ListItemButton
                  onClick={() => handleRoomClick(room.name)}
                  selected={selectedRoom === room.name}
                  sx={{
                    backgroundColor: selectedRoom === room.name ? 'rgba(0, 0, 0, 0.08)' : 'inherit',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                    borderRadius: 1, 
                    marginBottom: 1, 
                    padding: '10px 20px', 
                  }}
                >
                  <ListItemText
                    primary={room.name}
                    sx={{
                      fontWeight: 'bold', 
                      color: selectedRoom === room.name ? 'primary.main' : 'text.primary', 
                    }}
                  />
                </ListItemButton>
                
                {index < rooms.length - 1 && <Divider />}
              </div>
            ))}
          </List>
        </Box>
      </Drawer>

      <AppBar position="fixed" sx={{ zIndex: 1050 ,backgroundColor: '#F3DFDE',color:'black'}} >
        <Toolbar sx={{ display: "flex", justifyContent: "center" }}>
          <Typography variant="h4" noWrap sx={{marginLeft:'100px'}}>
            Floor Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: `${drawerWidth}px`,
          marginTop: "64px",
        }}
      >
        {children}
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add a New Room</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="roomName"
            label="Room Name"
            type="text"
            fullWidth
            value={roomName}
            onChange={(e) => {
              setRoomName(e.target.value);
              setError(""); 
            }}
            variant="outlined"
            error={!!error}
            helperText={error} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveRoom} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Layout;
