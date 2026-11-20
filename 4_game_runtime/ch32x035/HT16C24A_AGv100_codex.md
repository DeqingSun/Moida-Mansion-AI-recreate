# HT16C24A / HT16C24AG — LCD Driver Controller Datasheet

**Source:** `HT16C24A_AGv100.pdf` · Holtek · Rev. 1.00 · August 26, 2022 · 34 PDF pages

> Conversion note: This file preserves searchable source text with PDF page numbers, plus extracted machine-readable tables and an implementation-oriented index. Complex schematics, waveforms, physical pin diagrams, and flowcharts cannot be encoded reliably as plain Markdown; verify them in the original PDF. Extracted tables are automated and should be cross-checked against the source before electrical or manufacturing decisions.

## Quick reference (from datasheet)

- **Chip:** RAM mapping 72×4, 68×8 or 60×16 LCD controller; 2.4–5.5 V supply. (PDF p. 1)
- **I²C 7-bit slave address:** `0b0111101` = `0x3D`; 8-bit address byte `0x7A` for write or `0x7B` for read. (PDF p. 18)
- **Bus rate:** 100 kHz for VDD 2.4–5.5 V; up to 400 kHz for VDD 3.0–5.5 V. (PDF p. 9)
- **RAM write/read prefix:** command `0x80`, followed by RAM pointer then data bytes. (PDF pp. 19–20)
- **RAM address range:** 72×4: `0x00..0x23` (36 bytes); 68×8: `0x00..0x43` (68 bytes); 60×16: `0x00..0x77` (120 bytes). Pointer wraps to `0x00`. (PDF pp. 10–11, 19–20)
- **Power-on default:** 1/4 duty, 1/3 bias; oscillator off and LCD off; 80 Hz frame rate; blink off. (PDF pp. 10, 20–22)
- **Post-power-on:** avoid I²C transactions for 1 ms following power-on. (PDF p. 10)

### I²C command bytes and bit definitions

| Command byte | Command | Following setting byte | PDF page |
| --- | --- | --- | --- |
| `0x80` | Display RAM read/write | Address pointer `0b0AAAAAAA`, followed by data on write | 20 |
| `0x82` | Drive mode | `Duty1` bit 3, `Bias1` bit 2, `Duty0` bit 1, `Bias0` bit 0 | 20 |
| `0x84` | System mode | `S` bit 1 (oscillator), `E` bit 0 (display) | 21 |
| `0x86` | Frame frequency | `F` bit 0 (0=80 Hz, 1=160 Hz) | 21 |
| `0x88` | Blink | `BK1` bit 1, `BK0` bit 0 (00=off, 01=2 Hz, 10=1 Hz, 11=0.5 Hz) | 21 |
| `0x8A` | Internal Voltage Adjustment (IVA) | `DE` bit 5, `VE` bit 4, `DA3:DA0` bits 3:0 | 22 |

### Drive mode setting (`0x82`)

| Duty1 | Duty0 | Duty mode | Typical bias | RAM address end |
| --- | --- | --- | --- | --- |
| 0 | 0 | 1/4 | 1/3 | `0x23` |
| 0 | 1 | 1/8 | 1/4 | `0x43` |
| 1 | X | 1/16 | 1/5 | `0x77` |

Bias bits independently select `Bias1:Bias0` of `00` = 1/3, `01` = 1/4, `1X` = 1/5 (PDF p. 20).

### Device safety and wiring notes

- Two-wire I²C uses SDA/SCL with typical 4.7 kΩ pull-ups (PDF p. 17).
- If VDD and VLCD are separately powered: turn VDD **on before VLCD**, and VLCD **off before VDD**, regardless of their voltage relationship (PDF p. 24).
- For COG, VCCA2 is connected to VLCD or VDD according to the selected bias-supply arrangement; inspect original p. 4 and p. 22 before PCB layout.
- Shared `SEG71/VLCD` configuration changes whether the last output is SEG71 or a voltage terminal; check IVA `DE` and `VE` settings (PDF p. 22).

## Source text, page by page

### PDF page 1 — Features, Applications, General Description and Selection Table

<!-- source: HT16C24A_AGv100.pdf#page=1 -->

```text
           RAM Mapping 72×4/68×8/60×16
                   LCD Driver Controller

Features                            Applications
• Operating voltage: 2.4V~5.5V                                • Electronic meter
•  Internal 32kHz RC oscillator                                 • Water meter
• Bias: 1/3, 1/4 or 1/5; Duty:1/4, 1/8 or 1/16                  • Gas meter
•  Internal LCD bias generation with voltage-follower        • Heat energy meter
   buffers                                                           • Household appliance
• I2C bus interface                                               • Games
• Two selectable LCD frame frequencies: 80Hz or        • Telephone
  160Hz                                                                      • Consumer electronics
• Up to 60 × 16 bits RAM for display data storage
• Display patterns:
  ♦72×4 patterns: 72 segments and 4 commons      General Description
  ♦68×8 patterns: 68 segments and 8 commons         The HT16C24A/HT16C24AG devices are a memory
                                               mapping and multi-function LCD controller driver.  ♦60×16 patterns: 60 segments and 16 commons
                                          The display segments of the devices are 288
•  Versatile blinking modes                                 patterns (72 segments and 4 commons), 544 patterns
• R/W address auto increment                        (68 segments and 8 commons) or 960 patterns
•  Internal 16-step voltage adjustment to adjust LCD     (60 segments and 16 commons). The software
   operating voltage                                      configuration feature of the devices make it suitable
                                                               for multiple LCD applications including LCD modules• Low power consumption                                                 and display subsystems. The  devices communicate
• Provides the VLCD pin to adjust LCD operating     with most microprocessors/microcontrollers via a
   voltage                                                 two-line bidirectional I2C bus.
• Manufactured in silicon gate CMOS process
• Package types: 64/80-pin LQFP and COG

Selection Table
                            Max. Resolution      LCD    Part No.      VDD                                          Bias       Interface    Package                        Segment × Common    Voltage
HT16C24A                                                                       64/80LQFP
                2.4V~5.5V     72×4, 68×8, 60×16    2.4V~5.5V    1/3, 1/4, 1/5       I2C
HT16C24AG                                                                           Gold Bump
```

#### Extracted table 1 on PDF page 1 (verify layout)

| Part No. | VDD | Max. Resolution Segment × Common | LCD Voltage | Bias | Interface | Package |
| --- | --- | --- | --- | --- | --- | --- |
| HT16C24A | 2.4V~5.5V | 72×4, 68×8, 60×16 | 2.4V~5.5V | 1/3, 1/4, 1/5 | I2C | 64/80LQFP |
| HT16C24AG |  |  |  |  |  | Gold Bump |

### PDF page 2 — Block Diagram

<!-- source: HT16C24A_AGv100.pdf#page=2 -->

```text
Block Diagram

  VSS                              Power-on Reset

                                                                           COM0
                                                     Internal
                             RC Oscillator
  SDA                                                                     Timing             Column /       COM3                       I2C
                                                                    Generator            Segment                     Controller
  SCL                        8                                                                Driver        COM4/SEG0                                            Display RAM                                                                                           Output
                                      60×16 bits

                                                                                     COM15/SEG11
  VDD                                                                 -
                       Internal                  OP4
VCCA2            Voltage                     +
                 Adjustment
                                                                                   SEG12
 VLCD                                                                 -
                                      OP3
                                           +                                                                               Segment
                                                                                                       Driver
                                                                           -                                        Output
                                      OP2         LCD Voltage
                                           +                   Selector

                                                                                   SEG71                                                                           -
                                      OP1
                                           +

                                                                           -
                                      OP0
                                           +

                                      LCD Bias
                                                  Generator
```

> **Visual reference:** Consult original PDF page 2 for diagrams and visual layout.

### PDF page 3 — Pin Assignment

<!-- source: HT16C24A_AGv100.pdf#page=3 -->

```text
Pin Assignment
                                                               VLCDSEG70SEG69SEG68SEG61SEG60SEG59SEG58SEG57SEG56SEG55SEG54SEG53SEG52SEG51SEG50

                                              64 63 62 61 60 59 58 57 56 55 54 53 52 51 50 49
                        VDD   1                                         48
                         SDA   2                                         47
                          SCL   3                                         46
                         VSS   4                                         45
                      COM0   5                                         44
                      COM1   6                                         43
                      COM2   7                                         42
                      COM3   8            HT16C24A               41
                    COM4/SEG0   9             64 LQFP-A              40
                    COM5/SEG1   10                                        39
                    COM6/SEG2   11                                        38
                    COM7/SEG3   12                                        37
                    COM8/SEG4   13                                        36
                    COM9/SEG5   14                                        35
                    COM10/SEG6   15                                        34
                    COM11/SEG7   16                                        33
                                             17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32

                                                         VLCDSEG70SEG69SEG68SEG67SEG66SEG65SEG64SEG63SEG62SEG61SEG60SEG59SEG58SEG57SEG56SEG55SEG54SEG53SEG52

                                         80 79 78 77 76 75 74 73 72 71 70 69 68 67 66 65 64 63 62 61
                      VDD   1                                                 60
                       SDA   2                                                 59
                        SCL   3                                                 58
                       VSS   4                                                 57
                    COM0   5                                                 56
                    COM1   6                                                 55
                    COM2   7                                                 54
                    COM3   8                                                 53
                  COM4/SEG0   9                                                 52
                  COM5/SEG1   10              HT16C24A                   51
                  COM6/SEG2   11                80 LQFP-A                   50
                  COM7/SEG3   12                                                49
                  COM8/SEG4   13                                                48
                  COM9/SEG5   14                                                47
                 COM10/SEG6   15                                                46
                 COM11/SEG7   16                                                45
                 COM12/SEG8   17                                                44
                 COM13/SEG9   18                                                43
                 COM14/SEG10   19                                                42
                 COM15/SEG11   20                                                41
                                         21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40

                Note: 1. Application at VDD ≤ VLCD or VLCD ≤ VDD.
                         2. The VCCA2 pad is internally connected with the VLCD pad.
```

> **Visual reference:** Consult original PDF page 3 for diagrams and visual layout.

### PDF page 4 — Pad Assignment for COG

<!-- source: HT16C24A_AGv100.pdf#page=4 -->

```text
Pad Assignment for COG

      121120 119 118117 116 115 114 113 112 111 110109 108 107 106 105 104 103 102 101 100 99 98 97 96 95 94 93 92 91 90 89 88 87 86 85 84 83 82 81 80 79 78 77 76 75 74 73 72 71 70 69 68 67 66 65 64 63 62 61 60
  1

     2                                                                                                                                                                     59

     3                                                                                                                                                                     58
     4                                                                                                                                                                     57
     5                                                                                                                                                                     56
     6                                                                                                                                                                     55
     7                                                                                                                        (0, 0)                                                                            54
     8                                                                                                                                                                     53
     9                                                                                                                                                                     52
     10                                                                                                                                                                    51
     11                                                                                                                                                                    50
     12                                                                                                                                                                    49
     13                                                                                                                                                                    48
     14                  16  17          18  19      20  21      22  23  24  25  26  27  28  29  30  31  32  33  34  35  36  37  38  39  40  41  42  43  44  45           47
     15                                                                                                                                                                    46

Note:
• VLCD (pad 20) must be connected to VCCA2 (pad 21) in the PCB layout for the application at VDD ≤ VLCD or
  VLCD ≤ VDD.
 Internal Voltage Adjustment (IVA)
          Set Command           VLCD        SEG71                   Note                                   (Pad 20)        (Pad 13)    DE bit        VE bit
       0              0                Input               Null     ●VLCD support internal bias voltage.
                                                                        ●Internal Voltage Adjustment is null
       0              1                Input               Null
                                               ●VLCD support internal bias voltage
       1              0                Input           Output    ●VLCD support internal bias voltage
       1              1                Input           Output    ●VLCD support internal bias voltage

• VDD (pad 18) must be connected to VCCA2 (pad 21) in the PCB layout for the application at VLCD ≤ VDD.

 Internal Voltage Adjustment (IVA)
          Set Command           VLCD        SEG71                   Note                                   (Pad 20)        (Pad 13)    DE bit        VE bit
       0              0                Input               Null     ●VLCD support internal bias voltage.
                                                              ●Detect the internal bias voltage
       0              1             Output              Null
                                             ●VDD support internal bias voltage
       1              0              Floating          Output    ●VDD support internal bias voltage
       1              1              Floating          Output    ●VDD support internal bias voltage

Pad Dimensions for COG

                                                                           Size
       Item                     Number                                                   Unit
                                                    X         Y
 Chip size                —                        3948        1070       μm
 Chip thickness             —                              508            μm
                       1, 3~15, 46~58, 60~121                                60            μm
 Pad pitch
                 16~45                                              87            μm
                             62~120                           40          60        μm
                   Output pad
                                5~13, 48~55                       60          40        μm
                     Input pad     16~21                            67          67        μm
 Bump size
                                       1, 60, 61, 121                      40          60        μm
              Dummy pad    3, 4, 14, 15, 46, 47, 56, 57, 58         60          40        μm
                             22~45                            67          67        μm
 Bump height         All pad                                             18±3           μm
```

#### Extracted table 2 on PDF page 4 (verify layout)

| Internal Voltage Adjustment (IVA) Set Command |  | VLCD (Pad 20) | SEG71 (Pad 13) | Note |
| --- | --- | --- | --- | --- |
| DE bit | VE bit |  |  |  |
| 0 | 0 | Input | Null | ●VLCD support internal bias voltage. |
| 0 | 1 | Input | Null | ●Internal Voltage Adjustment is null ●VLCD support internal bias voltage |
| 1 | 0 | Input | Output | ●VLCD support internal bias voltage |
| 1 | 1 | Input | Output | ●VLCD support internal bias voltage |

#### Extracted table 3 on PDF page 4 (verify layout)

| Internal Voltage Adjustment (IVA) Set Command |  | VLCD (Pad 20) | SEG71 (Pad 13) | Note |
| --- | --- | --- | --- | --- |
| DE bit | VE bit |  |  |  |
| 0 | 0 | Input | Null | ●VLCD support internal bias voltage. |
| 0 | 1 | Output | Null | ●Detect the internal bias voltage ●VDD support internal bias voltage |
| 1 | 0 | Floating | Output | ●VDD support internal bias voltage |
| 1 | 1 | Floating | Output | ●VDD support internal bias voltage |

