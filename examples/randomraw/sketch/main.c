#include <HardwareSerial.h>
#include <LiquidCrystal.h>

// initialize the library with the numbers of the interface pins
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);


void setup() {
  lcd.begin(16, 2);
  lcd.print(".");  
  lcd.setCursor(0, 1);
  Serial.begin(9600);
  lcd.clear();
  lcd.setCursor(16,1);
  lcd.autoscroll();
}

void loop() {
  if (Serial.available() > 0) {    
    lcd.print(Serial.read());
  }
  delay(50);
}
 