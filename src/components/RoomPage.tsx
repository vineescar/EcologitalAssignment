import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  Switch,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import image from '../Assets/Mid.svg';
import image2 from '../Assets/Table.svg';

interface Table {
  id: string;
  src: string;
  x: number;
  y: number;
  name: string;
  min: number;
  max: number;
  online: boolean;
  rotation: number; 
}

interface Room {
  id: string;
  name: string;
  tables: Table[];
}

const RoomPage: React.FC = () => {
  const { roomName } = useParams<{ roomName: string }>();
  const navigate = useNavigate();

  const defaultRoomId = '';
  const defaultRoomName = roomName || 'Room 1';

  const [room, setRoom] = useState<Room>({
    id: defaultRoomId,
    name: defaultRoomName,
    tables: [],
  });
  const [editingImage, setEditingImage] = useState<Table | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false); 
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newImage, setNewImage] = useState<Partial<Table>>({});

  const backendUrl = 'http://localhost:4000';

  useEffect(() => {
    console.log(roomName);
    axios
      .get(`${backendUrl}/api/layout/${roomName}`) 
      .then((response) => {
        console.log(response);
  
       
        setRoom({
          id: response.data.id || defaultRoomId, 
          name: response.data.name || defaultRoomName, 
          tables: response.data.tables || [], 
        });
      })
      .catch((error) => {
        console.error('Error fetching layout data:', error);
      });
  }, [roomName]); 

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const imageUrl = e.dataTransfer.getData('imageUrl');
  
    if (imageUrl) {
      const dropAreaRect = e.currentTarget.getBoundingClientRect();
      const dropX = e.clientX - dropAreaRect.left;
      const dropY = e.clientY - dropAreaRect.top;
  
      const isOverlapping = room?.tables?.some((image) => {
        const imageWidth = 100;
        const imageHeight = 100;
        return (
          dropX >= image.x - imageWidth / 2 &&
          dropX <= image.x + imageWidth / 2 &&
          dropY >= image.y - imageHeight / 2 &&
          dropY <= image.y + imageHeight / 2
        );
      }) || false; 
      
      if (isOverlapping) {
        setSnackbarMessage('Cannot drop an image on top of another image!');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
  
      setNewImage({ src: imageUrl, x: dropX, y: dropY });
      setDialogOpen(true);
    }
  };

  const handleDeleteRoom = (roomName: string) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete the room "${roomName}"?`);
  
    if (isConfirmed) {
      axios.delete(`${backendUrl}/api/layout/${roomName}`)
        .then((response) => {
          console.log('Room deleted successfully:', response.data);
  
          setSnackbarMessage(`Room deleted successfully.`);
          setSnackbarSeverity('success');
          setSnackbarOpen(true); 

           navigate("/");
        })
        .catch((error) => {
          console.error('Error deleting room:', error.response ? error.response.data : error.message);
          setSnackbarMessage(`Error deleting room: ${error.response ? error.response.data : error.message}`);
          setSnackbarSeverity('error');
          setSnackbarOpen(true); 
        });
    } else {
      console.log('Room deletion canceled.');
    }
  };
  
  const handleDialogSave = () => {
    if (
      newImage.name &&
      newImage.min !== undefined &&
      newImage.max !== undefined &&
      newImage.min <= newImage.max 
    ) {
      const image = {
        ...newImage,
        online: newImage.online || false,
        rotation: newImage.rotation !== undefined ? newImage.rotation : 0,
      } as Table;
  
      const updatedRoom = {
        ...room,
        tables: [...(room?.tables || []).filter(table => table.name !== image.name), image],
      };
  
      setRoom(updatedRoom);
      setDialogOpen(false);

      console.log(updatedRoom)
  
      axios
        .post(`${backendUrl}/api/layout`, updatedRoom)
        .then(() => {
          setSnackbarMessage('Image added successfully!');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
        })
        .catch((error) => {
          setSnackbarMessage('Error saving image!');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          console.error('Error saving layout:', error);
        });
    } else {
      setSnackbarMessage('Please fill in all required fields (Name, Min <= Max).');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  const handleEditSave = () => {
    if (editingImage) {
      if (
        editingImage.name &&
        editingImage.min !== undefined &&
        editingImage.max !== undefined &&
        editingImage.min <= editingImage.max
      ) {
        const updatedImages = room.tables.map((table) =>
          table.name === editingImage.name ? editingImage : table
        );
        const updatedRoom = { ...room, tables: updatedImages };
        console.log(updatedRoom)
        setRoom(updatedRoom);
        setEditingImage(null);
  
        axios
          .post(`${backendUrl}/api/layout`, updatedRoom) 
          .then(() => {
            setSnackbarMessage('Image updated successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
          })
          .catch((error) => {
            setSnackbarMessage('Error updating image!');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            console.error('Error updating layout:', error);
          });
      } else {
        setSnackbarMessage('Please fill in all required fields (Name, Min <= Max).');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  const handleImageClick = (name: string) => {
    console.log(name);
    setEditingImage(room.tables.find((image) => image.name === name) || null);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleImageDragStart = (e: React.DragEvent, imageUrl: string) => {
    e.dataTransfer.setData('imageUrl', imageUrl);
  };

    const handleDialogClose = () => {
    setDialogOpen(false);
    setNewImage({});
  };

  const handleDelete = (name: string) => {
    const updatedImages = room.tables.filter((image) => image.name !== name);
    const updatedRoom = { ...room, tables: updatedImages };
    setRoom(updatedRoom);

    axios
      .post(`${backendUrl}/api/layout`, updatedRoom)
      .then(() => console.log('Layout saved'))
      .catch((error) => console.error('Error saving layout:', error));

    if (editingImage?.name === name) {
      setEditingImage(null);
    }
  };

  const handleRotate = () => {
    if (editingImage) {
      const newRotation = (editingImage.rotation + 90) % 360;
      setEditingImage({
        ...editingImage,
        rotation: newRotation,
      });

      setRoom((prevRoom) => ({
        ...prevRoom,
        tables: prevRoom.tables.map((image) =>
          image.name === editingImage.name
            ? { ...image, rotation: newRotation }
            : image
        ),
      }));
    }
  };

  return (
    <div style={{ position: 'fixed', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: 400, 
          flexShrink: 0,
          position: 'absolute',
          zIndex: 1000,
          top: '64px', 
          '& .MuiDrawer-paper': {
            width: 400,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            marginLeft: '150px', 
            marginTop: '64px', 
          }}
        >
          <Typography variant="h6" sx={{ mt: 2, color: '#BB2D26' }}>Drag the Table</Typography>
          <img
            src={image}
            alt="draggable"
            draggable
            onDragStart={(e) => handleImageDragStart(e, image)}
            style={{ width: '100px', height: '100px', cursor: 'pointer' }}
          />
          <img
            src={image2}
            alt="draggable"
            draggable
            onDragStart={(e) => handleImageDragStart(e, image2)}
            style={{ width: '100px', height: '100px', cursor: 'pointer', marginTop: '10px' }}
          />

          {editingImage ? (
            <>
        <Typography variant="h6" sx={{ mt: 2, color: '#BB2D26' }}>
          Edit Table Data
        </Typography>

          <TextField
            label="Name"
            value={editingImage.name}
            onChange={(e) => setEditingImage({ ...editingImage, name: e.target.value })}
            fullWidth
            margin="normal"
            disabled 
          />

          <TextField
            label="Min"
            type="number"
            value={editingImage.min}
            onChange={(e) => setEditingImage({ ...editingImage, min: +e.target.value })}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Max"
            type="number"
            value={editingImage.max}
            onChange={(e) => setEditingImage({ ...editingImage, max: +e.target.value })}
            fullWidth
            margin="normal"
          />

          <Box display="flex" alignItems="center" mt={2}>
            <Typography>Online</Typography>
            <Switch
              checked={editingImage.online}
              onChange={(e) =>
                setEditingImage({ ...editingImage, online: e.target.checked })
              }
            />
          </Box>

          <Box mt={2}>
        <Button variant="contained" color="primary" sx={{ mt: 2, backgroundColor: '#BB2D26' }} onClick={handleRotate}>
          Rotate Table
        </Button>
      </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={handleEditSave}
          sx={{ mt: 2, backgroundColor: '#BB2D26',mr:2 }}
        >
          Save
        </Button>

        <Button
          variant="outlined"
          color="error"
          onClick={() => handleDelete(editingImage.name)}
          sx={{ mt: 2 }}
          startIcon={<DeleteIcon />}
        >
          Delete
        </Button>

            </>
          ) : null}
        </Box>

      </Drawer>

      {/* Drag and Drop Area */}
      <div style={{marginLeft: '300px'}}>
      <h1 style={{ color: '#BB2D26', display: 'flex', alignItems: 'center', gap: '650px' }}>
        {roomName}
        <Button
          variant="contained"
          sx={{ backgroundColor: '#BB2D26' }}
          onClick={() => handleDeleteRoom(defaultRoomName)}
          startIcon={<DeleteIcon />}
        >
          Delete Room
        </Button>
      </h1>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          position: 'fixed',
          width: '60%',
          height: '70%',
          border: '2px dashed #ccc',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9f9f9',
        }}
      >
          <Typography
          variant="h6"
          gutterBottom
          style={{ textAlign: 'center', color: '#999' }}
        >
          Drop Table Here
        </Typography>
        {room.tables.map((image) => (
          <div
            key={image.name}
            style={{
              position: 'absolute',
              top: image.y - 25,
              left: image.x - 25,
              transform: `rotate(${image.rotation}deg)`, 
            }}
          >
            <img
              src={image.src}
              alt="Dropped"
              style={{ width: '100px', height: '100px', cursor: 'pointer' }}
              onClick={() => handleImageClick(image.name)} 
            />
          </div>
        ))}
      </div>
    </div>
    <Dialog open={dialogOpen} onClose={handleDialogClose}>
      <DialogTitle>Add Image Details</DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          value={newImage.name || ''}
          onChange={(e) => setNewImage({ ...newImage, name: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Min"
          type="number"
          value={newImage.min || ''}
          onChange={(e) => setNewImage({ ...newImage, min: +e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Max"
          type="number"
          value={newImage.max || ''}
          onChange={(e) => setNewImage({ ...newImage, max: +e.target.value })}
          fullWidth
          margin="normal"
        />
        <Box display="flex" alignItems="center" mt={2}>
          <Typography>Online</Typography>
          <Switch
            checked={newImage.online || false}
            onChange={(e) => setNewImage({ ...newImage, online: e.target.checked })}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Cancel</Button>
        <Button onClick={handleDialogSave}>Save</Button>
      </DialogActions>
    </Dialog>


    <Snackbar
      open={snackbarOpen}
      autoHideDuration={3000}
      onClose={() => setSnackbarOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        zIndex: 1300, 
        marginBottom: 0, 
      }}
    >
      <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
        {snackbarMessage}
      </Alert>
    </Snackbar>

    </div>
  );
};

export default RoomPage;
