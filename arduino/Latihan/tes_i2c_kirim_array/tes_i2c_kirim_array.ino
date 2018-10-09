#include <Wire.h>

#define SLAVE_ADDRESS 0x04

#define FLOATS_SENT 8 //maksimal yg bisa dikirim adl 8 data

float temperature = 10.501;
float luminosity = 5.2;
float data[FLOATS_SENT];

void setup() {
    pinMode(13, OUTPUT);
    Serial.begin(9600);

    for(int k=0;k<FLOATS_SENT;k++){
      data[k] = 5.333;
    }
    
    
    // initialize i2c as slave
    Wire.begin(SLAVE_ADDRESS);

    // define callbacks for i2c communication
    Wire.onRequest(sendData);
}

void loop() {
    delay(100);
}

void sendData(){
  Serial.println(data[FLOATS_SENT-1]);
  Wire.write((byte*) &data, FLOATS_SENT*sizeof(float));
}
