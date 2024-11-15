const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const cors = require('cors');

const dataFilePath = path.join(__dirname, 'data.json');

app.use(express.json());

app.use(cors());

app.get('/api/layout/:name', (req, res) => {
  const roomName = req.params.name; 
  console.log(`Fetching room with name: ${roomName}`);

  let data;
  try {
    data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
    console.log('Data file loaded:', data);
  } catch (error) {
    console.error('Error loading data file:', error);
    return res.status(500).send('Failed to load data');
  }
  if (!Array.isArray(data)) {
    return res.status(500).send('Invalid data format');
  }

  const room = data.find(room => room.name === roomName); 

  if (!room) {
    return res.status(404).send('Room not found');
  }
  res.json(room);
});

app.delete('/api/layout/:name', (req, res) => {
  const { name } = req.params;

  let data;
  try {
    data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
  } catch (error) {
    console.error('Error loading data file:', error);
    return res.status(500).send('Failed to load data');
  }

  if (!Array.isArray(data)) {
    return res.status(500).send('Invalid data format');
  }

  const roomIndex = data.findIndex(room => room.name.toLowerCase() === name.toLowerCase());
  if (roomIndex === -1) {
    return res.status(404).send('Room not found');
  }

  data.splice(roomIndex, 1);

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
    let data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
    if (!Array.isArray(data)) {
      return res.status(500).send('Invalid data format');
    }
    const roomIndex = data.findIndex(room => room.name === layoutData.name);

    if (roomIndex !== -1) {
      layoutData.tables.forEach((newTable) => {
        const existingTableIndex = data[roomIndex].tables.findIndex(
          (table) => table.name === newTable.name
        );
    
        if (existingTableIndex !== -1) {
          data[roomIndex].tables[existingTableIndex] = newTable;
        } else {
          data[roomIndex].tables.push(newTable);
        }
      });
      data[roomIndex].tables = data[roomIndex].tables.filter((existingTable) =>
        layoutData.tables.some((newTable) => newTable.name === existingTable.name)
      );
      data[roomIndex].name = layoutData.name;
    } else {
      data.push(layoutData);
    }
    
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    res.status(200).send('Data saved successfully');
  } catch (error) {
    console.error('Error saving data file:', error);
    res.status(500).send('Failed to save data');
  }
});

app.get('/api/layout', (req, res) => {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
    console.log('Data file loaded:', data);
  } catch (error) {
    console.error('Error loading data file:', error);
    return res.status(500).send('Failed to load data');
  }
  if (!Array.isArray(data)) {
    return res.status(500).send('Invalid data format');
  }
  res.json(data);
});

app.post('/api/room', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).send("Room name is required");
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
  } catch (error) {
    console.error('Error loading data file:', error);
    return res.status(500).send('Failed to load data');
  }
  if (!Array.isArray(data)) {
    return res.status(500).send('Invalid data format');
  }

  const roomExists = data.some(room => room.name.toLowerCase() === name.toLowerCase());
  if (roomExists) {
    return res.status(409).send('Room with this name already exists');
  }

  const newRoom = {
    id: Date.now().toString(),  
    name,
    tables: [] 
  };

  data.push(newRoom);

  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    res.status(201).json(newRoom); 
  } catch (error) {
    console.error('Error saving data file:', error);
    res.status(500).send('Failed to save new room');
  }
});

app.get('/api/layout', (req, res) => {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
    console.log('Data file loaded:', data);
  } catch (error) {
    console.error('Error loading data file:', error);
    return res.status(500).send('Failed to load data');
  }

  if (!Array.isArray(data)) {
    return res.status(500).send('Invalid data format');
  }

  res.json(data);
});


app.put('/api/layout', (req, res) => {
  const layoutData = req.body;

  try {
    let data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
    if (!Array.isArray(data)) {
      return res.status(500).send('Invalid data format');
    }
    const roomIndex = data.findIndex(room => room.name === layoutData.name);

    if (roomIndex !== -1) {
      layoutData.tables.forEach(newTable => {
        const existingTableIndex = data[roomIndex].tables.findIndex(
          table => table.name === newTable.name
        );

        if (existingTableIndex !== -1) {
          data[roomIndex].tables[existingTableIndex] = newTable;
        } else {
          data[roomIndex].tables.push(newTable);
        }
      });
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
