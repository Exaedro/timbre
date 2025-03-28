#include <Arduino.h>
#include <stdlib.h>
#include <string.h>
#include <Ethernet.h>
#include <SPI.h>

byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };//Ponemos la dirección MAC de la Ethernet Shield
IPAddress ip(192,168,1,177); //Asignamos  la IP al Arduino
EthernetServer server(80);

int segundos;
int LED_VERDE = 5;
int LED_ROJO = 7;

void encenderTimbre(int secs);

void setup() {
  Serial.begin(9600);
  Ethernet.begin(mac, ip);
  server.begin();

  pinMode(LED_VERDE, OUTPUT);
  pinMode(LED_ROJO, OUTPUT);
}

void loop() { 
  EthernetClient client = server.available();

  if(client) {
    boolean currentLineIsBlank = true;

    while(client.connected()) {
      if(client.available()) {
        char c = client.read();
        Serial.write(c);

        if (c == 'n' && currentLineIsBlank) {
  
            // Enviamos al cliente una respuesta HTTP
            client.println("HTTP/1.1 200 OK");
            client.println("Content-Type: text/html");
            client.println();

            //Página web en formato HTML
            client.println("<html>");                 
            client.println("<head><title>Naylamp Mechatronics</title>");
            client.println("</head>");
            client.println("<body>");
            client.println("<div style='text-align:center;'>");
            client.println("<h1>NAYLAMP MECHATRONICS</h1>");
            client.println("<h2>Entradas Analogicas</h2>");
            client.print("AN0="); client.println(analogRead(0));
            client.print("<br />AN1=");client.println(analogRead(1)); 
            client.println("<h2>Entradas Digitales</h2>");
            client.print("D4=");client.println(digitalRead(4));
            client.println("<br />D5=");client.print(digitalRead(5));
            client.println("<br /><br />");
            client.println("<a href='http://192.168.1.177'>Actualizar entradas</a>");
            client.println("<h2>Salidas Digitales </h2>");        
            client.println("Estado del LED 1 = ");/*client.print(estado1);*/            
            client.println("<br />");            
            client.print("<button onClick=location.href='./?Data=1'>ON</button>");           
            client.print("<button onClick=location.href='./?Data=2'>OFF</button>");
            client.println("<br /><br />");
            client.println("Estado del LED 2 = ");/*client.print(estado2);   */         
            client.println("<br />");            
            client.print("<button onClick=location.href='./?Data=3'>ON</button>");           
            client.print("<button onClick=location.href='./?Data=4'>OFF</button>");
            client.println("<br /><br />");
            client.println("<a href='https://naylampmechatronics.com/'>naylampmechatronics.com</a>");
            client.println("<br /><br />");             
            client.println("</b></body>");
            client.println("</html>");
            break;
        }
        if (c == 'n') {
          currentLineIsBlank = true;
        }
        else if (c != 'r') {
          currentLineIsBlank = false;
        }
      }
       delay(1);
    client.stop();
    }
  }

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