#### Extracted table 4 on PDF page 4 (verify layout)

| Item | Number |  | Size |  | Unit |
| --- | --- | --- | --- | --- | --- |
|  |  |  | X | Y |  |
| Chip size | — |  | 3948 | 1070 | μm |
| Chip thickness | — |  | 508 |  | μm |
| Pad pitch | 1, 3~15, 46~58, 60~121 |  | 60 |  | μm |
|  | 16~45 |  | 87 |  | μm |
| Bump size | Output pad | 62~120 | 40 | 60 | μm |
|  |  | 5~13, 48~55 | 60 | 40 | μm |
|  | Input pad | 16~21 | 67 | 67 | μm |
|  | Dummy pad | 1, 60, 61, 121 | 40 | 60 | μm |
|  |  | 3, 4, 14, 15, 46, 47, 56, 57, 58 | 60 | 40 | μm |
|  |  | 22~45 | 67 | 67 | μm |
| Bump height | All pad |  | 18±3 |  | μm |

> **Visual reference:** Consult original PDF page 4 for diagrams and visual layout.

### PDF page 5 — COG Alignment and Pad Coordinates (Part 1)

<!-- source: HT16C24A_AGv100.pdf#page=5 -->

```text
Alignment Mark Dimensions for COG

         Item              Number                            Size                         Unit
                                                                   (-1906, 362.5)

                                                        10m
                                                                  20m
                                                        10m

      ALIGN_A                2                                           μm
                                                                  40m
                                                                                 10m  10m

                                            20m      40m

                                                                       (1886, 362.5)

                                                          10m
                                                                     20m
                                                          10m

      ALIGN_B                59                                          μm
                                                                     40m
                                                                                               10m  10m

                                              20m  20m  20m

Pad Coordinates for COG
                                                                                                                     Unit: μm
   No      Name        X         Y       No       Name         X         Y
    1     DUMMY      -1866.85       444.5       62     COM8/SEG4      1733.15       444.5
    2      ALIGN_A       -1906.0       362.5       63     COM9/SEG5      1673.15       444.5
    3     DUMMY       -1884.5      269.566      64     COM10/SEG6     1613.15       444.5
    4     DUMMY       -1884.5      209.566      65     COM11/SEG7     1553.15       444.5
    5      SEG63        -1884.5      149.566      66     COM12/SEG8     1493.15       444.5
    6      SEG64        -1884.5       89.566      67     COM13/SEG9     1433.15       444.5
    7      SEG65        -1884.5       29.566      68    COM14/SEG10     1373.15       444.5
    8      SEG66        -1884.5       -30.434      69    COM15/SEG11     1313.15       444.5
    9      SEG67        -1884.5       -90.434      70       SEG12        1253.15       444.5
   10      SEG68        -1884.5      -150.434     71       SEG13         1193.15       444.5
    11      SEG69        -1884.5      -210.434     72       SEG14         1133.15       444.5
   12      SEG70        -1884.5      -270.434     73       SEG15        1073.15       444.5
   13      SEG71        -1884.5      -330.434     74       SEG16        1013.15       444.5
   14     DUMMY       -1884.5      -390.434     75       SEG17         953.15       444.5
   15     DUMMY       -1884.5      -450.434     76       SEG18         893.15       444.5
   16       SDA        -1381.81     -436.691     77       SEG19         833.15       444.5
   17       SCL        -1294.81     -436.691     78       SEG20         773.15       444.5
   18      VDD        -1023.81     -436.691     79       SEG21         713.15       444.5
```

#### Extracted table 1 on PDF page 5 (verify layout)

| Item | Number | Size | Unit |
| --- | --- | --- | --- |
| ALIGN A _ | 2 | (-1906, 362.5) 10m 20m 10m 40m 10m 10m 20m 40m | μm |
| ALIGN B _ | 59 | (1886, 362.5) 10m 20m 10m 40m 10m 10m 20m 20m 20m | μm |

#### Extracted table 4 on PDF page 5 (verify layout)

| No | Name | X | Y | No | Name | X | Y |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | DUMMY | -1866.85 | 444.5 | 62 | COM8/SEG4 | 1733.15 | 444.5 |
| 2 | ALIGN A _ | -1906.0 | 362.5 | 63 | COM9/SEG5 | 1673.15 | 444.5 |
| 3 | DUMMY | -1884.5 | 269.566 | 64 | COM10/SEG6 | 1613.15 | 444.5 |
| 4 | DUMMY | -1884.5 | 209.566 | 65 | COM11/SEG7 | 1553.15 | 444.5 |
| 5 | SEG63 | -1884.5 | 149.566 | 66 | COM12/SEG8 | 1493.15 | 444.5 |
| 6 | SEG64 | -1884.5 | 89.566 | 67 | COM13/SEG9 | 1433.15 | 444.5 |
| 7 | SEG65 | -1884.5 | 29.566 | 68 | COM14/SEG10 | 1373.15 | 444.5 |
| 8 | SEG66 | -1884.5 | -30.434 | 69 | COM15/SEG11 | 1313.15 | 444.5 |
| 9 | SEG67 | -1884.5 | -90.434 | 70 | SEG12 | 1253.15 | 444.5 |
| 10 | SEG68 | -1884.5 | -150.434 | 71 | SEG13 | 1193.15 | 444.5 |
| 11 | SEG69 | -1884.5 | -210.434 | 72 | SEG14 | 1133.15 | 444.5 |
| 12 | SEG70 | -1884.5 | -270.434 | 73 | SEG15 | 1073.15 | 444.5 |
| 13 | SEG71 | -1884.5 | -330.434 | 74 | SEG16 | 1013.15 | 444.5 |
| 14 | DUMMY | -1884.5 | -390.434 | 75 | SEG17 | 953.15 | 444.5 |
| 15 | DUMMY | -1884.5 | -450.434 | 76 | SEG18 | 893.15 | 444.5 |
| 16 | SDA | -1381.81 | -436.691 | 77 | SEG19 | 833.15 | 444.5 |
| 17 | SCL | -1294.81 | -436.691 | 78 | SEG20 | 773.15 | 444.5 |
| 18 | VDD | -1023.81 | -436.691 | 79 | SEG21 | 713.15 | 444.5 |

### PDF page 6 — COG Pad Coordinates (Part 2)

<!-- source: HT16C24A_AGv100.pdf#page=6 -->

```text
  No      Name        X         Y       No       Name         X         Y
   19       VSS         -936.81      -436.691     80       SEG22         653.15       444.5
   20      VLCD        -750.81      -436.691     81       SEG23         593.15       444.5
   21      VCCA2        -663.81      -436.691     82       SEG24         533.15       444.5
   22     DUMMY       -477.81      -436.691     83       SEG25         473.15       444.5
   23     DUMMY       -390.81      -436.691     84       SEG26         413.15       444.5
   24     DUMMY       -303.81      -436.691     85       SEG27         353.15       444.5
   25     DUMMY       -216.81      -436.691     86       SEG28         293.15       444.5
   26     DUMMY       -129.81      -436.691     87       SEG29         233.15       444.5
   27     DUMMY        -42.81      -436.691     88       SEG30         173.15       444.5
   28     DUMMY        44.19       -436.691     89       SEG31         113.15       444.5
   29     DUMMY       131.19      -436.691     90       SEG32          53.15        444.5
   30     DUMMY       218.19      -436.691     91       SEG33           -6.85        444.5
   31     DUMMY       305.19      -436.691     92       SEG34          -66.85        444.5
   32     DUMMY       392.19      -436.691     93       SEG35         -126.85       444.5
   33     DUMMY       479.19      -436.691     94       SEG36         -186.85       444.5
   34     DUMMY       566.19      -436.691     95       SEG37         -246.85       444.5
   35     DUMMY       653.19      -436.691     96       SEG38         -306.85       444.5
   36     DUMMY       740.19      -436.691     97       SEG39         -366.85       444.5
   37     DUMMY       827.19      -436.691     98       SEG40         -426.85       444.5
   38     DUMMY       914.19      -436.691     99       SEG41         -486.85       444.5
   39     DUMMY      1001.19      -436.691     100       SEG42         -546.85       444.5
   40     DUMMY      1088.19      -436.691     101       SEG43         -606.85       444.5
   41     DUMMY       1175.19      -436.691     102       SEG44         -666.85       444.5
   42     DUMMY      1262.19      -436.691     103       SEG45         -726.85       444.5
   43     DUMMY      1349.19      -436.691     104       SEG46         -786.85       444.5
   44     DUMMY      1436.19      -436.691     105       SEG47         -846.85       444.5
   45     DUMMY      1523.19      -436.691     106       SEG48         -906.85       444.5
   46     DUMMY       1884.5      -450.434     107       SEG49         -966.85       444.5
   47     DUMMY       1884.5      -390.434     108       SEG50        -1026.85      444.5
   48      COM0        1884.5      -330.434     109       SEG51        -1086.85      444.5
   49      COM1        1884.5      -270.434     110       SEG52         -1146.85       444.5
   50      COM2        1884.5      -210.434      111       SEG53        -1206.85      444.5
   51      COM3        1884.5      -150.434     112       SEG54        -1266.85      444.5
   52    COM4/SEG0     1884.5       -90.434      113       SEG55        -1326.85      444.5
   53    COM5/SEG1     1884.5       -30.434      114       SEG56        -1386.85      444.5
   54    COM6/SEG2     1884.5       29.566      115       SEG57        -1446.85      444.5
   55    COM7/SEG3     1884.5       89.566      116       SEG58        -1506.85      444.5
   56     DUMMY       1884.5      149.566      117       SEG59        -1566.85      444.5
   57     DUMMY       1884.5      209.566      118       SEG60        -1626.85      444.5
   58     DUMMY       1884.5      269.566      119       SEG61        -1686.85      444.5
   59      ALIGN_B       1886.0        362.5      120       SEG62        -1746.85      444.5
   60     DUMMY      1853.15       444.5      121     DUMMY        -1806.85      444.5
   61     DUMMY      1793.15       444.5
```

#### Extracted table 1 on PDF page 6 (verify layout)

| No | Name | X | Y | No | Name | X | Y |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 19 | VSS | -936.81 | -436.691 | 80 | SEG22 | 653.15 | 444.5 |
| 20 | VLCD | -750.81 | -436.691 | 81 | SEG23 | 593.15 | 444.5 |
| 21 | VCCA2 | -663.81 | -436.691 | 82 | SEG24 | 533.15 | 444.5 |
| 22 | DUMMY | -477.81 | -436.691 | 83 | SEG25 | 473.15 | 444.5 |
| 23 | DUMMY | -390.81 | -436.691 | 84 | SEG26 | 413.15 | 444.5 |
| 24 | DUMMY | -303.81 | -436.691 | 85 | SEG27 | 353.15 | 444.5 |
| 25 | DUMMY | -216.81 | -436.691 | 86 | SEG28 | 293.15 | 444.5 |
| 26 | DUMMY | -129.81 | -436.691 | 87 | SEG29 | 233.15 | 444.5 |
| 27 | DUMMY | -42.81 | -436.691 | 88 | SEG30 | 173.15 | 444.5 |
| 28 | DUMMY | 44.19 | -436.691 | 89 | SEG31 | 113.15 | 444.5 |
| 29 | DUMMY | 131.19 | -436.691 | 90 | SEG32 | 53.15 | 444.5 |
| 30 | DUMMY | 218.19 | -436.691 | 91 | SEG33 | -6.85 | 444.5 |
| 31 | DUMMY | 305.19 | -436.691 | 92 | SEG34 | -66.85 | 444.5 |
| 32 | DUMMY | 392.19 | -436.691 | 93 | SEG35 | -126.85 | 444.5 |
| 33 | DUMMY | 479.19 | -436.691 | 94 | SEG36 | -186.85 | 444.5 |
| 34 | DUMMY | 566.19 | -436.691 | 95 | SEG37 | -246.85 | 444.5 |
| 35 | DUMMY | 653.19 | -436.691 | 96 | SEG38 | -306.85 | 444.5 |
| 36 | DUMMY | 740.19 | -436.691 | 97 | SEG39 | -366.85 | 444.5 |
| 37 | DUMMY | 827.19 | -436.691 | 98 | SEG40 | -426.85 | 444.5 |
| 38 | DUMMY | 914.19 | -436.691 | 99 | SEG41 | -486.85 | 444.5 |
| 39 | DUMMY | 1001.19 | -436.691 | 100 | SEG42 | -546.85 | 444.5 |
| 40 | DUMMY | 1088.19 | -436.691 | 101 | SEG43 | -606.85 | 444.5 |
| 41 | DUMMY | 1175.19 | -436.691 | 102 | SEG44 | -666.85 | 444.5 |
| 42 | DUMMY | 1262.19 | -436.691 | 103 | SEG45 | -726.85 | 444.5 |
| 43 | DUMMY | 1349.19 | -436.691 | 104 | SEG46 | -786.85 | 444.5 |
| 44 | DUMMY | 1436.19 | -436.691 | 105 | SEG47 | -846.85 | 444.5 |
| 45 | DUMMY | 1523.19 | -436.691 | 106 | SEG48 | -906.85 | 444.5 |
| 46 | DUMMY | 1884.5 | -450.434 | 107 | SEG49 | -966.85 | 444.5 |
| 47 | DUMMY | 1884.5 | -390.434 | 108 | SEG50 | -1026.85 | 444.5 |
| 48 | COM0 | 1884.5 | -330.434 | 109 | SEG51 | -1086.85 | 444.5 |
| 49 | COM1 | 1884.5 | -270.434 | 110 | SEG52 | -1146.85 | 444.5 |
| 50 | COM2 | 1884.5 | -210.434 | 111 | SEG53 | -1206.85 | 444.5 |
| 51 | COM3 | 1884.5 | -150.434 | 112 | SEG54 | -1266.85 | 444.5 |
| 52 | COM4/SEG0 | 1884.5 | -90.434 | 113 | SEG55 | -1326.85 | 444.5 |
| 53 | COM5/SEG1 | 1884.5 | -30.434 | 114 | SEG56 | -1386.85 | 444.5 |
| 54 | COM6/SEG2 | 1884.5 | 29.566 | 115 | SEG57 | -1446.85 | 444.5 |
| 55 | COM7/SEG3 | 1884.5 | 89.566 | 116 | SEG58 | -1506.85 | 444.5 |
| 56 | DUMMY | 1884.5 | 149.566 | 117 | SEG59 | -1566.85 | 444.5 |
| 57 | DUMMY | 1884.5 | 209.566 | 118 | SEG60 | -1626.85 | 444.5 |
| 58 | DUMMY | 1884.5 | 269.566 | 119 | SEG61 | -1686.85 | 444.5 |
| 59 | ALIGN B _ | 1886.0 | 362.5 | 120 | SEG62 | -1746.85 | 444.5 |
| 60 | DUMMY | 1853.15 | 444.5 | 121 | DUMMY | -1806.85 | 444.5 |
| 61 | DUMMY | 1793.15 | 444.5 |  |  |  |  |

