// Set up the pin variables
const byte D2 = 2;
const byte D3 = 3;
const byte D4 = 4;
const byte D5 = 5;
const byte D6 = 6;
const byte D7 = 7;
const byte D8 = 8;
const byte D9 = 9;
const byte D10 = 10;
const byte D11 = 11;
const byte D12 = 12;
const byte D13 = 13;

void setup() {
  // Set up the pins I/O
  pinMode(D2, OUTPUT);
  pinMode(D3, OUTPUT);
  pinMode(D4, OUTPUT);
  pinMode(D5, OUTPUT);
  pinMode(D6, OUTPUT);
  pinMode(D7, OUTPUT);
  pinMode(D8, OUTPUT);
  pinMode(D9, OUTPUT);
  pinMode(D10, OUTPUT);
  pinMode(D11, OUTPUT);
  pinMode(D12, OUTPUT);
  pinMode(D13, OUTPUT);
  pinMode(A0, INPUT);
  pinMode(A1, INPUT);
  pinMode(A2, INPUT);

  // Start serial communication with the computer
  Serial.begin(9600);
}

void loop() {
  // Sentinel string to start a new iteration
  Serial.println("Start");
  
  // Iterate through the 3 Multiplexors (0-2) and 12 chanels (0-11) in each
  for (byte mux = 0; mux < 3; mux++) {
    for (byte cha = 0; cha < 12; cha++) {
      // Send the start signal to Python
      delay(50);
      Serial.print("Mux: ");
      Serial.print(mux);
      Serial.print("\tChannel: ");
      Serial.println(cha);
      accessMux(mux, cha);
    }
  }
}

// Funtion to access the 3 multiplexors, each 11 channel, and print the voltage
void accessMux(byte mux, byte channel) {
  switch (mux) {
    case 2:
      digitalWrite(D2, bitRead(channel, 0));
      digitalWrite(D3, bitRead(channel, 1));
      digitalWrite(D4, bitRead(channel, 2));
      digitalWrite(D5, bitRead(channel, 3));
      Serial.print("Current Voltage: ");
      Serial.println((analogRead(A2) * 5.0) / 1023);
      Serial.println();
      break;
    case 1:
      digitalWrite(D6, bitRead(channel, 0));
      digitalWrite(D7, bitRead(channel, 1));
      digitalWrite(D8, bitRead(channel, 2));
      digitalWrite(D9, bitRead(channel, 3));
      Serial.print("Current Voltage: ");
      Serial.println((analogRead(A1) * 5.0) / 1023);
      Serial.println();
      break;
    case 0:
      digitalWrite(D10, bitRead(channel, 0));
      digitalWrite(D11, bitRead(channel, 1));
      digitalWrite(D12, bitRead(channel, 2));
      digitalWrite(D13, bitRead(channel, 3));
      Serial.print("Current Voltage: ");
      Serial.println((analogRead(A0) * 5.0) / 1023);
      Serial.println();
      break;
    default:
      Serial.print("Could not access multiplexor number: ");
      Serial.print(mux);
  }
}
