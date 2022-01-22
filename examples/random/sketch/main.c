#include <LiquidCrystal.h>

// initialize the library with the numbers of the interface pins
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

void setup() {
  lcd.begin(16, 2);
  lcd.print("hello, world!");  
  lcd.setCursor(0, 1);
  Serial.begin(9600);
  Serial.println("Register with router");  
}

int outPos = 0;
char out[] = "                    ";

void loop() {
  if (Serial.available() > 0) {
    char rx = Serial.read();
    if (rx == '+') {
      lcd.setCursor(0, 1);
      lcd.println(out);
      outPos = 0;
      memset(out, ' ', 16);
    } else if (outPos < 16) {
      out[outPos++] = rx;
    }    
  }
}
 