### PDF page 7 — Pin Description and Absolute Maximum Ratings

<!-- source: HT16C24A_AGv100.pdf#page=7 -->

```text
Pin Description

    Pin Name      Type                                   Description
SDA                  I/O    Serial Data Input/Output for I2C interface
SCL                               I      Serial Clock Input for I2C interface
VDD        —     Positive power supply
VSS        —    Negative power supply, ground
VCCA2       —   Power supply for LCD bias generator
VLCD       —   Power supply for LCD driver
COM0~COM3     O   LCD Common outputs
 COM4/SEG0~              O   LCD Common/Segment multiplexed driver outputs COM15/SEG11
 SEG12~SEG71    O   LCD Segment outputs

Approximate Internal Connections

          SCL, SDA (for Schmit Trigger Type)                 COM0~COM15; SEG0~SEG71

                                     VDD

                                                                    Vselect-on

                                                                           Vselect-off

                                       VSS

Absolute Maximum Ratings
Supply Voltage ..........................................................................................................................VSS-0.3V to VSS+6.5V
Input Voltage ............................................................................................................................VSS-0.3V to VDD+0.3V
Storage Temperature ........................................................................................................................... -60°C to 150°C
Operating Temperature ......................................................................................................................... -40°C to 85°C

Note: These are stress ratings only. Stresses exceeding the range specified under “Absolute Maximum Ratings”
    may cause substantial damage to the device. Functional operation of this device at other conditions beyond
      those listed in the specification is not implied and prolonged exposure to extreme conditions may affect
      device reliability.
```

#### Extracted table 1 on PDF page 7 (verify layout)

| Pin Name | Type | Description |
| --- | --- | --- |
| SDA | I/O | Serial Data Input/Output for I2C interface |
| SCL | I | Serial Clock Input for I2C interface |
| VDD | — | Positive power supply |
| VSS | — | Negative power supply, ground |
| VCCA2 | — | Power supply for LCD bias generator |
| VLCD | — | Power supply for LCD driver |
| COM0~COM3 | O | LCD Common outputs |
| COM4/SEG0~ COM15/SEG11 | O | LCD Common/Segment multiplexed driver outputs |
| SEG12~SEG71 | O | LCD Segment outputs |

### PDF page 8 — D.C. and A.C. Characteristics

<!-- source: HT16C24A_AGv100.pdf#page=8 -->

```text
D.C. Characteristics
                 VSS=0V, VDD=2.4V~5.5V, VLCD=2.4V~5.5V, Ta=-40°C~85°C, VCCA2 pad is connected to VLCD pad
                                              Test Condition
 Symbol         Parameter                                            Min.     Typ.    Max.    Unit
                                     VDD          Condition
 VDD       Operating Voltage      —       —                 2.4   —       5.5     V
 VLCD      Operating Voltage      —       —                 2.4   —       5.5     V
                                 No load, VLCD=VDD, 1/3 bias,                               3V                —      30      45     μA
                                             fLCD=80Hz, LCD display on, IDD        Operating Current                                                    internal system oscillator on,
                               5V                —      40      60     μA                                 DA0~DA3 are set to “0000”
                                 No load, VLCD=VDD, 1/3 bias                               3V                —      2       5     μA
                                             fLCD=80Hz, LCD display off, IDD1       Operating Current                                                    internal system oscillator on,
                               5V                —      4      10     μA                                 DA0~DA3 are set to “0000”
                               3V  No load, VLCD=VDD,       —   —      1     μA
 ISTB       Standby Current             LCD display off,
                               5V                —   —      2     μA                                                    internal system oscillator off
 VIH        Input High Voltage      —  SDA ,SCL                    0.7VDD  —      VDD     V
 VIL         Input Low Voltage      —  SDA, SCL                   0   —     0.3VDD    V
 IIL         Input Leakage Current    —   VIN=VSS or VDD                    -1   —      1     μA
                               3V                              3   —   —    mA
 IOL      Low Level Output Current         VOL=0.4V for SDA
                               5V                              6   —   —    mA
                               3V  VLCD=3V, VOL=0.3V            250     400   —     μA
 IOL1     LCD COM Sink Current
                               5V  VLCD=5V, VOL=0.5V            500     800   —     μA
                               3V  VLCD=3V, VOH=2.7V             -140    -230   —     μA
 IOH1     LCD COM Source Current
                               5V  VLCD=5V, VOH=4.5V             -300    -500   —     μA
                               3V  VLCD=3V, VOL=0.3V            250     400   —     μA
 IOL2     LCD SEG Sink Current
                               5V  VLCD=5V, VOL=0.5V            500     800   —     μA
                               3V  VLCD=3V, VOH=2.7V             -140    -230   —     μA
 IOH2     LCD SEG Source Current
                               5V  VLCD=5V, VOH=4.5V             -300    -500   —     μA

A.C. Characteristics
                 VSS=0V, VDD=2.4V~5.5V, VLCD=2.4V~5.5V, Ta=-40°C~85°C, VCCA2 pad is connected to VLCD pad
                                                      Test Condition
 Symbol              Parameter                                          Min.   Typ.   Max.   Unit
                                               VDD       Condition
                                                         1/4 duty, Ta=25°C       72     80     88    Hz
 fLCD1    LCD Frame Frequency               4V
                                                         1/4 duty, Ta=-40~85°C    52     80    124    Hz
                                                         1/4 duty, Ta=25°C       144    160    176    Hz
 fLCD2    LCD Frame Frequency               4V
                                                         1/4 duty, Ta=-40~85°C   104    160    248    Hz
          VDD Start Voltage to Ensure Power-on VPOR                      —      —      —   —    100   mV         Reset
 RRVDD    VDD Rise Rate to Ensure Power-on Reset —      —            0.05  —   —    V/ms
         Minimum Time for VDD to Remain at tPOR                      —      —           10   —   —    ms          VPOR to Ensure Power-on Reset
```

#### Extracted table 1 on PDF page 8 (verify layout)

| Symbol | Parameter | Test Condition |  | Min. | Typ. | Max. | Unit |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | VDD | Condition |  |  |  |  |
| VDD | Operating Voltage | — | — | 2.4 | — | 5.5 | V |
| VLCD | Operating Voltage | — | — | 2.4 | — | 5.5 | V |
| IDD | Operating Current | 3V | No load, VLCD=VDD, 1/3 bias, fLCD=80Hz, LCD display on, internal system oscillator on, DA0~DA3 are set to “0000” | — | 30 | 45 | μA |
|  |  | 5V |  | — | 40 | 60 | μA |
| IDD1 | Operating Current | 3V | No load, VLCD=VDD, 1/3 bias fLCD=80Hz, LCD display off, internal system oscillator on, DA0~DA3 are set to “0000” | — | 2 | 5 | μA |
|  |  | 5V |  | — | 4 | 10 | μA |
| ISTB | Standby Current | 3V | No load, VLCD=VDD, LCD display off, internal system oscillator off | — | — | 1 | μA |
|  |  | 5V |  | — | — | 2 | μA |
| VIH | Input High Voltage | — | SDA ,SCL | 0.7VDD | — | VDD | V |
| VIL | Input Low Voltage | — | SDA, SCL | 0 | — | 0.3VDD | V |
| IIL | Input Leakage Current | — | VIN=VSS or VDD | -1 | — | 1 | μA |
| IOL | Low Level Output Current | 3V | VOL=0.4V for SDA | 3 | — | — | mA |
|  |  | 5V |  | 6 | — | — | mA |
| IOL1 | LCD COM Sink Current | 3V | VLCD=3V, VOL=0.3V | 250 | 400 | — | μA |
|  |  | 5V | VLCD=5V, VOL=0.5V | 500 | 800 | — | μA |
| IOH1 | LCD COM Source Current | 3V | VLCD=3V, VOH=2.7V | -140 | -230 | — | μA |
|  |  | 5V | VLCD=5V, VOH=4.5V | -300 | -500 | — | μA |
| IOL2 | LCD SEG Sink Current | 3V | VLCD=3V, VOL=0.3V | 250 | 400 | — | μA |
|  |  | 5V | VLCD=5V, VOL=0.5V | 500 | 800 | — | μA |
| IOH2 | LCD SEG Source Current | 3V | VLCD=3V, VOH=2.7V | -140 | -230 | — | μA |
|  |  | 5V | VLCD=5V, VOH=4.5V | -300 | -500 | — | μA |

#### Extracted table 2 on PDF page 8 (verify layout)

| Symbol | Parameter | Test Condition |  | Min. | Typ. | Max. | Unit |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | VDD | Condition |  |  |  |  |
| fLCD1 | LCD Frame Frequency | 4V | 1/4 duty, Ta=25°C | 72 | 80 | 88 | Hz |
|  |  |  | 1/4 duty, Ta=-40~85°C | 52 | 80 | 124 | Hz |
| fLCD2 | LCD Frame Frequency | 4V | 1/4 duty, Ta=25°C | 144 | 160 | 176 | Hz |
|  |  |  | 1/4 duty, Ta=-40~85°C | 104 | 160 | 248 | Hz |
| VPOR | VDD Start Voltage to Ensure Power-on Reset | — | — | — | — | 100 | mV |
| RRVDD | VDD Rise Rate to Ensure Power-on Reset | — | — | 0.05 | — | — | V/ms |
| tPOR | Minimum Time for VDD to Remain at VPOR to Ensure Power-on Reset | — | — | 10 | — | — | ms |

### PDF page 9 — I2C Timing Characteristics

<!-- source: HT16C24A_AGv100.pdf#page=9 -->

```text
A.C. Characteristics – I2C Interface
                                                                                   Ta=-40°C~85°C
                                                            VDD=2.4V~5.5V   VDD=3.0V~5.5V
 Symbol         Parameter               Condition                                             Unit
                                                               Min.    Max.    Min.    Max.
 fSCL       Clock Frequency           —       —     100   —     400    KHz
                                 Time in which the bus
 tBUF      Bus Free Time            must be free before a new     4.7   —       1.3   —      μs
                                       transmission can start
                                           After this period, the first tHD: STA      Start Condition Hold Time                                 4.0   —       0.6   —      μs                                        clock pulse is generated
 tLOW     SCL Low Time            —                4.7   —       1.3   —      μs
 tHIGH     SCL High Time            —                4.0   —       0.6   —      μs
                                   Only relevant for repeated tSU: STA      Start Condition Setup Time                                4.7   —       0.6   —      μs                            START condition
 tHD: DAT    Data Hold Time           —              0   —      0   —      ns
 tSU: DAT    Data Setup Time           —             250   —     100   —      ns
 tR      SDA and SCL Rising Time  Note            —       1.0   —       0.3      μs
 tF      SDA and SCL Falling Time  Note            —       0.3   —       0.3      μs
 tSU: STO    Stop Condition Setup Time      —                4.0   —       0.6   —      μs
 tAA        Output Valid from Clock        —       —       3.5   —       0.9      μs
            Input Filter Time Constant tSP                                 Noise suppression time    —     100   —      50      ns         (SDA and SCL Pins)
Note: These parameters are periodically sampled but not 100% tested.

Timing Diagrams

I2C Timing

SDA

            tF                                                                                                                                             tBUF
                                   tR                    tSU:DAT                                tHD:STA                          tSP
                       tLOW

SCL

                                   tHD:DAT
                   tHD:SDA                                                           tHIGH            tSU:STA                                                    tSU:STO
       S                               tAA                             Sr                                 P     S

SDA
OUT
```

#### Extracted table 1 on PDF page 9 (verify layout)

| Symbol | Parameter | Condition | VDD=2.4V~5.5V |  | VDD=3.0V~5.5V |  | Unit |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  | Min. | Max. | Min. | Max. |  |
| fSCL | Clock Frequency | — | — | 100 | — | 400 | KHz |
| tBUF | Bus Free Time | Time in which the bus must be free before a new transmission can start | 4.7 | — | 1.3 | — | μs |
| tHD: STA | Start Condition Hold Time | After this period, the first clock pulse is generated | 4.0 | — | 0.6 | — | μs |
| tLOW | SCL Low Time | — | 4.7 | — | 1.3 | — | μs |
| tHIGH | SCL High Time | — | 4.0 | — | 0.6 | — | μs |
| tSU: STA | Start Condition Setup Time | Only relevant for repeated START condition | 4.7 | — | 0.6 | — | μs |
| tHD: DAT | Data Hold Time | — | 0 | — | 0 | — | ns |
| tSU: DAT | Data Setup Time | — | 250 | — | 100 | — | ns |
| tR | SDA and SCL Rising Time | Note | — | 1.0 | — | 0.3 | μs |
| tF | SDA and SCL Falling Time | Note | — | 0.3 | — | 0.3 | μs |
| tSU: STO | Stop Condition Setup Time | — | 4.0 | — | 0.6 | — | μs |
| tAA | Output Valid from Clock | — | — | 3.5 | — | 0.9 | μs |
| tSP | Input Filter Time Constant (SDA and SCL Pins) | Noise suppression time | — | 100 | — | 50 | ns |

> **Visual reference:** Consult original PDF page 9 for diagrams and visual layout.

### PDF page 10 — Power-On Reset and Display RAM Mapping (72×4)

<!-- source: HT16C24A_AGv100.pdf#page=10 -->

