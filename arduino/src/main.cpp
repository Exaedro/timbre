#include <Arduino.h>
#include <stdlib.h>
#include <string.h>
#include <Ethernet.h>
#include <SPI.h>

// byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };//Ponemos la dirección MAC de la Ethernet Shield
// IPAddress ip(192,168,1,177); //Asignamos  la IP al Arduino
// EthernetServer server(80);

int segundos;
int LED_VERDE = 5;
int LED_ROJO = 7;

void encenderTimbre(int secs);

void setup() {
  Serial.begin(9600);
  // Ethernet.begin(mac, ip);
  // server.begin();

  pinMode(LED_VERDE, OUTPUT);
  pinMode(LED_ROJO, OUTPUT);
}

void loop() { 
  // EthernetClient client = server.available();
  digitalWrite(LED_ROJO, HIGH);

  while(Serial.available() > 0) {        
    digitalWrite(LED_ROJO, LOW);

    segundos = Serial.readString().toInt();

    encenderTimbre(segundos);
  }
}

void encenderTimbre(int secs) {
  digitalWrite(LED_VERDE, HIGH);
  delay(secs * 1000);
  digitalWrite(LED_VERDE, LOW);
} 