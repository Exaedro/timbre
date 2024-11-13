#include <Arduino.h>
#include <stdlib.h>
#include <string.h>
#include <Ethernet.h>
#include <SPI.h>

// byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };//Ponemos la dirección MAC de la Ethernet Shield
// IPAddress ip(192,168,1,177); //Asignamos  la IP al Arduino
// EthernetServer server(80);

String dato;
String tipo;
String segundos;

int LED_VERDE = 5;
int LED_ROJO = 7;

void setup() {
  Serial.begin(9600);
  // Ethernet.begin(mac, ip);
  // server.begin();

  pinMode(5, OUTPUT);
  pinMode(7, OUTPUT);
}

void loop() { 
  // EthernetClient client = server.available();
  digitalWrite(LED_ROJO, HIGH);

  while(Serial.available() > 0) {        
    dato = Serial.readString();

    tipo = dato.charAt(0);
    segundos = dato.charAt(2);

    digitalWrite(LED_ROJO, LOW);
    digitalWrite(LED_VERDE, HIGH);

    if(tipo == "A") {
      digitalWrite(2, HIGH);
      _delay_ms(1000);
      digitalWrite(2, LOW);

      // Apagar led
      digitalWrite(LED_VERDE, LOW);
    }
  }
}