```text
Power On Reset Timing                                  • All common/segment outputs are set to VLCD when
                                       VCCA2 pad is connected to VLCD pad
The devices must be powered up under certain
                                                                      • The drive mode 1/4 duty output and 1/3 bias isconditions to ensure correct operation as shown in the
                                                               selectedaccompanying diagram.
                                                                      • The system oscillator and the LCD bias generator
VDD                                                           are both off
                                                                      • LCD display is off
                                                                      •  Internal voltage adjustment function is enabled
                                                                      • The Segment/VLCD shared pin is set as the
                                      RRVDD
                                                   Segment pin
                                                                      • Detection switch for the VLCD pin is disabled
                              tPOR
                                                                      • Frame Frequency is set to 80Hz                                           VPOR
                                                  Time        • Blinking function is switched off
Note that if the powers on reset timing conditions are     Data transfers on the I2C bus should be avoided for
not satisfied during the power on/off sequence, the    1ms following power-on to allow completion of the
internal power on reset (POR) circuit will not operate       reset action.
normally. Also if VDD drops below the operating
voltage minimum voltage specification during    Display Memory – RAM Structure
operation, the power on reset timing conditions must
be also satisfied. This means that VDD must fall to 0V     The display RAM is static 60×16 bits RAM which
and remain at 0V for a minimum time of 10ms before      stores the LCD data. Logic “1” in the RAM bit-map
rising to the normal operating voltage.                     indicates the “on” state of the corresponding LCD
                                                        segment; similarly, logic “0” indicates the “off” state.
                                              The contents of the RAM data are directly mapped
Functional Description                         to the LCD data. The first RAM column corresponds
                                                             to the segments operated with respect to COM0. In
Power-On Reset                                    multiplexed LCD applications the segment data from
                                               2nd to 16th column of the display RAM are time-
When the power is applied, the devices are initialized                                                        multiplexed from COM1 to COM15 respectively. The
by an internal power-on reset circuit. The status of the                                                      following is a mapping from the RAM data to the
internal circuits after initialization is as follows:                                    LCD pattern:
 • All common/segment outputs are set to VDD when
  VCCA2 pad is connected to VDD pad

 Output  COM3  COM2  COM1  COM0   Output  COM3  COM2  COM1  COM0  Address
  SEG1                               SEG0                                   00H
  SEG3                               SEG2                                   01H
  SEG5                               SEG4                                   02H
  SEG7                               SEG6                                   03H
  SEG9                               SEG8                                   04H
 SEG11                               SEG10                                  05H
        :                :                :                :                :                :                :                :                :                :                :
        :                :                :                :                :                :                :                :                :                :                :
        :                :                :                :                :                :                :                :                :                :                :
 SEG71                               SEG70                                  23H
          D7     D6     D5     D4             D3     D2     D1     D0      Data
                       RAM Mapping of 72×4 Display Mode
```

#### Extracted table 1 on PDF page 10 (verify layout)

| Output | COM3 | COM2 | COM1 | COM0 | Output | COM3 | COM2 | COM1 | COM0 | Address |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SEG1 |  |  |  |  | SEG0 |  |  |  |  | 00H |
| SEG3 |  |  |  |  | SEG2 |  |  |  |  | 01H |
| SEG5 |  |  |  |  | SEG4 |  |  |  |  | 02H |
| SEG7 |  |  |  |  | SEG6 |  |  |  |  | 03H |
| SEG9 |  |  |  |  | SEG8 |  |  |  |  | 04H |
| SEG11 |  |  |  |  | SEG10 |  |  |  |  | 05H |
| : : : | : : : | : : : | : : : | : : : | : : : | : : : | : : : | : : : | : : : | : : : |
| SEG71 |  |  |  |  | SEG70 |  |  |  |  | 23H |
|  | D7 | D6 | D5 | D4 |  | D3 | D2 | D1 | D0 | Data |

> **Visual reference:** Consult original PDF page 10 for diagrams and visual layout.

### PDF page 11 — Display RAM Mapping (68×8 and 60×16)

<!-- source: HT16C24A_AGv100.pdf#page=11 -->

```text
          COM7/   COM6/   COM5/   COM4/  Output                               COM3   COM2   COM1   COM0   Address          SEG3    SEG2    SEG1    SEG0
  SEG4                                                                        00H
  SEG5                                                                        01H
  SEG6                                                                        02H
  SEG7                                                                        03H
  SEG8                                                                        04H
  SEG9                                                                        05H
         :                  :                  :                  :                  :                  :                  :                  :                  :                  :
         :                  :                  :                  :                  :                  :                  :                  :                  :                  :
         :                  :                  :                  :                  :                  :                  :                  :                  :                  :
  SEG71                                                                        43H
           D7      D6      D5      D4      D3      D2      D1      D0       Data
                       RAM Mapping of 68×8 Display Mode

 Output                                          Addr.                                         Addr.                                                                                                            COM3   COM2   COM1   COM0                                                                                                                               COM9/SEG5       COM8/SEG4                           COM7/SEG3       COM6/SEG2       COM5/SEG1       COM4/SEG0                                    COM15/SEG11         COM14/SEG10        COM13/SEG9        COM12/SEG8        COM11/SEG7        COM10/SEG6
 SEG12                                   01H                                    00H
 SEG13                                   03H                                    02H
 SEG14                                   05H                                    04H
 SEG15                                   07H                                    06H
 SEG16                                   09H                                    08H
 SEG17                                 0BH                                  0AH
       :           :        :        :        :        :        :        :        :         :         :        :        :        :        :        :        :        :         :
       :           :        :        :        :        :        :        :        :         :         :        :        :        :        :        :        :        :         :
       :           :        :        :        :        :        :        :        :         :         :        :        :        :        :        :        :        :         :
 SEG71                                   77H                                    76H
        D7  D6  D5  D4  D3  D2  D1  D0  Data  D7  D6  D5  D4  D3  D2  D1  D0  Data
                      RAM Mapping of 60×16 Display Mode

Display data transfer format for I2C bus:           LCD Bias Generator
   MSB                              LSB        The full-scale LCD voltage (VOP) is obtained from
                                                      (VLCD–VSS). The LCD voltage may be temperature
    D7   D6   D5   D4   D3   D2   D1   D0          compensated externally through the voltage supply to
                                                           the VLCD pin.
System Oscillator                                     Fractional LCD biasing voltages, known as 1/3, 1/4 or
                                                         1/5 bias voltage, are obtained from an internal voltage
The timing for the internal logic and the LCD drive                                                            divider of five serial resistors connected between the
signals are generated by an internal oscillator. The                                   VLCD and VSS pins. The specific resistor can be
system clock frequency (fSYS) determines the LCD                                                     switched out of circuits to provide a 1/3, 1/4 or 1/5
frame frequency. During initial system power-on the                                                            bias voltage level configuration.
system oscillator will be in the stop state.
```

#### Extracted table 1 on PDF page 11 (verify layout)

| Output | COM7/ SEG3 | COM6/ SEG2 | COM5/ SEG1 | COM4/ SEG0 | COM3 | COM2 | COM1 | COM0 | Address |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SEG4 |  |  |  |  |  |  |  |  | 00H |
| SEG5 |  |  |  |  |  |  |  |  | 01H |
| SEG6 |  |  |  |  |  |  |  |  | 02H |
| SEG7 |  |  |  |  |  |  |  |  | 03H |
| SEG8 |  |  |  |  |  |  |  |  | 04H |
| SEG9 |  |  |  |  |  |  |  |  | 05H |
| : : : | : : : | : : : | : : : | : : : | : : : | : : : | : : : | : : : | : : : |
| SEG71 |  |  |  |  |  |  |  |  | 43H |
|  | D7 | D6 | D5 | D4 | D3 | D2 | D1 | D0 | Data |

> **Visual reference:** Consult original PDF page 11 for diagrams and visual layout.

### PDF page 12 — 1/4 Duty LCD Waveforms

<!-- source: HT16C24A_AGv100.pdf#page=12 -->

```text
LCD Drive Mode Waveforms
• When the LCD drive mode is selected as 1/4 duty and 1/3 bias, the waveform and LCD display is shown as
   follows:

                                                                        tLCD
                                                                                          LCD segment
                        VLCD

                   VLCD-Vop/3
      COM0
                 VLCD-2Vop/3
                                                                                                       State1
                                                                                                                 (on)
                        VSS

                        VLCD

                                                                                                      State2                   VLCD-Vop/3                                                                                                                                             (off)
      COM1
                 VLCD-2Vop/3

                        VSS

                        VLCD

                   VLCD-Vop/3
      COM2
                 VLCD-2Vop/3

                        VSS

                        VLCD

                   VLCD-Vop/3
      COM3
                 VLCD-2Vop/3

                        VSS

                        VLCD

                   VLCD-Vop/3
      SEG n
                 VLCD-2Vop/3

                        VSS

                        VLCD

                   VLCD-Vop/3
    SEG n+1
                 VLCD-2Vop/3

                        VSS

                        VLCD

                   VLCD-Vop/3
    SEG n+2
                 VLCD-2Vop/3

                        VSS

                        VLCD

                   VLCD-Vop/3
    SEG n+3
                 VLCD-2Vop/3

                        VSS
                  Waveforms for 1/4 Duty Drive Mode with 1/3 Bias (VOP=VLCD-VSS)
Note: tLCD=1/fLCD
```

> **Visual reference:** Consult original PDF page 12 for diagrams and visual layout.

### PDF page 13 — 1/8 Duty LCD Waveforms

<!-- source: HT16C24A_AGv100.pdf#page=13 -->

```text
• When the LCD drive mode is selected as 1/8 duty and 1/4 bias, the waveform and LCD display is shown as
   follows:

                                                                                         tLCD
                                                                                                  LCD segment
                                    VLCD
                              VLCD-Vop/4
              COM0  VLCD-2Vop/4
                                                                                                                      State1
                            VLCD-3Vop/4                                                                                     (on)
                                   VSS
                                    VLCD
                              VLCD-Vop/4                                                                               State2
                                                                                                                                                                  (off)
              COM1  VLCD-2Vop/4
                            VLCD-3Vop/4
                                   VSS
                                    VLCD
                              VLCD-Vop/4
              COM2  VLCD-2Vop/4
                            VLCD-3Vop/4
                                   VSS
                                    VLCD
                              VLCD-Vop/4
              COM3  VLCD-2Vop/4
                            VLCD-3Vop/4
                                   VSS
                                    VLCD
                              VLCD-Vop/4
              COM4  VLCD-2Vop/4
                            VLCD-3Vop/4
                                   VSS
                                    VLCD
                              VLCD-Vop/4
              COM5  VLCD-2Vop/4
                            VLCD-3Vop/4
                                   VSS
                                    VLCD
                              VLCD-Vop/4
              COM6  VLCD-2Vop/4
                            VLCD-3Vop/4
                                   VSS
                                    VLCD
                              VLCD-Vop/4
              COM7  VLCD-2Vop/4
                            VLCD-3Vop/4
                                   VSS
                                    VLCD
                              VLCD-Vop/4
              SEG n  VLCD-2Vop/4
                            VLCD-3Vop/4
                                   VSS
                                    VLCD
                              VLCD-Vop/4
             SEG n+1  VLCD-2Vop/4
                            VLCD-3Vop/4
                                   VSS
                                    VLCD
                              VLCD-Vop/4
             SEG n+2  VLCD-2Vop/4
                            VLCD-3Vop/4
                                   VSS
                                    VLCD
                              VLCD-Vop/4
             SEG n+3  VLCD-2Vop/4
                            VLCD-3Vop/4
                                   VSS

                  Waveforms for 1/8 Duty Drive Mode with 1/4 Bias (VOP=VLCD-VSS)
Note: tLCD=1/fLCD
```

> **Visual reference:** Consult original PDF page 13 for diagrams and visual layout.

### PDF page 14 — 1/16 Duty LCD Waveforms

<!-- source: HT16C24A_AGv100.pdf#page=14 -->

```text
 • When the LCD drive mode is selected as 1/16 duty and 1/5 bias, the waveform and LCD display is shown as
   follows:

                                                                                                                                                                   LCD Segment
                                                                                                                  tLCD
                  VLCD
            VLCD-Vop/5
           VLCD-2Vop/5                                                                                                                                                                      State1COM0     VLCD-3Vop/5                                                                                                                                                                                                              (on)           VLCD-4Vop/5
                  VSS
                  VLCD
            VLCD-Vop/5
           VLCD-2Vop/5                                                                                                                                                                      State2COM1     VLCD-3Vop/5                                                                                                                                                                                                                                                                 (off)           VLCD-4Vop/5
                  VSS
                  VLCD
            VLCD-Vop/5
COM2     VLCD-3Vop/5VLCD-2Vop/5
           VLCD-4Vop/5
                  VSS
            VLCD-Vop/5VLCD
COM3     VLCD-3Vop/5VLCD-2Vop/5
           VLCD-4Vop/5
                  VSS
                  VLCD
            VLCD-Vop/5
COM4     VLCD-3Vop/5VLCD-2Vop/5
           VLCD-4Vop/5
                  VSS
                  VLCD
            VLCD-Vop/5
COM5    VLCD-2Vop/5VLCD-3Vop/5
          VLCD-4Vop/5
                 VSS
                  VLCD
            VLCD-Vop/5
COM6    VLCD-2Vop/5VLCD-3Vop/5
          VLCD-4Vop/5
                 VSS
                  VLCD
            VLCD-Vop/5
COM7    VLCD-2Vop/5VLCD-3Vop/5
          VLCD-4Vop/5
                 VSS
                  VLCD
            VLCD-Vop/5
COM8    VLCD-2Vop/5VLCD-3Vop/5
          VLCD-4Vop/5
                 VSS
                  VLCD
            VLCD-Vop/5
COM9    VLCD-2Vop/5VLCD-3Vop/5
          VLCD-4Vop/5
                 VSS
                  VLCD
            VLCD-Vop/5
COM10   VLCD-2Vop/5VLCD-3Vop/5
          VLCD-4Vop/5
                 VSS
                  VLCD
            VLCD-Vop/5
COM11   VLCD-2Vop/5VLCD-3Vop/5
          VLCD-4Vop/5
                 VSS
                  VLCD
            VLCD-Vop/5
COM12   VLCD-2Vop/5VLCD-3Vop/5
          VLCD-4Vop/5
                 VSS
                  VLCD
            VLCD-Vop/5
COM13   VLCD-2Vop/5VLCD-3Vop/5
          VLCD-4Vop/5
                 VSS
                  VLCD
            VLCD-Vop/5
COM14   VLCD-2Vop/5VLCD-3Vop/5
          VLCD-4Vop/5
                 VSS
                  VLCD
            VLCD-Vop/5
COM15   VLCD-2Vop/5VLCD-3Vop/5
          VLCD-4Vop/5
                 VSS

                  VLCD
            VLCD-Vop/5
          VLCD-2Vop/5
SEG n    VLCD-3Vop/5
          VLCD-4Vop/5
                 VSS

                  VLCD
            VLCD-Vop/5
SEG n+1  VLCD-2Vop/5
          VLCD-3Vop/5
          VLCD-4Vop/5
                 VSS

                  VLCD
            VLCD-Vop/5
SEG n+2  VLCD-2Vop/5
          VLCD-3Vop/5
          VLCD-4Vop/5
                 VSS

                  VLCD
            VLCD-Vop/5
SEG n+3  VLCD-2Vop/5
          VLCD-3Vop/5
          VLCD-4Vop/5
                 VSS
                  Waveforms for 1/16 Duty Drive Mode with 1/5 Bias (VOP=VLCD-VSS)
Note: tLCD=1/fLCD
```

