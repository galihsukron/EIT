/**
 * This example demonstrates how to write digital signals
 * It assumes there are LEDs+resistors with the positive lead of the LEDs
 * connected to the 16 channels of the 74HC4067 mux/demux, respectively
 * 
 * For more about the interface of the library go to
 * https://github.com/pAIgn10/MUX74HC4067
 */

#include "MUX74HC4067.h"

// Creates a MUX74HC4067 instance
// 1st argument is the Arduino PIN to which the EN pin connects
// 2nd-5th arguments are the Arduino PINs to which the S0-S3 pins connect
MUX74HC4067 mux(52, 34, 35, 36, 37);
MUX74HC4067 mux2(50, 30, 31, 32, 33);
MUX74HC4067 mux3(48, 26, 27, 28, 29);
MUX74HC4067 mux4(46, 22, 23, 24, 25);

void setup()
{
  // Configures how the SIG pin will be interfaced
  // e.g. The SIG pin connects to PIN 3 on the Arduino,
  //      and PIN 3 is a Digital Output
  mux.signalPin(53, OUTPUT, DIGITAL);
  mux2.signalPin(51, INPUT, DIGITAL);
  mux3.signalPin(49, OUTPUT, DIGITAL);
  mux4.signalPin(47, OUTPUT, DIGITAL);
}

// Writes to the 16 channels a HIGH value, one after the other
void loop()
{
  /*
  for (byte i = 0; i < 16; ++i)
  {
    // Connects to channel i and writes HIGH
    mux.write(i, HIGH);
    delay(25);
  }
  */

  mux.write(0, HIGH);
  
  mux2.write(4, LOW);
  delay(500);
  mux.disable();  // Disconnects the SIG pin from any channe
  mux2.disable();  // Disconnects the SIG pin from any channe


  /* LED BIASA
  
  mux.write(0, HIGH);
  delay(500);
  mux.disable();  // Disconnects the SIG pin from any channel
  
  mux2.write(1, HIGH);
  delay(500);
  mux2.disable();  // Disconnects the SIG pin from any channel
  
  mux3.write(4, HIGH);
  delay(500);
  mux3.disable();  // Disconnects the SIG pin from any channel

  mux4.write(5, HIGH);
  delay(500);
  mux4.disable();  // Disconnects the SIG pin from any channel
  */
  delay(1000);
}

