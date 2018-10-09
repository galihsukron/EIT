#include <Wire.h>
#include <Arduino.h>
#define SLAVE_ADDRESS 0x04
#define DATA_SIZE 208
#define FLOATS_SENT 8 //maksimal yg bisa dikirim adl 8 data

int index = 0;
int flag_int_to_send_to_PI = 0;
int flag_int_received_from_PI = 0;
float scanned[DATA_SIZE];
float volt = 0.0;
int nilai = 1;
float data[FLOATS_SENT];

//{22,23,24,25},  MUX V1 vPos
//{26,27,28,29},  MUX V2 vNeg
//{30,31,32,33},  MUX I1 aPos
//{34,35,36,37}   MUX I2 aNeg

// init pin multiplexer output
int mux[4][4] = {{22,23,24,25},{26,27,28,29},{30,31,32,33},{34,35,36,37}}; // pin s0,s1,s2,s3 all multiplexer
int ENMux[4] = {52,50,48,46};    // port EN all multiplexer


void setup() {
     Wire.begin(SLAVE_ADDRESS);
     Wire.onReceive(receiveData);
     Wire.onRequest(sendData);

     for(int k=0;k<4;k++){
        for(int l=0;l<4;l++){
            pinMode(mux[k][l], OUTPUT);
        }
        digitalWrite(ENMux[k],LOW);
     }
     
     Serial.begin(9600);
     flag_int_to_send_to_PI = 1;
}

void loop() {
  //cocot();
  if (nilai == 1){
    scanEITfull();
    nilai = 0;
  }
}

// get voltage measurement
float getVoltage(){
    int value = analogRead(A0);
    float voltage = value*(2.7/1023.0);  //2.7 merupakan tegangan yg dikeluarkan oleh mux ketika switching
    //Serial.print("volt: "); Serial.println(voltage);
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

void scanEITfull(){
    // init elektroda pertama
    int aPos; // kutub positif arus injeksi
    int aNeg; // kutub negatif arus injeksi
    int vPos; // kutub positif ukur tegangan
    int vNeg; // kutub negatif ukur tegangan

    for(int i=0; i<DATA_SIZE; i++){
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
            //Serial.print("Arus injeksi  aNeg:");Serial.print(aNeg);Serial.print(" ");Serial.print("aPos:");Serial.println(aPos);
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
        delay(200);
        multiplex(0, vPos);  // multiplexer 0 handle kutub positif tegangan MUX V1
        multiplex(1, vNeg);  // multiplexer 1 handle kutub negatif tegangan MUX V2
        delay(200);
        volt = getVoltage();
        scanned[i] = volt;
        Serial.print("Data ke-"); Serial.print(i); Serial.print(": "); Serial.println(volt,5);
        delay(200);
    }
}

void receiveData(int byteCount) {

    while(Wire.available()) {
        flag_int_received_from_PI = Wire.read();

        if(flag_int_received_from_PI == 1) {
            Serial.println("arduino menerima 1, lakukan scanning");
            //for(int i=0; i<DATA_SIZE; i++){
            //  scanned[i] = 1.5;
            //}
            //scanned[0] = 1.5;
            //scanned[1] = 11.8;
            //scanEITfull();
            //cocot2();
            Serial.println("Selesai scanning");
            Serial.println("kirim jml data ke PI.");
            flag_int_to_send_to_PI = DATA_SIZE;
        }
        else if (flag_int_received_from_PI == DATA_SIZE){
            Serial.println("arduino menerima DATA_SIZE, kirim float ke PI");
            flag_int_to_send_to_PI = 3;
        }
        else if(flag_int_received_from_PI == 9) {
            Serial.println("Reset data.");
            flag_int_to_send_to_PI = 1;
            flag_int_received_from_PI = 0;
            for(int i=0; i<DATA_SIZE; i++){
              scanned[i] = 0;
            }
            index = 0;
        }
    }
}

void sendData() {

    if(flag_int_to_send_to_PI == 1) {
        Serial.println("Komunikasi dimulai : mengirim 1 ke PI");
        Wire.write(flag_int_to_send_to_PI);
    }

    else if(flag_int_to_send_to_PI == DATA_SIZE) {
        Serial.println("Arduino mengirim jml data ke PI");
        Wire.write(flag_int_to_send_to_PI);
    }
    
    else if(flag_int_to_send_to_PI == 3) {
      if(index < DATA_SIZE){
        int scanned_idx = index;
        for(int i=0; i<FLOATS_SENT; i++){
          data[i] = scanned[scanned_idx];
          //Serial.println(data[i]);
          scanned_idx++;
        }
        //Serial.println("lalu");
        //Wire.write((byte*) &scanned[index], 1*sizeof(float));
        Wire.write((byte*) &data, FLOATS_SENT*sizeof(float));  //kirim paket, isinya 8 data per paket
        index=index+8;
      }
      else{
        Serial.println("Kirim flag Selesai ke PI. 9");
        flag_int_to_send_to_PI = 9;
        Wire.write(flag_int_to_send_to_PI);
      }
    }

}

void cocot2(){
  for(int i=0; i<DATA_SIZE; i++){
    scanned[i] = 0.5;
    delay(200);
    //Serial.println(scanned[i]);
  }
    
  scanned[0] = 1.0;
  scanned[207] = 1.1;
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
    Serial.println(volt);
    delay(500);
}

//{22,23,24,25},  MUX V1 vPos 1100
//{26,27,28,29},  MUX V2 vNeg 0010
//{30,31,32,33},  MUX I1 aPos 0100
//{34,35,36,37}   MUX I2 aNeg 1000
/*
Mux:30 bits:0
Mux:31 bits:1
Mux:32 bits:0
Mux:33 bits:0

Mux:34 bits:1
Mux:35 bits:0
Mux:36 bits:0
Mux:37 bits:0

Mux:22 bits:1
Mux:23 bits:1
Mux:24 bits:0
Mux:25 bits:0

Mux:26 bits:0
Mux:27 bits:0
Mux:28 bits:1
Mux:29 bits:0
*/
