import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RoomPage from '../components/RoomPage';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RoomPage Component', () => {
  const mockRoomData = {
    id: '1',
    name: 'Room 1',
    tables: [
      {
        id: '1',
        src: 'table1.png',
        x: 100,
        y: 200,
        name: 'Table 1',
        min: 2,
        max: 6,
        online: true,
        rotation: 0,
      },
    ],
  };

  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({ data: mockRoomData });
  });

  it('renders the RoomPage component', async () => {
    render(
      <BrowserRouter>
        <RoomPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Drag the Table/i)).toBeInTheDocument();

    expect(await screen.findByText(/Room 1/i)).toBeInTheDocument();
  });

  it('handles image drag and drop', async () => {
    render(
      <BrowserRouter>
        <RoomPage />
      </BrowserRouter>
    );

    const dropArea = screen.getByText(/Drag the Image/i);

    const image = new Image();
    image.src = 'image.png';
    const dragEvent = {
      dataTransfer: {
        getData: jest.fn(() => 'image.png'),
        setData: jest.fn(),
      },
    };

    fireEvent.dragStart(image, dragEvent);
    fireEvent.drop(dropArea, dragEvent);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('displays error when overlapping images are dropped', async () => {
    render(
      <BrowserRouter>
        <RoomPage />
      </BrowserRouter>
    );

    const dropArea = screen.getByText(/Drag the Image/i);

    const dragEvent = {
      dataTransfer: {
        getData: jest.fn(() => 'table1.png'),
      },
    };

    fireEvent.dragStart(dropArea, dragEvent);
    fireEvent.drop(dropArea, dragEvent);

    expect(await screen.findByText(/Cannot drop an image/i)).toBeInTheDocument();
  });

  it('deletes a room and navigates to home', async () => {
    mockedAxios.delete.mockResolvedValue({});

    const { getByText } = render(
      <BrowserRouter>
        <RoomPage />
      </BrowserRouter>
    );

    jest.spyOn(window, 'confirm').mockImplementation(() => true);

    expect(await screen.findByText(/Room deleted successfully/i)).toBeInTheDocument();
  });
});
