





/* /////////////////////////////////// LIBRERIAS ////////////////////////////////////////////// */

#include <Arduino.h>
#include <stdlib.h>
#include <string.h>
#include <Ethernet.h>
#include <Wire.h>
#include <RTClib.h>
#include <SPI.h>
#include <SD.h>

/* /////////////////////////////////// VARIABLES ////////////////////////////////////////////// */

int led_verde = 7;
int led_rojo = 5;
int estado_led_rojo = 0;
int led_amarillo = 3;

int pin_sd = 4;
int pin_ethernet = 10;

int contador_backup = 0;
int contador_backup_limite = 10; // 900 segundos (15 minutos)
bool realizar_backup = false;
int estado_backup = 0;

bool timbre_encendido = false; // Indica si el timbre esta sonando
bool timbre_activo = true; // Indica si el timbre esta activado (por ejemplo los sabados y los domingos no esta activado)
bool dia_apagado = false;
int contador_timer = 0;
int contador_timer_limite = 0;

unsigned long millisPrevios = 0;  
const unsigned long intervalo = 1000;

// RTC 
RTC_DS3231 rtc;
char dias_semana[7][12] = {"Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"};

// API
int puerto_api = 4000; 
char api_ip[] = "3.131.83.33"; 
String endpoints[] = {
  "/timbre/exportar/horarios", 
  "/timbre/exportar/eventos",
  "/timbre/exportar/apagado"
};

int api_intentos_limite = 5; // Limite de peticiones para conectarse a la API.
int api_intentos = 0; // Contador de peticiones a la API
bool api_error_led = false; // LED para indicar por si no se pudo conectar a la API

// Arduino
IPAddress ip(0, 0, 0, 0); // IP del Arduino
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
IPAddress dns(192, 168, 0, 1);

EthernetClient client;

/* /////////////////////////////////// FUNCIONES ////////////////////////////////////////////// */

void inicializarEthernet();
void inicializarSD();
void inicializarRTC();

void activarSD();
void activarEthernet();

void backup(String endpoint);
void reconectar_api();
bool es_hora(String linea);
String extraer_nombre(String string);

void timbre();
void encender_timbre(int segundos);
void peticion_http(String endpoint);
void salvar_archivo(String nombreArchivo);

String obtener_hora(DateTime tiempo_ahora);
String obtener_fecha(DateTime tiempo_ahora);  

/* /////////////////////////////////// CODIGO PRINCIPAL /////////////////////////////////// */

void setup() {
  Serial.begin(9600);

  // LEDS
  pinMode(led_amarillo, OUTPUT);
  digitalWrite(led_amarillo, LOW);
  pinMode(led_verde, OUTPUT);
  digitalWrite(led_verde, LOW);
  pinMode(led_rojo, OUTPUT);
  digitalWrite(led_rojo, LOW);

  // MODULOS EXTERNOS
  pinMode(53, OUTPUT);
  pinMode(pin_sd, OUTPUT);
  pinMode(pin_ethernet, OUTPUT);

  digitalWrite(pin_sd, HIGH);
  digitalWrite(pin_ethernet, HIGH);
  
  // RTC
  inicializarRTC();

  delay(1000); // Espera a que inicie

  // CONEXION ETHERNET
  digitalWrite(pin_ethernet, LOW);
  inicializarEthernet();
  digitalWrite(pin_ethernet, HIGH);

  delay(1000); // Espera a que inicie

  // MEMORIA SD
  digitalWrite(pin_sd, LOW);
  inicializarSD();
  digitalWrite(pin_sd, HIGH);

  Serial.println(Ethernet.localIP());
  
  /* //////////// TIMERS ////////// */
  
  // TIMER 1 (1 segundo) 
  TCCR1A = 0;   
  TCCR1B = 0;
  OCR1A = 62499;
  TCCR1B |= (1 << WGM12);
  TCCR1B |= (1 << CS12);
  TIMSK1 |= (1 << OCIE1A);

  // TIMER 3 (100 milisegundos)
  TCCR3A = 0;
  TCCR3B = 0;
  OCR3A = 6249;
  TCCR3B |= (1 << WGM32);   // Modo CTC
  TCCR3B |= (1 << CS32);    // Prescaler 256
  TIMSK3 |= (1 << OCIE3A);

  sei(); 
}

