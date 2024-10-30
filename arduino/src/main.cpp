#include <Arduino.h>

int dato;

// 65 = A
// 66 = B

int main() {
  sei();
  init();

  Serial.begin(9600);

  DDRD |= 0b00000100;

  while(1){
    while(Serial.available() > 0) {
      if(dato == 65) {
        PORTD |= 0b00000100;
      }

      if(dato == 66) {
        PORTD |= ~0b00000100;
      }
    }
  }
}