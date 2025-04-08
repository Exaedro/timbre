





/* /////////////////////////////////// LIBRERIAS ////////////////////////////////////////////// */

#include <Arduino.h>
#include <stdlib.h>
#include <string.h>
#include <Ethernet.h>
#include <EthernetUdp.h>
#include <NTPClient.h>
#include <RTClib.h>
#include <Wire.h>
#include <SPI.h>
#include <SD.h>

/* /////////////////////////////////// VARIABLES ////////////////////////////////////////////// */

int estado = 0;
int led_verde = 7;
int led_rojo = 5;
int pin_sd = 4;
int pin_ethernet = 10;

int contador_backup = 0;
int contador_backup_limite = 60; // 900 segundos (15 minutos)
int contador_timer = 0;
int contador_timer_limite = 60; // 60 segundos (1 minuto)

// unsigned long millisPrevios = 0;  
// const unsigned long intervalo = 1UL * 60UL * 1000UL;

// RTC_DS1307 rtc;

// API
int puerto_api = 3000; 
char api_ip[] = "192.168.100.6"; 
String endpoints[] = {
  "/timbre/exportar/horarios", 
  "/timbre/exportar/eventos",
  "/timbre/exportar/apagado"
};
int api_intentos_limite = 20; // Limite de peticiones para conectarse a la API.
int api_intentos = 0;
bool api_led = false;

// Arduino
IPAddress ip(192,168,100,177); // IP del Arduino
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
IPAddress dns(192, 168, 0, 1);

EthernetClient client;

/* /////////////////////////////////// FUNCIONES ////////////////////////////////////////////// */

void inicializarEthernet();
void inicializarSD();
void inicializarRTC();

void activarSD();
void activarEthernet();

void backup();
void reconectar_api();
bool es_hora(String linea);
String extraer_nombre(String string);

void setup() {
  Serial.begin(9600);

  // LEDS
  pinMode(led_verde, OUTPUT);
  digitalWrite(led_verde, LOW);
  pinMode(led_rojo, OUTPUT);
  digitalWrite(led_rojo, LOW);
  
  // MEMORIA SD
  pinMode(pin_sd, OUTPUT); // Deshabilitar la memoria SD para poder utilizar Ethernet
  inicializarSD();
  digitalWrite(pin_sd, HIGH);
  
  // CONEXION ETHERNET
  pinMode(pin_ethernet, OUTPUT);
  digitalWrite(pin_ethernet, LOW);
  inicializarEthernet();

  // RTC
  // inicializarRTC();
  
  // TIMER
  TCCR1A = 0;   
  TCCR1B = 0;
  OCR1A = 62499;
  TCCR1B |= (1 << WGM12);
  TCCR1B |= (1 << CS12);
  TIMSK1 |= (1 << OCIE1A);
  sei(); 
}

ISR(TIMER1_COMPA_vect) {
  estado = !estado;
  digitalWrite(led_verde, estado);  

  contador_backup++;
}

void loop() { 
  // unsigned long currentMillis = millis();
  // if (currentMillis - millisPrevios >= intervalo) {
  //   millisPrevios = currentMillis;  // Reinicia el contador

  if(contador_backup >= contador_backup_limite) {
    api_led = false;
    contador_backup = 0;
    backup();
  }

  if(api_led) {
    digitalWrite(led_rojo, HIGH);
    delay(100);
    digitalWrite(led_rojo, LOW);
    delay(100);
    digitalWrite(led_rojo, HIGH);
    delay(100);
    digitalWrite(led_rojo, LOW);
    delay(500);
  }

  // }
}

void inicializarEthernet() {
  Ethernet.begin(mac, ip, dns);

  if (Ethernet.hardwareStatus() == EthernetNoHardware) {
    Serial.println("No se encontro el hardware para la conexion por Ethernet. Conecte el hardware y reinicie el Arduino.");
    while (true) {
      delay(1); 
    }
  }
  if (Ethernet.linkStatus() == LinkOFF) {
    Serial.println("El cable Ethernet no esta conectado.");
  }

  Serial.print("Servidor en la IP: ");
  Serial.println(Ethernet.localIP());
}

void inicializarSD() {
  if(!SD.begin(pin_sd)) {
    Serial.println("Error al inicializar la memoria SD.");
    return;
  } else {
    Serial.println("Memoria SD Inicializada.");
  }
}

void inicializarRTC() {
  // if(!rtc.begin()) {
  //   Serial.println("Error al intentar inicializar el RTC.");
  //   return;
  // } 

  // Serial.println("RTC Inicializado.");
}

