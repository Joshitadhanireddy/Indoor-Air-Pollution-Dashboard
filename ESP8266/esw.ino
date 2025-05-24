#include <ESP8266WiFi.h>
#include <SDS011.h>
#include <Wire.h>
#include <Adafruit_AHTX0.h>
#include "secrets.h"  // Contains WiFi credentials and ThingSpeak API Key
#include "ThingSpeak.h" // ThingSpeak library

// SDS011 Sensor Pin Configuration
const int SDS_TX = D5;  // SDS011 RX2
const int SDS_RX = D6 ;  // SDS011 TX2
SDS011 mySDS;
float pm25, pm10;

// CO2 Sensor Pin Configuration
const int CO2_PIN = D7; 
unsigned long th, tl;
int ppm;

// AHT10 Sensor (Temperature and Humidity)
Adafruit_AHTX0 aht;

WiFiClient client;  // For WiFi communication

// ThingSpeak Channel Configuration
unsigned long myChannelNumber = SECRET_CH_ID; // Channel ID from secrets.h
const char * myWriteAPIKey = SECRET_WRITE_APIKEY; // Write API key from secrets.h

void setup() {
  // Initialize serial communication
  Serial.begin(115200);

  // SDS011 Sensor Initialization
  mySDS.begin(SDS_TX, SDS_RX);
  Serial.println("SDS011 Air Quality Sensor is starting...");

  // CO2 Sensor Initialization
  pinMode(CO2_PIN, INPUT);
  Serial.println("CO2 Sensor initialized.");

  // AHT10 Sensor Initialization
  if (!aht.begin()) {
    Serial.println("Could not find AHT10 sensor. Check wiring.");
    while (1);  // Halt if the sensor isn't found
  }
  Serial.println("AHT10 sensor initialized successfully.");

  // Initialize WiFi in station mode
  WiFi.mode(WIFI_STA);

  // Initialize ThingSpeak
  ThingSpeak.begin(client);
}

void loop() {
  // Ensure connection to WiFi
   Serial.begin(115200);

  // Initialize WiFi in station mode
  WiFi.mode(WIFI_STA);
  WiFi.begin(SECRET_SSID, SECRET_PASS);

  Serial.print("Connecting to WiFi...");
  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);  // Increase delay between retries
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nConnected to WiFi!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nFailed to connect to WiFi.");
  }
  // SDS011: Read PM2.5 and PM10 levels
  int error = mySDS.read(&pm25, &pm10);
  if (!error) {
    Serial.print("PM2.5: ");
    Serial.print(pm25);
    Serial.print(" µg/m³, PM10: ");
    Serial.print(pm10);
    Serial.println(" µg/m³");

    // Send PM2.5 and PM10 data to ThingSpeak
    ThingSpeak.setField(3, pm25);  // PM2.5 -> Field 1
    ThingSpeak.setField(4, pm10);  // PM10 -> Field 2
  } else {
    Serial.println("Error reading from the SDS011 sensor.");
  }

  // CO2: Read CO2 concentration
  th = pulseIn(CO2_PIN, HIGH, 2008000) / 1000;
  tl = 1004 - th;
  ppm = 2000 * (th - 2) / (th + tl - 4);
  Serial.print("CO2 Concentration: ");
  Serial.print(ppm);
  Serial.println(" ppm");

  // Send CO2 data to ThingSpeak
  ThingSpeak.setField(5, ppm);  // CO2 -> Field 3

  // AHT10: Read temperature and humidity
  sensors_event_t humidity, temp;
  aht.getEvent(&humidity, &temp);

  Serial.print("Temperature: ");
  Serial.print(temp.temperature);
  Serial.println(" °C");

  Serial.print("Humidity: ");
  Serial.print(humidity.relative_humidity);
  Serial.println(" %");

  // Send temperature and humidity data to ThingSpeak
  ThingSpeak.setField(1, temp.temperature);          // Temperature -> Field 4
  ThingSpeak.setField(2, humidity.relative_humidity); // Humidity -> Field 5

  // Optionally, set a status message
  String statusMsg = "Environmental data updated.";
  ThingSpeak.setStatus(statusMsg);

  // Write data to ThingSpeak
  int x = ThingSpeak.writeFields(myChannelNumber, myWriteAPIKey);
  if (x == 200) {
    Serial.println("Channel update successful.");
  } else {
    Serial.println("Problem updating channel. HTTP error code: " + String(x));
  }

  // Delay before next update (6 seconds)
  delay(40000);
}