> **Visual reference:** Consult original PDF page 14 for diagrams and visual layout.

### PDF page 15 — Display Driver, Blinking and Voltage Adjustment

<!-- source: HT16C24A_AGv100.pdf#page=15 -->

```text
Segment Driver Outputs                 Frame Frequency
The LCD drive section includes up to 72 segment     The devices provide two frame frequencies selected
outputs which should be connected directly to the     with mode setting command known as 80Hz and
LCD panel. The segment output signals are generated     160Hz respectively.
in accordance with the multiplexed column signals
and with the data resident in the display latch. The        Blinking   Operating Mode       Blinking
unused segment outputs should be left open-circuit.         Mode          Ratio        Frequency (Hz)
                                                      0             0                Blink off
Column Driver Outputs                             1           fSYS/16384            2
                                                      2           fSYS/32768            1The LCD drive section includes up to 16 column
outputs which should be connected directly to the          3           fSYS/65536             0.5
LCD panel. The column output signals are generated
in accordance with the selected LCD drive mode. The     Internal VLCD Voltage Adjustment
unused column outputs should be left open-circuit.
                                                                      • The internal VLCD adjustment contains four resistors
                                                                 in series and a 4-bit programmable analog switchAddress Pointer                                                which can provide sixteen voltage adjustment
The addressing mechanism for the display RAM is         options using the VLCD voltage adjustment command.
implemented using the address pointer. This allows        • The internal VLCD adjustment structure is shown in
the loading of an individual display data byte, or a         the diagram:
series of display data bytes, into any location of the
display RAM. The sequence commences with the        VDD Pad
initialization of the address pointer by the address      VCCA2 Pad
pointer command.                                                        VE Bit
                                                        DE Bit
Blinker Function                                VLCD Pad
The devices contain versatile blinking capabilities.
The whole display can be blinked at frequencies                                                     Internal Voltage
selected by the Blink command. The blinking                                              Adjustment
frequency is a subdivided ratio of the system
frequency. The ratio between the system oscillator and
blinking frequencies depends on the blinking mode
in which the devices are operating, as shown in the
following table.

                                                               LCD Bias
                                                                                   Generator
```

#### Extracted table 1 on PDF page 15 (verify layout)

| Blinking Mode | Operating Mode Ratio | Blinking Frequency (Hz) |
| --- | --- | --- |
| 0 | 0 | Blink off |
| 1 | fSYS/16384 | 2 |
| 2 | fSYS/32768 | 1 |
| 3 | fSYS/65536 | 0.5 |

### PDF page 16 — VLCD Adjustment Ratios

<!-- source: HT16C24A_AGv100.pdf#page=16 -->

```text
• The relationship between the programmable 4-bit analog switch and the VLCD output voltage is shown in the
   table:
   1. When VCCA2 pad is connected to VDD pad

               Bias                                1/3                   1/4                   1/5               Note
DA3~DA0
       00H              1.000×VDD           1.000×VDD           1.000×VDD           Default value
       01H              0.944×VDD           0.957×VDD           0.966×VDD
       02H              0.894×VDD           0.918×VDD           0.934×VDD
       03H              0.849×VDD           0.882×VDD           0.904×VDD
       04H              0.808×VDD           0.849×VDD           0.875×VDD
       05H              0.771×VDD           0.818×VDD           0.849×VDD
       06H              0.738×VDD           0.789×VDD           0.824×VDD
       07H              0.707×VDD           0.763×VDD           0.801×VDD
       08H              0.678×VDD           0.738×VDD           0.779×VDD
       09H              0.652×VDD           0.714×VDD           0.758×VDD
      0AH              0.628×VDD           0.692×VDD           0.738×VDD
      0BH              0.605×VDD           0.672×VDD           0.719×VDD
      0CH              0.584×VDD           0.652×VDD           0.701×VDD
      0DH              0.565×VDD           0.634×VDD           0.684×VDD
      0EH              0.547×VDD           0.616×VDD           0.668×VDD
       0FH              0.529×VDD           0.600×VDD           0.652×VDD

   2. When VCCA2 pad is connected to VLCD pad

               Bias                                1/3                   1/4                   1/5               Note
DA3~DA0
       00H              1.000×VLCD           1.000×VLCD           1.000×VLCD           Default value
       01H              0.944×VLCD           0.957×VLCD           0.966×VLCD
       02H              0.894×VLCD           0.918×VLCD           0.934×VLCD
       03H              0.849×VLCD           0.882×VLCD           0.904×VLCD
       04H              0.808×VLCD           0.849×VLCD           0.875×VLCD
       05H              0.771×VLCD           0.818×VLCD           0.849×VLCD
       06H              0.738×VLCD           0.789×VLCD           0.824×VLCD
       07H              0.707×VLCD           0.763×VLCD           0.801×VLCD
       08H              0.678×VLCD           0.738×VLCD           0.779×VLCD
       09H              0.652×VLCD           0.714×VLCD           0.758×VLCD
      0AH              0.628×VLCD           0.692×VLCD           0.738×VLCD
      0BH              0.605×VLCD           0.672×VLCD           0.719×VLCD
      0CH              0.584×VLCD           0.652×VLCD           0.701×VLCD
      0DH              0.565×VLCD           0.634×VLCD           0.684×VLCD
      0EH              0.547×VLCD           0.616×VLCD           0.668×VLCD
       0FH              0.529×VLCD           0.600×VLCD           0.652×VLCD
```

#### Extracted table 1 on PDF page 16 (verify layout)

| Bias DA3~DA0 | 1/3 | 1/4 | 1/5 | Note |
| --- | --- | --- | --- | --- |
| 00H | 1.000×VDD | 1.000×VDD | 1.000×VDD | Default value |
| 01H | 0.944×VDD | 0.957×VDD | 0.966×VDD |  |
| 02H | 0.894×VDD | 0.918×VDD | 0.934×VDD |  |
| 03H | 0.849×VDD | 0.882×VDD | 0.904×VDD |  |
| 04H | 0.808×VDD | 0.849×VDD | 0.875×VDD |  |
| 05H | 0.771×VDD | 0.818×VDD | 0.849×VDD |  |
| 06H | 0.738×VDD | 0.789×VDD | 0.824×VDD |  |
| 07H | 0.707×VDD | 0.763×VDD | 0.801×VDD |  |
| 08H | 0.678×VDD | 0.738×VDD | 0.779×VDD |  |
| 09H | 0.652×VDD | 0.714×VDD | 0.758×VDD |  |
| 0AH | 0.628×VDD | 0.692×VDD | 0.738×VDD |  |
| 0BH | 0.605×VDD | 0.672×VDD | 0.719×VDD |  |
| 0CH | 0.584×VDD | 0.652×VDD | 0.701×VDD |  |
| 0DH | 0.565×VDD | 0.634×VDD | 0.684×VDD |  |
| 0EH | 0.547×VDD | 0.616×VDD | 0.668×VDD |  |
| 0FH | 0.529×VDD | 0.600×VDD | 0.652×VDD |  |

#### Extracted table 2 on PDF page 16 (verify layout)

| Bias DA3~DA0 | 1/3 | 1/4 | 1/5 | Note |
| --- | --- | --- | --- | --- |
| 00H | 1.000×VLCD | 1.000×VLCD | 1.000×VLCD | Default value |
| 01H | 0.944×VLCD | 0.957×VLCD | 0.966×VLCD |  |
| 02H | 0.894×VLCD | 0.918×VLCD | 0.934×VLCD |  |
| 03H | 0.849×VLCD | 0.882×VLCD | 0.904×VLCD |  |
| 04H | 0.808×VLCD | 0.849×VLCD | 0.875×VLCD |  |
| 05H | 0.771×VLCD | 0.818×VLCD | 0.849×VLCD |  |
| 06H | 0.738×VLCD | 0.789×VLCD | 0.824×VLCD |  |
| 07H | 0.707×VLCD | 0.763×VLCD | 0.801×VLCD |  |
| 08H | 0.678×VLCD | 0.738×VLCD | 0.779×VLCD |  |
| 09H | 0.652×VLCD | 0.714×VLCD | 0.758×VLCD |  |
| 0AH | 0.628×VLCD | 0.692×VLCD | 0.738×VLCD |  |
| 0BH | 0.605×VLCD | 0.672×VLCD | 0.719×VLCD |  |
| 0CH | 0.584×VLCD | 0.652×VLCD | 0.701×VLCD |  |
| 0DH | 0.565×VLCD | 0.634×VLCD | 0.684×VLCD |  |
| 0EH | 0.547×VLCD | 0.616×VLCD | 0.668×VLCD |  |
| 0FH | 0.529×VLCD | 0.600×VLCD | 0.652×VLCD |  |

### PDF page 17 — I2C Protocol Basics

<!-- source: HT16C24A_AGv100.pdf#page=17 -->

```text
I2C Serial Interface
The devices support I2C serial interface. The I2C bus is for bidirectional, two-line communication between different
ICs or modules. The two lines are a serial data line, SDA, and a serial clock line, SCL. Both lines are connected
to the positive supply via pull-up resistors with a typical value of 4.7kΩ. When the bus is free, both lines are high.
Devices connected to the bus must have open-drain or open-collector outputs to implement a wired-or function.
Data transfer is initiated only when the bus is not busy.

Data Validity
The data on the SDA line must be stable during the high period of the serial clock. The high or low state of the
data line can only be changed when the clock signal on the SCL line is low as shown in the diagram.

              SDA

               SCL

                                     Data line stable;
                                        Data valid
                                                Change of
                                                        data allowed

START and STOP Conditions
• A high to low transition on the SDA line while SCL is high defines a START condition.
• A low to high transition on the SDA line while SCL is high defines a STOP condition.
• START and STOP conditions are always generated by the master. The bus is considered to be busy after the
  START condition. The bus is considered to be free again a certain time after the STOP condition.
• The bus stays busy if a repeated START (Sr) is generated instead of a STOP condition. In some respects, the
  START (S) and repeated START (Sr) conditions are functionally identical.

           SDA                                                          SDA

            SCL                                                             SCL

                          S                                  P

                     START condition                        STOP condition

Byte Format
Every byte put on the SDA line must be 8-bit long. The number of bytes that can be transmitted per transfer is
unrestricted. Each byte has to be followed by an acknowledge bit. Data is transferred with the most significant bit,
MSB, first.

                                                                              P
       SDA
                                                                                                        Sr

       SCL              S      1     2          7     8     9         1     2      3-8      9        P
                    or                                                                                               or                                          ACK                     ACK
                  Sr                                                                                    Sr
```

> **Visual reference:** Consult original PDF page 17 for diagrams and visual layout.

### PDF page 18 — I2C Acknowledge and Slave Addressing

<!-- source: HT16C24A_AGv100.pdf#page=18 -->

```text
Acknowledge
• Each bytes of eight bits is followed by one acknowledge bit. The acknowledge bit is a low level placed on the
  bus by the receiver. The master generates an extra acknowledge related clock pulse.
• A slave receiver which is addressed must generate an acknowledge bit, ACK, after the reception of each byte.
• The devices that acknowledge must pull down the SDA line during the acknowledge clock pulse so that it
  remains stable low during the high period of this clock pulse.
• A master receiver must signal an end of data to the slave by generating a not-acknowledge, NACK, bit on the
   last byte that has been clocked out of the slave. In this case, the master receiver must leave the data line high
   during the 9th pulse to not acknowledge. The master will generate a STOP or repeated START condition.

                Data Output
              By Transmiter
                                                                             not acknowledge
                Data Output
              By Receiver
                                                                        acknowledge
              SCL From
                   Master                   1        2               7        8        9
                          S
                         START
                                    condition                                                    clock pulse for
                                                                                acknowledgement

Slave Addressing
• The slave address byte is the first byte received following the START condition form the master device. The
    first seven bits of the first byte make up the slave address. The eighth bit defines a read or write operation to be
  performed. When the R/W bit is “1”, then a read operation is selected. A “0” selects a write operation.
• The devices address bits are “0111101”. When an address byte is sent, the devices compare the first seven bits
   after the START condition. If they match, the devices output an acknowledge signal on the SDA line.

                                                     Slave Address
                        MSB                                LSB

                                 0     1     1     1     1     0     1   R/W

Write Operation

Byte Writes Operation
• Command Byte
A Command Byte write operation requires a START condition, a slave address with an R/W bit, a command byte,
a command setting byte and a STOP condition for a command byte write operation.

                 Slave Address                          Command Byte                       Command Setting

  S   0    1    1    1    1    0    1    0          Bit 7 Bit 6 Bit 5 Bit 4 Bit 3 Bit 2 Bit 1 Bit 0        Bit 7 Bit 6 Bit 5 Bit 4 Bit 3 Bit 2 Bit 1 Bit 0      P

                                            Write ACK                            1st              ACK                       2nd              ACK
                          Command Byte Write Operation
```

> **Visual reference:** Consult original PDF page 18 for diagrams and visual layout.

### PDF page 19 — I2C RAM Read/Write Transactions

<!-- source: HT16C24A_AGv100.pdf#page=19 -->