volatile int crdig = 0;

ISR(TIMER1_COMPA_vect) {
  contador_backup++;
  crdig++;

  if(timbre_encendido) {
    contador_timer++;
  }
}

ISR(TIMER3_COMPA_vect) {
  if(api_error_led) {
    estado_led_rojo = !estado_led_rojo;
    digitalWrite(led_rojo, estado_led_rojo);
  }
}

void loop() {
  // Si el tibre esta desactivado, no hacemos nada (Sabados y Domingos)
  if(!timbre_activo) {
    digitalWrite(led_amarillo, HIGH);
    return;
  }

  unsigned long currentMillis = millis();

  if (currentMillis - millisPrevios >= intervalo) {
    millisPrevios = currentMillis;  // Reinicia el contador

    timbre();
  }

  if(contador_timer >= contador_timer_limite) {
    contador_timer = 0;
    timbre_encendido = false;
    digitalWrite(led_verde, LOW);
  }

  if(contador_backup >= contador_backup_limite) {
    int segundo = rtc.now().second();

    if(segundo > 7 && segundo < 45) { 
      realizar_backup = true;
    }
  }

  if(realizar_backup) {
    if(estado_backup == 0) {
      Serial.println("Iniciando backup...");
      Serial.println("-------------------");

      backup(endpoints[0]);

      if(crdig >= 1) {
        estado_backup = 1;
        crdig = 0;
      }
    }

    if(estado_backup == 1) {
      backup(endpoints[1]);
      
      if(crdig >= 1) {
        estado_backup = 2;
        crdig = 0;
      }
    }

    if(estado_backup == 2) {
      backup(endpoints[2]);
      
      if(crdig >= 1) {
        estado_backup = 3;
        crdig = 0;
      }
    }

    if(estado_backup == 3) {
      Serial.println("-----------------");
      Serial.println("Backup terminado.");

      realizar_backup = false;
      estado_backup = 0;
      contador_backup = 0;
    }
  }
}

void timbre() {
  DateTime tiempo_ahora = rtc.now();

  String dia = dias_semana[tiempo_ahora.dayOfTheWeek()];
  String hora = obtener_hora(tiempo_ahora);
  String fecha = obtener_fecha(tiempo_ahora);

  // if(dia == "Domingo" || dia == "Sabado") {
  //   timbre_activo = false;
  //   Serial.println("Hoy es " + dia + " por lo tanto el timbre no estara activo.");
  //   return;
  // }



  String linea;
  String db_fecha;
  String db_hora;
  String db_segundos;

  Serial.println(hora);
  activarSD();
  
  File dias_apagado = SD.open("apagado.txt", FILE_READ);
  
  while(dias_apagado.available()) {
    linea = dias_apagado.readStringUntil('\n');

    db_fecha = linea.substring(0, 10);

    if(db_fecha == fecha) {
      dia_apagado = true;
      break;
    } else {
      dia_apagado = false;
    }
  }
  
  dias_apagado.close();
  
  File eventos = SD.open("eventos.txt", FILE_READ);
  
  while(eventos.available()) {
    if(dia_apagado) {
      return;
    }
    
    linea = eventos.readStringUntil('\n');
    
    db_fecha = linea.substring(0, 10);   
    db_hora = linea.substring(11, 19);
    db_segundos = linea.substring(20, 21); // Tiempos de encendido del timbre

    if(db_fecha == fecha && db_hora == hora) {
      encender_timbre(db_segundos.toInt());
    }
  }
  
  eventos.close();
  
  File horarios = SD.open("horarios.txt", FILE_READ);
  
  while(horarios.available()) {
    if(dia_apagado) {
      return;
    }
    
    linea = horarios.readStringUntil('\n');
    
    db_hora = linea.substring(0, 8);
    db_segundos = linea.substring(9, 10); // Tiempos de encendido del timbre  

    if(db_hora == hora) {
      encender_timbre(db_segundos.toInt());
    }
  }

  horarios.close();
}

