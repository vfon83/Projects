import matplotlib.pyplot as plt
import numpy as np
import serial
import time

# Initialize the figure and axes
fig, axs = plt.subplots(1, 2, figsize=(12, 6))
fig.suptitle('Electric Field', fontsize=40)

# Initialize the colorbar
cbar = None

def update_plot(E_voltages):    
    # Check if the figure has been closed
    if not plt.fignum_exists(fig.number):
        return False

    # Calculate the average of each 2x2 sub-array
    E_averages = np.mean(
        np.array([
            [E_voltages[i:i+2, j:j+2] for j in range(0, E_voltages.shape[1]-1)]
            for i in range(0, E_voltages.shape[0]-1)
        ]),
        axis=(2, 3)
    )

    # Calculate Ex, Ey, and E_magnitude
    delta_x = 1
    delta_y = 1

    # Calculate Ex and Ey components
    Ex = -1 * np.diff(E_voltages, axis=1) / delta_x
    Ey = -1 * np.diff(E_voltages, axis=0) / delta_y

    # Remove the Ex extra row and Ey extra column
    Ex = Ex[:-1]
    Ey = Ey[:, :-1]

    # Calculate the magnitude
    E_magnitude = np.sqrt(Ex**2 + Ey**2)
    
    # Add a small epsilon value to avoid division by zero
    epsilon = 1e-10  # A very small value
    E_magnitude += epsilon

    # Calculate the unit vector of the Ex and Ey (Ex or Ey / E_magnitude)
    Ex_normalized = Ex / E_magnitude
    Ey_normalized = Ey / E_magnitude
    
    # Create meshgrid for the plot
    x = np.arange(Ex.shape[1])
    y = np.arange(Ex.shape[0])
    X, Y = np.meshgrid(x, y)

    # Clear previous plots and remove previous colorbar if it exists
    axs[0].cla()
    axs[1].cla()
        
    # First subplot (Unit Vector Field)
    axs[0].quiver(X, Y, Ex_normalized, Ey_normalized, scale_units='xy', scale=1, color='b')
    axs[0].set_title('UNIT VECTOR', fontsize=17)
    axs[0].set_xlabel('x')
    axs[0].set_ylabel('y')
    axs[0].set_xlim(-1, X.max() + 1)
    axs[0].set_ylim(-1, Y.max() + 1)
    axs[0].grid(True)

    # Second subplot (Stream Field)
    stream_plot = axs[1].streamplot(X, Y, Ex_normalized, Ey_normalized, density=1, linewidth=3.5, arrowsize=3, color=E_averages, cmap='gist_heat_r')
    axs[1].set_title('Stream Field', fontsize=17)
    axs[1].set_xlabel('x')
    axs[1].set_ylabel('y')
    axs[1].grid(True)
    
    # Check if colorbar (cbar) has been initialized
    global cbar
    if cbar is None:
        cbar = plt.colorbar(stream_plot.lines, ax=axs[1], shrink=.7)
        cbar.set_label('Electric Potential (V)', fontsize=12, weight='bold')
    else:
        cbar.update_normal(stream_plot.lines)

    plt.tight_layout()

    # Indicate that the plot window is still open
    return True

def start_connection():
    # Set up the serial connection
    port = "COM5"
    baudrate = 9600
    ser = serial.Serial(port, baudrate, timeout=1)
    time.sleep(2)
    print("Starting...")

    # Variable to track the number of readings
    readings_count = 0

    # Flag to indicate if the "Start" message has been received
    start_received = False

    try:
        while True:
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8', errors='ignore').strip()

                # Check for the "Start" message
                if line == "Start":
                    start_received = True
                    # Initialize E_voltages array
                    E_voltages = np.zeros((6, 6))

                # Proceed only if the "Start" message has been received
                if start_received:
                    if line.startswith("Mux:"):
                        parts = line.split()
                        mux = int(parts[1])
                        channel = int(parts[3])
                        
                    elif line.startswith("Current Voltage:"):
                        voltage = float(line.split()[2])
                        # Map mux and channel to indices in the 6x6 matrix
                        row = mux * 2 + channel // 6
                        col = channel % 6
                        E_voltages[row][col] = voltage
                        readings_count += 1
                        print(f"Reading {readings_count}: Mux {mux}, Channel {channel}, Voltage {voltage}")

                    # Update the plot with new data if desired number of readings are captured
                    if readings_count >= 36:
                        # Update the plot with new data
                        if not update_plot(E_voltages):
                            # Exit the loop if the plot window is closed
                            break
                        # Pause to allow the plot to update
                        plt.pause(2)
                        readings_count = 0
                        print("All readings captured.")
                        print(E_voltages)
                        continue

    except KeyboardInterrupt:
        print("***Program stopped manually***")
    finally:
        # Ensure serial port and graphical plot is closed on exit
        ser.close()
        plt.close(fig)
        print("Plot window closed.")

start_connection()