```text
• Display RAM Single Data Byte
A display RAM data byte write operation requires a START condition, a slave address with an R/W bit, a
command byte, a valid Register Address byte, a Data byte and a STOP condition.

                 Slave Address                            Command Byte                                 Register Address Byte                               Data Byte

  S    0    1    1    1    1    0    1    0          Bit 7  Bit 6  Bit 5  Bit 4  Bit 3  Bit 2  Bit 1  Bit 0        Bit 7  Bit 6  Bit 5  Bit 4  Bit 3  Bit 2  Bit 1  Bit 0      D7  D6  D5  D4  D3  D2  D1  D0      P

                                            Write ACK                             1st               ACK                        2nd               ACK                               ACK
                             Display RAM Single Data Byte Write Operation

Note: If the byte following the slave address is a command code, the byte following the command code will be
      ignored.

Display RAM Page Write Operation
After a START condition the slave address with the R/W bit is placed on the bus followed with a command
byte and the specified display RAM Register Address of which the contents are written to the internal address
pointer. The data to be written to the memory will be transmitted next and then the internal address pointer will be
incremented by 1 to indicate the next memory address location after the reception of an acknowledge clock pulse.
After the internal address point reaches the maximum memory address, which is 23H for 1/4 duty drive mode,
43H for 1/8 duty drive mode or 77H for 1/16 duty drive mode, the address pointer will be reset to 00H.

                Slave Address                         Command Byte                             Register Address Byte

  S   0   1   1   1   1   0   1   0         Bit 7 Bit 6 Bit 5 Bit 4 Bit 3 Bit 2 Bit 1 Bit 0       Bit 7 Bit 6 Bit 5 Bit 4 Bit 3 Bit 2 Bit 1 Bit 0

                                           Write                                 1st                                                 2nd
                                 ACK                             ACK                             ACK

                   Data Byte                                 Data Byte                                         Data Byte

     D7  D6  D5  D4  D3  D2  D1  D0      D7  D6  D5  D4  D3  D2  D1  D0             D7  D6  D5  D4  D3  D2  D1  D0      P

                               1st data                                            2nd data                                                       Nth data
                                                                                                       ACK
                                 ACK                             ACK    ACK
                      N Bytes Display RAM Data Write Operation

Display RAM Read Operation
• In this mode, the master reads the devices data after setting the slave address. Following the R/W bit (=“0”)
   is an acknowledge bit, a command byte and the register address byte which is written to the internal address
   pointer. After the start address of the Read Operation has been configured, another START condition and the
   slave address transferred on the bus followed by the R/W bit (=“1”). Then the MSB of the data which was
   addressed is transmitted first on the I2C bus. The address pointer is only incremented by 1 after the reception of
  an acknowledge clock. That means that if the devices are configured to transmit the data at the address of AN+1,
   the master will read and acknowledge the transferred new data byte and the address pointer is incremented to
   AN+2. After the internal address pointer reaches the maximum memory address, which is 23H for 1/4 duty drive
  mode, 43H for 1/8 duty drive mode or 77H for 1/16 duty drive mode, the address pointer will be reset to 00H.
• This cycle of reading consecutive addresses will continue until the master sends a STOP condition.

                                          Slave Address                        Command Byte                            Register Address Byte

                      S   0   1   1   1   1   0   1   0         Bit 7 Bit 6 Bit 5 Bit 4 Bit 3 Bit 2 Bit 1 Bit 0       Bit 7 Bit 6 Bit 5 Bit 4 Bit 3 Bit 2 Bit 1 Bit 0     P

                                                                      Write                                1st                                                2nd
                                                   ACK                            ACK                            ACK

                   Device Address                                Data Byte                                Data Byte                                         Data Byte

     S   0   1   1   1   1   0   1   1      D7  D6  D5  D4  D3  D2  D1  D0     D7  D6  D5  D4  D3  D2  D1  D0            D7  D6  D5  D4  D3  D2  D1  D0      P

                                    Read                              1st data                                          2nd data                                                     Nth data             NACK
                                   ACK                            ACK                            ACK    ACK
```

#### Extracted table 2 on PDF page 19 (verify layout)

| Slave Address |  |  |  |  | 0 | Command Byte Bit 7Bit 6Bit 5Bit 4Bit 3Bit 2Bit 1Bit 0 |  |  |  | Register Address Byte Bit 7Bit 6Bit 5Bit 4Bit 3Bit 2Bit 1Bit 0 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |  |  |  |
| 0 1 | 1 | 1 1 | 0 | 1 |  | Bit 7B | it 6Bit 5 | Bit 4Bit 3 | Bit 2Bit 1 |  |

> **Visual reference:** Consult original PDF page 19 for diagrams and visual layout.

### PDF page 20 — Command Summary: RAM and Drive Mode

<!-- source: HT16C24A_AGv100.pdf#page=20 -->

```text
Command Summary

Display Data Read/Write Command
This command can write data from MCU to memory MAP of the devices or can read from the devices.

                     (MSB)                                      (LSB)     Function     Byte          Bit 6  Bit 5  Bit 4  Bit 3  Bit 2  Bit 1            Note     R/W  Def                             Bit 7                                               Bit 0
Display Data Read/                             1st    1     0     0     0     0     0     0     0                  ­     W  80HWrite Command
                                                                                  Display data
Address pointer       2nd   X    A6   A5   A4   A3   A2   A1   A0   start address of W  00H
                                                                memory map
Display Write/Read                            3th   D7   D6   D5   D4   D3   D2   D1   D0              R/WData
Note:
 • Power-on status: the address is set to 00H.
 •  If the programmed command is not defined, the function will not be affected.
 • For 1/4 duty drive mode after reaching the memory location 23H, the pointer will reset to 00H.
 • For 1/8 duty drive mode after reaching the memory location 43H, the pointer will reset to 00H.
 • For 1/16 duty drive mode after reaching the memory location 77H, the pointer will reset to 00H.

Drive Mode Command
This command controls the bias select and duty select.
                      (MSB)                                         (LSB)     Function      Byte           Bit 6   Bit 5   Bit 4   Bit 3   Bit 2   Bit 1          Note   R/W  Def                              Bit 7                                                   Bit 0
 Driver mode                              1st     1     0     0     0     0     0     1     0        W  82H setting command
 Duty and Bias                         2nd    X    X    X    X    Duty1  Bias1  Duty0  Bias0       W  00H setting
 Note:
    Duty1     Duty0       Duty
      0         0         1/4 duty
      0         1         1/8 duty
      1       X        1/16 duty

    Bias1     Bias0       Bias
      0         0         1/3 bias
      0         1         1/4 bias
      1       X         1/5 bias
 • Power-on status: The drive mode 1/4 duty output and 1/3 bias is selected.
 •  If the programmed command is not defined, the function will not be affected.
```

#### Extracted table 1 on PDF page 20 (verify layout)

| Function | Byte | (MSB) Bit 7 | Bit 6 | Bit 5 | Bit 4 | Bit 3 | Bit 2 | Bit 1 | (LSB) Bit 0 | Note | R/W | Def |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Display Data Read/ Write Command | 1st | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  | W | 80H |
| Address pointer | 2nd | X | A6 | A5 | A4 | A3 | A2 | A1 | A0 | Display data start address of memory map | W | 00H |
| Display Write/Read Data | 3th | D7 | D6 | D5 | D4 | D3 | D2 | D1 | D0 |  | R/W |  |
| Note: • Power-on status: the address is set to 00H. • If the programmed command is not defined, the function will not be affected. • For 1/4 duty drive mode after reaching the memory location 23H, the pointer will reset to 00H. • For 1/8 duty drive mode after reaching the memory location 43H, the pointer will reset to 00H. • For 1/16 duty drive mode after reaching the memory location 77H, the pointer will reset to 00H. |  |  |  |  |  |  |  |  |  |  |  |  |

#### Extracted table 2 on PDF page 20 (verify layout)

| Function | Byte | (MSB) Bit 7 | Bit 6 | Bit 5 | Bit 4 | Bit 3 | Bit 2 | Bit 1 | (LSB) Bit 0 | Note | R/W | Def |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Driver mode setting command | 1st | 1 | 0 | 0 | 0 | 0 | 0 | 1 | 0 |  | W | 82H |
| Duty and Bias setting | 2nd | X | X | X | X | Duty1 | Bias1 | Duty0 | Bias0 |  | W | 00H |
| Note: Duty1 Duty0 Duty 0 0 1/4 duty 0 1 1/8 duty 1 X 1/16 duty Bias1 Bias0 Bias 0 0 1/3 bias 0 1 1/4 bias 1 X 1/5 bias • Power-on status: The drive mode 1/4 duty output and 1/3 bias is selected. • If the programmed command is not defined, the function will not be affected. |  |  |  |  |  |  |  |  |  |  |  |  |

#### Extracted table 3 on PDF page 20 (verify layout)

| Duty1 | Duty0 | Duty |
| --- | --- | --- |
| 0 | 0 | 1/4 duty |
| 0 | 1 | 1/8 duty |
| 1 | X | 1/16 duty |

#### Extracted table 4 on PDF page 20 (verify layout)

| Bias1 | Bias0 | Bias |
| --- | --- | --- |
| 0 | 0 | 1/3 bias |
| 0 | 1 | 1/4 bias |
| 1 | X | 1/5 bias |

### PDF page 21 — Command Summary: System, Frame and Blink

<!-- source: HT16C24A_AGv100.pdf#page=21 -->

```text
System Mode Command
This command controls the internal system oscillator on/off and display on/off.
                        (MSB)                                      (LSB)      Function      Byte           Bit 6   Bit 5   Bit 4   Bit 3   Bit 2   Bit 1          Note   R/W   Def                                Bit 7                                               Bit 0
System mode setting                                 1st     1     0     0     0     0     1     0     0        W   84Hcommand
System oscillator and                           2nd    X    X    X    X    X    X    S    E        W   00H Display on/off Setting
 Note:
        Bit        Internal System   LCD
   S    E        Oscillator      Display
    0    X               off                 off
    1     0          on                off
    1     1          on           on
 • Power-on status: Display off and disable the internal system oscillator.
 •  If the programmed command is not defined, the function will not be affected.

Frame Frequency Command
This command selects the frame frequency.
                        (MSB)                                       (LSB)      Function      Byte           Bit 6   Bit 5   Bit 4   Bit 3   Bit 2   Bit 1          Note   R/W  Def                                Bit 7                                                Bit 0
 Frame frequency                                 1st     1     0     0     0     0     1     1     0        W   86H command
 Frame frequency                           2nd    X    X    X    X    X    X    X    F        W   00H setting
 Note:
    Bit     Frame
    F    Frequency
    0      80Hz
    1      160Hz
 • Power-on status: Frame frequency is set to 80Hz.
 •  If the programmed command is not defined, the function will not be affected.

Blinking Frequency Command
This command defines the blinking frequency of the display modes.

                        (MSB)                                       (LSB)     Function      Byte           Bit 6   Bit 5   Bit 4   Bit 3   Bit 2   Bit 1          Note   R/W  Def                               Bit 7                                                Bit 0
 Blinking Frequency                                1st     1     0     0     0     1     0     0     0        W   88H command
 Blinking Frequency                           2nd    X    X    X    X    X    X   BK1  BK0        W   00H setting
  Note:
         Bit         Blinking
   BK1  BK0   Frequency
     0     0      Blinking off
     0     1       2Hz
     1     0       1Hz
     1     1       0.5Hz
  • Power-on status: Blinking function is switched off.
  • If the programmed command is not defined, the function will not be affected.
```

#### Extracted table 1 on PDF page 21 (verify layout)

| Function | Byte | (MSB) Bit 7 | Bit 6 | Bit 5 | Bit 4 | Bit 3 | Bit 2 | Bit 1 | (LSB) Bit 0 | Note | R/W | Def |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| System mode setting command | 1st | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 |  | W | 84H |
| System oscillator and Display on/off Setting | 2nd | X | X | X | X | X | X | S | E |  | W | 00H |
| Note: Bit Internal System LCD S E Oscillator Display 0 X off off 1 0 on off 1 1 on on • Power-on status: Display off and disable the internal system oscillator. • If the programmed command is not defined, the function will not be affected. |  |  |  |  |  |  |  |  |  |  |  |  |

#### Extracted table 2 on PDF page 21 (verify layout)

| Bit |  | Internal System Oscillator | LCD Display |
| --- | --- | --- | --- |
| S | E |  |  |
| 0 | X | off | off |
| 1 | 0 | on | off |
| 1 | 1 | on | on |

#### Extracted table 3 on PDF page 21 (verify layout)

| Function | Byte | (MSB) Bit 7 | Bit 6 | Bit 5 | Bit 4 | Bit 3 | Bit 2 | Bit 1 | (LSB) Bit 0 | Note | R/W | Def |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Frame frequency command | 1st | 1 | 0 | 0 | 0 | 0 | 1 | 1 | 0 |  | W | 86H |
| Frame frequency setting | 2nd | X | X | X | X | X | X | X | F |  | W | 00H |
| Note: Bit Frame F Frequency 0 80Hz 1 160Hz • Power-on status: Frame frequency is set to 80Hz. • If the programmed command is not defined, the function will not be affected. |  |  |  |  |  |  |  |  |  |  |  |  |

#### Extracted table 4 on PDF page 21 (verify layout)

| Bit | Frame Frequency |
| --- | --- |
| F |  |
| 0 | 80Hz |
| 1 | 160Hz |

#### Extracted table 5 on PDF page 21 (verify layout)

| Function | Byte | (MSB) Bit 7 | Bit 6 | Bit 5 | Bit 4 | Bit 3 | Bit 2 | Bit 1 | (LSB) Bit 0 | Note | R/W | Def |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Blinking Frequency command | 1st | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |  | W | 88H |
| Blinking Frequency setting | 2nd | X | X | X | X | X | X | BK1 | BK0 |  | W | 00H |
| Note: Bit Blinking BK1 BK0 Frequency 0 0 Blinking off 0 1 2Hz 1 0 1Hz 1 1 0.5Hz • Power-on status: Blinking function is switched off. • If the programmed command is not defined, the function will not be affected. |  |  |  |  |  |  |  |  |  |  |  |  |

#### Extracted table 6 on PDF page 21 (verify layout)

