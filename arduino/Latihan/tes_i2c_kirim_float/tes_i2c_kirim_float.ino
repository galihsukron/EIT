#include <Wire.h>

#define SLAVE_ADDRESS 0x04

#define FLOATS_SENT 1

float temperature = 10.501;
float luminosity = 5.2;
float data[FLOATS_SENT];

void setup() {
    pinMode(13, OUTPUT);
    Serial.begin(9600);

    data[0] = temperature;
    data[1] = luminosity;
    
    // initialize i2c as slave
    Wire.begin(SLAVE_ADDRESS);

    // define callbacks for i2c communication
    Wire.onRequest(sendData);
}

void loop() {
    delay(100);
}

void sendData(){
  Wire.write((byte*) &data, 2*sizeof(float));
}
