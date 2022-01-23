int outPos = 0;
char out[] = "                    ";
long lastReading = 0;


void setup()
{
  pinMode(8, OUTPUT);
  pinMode(6, OUTPUT);
  pinMode(7, OUTPUT);
  noTone(8);
  noTone(7);
  noTone(6);
  Serial.begin(9600);
  Serial.println("Register with node red");
  memset(out, 0, 16);
}

void loop()
{
  long diffReading;
  if (Serial.available() > 0) {
    char rx = Serial.read();
    if (rx == 0x2) {
      outPos = 0;
      memset(out, 0, 16);
    } else if (rx == 0x3) {    
      diffReading = atol(out) - lastReading;
      lastReading = atol(out);
      if (diffReading >= 10) {
        tone(6, 880, 100);     
        delay(100); 
      }
      if (diffReading >= 20) {
        tone(7, 988, 100); 
        delay(100); 
      }
      if (diffReading >= 30) {
        tone(8, 1047, 100); 
        delay(100); 
      }
    } else if (outPos < 16) {
      out[outPos++] = rx;
    }
  }
}