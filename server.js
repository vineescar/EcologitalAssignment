const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const cors = require('cors');

// Define the data file path
const dataFilePath = path.join(__dirname, 'data.json');

app.use(express.json());

app.use(cors()); // This allows all origins

// Endpoint to retrieve specific room layout data by ID
app.get('/api/layout/:name', (req, res) => {
  const roomName = req.params.name;  // Use room name instead of room id
  console.log(`Fetching room with name: ${roomName}`);

  let data;
  try {
    // Read the data file and parse it
    data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
    console.log('Data file loaded:', data);
  } catch (error) {
    console.error('Error loading data file:', error);
    return res.status(500).send('Failed to load data');
  }

  // Check if data is an array and contains valid rooms
  if (!Array.isArray(data)) {
    return res.status(500).send('Invalid data format');
  }

  // Find the room by name
  const room = data.find(room => room.name === roomName);  // Use find on the array of rooms by name

  if (!room) {
    return res.status(404).send('Room not found');
  }

  // Send the room data back to the client
  res.json(room);
});

// Endpoint to delete a room by name
app.delete('/api/layout/:name', (req, res) => {
  const { name } = req.params;

  let data;
  try {
    // Read the data file and parse it
    data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
  } catch (error) {
    console.error('Error loading data file:', error);
    return res.status(500).send('Failed to load data');
  }

  // Check if data is an array and contains valid rooms
  if (!Array.isArray(data)) {
    return res.status(500).send('Invalid data format');
  }

  // Find the index of the room by name
  const roomIndex = data.findIndex(room => room.name.toLowerCase() === name.toLowerCase());
  if (roomIndex === -1) {
    return res.status(404).send('Room not found');
  }

  // Remove the room from the array
  data.splice(roomIndex, 1);

  // Save the updated data back to the file
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    res.status(200).send('Room deleted successfully');
  } catch (error) {
    console.error('Error saving data file:', error);
    res.status(500).send('Failed to save updated data');
  }
});



app.post('/api/layout', (req, res) => {
  const layoutData = req.body;

  try {
    // Read the existing data from the file
    let data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

    // Check if data is an array and contains valid rooms
    if (!Array.isArray(data)) {
      return res.status(500).send('Invalid data format');
    }

    // Find the room by name in the existing data
    const roomIndex = data.findIndex(room => room.name === layoutData.name);

    if (roomIndex !== -1) {
      // Room exists, update its tables
      layoutData.tables.forEach((newTable) => {
        const existingTableIndex = data[roomIndex].tables.findIndex(
          (table) => table.name === newTable.name
        );
    
        if (existingTableIndex !== -1) {
          // Table exists, update it
          data[roomIndex].tables[existingTableIndex] = newTable;
        } else {
          // Table does not exist, add it
          data[roomIndex].tables.push(newTable);
        }
      });
    
      // Remove tables in the existing room that are not in layoutData.tables
      data[roomIndex].tables = data[roomIndex].tables.filter((existingTable) =>
        layoutData.tables.some((newTable) => newTable.name === existingTable.name)
      );
    
      // Update room name if needed
      data[roomIndex].name = layoutData.name;
    } else {
      // Room does not exist, add a new room
      data.push(layoutData);
    }
    

    // Write the updated data back to the file
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    res.status(200).send('Data saved successfully');
  } catch (error) {
    console.error('Error saving data file:', error);
    res.status(500).send('Failed to save data');
  }
});


// Endpoint to retrieve all rooms data
app.get('/api/layout', (req, res) => {
  let data;
  try {
    // Read the data file and parse it
    data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
    console.log('Data file loaded:', data);
  } catch (error) {
    console.error('Error loading data file:', error);
    return res.status(500).send('Failed to load data');
  }

  // Check if data is an array and contains valid rooms
  if (!Array.isArray(data)) {
    return res.status(500).send('Invalid data format');
  }

  // Send all room data back to the client
  res.json(data);
});

// Endpoint to create a new room (POST)
app.post('/api/room', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).send("Room name is required");
  }

  let data;
  try {
    // Read the data file and parse it
    data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
  } catch (error) {
    console.error('Error loading data file:', error);
    return res.status(500).send('Failed to load data');
  }

  // Check if data is an array and contains valid rooms
  if (!Array.isArray(data)) {
    return res.status(500).send('Invalid data format');
  }

  // Check if the room name already exists
  const roomExists = data.some(room => room.name.toLowerCase() === name.toLowerCase());
  if (roomExists) {
    return res.status(409).send('Room with this name already exists');
  }

  // Create a new room object
  const newRoom = {
    id: Date.now().toString(),  // Using timestamp as ID for simplicity
    name,
    tables: [] // Initialize with an empty table array
  };

  // Add the new room to the rooms data
  data.push(newRoom);

  try {
    // Save the updated rooms data back to the file
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    res.status(201).json(newRoom); // Send back the newly created room
  } catch (error) {
    console.error('Error saving data file:', error);
    res.status(500).send('Failed to save new room');
  }
});

// Endpoint to retrieve all rooms data
app.get('/api/layout', (req, res) => {
  let data;
  try {
    // Read the data file and parse it
    data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
    console.log('Data file loaded:', data);
  } catch (error) {
    console.error('Error loading data file:', error);
    return res.status(500).send('Failed to load data');
  }

  // Check if data is an array and contains valid rooms
  if (!Array.isArray(data)) {
    return res.status(500).send('Invalid data format');
  }

  // Send all room data back to the client
  res.json(data);
});


app.put('/api/layout', (req, res) => {
  const layoutData = req.body;

  try {
    // Read the existing data from the file
    let data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

    // Check if data is an array and contains valid rooms
    if (!Array.isArray(data)) {
      return res.status(500).send('Invalid data format');
    }

    // Find the room by name in the existing data
    const roomIndex = data.findIndex(room => room.name === layoutData.name);

    if (roomIndex !== -1) {
      // Room exists, update its tables
      layoutData.tables.forEach(newTable => {
        const existingTableIndex = data[roomIndex].tables.findIndex(
          table => table.name === newTable.name
        );

        if (existingTableIndex !== -1) {
          // Table exists, update it
          data[roomIndex].tables[existingTableIndex] = newTable;
        } else {
          // Table does not exist, add it
          data[roomIndex].tables.push(newTable);
        }
      });

      // Save the updated data
      fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
      res.status(200).send('Room layout updated successfully');
    } else {
      res.status(404).send('Room not found');
    }
  } catch (error) {
    console.error('Error saving data file:', error);
    res.status(500).send('Failed to save data');
  }
});




const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
