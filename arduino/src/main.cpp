#include <Arduino.h>
#include <stdlib.h>
#include <string.h>

String dato;
String tipo;
String segundos;

void setup() {
  pinMode(2, OUTPUT);
  Serial.begin(9600);
}

void loop() { 
  while(Serial.available() > 0) {
    dato = Serial.readString();

    tipo = dato.charAt(0);
    segundos = dato.charAt(2);
    int sec = segundos.toInt();

    if(tipo == "A") {
      digitalWrite(2, HIGH);
      _delay_ms(sec);
      digitalWrite(2, LOW);
    }
  }
}