void encender_timbre(int segundos) {
  timbre_encendido = true;
  contador_timer_limite = segundos;
  digitalWrite(led_verde, HIGH);
}

void inicializarEthernet() {
  Ethernet.begin(mac);

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

void activarEthernet() {
  digitalWrite(pin_sd, HIGH);
  digitalWrite(pin_ethernet, LOW);
}

void inicializarSD() {
  if(!SD.begin(pin_sd)) {
    Serial.println("Error al inicializar la memoria SD.");
    return;
  } else {
    Serial.println("Memoria SD Inicializada.");
  }
}

void activarSD() {
  digitalWrite(pin_sd, LOW);
  digitalWrite(pin_ethernet, HIGH);
}

void inicializarRTC() {
  Wire.begin();

  if(!rtc.begin()) {
    Serial.println("Error al inicializar el RTC. No se puede encender el timbre.");
    while(1);
  }

  Serial.println("RTC inicializado.");
}

void reconectar_api() {
  
  // api_intentos++;
  
  // if(api_intentos >= api_intentos_limite) {
  //   Serial.println("Se ha alcanzado el limite de intentos para conectar a la API.");
  //   Serial.println("Volviendo a intentar dentro de 15 minutos.");
  //   Serial.println("------------------------------------------");
  //   api_intentos = 0;
  //   api_led = true;
  //   return;
  // }

  // Serial.println("Reconectando...");
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

String obtener_hora(DateTime tiempo_ahora) {
  String hora = String(tiempo_ahora.hour());
  String minuto = String(tiempo_ahora.minute());
  String segundo = String(tiempo_ahora.second());

  hora = hora.length() == 1 ? "0" + hora : hora;
  minuto = minuto.length() == 1 ? "0" + minuto : minuto;
  segundo = segundo.length() == 1 ? "0" + segundo : segundo; 
  
  return hora + ":" + minuto + ":" + segundo;
}

String obtener_fecha(DateTime tiempo_ahora) { 
  String anio = String(tiempo_ahora.year());
  String mes = String(tiempo_ahora.month());
  String dia = String(tiempo_ahora.day());

  mes = mes.length() == 1 ? "0" + mes : mes;
  dia = dia.length() == 1 ? "0" + dia : dia;

  return anio + "/" + mes + "/" + dia;
}

void backup(String endpoint) {
  activarEthernet();

  if(!client.connect(api_ip, puerto_api)) {
    Serial.println("Error intentando conectarse a la API.");
    api_error_led = true;
    return;
  } 
  
  api_error_led = false;
  
  String nombreArchivo = extraer_nombre(endpoint);
  
  peticion_http(endpoint);

  salvar_archivo(nombreArchivo);

  client.stop();
}

void peticion_http(String endpoint) {
  // Peticion a la API
  client.println("GET " + endpoint + " HTTP/1.1");
  client.println("Host: " + String(api_ip) + ":" + puerto_api);
  client.println("Connection: close");
  client.println();
  
  // Eliminamos datos innecesarios de la peticion
  while (client.available()) {
    String headerLine = client.readStringUntil('\n');
    if (headerLine == "\r") {
      break;
    }
  }
}

void salvar_archivo(String nombreArchivo) {
  // Activamos la memoria SD
  activarSD(); 

  // Si el archivo existe, lo borramos para poder actualizarlo
  if(SD.exists(nombreArchivo)) {
    SD.remove(nombreArchivo);
  }
        
  // Creamos el archivo
  File archivo = SD.open(nombreArchivo, FILE_WRITE);

  if(archivo) {
    Serial.println("Archivo " + nombreArchivo + " creado.");
  } else {
    Serial.println("Error al crear archivo " + nombreArchivo + ".");
  }

  while(client.connected() || client.available()) {
    if(client.available()) {
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
// 