| Bit |  | Blinking Frequency |
| --- | --- | --- |
| BK1 | BK0 |  |
| 0 | 0 | Blinking off |
| 0 | 1 | 2Hz |
| 1 | 0 | 1Hz |
| 1 | 1 | 0.5Hz |

### PDF page 22 — Command Summary: Internal Voltage Adjustment

<!-- source: HT16C24A_AGv100.pdf#page=22 -->

```text
Internal Voltage Adjustment (IVA) Setting Command
The internal voltage (VLCD) adjustment can provide sixteen kinds of regulator voltage adjustment options by
setting the LCD operating voltage adjustment command.

 Function  Byte  Bit 7  Bit 6  Bit 5  Bit 4  Bit 3  Bit 2  Bit 1  Bit 0            Note          R/W  Def
 IVA                   1st    1    0    0    0    1    0    1    0                  W  8AH Command
                                                                                           • The Segment/VLCD shared
                                                                          pin can be programmed via
                                                                       the “DE” bit.
                                                                                           • The “VE” bit is used to
 IVA                                                              enable or disable the internal               2nd   X   X   DE  VE  DA3 DA2 DA1  DA0                 W  30H Control                                                               voltage adjustment is supply
                                                                       voltage to bias voltage.
                                                                                           • The DA3~DA0 bits can be
                                                             used to adjust the VLCD output
                                                                           voltage.
 Note:
      Bit     Segment                             Internal              71/ VLCD                          Voltage                              Note
  DE  VE  shared Pin  Adjustment               Select
                                                     • The bias voltage is supplied by the external VLCD pin when VCCA2 is
                                      connected to VLCD.
                                                     • The bias voltage is supplied by the external VLCD pin when VCCA2 is   0   0    VLCD            off                                      connected to VDD.
                                                     •  If the VLCD pin is connected to the VDD pin, the internal voltage
                                              follower (OP4) must be disabled by setting the DA3~DA0 bits as “0000”.
                                                     • When VCCA2 is connected to VLCD, internal voltage adjustment can
                                          not be used to adjust internal bias voltage. (Bias voltage is supplied by
                                          the external VLCD pin)
                                                     • When VCCA2 is connected to VDD, internal voltage adjustment can
                                          not be used to adjust internal bias voltage when VLCD pin is supplies   0   1    VLCD        on                                            with external voltage.(Recommend: can not be used)
                                                     • When VCCA2 is connected to VDD, internal voltage adjustment can
                                   be used to adjust internal bias voltage when VLCD pin is floating and
                                               internal voltage adjustment is enable.(Bias voltage is supplied by the
                                                internal voltage adjustment)
                                                     • The bias voltage is supplied by the external VLCD pin when VCCA2 is
                                      connected to VLCD.
                                                     • The bias voltage is supplied by the external VDD power when VCCA2   1   0  Segment 71        off                                                      is connected to VDD.
                                                     • The internal voltage-follower (OP4) is disabled automatically and
                               DA3~DA0 don’t care.
                                                     • When VCCA2 is connected to VLCD, internal voltage adjustment can
                                  be used to adjust internal bias voltage when VLCD pin is supplies
                                            with external voltage and internal voltage adjustment is enable. (Bias
   1   1  Segment 71     on         voltage is supplied by the internal voltage adjustment)
                                                     • When VCCA2 is connected to VDD, internal voltage adjustment can be
                                    used to adjust internal bias voltage when  internal voltage adjustment
                                                      is enable.(Bias voltage is supplied by the internal voltage adjustment)

  • Power-on status: Enable the internal voltage Adjustment and the Segment/VLCD pin is set as the segment pin.
  • When the DA0~DA3 bits are set to “0000”, the internal voltage-follower (OP4) is disabled. When the DA0~DA3
     bits are set to other values except “0000”, the internal voltage follower (OP4) is enabled.
  •  If the programmed command is not defined, the function will not be affected.
```

#### Extracted table 1 on PDF page 22 (verify layout)

| Function | Byte | Bit 7 | Bit 6 | Bit 5 | Bit 4 | Bit 3 | Bit 2 | Bit 1 | Bit 0 | Note | R/W | Def |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IVA Command | 1st | 1 | 0 | 0 | 0 | 1 | 0 | 1 | 0 |  | W | 8AH |
| IVA Control | 2nd | X | X | DE | VE | DA3 | DA2 | DA1 | DA0 | • The Segment/VLCD shared pin can be programmed via the “DE” bit. • The “VE” bit is used to enable or disable the internal voltage adjustment is supply voltage to bias voltage. • The DA3~DA0 bits can be used to adjust the VLCD output voltage. | W | 30H |
| Note: Bit Segment Internal 71/ VLCD Voltage Note DE VE shared Pin Adjustment Select • The bias voltage is supplied by the external VLCD pin when VCCA2 is connected to VLCD. • The bias voltage is supplied by the external VLCD pin when VCCA2 is 0 0 VLCD off connected to VDD. • If the VLCD pin is connected to the VDD pin, the internal voltage follower (OP4) must be disabled by setting the DA3~DA0 bits as “0000”. • When VCCA2 is connected to VLCD, internal voltage adjustment can not be used to adjust internal bias voltage. (Bias voltage is supplied by the external VLCD pin) • When VCCA2 is connected to VDD, internal voltage adjustment can not be used to adjust internal bias voltage when VLCD pin is supplies 0 1 VLCD on with external voltage.(Recommend: can not be used) • When VCCA2 is connected to VDD, internal voltage adjustment can be used to adjust internal bias voltage when VLCD pin is floating and internal voltage adjustment is enable.(Bias voltage is supplied by the internal voltage adjustment) • The bias voltage is supplied by the external VLCD pin when VCCA2 is connected to VLCD. • The bias voltage is supplied by the external VDD power when VCCA2 1 0 Segment 71 off is connected to VDD. • The internal voltage-follower (OP4) is disabled automatically and DA3~DA0 don’t care. • When VCCA2 is connected to VLCD, internal voltage adjustment can be used to adjust internal bias voltage when VLCD pin is supplies with external voltage and internal voltage adjustment is enable. (Bias 1 1 Segment 71 on voltage is supplied by the internal voltage adjustment) • When VCCA2 is connected to VDD, internal voltage adjustment can be used to adjust internal bias voltage when internal voltage adjustment is enable.(Bias voltage is supplied by the internal voltage adjustment) • Power-on status: Enable the internal voltage Adjustment and the Segment/VLCD pin is set as the segment pin. • When the DA0~DA3 bits are set to “0000”, the internal voltage-follower (OP4) is disabled. When the DA0~DA3 bits are set to other values except “0000”, the internal voltage follower (OP4) is enabled. • If the programmed command is not defined, the function will not be affected. |  |  |  |  |  |  |  |  |  |  |  |  |

#### Extracted table 2 on PDF page 22 (verify layout)

| Bit |  | Segment 71/ VLCD shared Pin Select | Internal Voltage Adjustment | Note |
| --- | --- | --- | --- | --- |
| DE | VE |  |  |  |
| 0 | 0 | VLCD | off | • The bias voltage is supplied by the external VLCD pin when VCCA2 is connected to VLCD. • The bias voltage is supplied by the external VLCD pin when VCCA2 is connected to VDD. • If the VLCD pin is connected to the VDD pin, the internal voltage follower (OP4) must be disabled by setting the DA3~DA0 bits as “0000”. |
| 0 | 1 | VLCD | on | • When VCCA2 is connected to VLCD, internal voltage adjustment can not be used to adjust internal bias voltage. (Bias voltage is supplied by the external VLCD pin) • When VCCA2 is connected to VDD, internal voltage adjustment can not be used to adjust internal bias voltage when VLCD pin is supplies with external voltage.(Recommend: can not be used) • When VCCA2 is connected to VDD, internal voltage adjustment can be used to adjust internal bias voltage when VLCD pin is floating and internal voltage adjustment is enable.(Bias voltage is supplied by the internal voltage adjustment) |
| 1 | 0 | Segment 71 | off | • The bias voltage is supplied by the external VLCD pin when VCCA2 is connected to VLCD. • The bias voltage is supplied by the external VDD power when VCCA2 is connected to VDD. • The internal voltage-follower (OP4) is disabled automatically and DA3~DA0 don’t care. |
| 1 | 1 | Segment 71 | on | • When VCCA2 is connected to VLCD, internal voltage adjustment can be used to adjust internal bias voltage when VLCD pin is supplies with external voltage and internal voltage adjustment is enable. (Bias voltage is supplied by the internal voltage adjustment) • When VCCA2 is connected to VDD, internal voltage adjustment can be used to adjust internal bias voltage when internal voltage adjustment is enable.(Bias voltage is supplied by the internal voltage adjustment) |

### PDF page 23 — Initialization Flowcharts

<!-- source: HT16C24A_AGv100.pdf#page=23 -->

```text
Operation Flow Chart                    Display Data Read/Write (Address Setting)
Access procedures are illustrated below by means of
the flowcharts.                                                                                     Start

Initialization
                                                                               Address setting

                      Power-on

                                                                                     Display RAM data write

               Internal LCD bias and duty setting

                                                                           Display on and enable internal system clock

              Internal LCD frame frequency setting

                                                                                Next processing

           Segment / VLCD shared pin setting

           LCD blinking frequency setting

                    Next processing

Segment/VLCD Shared Pin and Internal Voltage Adjustment Setting

                                                      Start

             Set as the Segment pin     Segment / VLCD            Set as the VLCD pin
                                       shared pin setting

           Internal                                                 The external                    Internal
          voltage     YES       The bias voltage is supplied       MCU can detect  YES         voltage                                  by Programmable Internal        adjustment                                                           the voltage of               adjustment                                           voltage adjustment         enable ?                                           VLCD pin                 enable ?

      NO                                                          NO

                                                                         One external resistor must    The bias voltage is                                                                                  be connected between the  supplied by internal VDD                 Next processing                                                                     VLCD pin and VDD pin to         power                                                                                             determine the bias voltage
```

#### Extracted table 2 on PDF page 23 (verify layout)

| Power-on |  |
| --- | --- |
| Internal LCD bias and duty setting |  |
|  |  |
| Internal LCD frame frequency setting |  |
|  |  |
| Segment / VLCD shared pin setting |  |
|  |  |
| LCD blinking frequency setting |  |
| Next processing |  |

> **Visual reference:** Consult original PDF page 23 for diagrams and visual layout.

### PDF page 24 — Power Supply Sequencing

<!-- source: HT16C24A_AGv100.pdf#page=24 -->

```text
Power Supply Sequence
•  If the power is individually supplied on the VLCD and VDD pins, it is strongly recommended to follow the
   Holtek power supply sequence requirement.
•  If the power supply sequence requirement is not followed, it may result in malfunction.

Holtek Power Supply Sequence Requirement:
    1. Power-on sequence:
     Turn on the logic power supply VDD first and then turn on the LCD driver power supply VLCD.
    2. Power-off sequence:
     Turn off the LCD driver power supply VLCD first and then turn off the logic power supply VDD.
    3. The Holtek Power Supply Sequence Requirement must be followed no matter whether the VLCD voltage is
      higher than the VDD voltage.
• When the VLCD voltage is less than or is equal to VDD voltage application

              Voltage

                                                     VDD         VDD

                                                        VLCD
          VLCD

                                                                                            Time

                   1µs                                              1µs

• When the VLCD voltage is greater than VDD voltage application

              Voltage

                                                        VLCD
          VLCD

                                                    VDD
         VDD

                                                                                            Time

                   1µs                                             1µs
```

> **Visual reference:** Consult original PDF page 24 for diagrams and visual layout.

### PDF page 25 — Application Circuits: SEG Pin (No IVA)

<!-- source: HT16C24A_AGv100.pdf#page=25 -->

```text
Application Circuits

Set as Segment Pin

Case1
• Disable the internal VLCD voltage adjustment.
• The bias voltage is supplied by internal VDD power.
1/4 Duty (COM0~COM3, SEG0~SEG71)

              VDD
                                                                     0.1μF

                        VDD                                                4.7kΩ      4.7kΩ             VDD

                                                             COM0~COM3          COM0~COM3
                                                           SCL
                                                                  HT16C24A                        HOST                                                         LCD Panel                                                                HT16C24AG
                                                        SDA

                                                                  SEG0~SEG71           SEG0~SEG71

                         VSS                                    VSS

               VSS

1/8 Duty (COM0~COM7, SEG4~SEG71)

              VDD
                                                                     0.1μF

                        VDD                                                4.7kΩ      4.7kΩ             VDD

                                                             COM0~COM7          COM0~COM7
                                                           SCL
                                                                  HT16C24A                        HOST                                                         LCD Panel                                                                HT16C24AG
                                                        SDA

                                                                  SEG4~SEG71           SEG0~SEG67

                         VSS                                    VSS

               VSS

1/16 Duty (COM0~COM15, SEG12~SEG71)

              VDD
                                                                     0.1μF

                        VDD                                                4.7kΩ      4.7kΩ             VDD

                                                             COM0~COM15           COM0~COM15
                                                           SCL
                                                                  HT16C24A                        HOST                                                         LCD Panel                                                                HT16C24AG
                                                        SDA

                                                                  SEG12~SEG71           SEG0~SEG59

                         VSS                                    VSS

               VSS
```

> **Visual reference:** Consult original PDF page 25 for diagrams and visual layout.

### PDF page 26 — Application Circuits: SEG Pin (IVA)

<!-- source: HT16C24A_AGv100.pdf#page=26 -->

```text
Case2
• Enable the internal VLCD voltage adjustment.
• The bias voltage is supplied by internal VLCD voltage adjustment power.
1/4 Duty (COM0~COM3, SEG0~SEG71)

         VDD
                                                                0.1μF

                    VDD                                          4.7kΩ      4.7kΩ             VDD

                                                         COM0~COM3          COM0~COM3
                                                       SCL
                                                              HT16C24A                    HOST                                                         LCD Panel                                                            HT16C24AG
                                                    SDA

                                                              SEG0~SEG71           SEG0~SEG71

                     VSS                                    VSS

          VSS

1/8 Duty (COM0~COM7, SEG4~SEG71)

         VDD
                                                                0.1μF

                    VDD                                          4.7kΩ      4.7kΩ             VDD

                                                         COM0~COM7          COM0~COM7
                                                       SCL
                                                              HT16C24A                    HOST                                                         LCD Panel                                                            HT16C24AG
                                                    SDA

                                                              SEG4~SEG71           SEG0~SEG67

                     VSS                                    VSS

          VSS

1/16 Duty (COM0~COM15, SEG12~SEG71)

         VDD
                                                                0.1μF

                    VDD                                          4.7kΩ      4.7kΩ             VDD

                                                          COM0~COM15           COM0~COM15
                                                       SCL
                                                              HT16C24A                    HOST                                                         LCD Panel                                                            HT16C24AG
                                                    SDA

                                                              SEG12~SEG71           SEG0~SEG59

                     VSS                                    VSS

          VSS
```

