/*
 *  Mikon -> Arduino MEGA
 */

#include <Wire.h>
//#include "MUX74HC4067.h"

#define SLAVE_ADDRESS 0x04

int dataDiterima = 0;
int dataTerkirim = 0;

double temp;
int sens;
int kirimData;

//{22,23,24,25},  MUX V1
//{26,27,28,29},  MUX V2
//{30,31,32,33},  MUX I1
//{34,35,36,37}   MUX I2

// init pin multiplexer output
int mux[4][4] = {{22,23,24,25},{26,27,28,29},{30,31,32,33},{34,35,36,37}}; // pin s0,s1,s2,s3 all multiplexer
int ENMux[4] = {38,39,40,41};    // port EN all multiplexer
//MUX74HC4067 mux0(38, 22, 23, 24, 25); // EN, S0, S1, S2, S3
//MUX74HC4067 mux1(39, 26, 27, 28, 29); // EN, S0, S1, S2, S3
//MUX74HC4067 mux2(40, 30, 31, 32, 33); // EN, S0, S1, S2, S3
//MUX74HC4067 mux3(41, 34, 35, 36, 37); // EN, S0, S1, S2, S3

float volt = 0.0;

void setup() {
    Serial.begin(9600);
    while(!Serial) ;
    for(int k=0;k<4;k++){
        for(int l=0;l<4;l++){
            pinMode(mux[k][l], OUTPUT);
        }
        digitalWrite(ENMux[k],LOW);
    }
//    mux1.signalPin(A0, INPUT, ANALOG); // vPos

    // Communication dgn Raspi
    // initialize i2c as slave
    Wire.begin(SLAVE_ADDRESS);

    // define callbacks for i2c communication
    Wire.onReceive(receiveData);
    Wire.onRequest(sendData);
}

// receive data dari raspberry pi
void receiveData(int byteCount){
    while(Wire.available()) {
        dataDiterima = Wire.read();
        Serial.print("Data yang diterima dari raspi = ");Serial.print(dataDiterima);

        if (dataDiterima == 1){
            kirimData = getVoltage();
        }
        else if(dataDiterima == 2){
            kirimData = dataDiterima*1000;
        }

        Serial.print("\t Data yang dikirim ke raspi = ");Serial.println(kirimData);
        dataTerkirim = kirimData;
    }
}

// send data ke raspberry pi
void sendData(){
    Wire.write(dataTerkirim);
}

// Get the internal temperature of the arduino
double GetTemp(void){
    unsigned int wADC;
    double t;
    ADMUX = (_BV(REFS1) | _BV(REFS0) | _BV(MUX3));
    ADCSRA |= _BV(ADEN); // enable the ADC
    delay(20); // wait for voltages to become stable.
    ADCSRA |= _BV(ADSC); // Start the ADC
    while (bit_is_set(ADCSRA,ADSC));
    wADC = ADCW;
    t = (wADC - 324.31 ) / 1.22;
    return (t);
}

// -------------------------------------- EIT SECTION ---------------------------------------------

// get full data EIT (matrix 16x13 = 208 data), metode tetangga
void scanEITfull(){
    // init elektroda pertama
    int aPos; // kutub positif arus injeksi
    int aNeg; // kutub negatif arus injeksi
    int vPos; // kutub positif ukur tegangan
    int vNeg; // kutub negatif ukur tegangan

    for(int i=0; i<208; i++){
        if(i%13==0){
            aNeg=int(i/13);
            aPos=aNeg+1;
            vPos = 0;
            vNeg = vPos+1;
            if(aPos==16) aPos=0;
            if((aNeg==vPos) && (aPos==vNeg)){
                vPos=2;
                vNeg=3;
            }else if((aNeg==vNeg) || (vPos==aPos)) {
                vPos=aPos+1;
                vNeg=vPos+1;
            }
            multiplex(2, aPos);  // multiplexer 2 handle kutub positif arus injeksi MUX I1
            multiplex(3, aNeg);  // multiplexer 3 handle kutub negatif arus injeksi MUX I2
            Serial.print("Arus injeksi  aNeg:");Serial.print(aNeg);Serial.print(" ");Serial.print("aPos:");Serial.println(aPos);
        }else{
            vPos++;
            vNeg=vPos+1;
            if((vNeg==aNeg)) {
                vPos=aPos+1;
                vNeg=vPos+1;
            }
            if(vNeg==16) vNeg=0;
        }
        //Serial.print("Volt  vNeg:");Serial.print(vNeg);Serial.print(" ");Serial.print("vPos:");Serial.println(vPos);
        multiplex(0, vPos);  // multiplexer 0 handle kutub positif tegangan MUX V1
        multiplex(1, vNeg);  // multiplexer 1 handle kutub negatif tegangan MUX V2
        volt = getVoltage();
        Serial.println(volt,5);
        delay(500);
    }
}

// get data volt per baris
void scanEITrow(){
    for (int i = 2; i < 15; i++) { // i = kutub positif tegangan
        delay(2000);
        int j=i+1;                 // j = kutub negatif tegangan
        multiplex(0, i);           // multiplexer 1 handle kutub positif tegangan
        multiplex(1, j);           // multiplexer 2 handle kutub negatif tegangan
        volt = getVoltage();
        //Serial.print(j);Serial.print(" ");Serial.println(i);
        Serial.println(volt,9);
    }
}

// get voltage measurement
float getVoltage(){
    //analogReference(INTERNAL1V1); // voltage reference 1.1 volt buat MEGA
    int value = analogRead(A0);
    //Serial.print("A0="); Serial.println(value);
    //float voltage = (value*1.1)/1023.0;
    float voltage = value*(2.7/1023.0);  //2.7 merupakan tegangan yg dikeluarkan oleh mux ketika switching
    
    return (voltage);
}

// control multiplexer, change decimal to biner
void multiplex(int tipe, int chanel){
    int bits;
    for(int i=0;i<4;i++){
        bits = chanel%2;
        chanel =(int) chanel/2;

        //Serial.print("Mux:");Serial.print(mux[tipe][i]);Serial.print(" ");Serial.print("bits:");Serial.println(bits);
        digitalWrite(mux[tipe][i], bits);
    }
    delay(10);
}

void cocot(){
   // digunakan utk tes pengukuran
   // lepas A0 dari arduino kemudian
   // letakkan probe multimeter pada A0
   // kemudian jalankan fungsi ini, fungsi yg lain ditutup
   
   // init elektroda pertama
    int aPos; // kutub positif arus injeksi
    int aNeg; // kutub negatif arus injeksi
    int vPos; // kutub positif ukur tegangan
    int vNeg; // kutub negatif ukur tegangan

    aPos = 2;
    aNeg = 1;
    vPos = 3;
    vNeg = 4;
    
    multiplex(2, aPos);  // multiplexer 2 handle kutub positif arus injeksi MUX I1
    multiplex(3, aNeg);  // multiplexer 3 handle kutub negatif arus injeksi MUX I2

    multiplex(0, vPos);  // multiplexer 0 handle kutub positif tegangan MUX V1
    multiplex(1, vNeg);  // multiplexer 1 handle kutub negatif tegangan MUX V2
    volt = getVoltage();
    delay(500);
}

// main function
void loop(){
    delay(400);
    scanEITfull();
//    scanEITrow();

    //cocot();
    Serial.println("end data\n");
    delay(4000);
}

/*
 * Agung Dwi Prasetyo
 * G64130073
 * cs.ipb.ac.id
 */
