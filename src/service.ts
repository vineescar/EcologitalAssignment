import axios from 'axios';

const backendUrl = 'http://localhost:4000';

// Create an Axios instance for reusability
const axiosInstance = axios.create({
  baseURL: backendUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to get room layout by room name
export const getRoomLayout = (roomName: string) =>
  axiosInstance.get(`/api/layout/${roomName}`);

// Function to delete a room by room name
export const deleteRoom = (roomName: string) =>
  axiosInstance.delete(`/api/layout/${roomName}`);

// Function to save room layout
export const saveRoomLayout = (room: any) =>
  axiosInstance.post(`/api/layout`, room);