> **Visual reference:** Consult original PDF page 26 for diagrams and visual layout.

### PDF page 27 — Application Circuits: VLCD Pin (1/4 Duty)

<!-- source: HT16C24A_AGv100.pdf#page=27 -->

```text
Set as VLCD Pin

Case1
• Disable the internal VLCD voltage adjustment.
1/4 Duty (COM0~COM3, SEG0~SEG70)
1. One external resister must be connected between VLCD pin and VDD pin to determine the bias voltage.

            VDD
                                                                   0.1μF        VR

                       VDD                                              4.7kΩ      4.7kΩ        VDD       VLCD

                                                            COM0~COM3          COM0~COM3
                                                          SCL
                                                                 HT16C24A                      HOST                                                         LCD Panel                                                              HT16C24AG
                                                       SDA

                                                                 SEG0~SEG70           SEG0~SEG70

                        VSS                                    VSS

             VSS

2. Support external VLCD to determine the bias voltage.

             VLCD
            VDD                                                                   0.1μF
                                                                  0.1μF

                      VDD                                             4.7kΩ      4.7kΩ        VDD       VLCD

                                                           COM0~COM3          COM0~COM3
                                                         SCL
                                                                HT16C24A                      HOST                                                         LCD Panel                                                              HT16C24AG
                                                      SDA

                                                                 SEG0~SEG70           SEG0~SEG70

                        VSS                                    VSS

            VSS
```

> **Visual reference:** Consult original PDF page 27 for diagrams and visual layout.

### PDF page 28 — Application Circuits: VLCD Pin (1/8 Duty)

<!-- source: HT16C24A_AGv100.pdf#page=28 -->

```text
1/8 Duty (COM0~COM7, SEG4~SEG70)
1. One external resister must be connected between VLCD pin and VDD pin to determine the bias voltage.

            VDD
                                                                   0.1μF        VR

                       VDD                                              4.7kΩ      4.7kΩ        VDD       VLCD

                                                            COM0~COM7          COM0~COM7
                                                          SCL
                                                                 HT16C24A                      HOST                                                         LCD Panel                                                              HT16C24AG
                                                       SDA

                                                                 SEG4~SEG70           SEG0~SEG66

                        VSS                                    VSS

             VSS

2. Support external VLCD to determine the bias voltage.

             VLCD
             VDD                                                                   0.1μF
                                                                   0.1μF

                       VDD                                              4.7kΩ      4.7kΩ        VDD       VLCD

                                                            COM0~COM7          COM0~COM7
                                                          SCL
                                                                 HT16C24A                       HOST                                                         LCD Panel                                                               HT16C24AG
                                                       SDA

                                                                 SEG4~SEG70           SEG0~SEG66

                        VSS                                    VSS

             VSS
```

> **Visual reference:** Consult original PDF page 28 for diagrams and visual layout.

### PDF page 29 — Application Circuits: VLCD Pin (1/16 Duty)

<!-- source: HT16C24A_AGv100.pdf#page=29 -->

```text
1/16 Duty (COM0~COM15, SEG12~SEG70)
1. One external resister must be connected between VLCD pin and VDD pin to determine the bias voltage.

            VDD
                                                                   0.1μF        VR

                       VDD                                              4.7kΩ      4.7kΩ        VDD       VLCD

                                                            COM0~COM15           COM0~COM15
                                                          SCL
                                                                 HT16C24A                      HOST                                                         LCD Panel                                                              HT16C24AG
                                                       SDA

                                                                 SEG12~SEG70           SEG0~SEG58

                        VSS                                    VSS

             VSS

2. Support external VLCD to determine the bias voltage.

             VLCD
             VDD                                                                   0.1μF
                                                                   0.1μF

                       VDD                                              4.7kΩ      4.7kΩ        VDD       VLCD

                                                            COM0~COM15           COM0~COM15
                                                          SCL
                                                                 HT16C24A                       HOST                                                         LCD Panel                                                               HT16C24AG
                                                       SDA

                                                                 SEG12~SEG70           SEG0~SEG58

                        VSS                                    VSS

             VSS
```

> **Visual reference:** Consult original PDF page 29 for diagrams and visual layout.

### PDF page 30 — Application Circuits: VLCD Monitoring

<!-- source: HT16C24A_AGv100.pdf#page=30 -->

```text
Case2
• Enable the internal VLCD voltage adjustment.
• The external MCU can detect the voltage of VLCD pin.
1/4 Duty (COM0~COM3, SEG0~SEG70)

        VDD
                                                               0.1μF

                    VDD                                          4.7kΩ      4.7kΩ             VDD

                                                         COM0~COM3          COM0~COM3
                                                      SCL
                                                             HT16C24A                   HOST                                                         LCD Panel                                                           HT16C24AG
                                                   SDA

                                                              SEG0~SEG70           SEG0~SEG70                                                     VLCD
                     VSS                                    VSS

         VSS

1/8 Duty (COM0~COM7, SEG4~SEG70)

        VDD
                                                               0.1μF

                    VDD                                          4.7kΩ      4.7kΩ             VDD

                                                         COM0~COM7          COM0~COM7
                                                      SCL
                                                             HT16C24A                   HOST                                                         LCD Panel                                                           HT16C24AG
                                                   SDA

                                                              SEG4~SEG70           SEG0~SEG66                                                     VLCD
                     VSS                                    VSS

         VSS

1/16 Duty (COM0~COM15, SEG12~SEG70)

        VDD
                                                               0.1μF

                    VDD                                          4.7kΩ      4.7kΩ             VDD

                                                         COM0~COM15           COM0~COM15
                                                      SCL
                                                             HT16C24A                   HOST                                                         LCD Panel                                                           HT16C24AG
                                                   SDA

                                                              SEG12~SEG70           SEG0~SEG58                                                     VLCD
                     VSS                                    VSS

         VSS
```

> **Visual reference:** Consult original PDF page 30 for diagrams and visual layout.

### PDF page 31 — Package Information

<!-- source: HT16C24A_AGv100.pdf#page=31 -->

```text
Package Information

Note that the package information provided here is for consultation purposes only. As this information may
be updated at regular intervals users are reminded to consult the Holtek website for the latest version of the
Package/Carton Information.

Additional supplementary information with regard to packaging is listed below. Click on the relevant section to be
transferred to the relevant website page.

• Package Information (include Outline Dimensions, Product Tape and Reel Specifications)

• The Operation Instruction of Packing Materials

• Carton information
```

### PDF page 32 — 64-pin LQFP Dimensions

<!-- source: HT16C24A_AGv100.pdf#page=32 -->

```text
64-pin LQFP (7mm×7mm) Outline Dimensions

                                                 Dimensions in inch
        Symbol
                                     Min.                 Nom.                   Max.
         A            —                    0.354 BSC          —
         B            —                    0.276 BSC          —
         C            —                    0.354 BSC          —
         D            —                    0.276 BSC          —
         E            —                    0.016 BSC          —
          F                       0.005                     0.007                     0.009
        G                      0.053                     0.055                     0.057
         H            —            —                      0.063
                       I                       0.002           —                      0.006
             J                       0.018                     0.024                     0.030
         K                       0.004           —                      0.008
           α                         0°            —                         7°

                                                 Dimensions in mm
        Symbol
                                     Min.                 Nom.                   Max.
         A            —                       9.0 BSC           —
         B            —                       7.0 BSC           —
         C            —                       9.0 BSC           —
         D            —                       7.0 BSC           —
         E            —                       0.4 BSC           —
          F                        0.13                       0.18                       0.23
        G                        1.35                       1.40                       1.45
         H            —            —                       1.60
                       I                        0.05           —                       0.15
             J                        0.45                       0.60                       0.75
         K                        0.09           —                       0.20
           α                         0°            —                         7°
```

#### Extracted table 2 on PDF page 32 (verify layout)

| Symbol | Dimensions in inch |  |  |
| --- | --- | --- | --- |
|  | Min. | Nom. | Max. |
| A | — | 0.354 BSC | — |
| B | — | 0.276 BSC | — |
| C | — | 0.354 BSC | — |
| D | — | 0.276 BSC | — |
| E | — | 0.016 BSC | — |
| F | 0.005 | 0.007 | 0.009 |
| G | 0.053 | 0.055 | 0.057 |
| H | — | — | 0.063 |
| I | 0.002 | — | 0.006 |
| J | 0.018 | 0.024 | 0.030 |
| K | 0.004 | — | 0.008 |
| α | 0° | — | 7° |

#### Extracted table 3 on PDF page 32 (verify layout)

| Symbol | Dimensions in mm |  |  |
| --- | --- | --- | --- |
|  | Min. | Nom. | Max. |
| A | — | 9.0 BSC | — |
| B | — | 7.0 BSC | — |
| C | — | 9.0 BSC | — |
| D | — | 7.0 BSC | — |
| E | — | 0.4 BSC | — |
| F | 0.13 | 0.18 | 0.23 |
| G | 1.35 | 1.40 | 1.45 |
| H | — | — | 1.60 |
| I | 0.05 | — | 0.15 |
| J | 0.45 | 0.60 | 0.75 |
| K | 0.09 | — | 0.20 |
| α | 0° | — | 7° |

> **Visual reference:** Consult original PDF page 32 for diagrams and visual layout.

### PDF page 33 — 80-pin LQFP Dimensions

<!-- source: HT16C24A_AGv100.pdf#page=33 -->

```text
80-pin LQFP (10mm×10mm) Outline Dimensions

                                                 Dimensions in inch
        Symbol
                                     Min.                 Nom.                   Max.
         A            ―                    0.472 BSC          ―
         B            ―                    0.394 BSC          ―
         C            ―                    0.472 BSC          ―
         D            ―                    0.394 BSC          ―
         E            ―                    0.016 BSC          ―
          F                       0.007                     0.009                     0.011
        G                      0.053                     0.055                     0.057
         H            ―            ―                      0.063
                       I                       0.002           ―                      0.006
             J                       0.018                     0.024                     0.030
         K                       0.004           ―                      0.008
           α                         0°            ―                         7°

                                                 Dimensions in mm
        Symbol
                                     Min.                 Nom.                   Max.
         A            —                   12 BSC           —
         B            —                   10 BSC           —
         C            —                   12 BSC           —
         D            —                   10 BSC           —
         E            ―                       0.4 BSC           ―
          F                        0.13                       0.18                       0.23
        G                        1.35                        1.4                       1.45
         H            ―            ―                       1.60
                       I                        0.05           —                       0.15
             J                        0.45                       0.60                       0.75
         K                        0.09           ―                       0.20
           α                         0°            ―                         7°
```

#### Extracted table 2 on PDF page 33 (verify layout)

| Symbol | Dimensions in inch |  |  |
| --- | --- | --- | --- |
|  | Min. | Nom. | Max. |
| A | ― | 0.472 BSC | ― |
| B | ― | 0.394 BSC | ― |
| C | ― | 0.472 BSC | ― |
| D | ― | 0.394 BSC | ― |
| E | ― | 0.016 BSC | ― |
| F | 0.007 | 0.009 | 0.011 |
| G | 0.053 | 0.055 | 0.057 |
| H | ― | ― | 0.063 |
| I | 0.002 | ― | 0.006 |
| J | 0.018 | 0.024 | 0.030 |
| K | 0.004 | ― | 0.008 |
| α | 0° | ― | 7° |

#### Extracted table 3 on PDF page 33 (verify layout)

| Symbol | Dimensions in mm |  |  |
| --- | --- | --- | --- |
|  | Min. | Nom. | Max. |
| A | — | 12 BSC | — |
| B | — | 10 BSC | — |
| C | — | 12 BSC | — |
| D | — | 10 BSC | — |
| E | ― | 0.4 BSC | ― |
| F | 0.13 | 0.18 | 0.23 |
| G | 1.35 | 1.4 | 1.45 |
| H | ― | ― | 1.60 |
| I | 0.05 | — | 0.15 |
| J | 0.45 | 0.60 | 0.75 |
| K | 0.09 | ― | 0.20 |
| α | 0° | ― | 7° |

> **Visual reference:** Consult original PDF page 33 for diagrams and visual layout.

### PDF page 34 — Legal Notices

<!-- source: HT16C24A_AGv100.pdf#page=34 -->

```text
  Copyright© 2022 by HOLTEK SEMICONDUCTOR INC. All Rights Reserved.
  The information provided in this document has been produced with reasonable
  care and attention before publication, however, HOLTEK does not guarantee
  that the information is completely accurate. The information contained in this
  publication is provided for reference only and may be superseded by updates.
 HOLTEK disclaims any expressed, implied or statutory warranties, including but
  not limited to suitability for commercialization, satisfactory quality, specifications,
  characteristics, functions, fitness for a particular purpose, and non-infringement of
  any third-party’s rights. HOLTEK disclaims all liability arising from the information
  and its application. In addition, HOLTEK does not recommend the use of
  HOLTEK’ products where there is a risk of personal hazard due to malfunction
  or other reasons. HOLTEK hereby declares that it does not authorise the use of
  these products in life-saving, life-sustaining or safety critical components. Any use
  of HOLTEK’ products in life-saving/sustaining or safety applications is entirely at
  the buyer’s risk, and the buyer agrees to defend, indemnify and hold HOLTEK
  harmless from any damages, claims, suits, or expenses resulting from such use.
  The information provided in this document, including but not limited to the content,
  data, examples, materials, graphs, and trademarks, is the intellectual property
  of HOLTEK (and its licensors, where applicable) and is protected by copyright
  law and other intellectual property laws. No license, express or implied, to any
  intellectual property right, is granted by HOLTEK herein. HOLTEK reserves the
   right to revise the information described in the document at any time without prior
  notice. For the latest information, please contact us.
```

