#include <Arduino.h>
#include <stdlib.h>
#include <string.h>
#include <Ethernet.h>
#include <SPI.h>

byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };//Ponemos la dirección MAC de la Ethernet Shield
IPAddress ip(192,168,1,177); //Asignamos  la IP al Arduino
EthernetServer server(80);

String dato;
String tipo;
String segundos;

void setup() {
  Serial.begin(9600);
  Ethernet.begin(mac, ip);
  server.begin();

  pinMode(2, OUTPUT);
}

void loop() { 
  EthernetClient client = server.available();

  if(client) {
    while(client.connected()) {
      if(client.available()) {
        char c = client.read();//Leemos la petición HTTP carácter por carácter
        Serial.write(c);
        while(Serial.available() > 0) {
          
          dato = Serial.readString();

          tipo = dato.charAt(0);
          segundos = dato.charAt(2);

          if(tipo == "A") {
            digitalWrite(2, HIGH);
            _delay_ms(1000);
            digitalWrite(2, LOW);
          }
        }
      }
    }

    client.println("HTTP/1.1 200 OK");
        client.println("Content-Type: text/html");
        client.println();

        //Página web en formato HTML
        client.println("<html>");                 
        client.println("<head><title>Naylamp Mechatronics</title>");
        client.println("</head>");
        client.println("<body>"); 
        client.println(">");          
        client.println("</body>");
        client.println("</html>");
  }
}