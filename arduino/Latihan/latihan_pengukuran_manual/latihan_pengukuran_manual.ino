#include <Wire.h>
#include <Arduino.h>
#define SLAVE_ADDRESS 0x04
#define FLOATS_SENT 208

int index = 0;
int flag_int_to_send_to_PI = 0;
int flag_int_received_from_PI = 0;
float data[FLOATS_SENT];
float volt = 0.0;

//{22,23,24,25},  MUX V1 vPos
//{26,27,28,29},  MUX V2 vNeg
//{30,31,32,33},  MUX I1 aPos
//{34,35,36,37}   MUX I2 aNeg

// init pin multiplexer output
int mux[4][4] = {{22,23,24,25},{26,27,28,29},{30,31,32,33},{34,35,36,37}}; // pin s0,s1,s2,s3 all multiplexer
int ENMux[4] = {38,39,40,41};    // port EN all multiplexer


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
     pinMode(50, OUTPUT);
     Serial.begin(9600);
     flag_int_to_send_to_PI = 1;
}

void loop() {
  cocot();
}

// get voltage measurement
float getVoltage(){
    int value = analogRead(A0);
    Serial.print("A0: "); Serial.println(value);
    float voltage = value*(2.7/1023.0);  //2.7 merupakan tegangan yg dikeluarkan oleh mux ketika switching
    
    return (voltage);
}


void scanEITfull(){
    // init elektroda pertama
    int aPos; // kutub positif arus injeksi
    int aNeg; // kutub negatif arus injeksi
    int vPos; // kutub positif ukur tegangan
    int vNeg; // kutub negatif ukur tegangan

    for(int i=0; i<FLOATS_SENT; i++){
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
        delay(200);
        multiplex(0, vPos);  // multiplexer 0 handle kutub positif tegangan MUX V1
        multiplex(1, vNeg);  // multiplexer 1 handle kutub negatif tegangan MUX V2
        delay(200);
        volt = getVoltage();
        data[i] = volt;
        //Serial.print("Data ke-"); Serial.print(i); Serial.print("; "); Serial.println(volt,5);
        delay(500);
    }
}

void receiveData(int byteCount) {

    while(Wire.available()) {
        flag_int_received_from_PI = Wire.read();

        if(flag_int_received_from_PI == 1) {
            Serial.println("arduino menerima 1, lakukan scanning");
            //for(int i=0; i<FLOATS_SENT; i++){
            //  data[i] = 1.5;
            //}
            //data[0] = 1.5;
            //data[1] = 11.8;
            scanEITfull();
            Serial.println("Selesai scanning");
            Serial.println("kirim jml data ke PI.");
            flag_int_to_send_to_PI = FLOATS_SENT;
        }
        else if (flag_int_received_from_PI == FLOATS_SENT){
            Serial.println("arduino menerima FLOATS_SENT, kirim float ke PI");
            flag_int_to_send_to_PI = 3;
        }
        else if(flag_int_received_from_PI == 9) {
            Serial.println("Reset data.");
            flag_int_to_send_to_PI = 1;
            flag_int_received_from_PI = 0;
            for(int i=0; i<FLOATS_SENT; i++){
              data[i] = 0;
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

    else if(flag_int_to_send_to_PI == FLOATS_SENT) {
        Serial.println("Arduino mengirim jml data ke PI");
        Wire.write(flag_int_to_send_to_PI);
    }
    
    else if(flag_int_to_send_to_PI == 3) {
      if(index < FLOATS_SENT){
        Serial.println(data[index]);
        //Wire.write(data[index]);
        Wire.write((byte*) &data[index], 1*sizeof(float));
        index++;
      }
      else{
        Serial.println("Kirim flag Selesai ke PI. 9");
        flag_int_to_send_to_PI = 9;
        Wire.write(flag_int_to_send_to_PI);
      }
    }

}

// control multiplexer, change decimal to biner
void multiplex(int tipe, int chanel){
    if(tipe == 0){
      Serial.print("MUX V1 active, "); Serial.print("channel "); Serial.print(chanel); Serial.print(" (");
      digitalWrite(mux[tipe][0], 0);
      digitalWrite(mux[tipe][1], 0);
      digitalWrite(mux[tipe][2], 1);
      digitalWrite(mux[tipe][3], 0);  
      Serial.println(")");
    }
    else if(tipe == 1){
      Serial.print("MUX V2 active, "); Serial.print("channel "); Serial.print(chanel); Serial.print(" (");
      digitalWrite(mux[tipe][0], 1);
      digitalWrite(mux[tipe][1], 0);
      digitalWrite(mux[tipe][2], 1);
      digitalWrite(mux[tipe][3], 0);  
      Serial.println(")");
    }
    else if(tipe == 2){
      Serial.print("MUX I1 active, "); Serial.print("channel "); Serial.print(chanel); Serial.print(" (");
      digitalWrite(mux[tipe][0], 1);
      digitalWrite(mux[tipe][1], 0);
      digitalWrite(mux[tipe][2], 0);
      digitalWrite(mux[tipe][3], 0);
      Serial.println(")");
    }
    else if(tipe == 3){
      Serial.print("MUX I2 active, "); Serial.print("channel "); Serial.print(chanel); Serial.print(" (");
      digitalWrite(mux[tipe][0], 0);
      digitalWrite(mux[tipe][1], 1);
      digitalWrite(mux[tipe][2], 0);
      digitalWrite(mux[tipe][3], 0);
      Serial.println(")");
    }

/*    
    int bits;
    for(int i=0;i<4;i++){
        bits = chanel%2;
        chanel =(int) chanel/2;

        Serial.print(bits);
        digitalWrite(mux[tipe][i], bits);
    }
*/    
//    digitalWrite(50, 0);
    
    
    
    delay(500);
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
    vPos = 4;
    vNeg = 5;
    
    multiplex(2, aPos);  // multiplexer 2 handle kutub positif arus injeksi MUX I1
    multiplex(3, aNeg);  // multiplexer 3 handle kutub negatif arus injeksi MUX I2
    

    multiplex(0, vPos);  // multiplexer 0 handle kutub positif tegangan MUX V1
    multiplex(1, vNeg);  // multiplexer 1 handle kutub negatif tegangan MUX V2
//    Serial.println(" ");
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