void backup() {
  Serial.println("Iniciando backup...");
  Serial.println("-------------------");

  int endpointsLength = (sizeof(endpoints) / sizeof(endpoints[0]));
  for(int i = 0;i < endpointsLength; i++) {
    bool reconectar = true;
    activarEthernet();

    while(reconectar != false) {
      
      if(!client.connect(api_ip, puerto_api)) {
        reconectar_api();
      }

      reconectar = false;

      client.println("GET " + endpoints[i] + " HTTP/1.1");
      client.println("Host: " + String(api_ip) + ":" + puerto_api);
      client.println("Connection: close");
      client.println();

      String nombreArchivo = extraer_nombre(endpoints[i]);

      while (client.available()) {
        String headerLine = client.readStringUntil('\n');
        if (headerLine == "\r") {
          break;
        }
      }

      activarSD();

      if(SD.exists(nombreArchivo)) {
        SD.remove(nombreArchivo);
      }
            
      // Base de datos
      File archivo = SD.open(nombreArchivo, FILE_WRITE);

      if(archivo) {
        Serial.println("Archivo " + nombreArchivo + " creado.");
      } else {
        Serial.println("Error al crear archivo " + nombreArchivo + ".");
      }

      while (client.connected() || client.available()) {
        if (client.available()) {
          String linea = client.readStringUntil('\n');
          linea.trim();

          if (linea.length() == 0 || linea.equalsIgnoreCase("b") || (linea.length() <= 2 && linea.toInt() > 0)) {
            continue;
          }

          bool campo_valido = false;
          int startIndex = 0;
          int indexComma = linea.indexOf(',', startIndex);
          while (indexComma != -1) {
            String campo = linea.substring(startIndex, indexComma);
            campo.trim();
            if (es_hora(campo)) {
              campo_valido = true;
              break;
            }
            startIndex = indexComma + 1;
            indexComma = linea.indexOf(',', startIndex);
          }
          if (!campo_valido && startIndex < linea.length()) {
            String campo = linea.substring(startIndex);
            campo.trim();
            if (es_hora(campo)) {
              campo_valido = true;
            }
          }
          
          if (campo_valido) {
            archivo.println(linea);
          }
        }
      }

      archivo.close();
    }
  }

  client.stop();

  Serial.println("-----------------");
  Serial.println("Backup terminado.");
}

void reconectar_api() {
  Serial.println("Error intentando conectarse a la API.");
  api_intentos++;
  
  if(api_intentos >= api_intentos_limite) {
    Serial.println("Se ha alcanzado el limite de intentos para conectar a la API.");
    Serial.println("Volviendo a intentar dentro de 15 minutos.");
    Serial.println("------------------------------------------");
    api_intentos = 0;
    api_led = true;
    return;
  }

  Serial.println("Reconectando...");
  delay(1000);
}

void activarSD() {
  digitalWrite(pin_sd, LOW);
  digitalWrite(pin_ethernet, HIGH);
}

void activarEthernet() {
  digitalWrite(pin_sd, HIGH);
  digitalWrite(pin_ethernet, LOW);
}

String extraer_nombre(String string) {
  int lastSlash = string.lastIndexOf('/');
  String fileName = "";
  if (lastSlash != -1) {
    fileName = String(string.substring(lastSlash + 1) + ".txt");
  }

  return fileName;
}

bool es_hora(String campo) {
  // Se asume que el campo contiene la hora en formato 24 horas ("HH:MM:SS")
  // Verifica que el campo tenga al menos 8 caracteres y los dos puntos en las posiciones correctas.
  campo.trim();
  if (campo.length() < 8) return false;
  if (campo.charAt(2) != ':' || campo.charAt(5) != ':') return false;
  // Opcionalmente se podría validar que los caracteres sean dígitos en posiciones específicas.
  return true;
}

// String formato_hora(String hora12) {
//   // Se asume que la cadena tiene el formato "hh:mm:ssXX"
//   // donde "XX" es "AM" o "PM"
//   String horaStr = hora12.substring(0, 2);
//   String minutos = hora12.substring(3, 5);
//   String segundos = hora12.substring(6, 8);
//   String ampm = hora12.substring(8);  // extrae "AM" o "PM"
  
//   int hora = horaStr.toInt();

//   if (ampm == "PM" && hora < 12) {
//     hora += 12;
//   } else if (ampm == "AM" && hora == 12) {
//     hora = 0;
//   }
  
//   // Formatear la nueva hora a dos dígitos
//   String nuevo_formato = (hora < 10 ? "0" : "") + String(hora) + ":" + minutos + ":" + segundos;
//   return nuevo_formato;
// }
