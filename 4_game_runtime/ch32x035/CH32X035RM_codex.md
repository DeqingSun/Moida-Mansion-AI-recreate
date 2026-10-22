---
title: "CH32X035 应用手册"
version: "V1.8"
source_pdf: "CH32X035RM.PDF"
pages: 244
conversion: "search-oriented Markdown for code/reference lookup"
---

# CH32X035 应用手册

> Converted from the WCH CH32X035 application/reference manual V1.8. The Markdown prioritizes searchable text, section hierarchy, register names, addresses, bit-field descriptions, and extractable tables. Complex block diagrams and bit-layout drawings are represented by their extracted labels; consult the original PDF when visual geometry matters.

## Chapter index

- [说明](#pdf-page-1)
- [第1章 存储器和总线架构](#pdf-page-3)
- [第2章 电源控制（PWR）](#pdf-page-5)
- [第3章 复位和时钟控制（RCC）](#pdf-page-10)
- [第4章 自动唤醒（AWU）](#pdf-page-21)
- [第5章 独立看门狗（IWDG）](#pdf-page-23)
- [第6章 窗口看门狗（WWDG）](#pdf-page-26)
- [第7章 中断和事件（PFIC）](#pdf-page-30)
- [第8章 GPIO及其复用功能（GPIO/AFIO）](#pdf-page-57)
- [第9章 直接存储器访问控制（DMA）](#pdf-page-74)
- [第10章 模拟/数字转换（ADC）](#pdf-page-83)
- [第11章 触摸按键检测（TKEY）](#pdf-page-100)
- [第12章 高级定时器（ADTM）](#pdf-page-104)
- [第13章 通用定时器（GPTM）](#pdf-page-139)
- [第14章 通用同步异步收发器（USART）](#pdf-page-157)
- [第15章 两线通信总线（I2C）](#pdf-page-169)
- [第16章 串行外设接口（SPI）](#pdf-page-182)
- [第17章 运放（OPA）和比较器（CMP）](#pdf-page-194)
- [第18章 USB全速主机/设备控制器（USBFS）](#pdf-page-202)
- [第19章 电子签名（ESIG）](#pdf-page-221)
- [第20章 闪存及用户选择字（FLASH）](#pdf-page-223)
- [第21章 USB PD控制器（USBPD）](#pdf-page-235)
- [第22章 可编程协议I/O微控制器（PIOC）](#pdf-page-242)
- [第23章 调试支持（DBG）](#pdf-page-243)

<a id="pdf-page-1"></a>
<!-- PDF page 1 -->

## 说明

CH32X035 是基于青稞 V4C 内核设计的工业级微控制器。CH32X035 内置全速 USB 和 USB PD PHY，
支持 USB Host 主机和 USB Device 设备功能、USB PD 及 type C 快充功能，内置可编程协议 I/O 控
制器，提供了 2 组 OPA 运放、3 组 CMP 电压比较器、4 组 USART 串口、I2C、SPI、多组定时器、12
位 ADC、14 路 Touchkey 等丰富外设资源。
本手册针对用户的应用开发，提供了 CH32X035 产品的详细使用信息。
有关此系列产品的器件特性请参考以下数据手册：《CH32X035DS0》。
有关 RISC-V 内核的相关信息，可参考 QingKeV4 微处理手册：《QingKeV4_Processor_Manual》。
RISC-V 内核版本对比概览
特点硬件中断快速整数
扩展内存
内核指令集堆栈嵌套中断除法向量表模式
指令保护
版本级数级数通道数周期
青稞 V4B IMAC 2 2 4 9 地址或指令支持无
青稞 V4C IMAC 2 2 4 5 地址或指令支持标准
青稞 V4F IMAFC 3 8 4 5 地址或指令支持标准
CH32X035 产品概览
CH32X035
青稞 V4C 内核
65K 闪存 20K SRAM
ADC(TKey)
2*ADTM
GPTM
4*USART
SPI
I2C
USBFS
USBPD
DMA
PIOC
2*WDG
2*OPA
3*CMP
寄存器中位属性缩写描述：
|  |  |
| --- | --- |
| 寄存器位属性 | 属性描述 |
| RF | 只读属性，读出固定值。 |
| RO | 只读属性，由硬件改变。 |


<a id="pdf-page-2"></a>
<!-- PDF page 2 -->

|  |  |
| --- | --- |
| RZ | 只读属性，读操作后自动位清0 |
| WO | 只写属性（不可读，读值不确定） |
| WA | 只写属性，安全模式下可写入。 |
| WZ | 只写属性，写操作后自动位清0 |
| RW | 可读，可写。 |
| RWA | 可读，安全模式下可写入。 |
| RW1 | 可读，写1有效，写0无效。 |
| RW0 | 可读，写0有效，写1无效。 |
| RW1T | 可读，写0无效，写1翻转。 |
| SC | 自动清除。 |


<a id="pdf-page-3"></a>
<!-- PDF page 3 -->

## 第1章 存储器和总线架构

### 1.1 总线架构

微控制器基于 RISC-V 指令集设计，其架构中将青稞微处理器内核、仲裁单元、DMA 模块、SRAM
存储等部件通过多组总线实现交互。其系统框图见图 1-1。
**图 1-1 CH32X035 系统框图**

@VDD V : 2V~5.5V
FLASH DD
RISC-V (V4C) GND
I-codeBus
CTRL
PFIC RV32
SWCLK IMA(F)C
SDI D-codeBus
SWDIO
Flash
XUM
Memory
DMA Channels
suB
metsyS
SYSCLK
XUM Reset & HBCLK
SRAM MUX & DIV HSI_DIV6_CLK
HSI_47KHZ_CLK
DP USBFS
DM
HSI-RC
RCC
USBPD AWU_CLK
CC1、CC2
IWDG_CLK
N0、N1、N2
P0、P1、P2 OPA1
OUT0、OUT1
4channels
N0、N1、N2 TIM2 3complementary Channels
P0、P1、P2 OPA2 ETR,BIKN
OUT0、OUT1
TIM3 2channels
N0、N1
P0、P1 CMP1
OUT USART2 RX,TX,CTS,RTS,CK
N0、N1
P0、P1 CMP2 USART3 RX,TX,CTS,RTS,CK
OUT HB
USART4 RX,TX,CTS,RTS,CK
N0、N1
P0、P1 CMP3
OUT IWDG
PA0~PA23 GPIOA
WWDG
PB0~ PB21 GPIOB
I2C SCL,SDA
PC0~ PC7
GPIOC
PC14~PC19
PWR
MOSI,MISO,SCK,NSS SPI
PIOC
RX,TX,CTS,RTS,CK USART1
AWU
4channels
3complementary Channels TIM1
ETR,BIKN AFIO
AIN0 ~ AIN13 Tkey
EXTI
(GND)V -
REF ADC
V +
REF
系统中设有：通用 DMA 控制器用以减轻 CPU 负担、提高效率；时钟树分级管理用以降低了外设
总的运行功耗，同时还兼有数据保护机制，时钟安全系统保护机制等措施来增加系统稳定性。
- 指令总线(I-Code)将内核和 FLASH 指令接口相连，预取指在此总线上完成。
- 数据总线(D-Code)将内核和 FLASH 数据接口相连，用于常量加载和调试。
- 系统总线将内核和总线矩阵相连，用于协调内核、DMA、SRAM 和外设的访问。
- DMA 总线负责 DMA 的 HB 主控接口与总线矩阵相连，该总线访问对象是 FLASH 数据、SRAM 和外设。
- 总线矩阵负责的是系统总线、数据总线、DMA 总线、SRAM 和 HB 桥之间的访问协调。

<a id="pdf-page-4"></a>
<!-- PDF page 4 -->

### 1.2 存储器映像

CH32X035 产品包含了程序存储器、数据存储器、内核寄存器和外设寄存器等等，它们都在一个
4GB 的线性空间寻址。
系统存储以小端格式存放数据，即低字节存放在低地址，高字节存放在高地址。
**图 1-2 存储映像**

Reserved
0x50050000
USBPD
0x40027000
PIOC
0x40026C00
Reserved
0x40026800
AWU
0x40026400
OPA
0x40026000
Reserved
0x40023800
USBFS
0x40023400
Reserved
0x40022400
FlashInterface
0x40022000
Reserved
0x40021400
RCC
0x40021000
Reserved
0x40020400
DMA
0x40020000
Reserved
0x40013C00
USART1
0x40013800
Reserved
0x40013400
SPI
0x40013000
TIM1
0x40012C00
Reserved
0xFFFFFFFFF
0x40012800
ADC/TouchKey
Reserved 0x40012400
0xE0100000 Reserved
CorePrivate
Peripherals
0xE0000000 0x40011400
PortC
0x40011000
PortB
Reserved
0x40010C00
PortA
0x40010800
0x1FFFFFFF EXTI
Reserved 0xA0001000 0x40010400
AFIO
0x1FFFF900 0x40010000
OptionBytes Reserved
0x1FFFF800 Reserved
Vendor Bytes
0x1FFFF700 0xA0000000 0x40007400
Reserved PWR
0x40007000
0x1FFF0D00 Reserved
Reserved
SystemFLASH
0x40005800
(BOOT_3KB+256B) 0x70000000
I2C
0x40005400
Reserved
0x1FFF0000
0x40005000
0x60000000 Reserved USART4
0x40004C00
USART3
Reserved 0x40004800
USART2
0x40004400
Peripherals Reserved
0x0800F800 0x40000000
0x40003400
Reserved IWDG
CodeFLASH 0x40003000
WWDG
62KB 0x20005000 0x40002C00
20KBSRAM
0x20000000
0x08000000 Reserved
AliasedtoFlashor
systemmemory FLASH
dependingonBOOT 0x40000800
pins TIM3
0x40000400
0x00000000 0x00000000 TIM2
0x40000000
4Glinearspace
#### 1.2.1 存储器分配

内置 20K 字节的 SRAM，起始地址 0x20000000，支持字节、半字(2 字节)、全字(4 字节)访问。
内置最大 62K 字节的程序闪存存储区(CodeFlash)，用于存储用户应用程序。
内置 3328 字节的系统存储器(bootloader)，用于存储系统引导程序（厂家固化自举加载程序）。
内置 256 字节空间用于厂商配置字存储，出厂前固化，用户不可修改。
内置 256 字节空间用于用户选择字存储。

<a id="pdf-page-5"></a>
<!-- PDF page 5 -->

## 第2章 电源控制（PWR）

### 2.1 概述

系统工作电压 V 范围为 2～5.5V，内置电压调节器提供内核所需的低压电源。
DD
V 和 GND 引脚专门为系统中模拟相关电路供电，包括 ADC 等。V 和 V 作为一些模拟电路的参
DD REF+ REF-
考点，在芯片内部等于 V 及 GND。
DD
**图 2-1 电源结构框图**

VDD power supply domain
V
REF+ AD converter
V Reset module
REF-
Core
Power supply
V Voltage
DD area
regulator
GND
CPU cores
Standby circuit memory
(Wake-up logic, IWDG)
Built-in
digital
I/O circuit
peripherals
### 2.2 电源管理

#### 2.2.1 上电复位和掉电复位

系统内部集成了上电复位 POR 和掉电复位 PDR 电路，当芯片供电电压 V 低于对应门限电压时，
DD
系统被相关电路复位，无需外置额外的复位电路。上电门限电压 V 和掉电门限电压 V 的参数请参
POR PDR
考对应的数据手册。
**图 2-2 POR 和 PDR 的工作示意图**

V
DD
V
POR
20mV Hysteresis
V
PDR
Resetlag time
t
RSTTEMPO
Reset signal 0 1 0
#### 2.2.2 可编程电压监测器

可编程电压监测器 PVD，主要被用于监控系统主电源的变化，与电源控制寄存器 PWR_CTLR 的
PLS[1:0]所设置的门槛电压相比较，配合外部中断寄存器（EXTI）设置，可产生相关中断，以便及
时通知系统进行数据保存等掉电前操作。
具体配置如下：

<a id="pdf-page-6"></a>
<!-- PDF page 6 -->

1） 设置 PWR_CTLR 寄存器的 PLS[1:0]域，选择要监控电压阈值。
2） 可选的中断处理。PVD 功能内部连接 EXTI 模块的第 26 线的上升/下降边沿触发设置，开启此中
断（配置 EXTI），当 V 下降到 PVD 阈值以下或上升到 PVD 阈值之上时就会产生 PVD 中断。
DD
3） 读取 PWR_CSR 状态寄存器的 PVD0 位可获取当前系统主电源与 PLS[1:0]设置阈值关系，执行相应
软处理。当 VDD 电压高于 PLS[1:0]设置阈值，PVD0 位置 0；当 VDD 电压低于 PLS[1:0]设置阈值，
PVD0 位置 1。
**图 2-3 PVD 的工作示意图**

V
DD
Approx.
PVD
20mV
valve value
hysteresis
PVD
output
1 0 1
### 2.3 低功耗模式

在系统复位后，微控制器处于正常工作状态（运行模式），此时可以通过降低系统主频或者关
闭不用外设的时钟或者降低工作外设时钟频率来节省系统功耗。如果系统不需要工作，可设置系统
进入低功耗模式，并通过特定事件让系统跳出此状态。
微控制器目前提供了 3 种低功耗模式，从处理器、外设、电压调节器等的工作差异上分为：
- 睡眠模式：内核停止运行，所有外设（包含内核私有外设）仍在运行。
- 停止模式：停止所有时钟，唤醒后系统继续运行。
- 待机模式：停止所有时钟，唤醒后系统继续运行。
**表 2-1 低功耗模式一览**

| 模式 | 进入 | 唤醒源 | 对时钟的影响 | 电压调节器 |
| --- | --- | --- | --- | --- |
| 睡眠<br>sleep | WFI | 任意中断唤醒 | 内核时钟关闭，<br>其他时钟无影响 | 正常模式 |
|  | WFE | 唤醒事件唤醒 |  |  |
| 停止<br>stop | SLEEPDEEP置1<br>PDDS清0<br>WFI或WFE | 任意外部中断/事件（EXTI 信<br>号）、RST 上的外部复位信号、<br>IWDG复位1 | 关闭HSI、<br>关闭外设时钟 | 正常模式 |
| 待机<br>standby | SLEEPDEEP置1<br>PDDS置1<br>WFI或WFE | 任意外部中断/事件（EXTI 信<br>号）、RST 上的外部复位信号、<br>IWDG复位1 | 关闭HSI、<br>关闭外设时钟 | 低功耗模式 |

注：SLEEPDEEP位属于内核私有外设控制位，参考PFIC_SCTLR寄存器。
（1）使用IWDG复位功能，HSI不可被关闭。
#### 2.3.1 低功耗配置选项

- WFI 和 WFE 方式
WFI：微控制器被具有中断控制器响应的中断源唤醒，系统唤醒后，将最先执行中断服务函数（微
控制器复位除外）。

<a id="pdf-page-7"></a>
<!-- PDF page 7 -->

WFE：唤醒事件触发微控制器将退出低功耗模式。唤醒事件包括：
1） 配置一个外部或内部的 EXTI 线为事件模式，此时无需配置中断控制器；
2） 或者配置某个中断源，等效为 WFI 唤醒，系统优先执行中断服务函数；
3） 或者配置 SEVONPEND 位，开启外设中断使能，但不开启中断控制器中的中断使能，系统唤醒后
需要清除中断挂起位。
- SLEEPONEXIT
启用：执行 WFI 或 WFE 指令后，微控制器确保所有待处理的中断服务退出后进入低功耗模式。
不启用：执行 WFI 或 WFE 指令后，微控制器立即进入低功耗模式。
- SEVONPEND
启用：所有中断或者唤醒事件都可以唤醒通过执行 WFE 进入的低功耗。
不启用：只有在中断控制器中使能的中断或者唤醒事件可以唤醒通过执行 WFE 进入的低功耗。
#### 2.3.2 睡眠模式SLEEP

此模式下，所有的 IO 引脚都保持他们运行模式下的状态，所有的外设时钟都正常，所以进入睡
眠模式前，尽量关闭无用的外设的时钟，以降低功耗。该模式唤醒所需时间最短。
进入：配置内核寄存器控制位 SLEEPDEEP=0，电源控制寄存器 PDDS=0，执行 WFI 或 WFE，可选
SEVONPEND 和 SLEEPONEXIT。
退出：任意中断或者唤醒事件。
#### 2.3.3 停止模式STOP

停止模式是在内核的深睡眠模式（SLEEPDEEP）基础上结合了外设的时钟控制机制，并让电压调
节器的运行处于更低功耗的状态。此模式高频时钟（HSI）域被关闭，SRAM 和寄存器内容保持，IO
引脚状态保持。该模式唤醒后系统可以继续运行，HSI 称为默认系统时钟。
如果正在进行闪存编程，直到对内存访问完成，系统才进入停止模式。
停止模式下可工作模块：独立看门狗（IWDG）。
进入：配置内核寄存器控制位 SLEEPDEEP=1，电源控制寄存器的 PDDS=0，执行 WFI 或 WFE，可
选 SEVONPEND 和 SLEEPONEXIT。
退出：
1) 任意外部中断/事件(在外部中断寄存器中设置)。
2) RST 引脚上外部复位、IWDG 复位。
#### 2.3.4 待机模式STANDBY

待机模式下可工作模块：独立看门狗（IWDG）。此模式高频时钟（HSI）域被关闭，SRAM 和寄
存器内容保持，IO 引脚状态保持。
进入：配置内核寄存器控制位 SLEEPDEEP=1，电源控制寄存器的 PDDS=1，执行 WFI 或 WFE，可
选 SEVONPEND 和 SLEEPONEXIT。
退出：
1) 任意外部中断/事件(在外部中断寄存器中设置)。
2) RST 引脚上外部复位、IWDG 复位。
#### 2.3.5 AWU自动唤醒

AWU 模块可以实现无需外部中断的情况下自动唤醒。通过对时间基数进行编程，可周期性地从
停止或待机模式下唤醒。
选择内部高速时钟 HSI 的 47KHz 分频时钟作为 AWU 模块时钟源。
AWU 模块能够把 MCU 从停机模式下唤醒，为了实现此功能，需要配置外部中断线 27。

<a id="pdf-page-8"></a>
<!-- PDF page 8 -->

### 2.4 寄存器描述

**表 2-2 PWR 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R32_PWR_CTLR | 0x40007000 | 电源控制寄存器 | 0x00000400 |
| R32_PWR_CSR | 0x40007004 | 电源控制/状态寄存器 | 0x00000000 |

#### 2.4.1 电源控制寄存器（PWR_CTLR）

偏移地址：0x00
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reser
Reserved LP[1:0] LP_REG Reserved PLS[1:0] Reserved PDDS
ved
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:12] | Reserved | RO | 保留。 | 0 |
| [11:10] | LP[1:0] | RW | 软件配置FLASH的状态：<br>00：空闲；<br>x1：睡眠； | 01b |
| 9 | LP_REG | RW | 和LP字段结合，软件配置FLASH进入低功耗模式的使<br>能：<br>1：可以使FLASH进入低功耗模式；<br>0：无法通过软件使FLASH进入低功耗模式。 | 0 |
| [8:7] | Reserved | RO | 保留。 | 0 |
| [6:5] | PLS[1:0] | RW | PVD电压监测阈值设置。<br>详细说明见数据手册中电气特性部分。<br>00：上升沿2.12V/下降沿2.1V；<br>01：上升沿2.32V/下降沿2.3V；<br>10：上升沿3.02V/下降沿3V；<br>11：上升沿4.02V/下降沿4V。 | 0 |
| [4:2] | Reserved | RO | 保留。 | 0 |
| 1 | PDDS | RW | 掉电深睡眠情景下，待机/停机模式选择位：<br>1：进入待机模式；<br>0：进入停止模式。 | 0 |
| 0 | Reserved | RO | 保留。 | 0 |

#### 2.4.2 电源控制/状态寄存器（PWR_CSR）

偏移地址：0x04
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved flash_ Reserved PVD0 Reserved

<a id="pdf-page-9"></a>
<!-- PDF page 9 -->

ack
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:10] | Reserved | RO | 保留。 | 0 |
| 9 | Flash_ack | RO | FLASH状态位：<br>1：表示FLASH处于低功耗模式；<br>0：表示FLASH处于正常模式。 | 0 |
| [8:3] | Reserved | RO | 保留。 | 0 |
| 2 | PVD0 | RO | PVD输出状态标志位：<br>1：VDD低于PLS[1:0]设定的PVD阈值；<br>0：VDD高于PLS[1:0]设定的PVD阈值。 | 0 |
| [1:0] | Reserved | RO | 保留。 | 0 |


<a id="pdf-page-10"></a>
<!-- PDF page 10 -->

## 第3章 复位和时钟控制（RCC）

控制器根据电源区域的划分以及应用中的外设功耗管理考虑，提供了不同的复位形式以及可配
置的时钟树结构。此章节描述了系统中各个时钟的作用域。
### 3.1 主要特性

- 多种复位形式
- 多路时钟源，总线时钟管理
- 各外设时钟独立管理：复位、开启、关闭
- 支持内部时钟输出
### 3.2 复位

控制器提供了 2 种复位形式：电源复位和系统复位
#### 3.2.1 电源复位

电源复位发生时，将复位所有寄存器，应用程序中的 PC 指针固定在地址 0x00000004（Reset
向量表）。
其产生条件包括：
- 上电/掉电复位(POR/PDR 复位)
#### 3.2.2 系统复位

系统复位发生时，将复位除了控制/状态寄存器 RCC_RSTSCKR 中的复位标志和所有寄存器。通过
查看 RCC_RSTSCKR 寄存器中的复位状态标志位识别复位事件来源。
其产生条件包括：
- RST 引脚上的低电平信号（外部复位）
- 窗口看门狗计数终止(WWDG 复位)
- 独立看门狗计数终止(IWDG 复位)
- 软件复位(SW 复位)
- 低功耗管理复位
- 内核死锁复位
- OPA 复位
- USBPD 复位
- ADC 复位
窗口/独立看门狗复位：由窗口/独立看门狗外设定时器计数周期溢出触发产生，详细描述看其
相应章节。
软件复位：通过可编程中断控制器 PFIC 中的中断配置寄存器 PFIC_CFGR 的 SYSRST 位置 1 复位
系统或配置寄存器 PFIC_SCTLR 的 SYSRST 位置 1 复位系统，具体参考对应章节。
低功耗管理复位：通过将用户选择字节中的 STANDY_RST 位置 0，将启用待机模式复位。这时执
行了进入待机模式的过程后，将执行系统复位而不是进入待机模式。通过将用户选择字节中的
STOP_RST 位置 0，将启用停机模式复位。这时执行了进入停机模式的过程后，将执行系统复位而不
是进入停机模式。
内核死锁复位：在 PFIC_SCTLR 寄存器 RSTEN 为 0 时，当内核取址异常或者进入 NMI 中断会产生
死锁复位，说明：在调式模式下无法产生死锁复位。
OPA 复位：在 OPA 复位使能开启的情况下，运放输出高电平会产生 OPA 复位。

<a id="pdf-page-11"></a>
<!-- PDF page 11 -->

USBPD 复位：当 PD_RST_EN 为 1 时，CH32X035 支持 USB PD 信号帧 Hard Reset 产生的复位；如
果 IE_RX_RESET 也为 1，则还支持信号帧 Cable Reset 产生的复位。USB PD 没有复位标志，但产生
的复位效果同软件复位。
ADC 复位：在 ADC 看门狗复位使能开启的情况下，当 ADC 数据大于看门狗高阈值或者小于看门
狗低阈值时会产生 ADC 复位。
**图 3-1 系统复位结构**

V
DD
R
PU
RST
System
Reset
Power Reset
SoftwareReset
WWDGReset
IWDGReset
Low-power management Reset
Core Deadlock Reset
OPA Reset
USBPD Reset
ADCReset

<a id="pdf-page-12"></a>
<!-- PDF page 12 -->

### 3.3 时钟

#### 3.3.1 系统时钟结构

**图 3-2 CH32X035 时钟树框图**

48MHz SYSCLK
/1024 to AWU/IWDG
HSI RC
CLK_DIV[3:0] to ADC
MCO[1:0]
USBCLK
HSI
/6 to Flash prog IF
MCO
HCLK
HB prescaler
/1,/2.../256
to PIOC
to Flash prog IF(register)
HCLK
to HB bus/core/memory/OPA
FCLK core free running clock
to Core System timer
/8
enable to SRAM
enable to USBPD/USBFS/DMA
enable to TIM1/SPI/USART1
enable to AFIO/IOPA/IOPB/IOPC
enable to I2C/WWDG/PWR
enable to USART2/USART3/USART4
enable to TIM2/TIM3

<a id="pdf-page-13"></a>
<!-- PDF page 13 -->

#### 3.3.2 高速时钟（HSI）

HSI 是系统内部 48MHz 的 RC 振荡器产生的高速时钟信号。HSI RC 振荡器能够在不需要任何外部
器件的条件下提供系统时钟。它的启动时间很短。HSI 通过设置 RCC_CTLR 寄存器中的 HSION 位被启
动和关闭，HSIRDY 位指示 HSI RC 振荡器是否稳定。系统默认 HSION 和 HSIRDY 置 1（建议不要关闭）。
- 出厂校准：制造工艺的差异会导致每个芯片的 RC 振荡频率不同，所以在芯片出厂前，会为每颗
芯片进行 HSI 校准。系统复位后，工厂校准值被装载到 RCC_CTLR 寄存器的 HSICAL[7:0]中。
- 用户调整：基于不同的电压或环境温度，应用程序可以通过 RCC_CTLR 寄存器里的 HSITRIM[4:0]
位来调整 HSI 频率。
#### 3.3.3 总线/外设时钟

##### 3.3.3.1 系统时钟（SYSCLK）

默认 HSI 时钟为系统时钟源。
##### 3.3.3.2 HB总线外设时钟（HCLK）

通过配置 RCC_CFGR0 寄存器的 HPRE[3:0]位，可以配置 HB 总线的时钟。总线时钟决定了挂载在
其下面的外设接口访问时钟基准。应用程序可以调整不同的数值，来降低部分外设工作时的功耗。
通过 RCC_AHBRSTR、RCC_APB1PRSTR、RCC_APB2PRSTR 寄存器中各个位可以复位不同的外设模块，
将其恢复到初始状态。
通过 RCC_AHBPCENR、RCC_APB1PCENR、RCC_APB2PCENR 寄存器中各个位可以单独开启或关闭不同
外设模块通讯时钟接口。使用某个外设时，首先需要开启其时钟使能位，才能访问其寄存器。
##### 3.3.3.3 独立看门狗时钟

如果独立看门狗已经由硬件配置设置或软件启动，HSI 振荡器将被强制打开，并且不能被关闭。
在 HSI 振荡器稳定后，时钟供应给 IWDG。
##### 3.3.3.4 时钟输出（MCO）

微控制器允许输出时钟信号到 MCO 引脚。在相应的 GPIO 端口寄存器配置复用推挽输出模式，通
过配置 RCC_CFGR0 寄存器 MCO[2:0]位，可以选择以下 2 个时钟信号作为 MCO 时钟输出：
- 系统时钟(SYSCLK)输出
- HSI 时钟输出
### 3.4 寄存器描述

**表 3-1 RCC 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R32_RCC_CTLR | 0x40021000 | 时钟控制寄存器 | 0x0000xx83 |
| R32_RCC_CFGR0 | 0x40021004 | 时钟配置寄存器0 | 0x00000050 |
| R32_RCC_APB2PRSTR | 0x4002100C | PB2外设复位寄存器 | 0x00000000 |
| R32_RCC_APB1PRSTR | 0x40021010 | PB1外设复位寄存器 | 0x00000000 |
| R32_RCC_AHBPCENR | 0x40021014 | HB外设时钟使能寄存器 | 0x00021004 |
| R32_RCC_APB2PCENR | 0x40021018 | PB2外设时钟使能寄存器 | 0x00000000 |
| R32_RCC_APB1PCENR | 0x4002101C | PB1外设时钟使能寄存器 | 0x00000000 |
| R32_RCC_RSTSCKR | 0x40021024 | 控制/状态寄存器 | 0x0C000000 |
| R32_RCC_AHBRSTR | 0x40021028 | HB外设复位寄存器 | 0x00000000 |

#### 3.4.1 时钟控制寄存器（RCC_CTLR）


<a id="pdf-page-14"></a>
<!-- PDF page 14 -->

偏移地址：0x00
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reser HSI
HSICAL[7:0] HSITRIM[4:0] HSION
ved RDY
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:16] | Reserved | RW | 保留。 | 0 |
| [15:8] | HSICAL[7:0] | RO | 内部高速时钟校准值，在系统启动时被自动初始化。 | X |
| [7:3] | HSITRIM[4:0] | RW | 内部高速时钟调整值：<br>用户可以输入一个调整值叠加到HSICAL[7:0]数值上，<br>根据电压和温度的变化调整内部 HSI RC 振荡器的频<br>率。<br>默认值为 16，可以把 HSI 调整到 48MHz±1%；每步<br>HSICAL的变化调整约110KHz。 | 10000b |
| 2 | Reserved | RO | 保留。 | 0 |
| 1 | HSIRDY | RO | 内部高速时钟HSI稳定就绪标志位（由硬件置位）：<br>1：内部高速时钟HSI稳定；<br>0：内部高速时钟HSI没有稳定。<br>注：在HSION位清0后，该位需要6个HSI周期清0。 | 1 |
| 0 | HSION | RW | 内部高速时钟HSI使能控制位：<br>1：使能HSI振荡器；<br>0：关闭HSI振荡器。 | 1 |

#### 3.4.2 时钟配置寄存器0（RCC_CFGR0）

偏移地址：0x04
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved MCO[2:0] Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved HPRE[3:0] Reserved
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:27] | Reserved | RO | 保留。 | 0 |
| [26:24] | MCO[2:0] | RW | 微控制器MCO引脚时钟输出控制[1:0]：<br>100：系统时钟输出；<br>101：HSI时钟输出；<br>其他：没有时钟输出。 | 0 |
| [23:8] | Reserved | RO | 保留。 | 0 |
| [7:4] | HPRE[3:0] | RW | HB时钟来源预分频控制：<br>0000：SYSCLK 不分频；<br>0001：SYSCLK 2分频；<br>0010：SYSCLK 3分频； | 0101b |


<a id="pdf-page-15"></a>
<!-- PDF page 15 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 0011：SYSCLK 4分频；<br>0100：SYSCLK 5分频；<br>0101：SYSCLK 6分频；<br>0110：SYSCLK 7分频；<br>0111：SYSCLK 8分频；<br>1000：SYSCLK 2分频；<br>1001：SYSCLK 4分频；<br>1010：SYSCLK 8分频；<br>1011：SYSCLK 16分频；<br>1100：SYSCLK 32分频；<br>1101：SYSCLK 64分频；<br>1110：SYSCLK 128分频；<br>1111：SYSCLK 256分频。<br>注：当HB时钟来源的预分频系数大于1时，必须开启<br>预取缓冲器。 |  |
| [3:0] | Reserved | RO | 保留。 | 0 |

#### 3.4.3 PB2外设复位寄存器（RCC_APB2PRSTR）

偏移地址：0x0C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Rese USART1 Rese SPI1 TIM1 Reser ADC1 IOPC IOPB IOPA Reser AFIO
Reserved
rved RST rved RST RST ved RST RST RST RST ved RST
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:15] | Reserved | RO | 保留。 | 0 |
| 14 | USART1RST | RW | USART1接口复位控制：<br>1：复位模块； 0：无作用。 | 0 |
| 13 | Reserved | RO | 保留。 | 0 |
| 12 | SPI1RST | RW | SPI1接口复位控制：<br>1：复位模块； 0：无作用。 | 0 |
| 11 | TIM1RST | RW | TIM1模块复位控制：<br>1：复位模块； 0：无作用。 | 0 |
| 10 | Reserved | RO | 保留。 | 0 |
| 9 | ADC1RST | RW | ADC1模块复位控制：<br>1：复位模块； 0：无作用。 | 0 |
| [8:5] | Reserved | RO | 保留。 | 0 |
| 4 | IOPCRST | RW | IO的PC端口模块复位控制：<br>1：复位模块； 0：无作用。 | 0 |
| 3 | IOPBRST | RW | IO的PB端口模块复位控制：<br>1：复位模块； 0：无作用。 | 0 |
| 2 | IOPARST | RW | IO的PA端口模块复位控制：<br>1：复位模块； 0：无作用。 | 0 |


<a id="pdf-page-16"></a>
<!-- PDF page 16 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| 1 | Reserved | RO | 保留。 | 0 |
| 0 | AFIORST | RW | IO辅助功能模块复位控制：<br>1：复位模块； 0：无作用。 | 0 |

#### 3.4.4 PB1外设复位寄存器（RCC_APB1PRSTR）

偏移地址：0x10
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
PWR I2C1 Rese USART USART USART Rese
Reserved Reserved
RST RST rved 4RST 3RST 2RST rved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
WWDG TIM3 TIM2
Reserved Reserved
RST RST RST
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:29] | Reserved | RO | 保留。 | 0 |
| 28 | PWRRST | RW | 电源接口模块复位控制：<br>1：复位模块； 0：无作用。 | 0 |
| [27:22] | Reserved | RO | 保留。 | 0 |
| 21 | I2C1RST | RW | I2C1接口复位控制：<br>1：复位模块； 0：无作用。 | 0 |
| 20 | Reserved | RW | 保留。 | 0 |
| 19 | USART4RST | RW | USART4接口复位控制：<br>1：复位模块； 0：无作用。 | 0 |
| 18 | USART3RST | RW | USART3接口复位控制：<br>1：复位模块； 0：无作用。 | 0 |
| 17 | USART2RST | RW | USART2接口复位控制：<br>1：复位模块； 0：无作用。 | 0 |
| [16:12] | Reserved | RO | 保留。 | 0 |
| 11 | WWDGRST | RW | 窗口看门狗复位控制：<br>1：复位模块； 0：无作用。 | 0 |
| [10:2] | Reserved | RO | 保留。 | 0 |
| 1 | TIM3RST | RW | 定时器3模块复位控制：<br>1：复位模块； 0：无作用。 | 0 |
| 0 | TIM2RST | RW | 定时器2模块复位控制：<br>1：复位模块； 0：无作用。 | 0 |

#### 3.4.5 HB外设时钟使能寄存器（RCC_AHBPCENR）

偏移地址：0x14
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
USBP Reser
Reserved
D ved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved USBFS Reserved SRAM Rese DMA1

<a id="pdf-page-17"></a>
<!-- PDF page 17 -->

EN EN rved EN
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:18] | Reserved | RO | 保留。 | 0 |
| 17 | USBPD | RW | USBPD时钟使能：<br>1：USBPD时钟开启；<br>0：USBPD时钟关闭。 | 1 |
| [16:13] | Reserved | RO | 保留。 | 0 |
| 12 | USBFSEN | RW | USBFS模块时钟使能位：<br>1：模块时钟开启； 0：模块时钟关闭。 | 1 |
| [11:3] | Reserved | RO | 保留。 | 0 |
| 2 | SRAMEN | RW | SRAM接口模块时钟使能位：<br>1：睡眠模式时，SRAM接口模块时钟开启；<br>0：睡眠模式时，SRAM接口模块时钟关闭。 | 1 |
| 1 | Reserved | RO | 保留。 | 0 |
| 0 | DMA1EN | RW | DMA1模块时钟使能位：<br>1：模块时钟开启； 0：模块时钟关闭。 | 0 |

#### 3.4.6 PB2外设时钟使能寄存器（RCC_APB2PCENR）

偏移地址：0x18
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reser USART1 Reser SPI1 TIM1 Reser ADC1 IOPC IOPB IOPA Reser AFIO
Reserved
ved EN ved EN EN ved EN EN EN EN ved EN
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:15] | Reserved | RO | 保留。 | 0 |
| 14 | USART1EN | RW | USART1接口时钟使能位：<br>1：模块时钟开启； 0：模块时钟关闭。 | 0 |
| 13 | Reserved | RO | 保留。 | 0 |
| 12 | SPI1EN | RW | SPI1接口时钟使能位：<br>1：模块时钟开启； 0：模块时钟关闭。 | 0 |
| 11 | TIM1EN | RW | TIM1模块时钟使能位：<br>1：模块时钟开启； 0：模块时钟关闭。 | 0 |
| 10 | Reserved | RO | 保留。 | 0 |
| 9 | ADC1EN | RW | ADC1模块时钟使能位：<br>1：模块时钟开启； 0：模块时钟关闭。 | 0 |
| [8:5] | Reserved | RO | 保留。 | 0 |
| 4 | IOPCEN | RW | IO的PC端口模块时钟使能位：<br>1：模块时钟开启； 0：模块时钟关闭。 | 0 |
| 3 | IOPBEN | RW | IO的PB端口模块时钟使能位：<br>1：模块时钟开启； 0：模块时钟关闭。 | 0 |


<a id="pdf-page-18"></a>
<!-- PDF page 18 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| 2 | IOPAEN | RW | IO的PA端口模块时钟使能位：<br>1：模块时钟开启； 0：模块时钟关闭。 | 0 |
| 1 | Reserved | RO | 保留。 | 0 |
| 0 | AFIOEN | RW | IO辅助功能模块时钟使能位：<br>1：模块时钟开启； 0：模块时钟关闭。 | 0 |

#### 3.4.7 PB1外设时钟使能寄存器（RCC_APB1PCENR）

偏移地址：0x1C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
PWR I2C1 Reser USART4 USART3 USART2 Reser
Reserved Reserved
EN EN ved EN EN EN ved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
WWDG TIM3 TIM2
Reserved Reserved
EN EN EN
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:29] | Reserved | RO | 保留。 | 0 |
| 28 | PWREN | RW | 电源接口模块时钟使能位：<br>1：模块时钟开启； 0：模块时钟关闭。 | 0 |
| [27:22] | Reserved | RO | 保留。 | 0 |
| 21 | I2C1EN | RW | I2C1接口时钟使能位：<br>1：模块时钟开启； 0：模块时钟关闭。 | 0 |
| 20 | Reserved | RO | 保留。 | 0 |
| 19 | USART4EN | RW | USART4接口时钟使能位：<br>1：模块时钟开启； 0：模块时钟关闭。 | 0 |
| 18 | USART3EN | RW | USART3接口时钟使能位：<br>1：模块时钟开启； 0：模块时钟关闭。 | 0 |
| 17 | USART2EN | RW | USART2接口时钟使能位：<br>1：模块时钟开启； 0：模块时钟关闭。 | 0 |
| [16:12] | Reserved | RO | 保留。 | 0 |
| 11 | WWDGEN | RW | 窗口看门狗时钟使能位：<br>1：模块时钟开启； 0：模块时钟关闭。 | 0 |
| [10:2] | Reserved | RO | 保留。 | 0 |
| 1 | TIM3EN | RW | 定时器3模块时钟使能位：<br>1：模块时钟开启； 0：模块时钟关闭。 | 0 |
| 0 | TIM2EN | RW | 定时器2模块时钟使能位：<br>1：模块时钟开启； 0：模块时钟关闭。 | 0 |

#### 3.4.8 控制/状态寄存器（RCC_RSTSCKR）

偏移地址：0x24
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
LPWR WWDG IWDG SFT POR PIN OPA
RMVF Reserved
RSTF RSTF RSTF RSTF RSTF RSTF RSTF

<a id="pdf-page-19"></a>
<!-- PDF page 19 -->

15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 31 | LPWRRSTF | RW | 低功耗复位标志：<br>1：发生低功耗复位；<br>0：无低功耗复位发生。<br>发生低功耗管理复位时由硬件置1；软件写RMVF位清<br>除。 | 0 |
| 30 | WWDGRSTF | RW | 窗口看门狗复位标志：<br>1：发生窗口看门狗复位；<br>0：无窗口看门狗复位发生。<br>发生窗口看门狗复位时由硬件置1；软件写RMVF位清<br>除。 | 0 |
| 29 | IWDGRSTF | RW | 独立看门狗复位标志：<br>1：发生独立看门狗复位；<br>0：无独立看门狗复位发生。<br>发生独立看门狗复位时由硬件置1；软件写RMVF位清<br>除。 | 0 |
| 28 | SFTRSTF | RW | 软件复位标志：<br>1：发生软件复位；<br>0：无软件复位发生。<br>发生软件复位时由硬件置1；软件写RMVF位清除。 | 0 |
| 27 | PORRSTF | RW | 上电/掉电复位标志：<br>1：发生上电/掉电复位；<br>0：无上电/掉电复位发生。<br>发生上电/掉电复位时由硬件置 1；软件写 RMVF 位清<br>除。 | 1 |
| 26 | PINRSTF | RW | 外部手动复位（RST引脚）标志：<br>1：发生RST引脚复位；<br>0：无RST引脚复位发生。<br>在RST引脚复位发生时由硬件置1；软件写RMVF位清除。 | 0 |
| 25 | OPARSTF | RW | OPA复位标志控制：<br>1：OPA复位标志；<br>0：无作用。 | 0 |
| 24 | RMVF | RW | 清除复位标志控制：<br>1：清除复位标志；<br>0：无作用。 | 0 |
| [23:0] | Reserved | RO | 保留。 | 0 |

注：除复位标志只能由上电复位清除，其他由系统复位清除。
#### 3.4.9 HB外设复位寄存器（RCC_AHBRSTR）

偏移地址：0x28
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16

<a id="pdf-page-20"></a>
<!-- PDF page 20 -->

USBPD Reser
Reserved
RST ved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
PIOC USBFS
Reserved Reserved
RST RST
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:18] | Reserved | RO | 保留。 | 0 |
| 17 | USBPDRST | RW | USBPD复位控制：<br>1：复位模块； 0：无作用。 | 0 |
| [16:14] | Reserved | RO | 保留。 | 0 |
| 13 | PIOCRST | RW | PIOC复位控制：<br>1：复位模块； 0：无作用。 | 0 |
| 12 | USBFSRST | RW | USBFS模块复位控制：<br>1：复位模块； 0：无作用。 | 0 |
| [11:0] | Reserved | RO | 保留。 | 0 |


<a id="pdf-page-21"></a>
<!-- PDF page 21 -->

## 第4章 自动唤醒（AWU）

AWU 模块可以实现无需外部中断的情况下自动唤醒。通过对时间基数进行编程，可周期性地从
停止或待机模式下唤醒。
### 4.1 主要特征

- 6 位自加型计数器
- 选择内部高速时钟 HSI 的 47KHz 分频时钟作为 AWU 模块时钟源，可以在低功耗模式下运行
- 唤醒条件：计数器计数到与写进去的值相等时
### 4.2 功能说明

AWU 模块能够把 MCU 从低功耗模式下唤醒，为了实现此功能，需要把外部中断线 27 配置为上升
沿中断。
### 4.3 寄存器描述

**表 4-1 AWU 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R16_AWU_CSR | 0x40026400 | 控制状态寄存器 | 0x0000 |
| R16_AWU_WR | 0x40026404 | 唤醒窗口寄存器 | 0x003F |
| R16_AWU_PSC | 0x40026408 | 分频因子寄存器 | 0x0000 |

#### 4.3.1 AWU控制状态寄存器（AWU_CSR）

偏移地址：0x00
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reser
Reserved AWUEN
ved
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:2] | Reserved | RO | 保留。 | 0 |
| 1 | AWUEN | RW | AWU唤醒使能：<br>1：打开自动唤醒；<br>0：关闭自动唤醒。 | 0 |
| 0 | Reserved | RO | 保留。 | 0 |

#### 4.3.2 AWU唤醒窗口寄存器（AWU_WR）

偏移地址：0x04
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved AWU_APR[5:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:6] | Reserved | RO | 保留。 | 0 |
| [5:0] | AWU_APR[5:0] | RW | 窗口值，用来与计数器值进行比较，二者相等<br>产生唤醒信号。 | 0x3F |


<a id="pdf-page-22"></a>
<!-- PDF page 22 -->

#### 4.3.3 AWU分频因子寄存器（AWU_PSC）

偏移地址：0x08
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved AWU_TBR[3:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:4] | Reserved | RO | 保留。 | 0 |
| [3:0] | AWU_TBR[3:0] | RW | 分频因子：<br>0000：不分频；<br>0001：不分频；<br>0010：2分频；<br>0011：4分频；<br>0100：8分频；<br>0101：16分频；<br>0110：32分频；<br>0111：64分频；<br>1000：128分频；<br>1001：256分频；<br>1010：512分频；<br>1011：1024分频；<br>1100：2048分频；<br>1101：4096分频；<br>1110：10240分频；<br>1111：61440分频。 | 0 |


<a id="pdf-page-23"></a>
<!-- PDF page 23 -->

## 第5章 独立看门狗（IWDG）

系统设有独立看门狗（IWDG）用来检测逻辑错误和外部环境干扰引起的软件故障。IWDG 时钟源
来自于内部高速时钟 HSI 的 1024 分频（47KHz），可独立于主程序之外运行，适用于对精度要求低
的场合。
### 5.1 主要特征

- 12 位自减型计数器
- 时钟来源 HSI 的 1024 分频（47KHz），可以在低功耗模式下运行
- 复位条件：计数器值减到 0
### 5.2 功能说明

#### 5.2.1 原理和用法

独立看门狗的时钟来源 HSI 时钟，其功能在停机和待机模式时仍能正常工作。当看门狗计数器
自减到 0 时，将会产生系统复位，所以超时时间为（重装载值+1）个时钟。
**图 5-1 独立看门狗的结构框图**

CORE
Prescaler register Status register Reload register Control register
IWDG_PSCR IWDG_STATR IWDG_RLDR IWDG_CTLR
12-bitreloadvalue
8-bit
HSI
prescaler
47kHz)
12-bitdowncounter IWDG reset
VDD voltage domain
- 启动独立看门狗
系统复位后，看门狗处于关闭状态，向 IWDG_CTLR 寄存器写 0xCCCC 开启看门狗，随后它不能再
被关闭，除非发生复位。
如果在用户选择字开启了硬件独立看门狗使能位（IWDG_SW），在微控制器复位后将固定开启
IWDG。
- 看门狗配置
看门狗内部是一个递减运行的 12 位计数器，当计数器的值减为 0 时，将发生系统复位。开启
IWDG 功能，需要执行下面几点操作：
1) 计数时基：IWDG 时钟来源 HSI 的 1024 分频，通过 IWDG_PSCR 寄存器设置 HSI 分频值时钟作为
IWDG 的计数时基。操作方法先向 IWDG_CTLR 寄存器写 0x5555，再修改 IWDG_PSCR 寄存器中的分
频值。IWDG_STATR 寄存器中的 PVU 位指示了分频值更新状态，在更新完成的情况下才可以进行
分频值的修改和读出。
2) 重装载值：用于更新独立看门狗中计数器当前值，并且计数器由此值进行递减。操作方法先向
IWDG_CTLR 寄存器写 0x5555，再修改 IWDG_RLDR 寄存器设置目标重装载值。IWDG_STATR 寄存器
中的 RVU 位指示了重装载值更新状态，在更新完成的情况下才可以进行 IWDG_RLDR 寄存器的修
改和读出。
3) 看门狗使能：向 IWDG_CTLR 寄存器写 0xCCCC，即可开启看门狗功能。
4) 喂狗：即在看门狗计数器递减到 0 前刷新当前计数器值防止发生系统复位。向 IWDG_CTLR 寄存

<a id="pdf-page-24"></a>
<!-- PDF page 24 -->

器写 0xAAAA，让硬件将 IWDG_RLDR 寄存值更新到看门狗计数器中。此动作需要在看门狗功能开
启后定时执行，否则会出现看门狗复位动作。
#### 5.2.2 调试模式

系统进入调试模式时，可以由调试模块寄存器配置 IWDG 的计数器继续工作或停止。
### 5.3 寄存器描述

**表 5-1 IWDG 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R16_IWDG_CTLR | 0x40003000 | 控制寄存器 | 0x0000 |
| R16_IWDG_PSCR | 0x40003004 | 分频因子寄存器 | 0x0000 |
| R16_IWDG_RLDR | 0x40003008 | 重装载值寄存器 | 0x0FFF |
| R16_IWDG_STATR | 0x4000300C | 状态寄存器 | 0x0000 |

#### 5.3.1 IWDG控制寄存器（IWDG_CTLR）

偏移地址：0x00
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
KEY[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:0] | KEY[15:0] | WO | 操作键值锁。<br>0xAAAA：喂狗。加载IWDG_RLDR寄存器值到独<br>立看门狗计数器中；<br>0x5555：允许修改IWDG_PSCR和IWDG_RLDR寄<br>存器；<br>0xCCCC：启动看门狗，如果启用了硬件看门狗<br>（用户选择字配置）则不受这个限制。 | 0 |

#### 5.3.2 分频因子寄存器（IWDG_PSCR）

偏移地址：0x04
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved PR[2:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:3] | Reserved | RO | 保留。 | 0 |
| [2:0] | PR[2:0] | RW | IWDG时钟分频系数，修改此域前要向KEY中写<br>0x5555。<br>000：4分频； 001：8分频；<br>010：16分频； 011：32分频；<br>100：64分频； 101：128分频；<br>110：256分频； 111：256分频。<br>IWDG计数时基=HSI/1024/分频系数。<br>注：读该域值前，要确保IWDG_STATR 寄存器 | 0 |


<a id="pdf-page-25"></a>
<!-- PDF page 25 -->

中的PVU位为0，否则读出值无效。
#### 5.3.3 重装载值寄存器（IWDG_RLDR）

偏移地址：0x08
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved RL[11:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:12] | Reserved | RO | 保留。 | 0 |
| [11:0] | RL[11:0] | RW | 计数器重装载值。修改此域前要向 KEY 中写<br>0x5555。<br>当向 KEY 中写 0xAAAA 后，此域的值将会被硬<br>件装载到计数器中，随后计数器从这个值开始<br>递减计数。<br>注：读写该域值前，要确保IWDG_STATR寄存<br>器中的RVU位为0，否则读写此域无效。 | 0xFFF |

#### 5.3.4 状态寄存器（IWDG_STATR）

偏移地址：0x0C
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved RVU PVU
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:2] | Reserved | RO | 保留。 | 0 |
| 1 | RVU | RO | 重装值更新标志位。硬件置位或清0。<br>1：重装载值更新正在进行中；<br>0：重装载更新结束（最多5个HSI周期）。<br>注：重装载值寄存器IWDG_RLDR只有在RVU位<br>被清0后才可读写访问。 | 0 |
| 0 | PVU | RO | 时钟分频系数更新标志位。硬件置位或清0。<br>1：时钟分频值更新正在进行中；<br>0：时钟分频值更新结束（最多5个HSI周期）。<br>注：分频因子寄存器IWDG_PSCR只有在PVU位<br>被清0后才可读写访问。 | 0 |

注：在预分频或重装值更新后，不必等待RVU或PVU复位，可继续执行下面的代码。(即使在低功耗
模式下，此写操作仍会被继续执行完成。)

<a id="pdf-page-26"></a>
<!-- PDF page 26 -->

## 第6章 窗口看门狗（WWDG）

窗口看门狗一般用来监测系统运行的软件故障，例如外部干扰、不可预见的逻辑错误等情况。
它需要在一个特定的窗口时间（有上下限）内进行计数器刷新（喂狗），否则早于或者晚于这个窗
口时间看门狗电路都会产生系统复位。
### 6.1 主要特征

- 可编程的 7 位自减型计数器
- 双条件复位：当前计数器值小于 0x40，或者计数器值在窗口时间外被重装载
- 唤醒提前通知功能（EWI），用于及时喂狗动作防止系统复位
### 6.2 功能说明

#### 6.2.1 原理和用法

窗口看门狗运行基于一个 7 位的递减计数器，其挂载在 HB 总线下，计数时基 WWDG_CLK 来源
（HCLK/4096）时钟的分频，分频系数在配置寄存器 WWDG_CFGR 中的 WDGTB[1:0]域设置。递减计数
器处于自由运行状态，无论看门狗功能是否开启，计数器一直循环递减计数。如图 6-1 所示，窗口
看门狗内部结构框图。
**图 6-1 窗口看门狗结构框图**

Watchdog configurationregister(WWDG_CFGR)
- W6 W5 W4 W3 W2 W1 W0
T[6:0]＞ W[6:0]
RESET
WriteWWDG_CTLR[6:0]
Watchdog controlregister(WWDG_CTLR)
WDGA T6 T5 T4 T3 T2 T1 T0
WWDGenablecontrol,software on
WWDG_CLK
HCLK /4096 WDGTB[1:0]
- 启动窗口看门狗
系统复位后，看门狗处于关闭状态，设置 WWDG_CTLR 寄存器的 WDGA 位能够开启看门狗，随后它
不能再被关闭，除非发生复位。
注：可以通过设置RCC_APB1PCENR寄存器关闭WWDG的时钟来源，暂停WWDG_CLK计数，间接停止看
门狗功能，或者通过设置RCC_APB1PRSTR寄存器复位WWDG模块，等效为复位的作用。
- 看门狗配置
看门狗内部是一个不断循环递减运行的 7 位计数器，支持读写访问。使用看门狗复位功能，需
要执行下面几点操作：
1） 计数时基：通过 WWDG_CFGR 寄存器的 WDGTB[1:0]位域，注意要开启 RCC 单元的 WWDG 模块时钟。
2） 窗口计数器：设置 WWDG_CFGR 寄存器的 W[6:0]位域，此计数器由硬件用作和当前计数器比较使
用，数值由用户软件配置，不会改变。作为窗口时间的上限值。
3） 看门狗使能：WWDG_CTLR 寄存器 WDGA 位软件置 1，开启看门狗功能，可以系统复位。

<a id="pdf-page-27"></a>
<!-- PDF page 27 -->

4） 喂狗：即刷新当前计数器值，配置 WWDG_CTLR 寄存器的 T[6:0]位域。此动作需要在看门狗功能
开启后，在周期性的窗口时间内执行，否则会出现看门狗复位动作。
- 喂狗窗口时间
如图 6-2 所示，灰色区域为窗口看门狗的监测窗口区域，其上限时间 t2 对应当前计数器值达到
窗口值 W[6:0]的时间点；其下限时间 t3 对应当前计数器值达到 0x3F 的时间点。此区域时间内
t2<t<t3 可以进行喂狗操作（写 T[6:0]），刷新当前计数器的数值。
**图 6-2 窗口看门狗的计数模式**

Y[6:0]CNT Current value
Max=0x7F Timeout:T *4096*2WDGTB *(T[5:0]+1])
HCLK1
W[6:0]
Windowarea
0x3F
t1 t2 t3
Time
Refreshnotallowed Refresh allowed
T6 bit
RESET
Refreshwillbe
The counter will
resetwithin
reset when CNT
thedisallowed
value<0x40
refreshtime
- 看门狗复位
1） 当没有及时喂狗操作，导致 T[6:0]计数器的值由 0x40 变成 0x3F，将出现“窗口看门狗复位”，
产生系统复位。即 T6-bit 被硬件检测为 0，将出现系统复位。
注：应用程序可以通过软件写T6-bit为0，实现系统复位，等效软件复位功能。
2） 当在不允许喂狗时间内执行计数器刷新动作，即在 t1≤t≤t2 时间内操作写 T[6:0]位域，将出
现“窗口看门狗复位”，产生系统复位。
- 提前唤醒
为了防止没有及时刷新计数器导致系统复位，看门狗模块提供了早期唤醒中断（EWI）通知。当
计数器自减到 0x40 时，产生提前唤醒信号，WEIF 标志置 1，如果置位了 EWI 位，会同时触发窗口看
门狗中断。此时距离硬件复位有 1 个计数器时钟周期（自减为 0x3F），应用程序可在此时间内即时
进行喂狗操作。
#### 6.2.2 调试模式

系统进入调试模式时，可以由调试模块寄存器配置 WWDG 的计数器继续工作或停止。

<a id="pdf-page-28"></a>
<!-- PDF page 28 -->

### 6.3 寄存器描述

**表 6-1 WWDG 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R16_WWDG_CTLR | 0x40002C00 | 控制寄存器 | 0x007F |
| R16_WWDG_CFGR | 0x40002C04 | 配置寄存器 | 0x007F |
| R16_WWDG_STATR | 0x40002C08 | 状态寄存器 | 0x0000 |

#### 6.3.1 WWDG控制寄存器（WWDG_CTLR）

偏移地址：0x00
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved WDGA T[6:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:8] | Reserved | RO | 保留。 | 0 |
| 7 | WDGA | RW1 | 窗口看门狗复位使能位。<br>1：开启看门狗功能（可产生复位信号）；<br>0：禁止看门狗功能。<br>软件写1开启，但是只允许复位后硬件清0。 | 0 |
| [6:0] | T[6:0] | RW | 7位自减计数器，每4096*2WDGTB个HCLK周期自<br>减1。当计数器从0x40自减到0x3F时，即T6<br>跳变为0时，产生看门狗复位。 | 0x7F |

#### 6.3.2 WWDG配置寄存器（WWDG_CFGR）

偏移地址：0x04
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved EWI WDGTB[1:0] W[6:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:10] | Reserved | RO | 保留。 | 0 |
| 9 | EWI | RW1 | 提前唤醒中断使能位。<br>若此位置1，则在计数器的值达到0x40时产生<br>中断。此位只能在复位后由硬件请0。 | 0 |
| [8:7] | WDGTB[1:0] | RW | 窗口看门狗时钟分频选择：<br>00：1分频，计数时基 = HCLK/4096；<br>01：2分频，计数时基 = HCLK/4096/2；<br>10：4分频，计数时基 = HCLK/4096/4；<br>11：8分频，计数时基 = HCLK/4096/8。 | 0 |
| [6:0] | W[6:0] | RW | 窗口看门狗7位窗口值。用来与计数器的值做<br>比较。喂狗操作只能在计数器的值小于窗口值<br>且大于0x3F时进行。 | 0x7F |


<a id="pdf-page-29"></a>
<!-- PDF page 29 -->

#### 6.3.3 WWDG状态寄存器（WWDG_STATR）

偏移地址：0x08
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved EWIF
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:1] | Reserved | WO | 保留。 | 0 |
| 0 | EWIF | RW0 | 提前唤醒中断标志位。<br>当计数器到达 0x40 时，此位会被硬件置位，<br>必须通过软件清 0，用户置位是无效的。即使<br>EWI 未被置位，此位在事件发生时仍会照常被<br>置位。 | 0 |


<a id="pdf-page-30"></a>
<!-- PDF page 30 -->

## 第7章 中断和事件（PFIC）

CH32X035 内置可编程快速中断控制器（PFIC-Programmable Fast Interrupt Controller），
最多支持 255 个中断向量。当前系统管理了 39 个外设中断通道和 7 个内核中断通道，其他保留。
### 7.1 主要特征

#### 7.1.1 PFIC控制器

- 39个外设中断，每个中断请求都有独立的触发和屏蔽控制位，有专用的状态位
- 可编程多级中断嵌套，最大嵌套深度2级，硬件压栈深度2级
- 特有快速中断进出机制，硬件自动压栈和恢复，无需指令开销
- 特有免表VTF（Vector Table Free）中断响应机制，4路可编程直达中断向量地址
### 7.2 系统定时器

- CH32X035 产品
内核自带了一个 64 位加减计数器（SysTick），支持 HCLK 或者 HCLK/8 作为时基，具有较高优
先级，校准后可用于时间基准。
### 7.3 中断和异常的向量表

**表 7-1 CH32X035 产品向量表**

| 编号 | 优先级 | 类型 | 名称 | 描述 | 入口地址 |
| --- | --- | --- | --- | --- | --- |
| 0 | - | - | - | - | 0x00000000 |
| 1 | - | - | - | - | 0x00000004 |
| 2 | -5 | 固定 | NMI | 不可屏蔽中断 | 0x00000008 |
| 3 | -4 | 固定 | HardFault | 异常中断 | 0x0000000C |
| 4 | - | - | - | 保留 | 0x00000010 |
| 5 | -3 | 固定 | Ecall-M | 机器模式回调中断 | 0x00000014 |
| 6-7 | - | - | - | 保留 | 0x00000018-<br>0x0000001C |
| 8 | -2 | 固定 | Ecall-U | 用户模式回调中断 | 0x00000020 |
| 9 | -1 | 固定 | BreakPoint | 刹车回调中断 | 0x00000024 |
| 10-11 | - | - | - | 保留 | 0x00000028-<br>0x0000002C |
| 12 | 0 | 可编程 | SysTick | 系统定时器中断 | 0x00000030 |
| 13 | - | - | - | 保留 | 0x00000034 |
| 14 | 1 | 可编程 | SW | 软件中断 | 0x00000038 |
| 15 | - | - | - | 保留 | 0x0000003C |
| 16 | 2 | 可编程 | WWDG | 窗口定时器中断 | 0x00000040 |
| 17 | 3 | 可编程 | PVD | 电源电压检测中断（EXTI） | 0x00000044 |
| 18 | 4 | 可编程 | FLASH | FLASH中断 | 0x00000048 |
| 19 | - | - | - | 保留 | 0x0000004C |
| 20 | 6 | 可编程 | EXTI7_0 | EXTI7_0中断 | 0x00000050 |
| 21 | 7 | 可编程 | AWU | AWU中断 | 0x00000054 |


<a id="pdf-page-31"></a>
<!-- PDF page 31 -->

22 8 可编程 DMA1_CH1 DMA1CH1 中断 0x00000058
23 9 可编程 DMA1_CH2 DMA1CH2 中断 0x0000005C
24 10 可编程 DMA1_CH3 DMA1CH3 中断 0x00000060
25 11 可编程 DMA1_CH4 DMA1CH4 中断 0x00000064
26 12 可编程 DMA1_CH5 DMA1CH5 中断 0x00000068
27 13 可编程 DMA1_CH6 DMA1CH6 中断 0x0000006C
28 14 可编程 DMA1_CH7 DMA1CH7 中断 0x00000070
29 15 可编程 ADC1 ADC1 中断 0x00000074
30 16 可编程 I2C1_EV I2C1_EV 中断 0x00000078
31 17 可编程 I2C1_ER I2C1_ER 中断 0x0000007C
32 18 可编程 USART1 USART1 中断 0x00000080
33 19 可编程 SPI1 SPI1 中断 0x00000084
34 20 可编程 TIM1BRK TIM1BRK 中断 0x00000088
35 21 可编程 TIM1UP TIM1UP 中断 0x0000008C
36 22 可编程 TIM1TRG TIM1TRG 中断 0x00000090
37 23 可编程 TIM1CC TIM1CC 中断 0x00000094
38 24 可编程 TIM2UP TIM2UP 中断 0x00000098
39 25 可编程 USART2 USART2 中断 0x0000009C
40 26 可编程 EXTI15_8 EXTI15_8 中断 0x000000A0
41 27 可编程 EXTI25_16 EXTI25_16 中断 0x000000A4
42 28 可编程 USART3 USART3 中断 0x000000A8
43 29 可编程 USART4 USART4 中断 0x000000AC
44 30 可编程 DMA1_CH8 DMA1CH8 中断 0x000000B0
45 31 可编程 USBFS USBFS 中断 0x000000B4
46 32 可编程 USBFS_WKUP USBFS 唤醒中断 0x000000B8
47 33 可编程 PIOC PIOC 中断 0x000000BC
48 34 可编程 OPA OPA 中断 0x000000C0
49 35 可编程 USBPD USBPD 中断 0x000000C4
50 36 可编程 USBPD_WKUP USBPD 唤醒中断 0x000000C8
51 37 可编程 TIM2CC TIM2CC 全局中断 0x000000CC
52 38 可编程 TIM2TRG TIM2TRG 全局中断 0x000000D0
53 39 可编程 TIM2BRK TIM2BRK 全局中断 0x000000D4
54 40 可编程 TIM3 TIM3 全局中断 0x000000D8

<a id="pdf-page-32"></a>
<!-- PDF page 32 -->

### 7.4 外部中断和事件控制器（EXTI）

#### 7.4.1 概述

**图 7-1 外部中断(EXTI)接口框图**

HBbus
HCLK Peripheral interface
30 30 30 30 30
INTFR INTENR SWIEVR RTENR FTENR
30 30 30 30
To PFIC interrupt
controller
30
Pulse Edge detect Input
generator circuit Line
30 30 30
EVENR
由图 7-1 可以看出，外部中断的触发源既可以是软件中断（SWIEVR）也可以是实际的外部中断
通道，外部中断通道的信号会先经过边沿检测电路（edge detect circuit）的筛选。只要产生软件
中断或外部中断信号其一，就会通过图中的或门电路输出给事件使能和中断使能两个与门电路，只
要有中断被使能或事件被使能，就会产生中断或事件。EXTI 的六个寄存器由处理器通过 HB 接口访
问。
#### 7.4.2 唤醒事件说明

系统可以通过唤醒事件来唤醒由 WFE 指令引起的睡眠模式。唤醒事件通过以下两种配置产生：
- 在外设的寄存器里使能一个中断，但不在内核的 PFIC 里使能这个中断，同时在内核里使能
SEVONPEND 位。体现在 EXTI 中，就是使能 EXTI 中断，但不在 PFIC 中使能 EXTI 中断，同时使
能 SEVONPEND 位。当 CPU 从 WFE 中唤醒后，需要清除 EXTI 的中断标志位和 PFIC 挂起位。
- 使能一个 EXTI 通道为事件通道，CPU 从 WFE 唤醒后无需清除中断标志位和 PFIC 挂起位的操作。
#### 7.4.3 说明

使用外部中断需要配置相应外部中断通道，即选择相应触发沿，使能相应中断。当外部中断通
道上出现了设定的触发沿时，将产生一个中断请求，对应的中断标志位也会被置位。对标志位写 1
可以清除该标志位。
使用外部硬件中断步骤：
1） 配置 GPIO 操作；
2） 配置对应的外部中断通道的中断使能位（EXTI_INTENR）；

<a id="pdf-page-33"></a>
<!-- PDF page 33 -->

3） 配置触发沿（EXTI_RTENR 或 EXTI_FTENR），选择上升沿触发、下降沿触发或双边沿触发；
4） 在内核的 PFIC 中配置 EXTI 中断，以保证其可以正确响应。
使用外部硬件事件步骤：
1） 配置 GPIO 操作；
2） 配置对应的外部中断通道的事件使能位（EXTI_EVENR）；
3） 配置触发沿（EXTI_RTENR 或 EXTI_FTENR），选择上升沿触发、下降沿触发或双边沿触发。
使用软件中断/事件步骤：
1） 使能外部中断（EXTI_INTENR）或外部事件（EXTI_EVENR）；
2） 如果使用中断服务函数，需要设置内核的 PFIC 里 EXTI 中断；
3） 设置软件中断触发（EXTI_SWIEVR），即会产生中断。
#### 7.4.4 外部事件映射

**表 7-2 EXTI 中断映射**

| 外部中断/事件线路 | 映射事件描述 |
| --- | --- |
| EXTI0-EXTI23 | Px0-Px23（x=A/B/C），任何一个 IO 口都可以启用外<br>部中断/事件功能，由AFIO_EXTICRx寄存器配置。 |
| EXTI24 | 在两线调试接口开启，用于PC18启用外部中断或事件<br>唤醒 |
| EXTI25 | 在两线调试接口开启，用于PC19启用外部中断或事件<br>唤醒 |
| EXTI26 | PVD事件：超出电压监控阈值 |
| EXTI27 | AWU自动唤醒事件 |
| EXTI28 | USB唤醒事件 |
| EXTI29 | USB PD唤醒事件 |

### 7.5 寄存器描述

#### 7.5.1 EXTI寄存器描述

**表 7-3 EXTI 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R32_EXTI_INTENR | 0x40010400 | 中断使能寄存器 | 0x00000000 |
| R32_EXTI_EVENR | 0x40010404 | 事件使能寄存器 | 0x00000000 |
| R32_EXTI_RTENR | 0x40010408 | 上升沿触发使能寄存器 | 0x00000000 |
| R32_EXTI_FTENR | 0x4001040C | 下降沿触发使能寄存器 | 0x00000000 |
| R32_EXTI_SWIEVR | 0x40010410 | 软中断事件寄存器 | 0x00000000 |
| R32_EXTI_INTFR | 0x40010414 | 中断标志位寄存器 | 0x0000XXXX |

##### 7.5.1.1 中断使能寄存器（EXTI_INTENR）

偏移地址：0x00
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved MR29 MR28 MR27 MR26 MR25 MR24 MR23 MR22 MR21 MR20 MR19 MR18 MR17 MR16
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0

<a id="pdf-page-34"></a>
<!-- PDF page 34 -->

MR15 MR14 MR13 MR12 MR11 MR10 MR9 MR8 MR7 MR6 MR5 MR4 MR3 MR2 MR1 MR0
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:30] | Reserved | RO | 保留。 | 0 |
| [29:0] | MRx | RW | 使能外部中断通道x的中断请求信号：<br>1：使能此通道的中断；<br>0：屏蔽此通道的中断。 | 0 |

##### 7.5.1.2 事件使能寄存器（EXTI_EVENR）

偏移地址：0x04
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved MR29 MR28 MR27 MR26 MR25 MR24 MR23 MR22 MR21 MR20 MR19 MR18 MR17 MR16
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
MR15 MR14 MR13 MR12 MR11 MR10 MR9 MR8 MR7 MR6 MR5 MR4 MR3 MR2 MR1 MR0
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:30] | Reserved | RO | 保留。 | 0 |
| [29:0] | MRx | RW | 使能外部中断通道x的事件请求信号：<br>1：使能此通道的事件；<br>0：屏蔽此通道的事件。 | 0 |

##### 7.5.1.3 上升沿触发使能寄存器（EXTI_RTENR）

偏移地址：0x08
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved TR29 TR28 TR27 TR26 TR25 TR24 TR23 TR22 TR21 TR20 TR19 TR18 TR17 TR16
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
TR15 TR14 TR13 TR12 TR11 TR10 TR9 TR8 TR7 TR6 TR5 TR4 TR3 TR2 TR1 TR0
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:30] | Reserved | RO | 保留。 | 0 |
| [29:0] | TRx | RW | 使能外部中断通道x的上升沿触发：<br>1：使能此通道的上升沿触发；<br>0：禁止此通道的上升沿触发。 | 0 |

##### 7.5.1.4 下降沿触发使能寄存器（EXTI_FTENR）

偏移地址：0x0C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved TR29 TR28 TR27 TR26 TR25 TR24 TR23 TR22 TR21 TR20 TR19 TR18 TR17 TR16
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
TR15 TR14 TR13 TR12 TR11 TR10 TR9 TR8 TR7 TR6 TR5 TR4 TR3 TR2 TR1 TR0

<a id="pdf-page-35"></a>
<!-- PDF page 35 -->

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:30] | Reserved | RO | 保留 | 0 |
| [29:0] | TRx | RW | 使能外部中断通道x的下降沿触发：<br>1：使能此通道的下降沿触发；<br>0：禁止此通道的下降沿触发。 | 0 |

##### 7.5.1.5 软中断事件寄存器（EXTI_SWIEVR）

偏移地址：0x10
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
SWIER SWIER SWIER SWIER SWIER SWIER SWIER SWIER SWIER SWIER SWIER SWIER SWIER SWIER
Reserved
29 28 27 26 25 24 23 22 21 20 19 18 17 16
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
SWIER SWIER SWIER SWIER SWIER SWIER SWIER SWIER SWIER SWIER SWIER SWIER SWIER SWIER SWIER SWIER
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:30] | Reserved | RO | 保留。 | 0 |
| [29:0] | SWIERx | RW | 在相对应的外部触发中断通道上设置一个软<br>件 中 断 。 这 里 置 位 会 使 中 断 标 志 位<br>（EXTI_INTFR）对应位置位，如果中断使能<br>（EXTI_INTENR）或事件使能（EXTI_EVENR）<br>开启，那么就会产生中断或事件。 | 0 |

##### 7.5.1.6 中断标志位寄存器（EXTI_INTFR）

偏移地址：0x14
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved IF29 IF28 IF27 IF26 IF25 IF24 IF23 IF22 IF21 IF20 IF19 IF18 IF17 IF16
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
IF15 IF14 IF13 IF12 IF11 IF10 IF9 IF8 IF7 IF6 IF5 IF4 IF3 IF2 IF1 IF0
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:30] | Reserved | RO | 保留。 | 0 |
| [29:0] | IFx | W1 | 中断标志位，该位置位标志表示发生了对应的<br>外部中断。写1可以清除此位。 | X |

#### 7.5.2 PFIC寄存器描述

**表 7-4 PFIC 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R32_PFIC_ISR1 | 0xE000E000 | PFIC中断使能状态寄存器1 | 0x0000000C |
| R32_PFIC_ISR2 | 0xE000E004 | PFIC中断使能状态寄存器2 | 0x00000000 |
| R32_PFIC_ISR3 | 0xE000E008 | PFIC中断使能状态寄存器3 | 0x00000000 |
| R32_PFIC_ISR4 | 0xE000E00C | PFIC中断使能状态寄存器4 | 0x00000000 |
| R32_PFIC_IPR1 | 0xE000E020 | PFIC中断挂起状态寄存器1 | 0x00000000 |


<a id="pdf-page-36"></a>
<!-- PDF page 36 -->

R32_PFIC_IPR2 0xE000E024 PFIC 中断挂起状态寄存器 2 0x00000000
R32_PFIC_IPR3 0xE000E028 PFIC 中断挂起状态寄存器 3 0x00000000
R32_PFIC_IPR4 0xE000E02C PFIC 中断挂起状态寄存器 4 0x00000000
R32_PFIC_ITHRESDR 0xE000E040 PFIC 中断优先级阈值配置寄存器 0x00000000
R32_PFIC_CFGR 0xE000E048 PFIC 中断配置寄存器 0x00000000
R32_PFIC_GISR 0xE000E04C PFIC 中断全局状态寄存器 0x00000000
R32_PFIC_VTFIDR 0xE000E050 PFIC VTF 中断 ID 配置寄存器 0x00000000
R32_PFIC_VTFADDRR0 0xE000E060 PFIC VTF 中断 0 偏移地址寄存器 0x00000000
R32_PFIC_VTFADDRR1 0xE000E064 PFIC VTF 中断 1 偏移地址寄存器 0x00000000
R32_PFIC_VTFADDRR2 0xE000E068 PFIC VTF 中断 2 偏移地址寄存器 0x00000000
R32_PFIC_VTFADDRR3 0xE000E06C PFIC VTF 中断 3 偏移地址寄存器 0x00000000
R32_PFIC_IENR1 0xE000E100 PFIC 中断使能设置寄存器 1 0x00000000
R32_PFIC_IENR2 0xE000E104 PFIC 中断使能设置寄存器 2 0x00000000
R32_PFIC_IENR3 0xE000E108 PFIC 中断使能设置寄存器 3 0x00000000
R32_PFIC_IENR4 0xE000E10C PFIC 中断使能设置寄存器 4 0x00000000
R32_PFIC_IRER1 0xE000E180 PFIC 中断使能清除寄存器 1 0x00000000
R32_PFIC_IRER2 0xE000E184 PFIC 中断使能清除寄存器 2 0x00000000
R32_PFIC_IRER3 0xE000E188 PFIC 中断使能清除寄存器 3 0x00000000
R32_PFIC_IRER4 0xE000E18C PFIC 中断使能清除寄存器 4 0x00000000
R32_PFIC_IPSR1 0xE000E200 PFIC 中断挂起设置寄存器 1 0x00000000
R32_PFIC_IPSR2 0xE000E204 PFIC 中断挂起设置寄存器 2 0x00000000
R32_PFIC_IPSR3 0xE000E208 PFIC 中断挂起设置寄存器 3 0x00000000
R32_PFIC_IPSR4 0xE000E20C PFIC 中断挂起设置寄存器 4 0x00000000
R32_PFIC_IPRR1 0xE000E280 PFIC 中断挂起清除寄存器 1 0x00000000
R32_PFIC_IPRR2 0xE000E284 PFIC 中断挂起清除寄存器 2 0x00000000
R32_PFIC_IPRR3 0xE000E288 PFIC 中断挂起清除寄存器 3 0x00000000
R32_PFIC_IPRR4 0xE000E28C PFIC 中断挂起清除寄存器 4 0x00000000
R32_PFIC_IACTR1 0xE000E300 PFIC 中断激活状态寄存器 1 0x00000000
R32_PFIC_IACTR2 0xE000E304 PFIC 中断激活状态寄存器 2 0x00000000
R32_PFIC_IACTR3 0xE000E308 PFIC 中断激活状态寄存器 3 0x00000000
R32_PFIC_IACTR4 0xE000E30C PFIC 中断激活状态寄存器 4 0x00000000
R32_PFIC_IPRIORx 0xE000E400 PFIC 中断优先级配置寄存器 0x00000000
R32_PFIC_SCTLR 0xE000ED10 PFIC 系统控制寄存器 0x00000000
注：1.NMI、EXC、ECALL-M、ECALL-U、BREAKPOINT中断默认总是使能。
2.ECALL-M、ECALL-U、BREAKPOINT均为EXC的一种情况，状态由EXC的状态位bit3表示。
3.NMI、EXC支持中断挂起清除和设置操作，不支持中断使能清除和设置操作。
4.ECALL-M、ECALL-U、BREAKPOINT不支持中断挂起清除和设置、中断使能清除和设置操作。
##### 7.5.2.1 PFIC中断使能状态寄存器1（PFIC_ISR1）

偏移地址：0x00
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
INTENSTA[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
INTEN INTEN INTEN INTEN Reserved INTEN INTEN Reserved

<a id="pdf-page-37"></a>
<!-- PDF page 37 -->

STA15 STA14 STA13 STA12 STA3 STA2
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:12] | INTENSTA | RO | 12#-31#中断当前使能状态：<br>1：当前编号中断已使能；<br>0：当前编号中断未启用。 | 0 |
| [11:4] | Reserved | RO | 保留。 | 0 |
| [3:2] | INTENSTA | RO | 2#-3#中断当前使能状态：<br>1：当前编号中断已使能；<br>0：当前编号中断未启用。<br>注：3#2#中断默认使能。 | 1 |
| [1:0] | Reserved | RO | 保留。 | 0 |

##### 7.5.2.2 PFIC中断使能状态寄存器2（PFIC_ISR2）

偏移地址：0x04
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
INTENSTA[63:48]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
INTENSTA[47:32]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | INTENSTA | RO | 32#-63#中断当前使能状态：<br>1：当前编号中断已使能；<br>0：当前编号中断未启用。 | 0 |

##### 7.5.2.3 PFIC中断使能状态寄存器3（PFIC_ISR3）

偏移地址：0x08
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
INTENSTA[95:80]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
INTENSTA[79:64]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | INTENSTA | RO | 64#-95#中断当前使能状态：<br>1：当前编号中断已使能；<br>0：当前编号中断未启用。 | 0 |

##### 7.5.2.4 PFIC中断使能状态寄存器4（PFIC_ISR4）

偏移地址：0x0C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved

<a id="pdf-page-38"></a>
<!-- PDF page 38 -->

15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved INTENSTA[103:96]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:8] | Reserved | RO | 保留。 | 0 |
| [7:0] | INTENSTA | RO | 96#-103#中断当前使能状态：<br>1：当前编号中断已使能；<br>0：当前编号中断未启用。 | 0 |

##### 7.5.2.5 PFIC中断挂起状态寄存器1（PFIC_IPR1）

偏移地址：0x20
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
PENDSTA[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
PENDS PENDS PENDS PENDS PENDS PENDS
Reserved Reserved
TA15 TA14 TA13 TA12 TA3 TA2
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:12] | PENDSTA | RO | 12#-31#中断当前挂起状态：<br>1：当前编号中断已挂起；<br>0：当前编号中断未挂起。 | 0 |
| [11:4] | Reserved | RO | 保留。 | 0 |
| [3:2] | PENDSTA | RO | 2#-3#中断当前挂起状态：<br>1：当前编号中断已挂起；<br>0：当前编号中断未挂起。 | 0 |
| [1:0] | Reserved | RO | 保留。 | 0 |

##### 7.5.2.6 PFIC中断挂起状态寄存器2（PFIC_IPR2）

偏移地址：0x24
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
PENDSTA[63:48]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
PENDSTA[47:32]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | PENDSTA | RO | 32#-63#中断当前挂起状态：<br>1：当前编号中断已挂起；<br>0：当前编号中断未挂起。 | 0 |

##### 7.5.2.7 PFIC中断挂起状态寄存器3（PFIC_IPR3）

偏移地址：0x28
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16

<a id="pdf-page-39"></a>
<!-- PDF page 39 -->

PENDSTA[95:80]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
PENDSTA[79:64]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | PENDSTA | RO | 64#-95#中断当前挂起状态：<br>1：当前编号中断已挂起；<br>0：当前编号中断未挂起。 | 0 |

##### 7.5.2.8 PFIC中断挂起状态寄存器4（PFIC_IPR4）

偏移地址：0x2C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved PENDSTA[103:96]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:8] | Reserved | RO | 保留。 | 0 |
| [7:0] | PENDSTA | RO | 96#-103#中断当前挂起状态：<br>1：当前编号中断已挂起；<br>0：当前编号中断未挂起。 | 0 |

##### 7.5.2.9 PFIC中断优先级阈值配置寄存器（PFIC_ITHRESDR）

偏移地址：0x40
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved THRESHOLD[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:8] | Reserved | RO | 保留。 | 0 |
| [7:0] | THRESHOLD | RW | 中断优先级阈值设置值。<br>低于当前设置值的中断优先级值，当挂<br>起时不执行中断服务；此寄存器为 0 时<br>表示阈值寄存器功能无效。<br>[7:5]：优先级阈值；<br>[4:0]：保留，固定为0，写无效。 | 0 |

##### 7.5.2.10 PFIC中断配置寄存器（PFIC_CFGR）

偏移地址：0x48
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
KEYCODE[15:0]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0

<a id="pdf-page-40"></a>
<!-- PDF page 40 -->

SYS
Reserved Reserved
RST
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:16] | KEYCODE[15:0] | WO | 对应不同的目标控制位，需要同步写入相应的安<br>全访问标识数据才能修改，读出数据固定为0。<br>KEY1 = 0xFA05；<br>KEY2 = 0xBCAF；<br>KEY3 = 0xBEEF。 | 0 |
| [15:8] | Reserved | RO | 保留。 | 0 |
| 7 | SYSRST | WO | 系统复位（同步写入KEY3）。自动清0。<br>写1有效，写0无效。<br>注：与PFIC_SCTLR寄存器SYSRST位作用相同。 | 0 |
| [6:0] | Reserved | RO | 保留。 | 0 |

##### 7.5.2.11 PFIC中断全局状态寄存器（PFIC_GISR）

偏移地址：0x4C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
GPEND GACT
Reserved NESTSTA[7:0]
STA STA
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:10] | Reserved | RO | 保留。 | 0 |
| 9 | GPENDSTA | RO | 当前是否有中断处于挂起：<br>1：有； 0：没有。 | 0 |
| 8 | GACTSTA | RO | 当前是否有中断被执行：<br>1：有； 0：没有。 | 0 |
| [7:0] | NESTSTA[7:0] | RO | 当前中断嵌套状态，目前最大支持 2 级嵌<br>套，硬件压栈深度最大为2级。<br>0x03：第2级中断中；<br>0x01：第1级中断中；<br>0x00：没有中断发生；<br>其他：不可能情况。 | 0 |

##### 7.5.2.12 PFIC VTF中断ID配置寄存器（PFIC_VTFIDR）

偏移地址：0x50
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
VTFID3 VTFID2
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
VTFID1 VTFID0

<a id="pdf-page-41"></a>
<!-- PDF page 41 -->

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:24] | VTFID3 | RW | 配置VTF中断3的中断编号。 | 0 |
| [23:16] | VTFID2 | RW | 配置VTF中断2的中断编号。 | 0 |
| [15:8] | VTFID1 | RW | 配置VTF中断1的中断编号。 | 0 |
| [7:0] | VTFID0 | RW | 配置VTF中断0的中断编号。 | 0 |

##### 7.5.2.13 PFIC VTF中断0地址寄存器（PFIC_VTFADDRR0）

偏移地址：0x60
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
ADDR0[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
ADDR0[15:1] VTF0EN
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:1] | ADDR0 | RW | VTF 中断 0 服务程序地址 bit[31:1]，<br>bit0为0。 | 0 |
| 0 | VTF0EN | RW | VTF中断0使能位：<br>1：启用VTF中断0通道；<br>0：关闭。 | 0 |

##### 7.5.2.14 PFIC VTF中断1地址寄存器（PFIC_VTFADDRR1）

偏移地址：0x64
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
ADDR1[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
ADDR1[15:1] VTF1EN
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:1] | ADDR1 | RW | VTF 中断 1 服务程序地址 bit[31:1]，<br>bit0为0。 | 0 |
| 0 | VTF1EN | RW | VTF中断1使能位：<br>1：启用VTF中断1通道；<br>0：关闭。 | 0 |

##### 7.5.2.15 PFIC VTF中断2地址寄存器（PFIC_VTFADDRR2）

偏移地址：0x68
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
ADDR2[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
ADDR2[15:1] VTF2EN

<a id="pdf-page-42"></a>
<!-- PDF page 42 -->

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:1] | ADDR2 | RW | VTF 中断 2 服务程序地址 bit[31:1]，<br>bit0为0。 | 0 |
| 0 | VTF2EN | RW | VTF中断2使能位：<br>1：启用VTF中断2通道；<br>0：关闭。 | 0 |

##### 7.5.2.16 PFIC VTF中断3地址寄存器（PFIC_VTFADDRR3）

偏移地址：0x6C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
ADDR3[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
ADDR3[15:1] VTF3EN
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:1] | ADDR3 | RW | VTF 中断 3 服务程序地址 bit[31:1]，<br>bit0为0。 | 0 |
| 0 | VTF3EN | RW | VTF中断3使能位：<br>1：启用VTF中断3通道；<br>0：关闭。 | 0 |

##### 7.5.2.17 PFIC中断使能设置寄存器1（PFIC_IENR1）

偏移地址：0x100
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
INTEN[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
INTEN INTEN INTEN INTEN
Reserved
15 14 13 12
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:12] | INTEN | WO | 12#-31#中断使能控制：<br>1：当前编号中断使能；<br>0：无影响。 | 0 |
| [11:0] | Reserved | RO | 保留。 | 0 |

##### 7.5.2.18 PFIC中断使能设置寄存器2（PFIC_IENR2）

偏移地址：0x104
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
INTEN[63:48]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
INTEN[47:32]

<a id="pdf-page-43"></a>
<!-- PDF page 43 -->

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | INTEN | WO | 32#-63#中断使能控制：<br>1：当前编号中断使能；<br>0：无影响。 | 0 |

##### 7.5.2.19 PFIC中断使能设置寄存器3（PFIC_IENR3）

偏移地址：0x108
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
INTEN[95:80]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
INTEN[79:64]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | INTEN | WO | 64#-95#中断使能控制：<br>1：当前编号中断使能；<br>0：无影响。 | 0 |

##### 7.5.2.20 PFIC中断使能设置寄存器4（PFIC_IENR4）

偏移地址：0x10C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved INTEN[103:96]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:8] | Reserved | RO | 保留。 | 0 |
| [7:0] | INTEN | WO | 96#-103#中断使能控制：<br>1：当前编号中断使能；<br>0：无影响。 | 0 |

##### 7.5.2.21 PFIC中断使能清除寄存器1（PFIC_IRER1）

偏移地址：0x180
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
INTRSET[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
INT INT INT INT
Reserved
RST15 RST14 RST13 RST12
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:12] | INTRSET | WO | 12#-31#中断关闭控制：<br>1：当前编号中断关闭； | 0 |


<a id="pdf-page-44"></a>
<!-- PDF page 44 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 0：无影响。 |  |
| [11:0] | Reserved | RO | 保留。 | 0 |

##### 7.5.2.22 PFIC中断使能清除寄存器2（PFIC_IRER2）

偏移地址：0x184
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
INTRSET[63:48]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
INTRSET[47:32]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | INTRSET | WO | 32#-63#中断关闭控制：<br>1：当前编号中断关闭；<br>0：无影响。 | 0 |

##### 7.5.2.23 PFIC中断使能清除寄存器3（PFIC_IRER3）

偏移地址：0x188
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
INTRSET[95:80]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
INTRSET[79:64]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | INTRSET | WO | 64#-95#中断关闭控制：<br>1：当前编号中断关闭；<br>0：无影响。 | 0 |

##### 7.5.2.24 PFIC中断使能清除寄存器4（PFIC_IRER4）

偏移地址：0x18C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved INTRSET[103:96]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:8] | Reserved | RO | 保留。 | 0 |
| [7:0] | INTRSET | WO | 96#-103#中断关闭控制：<br>1：当前编号中断关闭；<br>0：无影响。 | 0 |

##### 7.5.2.25 PFIC中断挂起设置寄存器1（PFIC_IPSR1）


<a id="pdf-page-45"></a>
<!-- PDF page 45 -->

偏移地址：0x200
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
PENDSET[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
PENDS PENDS PENDS PENDS PEND PEND
Reserved Reserved
ET15 ET14 ET13 ET12 SET3 SET2
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:12] | PENDSET | WO | 12#-31#中断挂起设置：<br>1：当前编号中断挂起；<br>0：无影响。 | 0 |
| [11:4] | Reserved | RO | 保留。 | 0 |
| [3:2] | PENDSET | WO | 2#-3#中断挂起设置：<br>1：当前编号中断挂起；<br>0：无影响。 | 0 |
| [1:0] | Reserved | RO | 保留。 | 0 |

##### 7.5.2.26 PFIC中断挂起设置寄存器2（PFIC_IPSR2）

偏移地址：0x204
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
PENDSET[63:48]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
PENDSET[47:32]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | PENDSET | WO | 32#-63#中断挂起设置：<br>1：当前编号中断挂起；<br>0：无影响。 | 0 |

##### 7.5.2.27 PFIC中断挂起设置寄存器3（PFIC_IPSR3）

偏移地址：0x208
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
PENDSET[95:80]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
PENDSET[79:64]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | PENDSET | WO | 64#-95#中断挂起设置：<br>1：当前编号中断挂起；<br>0：无影响。 | 0 |

##### 7.5.2.28 PFIC中断挂起设置寄存器4（PFIC_IPSR4）


<a id="pdf-page-46"></a>
<!-- PDF page 46 -->

偏移地址：0x20C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved PENDSET[103:96]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:8] | Reserved | RO | 保留。 | 0 |
| [7:0] | PENDSET | WO | 96#-103#中断挂起设置：<br>1：当前编号中断挂起；<br>0：无影响。 | 0 |

##### 7.5.2.29 PFIC中断挂起清除寄存器1（PFIC_IPRR1）

偏移地址：0x280
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
PENDRST[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reser PENDR Reser PENDR PEND PEND
Reserved Reserved
ved ST14 ved ST12 RST3 RST2
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:16] | PENDRST | WO | 16#-31#中断挂起清除：<br>1：当前编号中断清除挂起状态；<br>0：无影响。 | 0 |
| 15 | Reserved | RO | 保留。 | 0 |
| 14 | PENDRST | WO | 14#中断挂起清除：<br>1：当前编号中断清除挂起状态；<br>0：无影响。 | 0 |
| 13 | Reserved | RO | 保留。 | 0 |
| 12 | PENDRST | WO | 12#中断挂起清除：<br>1：当前编号中断清除挂起状态；<br>0：无影响。 | 0 |
| [11:4] | Reserved | RO | 保留。 | 0 |
| [3:2] | PENDRST | WO | 2#-3#中断挂起清除：<br>1：当前编号中断清除挂起状态；<br>0：无影响。 | 0 |
| [1:0] | Reserved | RO | 保留。 | 0 |

##### 7.5.2.30 PFIC中断挂起清除寄存器2（PFIC_IPRR2）

偏移地址：0x284
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
PENDRST[63:48]

<a id="pdf-page-47"></a>
<!-- PDF page 47 -->

15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
PENDRST[47:32]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | PENDRST | WO | 32#-63#中断挂起清除：<br>1：当前编号中断清除挂起状态；<br>0：无影响。 | 0 |

##### 7.5.2.31 PFIC中断挂起清除寄存器3（PFIC_IPRR3）

偏移地址：0x288
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
PENDRST[95:80]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
PENDRST[79:64]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | PENDRST | WO | 64#-95#中断挂起清除：<br>1：当前编号中断清除挂起状态；<br>0：无影响。 | 0 |

##### 7.5.2.32 PFIC中断挂起清除寄存器4（PFIC_IPRR4）

偏移地址：0x28C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved PENDRST[103:96]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:8] | Reserved | RO | 保留。 | 0 |
| [7:0] | PENDSET | WO | 96#-103#中断挂起清除：<br>1：当前编号中断清除挂起状态；<br>0：无影响 | 0 |

##### 7.5.2.33 PFIC中断激活状态寄存器1（PFIC_IACTR1）

偏移地址：0x300
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
IACTS[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reser IACTS Reser IACTS
Reserved IACTS3 IACTS2 Reserved
ved 14 ved 12

<a id="pdf-page-48"></a>
<!-- PDF page 48 -->

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:16] | IACTS | RO | 16#-31#中断执行状态：<br>1：当前编号中断执行中；<br>0：当前编号中断没执行。 | 0 |
| 15 | Reserved | RO | 保留。 | 0 |
| 14 | IACTS | RO | 14#中断执行状态：<br>1：当前编号中断执行中；<br>0：当前编号中断没执行。 | 0 |
| 13 | Reserved | RO | 保留。 | 0 |
| 12 | IACTS | RO | 12#中断执行状态：<br>1：当前编号中断执行中；<br>0：当前编号中断没执行。 | 0 |
| [11:4] | Reserved | RO | 保留。 | 0 |
| [3:2] | IACTS | RO | 2#-3#中断执行状态：<br>1：当前编号中断执行中；<br>0：当前编号中断没执行。 | 0 |
| [1:0] | Reserved | RO | 保留。 | 0 |

##### 7.5.2.34 PFIC中断激活状态寄存器2（PFIC_IACTR2）

偏移地址：0x304
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
IACTS[63:48]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
IACTS[47:32]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | IACTS | RO | 32#-63#中断执行状态：<br>1：当前编号中断执行中；<br>0：当前编号中断没执行。 | 0 |

##### 7.5.2.35 PFIC中断激活状态寄存器3（PFIC_IACTR3）

偏移地址：0x308
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
IACTS[95:80]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
IACTS[79:64]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | IACTS | RO | 64#-95#中断执行状态：<br>1：当前编号中断执行中；<br>0：当前编号中断没执行。 | 0 |


<a id="pdf-page-49"></a>
<!-- PDF page 49 -->

##### 7.5.2.36 PFIC中断激活状态寄存器4（PFIC_IACTR4）

偏移地址：0x30C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved IACTS[103:96]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:8] | Reserved | RO | 保留。 | 0 |
| [7:0] | IACTS | WO | 96#-103#中断执行状态：<br>1：当前编号中断执行中；<br>0：当前编号中断没执行 | 0 |

##### 7.5.2.37 PFIC中断优先级配置寄存器（PFIC_IPRIORx）（x=0-63）

偏移地址：0x400-0x4FF
控制器支持 256 个中断（0-255），每个中断使用 8bit 来设置控制优先级。
31 24 23 16 15 8 7 0
IPRIOR63 PRIO_255 PRIO_254 PRIO_253 PRIO_252
… … … … …
IPRIORx PRIO_(4x+3) PRIO_(4x+2) PRIO_(4x+1) PRIO_(4x)
… … … … …
IPRIOR0 PRIO_3 PRIO_2 PRIO_1 PRIO_0
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [2047:2040] | IP_255 | RW | 同IP_0描述。 | 0 |
| … | … | … | … | … |
| [31:24] | IP_3 | RW | 同IP_0描述。 | 0 |
| [23:16] | IP_2 | RW | 同IP_0描述。 | 0 |
| [15:8] | IP_1 | RW | 同IP_0描述。 | 0 |
| [7:0] | IP_0 | RW | 编号0中断优先级配置：<br>[7:5]：优先级控制位。<br>若配置无嵌套，无抢占位；<br>若配置2级嵌套，bit7为抢占位；<br>优先级数值越小则优先级越高，同一抢<br>占优先级中断若同时挂起，优先执行优<br>先级高的中断。<br>[4:0]：保留，固定为0，写无效。 | 0 |

##### 7.5.2.38 PFIC系统控制寄存器（PFIC_SCTLR）

偏移地址：0xD10
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16

<a id="pdf-page-50"></a>
<!-- PDF page 50 -->

SYS
Reserved
RST
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
SET SEV WFITO SLEEP SLEEP Reser
Reserved RSTEN
EVENT ONPEND WFE DEEP ONEXIT ved
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 31 | SYSRST | WO | 系统复位，自动清 0。写 1 有效，写 0<br>无效，与PFIC_CFGR寄存器相同效果 | 0 |
| [30:7] | Reserved | RO | 保留。 | 0 |
| 6 | RSTEN | RW | 内核死锁复位使能开关：<br>1：关闭；<br>0：开启。 | 0 |
| 5 | SETEVENT | WO | 设置事件，可以唤醒WFE的情况。 | 0 |
| 4 | SEVONPEND | RW | 当发生事件或者中断挂起状态时，可以<br>从WFE指令后唤醒系统，如果未执行WFE<br>指令，将在下次执行该指令后立即唤醒<br>系统。<br>1：启用的事件和所有中断（包括未开启<br>中断）都能唤醒系统；<br>0：只有启用的事件和启用的中断可以唤<br>醒系统。 | 0 |
| 3 | WFITOWFE | RW | 将WFI指令当成是WFE执行。<br>1：将之后的WFI指令当做WFE指令；<br>0：无作用。 | 0 |
| 2 | SLEEPDEEP | RW | 控制系统的低功耗模式：<br>1：deepsleep 0：sleep | 0 |
| 1 | SLEEPONEXIT | RW | 控制离开中断服务程序后，系统状态：<br>1：系统进入低功耗模式；<br>0：系统进入主程序。 | 0 |
| 0 | Reserved | RO | 保留。 | 0 |

#### 7.5.3 专用CSR寄存器

RISC-V 架构中定义了一些控制和状态寄存器（Control and Status Register,CSR），用于配
置或标识或记录运行状态。CSR 寄存器属于内核内部的寄存器，使用专用的 12 位地址空间。CH32X035
芯片除了 RISC-V 特权架构文档中定义的标准寄存器外，还增加了一些厂商自定义寄存器，需要使
用 csr 指令进行访问。
注：此类寄存器标注为“MRW,MRO,MRW1”属性的需要系统在机器模式下才能访问。
##### 7.5.3.1 中断系统控制寄存器（INTSYSCR）

CSR 地址：0x804
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0

<a id="pdf-page-51"></a>
<!-- PDF page 51 -->

GIHWS INEST HWSTK
Reserved Reserved
TKNEN EN EN
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:6] | Reserved | MRO | 保留。 | 0 |
| 5 | GIHWSTKNEN | MRW1 | 全局中断和硬件压栈关闭使能。<br>注：该位常使用于实时操作系统中，中<br>断切换上下文时，置位该位，可关闭全<br>局中断和硬件压栈出栈，当上下文切换<br>完成，执行完中断返回后，硬件自动清<br>除该位。 | 0 |
| [4:2] | Reserved | MRO | 保留。 | 0 |
| 1 | INESTEN | MRW | 中断嵌套使能：<br>1：中断嵌套功能使能；<br>0：中断嵌套功能关闭。 | 0 |
| 0 | HWSTKEN | MRW | 硬件压栈使能：<br>1：硬件压栈功能使能；<br>0：硬件压栈功能关闭。 | 0 |

##### 7.5.3.2 异常入口基地址寄存器（MTVEC）

CSR 地址：0x305
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
BASEADDR[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
BASEADDR[15:2] MODE1 MODE0
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:2] | BASEADDR[31:2] | MRW | 中断向量表基地址。 | 0 |
| 1 | MODE1 | MRW | 中断向量表识别模式：<br>1：按绝对地址识别，支持全范围，但<br>必须跳转；<br>0：按跳转指令识别，有限范围，支持<br>非跳指令。 | 0 |
| 0 | MODE0 | MRW | 中断或异常入口地址模式选择：<br>1：根据中断编号*4进行地址偏移；<br>0：使用统一入口地址。 | 0 |

#### 7.5.4 物理内存保护单元（PMP）

为了提高系统安全，RISC-V 的架构中定义了一套物理地址访问限制，可以为区域内物理内存设
置其读、写、执行属性，区域长度最小 4 字节保护。PMP 单元在用户模式下一直生效，在机器模式
下可选生效，如果违背了当前内存限制，将会产生系统异常中断（EXC）。
PMP 单元包含 4 组 8-bit 的配置寄存器（32bit）和 4 组地址寄存器，需要使用 csr 指令进行访
问，并且在机器模式下进行。

<a id="pdf-page-52"></a>
<!-- PDF page 52 -->

##### 7.5.4.1 PMP配置寄存器（PMPCFG0）

CSR 地址：0x3A0
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
pmp3cfg pmp2cfg
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
pmp1cfg pmp0cfg
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:24] | pmp3cfg | MRW | 见pmp0cfg。 | 0 |
| [23:16] | pmp2cfg | MRW | 见pmp0cfg。 | 0 |
| [15:8] | pmp1cfg | MRW | 见pmp0cfg。 | 0 |
| [7:0] | pmp0cfg | MRW | 位 名称 描述<br>锁定使能，机器模式下可解锁<br>7 L 1：锁定相关寄存器；<br>0：不锁定。<br>[6:5] - 保留。<br>[4:3] A 地址对齐及保护区域范围选择。<br>2 X 可执行属性。<br>1 W 可写入属性。<br>0 R 可读出属性。 | 0 |

| 位 | 名称 | 描述 |
| --- | --- | --- |
| 7 | L | 锁定使能，机器模式下可解锁<br>1：锁定相关寄存器；<br>0：不锁定。 |
| [6:5] | - | 保留。 |
| [4:3] | A | 地址对齐及保护区域范围选择。 |
| 2 | X | 可执行属性。 |
| 1 | W | 可写入属性。 |
| 0 | R | 可读出属性。 |

其中，地址对齐及保护区域范围选择，对于 A_ADDR≤region＜B_ADDR 区域进行内存保护（要求
A_ADDR 和 B_ADDR 均为 4 字节对齐）：
1、如果 B_ADDR - A_ADDR == 22，则采用 NA4 方式；
2、如果 B_ADDR - A_ADDR == 2（G+2），G≥1，且 A_ADDR 为 2（G+2）对齐则采用 NAPOT 方式；
3、否则采用 TOR 方式。
| A值 | 名称 | 描述 |
| --- | --- | --- |
| 00b | OFF | 没有区域要保护 |
| 01b | TOR | 顶端对齐区域保护：<br>pmp0cfg下，0≤ region ＜pmpaddr0；<br>pmp1cfg下，pmpaddr0≤ region ＜pmpaddr1；<br>pmp2cfg下，pmpaddr1≤ region ＜pmpaddr2；<br>pmp3cfg下，pmpaddr2≤ region ＜pmpaddr3。<br>pmpaddr = A_ADDR >> 2；<br>i-1<br>pmpaddr = B_ADDR >> 2。<br>i |
| 10b | NA4 | 固定4字节区域保护。<br>pmp0cfg～pmp3cfg对应pmpaddr0～pmpaddr3作为起始地址。<br>pmpaddr = A_ADDR >> 2。<br>i |
| 11b | NAPOT | 保护2（G+2）区域，G≥1，此时A_ADDR为2（G+2）对齐。<br>pmpaddr = （(A_ADDR \|（2（G+2）-1））& ~(1<<G+1)）>> 2。<br>i |

##### 7.5.4.2 PMP地址0寄存器（PMPADDR0）

CSR 地址：0x3B0

<a id="pdf-page-53"></a>
<!-- PDF page 53 -->

31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
ADDR0[33:18]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
ADDR0[17:2]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | ADDR0 | MRW | PMP设置地址0的bit[33:2]，实际高2位未用。 | 0 |

##### 7.5.4.3 PMP地址1寄存器（PMPADDR1）

CSR 地址：0x3B1
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
ADDR1[33:18]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
ADDR1[17:2]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | ADDR1 | MRW | PMP设置地址1的bit[33:2]，实际高2位未用。 | 0 |

##### 7.5.4.4 PMP地址2寄存器（PMPADDR2）

CSR 地址：0x3B2
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
ADDR2[33:18]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
ADDR2[17:2]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | ADDR2 | MRW | PMP设置地址2的bit[33:2]，实际高2位未用。 | 0 |

##### 7.5.4.5 PMP地址3寄存器（PMPADDR3）

CSR 地址：0x3B3
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
ADDR3[33:18]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
ADDR3[17:2]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | ADDR3 | MRW | PMP设置地址3的bit[33:2]，实际高2位未用。 | 0 |


<a id="pdf-page-54"></a>
<!-- PDF page 54 -->

#### 7.5.5 STK寄存器描述

**表 7-5 STK 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R32_STK_CTLR | 0xE000F000 | 系统计数控制寄存器 | 0x00000000 |
| R32_STK_SR | 0xE000F004 | 系统计数状态寄存器 | 0x00000000 |
| R32_STK_CNTL | 0xE000F008 | 系统计数器低位寄存器 | 0x00000000 |
| R32_STK_CNTH | 0xE000F00C | 系统计数器高位寄存器 | 0x00000000 |
| R32_STK_CMPLR | 0xE000F010 | 计数比较低位寄存器 | 0x00000000 |
| R32_STK_CMPHR | 0xE000F014 | 计数比较高位寄存器 | 0x00000000 |

##### 7.5.5.1 系统计数控制寄存器（STK_CTLR）

偏移地址：0x00
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
SWIE Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved MODE STRE STCLK STIE STE
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 31 | SWIE | RW | 软件中断触发使能(SWI)：<br>1：触发软件中断；<br>0：关闭触发。<br>进入软件中断后，需软件清0，否则持续触发。 | 0 |
| [30:5] | Reserved | RO | 保留。 | 0 |
| 4 | MODE | RW | 计数模式：<br>1：向下计数；<br>0：向上计数。 | 0 |
| 3 | STRE | RW | 自动重装载计数使能位：<br>1：向上计数到比较值后重新从 0 开始计数，<br>向下计数到0后，重新从比较值开始计数；<br>0：向上计数到比较值后继续向上计数，向下<br>计数到0后，重新从最大值开始向下计数。 | 0 |
| 2 | STCLK | RW | 计数器时钟源选择位：<br>1：HCLK做时基；<br>0：HCLK/8做时基。 | 0 |
| 1 | STIE | RW | 计数器中断使能控制位：<br>1：使能计数器中断；<br>0：关闭计数器中断。 | 0 |
| 0 | STE | RW | 系统计数器使能控制位：<br>1：启动系统计数器STK；<br>0：关闭系统计数器STK，计数器停止计数。 | 0 |

##### 7.5.5.2 系统计数状态寄存器（STK_SR）

偏移地址：0x04
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16

<a id="pdf-page-55"></a>
<!-- PDF page 55 -->

Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved CNTIF
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:1] | Reserved | RO | 保留 | 0 |
| 0 | CNTIF | RW0 | 计数值比较标志，写0清除，写1无效：<br>1：向上计数达到比较值，向下计数到0；<br>0：未达到比较值。 | 0 |

##### 7.5.5.3 系统计数器低位寄存器（STK_CNTL）

偏移地址：0x08
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
CNT[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
CNT[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | CNT[31:0] | RW | 当前计数器计数值低32位。 | 0 |

注：寄存器STK_CNTL和寄存器STK_CNTH共同构成了64位系统计数器。
##### 7.5.5.4 系统计数器高位寄存器（STK_CNTH）

偏移地址：0x0C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
CNT[63:48]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
CNT[47:32]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | CNT[63:32] | RW | 当前计数器计数值高32位。 | 0 |

注：寄存器STK_CNTL和寄存器STK_CNTH共同构成了64位系统计数器。
##### 7.5.5.5 计数比较低位寄存器（STK_CMPLR）

偏移地址：0x10
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
CMP[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
CMP[15:0]
位名称访问描述复位值

<a id="pdf-page-56"></a>
<!-- PDF page 56 -->

[31:0] CMP[31:0] RW 设置比较计数器值低 32 位。 0
注：寄存器STK_CMPLR和寄存器STK_CMPHR共同构成了64位计数器比较值。
##### 7.5.5.6 计数比较高位寄存器（STK_CMPHR）

偏移地址：0x14
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
CMP[63:48]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
CMP[47:32]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | CMP[63:32] | RW | 设置比较计数器值高32位。 | 0 |

注：寄存器STK_CMPLR和寄存器STK_CMPHR共同构成了64位计数器比较值。

<a id="pdf-page-57"></a>
<!-- PDF page 57 -->

## 第8章 GPIO及其复用功能（GPIO/AFIO）

GPIO 口可以配置成多种输入或输出模式，内置可关闭的上拉电阻，部分 GPIO 内置可关闭的下
拉电阻，可以配置成推挽功能。GPIO 口还可以复用成其他功能。
PA0-PA7、PB0-PB1、PC0-PC3 支持 ADC 模拟信号输入通道 0～13。
所有 GPIO 引脚都支持可控上拉，仅 PA0-PA15 和 PC16-PC17 支持可控下拉，其余引脚不支持下
拉。PC14-PC17 支持多种上拉模式，分别由 PD 和 USB 引脚相对应的专用控制寄存器设置。
### 8.1 主要特征

端口的每个引脚可以配置成以下的多种模式之一：
- 浮空输入 - 模拟输入
- 上拉输入 - 推挽输出
- 下拉输入（部分 IO） - 复用功能的输入和输出
许多引脚拥有复用功能，很多其他的外设把自己的输出和输入通道映射到这些引脚上，这些复
用引脚具体用法需要参照各个外设，而对这些引脚是否复用和是否重映射的内容由本章说明。
### 8.2 功能描述

#### 8.2.1 概述

**图 8-1 GPIO 模块基本结构框图**

AnalogInput V
DD
Toon-chip
peripheral
AlternateFunction Input
on/off
oonn//ooffff
Read Input data
V
DD
register
TTLSchmitt
Protection
trigger
on/off diode
Bit set/reset Inputdriver V I/O pin
Write SS
registers
Output driver V
DD Protection
diode
P-MOS
Output data
Output
V
Read/write register SS
control
N-MOS
V
SS
from on-chip Push-pull,
peripheral AlternateFunctionOutput disabled
如图 8-1 所示 IO 口结构，每个引脚在芯片内部都有两只保护二极管，IO 口内部可分为输入和
输出驱动模块。其中输入驱动有上拉电阻和下拉电阻（仅部分 IO）可选，可连接到 AD 等模拟输入
的外设；如果输入到数字外设，就需要经过一个 TTL 施密特触发器，再连接到 GPIO 输入寄存器或其
他复用外设。而输出驱动有一对 MOS 管，可将 IO 口配置成推挽输出；输出驱动内部也可以配置成由
GPIO 控制输出还是由复用的其他外设控制输出。
#### 8.2.2 GPIO的初始化功能

刚复位后，GPIO 口运行在初始状态，这时大多数 IO 口都是运行在浮空输入状态，但也有外设

<a id="pdf-page-58"></a>
<!-- PDF page 58 -->

相关的引脚是运行在外设复用的功能上。具体的初始化功能请参照引脚描述相关的章节。
#### 8.2.3 外部中断

所有的 GPIO 口都可以被配置外部中断输入通道，但一个外部中断输入通道最多只能映射到一个
GPIO 引脚上，且外部中断通道的序号必须和 GPIO 端口的位号一致，比如 PA1（或 PB1、PC1）只能
映射到 EXTI1 上，且 EXTI1 只能接受 PA1、PB1、PC1 其中之一的映射，两方都是一对一的关系。
#### 8.2.4 复用功能

使用复用功能必须要注意：
- 使用输入方向的复用功能，端口必须配置成复用输入模式，上下拉设置可根据实际需要来设置
- 使用输出方向的复用功能，端口必须配置成复用输出模式
- 对于双向的复用功能，端口必须配置成复用输出模式，这时驱动器被配置成浮空输入模式
同一个 IO 口可能有多个外设复用到此管脚，因此为了使各个外设都有最大的发挥空间，外设的
复用引脚除了默认复用引脚，还可以进行重映射，重映射到其他的引脚，避开被占用的引脚。
#### 8.2.5 锁定机制

锁定机制可以锁定 IO 口的配置。经过特定的一个写序列后，选定的 IO 引脚配置将被锁定，在
下一个复位前无法更改。
#### 8.2.6 输入配置

**图 8-2 GPIO 模块输入配置结构框图**

V
DD
on/off
on
Read Input data
V
DD
register
TTLSchmitt
Protection
trigger
on/off diode
Bit set/reset Inputdriver V I/O pin
Write SS
registers
Protection
diode
Output data V
SS
Read/write register
from on-chip peripheral
Output driver
当 IO 口配置成输入模式时，输出驱动断开，输入上下拉可选，不连接复用功能和模拟输入。在
每个 IO 口上的数据在每个 HB 时钟被采样到输入数据寄存器，读取输入数据寄存器对应位即获取了
对应引脚的电平状态。

<a id="pdf-page-59"></a>
<!-- PDF page 59 -->

#### 8.2.7 输出配置

**图 8-3 GPIO 模块输出配置结构框图**

on
Read Input data
V
DD
register
TTLSchmitt
Protection
trigger
diode
Write Bit set/reset Inputdriver I/O pin
registers
Output driver V
DD Protection
diode
P-MOS
Output data Output
V
SS
Read/write register control
N-MOS
V
SS
Push-pull,
disabled
当 IO 口配置成输出模式时，输出驱动器配置成推挽模式，不使用复用功能。输入驱动的上下拉
电阻被禁用，TTL 施密特触发器被激活，出现在 IO 引脚上的电平将会在每个 HB 时钟被采样到输入
数据寄存器，所以读取输入数据寄存器将会得到 IO 状态，对输出数据寄存器的访问就会得到最后一
次写入的值。
#### 8.2.8 复用功能配置

**图 8-4 GPIO 模块被其他外设复用时的结构框图**

Toon-chip AlternateFunctionInput
peripheral
on
Read Inputdata
V
register DD
TTLSchmitt
Protection
trigger
diode
Write Bitset/reset Inputdriver I/Opin
registers
Outputdriver V
DD Protection
diode
P-MOS
Outputdata
Output V
Read/write register SS
control
N-MOS
V
SS Push-pull,
fromon-chip open-drain or
AlternateFunctionOutput
peripheral disabled
在启用复用功能时，输出驱动器被使能，配置成推挽模式，如用于 I2C 则自动配置为开漏模式，
施密特触发器也被打开，复用功能的输入和输出线都被连接，但是输出数据寄存器被断开，出现在
IO 引脚上的电平将会在每个 HB 时钟被采样到输入数据寄存器，读取输入数据寄存器将会得到 IO 口
当前状态；在推挽模式下，读取输出数据寄存器将会得到最后一次写入的值。

<a id="pdf-page-60"></a>
<!-- PDF page 60 -->

#### 8.2.9 模拟输入配置

**图 8-5 GPIO 模块作为模拟输入时的配置结构框图**

Toon-chip AnalogInput
peripheral
off
Read Input data 0
V
DD
register
TTLSchmitt
Protection
trigger
diode
Write Bit set/reset Inputdriver I/O pin
registers
Output driver
Protection
diode
Output data
V
Read/write SS
register
Push-pull,
disabled
在启用模拟输入时，输出缓冲器被断开，输入驱动中施密特触发器的输入被禁止以防止产生 IO
口上的消耗，上下拉电阻被禁止，读取输入数据寄存器将一直为 0。
#### 8.2.10 外设的GPIO设置

下列表格推荐了各个外设的引脚相应的 GPIO 口配置。
**表 8-1 高级定时器（TIM1/2）**

TIM1/2 配置 GPIO 配置
输入捕获通道 x 浮空输入
TIM1/2_CHx
输出比较通道 x 推挽复用输出
TIM1/2_CHxN 互补输出通道 x 推挽复用输出
TIM1/2_BKIN 刹车输入浮空输入
TIM1/2_ETR 外部触发时钟输入浮空输入
**表 8-2 通用定时器（TIM3）**

TIM3 引脚配置 GPIO 配置
输入捕获通道 x 浮空输入
TIM3_CHx
输出比较通道 x 推挽复用输出
TIM3_ETR 外部触发时钟输入浮空输入
**表 8-3 通用同步异步串行收发器（USART）**

USART 引脚配置 GPIO 配置
全双工模式推挽复用输出
USARTx_TX
半双工模式推挽复用输出（外加上拉）
全双工模式浮空输入或带上拉输入
USARTx_RX
半双工同步模式未使用
USARTx_CK 同步模式推挽复用输出

<a id="pdf-page-61"></a>
<!-- PDF page 61 -->

USARTx_RTS 硬件流量控制推挽复用输出
USARTx_CTS 硬件流量控制浮空输入或带上拉输入
**表 8-4 串行外设接口（SPI）模块**

SPI 引脚配置 GPIO 配置
主模式推挽复用输出
SPIx_SCK
从模式浮空输入
全双工主模式推挽复用输出
全双工从模式浮空输入或带上拉输入
SPIx_MOSI
简单的双向数据线/主模式推挽复用输出
简单的双向数据线/从模式未使用
全双工主模式浮空输入或带上拉输入
全双工从模式推挽复用输出
SPIx_MISO
简单的双向数据线/主模式未使用
简单的双向数据线/从模式推挽复用输出
硬件主/从模式浮空、上拉或下拉输入
SPIx_NSS 硬件主模式/NSS 输出使能推挽复用输出
软件模式未使用
**表 8-5 内部集成总线（I2C）模块**

I2C 引脚配置 GPIO 配置
I2C_SCL I2C 时钟推挽复用输出（自动开漏）
I2C_SDA I2C 数据推挽复用输出（自动开漏）
**表 8-6 USB 主机设备（USBFS）控制器**

USBFS 引脚 GPIO 配置
USBDM/USBDP 使能了 USB 模块之后，复用 IO 口会自动连接到内部 USBFS 收发器
**表 8-7 模拟转数字转换器（ADC）**

ADC 引脚 GPIO 配置
ADC 模拟输入
**表 8-8 运放功能设置（OPA）**

引脚配置功能 GPIO 配置
OPA_CHP OPA 正端输入模拟输入
OPA_CHN OPA 负端输入模拟输入
OPA_OUT OPA 输出模拟输入
**表 8-9 比较器功能设置（CMP）**

引脚配置功能 GPIO 配置
CMP_CHP CMP 正端输入模拟输入
CMP_CHN CMP 负端输入模拟输入
CMP_OUT CMP 输出复用推挽输出（1）
注：（1）CMP做外部输出时，GPIO配置为复用推挽输出，CMP输出为内部通道时，直连定时器，

<a id="pdf-page-62"></a>
<!-- PDF page 62 -->

故输出端GPIO无需配置。
**表 8-10 其他的 IO 功能设置**

引脚配置功能 GPIO 配置
MCO 时钟输出推挽复用输出
EXTI 外部中断输入浮空、上拉或下拉输入
PIOC 输入输出
**表 8-11 USB PD / type C 控制器**

USBPD 引脚 GPIO 配置
CC1/CC2 使能了 USBPD 模块之后，复用 IO 口会自动连接到内部 PD 收发器
#### 8.2.11 BC功能配置

AFIO_CTLR 寄存器包括 BC 接口 UDM/UDP 引脚的控制位、源电压及端口上拉模式的控制位。
对 UDM/UDP 的 BC_VSRC 位进行置位操作前，需要先对 UDM/UDP 的 PUE[1:0]位进行操作，设置引
脚为上拉模式，该操作可使能 BC 协议源电压 V 输出；对 UDM/UDP 的 BC_CMPO 位进行读操作，可
BC_SRC
读取引脚电压与 BC 协议参考值 V 的状态。
BC_REF
### 8.3 寄存器描述

#### 8.3.1 GPIO的寄存器描述

除非特殊说明，GPIO 的寄存器必须以字的方式操作（以 32 位来操作这些寄存器）。
**表 8-12 GPIO 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R32_GPIOA_CFGLR | 0x40010800 | PA端口配置寄存器低位(0-7) | 0x44444444 |
| R32_GPIOB_CFGLR | 0x40010C00 | PB端口配置寄存器低位(0-7) | 0x44444444 |
| R32_GPIOC_CFGLR | 0x40011000 | PC端口配置寄存器低位(0-7) | 0x44444444 |
| R32_GPIOA_CFGHR | 0x40010804 | PA端口配置寄存器高位(8-15) | 0x44444444 |
| R32_GPIOB_CFGHR | 0x40010C04 | PB端口配置寄存器高位(8-15) | 0x44444444 |
| R32_GPIOC_CFGHR | 0x40011004 | PC端口配置寄存器高位(8-15) | 0x44444444 |
| R32_GPIOA_INDR | 0x40010808 | PA端口输入数据寄存器 | 0x0000XXXX |
| R32_GPIOB_INDR | 0x40010C08 | PB端口输入数据寄存器 | 0x0000XXXX |
| R32_GPIOC_INDR | 0x40011008 | PC端口输入数据寄存器 | 0x0000XXXX |
| R32_GPIOA_OUTDR | 0x4001080C | PA端口输出数据寄存器 | 0x00000000 |
| R32_GPIOB_OUTDR | 0x40010C0C | PB端口输出数据寄存器 | 0x00000000 |
| R32_GPIOC_OUTDR | 0x4001100C | PC端口输出数据寄存器 | 0x00000000 |
| R32_GPIOA_BSHR | 0x40010810 | PA端口置位/复位寄存器低16位 | 0x00000000 |
| R32_GPIOB_BSHR | 0x40010C10 | PB端口置位/复位寄存器低16位 | 0x00000000 |
| R32_GPIOC_BSHR | 0x40011010 | PC端口置位/复位寄存器低16位 | 0x00000000 |
| R32_GPIOA_BCR | 0x40010814 | PA端口复位寄存器 | 0x00000000 |
| R32_GPIOB_BCR | 0x40010C14 | PB端口复位寄存器 | 0x00000000 |
| R32_GPIOC_BCR | 0x40011014 | PC端口复位寄存器 | 0x00000000 |
| R32_GPIOA_LCKR | 0x40010818 | PA端口锁定配置寄存器 | 0x00000000 |
| R32_GPIOB_LCKR | 0x40010C18 | PB端口锁定配置寄存器 | 0x00000000 |


<a id="pdf-page-63"></a>
<!-- PDF page 63 -->

R32_GPIOC_LCKR 0x40011018 PC 端口锁定配置寄存器 0x00000000
R32_GPIOA_CFGXR 0x4001081C PA 端口配置寄存器扩展位(16-23) 0x44444444
R32_GPIOB_CFGXR 0x40010C1C PB 端口配置寄存器扩展位(16-23) 0x44444444
R32_GPIOC_CFGXR 0x4001101C PC 端口配置寄存器扩展位(16-23) 0x44444444
R32_GPIOA_BSXR 0x40010820 PA 端口置位/复位寄存器高 16 位 0x00000000
R32_GPIOB_BSXR 0x40010C20 PB 端口置位/复位寄存器高 16 位 0x00000000
R32_GPIOC_BSXR 0x40011020 PC 端口置位/复位寄存器高 16 位 0x00000000
##### 8.3.1.1 GPIO配置寄存器低[7:0]位（GPIOx_CFGLR）（x=A/B/C）

偏移地址：0x00
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
CNF7[1:0] MODE7[1:0] CNF6[1:0] MODE6[1:0] CNF5[1:0] MODE5[1:0] CNF4[1:0] MODE4[1:0]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
CNF3[1:0] MODE3[1:0] CNF2[1:0] MODE2[1:0] CNF1[1:0] MODE1[1:0] CNF0[1:0] MODE0[1:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:30]<br>[27:26]<br>[23:22]<br>[19:18]<br>[15:14]<br>[11:10]<br>[7:6]<br>[3:2] | CNFy[1:0] | RW | (y=0-7)，端口 x 的配置位，通过这些位配置<br>相应的端口。<br>在输入模式时（MODE=00b）：<br>00：模拟输入模式；<br>01：浮空输入模式；<br>10：带有上下拉模式。<br>11：保留。<br>在输出模式（MODE>00b）：<br>00：通用推挽输出模式；<br>10：复用功能推挽输出模式（I2C自动开漏）。 | 01b |
| [29:28]<br>[25:24]<br>[21:20]<br>[17:16]<br>[13:12]<br>[9:8]<br>[5:4]<br>[1:0] | MODEy[1:0] | RW | (y=0-7)，端口 x 模式选择，通过这些位配置<br>相应的端口。<br>00：输入模式；<br>01/10/11：输出模式。 | 00b |

##### 8.3.1.2 GPIO配置寄存器高[15:8]位（GPIOx_CFGHR）（x=A/B/C）

偏移地址：0x04
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
CNF15[1:0] MODE15[1:0] CNF14[1:0] MODE14[1:0] CNF13[1:0] MODE13[1:0] CNF12[1:0] MODE12[1:0]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
CNF11[1:0] MODE11[1:0] CNF10[1:0] MODE10[1:0] CNF9[1:0] MODE9[1:0] CNF8[1:0] MODE8[1:0]
位名称访问描述复位值

<a id="pdf-page-64"></a>
<!-- PDF page 64 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| [31:30]<br>[27:26]<br>[23:22]<br>[19:18]<br>[15:14]<br>[11:10]<br>[7:6]<br>[3:2] | CNFy[1:0] | RW | (y=8-15)，端口x的配置位，通过这些位配置<br>相应的端口。<br>在输入模式时（MODE=00b）：<br>00：模拟输入模式；<br>01：浮空输入模式；<br>10：带有上下拉模式。<br>11：保留。<br>在输出模式（MODE>00b）：<br>00：通用推挽输出模式；<br>10：复用功能推挽输出模式（I2C自动开漏）。 | 01b |
| [29:28]<br>[25:24]<br>[21:20]<br>[17:16]<br>[13:12]<br>[9:8]<br>[5:4]<br>[1:0] | MODEy[1:0] | RW | (y=8-15)，端口x的模式位，通过这些位配置<br>相应的端口。<br>00：输入模式；<br>01/10/11：输出模式。 | 00b |

##### 8.3.1.3 端口输入寄存器（GPIOx_INDR）（x=A/B/C）

偏移地址：0x08
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved IDR23 IDR22 IDR21 IDR20 IDR19 IDR18 IDR17 IDR16
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
IDR15 IDR14 IDR13 IDR12 IDR11 IDR10 IDR9 IDR8 IDR7 IDR6 IDR5 IDR4 IDR3 IDR2 IDR1 IDR0
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:24] | Reserved | RO | 保留。 | 0 |
| [23:0] | IDRy | RO | (y=0-23)，端口输入数据。读出的值就是对应<br>位的高低状态。 | X |

##### 8.3.1.4 端口输出寄存器（GPIOx_OUTDR）（x=A/B/C）

偏移地址：0x0C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved ODR23 ODR22 ODR21 ODR20 ODR19 ODR18 ODR17 ODR16
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
ODR15 ODR14 ODR13 ODR12 ODR11 ODR10 ODR9 ODR8 ODR7 ODR6 ODR5 ODR4 ODR3 ODR2 ODR1 ODR0
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:24] | Reserved | RO | 保留。 | 0 |
| [23:0] | ODRy | RW | (y=0-23)，端口输出的数据。IO口对外输出这<br>些寄存器的值。<br>对于带有上下拉的输入模式： | 0 |


<a id="pdf-page-65"></a>
<!-- PDF page 65 -->

0：下拉输入；
1：上拉输入。
##### 8.3.1.5 端口复位/置位寄存器（GPIOx_BSHR）（x=A/B/C）

偏移地址：0x10
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
BR15 BR14 BR13 BR12 BR11 BR10 BR9 BR8 BR7 BR6 BR5 BR4 BR3 BR2 BR1 BR0
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
BS15 BS14 BS13 BS12 BS11 BS10 BS9 BS8 BS7 BS6 BS5 BS4 BS3 BS2 BS1 BS0
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:16] | BRy | WO | (y=0-15)，对这些位置位会清除对应的 OUTDR<br>位，写 0 不产生影响。如果同时设置了 BR 和<br>BS位，则BS位起作用。 | 0 |
| [15:0] | BSy | WO | (y=0-15)，对这些位置位会使对应的OUTDR位<br>置位，写 0 不产生影响。如果同时设置了 BR<br>和BS位，则BS位起作用。 | 0 |

##### 8.3.1.6 端口复位寄存器（GPIOx_BCR）（x=A/B/C）

偏移地址：0x14
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved BR23 BR22 BR21 BR20 BR19 BR18 BR17 BR16
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
BR15 BR14 BR13 BR12 BR11 BR10 BR9 BR8 BR7 BR6 BR5 BR4 BR3 BR2 BR1 BR0
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:24] | Reserved | RO | 保留。 | 0 |
| [23:0] | BRy | WO | (y=0-23)，对这些位置位会清除对应的 OUTDR<br>位，写0不产生影响。 | 0 |

##### 8.3.1.7 配置锁定寄存器（GPIOx_LCKR）（x=A/B/C）

偏移地址：0x18
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved LCKK LCK23 LCK22 LCK21 LCK20 LCK19 LCK18 LCK17 LCK16
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
LCK15 LCK14 LCK13 LCK12 LCK11 LCK10 LCK9 LCK8 LCK7 LCK6 LCK5 LCK4 LCK3 LCK2 LCK1 LCK0
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:25] | Reserved | RO | 保留 | 0 |
| 24 | LCKK | RO | 锁定键，它可以通过特定的序列写入实现锁<br>定，但它可以随时读出。它读出为0时表示未 | 0 |


<a id="pdf-page-66"></a>
<!-- PDF page 66 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 锁定生效，读出1时表示锁定生效。<br>锁定键的写入序列为：写1-写0-写1-读0-读<br>1，最后一步非必要，但是可以用以确认锁定<br>键已经激活。<br>在写入序列时任何错误都不会使激活锁定，且<br>在写入序列时，不能更改 LCK[23:0]的值。锁<br>定生效后，只有在下次复位后才能更改端口的<br>配置。 |  |
| [23:0] | LCKy | RW | (y=0-23)，这些位为1时表示锁定对应端口的<br>配置。只能在 LCKK 未锁定前改变这些位。锁<br>定的配置指的是配置寄存器 GPIOx_CFGLR 和<br>GPIOx_CFGHR以及GPIOx_CFGHHR。 | 0 |

注：当对相应的端口位执行了LOCK序列后，在下次系统复位之前将不能再更改端口位的配置。
##### 8.3.1.8 GPIO配置寄存器扩展(16-23)位（GPIOx_CFGXR）（x=A/B/C）

偏移地址：0x1C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
CNF23[1:0] MODE23[1:0] CNF22[1:0] MODE22[1:0] CNF21[1:0] MODE21[1:0] CNF20[1:0] MODE20[1:0]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
CNF19[1:0] MODE19[1:0] CNF18[1:0] MODE18[1:0] CNF17[1:0] MODE17[1:0] CNF16[1:0] MODE16[1:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:30]<br>[27:26]<br>[23:22]<br>[19:18]<br>[15:14]<br>[11:10]<br>[7:6]<br>[3:2] | CNFy[1:0] | RW | (y=16-23)，端口 x 的配置位，通过这些位配<br>置相应的端口。<br>在输入模式时（MODE=00b）：<br>00：模拟输入模式；<br>01：浮空输入模式；<br>10：带有上下拉模式。<br>11：保留。<br>在输出模式（MODE>00b）：<br>00：通用推挽输出模式；<br>10：复用功能推挽输出模式（I2C自动开漏）。 | 01b |
| [29:28]<br>[25:24]<br>[21:20]<br>[17:16]<br>[13:12]<br>[9:8]<br>[5:4]<br>[1:0] | MODEy[1:0] | RW | (y=16-23)，端口 x 的模式位，通过这些位配<br>置相应的端口。<br>00：输入模式；<br>01/10/11：输出模式。 | 00b |

##### 8.3.1.9 端口复位/置位寄存器高（16-23）位（GPIOx_BSXR）（x=A/B/C）

偏移地址：0x20
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16

<a id="pdf-page-67"></a>
<!-- PDF page 67 -->

Reserved BR23 BR22 BR21 BR20 BR19 BR18 BR17 BR16
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved BS23 BS22 BS21 BS20 BS19 BS18 BS17 BS16
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:24] | Reserved | RO | 保留。 | 0 |
| [23:16] | BRy | WO | (y=16-23)，对这些位置位会清除对应的OUTDR<br>位，写 0 不产生影响。如果同时设置了 BR 和<br>BS位，则BS位起作用。 | 0 |
| [15:8] | Reserved | RO | 保留。 | 0 |
| [7:0] | BSy | WO | (y=16-23)，对这些位置位会使对应的 OUTDR<br>位置位，写0不产生影响。如果同时设置了BR<br>和BS位，则BS位起作用。 | 0 |

#### 8.3.2 AFIO寄存器

除非特殊说明，AFIO 的寄存器必须以字的方式操作（以 32 位来操作这些寄存器）。
**表 8-13 AFIO 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R32_AFIO_PCFR1 | 0x40010004 | 重映射寄存器 | 0x00000000 |
| R32_AFIO_EXTICR1 | 0x40010008 | 外部中断配置寄存器1 | 0x00000000 |
| R32_AFIO_EXTICR2 | 0x4001000C | 外部中断配置寄存器2 | 0x00000000 |
| R32_AFIO_CTLR | 0x40010018 | 控制寄存器 | 0x00000045 |

##### 8.3.2.1 重映射寄存器1（AFIO_PCFR1）

偏移地址：0x04
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
PIOC_ TIM3_RM TIM2_RM TIM1_RM
Reserved SW_CFG[2:0]
RM [1:0] [2:0] [2:1]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
TIM1_ USART4_RM USART3_RM USART2_RM USART1_RM I2C1_RM SPI1_RM
RM[0] [2:0] [1:0] [2:0] [1:0] [2:0] [2:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:27] | Reserved | RO | 保留。 | 0 |
| [26:24] | SW_CFG[2:0] | RW | 这些位用以配置SW功能和跟踪功能的IO口。SWD<br>（RVSWD）是访问内核的调试接口。系统复位后<br>总是作为SWD端口。<br>0xx：启用SWD（RVSWD）；<br>100：关闭SWD（RVSWD），作为GPIO功能；<br>其他：无效。 | 0 |
| 23 | PIOC_RM | RW | PIOC的重映射位,它控制PIOC接口0到1在GPIO<br>端口的重映射<br>0：默认（[0]/PC18，[1]/PC19） | 0 |


<a id="pdf-page-68"></a>
<!-- PDF page 68 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 1：映射（[0]/PC7，[1]/PC19） |  |
| [22:21] | TIM3_RM[1:0] | RW | 定时器3的重映射位，这些位可由用户读写。它<br>控制定时器3的通道1至2在GPIO端口的重映<br>射：<br>00：默认映射（CH1/PA6，CH2/PA7）<br>01：映射（CH1/PB4，CH2/PB5）<br>10：映射（CH1/PC19，CH2/PC18）<br>11：映射（CH1/PA3，CH2/PA4）<br>注：重映射不影响在PD2上的TIM3_ETR。 | 0 |
| [20:18] | TIM2_RM[2:0] | RW | 定时器2的重映射位。这些位可由用户读写。它<br>控制定时器2的通道1至4在GPIO端口的映射：<br>000：映射（CH1/PA0，CH2/PA1，CH3/PA2，CH4/PA3，<br>ETR/PA19，BKIN/PA20，C1N/PA21，C2N/PA22，<br>C3N/PA23）<br>001：映射（CH1/PB21，CH2/PB15，CH3/PA2，<br>CH4/PA3，ETR/PA18，BKIN/PA9，C1N/PA12，<br>C2N/PA13，C3N/PA14）<br>010：映射（CH1/PA0，CH2/PA1，CH3/PB3，CH4/PB4，<br>ETR/PA19，BKIN/PA20，C1N/PC3，C2N/PA22，<br>C3N/PA23）<br>011：映射（CH1/PB21，CH2/PB15，CH3/PB3，<br>CH4/PB4，ETR/PA18，BKIN/PA9，C1N/PA12，<br>C2N/PA13，C3N/PA14）<br>100：映射（CH1/PB16，CH2/PB17，CH3/PB18，<br>CH4/PB19，ETR/PC4，BKIN/PC0，C1N/PC1，<br>C2N/PC2，C3N/PC3）<br>101：映射（CH1/PC19，CH2/PA12，CH3/PA13，<br>CH4/PC0，ETR/PA2，BKIN/PB4，C1N/PC18，<br>C2N/PB12，C3N/PB3）<br>11x：映射（CH1/PC19，CH2/PC14，CH3/PC15，<br>CH4/PC0，ETR/PA2，BKIN/PB4，C1N/PB11，<br>C2N/PB12，C3N/PB3） | 0 |
| [17:15] | TIM1_RM[2:0] | RW | 定时器1的重映射位。这些位可由用户读写。<br>它控制定时器1的通道1至4在GPIO端口的映<br>射：<br>000：映射（CH1/PB9，CH2/PB10，CH3/PB11，<br>CH4/PC16，ETR/PC17，BKIN/PB5，C1N/PB6，<br>C2N/PB7，C3N/PB8）<br>001：映射（CH1/PB9，CH2/PB10，CH3/PB11，<br>CH4/PC16，ETR/PC17，BKIN/PA6，C1N/PA7，<br>C2N/PB0，C3N/PB1）<br>010：映射（CH1/PB9，CH2/PB10，CH3/PB11，<br>CH4/PB12，ETR/PC18，BKIN/PB5，C1N/PB6，<br>C2N/PB7，C3N/PB8）<br>011：映射（CH1/PC0，CH2/PC1，CH3/PC2，CH4/PC3，<br>ETR/PC18，BKIN/PC4，C1N/PC5，C2N/PC6， | 0 |


<a id="pdf-page-69"></a>
<!-- PDF page 69 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | C3N/PC7）<br>1xx：映射（CH1/CH2/CH4/BKIN/C1N/C2N/C3N不<br>可用，CH3/PC14，ETR/PC15） |  |
| [14:12] | USART4_RM[2:0] | RW | USART4 的重映射位。该位可由用户读写。它控<br>制USART4的RX，CTS，TX，CK，RTS复用功能在<br>GPIO端口的映射。<br>000：映射（RX/PB1，CTS/PB15，TX/PB0，CK/PB2，<br>RTS/PA8）<br>001：映射（RX/PA9，CTS/PA7，TX/PA5，CK/PA6，<br>RTS/PB21）<br>010：映射（RX/PC17，CTS/PB15，TX/PC16，CK/PB2，<br>RTS/PA8）<br>011：映射（RX/PA10，CTS/PA14，TX/PB9，CK/PB8，<br>RTS/PA13）<br>1x0：映射（RX/PC19，CTS/PA5，TX/PB13，CK/PA8，<br>RTS/PA6）<br>1x1：映射（RX/PC16，CTS/PB15，TX/PC17，CK/PB2，<br>RTS/PA8） | 0 |
| [11:10] | USART3_RM[1:0] | RW | USART3 的重映射位。该位可由用户读写。它控<br>制USART3的RX，CTS，TX，CK，RTS复用功能在<br>GPIO端口的映射。<br>00：映射（RX/PB4，CTS/PB6，TX/PB3，CK/PB5，<br>RTS/PB7）<br>01：映射（RX/PC19，CTS/PB6，TX/PC18，CK/PB5，<br>RTS/PB7）<br>10：映射（RX/PB14，CTS/PA3，TX/PA18，CK/PB8，<br>RTS/PA4）<br>11：映射（RX/PB17，CTS/PB18，TX/PB16，CK<br>不可用，RTS/PB19） | 0 |
| [9:7] | USART2_RM[2:0] | RW | USART2 的重映射位。该位可由用户读写。它控<br>制USART2的RX，CTS，TX，CK，RTS复用功能在<br>GPIO端口的映射。<br>000：映射（RX/PA3，CTS/PA0，TX/PA2，CK/PA4，<br>RTS/PA1）<br>001：映射（RX/PA19，CTS/PA1，TX/PA20，CK/PA23，<br>RTS/PA2）<br>010：映射（RX/PA16，CTS/PA17，TX/PA15，<br>CK/PA22，RTS/PA21）<br>011：映射（RX/PC1，CTS/PC2，TX/PC0，CK/PB20，<br>RTS/PC3）<br>1xx：映射（RX/PA16，CTS/PA17，TX/PA15，<br>CK/PA22，RTS/PC3） | 0 |
| [6:5] | USART1_RM[1:0] | RW | USART1 的重映射位。该位可由用户读写。它控<br>制USART1的RX，CTS，TX，CK，RTS复用功能在<br>GPIO端口的映射。<br>00：映射（RX/PB11，CTS/PC16，TX/PB10，CK/PB9， | 0 |


<a id="pdf-page-70"></a>
<!-- PDF page 70 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | RTS/PC17）<br>01：映射（RX/PA11，CTS/PC16，TX/PA10，CK/PB9，<br>RTS/PC17）<br>10：映射（RX/PB11，CTS/PA9，TX/PB10，CK/PB5，<br>RTS/PA8）<br>11：映射（RX/PB2，CTS/PA13，TX/PA7，CK/PB12，<br>RTS/PA14） |  |
| [4:2] | I2C1_RM[2:0] | RW | I2C1的重映射。该位可由用户读写。它控制I2C1<br>的SCL和SDA复用功能在GPIO端口的映射：<br>000：映射（SCL/PA10，SDA/PA11）<br>001：映射（SCL/PA13，SDA/PA14）<br>010：映射（SCL/PC16，SDA/PC17）<br>011：映射（SCL/PC19，SDA/PC18）<br>1x0：映射（SCL/PC17，SDA/PC16）<br>1x1：映射（SCL/PC18，SDA/PC19） | 0 |
| [1:0] | SPI1_RM[1:0] | RW | SPI1的重映射。该位可由用户读写。它控制SPI1<br>的NSS、CK、MISO和MOSI复用功能在GPIO端口<br>的映射：<br>00：映射（NSS/PA4，CK/PA5，MISO/PA6，MOSI/PA7）<br>01：映射（NSS/PB21，CK/PB15，MISO/PA8，<br>MOSI/PA9）<br>10：映射（NSS/PA12，CK/PA11，MISO/PA9，<br>MOSI/PA10）<br>11：映射（NSS/PC4，CK/PC5，MISO/PC6，MOSI/PC7） | 0 |

##### 8.3.2.2 外部中断配置寄存器1（AFIO_EXTICR1）

偏移地址：0x08
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
EXTI15 EXTI14 EXTI13 EXTI12 EXTI11 EXTI10 EXTI9 EXTI8
[31:30] [29:28] [27:26] [25:24] [23:22] [21:20] [19:18] [17:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
EXTI7 EXTI6 EXTI5 EXTI4 EXTI3 EXTI2 EXTI1 EXTI0
[15:14] [13:12] [11:10] [9:8] [7:6] [5:4] [3:2] [1:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:30]<br>[29:28]<br>[27:26]<br>[25:24]<br>[23:22]<br>[21:20]<br>[19:18]<br>[17:16]<br>[15:14]<br>[13:12] | EXTIx[1:0] | RW | (x=0-15)外部中断输入引脚配置位。用以决定<br>外部中断引脚映射到哪个端口的引脚上：<br>00：PA引脚的第x个引脚；<br>01：PB引脚的第x个引脚；<br>10：PC引脚的第x个引脚；<br>其他：保留。 | 0 |


<a id="pdf-page-71"></a>
<!-- PDF page 71 -->

[11:10]
[9:8]
[7:6]
[5:4]
[3:2]
[1:0]
##### 8.3.2.3 外部中断配置寄存器2（AFIO_EXTICR2）

偏移地址：0x0C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
EXTI23 EXTI22 EXTI21 EXTI20 EXTI19 EXTI18 EXTI17 EXTI16
[15:14] [13:12] [11:10] [9:8] [7:6] [5:4] [3:2] [1:0}
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:16] | Reserved | RO | 保留。 | 0 |
| [15:14]<br>[13:12]<br>[11:10]<br>[9:8]<br>[7:6]<br>[5:4]<br>[3:2]<br>[1:0] | EXTIx[1:0] | RW | (x=16-23),外部中断输入引脚配置位。用以决<br>定外部中断引脚映射到哪个端口的引脚上：<br>00：PA引脚的第x个引脚；<br>01：PB引脚的第x个引脚；<br>10：PC引脚的第x个引脚；<br>其他：保留。 | 0 |

##### 8.3.2.4 控制寄存器（AFIO_CTLR）

偏移地址：0x18
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
PB6_F PB5_F PA4_F PA3_F UDM_ UDP_ UDM_B UDP_B
Reserved ILT_E ILT_E ILT_E ILT_E Reserved BC_C BC_C C_VSR C_VSR
N N N N MPO MPO C C
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
USBP
USBPD USB_P
D_PH USB_I UDP_PUE UDM_PUE
Reserved _IN_H HY_V3 Reserved
Y_V3 OEN [1:0] [1:0]
VT 3
3
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:28] | Reserved | RO | 保留。 | 0 |
| 27 | PB6_FILT_EN | RW | 控制PB6引脚的输入滤波使能：<br>1：打开滤波，去除短于10μs的脉冲；<br>0：关闭滤波。 | 0 |
| 26 | PB5_FILT_EN | RW | 控制PB5引脚的输入滤波使能： | 0 |


<a id="pdf-page-72"></a>
<!-- PDF page 72 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 1：打开滤波，去除短于10us的脉冲，可以用<br>于对运放OPA1的输出方波进行过滤；<br>0：关闭滤波。 |  |
| 25 | PA4_FILT_EN | RW | 控制PA4引脚的输入滤波使能：<br>1：打开滤波，去除短于 10μs 的脉冲，可以<br>用于对运放OPA2的输出方波进行过滤；<br>0：关闭滤波。 | 0 |
| 24 | PA3_FILT_EN | RW | 控制PA3引脚的输入滤波使能：<br>1：打开滤波，去除短于 10μs 的脉冲，可以<br>用于对运放OPA1的输出方波进行过滤；<br>0：关闭滤波。 | 0 |
| [23:20] | Reserved | RW | 保留。 | 0 |
| 19 | UDM_BC_CMPO | RO | PC16/UDM引脚BC协议比较器状态：<br>1：PC16电压高于BC协议参考值V ；<br>BC_REF<br>0：PC16电压低于BC协议参考值V 。<br>BC_REF | 0 |
| 18 | UDP_BC_CMPO | RO | PC17/UDP引脚BC协议比较器状态：<br>1：PC17电压高于BC协议参考值V ；<br>BC_REF<br>0：PC17电压低于BC协议参考值V 。<br>BC_REF | 0 |
| 17 | UDM_BC_VSRC | RW | PC16/UDM引脚BC协议源电压使能：<br>1：PC16输出BC协议源电压V ；<br>BC_SRC<br>0：禁止输出。 | 0 |
| 16 | UDP_BC_VSRC | RW | PC17/UDP引脚BC协议源电压使能：<br>1：PC17输出BC协议源电压V ；<br>BC_SRC<br>0：禁止输出。 | 0 |
| [15:10] | Reserved | RO | 保留。 | 0 |
| 9 | USBPD_IN_HVT | RW | PD引脚PC14/PC15高阈值输入模式：<br>1：高阈值输入，典型值约2.2V，可降低PD通<br>讯时的I/O功耗；<br>0：正常GPIO阈值输入，适用于GPIO应用。 | 0 |
| 8 | USBPD_PHY_V33 | RW | PD收发器PHY上拉限幅配置位：<br>1：直接用VDD，输出电压可达VDD，适用于GPIO<br>应用或VDD电压为3.3V的PD应用；<br>0：启用内部简单降压，适用于 VDD 电压超过<br>4V的PD应用。<br>注：PC14/PC15用作PD收发器时，按以上说明<br>配置；用作普通IO时，建议该位配置成1。 | 0 |
| 7 | USB_IOEN | RW | USB复用IO引脚使能：<br>1：开启USB复用；<br>0：禁止作为USB。<br>开启USB除了USB_IOEN置1，还需设置：<br>GPIO配置寄存器GPIOC_CFGXR中PC16和PC17<br>对应的MODE=0选择输入模式；<br>对于USB主机，CNF=10选择带有上下拉的输入<br>模式，GPIOC_OUTDR中 PC16 和 PC17 对应位为<br>0即下拉；<br>对于 USB 设备，PC17对应的 CNF=10选择带有 | 0 |


<a id="pdf-page-73"></a>
<!-- PDF page 73 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 上下拉的输入模式，GPIOC_OUTDR中PC17对应<br>位为 1即上拉，PC16对应的 CNF=01选择浮空<br>输入。 |  |
| 6 | USB_PHY_V33 | RW | USB收发器PHY输出及上拉限幅配置位：<br>1：直接用VDD，输出电压可达VDD，适用于GPIO<br>应用或VDD电压为3.3V的USB应用；<br>0：启用LDO降压，限幅到约3.3V，适用于VDD<br>电压超过4V的USB应用。 | 1 |
| [5:4] | Reserved | RO | 保留。 | 0 |
| [3:2] | UDP_PUE[1:0] | RW | PC17/UDP引脚的上拉模式位：<br>00：禁止上拉；<br>01：上拉约35μA，可用于GPIO应用；<br>10：上拉 10KΩ，可用于 VDD=5V 下的 USB，或<br>用于与16KΩ下拉电阻构成分压；<br>11：上拉1.5KΩ，可用于VDD=3.3V下的USB。<br>此处仅设置上拉模式，上拉使能或下拉使能由<br>GPIO配置寄存器GPIOx_CFG和端口输出寄存器<br>GPIOx_OUTD中的配置控制。 | 01b |
| [1:0] | UDM_PUE[1:0] | RW | PC16/UDM引脚的上拉模式位：<br>00：禁止上拉；<br>01：上拉约35μA，可用于GPIO应用；<br>10：上拉 10KΩ，可用于 VDD=5V 下的 USB，或<br>用于与16KΩ下拉电阻构成分压；<br>11：上拉1.5KΩ，可用于VDD=3.3V下的USB。<br>此处仅设置上拉模式，上拉使能或下拉使能由<br>GPIO配置寄存器GPIOx_CFG和端口输出寄存器<br>GPIOx_OUTD中的配置控制。 | 01b |


<a id="pdf-page-74"></a>
<!-- PDF page 74 -->

## 第9章 直接存储器访问控制（DMA）

直接存储器访问控制器（DMA）提供在外设和存储器之间或存储器和存储器之间的高速数据传输
方式，无须 CPU 干预，数据可以通过 DMA 快速地移动，以节省 CPU 的资源来做其他操作。
DMA 控制器每个通道专门用来管理来自于一个或多个外设对存储器访问的请求。还有一个仲裁
器来协调各通道之间的优先级。
### 9.1 主要特性

- 8 个通用的独立可配置通道，USB 和 USB PD 另有专用的独立通道。
- 每个通道都直接连接专用的硬件 DMA 请求，并支持软件触发
- 支持循环的缓冲器管理
- 多个通道之间的请求优先权可以通过软件编程设置(最高、高、中和低)，优先权设置相等时由
通道号决定（通道号越低优先级越高）
- 支持外设到存储器、存储器到外设、存储器到存储器之间的传输
- 闪存、SRAM、外设的 SRAM 和 HB 外设均可作为访问的源和目标
- 可编程的数据传输数目：最大为 65535
### 9.2 功能描述

#### 9.2.1 DMA通道处理

1）仲裁优先级
多个独立的通道产生的 DMA 请求通过逻辑或结构输入到 DMA 控制器，当前只会有一个通道的请
求得到响应。模块内部的仲裁器根据通道请求的优先级来选择要启动的外设/存储器的访问。
软件管理中，应用程序通过对 DMA_CFGRx 寄存器的 PL[1:0]位设置，可以为每个通道独立配置
优先等级，包括最高、高、中、低 4 个等级。当通道间的软件设置等级一致时，模块会按固定的硬
件优先级选择，通道编号偏低的要比偏高的有较高优先权。
2）DMA 配置
当 DMA 控制器收到一个请求信号时，会访问发出请求的外设或存储器，建立外设或存储器和存
储器之间的数据传输。主要包括下面 3 个操作步骤：
1） 从外设数据寄存器或当前外设/存储器地址寄存器指示的存储器地址取数据，第一次传输时的开
始地址是 DMA_PADDRx 或 DMA_MADDRx 寄存器指定的外设基地址或存储器地址。
2） 存数据到外设数据寄存器或当前外设/存储器地址寄存器指示的存储器地址，第一次传输时的开
始地址是 DMA_PADDRx 或 DMA_MADDRx 寄存器指定的外设基地址或存储器地址。
3） 执行一次 DMA_CNTRx 寄存器中数值的递减操作，该寄存器指示当前未完成转移的操作数目。
每个通道包括 3 种 DMA 数据转移方式：
- 外设到存储器（MEM2MEM=0，DIR=0）
- 存储器到外设（MEM2MEM=0，DIR=1）
- 存储器到存储器（MEM2MEM=1）
注：存储器到存储器方式无需外设请求信号，配置为此模式后（MEM2MEM=1），通道开启（EN=1）即
可启动数据传输。此方式不支持循环模式。
配置过程如下：
1） 在 DMA_PADDRx 寄存器中设置外设寄存器的首地址或存储器到存储器方式（MEM2MEM=1）下存储

<a id="pdf-page-75"></a>
<!-- PDF page 75 -->

器数据地址。发生 DMA 请求时，这个地址将是数据传输的源或目标地址。
2） 在 DMA_MADDRx 寄存器中设置存储器数据地址。发生 DMA 请求时，传输的数据将从这个地址读出
或写入这个地址。
3） 在 DMA_CNTRx 寄存器中设置要传输的数据数量。在每个数据传输后，这个数值递减。
4） 在 DMA_CFGRx 寄存器的 PL[1:0]位中设置通道的优先级。
5） 在 DMA_CFGRx 寄存器中设置数据传输的方向、循环模式、外设和存储器的增量模式、外设和存
储器的数据宽度、传输过半、传输完成、传输错误中断使能位，
6） 设置 DMA_CCRx 寄存器的 ENABLE 位，启动通道 x。
注：DMA_PADDRx/DMA_MADDRx/DMA_CNTRx寄存器以及DMA_CFGRx寄存器中的数据传输的方向（DIR）、
循环模式（位置）、外设和存储器的增量模式（MINC/PINC）等控制位只有在DMA通道被关闭下才可
以配置写入。
3）循环模式
设置 DMA_CFGRx 寄存器的 CIRC 位置 1，可以启用通道数据传输的循环模式功能。循环模式下，
当数据传输的数目变为 0 时，DMA_CNTRx 寄存器的内容会自动被重新加载为其初始数值，内部的外
设和存储器地址寄存器也被重新加载为 DMA_PADDRx 和 DMA_MADDRx 寄存器设定的初始地址值，DMA
操作将继续进行，直到通道被关闭或关闭 DMA 模式。
4）DMA 处理状态
- 传输过半：对应 DMA_INTFR 寄存器中的 HTIFx 位硬件置位。当 DMA 的传输数目减至初始设定值
一半以下将会产生 DMA 传输过半标志，如果在 DMA_CCRx 寄存器中置位了 HTIE，则将产生中断。
硬件通过此标志提醒应用程序，可以为新一轮数据传输做准备。
- 传输完成：对应 DMA_INTFR 寄存器中的 TCIFx 位硬件置位。当 DMA 的传输数目减至 0 将会产生
DMA 传输完成标志，如果在 DMA_CCRx 寄存器中置位了 TCIE，则将产生中断。
- 传输错误：对应 DMA_INTFR 寄存器中的 TEIFx 位硬件置位。读写一个保留的地址区域，将会产
生 DMA 传输错误。同时模块硬件会自动清 0 发生错误的通道所对应的 DMA_CCRx 寄存器的 EN 位，
该通道被关闭。如果在 DMA_CCRx 寄存器中置位了 TEIE，则将产生中断。
应用程序在查询 DMA 通道状态时，可以先访问 DMA_INTFR 寄存器的 GIFx 位，判断出当前哪个通
道发生了 DMA 事件，进而处理该通道的具体 DMA 事件内容。
#### 9.2.2 可编程的数据传输总大小/数据位宽/对齐方式

DMA 每个通道一轮传输的数据量总大小可编程，最大 65535 次。DMA_CNTRx 寄存器中指示待传输
数目。在 EN=0 时，写入设置值，在 EN=1 开启 DMA 传输通道后，此寄存器变为只读属性，在每次传
输后数值递减。
外设和存储器的传输数据取值支持地址指针自动递增功能，指针增量可编程。它们访问的第一
个传输的数据地址存放在 DMA_PADDRx 和 DMA_MADDRx 寄存器中，通过设置 DMA_CFGRx 寄存器的 PINC
位或 MINC 位置 1，可以分别开启外设地址自增模式或存储器地址自增模式，PSIZE[1:0]设置外设地
址取数据大小及地址自增大小，MSIZE[1:0]设置存储器地址取数据大小及地址自增大小，包括 3 种
选择：8 位、16 位、32 位。具体数据转移方式如下表：
**表 9-1 不同数据位宽下 DMA 转移（PINC=MINC=1）**

源端目标传输
源：地址/数据目标：地址/数据传输操作
位宽位宽数目
0x00/B0 0x00/B0 - 源端地址递增量与源端设置的
0x01/B1 0x01/B1 数据位宽对齐，取值大小等于
8 8 4
0x02/B2 0x02/B2 源端数据位宽
0x03/B3 0x03/B3 - 目标地址递增量与目标设置数

<a id="pdf-page-76"></a>
<!-- PDF page 76 -->

0x00/B0 0x00/00B0 据的位宽对齐，取值大小等于
0x01/B1 0x02/00B1 目标数据位宽
8 16 4
0x02/B2 0x04/00B2 - DMA 转移送入目标端的数据依
0x03/B3 0x06/00B3 据原则：数据大小不足高位补
0x00/B0 0x00/000000B0 0，数据大小溢出高位去掉
0x01/B1 0x04/000000B1 - 存储数据方式：小端模式，低
8 32 4
0x02/B2 0x08/000000B2 地址存放低字节，高地址存放
0x03/B3 0x0C/000000B3 高字节
0x00/B1B0 0x00/B0
0x02/B3B2 0x01/B2
16 8 4
0x04/B5B4 0x02/B4
0x06/B7B6 0x03/B6
0x00/B1B0 0x00/B1B0
0x02/B3B2 0x02/B3B2
16 16 4
0x04/B5B4 0x04/B5B4
0x06/B7B6 0x06/B7B6
0x00/B1B0 0x00/0000B1B0
0x02/B3B2 0x04/0000B3B2
16 32 4
0x04/B5B4 0x08/0000B5B4
0x06/B7B6 0x0C/0000B7B6
0x00/B3B2B1B0 0x00/B0
0x04/B7B6B5B4 0x01/B4
32 8 4
0x08/BBBAB9B8 0x02/B8
0x0C/BFBEBDBC 0x03/BC
0x00/B3B2B1B0 0x00/B1B0
0x04/B7B6B5B4 0x02/B5B4
32 16 4
0x08/BBBAB9B8 0x04/B9B8
0x0C/BFBEBDBC 0x06/BDBC
0x00/B3B2B1B0 0x00/B3B2B1B0
0x04/B7B6B5B4 0x04/B7B6B5B4
32 32 4
0x08/BBBAB9B8 0x08/BBBAB9B8
0x0C/BFBEBDBC 0x0C/BFBEBDBC

<a id="pdf-page-77"></a>
<!-- PDF page 77 -->

#### 9.2.3 DMA请求映射

**图 9-1 DMA 请求映像**

ENbitofchannel1
ADC
Hardware request1
USART4_TX
Channel 1
TIM2_CH3
Software Trigger Arbiter
MEM2MEM bit
SPI_RX ENbitofchannel2
Hardware request2
USART3_TX
TIM1_CH1 Channel 2
TIM2_UP Software Priority
Software Trigger
MEM2MEM bit
PL setting
value of
ENbitofchannel3
SPI_TX channel
Hardware request3
USART3_RX
Channel 3
TIM1_CH2
Software Trigger
MEM2MEM bit
DMA
USART1_TX ENbitofchannel4 Request
Hardware request4
TIM1_CH4 to internal
TIM1_TRIG Channel 4
TIM1_COM
Software Trigger
MEM2MEM bit
ENbitofchannel5
USART1_RX
Hardware request5
TIM1_UP
Channel 5
TIM2_CH1 Fixed hardware
Software Trigger
priority
MEM2MEM bit
Channel
USART2_RX ENbitofchannel6
Hardware request6 No.
I2C_TX
TIM1_CH3 Channel 6
Software Trigger
MEM2MEM bit
USART2_TX ENbitofchannel7
Hardware request7
I2C_RX
TIM2_CH2 Channel 7
TIM2_CH4 Software Trigger
MEM2MEM bit
ENbitofchannel7
USART4_RX Hardware request8
TIM2_TRIG
Channel 8
TIM2_COM
Software Trigger
MEM2MEM bit
DMA 控制器提供 8 个通道，每个通道对应多个外设请求，通过设置相应外设寄存器中对应 DMA
控制位，可以独立的开启或关闭各个外设的 DMA 功能，具体对应关系如下。
外设通道 1 通道 2 通道 3 通道 4 通道 5 通道 6 通道 7 通道 8
ADC ADC
SPI SPI_RX SPI_TX
USART1 USART1_TX USART1_RX
USART2 USART2_RX USART2_TX
USART3 USART3_TX USART3_RX

<a id="pdf-page-78"></a>
<!-- PDF page 78 -->

USART4 USART4_TX USART4_RX
I2C I2C_TX I2C_RX
TIM1_CH4
TIM1 TIM1_CH1 TIM1_CH2 TIM1_TRIG TIM1_UP TIM1_CH3
TIM1_COM
TIM2_CH2 TIM2_TRIG
TIM2 TIM2_CH3 TIM2_UP TIM2_CH1
TIM2_CH4 TIM2_COM
### 9.3 寄存器描述

**表 9-2 DMA 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R32_DMA_INTFR | 0x40020000 | DMA中断状态寄存器 | 0x00000000 |
| R32_DMA_INTFCR | 0x40020004 | DMA中断标志清除寄存器 | 0x00000000 |
| R32_DMA_CFGR1 | 0x40020008 | DMA通道1配置寄存器 | 0x00000000 |
| R32_DMA_CNTR1 | 0x4002000C | DMA通道1传输数据数目寄存器 | 0x00000000 |
| R32_DMA_PADDR1 | 0x40020010 | DMA通道1外设地址寄存器 | 0x00000000 |
| R32_DMA_MADDR1 | 0x40020014 | DMA通道1存储器地址寄存器 | 0x00000000 |
| R32_DMA_CFGR2 | 0x4002001C | DMA通道2配置寄存器 | 0x00000000 |
| R32_DMA_CNTR2 | 0x40020020 | DMA通道2传输数据数目寄存器 | 0x00000000 |
| R32_DMA_PADDR2 | 0x40020024 | DMA通道2外设地址寄存器 | 0x00000000 |
| R32_DMA_MADDR2 | 0x40020028 | DMA通道2存储器地址寄存器 | 0x00000000 |
| R32_DMA_CFGR3 | 0x40020030 | DMA通道3配置寄存器 | 0x00000000 |
| R32_DMA_CNTR3 | 0x40020034 | DMA通道3传输数据数目寄存器 | 0x00000000 |
| R32_DMA_PADDR3 | 0x40020038 | DMA通道3外设地址寄存器 | 0x00000000 |
| R32_DMA_MADDR3 | 0x4002003C | DMA通道3存储器地址寄存器 | 0x00000000 |
| R32_DMA_CFGR4 | 0x40020044 | DMA通道4配置寄存器 | 0x00000000 |
| R32_DMA_CNTR4 | 0x40020048 | DMA通道4传输数据数目寄存器 | 0x00000000 |
| R32_DMA_PADDR4 | 0x4002004C | DMA通道4外设地址寄存器 | 0x00000000 |
| R32_DMA_MADDR4 | 0x40020050 | DMA通道4存储器地址寄存器 | 0x00000000 |
| R32_DMA_CFGR5 | 0x40020058 | DMA通道5配置寄存器 | 0x00000000 |
| R32_DMA_CNTR5 | 0x4002005C | DMA通道5传输数据数目寄存器 | 0x00000000 |
| R32_DMA_PADDR5 | 0x40020060 | DMA通道5外设地址寄存器 | 0x00000000 |
| R32_DMA_MADDR5 | 0x40020064 | DMA通道5存储器地址寄存器 | 0x00000000 |
| R32_DMA_CFGR6 | 0x4002006C | DMA通道6配置寄存器 | 0x00000000 |
| R32_DMA_CNTR6 | 0x40020070 | DMA通道6传输数据数目寄存器 | 0x00000000 |
| R32_DMA_PADDR6 | 0x40020074 | DMA通道6外设地址寄存器 | 0x00000000 |
| R32_DMA_MADDR6 | 0x40020078 | DMA通道6存储器地址寄存器 | 0x00000000 |
| R32_DMA_CFGR7 | 0x40020080 | DMA通道7配置寄存器 | 0x00000000 |
| R32_DMA_CNTR7 | 0x40020084 | DMA通道7传输数据数目寄存器 | 0x00000000 |
| R32_DMA_PADDR7 | 0x40020088 | DMA通道7外设地址寄存器 | 0x00000000 |
| R32_DMA_MADDR7 | 0x4002008C | DMA通道7存储器地址寄存器 | 0x00000000 |
| R32_DMA_CFGR8 | 0x40020094 | DMA通道8配置寄存器 | 0x00000000 |
| R32_DMA_CNTR8 | 0x40020098 | DMA通道8传输数据数目寄存器 | 0x00000000 |
| R32_DMA_PADDR8 | 0x4002009C | DMA通道8外设地址寄存器 | 0x00000000 |


<a id="pdf-page-79"></a>
<!-- PDF page 79 -->

R32_DMA_MADDR8 0x400200A0 DMA 通道 8 存储器地址寄存器 0x00000000
#### 9.3.1 DMA中断状态寄存器（DMA_INTFR）

偏移地址：0x00
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
TEIF8 HTIF8 TCIF8 GIF8 TEIF7 HTIF7 TCIF7 GIF7 TEIF6 HTIF6 TCIF6 GIF6 TEIF5 HTIF5 TCIF5 GIF5
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
TEIF4 HTIF4 TCIF4 GIF4 TEIF3 HTIF3 TCIF3 GIF3 TEIF2 HTIF2 TCIF2 GIF2 TEIF1 HTIF1 TCIF1 GIF1
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 31/27/23/<br>19/15/11/<br>7/3 | TEIFx | RO | 通道x的传输错误标志（x=1/2/3/4/5/6/7/8）：<br>1：在通道x上发生了传输错误；<br>0：在通道x上没有传输错误。<br>硬件置位，软件写CTEIFx位清除此标志。 | 0 |
| 30/26/22/<br>18/14/10/<br>6/2 | HTIFx | RO | 通道x的传输过半标志（x=1/2/3/4/5/6/7/8）：<br>1：在通道x上产生了传输过半事件；<br>0：在通道x上没有传输过半。<br>硬件置位，软件写CHTIFx位清除此标志。 | 0 |
| 29/25/21/<br>17/13/9/5<br>/1 | TCIFx | RO | 通道x的传输完成标志（x=1/2/3/4/5/6/7/8）：<br>1：在通道x上产生了传输完成事件；<br>0：在通道x上没有传输完成事件。<br>硬件置位，软件写CTCIFx位清除此标志。 | 0 |
| 2824/20/1<br>6/12/8/4/<br>0 | GIFx | RO | 通道x的全局中断标志（x=1/2/3/4/5/6/7/8）：<br>1：在通道x上产生了TEIFx或HTIFx或TCIFx；<br>0：在通道x上没有发生TEIFx或HTIFx或TCIFx。<br>硬件置位，软件写CGIFx位清除此标志。 | 0 |

#### 9.3.2 DMA中断标志清除寄存器（DMA_INTFCR）

偏移地址：0x04
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
CTEIF8 CHTIF8 CTCIF8 CGIF8 CTEIF7 CHTIF7 CTCIF7 CGIF7 CTEIF6 CHTIF6 CTCIF6 CGIF6 CTEIF5 CHTIF5 CTCIF5 CGIF5
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
CTEIF4 CHTIF4 CTCIF4 CGIF4 CTEIF3 CHTIF3 CTCIF3 CGIF3 CTEIF2 CHTIF2 CTCIF2 CGIF2 CTEIF1 CHTIF1 CTCIF1 CGIF1
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 31/27/23/<br>19/15/11/<br>7/3 | CTEIFx | WO | 清除通道x的传输错误标志（x=1/2/3/4/5/6/8）：<br>1：清除DMA_INTFR寄存器中的TEIFx标志；<br>0：无作用。 | 0 |
| 30/26/22/<br>18/14/10/<br>6/2 | CHTIFx | WO | 清除通道x的传输过半标志（x=1/2/3/4/5/6/8）：<br>1：清除DMA_INTFR寄存器中的HTIFx标志；<br>0：无作用。 | 0 |
| 29/25/21/<br>17/13/9/5 | CTCIFx | WO | 清除通道x的传输完成标志（x=1/2/3/4/5/6/7/8）：<br>1：清除DMA_INTFR寄存器中的TCIFx标志； | 0 |


<a id="pdf-page-80"></a>
<!-- PDF page 80 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| /1 |  |  | 0：无作用。 |  |
| 2824/20/1<br>6/12/8/4/<br>0 | CGIFx | WO | 清除通道x的全局中断标志（x=1/2/3/4/5/6/7/8）：<br>1：清除 DMA_INTFR 寄存器中的 TEIFx/HTIFx/TCIFx/<br>GIFx标志；<br>0：无作用。 | 0 |

#### 9.3.3 DMA通道x配置寄存器（DMA_CFGRx）（x=1/2/3/4/5/6/7/8）

偏移地址：0x08
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reser MEM2
PL[1:0] MSIZE[1:0] PSIZE[1:0] MINC PINC CIRC DIR TEIE HTIE TCIE EN
ved MEM
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:15] | Reserved | RO | 保留。 | 0 |
| 14 | MEM2MEM | RW | 存储器到存储器模式使能：<br>1：使能存储器到存储器数据传输模式；<br>0：非存储器到存储器数据传输。 | 0 |
| [13:12] | PL[1:0] | RW | 通道优先级设置：<br>00：低； 01：中；<br>10：高； 11：最高。 | 0 |
| [11:10] | MSIZE[1:0] | RW | 存储器地址数据宽度设置：<br>00：8位； 01：16位；<br>10：32位； 11：保留。 | 0 |
| [9:8] | PSIZE[1:0] | RW | 外设地址数据宽度设置：<br>00：8位； 01：16位；<br>10：32位； 11：保留。 | 0 |
| 7 | MINC | RW | 存储器地址增量递增模式使能：<br>1：使能存储器地址增量递增操作；<br>0：存储器地址保持不变操作。 | 0 |
| 6 | PINC | RW | 外设地址增量递增模式使能：<br>1：使能外设地址增量递增操作；<br>0：外设地址保持不变操作。 | 0 |
| 5 | CIRC | RW | DMA通道循环模式使能：<br>1：使能循环操作；<br>0：执行单次操作。 | 0 |
| 4 | DIR | RW | 数据传输方向：<br>1：从存储器读；<br>0：从外设读。 | 0 |
| 3 | TEIE | RW | 传输错误中断使能控制：<br>1：使能传输错误中断；<br>0：禁止传输错误中断。 | 0 |
| 2 | HTIE | RW | 传输过半中断使能控制： | 0 |


<a id="pdf-page-81"></a>
<!-- PDF page 81 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 1：使能传输过半中断；<br>0：禁止传输过半中断。 |  |
| 1 | TCIE | RW | 传输完成中断使能控制：<br>1：使能传输完成中断；<br>0：禁止传输完成中断。 | 0 |
| 0 | EN | RW | 通道使能控制：<br>1：通道开启； 0：通道关闭。<br>发生DMA传输错误时，硬件自动将此位清0，关闭通道。 | 0 |

#### 9.3.4 DMA通道x传输数据数目寄存器（DMA_CNTRx）（x=1/2/3/4/5/6/7/8）

偏移地址：0x0C + (x-1)*20
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
NDT[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:16] | Reserved | RO | 保留。 | 0 |
| [15:0] | NDT[15:0] | RW | 数据传输数量，范围0-65535。<br>指示剩余的待传输数目（寄存器内容在每次 DMA 传输<br>后递减）。<br>在通道为循环模式下，寄存器的内容将被自动重新加<br>载为之前配置的数值。 | 0 |

#### 9.3.5 DMA通道x外设地址寄存器（DMA_PADDRx）（x=1/2/3/4/5/6/7/8）

偏移地址：0x10 + (x-1)*20
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
PA[31:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | PA[31:0] | RW | 外设基地址，作为外设数据传输的源或目标地址。<br>当PSIZE[1:0]=‘01’（16位），模块自动忽略bit0，<br>操作地址自动2字节对齐；当PSIZE[1:0]=‘10’（32<br>位），模块自动忽略bit[1:0]，操作地址自动4字节<br>对齐。 | 0 |

注：此寄存器只能在EN=0时更改，EN=1时不可写。
#### 9.3.6 DMA通道x存储器地址寄存器（DMA_MADDRx）（x=1/2/3/4/5/6/7/8）

偏移地址：0x14 + (x-1)*20
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
MA[31:0]

<a id="pdf-page-82"></a>
<!-- PDF page 82 -->

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | MA[31:0] | RW | 存储器数据地址，作为数据传输的源或目标地址。<br>当MSIZE[1:0]=‘01’（16位），模块自动忽略bit0，<br>操作地址自动2字节对齐；当MSIZE[1:0]=‘10’（32<br>位），模块自动忽略bit[1:0]，操作地址自动4字节<br>对齐。 | 0 |

注：此寄存器只能在EN=0时更改，EN=1时不可写。

<a id="pdf-page-83"></a>
<!-- PDF page 83 -->

## 第10章 模拟/数字转换（ADC）

ADC 模块包含 1 个 12 位的逐次逼近型的模拟数字转换器。支持 14 个外部通道和 1 个内部信号
源采样源。可完成通道的单次转换、连续转换，通道间自动扫描模式、间断模式、外部触发模式、
双重采样等功能。可以通过模拟看门狗功能监测通道电压是否在阈值范围内。
### 10.1 主要特性

- 12 位分辨率
- 支持 14 个外部通道和 1 个内部信号采样源
- 多通道的多种采样转换方式：单次、连续、扫描、触发、间断等
- 数据对齐模式：左对齐（仅规则组）、右对齐
- 采样时间可按通道分别编程
- 规则转换和注入转换均支持外部触发
- 模拟看门狗监测通道电压 ADC 通道输入范围：0≤V ≤V
IN DD

<a id="pdf-page-84"></a>
<!-- PDF page 84 -->

### 10.2 功能描述

#### 10.2.1 模块结构

**图 10-1 ADC 模块框图**

Rulechanneldata Conversionends
V EOC=1
DD register (16 bits)
V
SS Endof Injection
Injection channel data conversion
V
REF+ JEOC=1
register (4×16 bits)
V
REF-
- ADC_IOFRx[11:0]
ADC_IN00
Analog to ADCCLK
ADC_IN11
Rulechannel
GPIO Digital ADC_SAMPTPx
group
Port Converters
Injection
ADC_IN13 DMA
channelgroup
Request
V
REFINT
AnalogWatchdog
Highthreshold(12-bit)
Lowthreshold(12-bit) CompareResults
AWD=1
EXTSEL[2:0]
TIM1_TGR0
TIM1_CC1
TIM1_CC2
TIM2_TGR0
TIM2_CC1
TIM3_CC1
SWSTART
EXTI11 EXTTRIG
JEXTSEL[2:0]
TIM1_CC3
TIM1_CC4
TIM2_CC3
TIM2_CC4
TIM2_CC2
TIM3_CC2
JSWSTART
EXTI15 JEXTTRIG
#### 10.2.2 ADC配置

1）模块上电
ADC_CTLR2 寄存器的 ADON 位为 1 表示 ADC 模块上电。当 ADC 模块从断电模式（ADON=0）下进入
上电状态（ADON=1）后，需要延迟一段时间 t 用于模块稳定时间。之后再次写入 ADON 位为 1，用
STAB
于作为软件启动 ADC 转换的启动信号。通过清除 ADON 位为 0，可以终止当前转换并将 ADC 模块置于
断电模式，这个状态下，ADC 几乎不耗电。
2）采样时钟
模块的寄存器操作基于 HCLK（HB 总线）时钟，其转换单元的时钟基准 ADCCLK 与 HCLK 同步，由

<a id="pdf-page-85"></a>
<!-- PDF page 85 -->

ADC_CTLR3 寄存器的 CLK_DIV[3:0]域配置分频。
3）通道配置
ADC 模块提供了 14 个通道采样源。它们可以配置到两种转换组中：规则组和注入组。以实现任
意多个通道上以任意顺序进行一系列转换构成的组转换。
转换组：
- 规则组：由多达 16 个转换组成。规则通道和它们的转换顺序在 ADC_RSQRx 寄存器中设置。
规则组中转换的总数量应写入 ADC_RSQR1 寄存器的 L[3:0]中。
- 注入组：由多达 4 个转换组成。注入通道和它们的转换顺序在 ADC_ISQR 寄存器中设置。注
入组里的转换总数量应写入 ADC_ISQR 寄存器的 JL[1:0]中。
注：如果ADC_RSQRx或ADC_ISQR寄存器在转换期间被更改，当前的转换被终止，一个新的启动信号
将发送到ADC以转换新选择的组。
1 个内部通道：
- V 内部参考电压：连接 ADC_IN15 通道。
REFINT
4）可编程采样时间
ADC 使用若干个 ADCCLK 周期对输入电压采样，通道的采样周期数目可以通过 ADC_SAMPTR1 和
ADC_SAMPTR2 寄存器中的 SMPx[2:0]位更改。每个通道可以分别使用不同的时间采样。
总转换时间如下计算：
T = 采样时间 + 13T
CONV ADCCLK
ADC的规则通道转换支持DMA功能。规则通道转换的值储存在一个仅有的数据寄存器ADC_RDATAR
中，为防止连续转换多个规则通道时，没有及时取走 ADC_RDATAR 寄存器中的数据，可以开启 ADC
的 DMA 功能。硬件会在规则通道的转换结束时（EOC 置位）产生 DMA 请求，并将转换的数据从
ADC_RDATAR 寄存器传输到用户指定的目的地址。
对 DMA 控制器模块的通道配置完成后，写 ADC_CTLR2 寄存器的 DMA 位置 1，开启 ADC 的 DMA 功
能。
注：注入组转换不支持DMA功能。
5）数据对齐
ADC_CTLR2 寄存器中的 ALIGN 位选择 ADC 转换后的数据存储对齐方式。12 位数据支持左对齐和
右对齐模式。
规则组通道的数据寄存器 ADC_RDATAR 保存的是实际转换的 12 位数字值；而注入组通道的数据
寄存器 ADC_IDATARx 是实际转换的数据减去 ADC_IOFRx 寄存器的定义的偏移量后写入的值，会存在
正负情况，所以有符号位（SIGNB）。
注：数据左对齐仅适用于使用规则组的情况。
**图 10-2 数据左对齐**

规则组数据寄存器
D11 D10 D9 D8 D7 D6 D5 D4 D3 D2 D1 D0 0 0 0 0
**图 10-3 数据右对齐**

规则组数据寄存器
0 0 0 0 D11 D10 D9 D8 D7 D6 D5 D4 D3 D2 D1 D0
注入组数据寄存器
SIGNB SIGNB SIGNB SIGNB D11 D10 D9 D8 D7 D6 D5 D4 D3 D2 D1 D0

<a id="pdf-page-86"></a>
<!-- PDF page 86 -->

#### 10.2.3 外部触发源

ADC 转换的启动事件可以由外部事件触发。如果设置了 ADC_CTLR2 寄存器的 EXTTRIG 或 JEXTTRIG
位，则可分别通过外部事件触发规则组或注入组通道的转换。此时，EXTSEL[2:0]和 JEXTSEL[2:0]
位的配置决定规则组和注入组的外部事件源。
**表 10-1 规则组通道的外部触发源**

EXTSEL[2:0] 触发源类型
000 定时器 1 的 TRGO 事件
001 定时器 1 的 CC1 事件
010 定时器 1 的 CC2 事件
来自片上定时器的内部信号
011 定时器 2 的 TRGO 事件
100 定时器 2 的 CC1 事件
101 定时器 3 的 CC1 事件
110 EXTI 线 11 来自外部引脚
111 SWSTART 位置 1 软件触发软件控制位
**表 10-2 注入组通道的外部触发源**

JEXTSEL[2:0] 触发源类型
000 定时器 1 的 CC3 事件
001 定时器 1 的 CC4 事件
010 定时器 2 的 CC3 事件
来自片上定时器的内部信号
011 定时器 2 的 CC4 事件
100 定时器 2 的 CC2 事件
101 定时器 3 的 CC2 事件
110 EXTI 线 15 来自外部引脚
111 JSWSTART 位置 1 软件触发软件控制位
#### 10.2.4 转换模式

**表 10-3 转换模式组合**

ADC_CTLR1 和 ADC_CTLR2 寄存器控制位
ADC 转换模式
CONT SCAN DISCEN/JDISCEN IAUTO 启动事件
单次单通道模式：某一规则通道执行单次转
ADON 位置 1
换。
0 0 0
外部触发单次单通道模式：规则通道或注入通道的某一
方式通道执行单次转换。
单次扫描模式：按顺序对选中的所有规则组通
0 道（ADC_RSQRx）或所有注入组通道（ADC_ISQR）
ADON 位置 1 逐个执行单次转换。
1 0 0 或外部触触发注入方式：当规则组通道转换过程中可以
发方式插入注入组通道所有转换，之后再继续规则组
通道转换；但转换注入组通道时不会插入规则
组通道转换。

<a id="pdf-page-87"></a>
<!-- PDF page 87 -->

单次扫描模式：按顺序对选中的所有规则组通
道（ADC_RSQRx）或所有注入组通道（ADC_ISQR）
ADON 位置 1 逐个执行单次转换。
1 或外部触自动注入方式：在规则组通道转换完之后，注
发方式入组通道被自动转换。
注：转换过程中不允许出现注入通道的外部触
发信号。
单次间断模式：每次启动事件，执行一个短序
列（DISCNUM[2:0]定义数量）的通道数量转换，
1 直到所有选中通道转换完成才能重头开始。
外部触发
（DISCEN 和 0 注：规则组和注入组选中此模式控制位分别为
0 方式
JDISCEN 不能同 DISCEN和JDISCEN，不能同时为规则组和注入
时为 1） 组配置间断模式，间断模式只能用于一组转
换。
1 - 禁止此模式。
1 1 X - 无此模式。
0 0 0 ADON 位置 1
连续单通道/扫描模式：每轮结束后重复新一
1 0 或外部触
1 0 轮的转换，直到 CONT 清 0 才能终止。
1 发方式
注：规则组和注入组的外部触发事件是不一样的，而且‘ACON’位只能启动规则组通道转换，所以
规则组和注入组通道转换的启动事件独立。
1）单次单通道转换模式
此模式下，对当前 1 个通道只执行一次转换。该模式对规则组或注入组中排序第 1 的通道执行
转换，其中通过设置 ADC_CTLR2 寄存器的 ADON 位置 1(只适用于规则通道)启动也可通过外部触发启
动(适用于规则通道或注入通道)。一旦选择通道的转换完成将：
如果转换的是规则组通道，则转换数据被储存在 16 位 ADC_RDATAR 寄存器中，EOC 标志被置位，
如果设置了 EOCIE 位，将触发 ADC 中断。
如果转换的是注入组通道，则转换数据被储存在 16 位 ADC_IDATAR1 寄存器中，EOC 和 JEOC 标
志被置位，如果设置了 JEOCIE 或 EOCIE 位，将触发 ADC 中断。
2）单次扫描模式转换
通过设置 ADC_CTLR1 寄存器的 SCAN 位为 1 进入 ADC 扫描模式。此模式用来扫描一组模拟通道，
对被 ADC_RSQRx 寄存器(对规则通道)或 ADC_ISQR(对注入通道)选中的所有通道逐个执行单次转换，
当前通道转换结束时，同一组的下一个通道被自动转换。
在扫描模式里，根据 IAUTO 位的状态，又分为触发注入方式和自动注入方式。
- 触发注入
IAUTO 位为 0，当在扫描规则组通道过程中，发生了注入组通道转换的触发事件，当前转换被复
位，注入通道的序列被以单次扫描方式进行，在所有选中的注入组通道扫描转换结束后，恢复上次
被中断的规则组通道转换。
如果当前在扫描注入组通道序列时，发生了规则通道的启动事件，注入组转换不会被中断，而
是在注入序列转换完成后再执行规则序列的转换。
注：使用触发的注入转换时，必须保证触发事件的间隔长于注入序列。例如，完成注入序列的转换
总体时间需要28个ADCCLK，那么触发注入通道的事件间隔时间最小值为29个ADCCLK。
- 自动注入
IAUTO 位为 1，在扫描完规则组选中的所有通道转换后，自动进行注入组选中通道的转换。这种

<a id="pdf-page-88"></a>
<!-- PDF page 88 -->

方式可以用来转换 ADC_RSQRx 和 ADC_ISQR 寄存器中多达 20 个转换序列。
此模式里，必须禁止注入通道的外部触发（JEXTTRIG=0）。
注：对于ADC时钟预分频系数（CLK_DIV[3:0]）为4至8时，当从规则转换切换到注入序列或从注
入转换切换到规则序列时，会自动插入1个ADCCLK间隔；当ADC时钟预分频系数为2时，则有2
个ADCCLK间隔的延迟。
3）单次间断模式转换
通过设置 ADC_CTLR1 寄存器的 DISCEN 或 JDISCEN 位为 1 进入规则组或注入组的间断模式。此模
式区别扫描模式中扫描完整的一组通道，而是将一组通道分为多个短序列，每次外部触发事件将执
行一个短序列的扫描转换。
短序列的长度 n（n<=8）定义在 ADC_CTLR1 寄存器的 DISCNUM[2:0]中，当 DISCEN 为 1，则是规
则组的间断模式，待转换总长度定义在 ADC_RSQR1 寄存器的 L[3:0]中；当 JDISCEN 为 1，则是注入
组的间断模式，待转换总长度定义在 ADC_ISQR 寄存器的 JL[1:0]中。不能同时将规则组和注入组设
置为间断模式。
规则组间断模式举例：
DISCEN=1，DISCNUM[2:0]=3，L[3:0]=8，待转换通道=1，3，2，5，8，4，10，6
第 1 次外部触发：转换序列为：1，3，2
第 2 次外部触发：转换序列为：5，8，4
第 3 次外部触发：转换序列为：10，6，同时产生 EOC 事件
第 4 次外部触发：转换序列为：1，3，2
注入组间断模式举例：
JDISCEN=1，DISCNUM[2:0]=1，JL[1:0]=3，待转换通道=1，3，2
第 1 次外部触发：转换序列为：1
第 2 次外部触发：转换序列为：3
第 3 次外部触发：转换序列为：2，同时产生 EOC 和 JEOC 事件
第 4 次外部触发：转换序列为：1
注：1.当以间断模式转换一个规则组或注入组时，转换序列结束后不自动从头开始。当所有子组被
转换完成，下一次触发事件启动第一个子组的转换。
2.不能同时使用自动注入（IAUTO=1）和间断模式。
3.不能同时为规则组和注入组设置间断模式，间断模式只能用于一组转换。
4）连续转换
在连续转换模式中，当前面 ADC 转换一结束马上就启动另一次转换，转换不会在选择组的最后
一个通道上停止，而是再次从选择组的第一个通道继续转换。此模式的启动事件包括外部触发事件
和 ADON 位置 1，设置启动后，需将 CONT 位置 1。
如果一个规则通道被转换，转换数据被存储于 ADC_RDATAR 寄存器中，转换结束标志 EOC 被置位，
如果设置了 EOCIE，则产生中断。
如果一个注入通道被转换，转换数据被存储于 ADC_IDATARx 寄存器中，注入转换结束标志 JEOC
被置位，如果设置了 JEOCIE，则产生中断。
#### 10.2.5 模拟看门狗

如果被 ADC 转换的模拟电压低于低阈值或高于高阈值，AWD 模拟看门狗状态位被设置。阈值设
置位于 ADC_WDHTR 和 ADC_WDLTR 寄存器的最低 12 个有效位中。通过设置 ADC_CTLR1 寄存器的 AWDIE
位以允许产生相应中断。

<a id="pdf-page-89"></a>
<!-- PDF page 89 -->

**图 10-4 模拟看门狗阈值区**

Analogvoltage
conversionvalues
Alert High
ADC_WDHTR
Threshold
Alert Area
Alert Low
ADC_WDLTR
Threshold
配置 ADC_CTLR1 寄存器的 AWDSGL、AWDEN、JAWDEN 及 AWDCH[3:0]位选择模拟看门狗警戒的通道，
具体关系见下表：
**表 10-4 模拟看门狗通道选择**

ADC_CTLR1 寄存器控制位
模拟看门狗警戒通道
AWDSGL AWDEN JAWDEN AWDCH[3:0]
不警戒忽略 0 0 忽略
所有注入通道 0 0 1 忽略
所有规则通道 0 1 0 忽略
所有注入和规则通道 0 1 1 忽略
单一注入通道 1 0 1 决定通道编号
单一规则通道 1 1 0 决定通道编号
单一注入和规则通道 1 1 1 决定通道编号
### 10.3 寄存器描述

**表 10-5 ADC 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R32_ADC_STATR | 0x40012400 | ADC状态寄存器 | 0x00000000 |
| R32_ADC_CTLR1 | 0x40012404 | ADC控制寄存器1 | 0x00000000 |
| R32_ADC_CTLR2 | 0x40012408 | ADC控制寄存器2 | 0x00000000 |
| R32_ADC_SAMPTR1 | 0x4001240C | ADC采样时间配置寄存器1 | 0x00000000 |
| R32_ADC_SAMPTR2 | 0x40012410 | ADC采样时间配置寄存器2 | 0x00000000 |
| R32_ADC_IOFR1 | 0x40012414 | ADC注入通道数据偏移寄存器1 | 0x00000000 |
| R32_ADC_IOFR2 | 0x40012418 | ADC注入通道数据偏移寄存器2 | 0x00000000 |
| R32_ADC_IOFR3 | 0x4001241C | ADC注入通道数据偏移寄存器3 | 0x00000000 |
| R32_ADC_IOFR4 | 0x40012420 | ADC注入通道数据偏移寄存器4 | 0x00000000 |
| R32_ADC_WDHTR | 0x40012424 | ADC看门狗高阈值寄存器 | 0x00000FFF |
| R32_ADC_WDLTR | 0x40012428 | ADC看门狗低阈值寄存器 | 0x00000000 |
| R32_ADC_RSQR1 | 0x4001242C | ADC规则通道序列寄存器1 | 0x00000000 |
| R32_ADC_RSQR2 | 0x40012430 | ADC规则通道序列寄存器2 | 0x00000000 |
| R32_ADC_RSQR3 | 0x40012434 | ADC规则通道序列寄存器3 | 0x00000000 |
| R32_ADC_ISQR | 0x40012438 | ADC注入通道序列寄存器 | 0x00000000 |
| R32_ADC_IDATAR1 | 0x4001243C | ADC注入数据寄存器1 | 0x00000000 |
| R32_ADC_IDATAR2 | 0x40012440 | ADC注入数据寄存器2 | 0x00000000 |


<a id="pdf-page-90"></a>
<!-- PDF page 90 -->

R32_ADC_IDATAR3 0x40012444 ADC 注入数据寄存器 3 0x00000000
R32_ADC_IDATAR4 0x40012448 ADC 注入数据寄存器 4 0x00000000
R32_ADC_RDATAR 0x4001244C ADC 规则数据寄存器 0x00000000
R32_ADC_CTLR3 0x40012450 ADC 控制寄存器 3 0x00000003
R32_ADC_WDTR1 0x40012454 ADC 看门狗阈值 1 寄存器 0x0FFF0000
R32_ADC_WDTR2 0x40012458 ADC 看门狗阈值 2 寄存器 0x0FFF0000
R32_ADC_WDTR3 0x4001245C ADC 看门狗阈值 3 寄存器 0x0FFF0000
#### 10.3.1 ADC状态寄存器（ADC_STATR）

偏移地址：0x00
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved STRT JSTRT JEOC EOC AWD
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:5] | Reserved | RO | 保留。 | 0 |
| 4 | STRT | RW0 | 规则通道转换开始状态：<br>1：规则通道转换已开始；<br>0：规则通道转换未开始。<br>该位由硬件置1，由软件清0（写1无效）。 | 0 |
| 3 | JSTRT | RW0 | 注入通道转换开始状态：<br>1：注入通道转换已开始；<br>0：注入通道转换未开始。<br>该位由硬件置1，由软件清0（写1无效）。 | 0 |
| 2 | JEOC | RW0 | 注入通道组转换结束状态：<br>1：转换完成；<br>0：转换未完成。<br>该位由硬件置1（所有注入通道转换完），由软件清0<br>（写1无效）。 | 0 |
| 1 | EOC | RW0 | 转换结束状态：<br>1：转换完成；<br>0：转换未完成。<br>该位由硬件置1（规则或注入通道组转换结束），由软<br>件清0（写1无效）或读ADC_RDATAR时清除。 | 0 |
| 0 | AWD | RW0 | 模拟看门狗标志位：<br>1：发生模拟看门狗事件；<br>0：没有发生模拟看门狗事件。<br>该位由硬件置1（转换值超出ADC_WDHTR和ADC_WDLTR<br>寄存器范围），由软件清0（写1无效）。 | 0 |

#### 10.3.2 ADC控制寄存器1（ADC_CTLR1）

偏移地址：0x04
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16

<a id="pdf-page-91"></a>
<!-- PDF page 91 -->

Reserved TKENABLE AWDEN JAWDEN Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
JDISC DISC AWD JEOC EOC Rese
DISCNUM[2:0] JAUTO SCAN AWDIE AWDCH[3:0]
EN EN SGL IE IE rved
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:25] | Reserved | RO | 保留。 | 0 |
| 24 | TKENABLE | RW | TKEY模块使能控制，包括TKEY_F和TKEY_V单元：<br>1：开启TKEY模块；<br>0：关闭TKEY模块。 | 0 |
| 23 | AWDEN | RW | 在规则通道上模拟看门狗功能使能位：<br>1：规则通道上使能模拟看门狗；<br>0：规则通道上关闭模拟看门狗。 | 0 |
| 22 | JAWDEN | RW | 在注入通道上模拟看门狗功能使能位：<br>1：注入通道上使能模拟看门狗；<br>0：注入通道上关闭模拟看门狗。 | 0 |
| [21:16] | Reserved | RO | 保留。 | 0 |
| [15:13] | DISCNUM[2:0] | RW | 间断模式下，外部触发后要转换的规则通道数目：<br>000：1个通道；<br>…<br>111：8个通道。 | 0 |
| 12 | JDISCEN | RW | 注入通道上的间断模式使能位：<br>1：使能注入通道上的间断模式；<br>0：关闭注入通道上的间断模式。 | 0 |
| 11 | DISCEN | RW | 规则通道上的间断模式使能位：<br>1：使能规则通道上的间断模式；<br>0：关闭规则通道上的间断模式。 | 0 |
| 10 | JAUTO | RW | 开启规则通道完成后，自动转换注入通道组使能位：<br>1：使能自动的注入通道组转换；<br>0：关闭自动的注入通道组转换。<br>注：此模式需要禁止注入通道的外部触发功能。 | 0 |
| 9 | AWDSGL | RW | 扫描模式下，在单一通道上使用模拟看门狗使能位：<br>1：在单一通道上使用模拟看门狗（AWDCH[3:0]选择）；<br>0：在所有通道上使用模拟看门狗。 | 0 |
| 8 | SCAN | RW | 扫描模式使能位：<br>1：使能扫描模式（连续转换ADC_IOFRx和ADC_RSQRx<br>选择的所有通道）；<br>0：关闭扫描模式。 | 0 |
| 7 | JEOCIE | RW | 注入通道组转换结束中断使能位：<br>1：使能注入通道组转换完成中断（JEOC标志）；<br>0：关闭注入通道组转换完成中断。 | 0 |
| 6 | AWDIE | RW | 模拟看门狗中断使能位：<br>1：使能模拟看门狗中断；<br>0：关闭模拟看门狗中断。<br>注：在扫描模式下，如果发生此中断将中止扫描。 | 0 |


<a id="pdf-page-92"></a>
<!-- PDF page 92 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| 5 | EOCIE | RW | 转换结束（规则或注入通道组）中断使能位：<br>1：使能转换结束中断（EOC标志）；<br>0：关闭转换结束中断。 | 0 |
| 4 | Reserved | RO | 保留。 | 0 |
| [3:0] | AWDCH[3:0] | RW | 模拟看门狗通道选择位：<br>0000：模拟输入通道0；<br>0001：模拟输入通道1；<br>…<br>1111：模拟输入通道15。 | 0 |

#### 10.3.3 ADC控制寄存器2（ADC_CTLR2）

偏移地址：0x08
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
SW JSW EXT Reser
Reserved EXTSEL[2:0]
START START TRIG ved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
JEXT
JEXTSEL[2:0] ALIGN Reserved DMA Reserved CONT ADON
TRIG
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:23] | Reserved | RO | 保留。 | 0 |
| 22 | SWSTART | RW | 启动一个规则通道转换，需要设置软件触发：<br>1：启动规则通道转换；<br>0：复位状态。<br>此位由软件置位，转换开始后硬件清0。 | 0 |
| 21 | JSWSTART | RW | 启动一个注入通道转换，需要设置软件触发：<br>1：启动注入通道转换；<br>0：复位状态。<br>此位由软件置位，转换开始后硬件清0或者软件清0。 | 0 |
| 20 | EXTTRIG | RW | 规则通道的外部触发转换模式使能：<br>1：使用外部事件启动转换；<br>0：关闭外部事件启动功能。 | 0 |
| [19:17] | EXTSEL[2:0] | RW | 启动规则通道转换的外部触发事件选择：<br>000：定时器1的TRGO事件；<br>001：定时器1的CC1事件；<br>010：定时器1的CC2事件；<br>011：定时器2的TRGO事件；<br>100：定时器2的CC1事件；<br>101：定时器3的CC1事件；<br>110：EXTI线11；<br>111：SWSTART软件触发。 | 0 |
| 16 | Reserved | RO | 保留。 | 0 |
| 15 | JEXTTRIG | RW | 注入通道的外部触发转换模式使能：<br>1：使用外部事件启动转换； | 0 |


<a id="pdf-page-93"></a>
<!-- PDF page 93 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 0：关闭外部事件启动功能。 |  |
| [14:12] | JEXTSEL[2:0] | RW | 启动注入通道转换的外部触发事件选择：<br>000：定时器1的CC3事件；<br>001：定时器1的CC4事件；<br>010：定时器2的CC3事件；<br>011：定时器2的CC4事件；<br>100：定时器2的CC2事件；<br>101：定时器3的CC2事件；<br>110：EXTI线15；<br>111：JSWSTART软件触发。 | 0 |
| 11 | ALIGN | RW | 数据对齐方式：<br>1：左对齐； 0：右对齐。<br>注：数据左对齐仅适用于使用规则组的情况。 | 0 |
| [10:9] | Reserved | RO | 保留。 | 0 |
| 8 | DMA | RW | 直接存储访问（DMA）模式使能：<br>1：使能DMA模式；<br>0：关闭DMA模式。 | 0 |
| [7:2] | Reserved | RO | 保留。 | 0 |
| 1 | CONT | RW | 连续转换使能：<br>1：连续转换模式；<br>0：单次转换模式。<br>如果设置了此位，则转换将连续进行直到该位被清除。 | 0 |
| 0 | ADON | RW | 开/关A/D转换器<br>当该位为 0 时，写入 1 将把 ADC 从断电模式下唤醒；<br>当该位为1时，写入1将启动转换。<br>1：开启ADC并启动转换；<br>0：关闭ADC转换，并进入断电模式。<br>注：当寄存器只有ADON改变时，才会启动一次转换，<br>如果还有其他任意位发送变化，则不会启动新的转换。 | 0 |

#### 10.3.4 ADC采样时间配置寄存器1（ADC_SAMPTR1）

偏移地址：0x0C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved SMP17[2:0] SMP16[2:0] SMP15[2:1]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
SMP15[0] SMP14[2:0] SMP13[2:0] SMP12[2:0] SMP11[2:0] SMP10[2:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:24] | Reserved | RO | 保留。 | 0 |
| [23:0] | SMPx[2:0] | RW | SMPx[2:0]：通道x（a-f）的采样时间配置：<br>000：4周期； 001：5周期；<br>010：6周期； 011：7周期；<br>100：8周期； 101：9周期；<br>110：10周期； 111：11周期； | 0 |


<a id="pdf-page-94"></a>
<!-- PDF page 94 -->

这些位用于独立地选择每个通道的采样时间，在采样
周期中通道配置值必须保持不变。
#### 10.3.5 ADC采样时间配置寄存器2（ADC_SAMPTR2）

偏移地址：0x10
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved SMP9[2:0] SMP8[2:0] SMP7[2:0] SMP6[2:0] SMP5[2:1]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
SMP5[0] SMP4[2:0] SMP3[2:0] SMP2[2:0] SMP1[2:0] SMP0[2:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:30] | Reserved | RO | 保留。 | 0 |
| [29:0] | SMPx[2:0] | RW | SMPx[2:0]：通道x(0-9)的采样时间配置：<br>000：4周期； 001：5周期；<br>010：6周期； 011：7周期；<br>100：8周期； 101：9周期；<br>110：10周期； 111：11周期；<br>这些位用于独立地选择每个通道的采样时间，在采样<br>周期中通道配置值必须保持不变。 | 0 |

#### 10.3.6 ADC注入通道数据偏移寄存器x（ADC_IOFRx）(x=1/2/3/4)

偏移地址：0x14 + (x-1)*4
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved JOFFSETx[11:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:12] | Reserved | RO | 保留。 | 0 |
| [11:0] | JOFFSETx | RW | 注入通道x的数据偏移值。<br>转换注入通道时，这个值定义了用于从原始转换数据<br>中减去的数值。转换的结果可以在 ADC_IDATARx 寄存<br>器中读出。 | 0 |

#### 10.3.7 ADC看门狗高阈值寄存器（ADC_WDHTR）

偏移地址：0x24
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved HT[11:0]

<a id="pdf-page-95"></a>
<!-- PDF page 95 -->

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:12] | Reserved | RO | 保留。 | 0 |
| [11:0] | HT[11:0] | RW | 模拟看门狗高阈值设置值。 | 0xfff |

注：可以在转换过程中更改WDHTR和WDLTR的值，但它们将在下次转换时生效。
#### 10.3.8 ADC看门狗低阈值寄存器（ADC_WDLTR）

偏移地址：0x28
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved LT[11:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:12] | Reserved | RO | 保留。 | 0 |
| [11:0] | LT[11:0] | RW | 模拟看门狗低阈值设置值。 | 0 |

注：可以在转换过程中更改WDHTR和WDLTR的值，但它们将在下次转换时生效。
#### 10.3.9 ADC规则通道序列寄存器1（ADC_RSQR1）

偏移地址：0x2C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved L[3:0] SQ16[4:1]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
SQ16[0] SQ15[4:0] SQ14[4:0] SQ13[4:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:24] | Reserved | RO | 保留。 | 0 |
| [23:20] | L[3:0] | RW | 规则通道转换序列中需要转换的通道数目：<br>0000-1111：1-16个转换通道。 | 0 |
| [19:15] | SQ16[4:0] | RW | 规则序列中的第16个转换通道的编号（0-13,15）。 | 0 |
| [14:10] | SQ15[4:0] | RW | 规则序列中的第15个转换通道的编号（0-13,15）。 | 0 |
| [9:5] | SQ14[4:0] | RW | 规则序列中的第14个转换通道的编号（0-13,15）。 | 0 |
| [4:0] | SQ13[4:0] | RW | 规则序列中的第13个转换通道的编号（0-13,15）。 | 0 |

#### 10.3.10 ADC规则通道序列寄存器2（ADC_RSQR2）

偏移地址：0x30
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved SQ12[4:0] SQ11[4:0] SQ10[4:1]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
SQ10[0] SQ9[4:0] SQ8[4:0] SQ7[4:0]
位名称访问描述复位值

<a id="pdf-page-96"></a>
<!-- PDF page 96 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| [31:30] | Reserved | RO | 保留。 | 0 |
| [29:25] | SQ12[4:0] | RW | 规则序列中的第12个转换通道的编号（0-13,15）。 | 0 |
| [24:20] | SQ11[4:0] | RW | 规则序列中的第11个转换通道的编号（0-13,15）。 | 0 |
| [19:15] | SQ10[4:0] | RW | 规则序列中的第10个转换通道的编号（0-13,15）。 | 0 |
| [14:10] | SQ9[4:0] | RW | 规则序列中的第9个转换通道的编号（0-13,15）。 | 0 |
| [9:5] | SQ8[4:0] | RW | 规则序列中的第8个转换通道的编号（0-13,15）。 | 0 |
| [4:0] | SQ7[4:0] | RW | 规则序列中的第7个转换通道的编号（0-13,15）。 | 0 |

#### 10.3.11 ADC规则通道序列寄存器3（ADC_RSQR3）

偏移地址：0x34
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved SQ6[4:0] SQ5[4:0] SQ4[4:1]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
SQ4[0] SQ3[4:0] SQ2[4:0] SQ1[4:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:30] | Reserved | RO | 保留。 | 0 |
| [29:25] | SQ6[4:0] | RW | 规则序列中的第6个转换通道的编号（0-13,15）。 | 0 |
| [24:20] | SQ5[4:0] | RW | 规则序列中的第5个转换通道的编号（0-13,15）。 | 0 |
| [19:15] | SQ4[4:0] | RW | 规则序列中的第4个转换通道的编号（0-13,15）。 | 0 |
| [14:10] | SQ3[4:0] | RW | 规则序列中的第3个转换通道的编号（0-13,15）。 | 0 |
| [9:5] | SQ2[4:0] | RW | 规则序列中的第2个转换通道的编号（0-13,15）。 | 0 |
| [4:0] | SQ1[4:0] | RW | 规则序列中的第1个转换通道的编号（0-13,15）。 | 0 |

#### 10.3.12 ADC注入通道序列寄存器（ADC_ISQR）

偏移地址：0x38
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved JL[1:0] JSQ4[4:1]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
JSQ4[0] JSQ3[4:0] JSQ2[4:0] JSQ1[4:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:22] | Reserved | RO | 保留。 | 0 |
| [21:20] | JL[1:0] | RW | 注入通道转换序列中需要转换的通道数目：<br>00-11：1-4个转换通道。 | 0 |
| [19:15] | JSQ4[4:0] | RW | 注入序列中的第4个转换通道的编号（0-13,15）。<br>注：软件写入，并将通道编号（0-13,15）分配为要转<br>换的序列中的第4个。 | 0 |
| [14:10] | JSQ3[4:0] | RW | 注入序列中的第3个转换通道的编号（0-13,15）。 | 0 |
| [9:5] | JSQ2[4:0] | RW | 注入序列中的第2个转换通道的编号（0-13,15）。 | 0 |
| [4:0] | JSQ1[4:0] | RW | 注入序列中的第1个转换通道的编号（0-13,15）。 | 0 |

注：不同于规则转换序列，如果JL[1:0]的长度小于4，则转换的序列顺序是从(4-JL)开始。

<a id="pdf-page-97"></a>
<!-- PDF page 97 -->

例如，当 JL[1:0]=3（定序器中有 4 次注入转换）时，ADC 将按以下顺序转换通道：JSQ1[4:0]、
JSQ2[4:0]、JSQ3[4:0]和JSQ4[4:0]；
当JL[1:0]=2（定序器中有3次注入转换）时，ADC将按以下顺序转换通道：JSQ2[4:0]、JSQ3[4:0]
和JSQ4[4:0]；
当 JL[1:0]=1（定序器中有 2 次注入转换）时，ADC 转换通道的顺序为：先是 JSQ3[4:0]，后是
JSQ4[4:0]；
当JL[1:0]=0（定序器中有1次注入转换）时，ADC将仅转换JSQ4[4:0]通道。
如果 ADCx_ISQR[21:0]=10 00111 00011 00111 00010，ADC 将按以下顺序转换通道：JSQ2[4:0]、
JSQ3[4:0]和JSQ4[4:0]，表示扫描转换按以下通道顺序进行：7、3、7。
#### 10.3.13 ADC注入数据寄存器x（ADC_IDATARx）（x=1/2/3/4）

偏移地址：0x3C + (x-1)*4
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
JDATA[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:16] | Reserved | RO | 保留。 | 0 |
| [15:0] | JDATA[15:0] | RO | 注入通道转换数据（数据右对齐）。 | 0 |

#### 10.3.14 ADC规则数据寄存器（ADC_RDATAR）

偏移地址：0x4C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
DATA[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:16] | Reserved | RO | 保留。 | 0 |
| [15:0] | DATA[15:0] | RO | 规则通道转换数据（数据左对齐或右对齐）。 | 0 |

#### 10.3.15 ADC控制寄存器3（ADC_CTLR3）

偏移地址：0x50
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
AWD3_ AWD2_ AWD1_ AWD0_
Reserved
RES RES RES RES
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
AWD_S
AED_RST_EN[3:0] Reserved Reserved CLK_DIV[3:0]
CAN
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:20] | Reserved | RO | 保留。 | 0 |


<a id="pdf-page-98"></a>
<!-- PDF page 98 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| 19 | AWD3_RES | RW0 | 模拟看门狗3比较结果。<br>1：转换值大于看门狗3高阈值或小于看门狗3低阈值；<br>0：转换值在看门狗3高阈值和低阈值之间。<br>注：硬件置1，写0清零。 | 0 |
| 18 | AWD2_RES | RW0 | 模拟看门狗2比较结果。<br>1：转换值大于看门狗2高阈值或小于看门狗2低阈值；<br>0：转换值在看门狗2高阈值和低阈值之间。<br>注：硬件置1，写0清零。 | 0 |
| 17 | AWD1_RES | RW0 | 模拟看门狗1比较结果。<br>1：转换值大于看门狗1高阈值或小于看门狗1低阈值；<br>0：转换值在看门狗1高阈值和低阈值之间。<br>注：硬件置1，写0清零。 | 0 |
| 16 | AWD0_RES | RW0 | 模拟看门狗0比较结果。<br>1：转换值大于看门狗0高阈值或小于看门狗0低阈值；<br>0：转换值在看门狗0高阈值和低阈值之间。<br>注：硬件置1，写0清零。 | 0 |
| 15 | AWD3_RST_EN | RW | 看门狗3输出复位使能位：<br>1：开启；<br>0：关闭。 | 0 |
| 14 | AWD2_RST_EN | RW | 看门狗2输出复位使能位：<br>1：开启；<br>0：关闭。 | 0 |
| 13 | AWD1_RST_EN | RW | 看门狗1输出复位使能位：<br>1：开启；<br>0：关闭。 | 0 |
| 12 | AWD0_RST_EN | RW | 看门狗0输出复位使能位：<br>1：开启；<br>0：关闭。 | 0 |
| [11:10] | Reserved | RO | 保留。 | 0 |
| 9 | AWD_SCAN | RW | 模拟看门狗扫描使能：<br>1：打开看门狗扫描；<br>0：禁止看门狗扫描。 | 0 |
| [8:4] | Reserved | RO | 保留。 | 0 |
| [3:0] | CLK_DIV[3:0] | RW | 分频系数：<br>0000：没有分频时钟 0001：2分频<br>0010：3分频 0011：4分频<br>0100：5分频 0101：6分频<br>0110：7分频 0111：8分频<br>1000：9分频 1001：10分频<br>1010：11分频 1011：12分频<br>1100：13分频 1101：14分频<br>1110：15分频 1111：16分频<br>注：建议分频系数大于5，且ADC的时钟频率建议低于<br>1/2系统时钟。 | 0011b |
|  |  |  | 1/2系统时钟。 |  |

#### 10.3.16 ADC看门狗1阈值寄存器（ADC_WDTR1）


<a id="pdf-page-99"></a>
<!-- PDF page 99 -->

偏移地址：0x54
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved HTR1
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved LTR1
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:28] | Reserved | RO | 保留。 | 0 |
| [27:16] | HTR1 | RW | 模拟看门狗高阈值设置值。 | 0xFFF |
| [15:12] | Reserved | RO | 保留。 | 0 |
| [11:0] | LTR1 | RW | 模拟看门狗低阈值设置值。 | 0x000 |

注：仅适用于看门狗通道1。
#### 10.3.17 ADC看门狗2阈值寄存器（ADC_WDTR2）

偏移地址：0x58
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved HTR2
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved LTR2
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:28] | Reserved | RO | 保留。 | 0 |
| [27:16] | HTR2 | RW | 模拟看门狗高阈值设置值。 | 0xFFF |
| [15:12] | Reserved | RO | 保留。 | 0 |
| [11:0] | LTR2 | RW | 模拟看门狗低阈值设置值。 | 0x000 |

注：仅适用于看门狗通道2。
#### 10.3.18 ADC看门狗3阈值寄存器（ADC_WDTR3）

偏移地址：0x5C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved HTR3
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved LTR3
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:16] | Reserved | RO | 保留。 | 0 |
| [27:16] | HTR3 | RW | 模拟看门狗高阈值设置值。 | 0xFFF |
| [15:12] | Reserved | RO | 保留。 | 0 |
| [11:0] | LTR3 | RW | 模拟看门狗低阈值设置值。 | 0x000 |

注：仅适用于看门狗通道3。

<a id="pdf-page-100"></a>
<!-- PDF page 100 -->

## 第11章 触摸按键检测（TKEY）

触摸检测控制（TKEY）单元，借助 ADC 模块的电压转换功能，通过将电容量转换为电压量进行
采样，实现触摸按键检测功能。检测通道复用 ADC 的 14 个外部通道，通过 ADC 模块的单次转换模式
实现触摸按键检测。
### 11.1 TKEY 功能描述

- TKEY 开启
TKEY 检测过程需要 ADC 模块配合进行，所以使用 TKEY 功能时，需要保证 ADC 模块处于上电状
态（ADON=1），然后将 ADC_CTLR1 寄存器的 TKENABLE 位置 1，打开 TKEY 单元功能。
TKEY 只支持单次单通道转换模式，将待转换的通道配置到 ADC 模块的规则组序列第一个，软件
启动转换（写 TKEY_ACT_DCG 寄存器）。
注：不进行TKEY转换时，仍然可以保留ADC通道配置转换功能。
**图 11-1 TKEY 工作时序图**

TKENABLE
TKCLK
Entire sampling period
TKACT
Firstconversion Next conversion
t
DISCHG
TKDISCHG
t
TKCHG CHG
t
STAB
ADCACT
ADC conversion period
ADCpowerup
EOC
Software clearinterrupt bit
- 可编程采样时间
TKEY 单元转换需要先使用若干个 ADCCLK 时钟周期（t）进行放电，然后再通过若干个
DISCHG
ADCCLK 周期（t）对通道进行充电进行电压采样，充电周期数为 TKEY_CHARGE1 和 TKEY_CHARGE2
CHG
寄存器中的 TKCGx[2:0]配置值加上 TKEY_CHGOFFSET 偏移量之和，每个通道可以分别用不同的充电
周期来调整采样电压。
### 11.2 TKEY 操作步骤

TKEY 检测属于 ADC 模块下的扩展功能，其工作原理是通过“触摸”和“非触摸”方式让硬件通
道感知的电容量发生变化，进而通过可设置的充放电周期数将电容量的变化转换为电压的变化，最
后通过 ADC 模块转换为数字值。
采样时，需要将 ADC 配置为单次单通道工作模式，由 TKEY_ACT 寄存器的“写操作”启动一次转
换，具体流程如下：
1） 初始化 ADC 功能，配置 ADC 模块为单次转换模块，置 ACON 位为 1，唤醒 ADC 模块。将 ADC_CTLR1
寄存器的 TKENABLE 位置 1，打开 TKEY 单元。
2） 设置要转换的通道，将通道号写入 ADC 规则组序列中第一个转换位置（ADC_RSQR3[4:0]），设
置 L[3:0]为 1。

<a id="pdf-page-101"></a>
<!-- PDF page 101 -->

3） 设置通道的充电采样时间，写 TKEY_CHARGEx 寄存器，可为每个通道配置不同的充电时间。
4） 写 TKEY_CHGOFFSET 寄存器，设置通道的充电时间偏移量（低八位有效），以调整充电时间。
5） 写 TKEY_ACT_DCG 寄存器，设置放电时间（低八位有效），并启动一次 TKEY 的采样和转换。
6） 等待 ADC 状态寄存器的 EOC 转换结束标志位置 1，读取 ADC_DR 寄存器得到此次转换值。
7） 如果需要进行下次转换，重复 2-6 步骤。如果不需修改通道充电采样时间，可省略步骤 3 或 4。
### 11.3 TKEY 寄存器描述

**表 11-1 TKEY1 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R32_TKEY1_CHARGE1 | 0x4001240C | TKEY充电采样时间寄存器1 | 0x00000000 |
| R32_TKEY1_CHARGE2 | 0x40012410 | TKEY充电采样时间寄存器2 | 0x00000000 |
| R32_TKEY1_CHGOFFSET | 0x4001243C | TKEY充电时间偏移量寄存器 | 0x00000000 |
| R32_TKEY1_ACT_DCG | 0x4001244C | TKEY启动和放电时间寄存器 | 0x00000000 |
| R32_TKEY1_DR | 0x4001244C | TKEY数据寄存器 | 0x00000000 |

#### 11.3.1 TKEYx充电采样时间寄存器1（TKEYx_CHARGE1）（x=1）

偏移地址：0x0C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved TKCG17[2:0] TKCG16[2:0] TKCG15[2:1]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
TKCG15 TKCG14[2:0] TKCG13[2:0] TKCG12[2:0] TKCG11[2:0] TKCG10[2:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:24] | Reserved | RO | 保留。 | 0 |
| [23:0] | TKCGx[2:0] | RW | TKCGx[2:0] （x=10-17）：选择通道x的充电<br>采样时间。<br>这些为用于独立地选择每个通道的充电时间。<br>000：4周期 100：5周期<br>001：6周期 101：7周期<br>010：8周期 110：9周期<br>011：10周期 111：11周期<br>时间基准：ADC时钟。 | 0 |

注：此寄存器映射ADC模块的采样时间寄存器1（ADC_SAMPTR1）。配置ADC功能时，为通道的采用
时间；配置TKEY功能时，为通道充电时间。
#### 11.3.2 TKEYx充电采样时间寄存器2（TKEYx_CHARGE2）（x=1）

偏移地址：0x10
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved TKCG9[2:0] TKCG8[2:0] TKCG7[2:0] TKCG6[2:0] TKCG5[2:1]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
TKCG5 TKCG4[2:0] TKCG3[2:0] TKCG2[2:0] TKCG1[2:0] TKCG0[2:0]

<a id="pdf-page-102"></a>
<!-- PDF page 102 -->

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:30] | Reserved | RO | 保留。 | 0 |
| [29:0] | TKCGx[2:0] | RW | TKCGx[2:0] （x=0-9）：选择通道x的充电采<br>样时间。<br>这些为用于独立地选择每个通道的充电时间。<br>000：4周期 100：5周期<br>001：6周期 101：7周期<br>010：8周期 110：9周期<br>011：10周期 111：11周期<br>时间基准：ADC时钟。 | 0 |

注：此寄存器映射ADC模块的采样时间寄存器2（ADC_SAMPTR2）。配置ADC功能时，为通道的采用
时间；配置TKEY功能时，为通道充电时间。
#### 11.3.3 TKEYx充电时间偏移量寄存器（TKEYx_CHGOFFSET）（x=1）

偏移地址：0x3C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved TKCGOFFSET[7:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:8] | Reserved | RO | 保留。 | 0 |
| [7:0] | TKCGOFFSET[7:0] | WO | TKEY充电时间偏移量配置值。<br>总充电时间 TCHG=TKCGOFFSET（单位：系统<br>时钟周期） | 0 |

注：此寄存器映射ADC模块的注入数据寄存器1（ADC_IDATAR1）。因此当该地址寄存器进行“写操
作”时，作为TKEY充电时间偏移量（TKEY_ CHGOFFSET）执行；进行“读操作”时，作为ADC模块
的注入数据寄存器1（ADC_IDATAR1）执行。
#### 11.3.4 TKEYx启动和放电时间寄存器（TKEYx_ACT_DCG）（x=1）

偏移地址：0x4C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved TKACT_DCG[7:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:8] | Reserved | RO | 保留。 | 0 |
| [7:0] | TKACT_DCG[7:0] | WO | 写放电时间并启动一次TKEY通道检测。 | 0 |

注：此寄存器映射ADC模块的规则数据寄存器（ADC_RDATAR）。
#### 11.3.5 TKEYx数据寄存器（TKEYx_DR）（x=1）

偏移地址：0x4C

<a id="pdf-page-103"></a>
<!-- PDF page 103 -->

31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
DATA[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:16] | Reserved | RO | 保留。 | 0 |
| [15:0] | DATA[15:0] | RO | 转换的数据。 | 0 |

注：此寄存器映射ADC模块的规则数据寄存器（ADC_RDATAR）。

<a id="pdf-page-104"></a>
<!-- PDF page 104 -->

## 第12章 高级定时器（ADTM）

高级定时器模块包含两个功能强大的 16 位自动重装定时器（TIM1/TIM2），可用于测量脉冲宽
度或产生脉冲、PWM 波等。用于电机控制、电源等领域。
### 12.1 主要特征

高级定时器（TIM1/TIM2）的主要特征包括：
- 16 位自动重装计数器，支持增计数模式，减计数模式和增减计数模式；
- 16 位预分频器，分频系数从 1～65536 之间动态可调；
- 支持四路独立的比较捕获通道；
- 每路比较捕获通道支持多种工作模式，比如：输入捕获，输出比较，PWM 生成和单脉冲输出；
- 支持可编程死区时间的互补输出；
- 支持外部信号控制定时器；
- 支持使用重复计数器在确定周期后更新定时器；
- 支持使用刹车信号将定时器复位或置其于确定状态；
- 支持在多种模式下使用 DMA；
- 支持增量式编码器；
- 支持定时器之间的级联和同步。
### 12.2 原理和结构

本节主要论述高级定时器的内部构造。
#### 12.2.1 概述

如图 12-1，高级定时器的结构大致可以分为三部分，即输入时钟部分，核心计数器部分和比较
捕获通道部分。
高级定时器的时钟可以来自于 HB 总线时钟（CK_INT），可以来自外部时钟输入引脚（TIMx_ETR），
亦可以来自于其他具有时钟输出功能的定时器（ITRx），还可以来自于比较捕获通道的输入端
（TIMx_CHx）。这些输入的时钟信号经过各种设定的滤波分频等操作后成为 CK_PSC 时钟，输出给核
心计数器部分。另外，这些复杂的时钟来源还可以作为 TRGO 输出给其他的定时器、ADC 等外设。
高级定时器的核心是一个 16 位计数器（CNT）。CK_PSC 经过预分频器（PSC）分频后，成为 CK_CNT
并输出给 CNT，CNT 支持增计数模式、减计数模式和增减计数模式，并有一个自动重装值寄存器
（ATRLR）在每个计数周期结束后为 CNT 重装载初始值。另外还有个辅助计数器在一旁计数 ATRLR
为 CNT 重装载初值的次数，当次数达到重复计数值寄存器（RPTCR）里设置的次数时，可以产生特定
事件。
高级定时器拥有四组比较捕获通道，每组比较捕获通道都可以从专属的引脚上输入脉冲，也可
以向引脚输出波形，即比较捕获通道支持输入和输出模式。比较捕获寄存器每个通道的输入都支持
滤波、分频和边沿检测等操作，并支持通道间的互触发，还能为核心计数器 CNT 提供时钟。每个比
较捕获通道都拥有一组比较捕获寄存器（CHxCVR），支持与主计数器（CNT）进行比较而输出脉冲。

<a id="pdf-page-105"></a>
<!-- PDF page 105 -->

**图 12-1 高级定时器的结构框图**

Internalclock(CK_INT)
CK_TIM18fromRCC
RTE_xMIT
Trigger
ETR Polarityselection, ETRF
controller
EdgedetectorandPrescaler
ETRP
TRGO Toothertimers
Inputfilter ToADC
ITR0
TGI
ITR1
ITR2 TRGI Slavemode
controller
ITR3
TIF_ED
Reset,
UI
Enable,
Up/Down,
Count REPRegister
TI1FP1 Encoder
interface 1HC_xMIT
TI2FP2 U
1CO
AutoReload N1HC_xMIT
U
Register
Repetitioncounter N1CO
CK_PSC CK_CNT
PSC CNT
(prescaler) (counter) DTG[7:0]registers 2HC_xMIT
1HC_xMIT
CC4I CC4I
TI1 TTII11FFPP11
IC1 IICC11PPSS 2CO
Inputfilter& Capture/Compare OC1REF
Prescaler
Edgedetector 1Register N2HC_xMIT
TI1FP2
CC3I U
TRC CC3I
2HC_xMIT
TI2FP1
TI2 Inputfilter& IC2 IC2PS Capture/Compare OC2REF
Prescaler
Edgedetector 2Register
TI2FP2
OC2N
TRC U
CC2I CC2I 3HC_xMIT
3HC_xMIT
TI3FP3 OC3
TI3 Inputfilter& IC3 IC3PS Capture/Compare OC3REF
Prescaler
Edgedetector 3Register
TI3FP4
TRC U N3CO
CC1I CC1I N3HC_xMIT
4HC_xMIT
TI4FP3 IC4PS
TI4 Inputfilter& IC4 Capture/Compare OC4REF
Prescaler
Edgedetector 4Register
TI4FP4
U
TRC
OC4
NIKB_xMIT
BRK BI 4HC_xMIT
Polarityselection
Clockfailureeventfromclockcontroller
CSS(ClockSecuritySystem)

<a id="pdf-page-106"></a>
<!-- PDF page 106 -->

#### 12.2.2 时钟输入

**图 12-2 高级定时器的 CK_PSC 来源框图**

TIMx_SMCR
TS[2:0]
ITRx
0xx
TI1_ED TI2F or
100 or
TI1FP1 TI1F or Encoder
101
TI2F_Rising mode
TI2 Edge 0 TI2FP2
Filter 110
detector 1
TI2F_Falling ETRF
111
TRGI External clock
ICF[3:0] CC2P mode 1
CK_PSC
TIMx_CCMR1 TIMx_CCER
ETRF External clock
mode 2
ETR
0
ETR pin Divider ETRP
/1,/2,/4,/8 Filter CK_INT Internal clock
1 f downcounter mode
DTS (internal clock)
ETP ETPS[1:0] ETF[3:0]
ECE SMS[2:0]
TIMx_SMCR TIMx_SMCR TIMx_SMCR TIMx_SMCR
高级定时器 CK_PSC 的时钟来源很多，可以分为 4 类：
1） 外部时钟引脚（ETR）输入时钟的路线：ETR→ETRP→ETRF；
2） 内部 HB 时钟输入路线：CK_INT；
3） 来自比较捕获通道引脚（TIMx_CHx）的路线：TIMx_CHx→TIx→TIxFPx，此路线也用于编码器模
式；
4） 来自内部其他定时器的输入：ITRx；
通过决定 CK_PSC 来源的 SMS 的输入脉冲选择可以将实际的操作分为 4 类：
1） 选择内部时钟源（CK_INT）；
2） 外部时钟源模式 1；
3） 外部时钟源模式 2；
4） 编码器模式；
上文提到的 4 种时钟源来源都可通过这 4 种操作选定。
##### 12.2.2.1 内部时钟源（CK_INT）

如果将 SMS 域保持 000b 时启动高级定时器，那么就是选定内部时钟源（CK_INT）为时钟。此时
CK_INT 就是 CK_PSC。
##### 12.2.2.2 外部时钟源模式1

如果将 SMS 域设置为 111b 时，就会启用外部时钟源模式 1。启用外部时钟源 1 时，TRGI 被选定
为 CK_PSC 的来源，值得注意的，还需要通过配置 TS 域来选择 TRGI 的来源。TS 域可选择以下几种
脉冲作为时钟来源：
1） 内部触发（ITRx，x 为 0,1,2,3）；
2） 比较捕获通道 1 经过边缘检测器后的信号（TI1F_ED）；
3） 比较捕获通道的信号 TI1FP1、TI2FP2；
4） 来自外部时钟引脚输入的信号 ETRF。
##### 12.2.2.3 外部时钟源模式2

使用外部触发模式 2 能在外部时钟引脚输入的每一个上升沿或下降沿计数。将 ECE 位置位时，
将使用外部时钟源模式 2。使用外部时钟源模式 2 时，ETRF 被选定为 CK_PSC。ETR 引脚经过可选的

<a id="pdf-page-107"></a>
<!-- PDF page 107 -->

反相器（ETP），分频器（ETPS）后成为 ETRP，再经过滤波器（ETF）后即成为 ETRF。
在 ECE 位置位且将 SMS 设为 111b 时，相当于 TS 选择 ETRF 为输入。
##### 12.2.2.4 编码器模式

将SMS置为001b，010b，011b将会启用编码器模式。启用编码器模式可以选择在TI1FP1和TI2FP2
中某一个特定的电平下以另一个跳变沿作为信号进行信号输出。此模式用于外接编码器使用的情况
下。具体功能参考 12.3.10 节。
#### 12.2.3 计数器和周边

CK_PSC 输入给预分频器（PSC）进行分频。PSC 是 16 位的，实际的分频系数相当于 R16_TIMx_PSC
的值+1。CK_PSC 经过 PSC 会成为 CK_INT。更改 R16_TIM1_PSC 的值并不会实时生效，而会在更新事
件后更新给 PSC。更新事件包括 UG 位清零和复位。定时器的核心是一个 16 位计数器（CNT），CK_CNT
最终会输入给 CNT，CNT 支持增计数模式、减计数模式和增减计数模式，并有一个自动重装值寄存器
（ATRLR）在每个计数周期结束后为 CNT 重新装载初始值。另外还有个辅助计数器在一旁记录 ATRLR
为 CNT 重新装载初值的次数，当达到重复计数值寄存器（RPTCR）里设置的次数时，可以产生特定事
件。
#### 12.2.4 比较捕获通道和周边

比较捕获通道是定时器实现复杂功能的主要组件，它的核心是比较捕获寄存器，辅以外围输入
部分的数字滤波，分频和通道间复用、输出部分的比较器和输出控制组成。

<a id="pdf-page-108"></a>
<!-- PDF page 108 -->

**图 12-3 比较捕获通道的结构框图**

TI1F_ED
Totheslavemodecontroller
TI1 TI1F_Rising
TI1F 0 TI1FP1
Filter Edge
f TI1F_Falling 01
DTS downcounter detector 1
TI2FP1 IC1 Divider
10
/1,/2,/4,/8
ICF[3:0] CC1P/CC1NP
TRC
TIMx_CCMR1 TIMx_CCER 11
(fromslavemode
TI2F_Rising controller)
0
(fromchannel2)
CC1S[1:0] ICPS[1:0] CC1E
TI2F_Falling
1
(fromchannel2) TIMx_CCMR1 TIMx_CCER
HB Bus
MCU-peripheralinterface
)tib-61
8 8
hgih wol Write CCR1H
S
Read CCR1H fi( write_in_progress
S
read_in_progress
Capture/comparepreloadregister Write CCR1L
Read CCR1L R
R
Output
CC1S[1]
capture_transfer compare_transfer mode
CC1S[0]
Input
CC1S[1]
mode OC1PE
CC1S[0] Capture/compareshadowregister OC1PE
UEV
TIM1_CCMR1
(fromtime
Capture Comparator
IC1PS baseunit)
CC1E
CC1G Counter
TIM1_EGR
To the master mode
controller
0 Output
ETRF OC1
enable
‘0’
x0 1 circuit
OC1REF OC1REFC
01
OC1_DT CC1P
> 11
CNT CCR1 Output
Output Dead-time TIM1_CCER
mode
CNT=CCR1 selector generator
controller OC1N_DT
11
10 0 Output
OCxREF(1) ‘0’ OC1N
0x enable
OC5REF 1 circuit
CC1NE CC1E TIM1_CCER
OC1CE OC1M[3:0] DTG[7:0] CC1NE CC1E CC1NP MOE OSSI OSSR
TIM1_CCMR1 TIM1_BDTR TIM1_CCER TIM1_CCER TIM1_BDTR
比较捕获通道的结构框图如图 12-3 所示。信号从通道 x 引脚输入进来后可选做为 TIx（TI1 的
来源可以不只是 CH1，见定时器的结构框图 12-1），TI1 经过滤波器（ICF[3:0]）生成 TI1F，再经
过边沿检测器分成 TI1F_Rising 和 TI1F_Falling，这两个信号经过选择（CC1P）生成 TI1FP1，TI1FP1
和来自通道 2 的 TI2FP1 一起送给 CC1S 选择成为 IC1，经过 ICPS 分频后送给比较捕获寄存器。
比较捕获寄存器由一个预装载寄存器和一个影子寄存器组成，读写过程仅操作预装载寄存器。
在捕获模式下，捕获发生在影子寄存器上，然后复制到预装载寄存器；在比较模式下，预装载寄存

<a id="pdf-page-109"></a>
<!-- PDF page 109 -->

器的内容被复制到影子寄存器中，然后影子寄存器的内容与核心计数器（CNT）进行比较。
### 12.3 功能和实现

高级定时器复杂功能的实现都是对定时器的比较捕获通道、时钟输入电路和计数器及周边部分
的操作实现的。定时器的时钟输入可以来自于包括比较捕获通道的输入在内的多个时钟源。对比较
捕获通道和时钟源选择的操作直接决定其功能。比较捕获通道是双向的，可以工作在输入和输出模
式。
#### 12.3.1 计数器模式

递增计数模式
在递增计数模式下，计数器从 0 计数到自动重载值（R16_TIMx_ATRLR 寄存器的内容），然后重
新从 0 开始计数并生成计数器上溢事件。
如果使用重复计数器，则当递增计数的重复次数达到重复计数器寄存器中编程的次数加一次
(R16_TIMx_RPTCR+1)后，将生成更新事件(UEV)。否则，将在每次计数器上溢时产生更新事件。
将 TIMx_SWEVGR 寄存器的 UG 位置 1（通过软件或使用从模式控制器）时，也将产生更新事件。
通过软件将 R16_TIMx_CTLR1 寄存器中的 UDIS 位置 1 可禁止 UEV 事件。这可避免向预装载寄存
器写入新值时更新影子寄存器。在 UDIS 位写入 0 之前不会产生任何更新事件。不过，计数器和预
分频器计数器都会重新从 0 开始计数（而预分频比保持不变）。此外，如果 R16_TIMx_CTLR1 寄存器
中的 URS 位（更新请求选择）已置 1，则将 UG 位置 1 会生成更新事件 UEV，但不会将 UIF 标志置 1
（因此，不会发送任何中断或 DMA 请求）。这样一来，如果在发生捕获事件时将计数器清零，将不
会同时产生更新中断和捕获中断。
发生更新事件时，将更新所有寄存器且将更新标志（R16_TIMx_INTFR 寄存器中的 UIF 位）置 1
（取决于 URS 位）：
1) 重复计数器中将重新装载 R16_TIMx_RPTCR 寄存器的内容
2) 自动重载影子寄存器将以预装载值(R16_TIMx_ATRLR)进行更新
3) 预分频器的缓冲区中将重新装载预装载值（R16_TIMx_PSC 寄存器的内容）
递减计数模式
在递减计数模式下，计数器从自动重载值（R16_TIMx_ATRLR 寄存器的内容）开始递减计数到 0，
然后重新从自动重载值开始计数并生成计数器下溢事件。
如果使用重复计数器，则当递减计数的重复次数达到重复计数器寄存器中编程的次数加一次
(R16_TIMx_RPTCR+1)后，将生成更新事件(UEV)。否则，将在每次计数器下溢时产生更新事件。
将 R16_TIMx_EGR 寄存器的 UG 位置 1（通过软件或使用从模式控制器）时，也将产生更新事件。
通过软件将 R16_TIMx_CTLR1 寄存器中的 UDIS 位置 1 可禁止 UEV 更新事件。这可避免向预装载
寄存器写入新值时更新影子寄存器。在 UDIS 位写入 0 之前不会产生任何更新事件。不过，计数器会
重新从当前自动重载值开始计数，而预分频器计数器则重新从 0 开始计数（但预分频比保持不变）。
此外，如果 R16_TIMx_CTLR1 寄存器中的 URS 位（更新请求选择）已置 1，则将 UG 位置 1 会生
成更新事件 UEV，但不会将 UIF 标志置 1（因此，不会发送任何中断或 DMA 请求）。这样一来，如果
在发生捕获事件时将计数器清零，将不会同时产生更新中断和捕获中断。
发生更新事件时，将更新所有寄存器且将更新标志（R16_TIMx_INTFR 寄存器中的 UIF 位）置 1
（取决于 URS 位）：
1) 重复计数器中将重新装载 R16_TIMx_RPTCR 寄存器的内容
2) 预分频器的缓冲区中将重新装载预装载值（R16_TIMx_PSC 寄存器的内容）
3) 自动重载活动寄存器将以预装载值（R16_TIMx_ATRLR 寄存器的内容）进行更新。
注：自动重载寄存器会在计数器重载之前得到更新，因此，下一个计数周期就是我们所希望的

<a id="pdf-page-110"></a>
<!-- PDF page 110 -->

新的周期长度。
中心对齐模式（递增/递减计数）
在中心对齐模式下，计数器从 0 开始计数到自动重载值（R16_TIMx_ATRLR 寄存器的内容）-1，
生成计数器上溢事件；然后从自动重载值开始向下计数到 1 并生成计数器下溢事件。之后从 0 开始
重新计数。
当 R16_TIMx_CTLR1 寄存器中的 CMS 位不为“00”时，中心对齐模式有效。将通道配置为输出模
式时，其输出比较中断标志将在以下模式下置 1，即：计数器递减计数（中心对齐模式 1，CMS=“01”）、
计数器递增计数（中心对齐模式 2，CMS=“10”）以及计数器递增/递减计数（中心对齐模式 3，
CMS=“11”）。
在此模式下，R16_TIMx_CTLR1 寄存器的 DIR 方向位不可写入值，而是由硬件更新并指示当前计
数器方向。
每次发生计数器上溢和下溢时都会生成更新事件，或将 R16_TIMx_SWEVGR 寄存器中的 UG 位置 1
（通过软件或使用从模式控制器）也可以生成更新事件。这种情况下，计数器以及预分频器计数器
将重新从 0 开始计数。
通过软件将 R16_TIMx_CTLR1 寄存器中的 UDIS 位置 1 可禁止 UEV 更新事件。这可避免向预装载
寄存器写入新值时更新影子寄存器。在 UDIS 位写入 0 之前不会产生任何更新事件。不过，计数器仍
会根据当前自动重载值进行递增和递减计数。
此外，如果 R16_TIMx_CTLR1 寄存器中的 URS 位（更新请求选择）已置 1，则将 UG 位置 1 会生
成 UEV 更新事件，但不会将 UIF 标志置 1（因此，不会发送任何中断或 DMA 请求）。这样一来，如
果在发生捕获事件时将计数器清零，将不会同时产生更新中断和捕获中断。
发生更新事件时，将更新所有寄存器且将更新标志（R16_TIMx_INTFR 寄存器中的 UIF 位）置 1
（取决于 URS 位）：
1) 重复计数器中将重新装载 R16_TIMx_RPTCR 寄存器的内容
2) 预分频器的缓冲区中将重新装载预装载值（R16_TIMx_PSC 寄存器的内容）
3) 自动重载活动寄存器将以预装载值（R16_TIMx_ATRLR 寄存器的内容）进行更新。注意，如
果更新操作是由计数器上溢触发的，则自动重载寄存器在重载计数器之前更新，因此，下
一个计数周期就是我们所希望的新的周期长度（计数器被重载新的值）。
#### 12.3.2 输入捕获模式

输入捕获模式是定时器的基本功能之一。输入捕获模式的原理是，当检测到 ICxPS 信号上确定
的边沿后，则发生捕获事件，计数器当前的值会被锁存到比较捕获寄存器（R16_TIMx_CHCTLRx）中。
发生捕获事件时，CCxIF（在 R16_TIMx_INTFR 中）被置位，如果使能了中断或 DMA，还会产生相应
中断或 DMA。如果发生捕获事件时，CCxIF 已经被置位了，那么 CCxOF 位会被置位。CCxIF 可由软件
清除，也可以通过读取比较捕获寄存器由硬件清除。CCxOF 由软件清除。
举个通道 1 的例子来说明使用输入捕获模式的步骤，如下：
1） 配置 CCxS 域，选择 ICx 信号的来源。比如设为 10b，选择 TI1FP1 作为 IC1 的来源，而不
可以使用默认设置，CCxS 域默认是使比较捕获模块作为输出通道；
2） 配置 ICxF 域，设定 TI 信号的数字滤波器。数字滤波器会以确定的频率，采样确定的次数，
再输出一个跳变。这个采样频率和次数是通过 ICxF 来确定的；
3） 配置 CCxP 位，设定 TIxFPx 的极性。比如保持 CC1P 位为低，选择上升沿跳变；
4） 配置 ICxPS 域，设定 ICx 信号成为 ICxPS 之间的分频系数。比如保持 ICxPS 为 00b，不分
频；
5） 配置 CCxE 位，允许捕获核心计数器（CNT）的值到比较捕获寄存器中。置 CC1E 位；
6） 根据需要配置 CCxIE 和 CCxDE 位，决定是否允许使能中断或 DMA。
至此已经将比较捕获通道配置完成。

<a id="pdf-page-111"></a>
<!-- PDF page 111 -->

当 TI1 输入了一个被捕获的脉冲时，核心计数器（CNT）的值会被记录到比较捕获寄存器中，CC1IF
被置位，当 CC1IF 在之前就已经被置位时，CCIOF 位也会被置位。如果 CC1IE 位，那么会产生一个
中断；如果 CC1DE 被置位，会产生一个 DMA 请求。可以通过写事件产生寄存器（TIMx_SWEVGR）的方
式由软件产生一个输入捕获事件。
#### 12.3.3 比较输出模式

比较输出模式是定时器的基本功能之一。比较输出模式的原理是在核心计数器（CNT）的值与比
较捕获寄存器的值一致时，输出特定的变化或波形。OCxM 域（在 R16_TIMx_CHCTLRx 中）和 CCxP 位
（在 R16_TIMx_CCER 中）决定输出的是确定的高低电平还是电平翻转。产生比较一致事件时还会置
CCxIF 位，如果预先置了 CCxIE 位，则会产生一个中断；如果预先设置了 CCxDE 位，则会产生一个
DMA 请求。
配置为比较输出模式的步骤为下：
1） 配置核心计数器（CNT）的时钟源和自动重装值；
2） 设置需要对比的计数值到比较捕获寄存器（R16_TIMx_CHxCVR）中；
3） 如果需要产生中断，置 CCxIE 位；
4） 保持 OCxPE 为 0，禁用比较寄存器的预装载寄存器；
5） 设定输出模式，设置 OCxM 域和 CCxP 位；
6） 使能输出，置 CCxE 位；
7） 置 CEN 位启动定时器。
#### 12.3.4 强制输出模式

定时器的比较捕获通道的输出模式可以由软件强制输出确定的电平，而不依赖比较捕获寄存器
的影子寄存器和核心计数器的比较。
具体的做法是将 OCxM 置为 100b，即为强制将 OCxREF 置为低；或者将 OCxM 置为 101b，即为强
制将 OCxREF 置为高。
需要注意的是，将 OCxM 强制置为 100b 或者 101b，内部核心计数器和比较捕获寄存器的比较过
程还在进行，相应的标志位还在置位，中断和 DMA 请求还在产生。
#### 12.3.5 PWM输入模式

PWM 输入模式是用来测量 PWM 的占空比和频率的，是输入捕获模式的一种特殊情况。除下列区
别外，操作和输入捕获模式相同：PWM 占用两个比较捕获通道，且两个通道的输入极性设为相反，
其中一个信号被设为触发输入，SMS 设为复位模式。
例如，测量从 TI1 输入的 PWM 波的周期和频率，需要进行以下操作：
1） 将 TI1(TI1FP1)设为 IC1 信号的输入。将 CC1S 置为 01b；
2） 将 TI1FP1 置为上升沿有效。将 CC1P 保持为 0；
3） 将 TI1(TI1FP2)置为 IC2 信号的输入。将 CC2S 置为 10b；
4） 选 TI1FP2 置为下降沿有效。将 CC2P 置为 1；
5） 时钟源的来源选择 TI1FP1。将 TS 设为 101b；
6） 将 SMS 设为复位模式，即 100b；
7） 使能输入捕获。CC1E 和 CC2E 置位；
这样比较捕获寄存器 1 的值就是 PWM 的周期，而比较捕获寄存器 2 的值就是其占空比。
注：因只有TI1FP1和TI2FP2连到了从模式控制器，所以PWM输入模式只能使用TIMx_CH1/TIMx_CH2。
#### 12.3.6 PWM输出模式

PWM 输出模式是定时器的基本功能之一。PWM 输出模式最常见的是使用重装值确定 PWM 频率，使
用捕获比较寄存器确定占空比的方法。将 OCxM 域中置 110b 或 111b 使用 PWM 模式 1 或模式 2，置 OCxPE

<a id="pdf-page-112"></a>
<!-- PDF page 112 -->

位使能预装载寄存器，最后置 ARPE 位使能预装载寄存器的自动重装载。由于在发生一个更新事件时，
预装载寄存器的值才能被送到影子寄存器，所以在核心计数器开始计数之前，需要置 UG 位来初始化
所有寄存器。在 PWM 模式下，核心计数器和比较捕获寄存器一直在进行比较，根据 CMS 位，定时器
能够输出边沿对齐或中央对齐的 PWM 信号。
- 边沿对齐
使用边沿对齐时，核心计数器增计数或减计数，在 PWM 模式 1 的情景下，在核心计数器的值大
于比较捕获寄存器时，OCxREF 为高；当核心计数器的值小于比较捕获寄存器时（比如核心计数器增
长到 R16_TIMx_ATRLR 的值而恢复成全 0 时），OCxREF 为低。
- 中央对齐
使用中央对齐模式时，核心计数器运行在增计数和减计数交替进行的模式下，OCxREF 在核心计
数器和比较捕获寄存器的值一致时进行上升和下降的跳变。但比较标志在三种中央对齐模式下，置
位的时机有所不同。在使用中央对齐模式时，最好在启动核心计数器之前产生一个软件更新标志（置
UG 位）。
#### 12.3.7 互补输出和死区

比较捕获通道一般有两个输出引脚（比较捕获通道 4 只有一个输出引脚），能输出两个互补的
信号（OCx 和 OCxN），OCx 和 OCxN 可以通过 CCxP 和 CCxNP 位独立地设置极性，通过 CCxE 和 CCxNE
独立地设置输出使能，通过 MOE、OIS、OISN、OSSI、OSSR 位进行死区和其他的控制。同时使能 OCx
和 OCxN 输出将插入死区，每个通道都有一个 10 位的死区发生器。如果存在刹车电路则还要设置 MOE
位。OCx 和 OCxN 由 OCxREF 关联产生，如果 OCx 和 OCxN 都是高有效，那么 OCx 与 OCxREF 相同，只
是 OCx 的上升沿相当于 OCxREF 有一个延迟，OCxN 与 OCxREF 相反，它的上升沿相对参考信号的下降
沿会有一个延迟，如果延迟大于有效输出宽度，则不会产生相应的脉冲。
如图 12-4 展示了 OCx 和 OCxN 与 OCxREF 的关系，并展示出死区。
**图 12-4 互补输出和死区**

#### 12.3.8 刹车信号

当产生刹车信号时，输出使能信号和无效电平都会根据 MOE、OIS、OISN、OSSI 和 OSSR 等位进
行修改。但 OCx 和 OCxN 不会在任何时间都处在有效电平。刹车事件源可以来自于刹车输入引脚，也
可以是一个时钟失败事件，而时钟失败事件由 CSS（时钟安全系统）产生。
在系统复位后，刹车功能被默认禁止（MOE 位为低），置 BKE 位可以使能刹车功能，输入的刹
车信号的极性可以通过设置 BKP 设置，BKE 和 BKP 信号可以被同时写入，在真正写入之前会有一个
HB 时钟的延迟，因此需要等一个 HB 周期才能正确读出写入值。
在刹车引脚出现选定的电平系统将产生如下动作：
1） MOE 位被异步清零，根据 SOOI 位的设置将输出置为无效状态、空闲状态或复位状态；
2） 在 MOE 被清零后，每一个输出通道输出由 OSIx 确定的电平；
3） 当使用互补输出时：输出被置于无效状态，具体取决于极性；
4） 如果 BIE 被置位，当 BIF 置位，会产生一个中断；如果设置了 BDE 位，则会产生一个 DMA
请求；
5） 如果 AOE 被置位，在下一个更新事件 UEV 时，MOE 位被自动置位。

<a id="pdf-page-113"></a>
<!-- PDF page 113 -->

#### 12.3.9 单脉冲模式

单脉冲模式可以用于让微控制器响应一个特定的事件，使之在一个延迟之后产生一个脉冲，延
迟和脉冲的宽度可编程。置 OPM 位可以使核心计数器在产生下一个更新事件 UEV 时（计数器翻转到
0）停止。
如图 12-5，需要在 TI2 输入引脚上检测到一个上升沿开始，延迟 Tdelay 之后，在 OC1 上产生
一个长度为 Tpulse 的正脉冲：
**图 12-5 单脉冲的产生**

TI2
OC1REF
OC1
ATRLR
CHxCVR
0 t
t t
DELAY PULSE
1） 设定 TI2 为触发。置 CC2S 域为 01b，把 TI2FP2 映射到 TI2；置 CC2P 位为 0b，TI2FP2 设为
上升沿检测；置 TS 域为 110b，TI2FP2 设为触发源；置 SMS 域为 110b，TI2FP2 被用来启动
计数器；
2） Tdelay 由比较捕获寄存器的的值确定，Tpulse 由自动重装值寄存器的值和比较捕获寄存器
的值确定。
#### 12.3.10 编码器模式

编码器模式是定时器的一个典型应用，可以用来接入编码器的双相输出，核心计数器的计数方
向和编码器的转轴方向同步，编码器每输出一个脉冲就会使核心计数器加一或减一。使用编码器的
步骤为：将 SMS 域置为 001b（只在 TI2 边沿计数）、010b（只在 TI1 边沿计数）或 011b（在 TI1
和 TI2 双边沿计数），将编码器接到比较捕获通道 1、2 的输入端，给重装值寄存器设一个值，这个
值可以设的大一点。在编码器模式时，定时器内部的比较捕获寄存器，预分频器，重复计数寄存器
等都正常工作。下表表明了计数方向和编码器信号的关系。
**表 12-1 定时器编码器模式的计数方向和编码器信号之间的关系**

相对信号 TI1FP1 信号边沿 TI2FP2 信号
计数有效边沿
的电平上升沿下降沿上升沿下降沿
高向下计数向上计数
仅在 TI1 边沿计数不计数
低向上计数向下计数
高向上计数向下计数
仅在 TI2 边沿计数不计数
低向下计数向上计数
高向下计数向上计数向上计数向下计数
在 TI1 和 TI2 双边沿计数
低向上计数向下计数向下计数向上计数

<a id="pdf-page-114"></a>
<!-- PDF page 114 -->

#### 12.3.11 TIMx定时器和外部触发的同步

定时器能够在复位模式、门控模式和触发模式下和一个外部触发同步。
从模式：复位模式
计数器及其预分频器可以响应触发输入事件而被重新初始化；如果 R16_TIMx_CTLR1 寄存器的
URS 位为低，则产生一个更新事件 UEV；然后更新所有的预装载寄存器(R16_TIMx_ATRLR，
R16_TIMx_CHxCVR)。
以下示例中，当 TI1 输入出现上升沿，向上计数器清零：
1) 配置通道 1 以检测 TI1 的上升沿。配置输入滤波器带宽(本例不需要任何滤波器，因此保持
IC1F=0000)。无需配置捕获分频器，因为其不用于触发操作。CC1S 位只选择输入捕获源，
即 CC1S=01（在 R16_TIMx_CCMR1 中）。将 CC1P=0 和 CC1NP='0'写入 R16_TIMx_CCER 寄存器
以验证极性(只检测上升沿)。
2) 将 SMS=100 写入 R16_TIMx_SMCFGR， 配置定时器为复位模式； 将 TS=101 写入
R16_TIMx_SMCFGR，选择 TI1 作为输入源。
3) 将 CEN=1 写入 R16_TIMx_CTLR1，启动计数器。
计数器使用内部时钟计数，然后正常运转，当出现一个 TI1 上升沿，计数器清零并从 0 开始重
新计数。同时，触发标志 TIF 位置 1，使能中断或 DMA 后，可以发送中断或 DMA 请求。（取决于
R16_TIMx_DMAINTENR 寄存器中 TIE(中断使能)位和 TDE(DMA 使能)位）。
下图显示当自动重装载寄存器 R16_TIMx_ARR=0x36 时的动作。TI1 上升沿与实际计数器复位之
间的延时是 TI1 输入端的重新同步电路造成的。
**图 12-6 复位模式下的控制电路**

TI1
UG
计数器时钟=ck_cnt=ck_psc
计数器寄存器 30 31 32 33 34 35 36 00 01 02 03 00 01 02 03
TIF
从模式：门控模式
输入信号的电平使能计数器。以下的例子中，仅 TI1 为低时计数器向上计数：
1) 配置通道 1 以检测 TI1 上的低电平。配置输入滤波器带宽(本例不需要任何滤波器，因此保
持 IC1F=0000)。无需配置捕获分频器，因为其不用于触发操作。CC1S 位只选择输入捕获源，
即 CC1S=01（在 R16_TIMx_CCMR1 中）。将 CC1P=1 和 CC1NP='0'写入 R16_TIMx_CCER 寄存器
以验证极性(只检测低电平)。
2) 将 SMS=101 写入 R16_TIMx_SMCFGR， 配置定时器为门控模式； 将 TS=101 写入
R16_TIMx_SMCFGR，选择 TI1 作为输入源。
3) 将 CEN=1 写入 R16_TIMx_CTLR1，启动计数器。门控模式下，如果 CEN=0，无论触发输入电
平如何，计数器都不会启动。
只要 TI1 为低，计数器开始依据内部时钟计数，TI1 变高时停止计数。当计数器开始或停止时
都将 R16_TIMx_INTFR 中的 TIF 位置 1。TI1 上升沿与实际计数器复位之间的延时是 TI1 输入端的重
新同步电路造成的。

<a id="pdf-page-115"></a>
<!-- PDF page 115 -->

**图 12-7 门控模式下的控制电路**

TI1
cnt_en
计数器时钟=ck_cnt=ck_psc
计数器寄存器 30 31 32 33 35 36 37 38
TIF
写入TIF=0
从模式：触发模式
选择的输入端上发生事件时将使能计数器。以下示例中，当 TI2 输入出现上升沿，向上计数器
启动：
1) 配置通道 2 以检测 TI2 的上升沿。配置输入滤波器带宽(本例不需要任何滤波器，因此保持
IC2F=0000)。无需配置捕获分频器，因为其不用于触发操作。CC2S 位只选择输入捕获源，置
CC2S=01（在 R16_TIMx_CCMR1 中）。将 CC2P=1 和 CC2NP=‘0’写入 R16_TIMx_CCER 寄存器以
验证极性（只检测低电平）
2) 将 SMS=110 写入 R16_TIMx_SMCFGR 寄存器，配置定时器为触发模式；将 TS=110 写入
R16_TIMx_SMCFGR 寄存器，选择 TI2 作为输入源。
当 TI2 出现上升沿，计数器开始在内部时钟驱动下计数，同时 TIF 置 1。
TI2 上升沿和实际计数器启动之间的延时，是由 TI2 输入端的重同步电路造成。
**图 12-8 触发模式下的控制电路**

TI2
cnt_en
计数器时钟=ck_cnt=ck_psc
计数器寄存器 34 35 36 37 38
TIF
从模式：外部时钟模式 2＋触发模式
外部时钟模式 2 可结合除外部时钟模式 1 和编码器模式以外的另一种从模式一起使用。此时，
ETR 信号用作外部时钟的输入，在复位模式、门控模式或触发模式下，另一个输入可作为触发输入。
不建议通过 R16_TIMx_SMCFGR 寄存器的 TS 位来选择 ETR 作为 TRGI。以下示例中，一旦在 TI1 上出
现一个上升沿，向上计数器即在 ETR 的每一个上升沿递增：
1) 配置 R16_TIMx_SMCFGR 寄存器以配置外部触发输入电路：
─ETF=0000：没有滤波；
─ETPS=00：不用预分频器；
─ETP=0：检测 ETR 的上升沿，置 ECE=1 使能外部时钟模式 2。
2) 配置通道 1 以检测 TI 的上升沿：
─IC1F=0000：没有滤波；
─无需配置捕获分频器，因为其不用于触发操作；
─置 R16_TIMx_CHCTLR1 寄存器中 CC1S=01，选择输入捕获源；

<a id="pdf-page-116"></a>
<!-- PDF page 116 -->

─置 R16_TIMx_CCER 寄存器中 CC1P=0 以确定极性(只检测上升沿)。
3) 将 SMS=110 写入 R16_TIMx_SMCFGR 寄存器，配置定时器为触发模式。将 TS=101 写入
R16_TIMx_SMCFGR 寄存器，选择 TI1 作为输入源。
当 TI1 出现上升沿，使能计数器，TIF 置 1，计数器开始在 ETR 的上升沿计数。ETR 信号的
上升沿和实际计数器复位间的延时，由 ETRP 输入端的重同步电路造成。
**图 12-9 外部时钟模式 2+触发模式下的控制电路**

TI1
CEN/CNT_EN
ETR
计数器时钟=CK_CNT=CK_PSC
计数器寄存器 34 35 36
TIF
#### 12.3.12 定时器同步模式

TIMx 定时器从内部连接在一起，以实现定时器同步或级联。当某个定时器配置为主模式时，可
对另一个配置为从模式的定时器的计数器执行复位、启动、停止操作或为其提供时钟。
将一个定时器用作另一个定时器的预分频器
**图 12-10 主/从定时器示例**

TIM1 TIM2
时钟 MMS TS SMS
UEV
CK_PSC
TRGO1 ITRO
主模式从模式
控制控制
预分频器计数器预分频器计数器
输入触发
选择
例如，可以将定时器 1 配置为定时器 2 的预分频器。为此：
1) 将定时器 1 配置为主模式，每次发生更新事件 UEV 时都输出一个周期性触发信号。如果将
MMS=010 写入 R16_TIM1_CTLR2，则每当生成更新事件，TRGO1 都会输出一个上升沿。
2) 要将定时器 1 的 TRGO1 输出连接到定时器 2，必须将定时器 2 配置为从模式，使用 ITR0 作
为内部触发。通过 R16_TIM2_SMCFGR 寄存器中的 TS 位（写入 TS=000）可对此进行选择。
3) 然后将从模式控制器设为外部时钟模式 1（在 R16_TIM2_SMCFGR 寄存器中写入 SMS=111）。
这样一来，定时器 2 的时钟将由定时器 1 周期性触发信号的上升沿（与定时器 1 的计数器
上溢对应）提供。
4) 最后必须通过将这两个定时器的相应 CEN 位（R16_TIMx_CTLR1 寄存器）置 1 同时使能二者。
注意：如果选择定时器1的OCx信号作为触发输出(MMS=1xx)，该信号的上升沿将用于驱动定时器2
的计数器。
使用一个定时器使能另一个定时器
本例中通过定时器 1 的输出比较 1 来使能定时器 2。仅当定时器 1 的 OC1REF 为高电平时，定时

<a id="pdf-page-117"></a>
<!-- PDF page 117 -->

器 2 才根据分频后的内部时钟进行计数。两个计数器的时钟频率都基于 CK_INT 通过预分频器执行 3
分频(fCK_CNT=fCK_INT/3)。
1) 将定时器 1 配置为主模式，发送其输出比较 1 参考信号(OC1REF)作为触发输出
（R16_TIM1_CR2 寄存器中的 MMS=100）。
2) 配置定时器 1 的 OC1REF 波形（R16_TIM1_CCMR1 寄存器）。
3) 配置定时器 2 以接收来自定时器 1 的输入触发（R16_TIM2_SMCFGR 寄存器中的 TS=000）。
4) 将定时器 2 配置为门控模式（R16_TIM2_SMCFGR 寄存器中的 SMS=101）。
5) 通过向 CEN 位（R16_TIM2_CTLR1 寄存器）写入“1”使能定时器 2。
6) 通过向 CEN 位（R16_TIM1_CTLR1 寄存器）写入“1”启动定时器 1。
注：计数器2的时钟与计数器1不同步，此模式仅影响定时器2的计数器使能信号。
**图 12-11 使用定时器 1 的 OC1REF 对定时器 2 实施门控控制**

CK_INT
TIMER1-OC1REF
TIMER1-CNT FC FD FE FF 00 01
TIMER2-CNT 3045 3046 3047 3048
TIMER2-TIF
写入TIF=0
定时器 2 的计数器和预分频器在启动前未进行初始化。因此从各自的当前值开始计数。启动定
时器 1 之前，通过复位这两个定时器可以从指定值开始计数。这样便可以在定时器计数器中写入所
需的任意值。两个定时器都可通过软件使用 R16_TIMx_SWEVGR 寄存器中的 UG 位轻松复位。
在下一示例中，定时器 1 与定时器 2 同步。定时器 1 为主模式，从 0 开始计数。定时器 2 为从
模式，从 0xE7 开始计数。两个定时器的预分频比相同。在 R16_TIM1_CTLR1 寄存器中通过向 CEN 位
写入“0”来禁止定时器 1 时，定时器 2 将停止：
1) 将定时器 1 配置为主模式，发送其输出比较 1 参考信号(OC1REF)作为触发输出
（R16_TIM1_CTLR2 寄存器中的 MMS=100）。
2) 配置定时器 1 的 OC1REF 波形（R16_TIM1_CHCTLR1 寄存器）。
3) 配置定时器 2 以接收来自定时器 1 的输入触发（R16_TIM2_SMCFGR 寄存器中的 TS=000）。
4) 将定时器 2 配置为门控模式（R16_TIM2_SMCFGR 寄存器中的 SMS=101）。
5) 通过向 UG 位（R16_TIM1_SWEVGR 寄存器）写入“1”复位定时器 1。
6) 通过向 UG 位（R16_TIM2_SWEVGR 寄存器）写入“1”复位定时器 2。
7) 通过在定时器 2 的计数器(R16_TIM2_CNTL)中写入“0xE7”使定时器 2 初始化为 0xE7。
8) 通过向 CEN 位（R16_TIM2_CTLR1 寄存器）写入“1”使能定时器 2。
9) 通过向 CEN 位（R16_TIM1_CTLR1 寄存器）写入“1”启动定时器 1。
10) 通过向 CEN 位（R16_TIM1_CTLR1 寄存器）写入“0”停止定时器 1。

<a id="pdf-page-118"></a>
<!-- PDF page 118 -->

**图 12-12 使用定时器 1 的使能信号对定时器 2 实施门控控制**

CK_INT
TIMER1-CEN=CNT_EN
TIMER1-CNT_INIT
TIMER1-CNT 75 00 01 02
TIMER2-CNT AB 00 E7 E8 E9
TIMER2-CNT_INIT
TIMER2
写CNT
TIMER2-TIF
写入TIF=0
使用一个定时器启动另一个定时器
本例中使用定时器 1 的更新事件使能定时器 2。只要定时器 1 生成更新事件，定时器 2 便根据
分频后的内部时钟从当前值（可以不为 0）开始计数。定时器 2 收到触发信号时，其 CEN 位自动置 1，
并且计数器开始计数，直到向 R16_TIM2_CTLR1 寄存器的 CEN 位写入“0”后停止计数。两个计数器
的时钟频率都基于 CK_INT 通过预分频器执行 3 分频(fCK_CNT=fCK_INT/3)。
1) 将定时器 1 配置为主模式，发送其更新事件(UEV)作为触发输出（R16_TIM1_CTLR2 寄存器
中的 MMS=010）。
2) 配置定时器 1 的周期（R16_TIM1_ATRLR 寄存器）。
3) 配置定时器 2 以接收来自定时器 1 的输入触发（R16_TIM2_SMCFGR 寄存器中的 TS=000）。
4) 将定时器 2 配置为触发模式（R16_TIM2_SMCFGR 寄存器中的 SMS=110）。
5) 通过向 CEN 位（R16_TIM1_CTLR1 寄存器）写入“1”启动定时器 1。
**图 12-13 使用定时器 1 的更新事件触发定时器 2**

CK_INT
TIMER1-UEV
TIMER1-CNT FD FE FF 00 01 02
TIMER2-CNT 45 46 47 48
TIMER2-CEN=CNT_EN
TIMER2-TIF
写入TIF=0
如上述示例所示，用户可以在开始计数之前初始化两个计数器。图 12-14 显示了与图 12-13 具
有相同配置，只不过处于触发模式（R16_TIM2_SMCFGR 寄存器中的 SMS=110）而非门控模式的计数行
为。

<a id="pdf-page-119"></a>
<!-- PDF page 119 -->

**图 12-14 使用定时器 1 的使能信号触发定时器 2**

CK_INT
TIMER1-CEN=CNT_EN
TIMER1-CNT_INIT
TIMER1-CNT 75 00 01 02
TIMER2-CNT CD 00 E7 E8 E9 EA
TIMER2-CNT_INIT
TIMER2
写CNT
TIMER2-TIF
写入TIF=0
将一个定时器用作另一个定时器的预分频器
例如，可以将定时器 1 配置为定时器 2 的预分频器。为此：
1) 将定时器 1 配置为主模式，发送其更新事件(UEV)作为触发输出（R16_TIM1_CTLR2 寄存器
中的 MMS=010）。这样便会在计数器每次发生上溢时输出一个周期性信号。
2) 配置定时器 1 的周期（R16_TIM1_ATRLR 寄存器）。
3) 配置定时器 2 以接收来自定时器 1 的输入触发（R16_TIM2_SMCFGR 寄存器中的 TS=000）。
4) 将定时器 2 配置为外部时钟模式（R16_TIM2_SMCFGR 寄存器中的 SMS=111）。
5) 通过向 CEN 位（R16_TIM2_CTLR1 寄存器）写入“1”启动定时器 2。
6) 通过向 CEN 位（R16_TIM1_CTLR1 寄存器）写入“1”启动定时器 1。
使用一个外部触发同步的启动 2 个定时器
本例中，定时器 1 的 TI1 输入出现上升沿时使能定时器 1，使能定时器 1 的同时使能定时器 2。
要确保两个计数器对齐，定时器 1 必须配置为主/从模式（对应的 TI1 为从，对应定时器 2 为主）：
1) 将定时器 1 配置为主模式，发送其使能信号作为触发输出（R16_TIM1_CTLR2 寄存器中的
MMS=001）。
2) 将定时器 1 配置为从模式以接收来自 TI1 的输入触发（R16_TIM1_SMCFGR 寄存器中的
TS=100）。
3) 将定时器 1 配置为触发模式（R16_TIM1_SMCFGR 寄存器中的 SMS=110）。
4) 通过写入 MSM=1（R16_TIMx_SMCR 寄存器）将定时器 1 配置为主/从模式。
5) 配置定时器 2 以接收来自定时器 1 的输入触发（R16_TIM2_SMCFGR 寄存器中的 TS=000）。
6) 将定时器 2 配置为触发模式（R16_TIM2_SMCFGR 寄存器中的 SMS=110）。
当 TI1（定时器 1）出现上升沿时，两个计数器开始根据内部时钟同步计数，并且两个 TIF 标志
都置 1。
注：本例中，两个定时器都在启动之前进行了初始化（通过将各自的UG位置1）。两个计数器都从
0 开始计数，但可以通过对任意一个计数器寄存器(R16_TIMx_CNT)进行写操作，在二者之间轻松插
入一个偏移量。可注意到主/从模式在定时器1的CNT_EN与CK_PSC之间产生了延迟。

<a id="pdf-page-120"></a>
<!-- PDF page 120 -->

**图 12-15 使用定时器 1 的 TI1 输入触发定时器 1 和定时器 2**

CK_INT
TIMER1-TI1
TIMER1-CEN=CNT_EN
TIMER1-CK_PSC
TIMER1-CNT 00 04 05 06 07 08 09
01 02 03
TIMER1-TIF
TIMER2-CEN=CNT_EN
TIMER2-CK_PSC
TIMER2-CNT 00 01 02 03 04 05 06 07 08 09
TIMER2-TIF
定时器能够输出时钟脉冲（TRGO），也能接收其他定时器的输入（ITRx）。不同的定时器的 ITRx
的来源（别的定时器的 TRGO）是不一样的。定时器内部触发连接如表 12-2 所示。
**表 12-2 TIMx 内部触发连接**

从定时器 ITR0(TS=000) ITR1(TS=001) ITR2(TS=010) ITR3(TS=011)
TIM1 0 TIM2_TRGO 0 0
TIM2 TIM1_TRGO 0 0 0
#### 12.3.13 调试模式

当系统进入调试模式时，定时器根据 DBG 模块的设置继续运转或停止。
### 12.4 寄存器描述

**表 12-3 TIM1 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R16_TIM1_CTLR1 | 0x40012C00 | 控制寄存器1 | 0x0000 |
| R16_TIM1_CTLR2 | 0x40012C04 | 控制寄存器2 | 0x0000 |
| R16_TIM1_SMCFGR | 0x40012C08 | 从模式控制寄存器 | 0x0000 |
| R16_TIM1_DMAINTENR | 0x40012C0C | DMA/中断使能寄存器 | 0x0000 |
| R16_TIM1_INTFR | 0x40012C10 | 中断状态寄存器 | 0x0000 |
| R16_TIM1_SWEVGR | 0x40012C14 | 事件产生寄存器 | 0x0000 |
| R16_TIM1_CHCTLR1 | 0x40012C18 | 比较/捕获控制寄存器1 | 0x0000 |
| R16_TIM1_CHCTLR2 | 0x40012C1C | 比较/捕获控制寄存器2 | 0x0000 |
| R16_TIM1_CCER | 0x40012C20 | 比较/捕获使能寄存器 | 0x0000 |
| R16_TIM1_CNT | 0x40012C24 | 计数器 | 0x0000 |
| R16_TIM1_PSC | 0x40012C28 | 计数时钟预分频器 | 0x0000 |
| R16_TIM1_ATRLR | 0x40012C2C | 自动重装值寄存器 | 0xFFFF |
| R16_TIM1_RPTCR | 0x40012C30 | 重复计数值寄存器 | 0x0000 |
| R32_TIM1_CH1CVR | 0x40012C34 | 比较/捕获寄存器1 | 0x00000000 |


<a id="pdf-page-121"></a>
<!-- PDF page 121 -->

R32_TIM1_CH2CVR 0x40012C38 比较/捕获寄存器 2 0x00000000
R32_TIM1_CH3CVR 0x40012C3C 比较/捕获寄存器 3 0x00000000
R32_TIM1_CH4CVR 0x40012C40 比较/捕获寄存器 4 0x00000000
R16_TIM1_BDTR 0x40012C44 刹车和死区寄存器 0x0000
R16_TIM1_DMACFGR 0x40012C48 DMA 控制寄存器 0x0000
R16_TIM1_DMAADR 0x40012C4C 连续模式的 DMA 地址寄存器 0x0000
R16_TIM1_SPEC 0x40012C50 SPEC 寄存器 0x0000
**表 12-4 TIM2 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R16_TIM2CTLR1 | 0x40000000 | 控制寄存器1 | 0x0000 |
| R16_TIM2CTLR2 | 0x40000004 | 控制寄存器2 | 0x0000 |
| R16_TIM2_SMCFGR | 0x40000008 | 从模式控制寄存器 | 0x0000 |
| R16_TIM2_DMAINTENR | 0x4000000C | DMA/中断使能寄存器 | 0x0000 |
| R16_TIM2_INTFR | 0x40000010 | 中断状态寄存器 | 0x0000 |
| R16_TIM2_SWEVGR | 0x40000014 | 事件产生寄存器 | 0x0000 |
| R16_TIM2_CHCTLR1 | 0x40000018 | 比较/捕获控制寄存器1 | 0x0000 |
| R16_TIM2_CHCTLR2 | 0x4000001C | 比较/捕获控制寄存器2 | 0x0000 |
| R16_TIM2_CCER | 0x40000020 | 比较/捕获使能寄存器 | 0x0000 |
| R16_TIM2_CNT | 0x40000024 | 计数器 | 0x0000 |
| R16_TIM2_PSC | 0x40000028 | 计数时钟预分频器 | 0x0000 |
| R16_TIM2_ATRLR | 0x4000002C | 自动重装值寄存器 | 0xFFFF |
| R16_TIM2_RPTCR | 0x40000030 | 重复计数值寄存器 | 0x0000 |
| R32_TIM2_CH1CVR | 0x40000034 | 比较/捕获寄存器1 | 0x00000000 |
| R32_TIM2_CH2CVR | 0x40000038 | 比较/捕获寄存器2 | 0x00000000 |
| R32_TIM2_CH3CVR | 0x4000003C | 比较/捕获寄存器3 | 0x00000000 |
| R32_TIM2_CH4CVR | 0x40000040 | 比较/捕获寄存器4 | 0x00000000 |
| R16_TIM2BDTR | 0x40000044 | 刹车和死区寄存器 | 0x0000 |
| R16_TIM2DMACFGR | 0x40000048 | DMA控制寄存器 | 0x0000 |
| R16_TIM2DMAADR | 0x4000004C | 连续模式的DMA地址寄存器 | 0x0000 |
| R16_TIM2_SPEC | 0x40000050 | SPEC寄存器 | 0x0000 |

#### 12.4.1 控制寄存器1（TIMx_CTLR1）（x=1/2）

偏移地址：0x00
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Rese CMP_
CAPLVL CAPOV Reserved CKD[1:0] ARPE CMS[1:0] DIR OPM URS UDIS CEN
rved BK
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 15 | CAPLVL | RW | 双沿捕获模式下，捕获电平指示使能：<br>1：使能指示功能；<br>0：关闭指示功能。<br>注：使能后，CHxCVR的bit[16]指示捕获值对应的<br>电平。 | 0 |


<a id="pdf-page-122"></a>
<!-- PDF page 122 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| 14 | CAPOV | RW | 捕获值模式配置：<br>1：当捕获前产生计数器溢出时，CHxCVR 值为<br>0xFFFF；<br>0：捕获值为实际计数器的值。 | 0 |
| 13 | Reserved | RO | 保留。 | 0 |
| 12 | CMP_BK | RW | 电压比较器结果直接用于刹车输入使能（仅 TIM1<br>支持）：<br>如果CMP_BK为1且OPA_CTLR2的EN3为1，则刹车<br>输入信号来自CMPA3输出通道；<br>如果CMP_BK为1且OPA_CTLR2的EN3为0，则刹车<br>输入信号来自CMPA1输出通道；<br>否则刹车输入信号来自外部对应I/O引脚。 | 0 |
| [11:10] | Reserved | RO | 保留。 | 0 |
| [9:8] | CKD[1:0] | RW | 这2位定义在定时器时钟(CK_INT)频率、死区时间<br>和由死区发生器与数字滤波器(ETR,TIx)所用的采<br>样时钟之间的分频比例：<br>00：Tdts=Tck_int；<br>01：Tdts = 2 x Tck_int；<br>10：Tdts = 4 x Tck_int；<br>11：保留。 | 0 |
| 7 | ARPE | RW | 自动重装预装使能位：<br>1：使能自动重装值寄存器（ATRLR）；<br>0：禁止自动重装值寄存器（ATRLR）。 | 0 |
| [6:5] | CMS[1:0] | RW | 中央对齐模式选择：<br>00：边沿对齐模式。计数器依据方向位(DIR)向上或<br>向下计数。<br>01：中央对齐模式 1。计数器交替地向上和向下计<br>数。配置为输出的通道(CHCTLRx寄存器中CCxS=00)<br>的输出比较中断标志位，只在计数器向下计数时被<br>设置。<br>10：中央对齐模式 2。计数器交替地向上和向下计<br>数。配置为输出的通道(CHCTLRx寄存器中CCxS=00)<br>的输出比较中断标志位，只在计数器向上计数时被<br>设置。<br>11：中央对齐模式 3。计数器交替地向上和向下计<br>数。配置为输出的通道(CHCTLRx寄存器中CCxS=00)<br>的输出比较中断标志位，在计数器向上和向下计数<br>时均被设置。<br>注：在计数器使能时(CEN=1)，不允许从边沿对齐模<br>式转换到中央对齐模式。 | 0 |
| 4 | DIR | RW | 计数器方向：<br>1：计数器的计数模式为减计数；<br>0：计数器的计数模式为增计数。<br>注：当计数器配置为中央对齐模式或编码器模式时，<br>该位无效。 | 0 |
| 3 | OPM | RW | 单脉冲模式： | 0 |


<a id="pdf-page-123"></a>
<!-- PDF page 123 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 1：在发生下一次更新事件时，计数器停止(清除CEN<br>位)。<br>0：在发生下一次更新事件时，计数器不停止。 |  |
| 2 | URS | RW | 更新请求源，软件通过该位选择UEV事件的源。<br>1：如果使能了更新中断或DMA请求，则只有计数器<br>溢出/下溢才产生更新中断或DMA请求；<br>0：如果使能了更新中断或DMA请求，则下述任一事<br>件产生更新中断或DMA请求。<br>-计数器溢出/下溢<br>-设置UG位<br>-从模式控制器产生的更新 | 0 |
| 1 | UDIS | RW | 禁止更新，软件通过该位允许/禁止 UEV 事件的产<br>生。<br>1：禁止UEV。不产生更新事件，各寄存器(ARR、PSC、<br>CCRx)保持它们的值。如果设置了UG位或从模式控<br>制器发出了一个硬件复位，则计数器和预分频器被<br>重新初始化；<br>0：允许UEV。更新(UEV)事件由下述任一事件产生：<br>-计数器溢出/下溢<br>-设置UG位<br>-从模式控制器产生的更新<br>具有缓存的寄存器被装入它们的预装载值。 | 0 |
| 0 | CEN | RW | 使能计数器。<br>1：使能计数器；<br>0：禁止计数器。<br>注：在软件设置了CEN位后，外部时钟、门控模式<br>和编码器模式才能工作。触发模式可以自动地通过<br>硬件设置CEN位。 | 0 |

#### 12.4.2 控制寄存器2（TIMx_CTLR2）（x=1/2）

偏移地址：0x04
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved OIS4 OIS3N OIS3 OIS2N OIS2 OIS1N OIS1 TI1S MMS[2:0] CCDS CCUS Reserved CCPC
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 15 | Reserved | RO | 保留。 | 0 |
| 14 | OIS4 | RW | 输出空闲状态4：<br>1：当MOE=0时，如果实施了OC4N，则死区后OC4=1；<br>0：当MOE=0时，如果实施了OC4N，则死区后OC4=0。<br>注：已经设置了LOCK(TIMx_BDTR寄存器)级别1、2<br>或3后，该位不能被修改。 | 0 |
| 13 | OIS3N | RW | 输出空闲状态3：<br>1：当MOE=0时，死区后OC3N=1；<br>0：当MOE=0时，死区后OC3N=0。<br>注：已经设置了LOCK(TIMx_BDTR寄存器)级别1、2 | 0 |


<a id="pdf-page-124"></a>
<!-- PDF page 124 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 或3后，该位不能被修改。 |  |
| 12 | OIS3 | RW | 输出空闲状态3，参见OIS4。 | 0 |
| 11 | OIS2N | RW | 输出空闲状态2，参见OIS3N。 | 0 |
| 10 | OIS2 | RW | 输出空闲状态2，参见OIS4。 | 0 |
| 9 | OIS1N | RW | 输出空闲状态1，参见OIS3N。 | 0 |
| 8 | OIS1 | RW | 输出空闲状态1，参见OIS4。 | 0 |
| 7 | TI1S | RW | TI1选择：<br>1：TIMx_CH1、TIMx_CH2和TIMx_CH3引脚经异或后<br>连到TI1输入；<br>0：TIMx_CH1引脚直连到TI1输入。 | 0 |
| [6:4] | MMS[2:0] | RW | 主模式选择:这 3 位用于选择在主模式下送到从定<br>时器的同步信息(TRGO)。<br>可能的组合如下：<br>000：复位–TIMx_EGR寄存器的UG位被用于作为触<br>发输出(TRGO)。如果是触发输入产生的复位(从模式<br>控制器处于复位模式)，则TRGO上的信号相对实际<br>的复位会有一个延迟；<br>001：使能–计数器使能信号CNT_EN被用于作为触<br>发输出(TRGO)。有时需要在同一时间启动多个定时<br>器或控制在一段时间内使能从定时器。计数器使能<br>信号是通过CEN控制位和门控模式下的触发输入信<br>号的逻辑或产生。当计数器使能信号受控于触发输<br>入时，TRGO 上会有一个延迟，除非选择了主/从模<br>式(见TIMx_SMCR寄存器中MSM位的描述)；<br>010：更新–更新事件被选为触发输入(TRGO)。例如，<br>一个主定时器的时钟可以被用作一个从定时器的预<br>分频器；<br>011：比较脉冲–在发生一次捕获或一次比较成功<br>时，当要设置CC1IF标志时(即使它已经为高)，触<br>发输出送出一个正脉冲(TRGO)；<br>100：比较–OC1REF 信号被用于作为触发输出<br>(TRGO)；<br>101：比较–OC2REF 信号被用于作为触发输出<br>(TRGO)；<br>110：比较–OC3REF 信号被用于作为触发输出<br>(TRGO)；<br>111：比较–OC4REF 信号被用于作为触发输出<br>(TRGO)。 | 0 |
| 3 | CCDS | RW | 捕获比较的DMA选择：<br>1：当发生更新事件时，送出CHxCVR的DMA请求；<br>0：当发生CHxCVR时，产生CHxCVR的DMA请求。 | 0 |
| 2 | CCUS | RW | 比较捕获控制更新选择位：<br>1：如果 CCPC 置位，可以通过设置 COM 位或 TRGI<br>上的一个上升沿更新它们；<br>0：如果CCPC置位，只能通过设置COM位更新它们。<br>注：该位只对具有互补输出的通道起作用。 | 0 |


<a id="pdf-page-125"></a>
<!-- PDF page 125 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| 1 | Reserved | RO | 保留。 | 0 |
| 0 | CCPC | RW | 比较捕获预装载控制位：<br>1：CCxE，CCxNE 和 OCxM 位是预装载的，设置该位<br>后，它们只在设置了COM位后被更新；<br>0：CCxE，CCxNE和OCxM位不是预装载的。<br>注：该位只对具有互补输出的通道起作用。 | 0 |

#### 12.4.3 从模式控制寄存器（TIMx_SMCFGR）（x=1/2）

偏移地址：0x08
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
ETP ECE ETPS[1:0] ETF[3:0] MSM TS[2:0] Reserved SMS[2:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 15 | ETP | RO | ETR 触发极性选择，该位选择是直接输入 ETR 还是<br>输入ETR的反相。<br>1：将ETR反相，低电平或下降沿有效；<br>0：ETR，高电平或上升沿有效。 | 0 |
| 14 | ECE | RW | 外部时钟模式2启用选择：<br>1：使能外部时钟模式2；<br>0：禁用外部时钟模式2。<br>注1：从模式可以与外部时钟模式2同时使用：复<br>位模式，门控模式和触发模式；但是，这时 TRGI<br>不能连到ETRF(TS位不能是’111’)。<br>注2：外部时钟模式1和外部时钟模式2同时被使<br>能时，外部时钟的输入是ETRF。 | 0 |
| [13:12] | ETPS[1:0] | RW | 外部触发信号(ETRP)分频，这个信号频率最大不能<br>超过TIMxCLK频率的1/4，可以通过这个域来降频：<br>00：关闭预分频；<br>01：ETRP频率除以2；<br>10：ETRP频率除以4；<br>11：ETRP频率除以8。 | 0 |
| [11:8] | ETF[3:0] | RW | 外部触发滤波，实际上，数字滤波器是一个事件计<br>数器，它使用一定的采样的频率，记录到N个事件<br>后会产生一个输出的跳变。<br>0000：无滤波器，以Fdts采样；<br>0001：采样频率Fsampling=Fck_int，N=2；<br>0010：采样频率Fsampling=Fck_int，N=4；<br>0011：采样频率Fsampling=Fck_int，N=8；<br>0100：采样频率Fsampling=Fdts/2，N=6；<br>0101：采样频率Fsampling=Fdts/2，N=8；<br>0110：采样频率Fsampling=Fdts/4，N=6；<br>0111：采样频率Fsampling=Fdts/4，N=8；<br>1000：采样频率Fsampling=Fdts/8，N=6；<br>1001：采样频率Fsampling=Fdts/8，N=8；<br>1010：采样频率Fsampling=Fdts/16，N=5； | 0 |


<a id="pdf-page-126"></a>
<!-- PDF page 126 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 1011：采样频率Fsampling=Fdts/16，N=6；<br>1100：采样频率Fsampling=Fdts/16，N=8；<br>1101：采样频率Fsampling=Fdts/32，N=5；<br>1110：采样频率Fsampling=Fdts/32，N=6；<br>1111：采样频率Fsampling=Fdts/32，N=8。 |  |
| 7 | MSM | RW | 主/从模式选择：<br>1：触发输入(TRGI)上的事件被延迟了，以允许在当<br>前定时器(通过 TRGO)与它的从定时器间的完美同<br>步。这对要求把几个定时器同步到一个单一的外部<br>事件时是非常有用的；<br>0：不发挥作用。 | 0 |
| [6:4] | TS[2:0] | RW | 触发选择域，这3位选择用于同步计数器的触发输<br>入源：<br>000：内部触发0(ITR0)；<br>001：内部触发1(ITR1)；<br>010：内部触发2(ITR2)；<br>011：内部触发3(ITR3)；<br>100：TI1的边沿检测器(TI1F_ED)；<br>101：滤波后的定时器输入1(TI1FP1)；<br>110：滤波后的定时器输入2(TI2FP2)；<br>111：外部触发输入(ETRF)；<br>以上只有在SMS为0时改变。<br>注：具体见表12-2。 | 0 |
| 3 | Reserved | RO | 保留。 | 0 |
| [2:0] | SMS[2:0] | RW | 输入模式选择域。选择核心计数器的时钟和触发模<br>式。<br>000：由内部时钟CK_INT驱动；<br>001：编码器模式 1，根据 TI1FP1 的电平，核心计<br>数器在TI2FP2的边沿增减计数；<br>010：编码器模式 2，根据 TI2FP2 的电平，核心计<br>数器在TI1FP1的边沿增减计数；<br>011：编码器模式3，根据另一个信号的输入电平，<br>核心计数器在TI1FP1和TI2FP2的边沿增减计数；<br>100：复位模式，触发输入(TRGI)的上升沿将初始化<br>计数器，并且产生一个更新寄存器的信号；<br>101：门控模式，当触发输入(TRGI)为高时，计数器<br>的时钟开启；在触发输入变为低，计数器停止，计<br>数器的启停都是受控的；<br>110：触发模式，计数器在触发输入TRGI的上升沿<br>启动，只有计数器的启动是受控的；<br>111：外部时钟模式1，选中的触发输入(TRGI)的上<br>升沿驱动计数器。 | 0 |

#### 12.4.4 DMA/中断使能寄存器（TIMx_DMAINTENR）（x=1/2）

偏移地址：0x0C
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0

<a id="pdf-page-127"></a>
<!-- PDF page 127 -->

Reserved TDE COMDE CC4DE CC3DE CC2DE CC1DE UDE BIE TIE COMIE CC4IE CC3IE CC2IE CC1IE UIE
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 15 | Reserved | RO | 保留。 | 0 |
| 14 | TDE | RW | 触发DMA请求使能位：<br>1：允许触发DMA请求；<br>0：禁止触发DMA请求。 | 0 |
| 13 | COMDE | RW | COM的DMA请求使能位：<br>1：允许COM的DMA请求；<br>0：禁止COM的DMA请求。 | 0 |
| 12 | CC4DE | RW | 比较捕获通道4的DMA请求使能位：<br>1：允许比较捕获通道4的DMA请求；<br>0：禁止比较捕获通道4的DMA请求。 | 0 |
| 11 | CC3DE | RW | 比较捕获通道3的DMA请求使能位：<br>1：允许比较捕获通道3的DMA请求；<br>0：禁止比较捕获通道3的DMA请求。 | 0 |
| 10 | CC2DE | RW | 比较捕获通道2的DMA请求使能位：<br>1：允许比较捕获通道2的DMA请求；<br>0：禁止比较捕获通道2的DMA请求。 | 0 |
| 9 | CC1DE | RW | 比较捕获通道1的DMA请求使能位：<br>1：允许比较捕获通道1的DMA请求；<br>0：禁止比较捕获通道1的DMA请求。 | 0 |
| 8 | UDE | RW | 更新的DMA请求使能位：<br>1：允许更新的DMA请求；<br>0：禁止更新的DMA请求。 | 0 |
| 7 | BIE | RW | 刹车中断使能位：<br>1：允许刹车中断；<br>0：禁止刹车中断。 | 0 |
| 6 | TIE | RW | 触发中断使能位：<br>1：使能触发中断；<br>0：禁止触发中断。 | 0 |
| 5 | COMIE | RW | COM中断允许位：<br>1：允许COM中断；<br>0：禁止COM中断。 | 0 |
| 4 | CC4IE | RW | 比较捕获通道4中断使能位：<br>1：允许比较捕获通道4中断；<br>0：禁止比较捕获通道4中断。 | 0 |
| 3 | CC3IE | RW | 比较捕获通道3中断使能位：<br>1：允许比较捕获通道3中断；<br>0：禁止比较捕获通道3中断。 | 0 |
| 2 | CC2IE | RW | 比较捕获通道2中断使能位：<br>1：允许比较捕获通道2中断；<br>0：禁止比较捕获通道2中断。 | 0 |
| 1 | CC1IE | RW | 比较捕获通道1中断使能位：<br>1：允许比较捕获通道1中断； | 0 |


<a id="pdf-page-128"></a>
<!-- PDF page 128 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 0：禁止比较捕获通道1中断。 |  |
| 0 | UIE | RW | 更新中断使能位：<br>1：允许更新中断；<br>0：禁止更新中断。 | 0 |

#### 12.4.5 中断状态寄存器（TIMx_INTFR）（x=1/2）

偏移地址：0x10
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved CC4OF CC3OF CC2OF CC1OF Reserved BIF TIF COMIF CC4IF CC3IF CC2IF CC1IF UIF
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:13] | Reserved | RO | 保留。 | 0 |
| 12 | CC4OF | RW0 | 比较捕获通道4重复捕获标志位。 | 0 |
| 11 | CC3OF | RW0 | 比较捕获通道3重复捕获标志位。 | 0 |
| 10 | CC2OF | RW0 | 比较捕获通道2重复捕获标志位。 | 0 |
| 9 | CC1OF | RW0 | 比较捕获通道1重复捕获标志位，仅用于比较捕获<br>通道被配置为输入捕获模式时。该标记由硬件置位，<br>软件写0可清除此位。<br>1：计数器的值被捕获到捕获比较寄存器时，CC1IF<br>的状态已经被置位；<br>0：无重复捕获产生。 | 0 |
| 8 | Reserved | RO | 保留。 | 0 |
| 7 | BIF | RW0 | 刹车中断标志位，一旦刹车输入有效，由硬件对该<br>位置位，可由软件清零。<br>1：刹车引脚输入上检测到设定的有效电平；<br>0：无刹车事件产生。 | 0 |
| 6 | TIF | RW0 | 触发器中断标志位，当发生触发事件时由硬件对该<br>位置位，由软件清零。触发事件包括从除门控模式<br>外的其它模式时，在TRGI输入端检测到有效边沿，<br>或门控模式下的任一边沿。<br>1：触发器事件产生；<br>0：无触发器事件产生。 | 0 |
| 5 | COMIF | RW0 | COM 中断标志位，一旦产生 COM 事件，该位由硬件<br>置位，由软件清零。COM事件包括CCxE、CCxNE、OCxM<br>被更新。<br>1：COM事件产生；<br>0：无COM事件产生。 | 0 |
| 4 | CC4IF | RW0 | 比较捕获通道4中断标志位。 | 0 |
| 3 | CC3IF | RW0 | 比较捕获通道3中断标志位。 | 0 |
| 2 | CC2IF | RW0 | 比较捕获通道2中断标志位。 | 0 |
| 1 | CC1IF | RW0 | 比较捕获通道1中断标志位。<br>如果比较捕获通道配置为输出模式：<br>当计数器值与比较值匹配时该位由硬件置位，但在<br>中心对称模式下除外。该位由软件清零。<br>1：核心计数器的值与比较捕获寄存器1的值匹配； | 0 |


<a id="pdf-page-129"></a>
<!-- PDF page 129 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 0：无匹配发生。<br>如果比较捕获通道1配置为输入模式：<br>当捕获事件发生时该位由硬件置位，它由软件清零<br>或通过读比较捕获寄存器清零。<br>1：计数器值已被捕获比较捕获寄存器1；<br>0：无输入捕获产生。 |  |
| 0 | UIF | RW0 | 更新中断标志位，当产生更新事件时该位由硬件置<br>位，由软件清零。<br>1：更新中断产生；<br>0：无更新事件产生。<br>以下情形会产生更新事件：<br>若UDIS=0，当重复计数器数值上溢或下溢时；<br>若URS=0、UDIS=0，当置UG位时，或当通过软件对<br>计数器核心计数器重新初始化时；<br>若 URS=0、UDIS=0，当计数器 CNT 被触发事件重新<br>初始化时。 | 0 |

#### 12.4.6 事件产生寄存器（TIMx_SWEVGR）（x=1/2）

偏移地址：0x14
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved BG TG COMG CC4G CC3G CC2G CC1G UG
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:8] | Reserved | RO | 保留。 | 0 |
| 7 | BG | WO | 刹车事件产生位，此位由软件置位和清零，用来产<br>生一个刹车事件。<br>1：产生一个刹车事件。此时 MOE=0、BIF=1，若使<br>能对应的中断和DMA，则产生相应的中断和DMA；<br>0：无动作。 | 0 |
| 6 | TG | WO | 触发事件产生位，该位由软件置位，硬件清零，用<br>于产生一个触发事件。<br>1：产生一个触发事件，TIF被置位，若使能对应的<br>中断和DMA，则产生相应的中断和DMA；<br>0：无动作。 | 0 |
| 5 | COMG | WO | 比较捕获控制更新产生位。产生比较捕获控制更新<br>事件。该位由软件置位，由硬件自动清零。<br>1：当CCPC=1，允许更新CCxE、CCxNE、OCxM位；<br>0：无动作。<br>注：该位只对拥有互补输出的通道（通道1，2，3）<br>有效。 | 0 |
| 4 | CC4G | WO | 比较捕获事件产生位4。产生比较捕获事件4。 | 0 |
| 3 | CC3G | WO | 比较捕获事件产生位3。产生比较捕获事件3。 | 0 |
| 2 | CC2G | WO | 比较捕获事件产生位2。产生比较捕获事件2。 | 0 |
| 1 | CC1G | WO | 比较捕获事件产生位1，产生比较捕获事件1。<br>该位由软件置位，由硬件清零。用于产生一个比较 | 0 |


<a id="pdf-page-130"></a>
<!-- PDF page 130 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 捕获事件。<br>1：在比较捕获通道1上产生一个比较捕获事件：<br>若比较捕获通道1配置为输出：<br>置 CC1IF 位。若使能对应的中断和 DMA，则产生相<br>应的中断和DMA；<br>若比较捕获通道1配置为输入：<br>当前核心计数器的值被捕获至比较捕获寄存器 1；<br>置 CC1IF 位，若使能了对应的中断和 DMA，则产生<br>相应的中断和DMA。若CC1IF已经置位，则置CC1OF<br>位。<br>0：无动作。 |  |
| 0 | UG | WO | 更新事件产生位，产生更新事件。该位由软件置位，<br>由硬件自动清零。<br>1：初始化计数器，并产生一个更新事件；<br>0：无动作。<br>注：预分频器的计数器也被清零，但是预分频系数<br>不变。若在中心对称模式下或增计数模式下则核心<br>计数器被清零；若减计数模式下则核心计数器取重<br>装值寄存器的值。 | 0 |

#### 12.4.7 比较/捕获控制寄存器1（TIMx_CHCTLR1）（x=1/2）

偏移地址：0x18
通道可用于输入(捕获模式)或输出(比较模式)，通道的方向由相应的 CCxS 位定义。该寄存器其
它位的作用在输入和输出模式下不同。OCxx 描述了通道在输出模式下的功能，ICxx 描述了通道在输
入模式下的功能。
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
OC2CE OC2M[2:0] OC2PE OC2FE OC1CE OC1M[2:0] OC1PE OC1FE
CC2S[1:0] CC1S[1:0]
IC2F[3:0] IC2PSC[1:0] IC1F[3:0] IC1PSC[1:0]
比较模式（引脚方向为输出）：
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 15 | OC2CE | RW | 比较捕获通道2清零使能位。<br>1：一旦检测到ETRF输入高电平，清除OC2REF位零；<br>0：OC2REF不受ETRF输入的影响。 | 0 |
| [14:12] | OC2M[2:0] | RW | 比较捕获通道2模式设置域。<br>该 3 位定义了输出参考信号 OC2REF 的动作，而<br>OC2REF决定了OC2、OC2N的值。OC2REF是高电平有<br>效，而OC2和OC2N的有效电平取决于CC2P、CC2NP<br>位。<br>000：冻结。比较捕获寄存器的值与核心计数器间的<br>比较值对OC2REF不起作用；<br>001：强制设为有效电平。当核心计数器与比较捕获<br>寄存器2的值相同时，强制OC2REF为高；<br>010：强制设为无效电平。当核心计数器的值与比较<br>捕获寄存器2相同时，强制OC2REF为低； | 0 |


<a id="pdf-page-131"></a>
<!-- PDF page 131 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 011：翻转。当核心计数器与比较捕获寄存器2的值<br>相同时，翻转OC2REF的电平。<br>100：强制为无效电平。强制OC2REF为低。<br>101：强制为有效电平。强制OC2REF为高。<br>110：PWM模式1：在向上计数时，一旦核心计数器<br>小于比较捕获寄存器的值时，通道2为有效电平，<br>否则为无效电平；在向下计数时，一旦核心计数器<br>大于比较捕获寄存器的值时，通道 2 为无效电平<br>(OC2REF=0)，否则为有效电平(OC2REF=1)；<br>111：PWM模式2：在向上计数时，一旦核心计数器<br>小于比较捕获寄存器的值时，通道2为无效电平，<br>否则为有效电平；在向下计数时，一旦核心计数器<br>大于比较捕获寄存器的值时，通道 2 为有效电平<br>(OC2REF=1)，否则为无效电平(OC2REF=0)。<br>注：一旦LOCK级别设为3并且CC2S=00b则该位不<br>能被修改。在PWM模式1或PWM模式2中，只有当<br>比较结果改变了或在输出比较模式中从冻结模式切<br>换到PWM模式时，OC2REF电平才改变。 |  |
| 11 | OC2PE | RW | 比较捕获寄存器2预装载使能位。<br>1：开启比较捕获寄存器2的预装载功能，读写操作<br>仅对预装载寄存器操作，比较捕获寄存器2的预装<br>载值在更新事件到来时被加载至当前影子寄存器<br>中；<br>0：禁止比较捕获寄存器2的预装载功能，可随时写<br>入比较捕获寄存器 2，并且新写入的数值立即起作<br>用。<br>注：一旦LOCK级别设为3并且CC2S=00，则该位不<br>能被修改；仅仅在单脉冲模式下(OPM=1)可以在未确<br>认预装载寄存器情况下使用PWM模式，否则其动作<br>不确定。 | 0 |
| 10 | OC2FE | RW | 比较捕获通道2快速使能位，该位用于加快比较捕<br>获通道输出对触发输入事件的响应。<br>1：输入到触发器的有效沿的作用就像发生了一次比<br>较匹配。因此，OC被设置为比较电平而与比较结果<br>无关。采样触发器的有效沿和比较捕获通道2输出<br>间的延时被缩短为3个时钟周期；<br>0：根据计数器与比较捕获寄存器1的值，比较捕获<br>通道2正常操作，即使触发器是打开的。当触发器<br>的输入有一个有效沿时，激活比较捕获通道2输出<br>的最小延时为5个时钟周期。<br>OC2FE 只在通道被配置成PWM1 或 PWM2 模式时起作<br>用。 | 0 |
| [9:8] | CC2S[1:0] | RW | 比较捕获通道2输入选择域。<br>00：比较捕获通道2被配置为输出；<br>01：比较捕获通道2被配置为输入，IC2映射在TI2<br>上； | 0 |


<a id="pdf-page-132"></a>
<!-- PDF page 132 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 10：比较捕获通道2被配置为输入，IC2映射在TI1<br>上；<br>11：比较捕获通道2被配置为输入，IC2映射在TRC<br>上。此模式仅工作在内部触发器输入被选中时(由<br>TS位选择)。<br>注：比较捕获通道2仅在通道关闭时(CC2E为零时)<br>才是可写的。 |  |
| 7 | OC1CE | RW | 比较捕获通道1清零使能位。 | 0 |
| [6:4] | OC1M[2:0] | RW | 比较捕获通道1模式设置域。 | 0 |
| 3 | OC1PE | RW | 比较捕获寄存器1预装载使能位。 | 0 |
| 2 | OC1FE | RW | 比较捕获通道1快速使能位。 | 0 |
| [1:0] | CC1S[1:0] | RW | 比较捕获通道1输入选择域。 | 0 |

捕获模式（引脚方向为输入）：
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:12] | IC2F[3:0] | RW | 输入捕获滤波器2配置域，这几位设置了TI1输入<br>的采样频率及数字滤波器长度。数字滤波器由一个<br>事件计数器组成，它记录到N个事件后会产生一个<br>输出的跳变。<br>0000：无滤波器，以fDTS采样；<br>1000：采样频率Fsampling=Fdts/8，N=6；<br>0001：采样频率Fsampling=Fck_int，N=2；<br>1001：采样频率Fsampling=Fdts/8，N=8；<br>0010：采样频率Fsampling=Fck_int，N=4；<br>1010：采样频率Fsampling=Fdts/16，N=5；<br>0011：采样频率Fsampling=f=Fck_int，N=8；<br>1011：采样频率Fsampling=Fdts/16，N=6；<br>0100：采样频率Fsampling=Fdts/2，N=6；<br>1100：采样频率Fsampling=Fdts/16，N=8；<br>0101：采样频率Fsampling=Fdts/2，N=8；<br>1101：采样频率Fsampling=Fdts/32，N=5；<br>0110：采样频率Fsampling=Fdts/4，N=6；<br>1110：采样频率Fsampling=Fdts/32，N=6；<br>0111：采样频率Fsampling=Fdts/4，N=8；<br>1111：采样频率Fsampling=Fdts/32，N=8。 | 0 |
| [11:10] | IC2PSC[1:0] | RW | 比较捕获通道2预分频配置域，这2位定义了比较<br>捕获通道2的预分频系数。一旦CC1E=0，则预分频<br>器复位。<br>00：无预分频器，捕获输入口上检测到的每一个边<br>沿都触发一次捕获；<br>01：每2个事件触发一次捕获；<br>10：每4个事件触发一次捕获；<br>11：每8个事件触发一次捕获。 | 0 |
| [9:8] | CC2S[1:0] | RW | 比较捕获通道2输入选择域，这2位定义通道的方<br>向(输入/输出)，及输入脚的选择。 | 0 |


<a id="pdf-page-133"></a>
<!-- PDF page 133 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 00：比较捕获通道1通道被配置为输出；<br>01：比较捕获通道 1 通道被配置为输入，IC1 映射<br>在TI1上；<br>10：比较捕获通道 1 通道被配置为输入，IC1 映射<br>在TI2上；<br>11：比较捕获通道 1 通道被配置为输入，IC1 映射<br>在TRC上。此模式仅工作在内部触发器输入被选中<br>时(由TS位选择)。<br>注：CC1S仅在通道关闭时(CC1E为0)才是可写的。 |  |
| [7:4] | IC1F[3:0] | RW | 输入捕获滤波器1配置域。 | 0 |
| [3:2] | IC1PSC[1:0] | RW | 比较捕获通道1预分频配置域。 | 0 |
| [1:0] | CC1S[1:0] | RW | 比较捕获通道1输入选择域。 | 0 |

#### 12.4.8 比较/捕获控制寄存器2（TIMx_CHCTLR2）（x=1/2）

偏移地址：0x1C
通道可用于输入(捕获模式)或输出(比较模式)，通道的方向由相应的 CCxS 位定义。该寄存器其
它位的作用在输入和输出模式下不同。OCxx 描述了通道在输出模式下的功能，ICxx 描述了通道在输
入模式下的功能。
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
OC4CE OC4M[2:0] OC4PE OC4FE OC3CE OC3M[2:0] OC3PE OC3FE
CC4S[1:0] CC3S[1:0]
IC4F[3:0] IC4PSC[1:0] IC3F[3:0] IC3PSC[1:0]
比较模式（引脚方向为输出）：
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 15 | OC4CE | RW | 比较捕获通道4清零使能位。 | 0 |
| [14:12] | OC4M[2:0] | RW | 比较捕获通道4模式设置域。 | 0 |
| 11 | OC4PE | RW | 比较捕获寄存器4预装载使能位。 | 0 |
| 10 | OC4FE | RW | 比较捕获通道4快速使能位。 | 0 |
| [9:8] | CC4S[1:0] | RW | 比较捕获通道4输入选择域。 | 0 |
| 7 | OC3CE | RW | 比较捕获通道3清零使能位。 | 0 |
| [6:4] | OC3M[2:0] | RW | 比较捕获通道3模式设置域。 | 0 |
| 3 | OC3PE | RW | 比较捕获寄存器3预装载使能位。 | 0 |
| 2 | OC3FE | RW | 比较捕获通道3快速使能位。 | 0 |
| [1:0] | CC3S[1:0] | RW | 比较捕获通道3输入选择域。 | 0 |

捕获模式（引脚方向为输入）：
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:12] | IC4F[3:0] | RW | 输入捕获滤波器4配置域。 | 0 |
| [11:10] | IC4PSC[1:0] | RW | 比较捕获通道4预分频配置域。 | 0 |
| [9:8] | CC4S[2:0] | RW | 比较捕获通道4输入选择域。 | 0 |
| [7:4] | IC3F[3:0] | RW | 输入捕获滤波器3配置域。 | 0 |
| [3:2] | IC3PSC[1:0] | RW | 比较捕获通道3预分频配置域。 | 0 |
| [1:0] | CC3S[1:0] | RW | 比较捕获通道3输入选择域。 | 0 |


<a id="pdf-page-134"></a>
<!-- PDF page 134 -->

#### 12.4.9 比较/捕获使能寄存器（TIMx_CCER）（x=1/2）

偏移地址：0x20
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved CC4P CC4E CC3NP CC3NE CC3P CC3E CC2NP CC2NE CC2P CC2E CC1NP CC1NE CC1P CC1E
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:14] | Reserved | RO | 保留。 | 0 |
| 13 | CC4P | RW | 比较捕获通道4输出极性设置位。 | 0 |
| 12 | CC4E | RW | 比较捕获通道4输出使能位。 | 0 |
| 11 | CC3NP | RW | 比较捕获通道3互补输出极性设置位。 | 0 |
| 10 | CC3NE | RW | 比较捕获通道3互补输出使能位。 | 0 |
| 9 | CC3P | RW | 比较捕获通道3输出极性设置位。 | 0 |
| 8 | CC3E | RW | 比较捕获通道3输出使能位。 | 0 |
| 7 | CC2NP | RW | 比较捕获通道2互补输出极性设置位。 | 0 |
| 6 | CC2NE | RW | 比较捕获通道2互补输出使能位。 | 0 |
| 5 | CC2P | RW | 比较捕获通道2输出极性设置位。 | 0 |
| 4 | CC2E | RW | 比较捕获通道2输出使能位。 | 0 |
| 3 | CC1NP | RW | 比较捕获通道1互补输出极性设置位。 | 0 |
| 2 | CC1NE | RW | 比较捕获通道1互补输出使能位。 | 0 |
| 1 | CC1P | RW | 比较捕获通道1输出极性设置位。 | 0 |
| 0 | CC1E | RW | 比较捕获通道1输出使能位。 | 0 |

#### 12.4.10 高级定时器的计数器（TIMx_CNT）（x=1/2）

偏移地址：0x24
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
CNT[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:0] | CNT[15:0] | RW | 定时器的计数器的实时值。 | 0 |

#### 12.4.11 计数时钟预分频器（TIMx_PSC）（x=1/2）

偏移地址：0x28
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
PSC[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:0] | PSC[15:0] | RW | 定时器的预分频器的分频系数，计数器的时钟频率<br>等于分频器的输入频率/(PSC+1)。 | 0 |

#### 12.4.12 自动重装值寄存器（TIMx_ATRLR）（x=1/2）

偏移地址：0x2C
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0

<a id="pdf-page-135"></a>
<!-- PDF page 135 -->

ARR[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:0] | ARR[15:0] | RW | 此域的值将会被装入计数器，ATRLR 何时动作和更<br>新见12.2.3章节；ATRLR为空时，计数器停止。 | 0xffff |

#### 12.4.13 重复计数值寄存器（TIMx_RPTCR）（x=1/2）

偏移地址：0x30
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved REP[7:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:8] | Reserved | RO | 保留。 | 0 |
| [7:0] | REP[7:0] | RW | 重复计数器的值。 | 0 |

#### 12.4.14 比较/捕获寄存器1（TIMx_CH1CVR）（x=1/2）

偏移地址：0x34
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved LEVEL1
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
CCR1[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:17] | Reserved | RO | 保留。 | 0 |
| 16 | LEVEL1 | RO | 捕获值对应的电平指示bit。 | 0 |
| [15:0] | CCR1[15:0] | RW | 比较捕获寄存器通道1的值。 | 0 |

#### 12.4.15 比较/捕获寄存器2（TIMx_CH2CVR）（x=1/2）

偏移地址：0x38
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved LEVEL2
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
CCR2[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:17] | Reserved | RO | 保留。 | 0 |
| 16 | LEVEL2 | RO | 捕获值对应的电平指示bit。 | 0 |
| [15:0] | CCR2[15:0] | RW | 比较捕获寄存器通道2的值。 | 0 |

#### 12.4.16 比较/捕获寄存器3（TIMx_CH3CVR）（x=1/2）

偏移地址：0x3C

<a id="pdf-page-136"></a>
<!-- PDF page 136 -->

31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
CCR3[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
CCR3[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | CCR3[31:0] | RW | 比较捕获寄存器通道3的值。 | 0 |

#### 12.4.17 比较/捕获寄存器4（TIMx_CH4CVR）（x=1/2）

偏移地址：0x40
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
CCR4[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
CCR4[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | CCR4[31:0] | RW | 比较捕获寄存器通道4的值。 | 0 |

#### 12.4.18 刹车和死区寄存器（TIMx_BDTR）（x=1/2）

偏移地址：0x44
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
MOE AOE BKP BKE OSSR OSSI LOCK[1:0] DTG[7:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 15 | MOE | RW | 主输出使能位。一旦刹车信号有效，将被异步清零。<br>1：允许OCx和OCxN设为输出；<br>0：禁止OCx和OCxN的输出或者强制为空闲状态。 | 0 |
| 14 | AOE | RW | 自动输出使能：<br>1：MOE可以被软件置位或者在下一个更新事件中被<br>置位；<br>0：MOE只能被软件置位。 | 0 |
| 13 | BKP | RW | 刹车输入极性设置位：<br>1：刹车输入高电平有效；<br>0：刹车输入低电平有效。<br>注：当设置了LOCK级别1后，该位不能被修改。对<br>该位的写需要一个HB时钟以后才能生效。 | 0 |
| 12 | BKE | RW | 刹车功能使能位：<br>1：开启刹车输入；<br>0：禁止刹车输入。<br>注：当设置了LOCK级别1后，该位不能被修改。对<br>该位的写需要一个HB时钟以后才能生效。 | 0 |


<a id="pdf-page-137"></a>
<!-- PDF page 137 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| 11 | OSSR | RW | 1：当定时器不工作时，一旦 CCxE=1 或 CCxNE=1，<br>首先开启OC/OCN并输出无效电平，然后置OCx、OCxN<br>使能输出信号=1；<br>0：当定时器不工作时，禁止OC/OCN输出。<br>注：当设置了LOCK级别1后，该位不能被修改。 | 0 |
| 10 | OSSI | RW | 1：当定时器不工作时，一旦 CCxE=1 或 CCxNE=1，<br>OC/OCN首先输出其空闲电平，然后OCx、OCxN使能<br>输出信号=1；<br>0：当定时器不工作时，禁止OC/OCN输出。<br>注：当设置了LOCK级别1后，该位不能被修改。 | 0 |
| [9:8] | LOCK[1:0] | RW | 锁定功能设置域：<br>00：关闭锁定功能；<br>01：锁定级别1，不能写DTG、BKE、BKP、AOE、OISx<br>和OISxN位；<br>10：锁定级别 2，不能写入锁定级别 1 中的各位，<br>也不能写入CC极性位以及OSSR和OSSI位；<br>11：锁定级别 3，不能写入锁定级别 2 中的各位，<br>也不能写入CC控制位。<br>注：在系统复位后，只能写一次LOCK位，无法再次<br>修改直到复位。 | 0 |
| [7:0] | DTG[7:0] | RW | 死区设置位，这些位定义了互补输出之间的死区持<br>续时间。<br>假设DT表示其持续时间：<br>DTG[7:5]=0xx=>DT=DTG[7:0]*Tdtg，Tdtg =TDTS；<br>DTG[7:5]=10x=>DT=(64+DTG[5:0])*Tdtg ， Tdtg=<br>2*TDTS；<br>DTG[7:5]=110=>DT=(32+DTG[4:0])*Tdtg，Tdtg =8<br>×TDTS；<br>DTG[7:5]=111=>DT=(32+DTG[4:0])*Tdtg，Tdtg =16<br>*TDTS。<br>注：一旦 LOCK 级别（TIMx_BDTR 寄存器中的<br>LOCK[1:0]位）设为01b、10b或11b，则不能修改<br>这些位。 | 0 |

#### 12.4.19 DMA控制寄存器（TIMx_DMACFGR）（x=1/2）

偏移地址：0x48
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved DBL[4:0] Reserved DBA[4:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:13] | Reserved | RO | 保留。 | 0 |
| [12:8] | DBL[4:0] | RW | DMA连续传送的长度，实际值为此域的值+1。 | 0 |
| [7:5] | Reserved | RO | 保留。 | 0 |
| [4:0] | DBA[4:0] | RW | 这些位定义了DMA在连续模式下从控制寄存器1所<br>在地址的偏移量。 | 0 |


<a id="pdf-page-138"></a>
<!-- PDF page 138 -->

#### 12.4.20 连续模式的DMA地址寄存器（TIMx_DMAADR）（x=1/2）

偏移地址：0x4C
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
DMAB[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:0] | DMAB[15:0] | RW | 连续模式下，DMA的地址。 | 0 |

#### 12.4.21 SPEC寄存器（TIMx_SPEC）（x=1/2）

偏移地址：0x50
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
SPEC_PWM SPEC_PWM SPEC_PWM SPEC_PWM PWM_EN
TOGGLE Reserved Reserved
_OC4 _OC3 _OC2 _OC1 [1:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 15 | TOGGLE | RO | 有效通道指示位：<br>1：当前通道输出的是无效电平；<br>0：当前通道输出的是有效电平。 | 0 |
| [14:8] | Reserved | RO | 保留。 | 0 |
| 7 | PWM_OC4 | RW | 交替使能模式下，通道4无效电平配置：<br>1：无效电平为高电平；<br>0：无效电平为低电平。 | 0 |
| 6 | PWM_OC3 | RW | 交替使能模式下，通道3无效电平配置：<br>1：无效电平为高电平；<br>0：无效电平为低电平。 | 0 |
| 5 | PWM_OC2 | RW | 交替使能模式下，通道2无效电平配置：<br>1：无效电平为高电平；<br>0：无效电平为低电平。 | 0 |
| 4 | PWM_OC1 | RW | 交替使能模式下，通道1无效电平配置：<br>1：无效电平为高电平；<br>0：无效电平为低电平。 | 0 |
| [3:2] | Reserved | RO | 保留。 | 0 |
| 1 | PWM_EN | RW | 通道3和通道4交替使能功能使能位：<br>1：开启交替使能功能；<br>0：关闭交替使能功能。 | 0 |
| 0 | PWM_EN | RW | 通道1和通道2交替使能功能使能位：<br>1：开启交替使能功能；<br>0：关闭交替使能功能。 | 0 |


<a id="pdf-page-139"></a>
<!-- PDF page 139 -->

## 第13章 通用定时器（GPTM）

通用定时器模块包含一个 16 位可自动重装的定时器（TIM3），用于测量脉冲宽度或者产生特定
频率的脉冲、PWM 波等。可用于自动化控制、电源等领域。
### 13.1 主要特征

通用定时器的主要特征包括：
- 16 位自动重装计数器，支持增计数模式
- 16 位预分频器，分频系数从 1～65536 之间动态可调
- 支持两路独立的比较捕获通道
- 每路比较捕获通道支持多种工作模式，比如：输入捕获、输出比较、PWM 生成和单脉冲输出
- 支持外部信号控制定时器
### 13.2 原理和结构

**图 13-1 通用定时器的结构框图**

Internalclock(CK_INT)
CK_TIMfromRCC
TRGO
Toothertimers
Trigger
controller
Reset,
Enable,
Up,Count
AutoReload
U Register
U
Stop,clearorup
U
CK_PSC PSC CK_CNT CNT
(prescaler) (counter)
#### 13.2.1 概述

如图 13-1 所示，通用定时器的结构大致可以分为三部分，即输入时钟部分，核心计数器部分和
比较捕获通道部分。
通用定时器的时钟可以来自于 HB 总线时钟（CK_INT），可以来自外部时钟输入引脚（TIMx_ETR），
可以来自于其他具有时钟输出功能的定时器（ITRx），还可以来自于比较捕获通道的输入端
（TIMx_CHx）。这些输入的时钟信号经过各种设定的滤波分频等操作后成为 CK_PSC 时钟，输出给核
心计数器部分。另外，这些复杂的时钟来源还可以作为 TRGO 输出给其他的定时器、ADC 等外设。
通用定时器的核心是一个 16 位计数器（CNT）。CK_PSC 经过预分频器（PSC）分频后，成为 CK_CNT
再最终输给 CNT，CNT 支持增计数模式、减计数模式和增减计数模式，并有一个自动重装值寄存器
（ATRLR）在每个计数周期结束后为 CNT 重装载初始化值。
通用定时器拥有四组比较捕获通道，每组比较捕获通道都可以从专属的引脚上输入脉冲，也可

<a id="pdf-page-140"></a>
<!-- PDF page 140 -->

以向引脚输出波形，即比较捕获通道支持输入和输出模式。比较捕获寄存器每个通道的输入都支持
滤波、分频、边沿检测等操作，并支持通道间的互触发，还能为核心计数器 CNT 提供时钟。每个比
较捕获通道都拥有一组比较捕获寄存器（CHxCVR），支持与主计数器（CNT）进行比较而输出脉冲。
#### 13.2.2 通用定时器和高级定时器的区别

与高级定时器相比，通用定时器缺少以下功能：
1） 通用定时器缺少对核心计数器的计数周期进行计数的重复计数寄存器。
2） 通用定时器的比较捕获通道缺少死区产生，没有互补输出。
3） 通用定时器没有刹车信号机制。
4） 通用定时器没有编码器模式。
#### 13.2.3 时钟输入

本节论述 CK_PSC 的来源。此处截取通用定时器的整体结构框图的时钟源部分。
**图 13-2 通用定时器 CK_PSC 来源框图**

TIMx_SMCR
TS[2:0]
ITRx
0xx
TI1_ED TI2F or
100 or
TI1FP1 TI1F or Encoder
101
TI2F_Rising mode
TI2 Edge 0 TI2FP2
Filter 110
detector 1
TI2F_Falling ETRF
111
TRGI External clock
ICF[3:0] CC2P mode 1
CK_PSC
TIMx_CCMR1 TIMx_CCER
ETRF External clock
mode 2
ETR
0
ETR pin Divider ETRP
Filter CK_INT Internal clock
/1,/2,/4,/8
1 f downcounter mode
DTS (internal clock)
ETP ETPS[1:0] ETF[3:0]
ECE SMS[2:0]
TIMx_SMCR TIMx_SMCR TIMx_SMCR TIMx_SMCR
可选的输入时钟可以分为 4 类：
1) 外部时钟引脚（ETR）输入的路线：ETR→ETRP→ETRF；
2) 内部 HB 时钟输入路线：CK_INT；
3) 来自比较捕获通道引脚（TIMx_CHx）的路线：TIMx_CHx→TIx→TIxFPx；
4) 来自内部其他定时器的输入：ITRx。
通过决定 CK_PSC 来源的 SMS 的输入脉冲选择可以将实际的操作分为三类：
1) 选择内部时钟源（CK_INT）；
2) 外部时钟源模式 1；
3) 外部时钟源模式 2。
上文提到的 3 种时钟源来源都可通过这 4 种操作选定。
##### 13.2.3.1 内部时钟源（CK_INT）

如果将 SMS 域保持为 000b 时启动通用定时器，那么就是选定内部时钟源（CK_INT）为时钟。此
时 CK_INT 就是 CK_PSC。
##### 13.2.3.2 外部时钟源模式1

如果将 SMS 域设置为 111b 时，就会启用外部时钟源模式 1。启用外部时钟源 1 时，TRGI 被选定

<a id="pdf-page-141"></a>
<!-- PDF page 141 -->

为 CK_PSC 的来源，值得注意的，用户还需要通过配置 TS 域来选择 TRGI 的来源。TS 域可选择以下
几种脉冲作为时钟来源：
1） 内部触发（ITRx，x 为 0,1,2,3）；
2） 比较捕获通道 1 经过边缘检测器后的信号（TI1F_ED）；
3） 比较捕获通道的信号 TI1FP1、TI2FP2；
4） 来自外部时钟引脚输入的信号 ETRF。
#### 13.2.4 计数器和周边

CK_PSC 输入给预分频器（PSC）进行分频。PSC 是 16 位的，实际的分频系数相当于 R16_TIMx_PSC
的值+1。CK_PSC 经过 PSC 会成为 CK_INT。更改 R16_TIM1_PSC 的值并不会实时生效，而会在更新事
件后更新给 PSC。更新事件包括 UG 位清零和复位。
#### 13.2.5 比较捕获通道

比较捕获通道是定时器实现复杂功能的核心，它的核心是比较捕获寄存器，辅以外围输入部分
的数字滤波，分频和通道间复用，输出部分的比较器和输出控制组成。比较捕获通道的结构框图如
**图 13-3 所示。**


<a id="pdf-page-142"></a>
<!-- PDF page 142 -->

**图 13-3 比较捕获通道的结构框图**

TI1F_ED
Totheslavemodecontroller
TI1 TI1F_Rising
TI1F 0 TI1FP1
Filter Edge
f TI1F_Falling 01
DTS downcounter detector 1
TI2FP1 IC1 Divider
10
/1,/2,/4,/8
ICF[3:0] CC1P/CC1NP
TRC
TIMx_CHCTLR1 TIMx_CCER 11
(fromslavemode
controller)
TI2F_Rising
0
(fromchannel2) CC1S[1:0] ICPS[1:0] CC1E
TI2F_Falling
1 TIMx_CHCTLR1 TIMx_CCER
(fromchannel2)
HB Bus
MCU-peripheralinterface
)tib-61
8 8
hgih wol Write CCR1H
S
Read CCR1H fi( write_in_progress
S
read_in_progress
Capture/comparepreloadregister Write CCR1L
Read CCR1L R
R
Output
CC1S[1]
capture_transfer compare_transfer mode
CC1S[0]
Input
CC1S[1]
mode OC1PE
CC1S[0] Capture/compareshadowregister OC1PE
UEV
TIMx_CHCTLR1
(fromtime
Capture Comparator
IC1PS baseunit)
CC1E
CC1G Counter
TIM1_SWEVGR
To the master mode
ETRF
controller
0 Output
OC1
enable
1 circuit
CNT>CCR1
Output
OC1REF
mode
CNT=CCR1
controller CC1P
TIM1_CCER
CC1E
OC1M[2:0] TIM1_CCER
TIMx_CHCTLR1
信号从通道 x 引脚输入进来后可选做为 TI（xTI1 的来源可以不只是 CH1，见定时器的框图 12-1），
TI1 经过滤波器（ICF[3:0]）生成 TI1F，再经过边沿检测器分成 TI1F_Rising 和 TI1F_Falling，这
两个信号经过选择（CC1P）生成 TI1FP1，TI1FP1 和来自通道 2 的 TI2FP1 一起送给 CC1S 选择成为
IC1，经过 ICPS 分频后送给比较捕获寄存器。
比较捕获寄存器由一个预装载寄存器和一个影子寄存器组成，读写过程仅操作预装载寄存器。
在捕获模式下，捕获发生在影子寄存器上，然后复制到预装载寄存器；在比较模式下，预装载寄存
器的内容被复制到影子寄存器中，然后影子寄存器的内容与核心计数器（CNT）进行比较。
### 13.3 功能和实现

通用定时器复杂功能的实现都是对定时器的比较捕获通道、时钟输入电路和计数器及周边组件
进行操作实现的。定时器的时钟输入可以来自于包括比较捕获通道的输入在内的多个时钟源。对比
较捕获寄存通道和时钟源选择的操作直接决定其功能。比较捕获通道是双向的，可以工作在输入和

<a id="pdf-page-143"></a>
<!-- PDF page 143 -->

输出模式。
#### 13.3.1 计数器模式

递增计数模式
在递增计数模式下，计数器从 0 计数到自动重载值（R16_TIMx_ATRLR 寄存器的内容），然后重
新从 0 开始计数并生成计数器上溢事件。
将 TIMx_SWEVGR 寄存器的 UG 位置 1（通过软件或使用从模式控制器）时，也将产生更新事件。
通过软件将 R16_TIMx_CTLR1 寄存器中的 UDIS 位置 1 可禁止 UEV 事件。这可避免向预装载寄存
器写入新值时更新影子寄存器。在 UDIS 位写入 0 之前不会产生任何更新事件。不过，计数器和预分
频器计数器都会重新从 0 开始计数（而预分频比保持不变）。此外，如果 R16_TIMx_CTLR1 寄存器中
的 URS 位（更新请求选择）已置 1，则将 UG 位置 1 会生成更新事件 UEV，但不会将 UIF 标志置 1（因
此，不会发送任何中断请求）。这样一来，如果在发生捕获事件时将计数器清零，将不会同时产生
更新中断和捕获中断。
发生更新事件时，将更新所有寄存器且将更新标志（R16_TIMx_INTFR 寄存器中的 UIF 位）置 1
（取决于 URS 位）：
1) 自动重载影子寄存器将以预装载值(R16_TIMx_ATRLR)进行更新
2) 预分频器的缓冲区中将重新装载预装载值（R16_TIMx_PSC 寄存器的内容）
#### 13.3.2 输入捕获模式

输入捕获模式是定时器的基本功能之一。输入捕获模式的原理是，当检测到 ICxPS 信号上确定
的边沿后，则产生捕获事件，计数器当前的值会被锁存到比较捕获寄存器（R16_TIMx_CHCTLRx）中。
发生捕获事件时，CCxIF（在 R16_TIMx_INTFR 中）被置位，如果使能了中断，还会产生相应中断。
如果发生捕获事件时，CCxIF 已经被置位了，那么 CCxOF 位会被置位。CCxIF 可由软件清除，也可以
通过读取比较捕获寄存器由硬件清除。CCxOF 由软件清除。
举个通道 1 的例子来说明使用输入捕获模式的步骤，如下：
1） 配置 CCxS 域，选择 ICx 信号的来源。比如设为 10b，选择 TI1FP1 作为 IC1 的来源，不可
以使用默认设置，CCxS 域默认是使比较捕获模块作为输出通道；
2） 配置 ICxF 域，设定 TI 信号的数字滤波器。数字滤波器会以确定的频率，采样确定的次数，
再输出一个跳变。这个采样频率和次数是通过 ICxF 来确定的；
3） 配置 CCxP 位，设定 TIxFPx 的极性。比如保持 CC1P 位为低，选择上升沿跳变；
4） 配置 ICxPS 域，设定 ICx 信号成为 ICxPS 之间的分频系数。比如保持 ICxPS 为 00b，不分
频；
5） 配置 CCxE 位，允许捕获核心计数器（CNT）的值到比较捕获寄存器中。置 CC1E 位；
6） 根据需要配置 CCxIE 位，决定是否允许使能中断。
至此已经将比较捕获通道配置完成。
当 TI1 输入了一个被捕获的脉冲时，核心计数器（CNT）的值会被记录到比较捕获寄存器中，CC1IF
被置位，当 CC1IF 在之前就已经被置位时，CCIOF 位也会被置位。如果 CC1IE 位，那么会产生一个
中断。可以通过写事件产生寄存器的方式（R16_TIMx_SWEVGR）的方式由软件产生一个输入捕获事件。
#### 13.3.3 比较输出模式

比较输出模式是定时器的基本功能之一。比较输出模式的原理是在核心计数器（CNT）的值与比
较捕获寄存器的值一致时，输出特定的变化或波形。OCxM 域（在 R16_TIMx_CHCTLRx 中）和 CCxP 位
（在 R16_TIMx_CCER 中）决定输出的是确定的高低电平还是电平翻转。产生比较一致事件时还会置
CCxIF 位，如果预先置了 CCxIE 位，则会产生一个中断。
配置为比较输出模式的步骤为下：
1） 配置核心计数器（CNT）的时钟源和自动重装值；

<a id="pdf-page-144"></a>
<!-- PDF page 144 -->

2） 设置好需要对比的计数值到比较捕获寄存器（R16_TIMx_CHxCVR）中；
3） 如果需要产生中断，置 CCxIE 位；
4） 保持 OCxPE 为 0，禁用比较捕获寄存器的预装载寄存器；
5） 设定输出模式，设置 OCxM 域和 CCxP 位；
6） 使能输出，置 CCxE 位；
7） 置 CEN 位启动定时器；
#### 13.3.4 强制输出模式

定时器的比较捕获通道的输出模式可以由软件强制输出确定的电平，而不依赖比较捕获寄存器
的影子寄存器和核心计数器的比较。
具体的做法是将 OCxM 置为 100b，即为强制将 OCxREF 置为低；或者将 OCxM 置为 101b，即为强
制将 OCxREF 置为高。
需要注意的是，将 OCxM 强制置为 100b 或者 101b，内部主计数器和比较捕获寄存器的比较过程
还在进行，相应的标志位还在置位，中断请求还在产生。
#### 13.3.5 PWM输入模式

PWM 输入模式是用来测量 PWM 的占空比和频率的，是输入捕获模式的一种特殊情况。除下列区
别外，操作和输入捕获模式相同：PWM 占用两个比较捕获通道，且两个通道的输入极性设为相反，
其中一个信号被设为触发输入，SMS 设为复位模式。
例如，测量从 TI1 输入的 PWM 波的周期和频率，需要进行以下操作：
1） 将 TI1(TI1FP1)设为 IC1 信号的输入。将 CC1S 置为 01b；
2） 将 TI1FP1 置为上升沿有效。将 CC1P 保持为 0；
3） 将 TI1(TI1FP2)置为 IC2 信号的输入。将 CC2S 置为 10b；
4） 选 TI1FP2 置为下降沿有效。将 CC2P 置为 1；
5） 时钟源的来源选择 TI1FP1。将 TS 设为 101b；
6） 将 SMS 设为复位模式，即 100b；
7） 使能输入捕获。CC1E 和 CC2E 置位。
注：因只有TI1FP1和TI2FP2连到了从模式控制器，所以PWM输入模式只能使用TIM3_CH1/TIM3_CH2。
#### 13.3.6 PWM输出模式

PWM 输出模式是定时器的基本功能之一。PWM 输出模式最常见的是使用重装值确定 PWM 频率，使
用捕获比较寄存器确定占空比的方法。将 OCxM 域中置 110b 或者 111b 使用 PWM 模式 1 或者模式 2，
置 OCxPE 位使能预装载寄存器，最后置 ARPE 位使能预装载寄存器的自动重装载。在发生一个更新事
件时，预装载寄存器的值才能被送到影子寄存器，所以在核心计数器开始计数之前，需要置 UG 位来
初始化所有寄存器。
#### 13.3.7 单脉冲模式

单脉冲模式可以响应一个特定的事件，在一个延迟之后产生一个脉冲，延迟和脉冲的宽度可编
程。置 OPM 位可以使核心计数器在产生下一个更新事件 UEV 时（计数器翻转到 0）停止。

<a id="pdf-page-145"></a>
<!-- PDF page 145 -->

**图 13-4 事件产生和脉冲响应**

retnuoC
如图 13-4 所示，需要在 TI2 输入引脚上检测到一个上升沿开始，延迟 Tdelay 之后，在 OC1 上
产生一个长度为 Tpulse 的正脉冲：
1） 设定 TI2 为触发。置 CC2S 域为 01b，把 TI2FP2 映射到 TI2；置 CC2P 位为 0b，TI2FP2 设为
上升沿检测；置 TS 域为 110b，TI2FP2 设为触发源；置 SMS 域为 110b，TI2FP2 被用来启动
计数器；
2） Tdelay 由比较捕获寄存器定义，Tpulse 由自动重装值寄存器的值和比较捕获寄存器的值确
定。
#### 13.3.8 TIMx定时器和外部触发的同步

定时器能够在复位模式、门控模式和触发模式下和一个外部触发同步。
从模式：复位模式
计数器及其预分频器可以响应触发输入事件而被重新初始化；如果 R16_TIMx_CTLR1 寄存器的
URS 位为低，则产生一个更新事件 UEV；然后更新所有的预装载寄存器(R16_TIMx_ATRLR，
R16_TIMx_CHxCVR)。
以下示例中，当 TI1 输入出现上升沿，向上计数器清零：
1) 配置通道 1 以检测 TI1 的上升沿。配置输入滤波器带宽(本例不需要任何滤波器，因此保持
IC1F=0000)。无需配置捕获分频器，因为其不用于触发操作。CC1S 位只选择输入捕获源，
即 CC1S=01（在 R16_TIMx_CCMR1 中）。将 CC1P=0 和 CC1NP='0'写入 R16_TIMx_CCER 寄存器
以验证极性(只检测上升沿)。
2) 将 SMS=100 写入 R16_TIMx_SMCFGR， 配置定时器为复位模式； 将 TS=101 写入
R16_TIMx_SMCFGR，选择 TI1 作为输入源。
3) 将 CEN=1 写入 R16_TIMx_CTLR1，启动计数器。
计数器使用内部时钟计数，然后正常运转，当出现一个 TI1 上升沿，计数器清零并从 0 开始重
新计数。同时，触发标志 TIF 位置 1，使能中断后，可以发送中断请求。（取决于 R16_TIMx_DMAINTENR
寄存器中 TIE(中断使能位）。
下图显示当自动重装载寄存器 R16_TIMx_ARR=0x36 时的动作。TI1 上升沿与实际计数器复位之
间的延时是 TI1 输入端的重新同步电路造成的。
**图 13-5 复位模式下的控制电路**


<a id="pdf-page-146"></a>
<!-- PDF page 146 -->

TI1
UG
计数器时钟=ck_cnt=ck_psc
计数器寄存器 30 31 32 33 34 35 36 00 01 02 03 00 01 02 03
TIF
从模式：门控模式
输入信号的电平使能计数器。以下的例子中，仅 TI1 为低时计数器向上计数：
1) 配置通道 1 以检测 TI1 上的低电平。配置输入滤波器带宽(本例不需要任何滤波器，因此保
持 IC1F=0000)。无需配置捕获分频器，因为其不用于触发操作。CC1S 位只选择输入捕获源，
即 CC1S=01（在 R16_TIMx_CCMR1 中）。将 CC1P=1 和 CC1NP='0'写入 R16_TIMx_CCER 寄存器
以验证极性(只检测低电平)。
2) 将 SMS=101 写入 R16_TIMx_SMCFGR， 配置定时器为门控模式； 将 TS=101 写入
R16_TIMx_SMCFGR，选择 TI1 作为输入源。
3) 将 CEN=1 写入 R16_TIMx_CTLR1，启动计数器。门控模式下，如果 CEN=0，无论触发输入电
平如何，计数器都不会启动。
只要 TI1 为低，计数器开始依据内部时钟计数，TI1 变高时停止计数。当计数器开始或停止时
都将 R16_TIMx_INTFR 中的 TIF 位置 1。TI1 上升沿与实际计数器复位之间的延时是 TI1 输入端的重
新同步电路造成的。
**图 13-6 门控模式下的控制电路**

TI1
cnt_en
计数器时钟=ck_cnt=ck_psc
计数器寄存器 30 31 32 33 35 36 37 38
TIF
写入TIF=0
从模式：触发模式
选择的输入端上发生事件时将使能计数器。以下示例中，当 TI2 输入出现上升沿，向上计数器
启动：
1) 配置通道 2 以检测 TI2 的上升沿。配置输入滤波器带宽(本例不需要任何滤波器，因此保持
IC2F=0000)。无需配置捕获分频器，因为其不用于触发操作。CC2S 位只选择输入捕获源，
置 CC2S=01（在 R16_TIMx_CCMR1 中）。将 CC2P=1 和 CC2NP=‘0’写入 R16_TIMx_CCER 寄存
器以验证极性（只检测低电平）
2) 将 SMS=110 写入 R16_TIMx_SMCFGR 寄存器，配置定时器为触发模式；将 TS=110 写入
R16_TIMx_SMCFGR 寄存器，选择 TI2 作为输入源。
当 TI2 出现上升沿，计数器开始在内部时钟驱动下计数，同时 TIF 置 1。
TI2 上升沿和实际计数器启动之间的延时，是由 TI2 输入端的重同步电路造成。
**图 13-7 触发模式下的控制电路**


<a id="pdf-page-147"></a>
<!-- PDF page 147 -->

TI2
cnt_en
计数器时钟=ck_cnt=ck_psc
计数器寄存器 34 35 36 37 38
TIF
#### 13.3.10 调试模式

当系统进入调试模式时，根据 DBG 模块的设置可以控制定时器继续运转或者停止。
### 13.4 寄存器描述

**表 13-1 TIM3 相关寄存器列表**

| 名称 | 偏移地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R16_TIM3_CTLR1 | 0x40000400 | TIM3控制寄存器1 | 0x0000 |
| R16_TIM3_SMCFGR | 0x40000408 | TIM3从模式控制寄存器 | 0x0000 |
| R16_TIM3_DMAINTENR | 0x4000040C | TIM3中断使能寄存器 | 0x0000 |
| R16_TIM3_INTFR | 0x40000410 | TIM3中断状态寄存器 | 0x0000 |
| R16_TIM3_SWEVGR | 0x40000414 | TIM3事件产生寄存器 | 0x0000 |
| R16_TIM3_CHCTLR1 | 0x40000418 | TIM3比较/捕获控制寄存器1 | 0x0000 |
| R16_TIM3_CCER | 0x40000420 | TIM3比较/捕获使能寄存器 | 0x0000 |
| R16_TIM3_CNT | 0x40000424 | TIM3计数器 | 0x0000 |
| R16_TIM3_PSC | 0x40000428 | TIM3计数时钟预分频器 | 0x0000 |
| R16_TIM3_ATRLR | 0x4000042C | TIM3自动重装值寄存器 | 0xFFFF |
| R32_TIM3_CH1CVR | 0x40000434 | TIM3比较/捕获寄存器1 | 0x00000000 |
| R32_TIM3_CH2CVR | 0x40000438 | TIM3比较/捕获寄存器2 | 0x00000000 |
| R16_TIM3_SPEC | 0x40000450 | SPEC寄存器 | 0x0000 |

#### 13.4.1 控制寄存器1（TIM3_CTLR1）

偏移地址：0x00
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
CAPLV
CAPOV Reserved CKD[1:0] ARPE Reserved OPM URS UDIS CEN
L
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 15 | CAPLVL | RW | 双沿捕获模式下，捕获电平指示使能：<br>1：使能指示功能；<br>0：关闭指示功能。<br>注：使能后，CHxCVR的bit[16]指示捕获值对应的<br>电平。 | 0 |
| 14 | CAPOV | RW | 捕获值模式配置：<br>1：当捕获前产生计数器溢出时，CHxCVR 值为<br>0xFFFF； | 0 |


<a id="pdf-page-148"></a>
<!-- PDF page 148 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 0：捕获值为实际计数器的值。 |  |
| [13:10] | Reserved | RO | 保留。 | 0 |
| [9:8] | CKD[1:0] | RW | 这2位定义在定时器时钟(CK_INT)频率、数字滤波<br>器所用的采样时钟之间的分频比例：<br>00：Tdts=Tck_int；<br>01：Tdts= 2xTck_int；<br>10：Tdts= 4xTck_int；<br>11：保留。 | 0 |
| 7 | ARPE | RW | 自动重装预装使能位：<br>1：使能自动重装值寄存器（ATRLR）；<br>0：禁止自动重装值寄存器（ATRLR）。 | 0 |
| [6:4] | Reserved | RO | 保留。 | 0 |
| 3 | OPM | RW | 单脉冲模式。<br>1：在发生下一次更新事件(清除CEN位)时，计数器<br>停止；<br>0：在发生下一次更新事件时，计数器不停止。 | 0 |
| 2 | URS | RW | 更新请求源，软件通过该位选择UEV事件的源。<br>1：如果使能了更新中断请求，则只有计数器溢出/<br>下溢才产生更新中断请求；<br>0：如果使能了更新中断请求，则下述任一事件产生<br>更新中断请求：<br>-计数器溢出/下溢<br>-设置UG位<br>-从模式控制器产生的更新 | 0 |
| 1 | UDIS | RW | 禁止更新，软件通过该位允许/禁止 UEV 事件的产<br>生。<br>1：禁止UEV。不产生更新事件，各寄存器(ATRLR、<br>PSC、CHCTLRx)保持它们的值。如果设置了UG位或<br>从模式控制器发出了一个硬件复位，则计数器和预<br>分频器被重新初始化。<br>0：允许UEV。更新(UEV)事件由下述任一事件产生<br>-计数器溢出/下溢<br>-设置UG位<br>-从模式控制器产生的更新<br>具有缓存的寄存器被装入它们的预装载值。 | 0 |
| 0 | CEN | RW | 使能计数器 (Counter enable)。<br>1：使能计数器；<br>0：禁止计数器。<br>注：在软件设置了CEN位后，外部时钟、门控模式<br>才能工作。触发模式可以自动地通过硬件设置CEN<br>位。 | 0 |

#### 13.4.2 从模式控制寄存器（TIM3_SMCFGR）

偏移地址：0x08
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0

<a id="pdf-page-149"></a>
<!-- PDF page 149 -->

Reserved TS[2:0] Reserved SMS[2:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:7] | Reserved | RO | 保留。 | 0 |
| [6:4] | TS[2:0] | RW | 触发选择域，这3位选择用于同步计数器的触发输<br>入源。<br>000：内部触发0(ITR0)；<br>001：内部触发1(ITR1)；<br>010：内部触发2(ITR2)；<br>011：内部触发3(ITR3)；<br>100：TI1的边沿检测器(TI1F_ED)；<br>101：滤波后的定时器输入1(TI1FP1)；<br>110：滤波后的定时器输入2(TI2FP2)；<br>111：外部触发输入(ETRF)；<br>以上只有在SMS为0时改变。 | 0 |
| 3 | Reserved | RO | 保留。 | 0 |
| [2:0] | SMS[2:0] | RW | 输入模式选择域。选择核心计数器的时钟和触发模<br>式。<br>000：由内部时钟CK_INT驱动；<br>001：保留；<br>010：保留；<br>011：保留；<br>100：复位模式，触发输入(TRGI)的上升沿将初始化<br>计数器，并且产生一个更新寄存器的信号；<br>101：门控模式，当触发输入(TRGI)为高时，计数器<br>的时钟开启；在触发输入变为低，计数器停止，计<br>数器的启停都是受控的；<br>110：触发模式，计数器在触发输入TRGI的上升沿<br>启动，只有计数器的启动是受控的；<br>111：外部时钟模式1，选中的触发输入(TRGI)的上<br>升沿驱动计数器。 | 0 |

#### 13.4.3中断使能寄存器（TIM3_DMAINTENR）

偏移地址：0x0C
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved TIE Reserved CC2IE CC1IE UIE
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:7] | Reserved | RO | 保留。 | 0 |
| 6 | TIE | RW | 触发中断使能位。<br>1：使能触发中断；<br>0：禁止触发中断。 | 0 |
| [5:3] | Reserved | RO | 保留。 | 0 |
| 2 | CC2IE | RW | 比较捕获通道2中断使能位。 | 0 |


<a id="pdf-page-150"></a>
<!-- PDF page 150 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 1：允许比较捕获通道2中断；<br>0：禁止比较捕获通道2中断。 |  |
| 1 | CC1IE | RW | 比较捕获通道1中断使能位。<br>1：允许比较捕获通道1中断；<br>0：禁止比较捕获通道1中断。 | 0 |
| 0 | UIE | RW | 更新中断使能位。<br>1：允许更新中断；<br>0：禁止更新中断。 | 0 |

#### 13.4.4 中断状态寄存器（TIM3_INTFR）

偏移地址：0x10
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved CC2OF CC1OF Reserved TIF Reserved CC2IF CC1IF UIF
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:11] | Reserved | RO | 保留。 | 0 |
| 10 | CC2OF | RW0 | 比较捕获通道2重复捕获标志位。 | 0 |
| 9 | CC1OF | RW0 | 比较捕获通道1重复捕获标志位，仅用于比较捕获<br>通道被配置为输入捕获模式时。该标记由硬件置<br>位，软件写0可清除此位。<br>1：计数器的值被捕获到捕获比较寄存器时，CC1IF<br>的状态已经被置位；<br>0：无重复捕获产生。 | 0 |
| [8:7] | Reserved | RO | 保留。 | 0 |
| 6 | TIF | RW0 | 触发器中断标志位，当发生触发事件时由硬件对该<br>位置位，由软件清零。触发事件包括从除门控模式<br>外的其它模式时，在TRGI输入端检测到有效边沿，<br>或门控模式下的任一边沿。<br>1：触发器事件产生；<br>0：无触发器事件产生。 | 0 |
| [5:3] | Reserved | RO | 保留。 | 0 |
| 2 | CC2IF | RW0 | 比较捕获通道2中断标志位。 | 0 |
| 1 | CC1IF | RW0 | 比较捕获通道1中断标志位。<br>如果比较捕获通道配置为输出模式，当计数器值与<br>比较值匹配时该位由硬件置位，但在中心对称模式<br>下除外。该位由软件清零。<br>1：核心计数器的值与比较捕获寄存器1的值匹配；<br>0：无匹配发生。<br>如果比较捕获通道1配置为输入模式，当捕获事件<br>发生时该位由硬件置位，它由软件清零或通过读比<br>较捕获寄存器清零。<br>1：计数器值已被捕获比较捕获寄存器1；<br>0：无输入捕获产生。 | 0 |
| 0 | UIF | RW0 | 更新中断标志位，当产生更新事件时该位由硬件置 | 0 |


<a id="pdf-page-151"></a>
<!-- PDF page 151 -->

位，由软件清零。
1：更新中断产生；
0：无更新事件产生。
以下情形会产生更新事件：
若 UDIS=0，当重复计数器数值上溢或下溢时；
若 URS=0、UDIS=0，当置 UG 位时，或当通过软件对
计数器核心计数器重新初始化时；
若 URS=0、UDIS=0，当计数器 CNT 被触发事件重新
初始化时；
#### 13.4.5 事件产生寄存器（TIM3_SWEVGR）

偏移地址：0x14
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved TG Reserved CC2G CC1G UG
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:7] | Reserved | RO | 保留。 | 0 |
| 6 | TG | WO | 触发事件产生位，该位由软件置位，硬件清零，用<br>于产生一个触发事件。<br>1：产生一个触发事件，TIF被置位，若使能对应的<br>中断，则产生相应的中断；<br>0：无动作。 | 0 |
| [5:3] | Reserved | RO | 保留。 | 0 |
| 2 | CC2G | WO | 比较捕获事件产生位2。产生比较捕获事件2。 | 0 |
| 1 | CC1G | WO | 比较捕获事件产生位1，产生比较捕获事件1。该位<br>由软件置位，由硬件清零。用于产生一个比较捕获<br>事件。<br>1：在比较捕获通道1上产生一个比较捕获事件：<br>若比较捕获通道1配置为输出：置CC1IF位。若使<br>能对应的中断，则产生相应的中断；<br>若比较捕获通道1配置为输入：当前核心计数器的<br>值被捕获至比较捕获寄存器 1；置 CC1IF 位，若使<br>能了对应的中断，则产生相应的中断。若CC1IF已<br>经置位，则置CC1OF位。<br>0：无动作。 | 0 |
| 0 | UG | WO | 更新事件产生位，产生更新事件。该位由软件置位，<br>由硬件自动清零。<br>1：初始化计数器，并产生一个更新事件；<br>0：无动作。<br>注：预分频器的计数器也被清零，但是预分频系数<br>不变。若在中心对称模式下或增计数模式下则核心<br>计数器被清零；若减计数模式下则核心计数器取重<br>装值寄存器的值。 | 0 |

#### 13.4.6 比较/捕获控制寄存器1（TIM3_CHCTLR1）


<a id="pdf-page-152"></a>
<!-- PDF page 152 -->

偏移地址：0x18
通道可用于输入(捕获模式)或输出(比较模式)，通道的方向由相应的 CCxS 位定义。该寄存器其
它位的作用在输入和输出模式下不同。OCxx 描述了通道在输出模式下的功能，ICxx 描述了通道在输
入模式下的功能。
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
OC2CE OC2M[2:0] OC2PE OC2FE OC1CE OC1M[2:0] OC1PE OC1FE
CC2S[1:0] CC1S[1:0]
IC2F[3:0] IC2PSC[1:0] IC1F[3:0] IC1PSC[1:0]
比较模式（引脚方向为输出）：
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 15 | OC2CE | RW | 比较捕获通道2清零使能位。<br>1：一旦检测到ETRF输入高电平，清除OC2REF位零；<br>0：OC2REF不受ETRF输入的影响。 | 0 |
| [14:12] | OC2M[2:0] | RW | 比较捕获通道2模式设置域。<br>该 3 位定义了输出参考信号 OC2REF 的动作，而<br>OC2REF决定了OC2、OC2N的值。OC2REF是高电平有<br>效，而OC2和OC2N的有效电平取决于CC2P、CC2NP<br>位。<br>000：冻结。比较捕获寄存器的值与核心计数器间的<br>比较值对OC2REF不起作用；<br>001：强制设为有效电平。当核心计数器与比较捕获<br>寄存器2的值相同时，强制OC2REF为高；<br>010：强制设为无效电平。当核心计数器的值与比较<br>捕获寄存器2相同时，强制OC2REF为低；<br>011：翻转。当核心计数器与比较捕获寄存器2的值<br>相同时，翻转OC2REF的电平。<br>100：强制为无效电平。强制OC2REF为低。<br>101：强制为有效电平。强制OC2REF为高。<br>110：PWM模式1：在向上计数时，一旦核心计数器<br>小于比较捕获寄存器的值时，通道2为有效电平，<br>否则为无效电平；在向下计数时，一旦核心计数器<br>大于比较捕获寄存器的值时，通道 2 为无效电平<br>(OC2REF=0)，否则为有效电平(OC2REF=1)；<br>111：PWM模式2：在向上计数时，一旦核心计数器<br>小于比较捕获寄存器的值时，通道2为无效电平，<br>否则为有效电平；在向下计数时，一旦核心计数器<br>大于比较捕获寄存器的值时，通道 2 为有效电平<br>(OC2REF=1)，否则为无效电平(OC2REF=0)。<br>注：一旦LOCK级别设为3并且CC2S=00b则该位不<br>能被修改。在PWM模式1或PWM模式2中，只有当<br>比较结果改变了或在输出比较模式中从冻结模式切<br>换到PWM模式时，OC2REF电平才改变。 | 0 |
| 11 | OC2PE | RW | 比较捕获寄存器2预装载使能位。<br>1：开启比较捕获寄存器2的预装载功能，读写操作 | 0 |


<a id="pdf-page-153"></a>
<!-- PDF page 153 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 仅对预装载寄存器操作，比较捕获寄存器2的预装<br>载值在更新事件到来时被加载至当前影子寄存器<br>中；<br>0：禁止比较捕获寄存器2的预装载功能，可随时写<br>入比较捕获寄存器 2，并且新写入的数值立即起作<br>用。<br>注：一旦LOCK级别设为3并且CC2S=00，则该位不<br>能被修改。仅仅在单脉冲模式下(OPM=1)可以在未确<br>认预装载寄存器情况下使用PWM模式，否则其动作<br>不确定。 |  |
| 10 | OC2FE | RW | 比较捕获通道2快速使能位，该位用于加快比较捕<br>获通道输出对触发输入事件的响应。<br>1：输入到触发器的有效沿的作用就像发生了一次比<br>较匹配。因此，OC被设置为比较电平而与比较结果<br>无关。采样触发器的有效沿和比较捕获通道2输出<br>间的延时被缩短为3个时钟周期；<br>0：根据计数器与比较捕获寄存器1的值，比较捕获<br>通道2正常操作，即使触发器是打开的。当触发器<br>的输入有一个有效沿时，激活比较捕获通道2输出<br>的最小延时为5个时钟周期。<br>OC2FE 只在通道被配置成PWM1 或 PWM2 模式时起作<br>用； | 0 |
| [9:8] | CC2S[1:0] | RW | 比较捕获通道2输入选择域。<br>00：比较捕获通道2被配置为输出；<br>01：比较捕获通道2被配置为输入，IC2映射在TI2<br>上；<br>10：比较捕获通道2被配置为输入，IC2映射在TI1<br>上；<br>11：比较捕获通道2被配置为输入，IC2映射在TRC<br>上。此模式仅工作在内部触发器输入被选中时(由<br>TS位选择)。<br>注：比较捕获通道2仅在通道关闭时(CC2E为零时)<br>才是可写的。 | 0 |
| 7 | OC1CE | RW | 比较捕获通道1清零使能位。 | 0 |
| [6:4] | OC1M[2:0] | RW | 比较捕获通道1模式设置域。 | 0 |
| 3 | OC1PE | RW | 比较捕获寄存器1预装载使能位。 | 0 |
| 2 | OC1FE | RW | 比较捕获通道1快速使能位。 | 0 |
| [1:0] | CC1S[1:0] | RW | 比较捕获通道1输入选择域。 | 0 |

捕获模式（引脚方向为输入）：
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:12] | IC2F[3:0] | RW | 输入捕获滤波器2配置域，这几位设置了TI1输入<br>的采样频率及数字滤波器长度。数字滤波器由一个<br>事件计数器组成，它记录到N个事件后会产生一个<br>输出的跳变。 | 0 |


<a id="pdf-page-154"></a>
<!-- PDF page 154 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 0000：无滤波器，以fDTS采样；<br>1000：采样频率Fsampling=Fdts/8，N=6；<br>0001：采样频率Fsampling=Fck_int，N=2；<br>1001：采样频率Fsampling=Fdts/8，N=8；<br>0010：采样频率Fsampling=Fck_int，N=4；<br>1010：采样频率Fsampling=Fdts/16，N=5；<br>0011：采样频率Fsampling=f=Fck_int，N=8；<br>1011：采样频率Fsampling=Fdts/16，N=6；<br>0100：采样频率Fsampling=Fdts/2，N=6；<br>1100：采样频率Fsampling=Fdts/16，N=8；<br>0101：采样频率Fsampling=Fdts/2，N=8；<br>1101：采样频率Fsampling=Fdts/32，N=5；<br>0110：采样频率Fsampling=Fdts/4，N=6；<br>1110：采样频率Fsampling=Fdts/32，N=6；<br>0111：采样频率Fsampling=Fdts/4，N=8；<br>1111：采样频率Fsampling=Fdts/32，N=8。 |  |
| [11:10] | IC2PSC[1:0] | RW | 比较捕获通道2预分频配置域，这2位定义了比较<br>捕获通道2的预分频系数。一旦CC1E=0，则预分频<br>器复位。<br>00：无预分频器，捕获输入口上检测到的每一个边<br>沿都触发一次捕获；<br>01：每2个事件触发一次捕获；<br>10：每4个事件触发一次捕获；<br>11：每8个事件触发一次捕获。 | 0 |
| [9:8] | CC2S[1:0] | RW | 比较捕获通道2输入选择域，这2位定义通道的方<br>向(输入/输出)，及输入脚的选择。<br>00：比较捕获通道1通道被配置为输出；<br>01：比较捕获通道 1 通道被配置为输入，IC1 映射<br>在TI1上；<br>10：比较捕获通道 1 通道被配置为输入，IC1 映射<br>在TI2上；<br>11：比较捕获通道 1 通道被配置为输入，IC1 映射<br>在TRC上。此模式仅工作在内部触发器输入被选中<br>时(由TS位选择)。<br>注：CC1S仅在通道关闭时(CC1E为0)才是可写的。 | 0 |
| [7:4] | IC1F[3:0] | RW | 输入捕获滤波器1配置域。 | 0 |
| [3:2] | IC1PSC[1:0] | RW | 比较捕获通道1预分频配置域。 | 0 |
| [1:0] | CC1S[1:0] | RW | 比较捕获通道1输入选择域。 | 0 |

#### 13.4.7 比较/捕获使能寄存器（TIM3_CCER）

偏移地址：0x20
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved CC2P CC2E Reserved CC1P CC1E
位名称访问描述复位值

<a id="pdf-page-155"></a>
<!-- PDF page 155 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| [15:6] | Reserved | RO | 保留。 | 0 |
| 5 | CC2P | RW | 比较捕获通道2输出极性设置位。 | 0 |
| 4 | CC2E | RW | 比较捕获通道2输出使能位。 | 0 |
| [3:2] | Reserved | RO | 保留。 | 0 |
| 1 | CC1P | RW | 比较捕获通道1输出极性设置位。 | 0 |
| 0 | CC1E | RW | 比较捕获通道1输出使能位。 | 0 |

#### 13.4.8 通用定时器的计数器（TIM3_CNT）

偏移地址：0x24
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
CNT[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:0] | CNT[15:0] | RW | 定时器的计数器的实时值。 | 0 |

#### 13.4.9 计数时钟预分频器（TIM3_PSC）

偏移地址：0x28
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
PSC[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:0] | PSC[15:0] | RW | 定时器的预分频器的分频系数；计数器的时钟频率<br>等于分频器的输入频率/(PSC+1)。 | 0 |

#### 13.4.10 自动重装值寄存器（TIM3_ATRLR）

偏移地址：0x2C
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
ARR[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:0] | ARR[15:0] | RW | ATRLR[15:0]的值将会被装入计数器，ATRLR何时动<br>作和更新请阅读13.2.4节；ATRLR为空时，计数器<br>停止。 | 0xFFFF |

#### 13.4.11 比较/捕获寄存器1（TIM3_CH1CVR）

偏移地址：0x34
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved LEVEL1
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
CCR1[15:0]

<a id="pdf-page-156"></a>
<!-- PDF page 156 -->

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:17] | Reserved | RO | 保留。 | 0 |
| 16 | LEVEL1 | RO | 捕获值对应的电平指示bit。 | 0 |
| [15:0] | CCR1[15:0] | RW | 比较捕获寄存器通道1的值。 | 0 |

#### 13.4.12 比较/捕获寄存器2（TIM3_CH2CVR）

偏移地址：0x38
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved LEVEL2
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
CCR2[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:17] | Reserved | RO | 保留。 | 0 |
| 16 | LEVEL2 | RO | 捕获值对应的电平指示bit。 | 0 |
| [15:0] | CCR2[15:0] | RW | 比较捕获寄存器通道2的值。 | 0 |

#### 13.4.13 SPEC寄存器（TIM3_SPEC）

偏移地址：0x50
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
TOGGLE Reserved PWM_OC2 PWM_OC1 Reserved PWM_EN
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 15 | TOGGLE | RO | 有效通道指示位：<br>1：当前通道输出的是无效电平；<br>0：当前通道输出的是有效电平。 | 0 |
| [14:6] | Reserved | RO | 保留。 | 0 |
| 5 | PWM_OC2 | RW | 交替使能模式下，通道2无效电平配置：<br>1：无效电平为高电平；<br>0：无效电平为低电平。 | 0 |
| 4 | PWM_OC1 | RW | 交替使能模式下，通道1无效电平配置：<br>1：无效电平为高电平；<br>0：无效电平为低电平。 | 0 |
| [3:1] | Reserved | RO | 保留。 | 0 |
| 0 | PWM_EN | RW | 通道1和通道2交替使能功能使能位：<br>1：开启交替使能功能；<br>0：关闭交替使能功能。 | 0 |


<a id="pdf-page-157"></a>
<!-- PDF page 157 -->

## 第14章 通用同步异步收发器（USART）

该模块包含 4 组通用同步异步收发器（USART1/2/3/4）。
### 14.1 主要特征

- 全双工或半双工的同步或异步通信
- NRZ 数据格式
- 分数波特率发生器，最高 3Mbps
- 可编程数据长度
- 可配置的停止位
- 支持 LIN，IrDA 编码器，智能卡
- 支持 DMA
- 多种中断源
### 14.2 概述

**图 14-1 通用同步/异步收发器的结构框图**

PWDATA PRDATA
Write Read
(CPUorDMA) (DATAREGISTER)DATAR (CPUorDMA)
TransmitDataRegister ReceiveDataRegister
TX
IrDA
SIR
RX TransmitShiftRegister ReceiveDataRegister
ENDEC
SW_RX BLOCK
(Connectwith
RXInternally) GPR
GT PSC CKCONTROL CK
CTLR3 CTLR2
DMATDMARSCENNACK HD IRLP IREN LINE STOP[1:0] CKEN CPOL CPHA LBCL
CTLR2 CTLR1
|  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- |
|  | WA | KEPCE |  | PS | PEIE |
|  |  |  |  |  |  |
|  |  |  |  |  |  |

USART
Hardware
flow
controller
RECEIVER
WWAAKKEE
RECEIVER CLOCK
TRANSMIT UUPP
CONTROL CONTROL
UUNNIITT
SR
TXEIE TCIE RXNE IDLE TE RE RWU SBK CTS LBD TXE TC RXNE IDLE ORE NE FE PE
IE IE
USART
INTERRUPT
CONTROL
USART_BRR
TE TRANSMITTERRATE
CONTROL
TRANSCLOCK
/16 /USARTDIV
DIV_Mantissa DIV_Fraction
f 15 4 0
HCLKx(x=1,2)
RECEIVERRATE
RE CONTROL
CONVENTIONALBAUDRATEGENERATOR
USARTDIV=DIV_Mantissa+(DIV_Fraction/16)
当 TE（发送使能位）置位时，发送移位寄存器里的数据在 TX 引脚上输出，时钟在 CK 引脚上输
出。在发送时，最先移出的是最低有效位，每个数据帧都由一个低电平的起始位开始，然后发送器

<a id="pdf-page-158"></a>
<!-- PDF page 158 -->

根据 M（字长）位上的设置发送八位或九位的数据字，最后是数目可配置的停止位。如果配有奇偶
检验位，数据字的最后一位为校验位。在 TE 置位后会发送一个空闲帧，空闲帧是 10 位或 11 位高电
平，包含停止位。断开帧是 10 位或 11 位低电平，后跟着停止位。
### 14.3 波特率发生器

收发器的波特率 = HCLK/(16*USARTDIV)，HCLK 是 HB 的时钟。USARTDIV 的值是根据 USART_BRR
中的 DIV_M 和 DIV_F 两个域决定的，具体计算的公式为：
USARTDIV = DIV_M+(DIV_F/16)
需要注意的是，波特率产生器产生的波特率不一定能刚好生成用户所需要的，这其中可能是存
在偏差。除了尽量取接近的值，减小偏差的方法还可以是增大 HB 的时钟。比如设定波特率为
115200bps 的时，USARTDIV 的值设为 39.0625，在最高频率时可以得到刚好 115200bps 的波特率，
但是如果你需要 921600bps 的波特率时，计算的 USARTDIV 是 4.88，但是实际上在 USART_BRR 里填
入的值最接近只能是 4.875，实际产生的波特率是 923076bps，误差达到 0.16%。
发送方发出的串口波形传到接收端时，接收方和发送方的波特率是有一定误差的。误差主要来
自三个方面：接收方和发送方实际的波特率不一致；接收方和发送方的时钟有误差；波形在线路中
产生的变化。外设模块的接收器是有一定接收容差能力的，当以上三个方面产生的总偏差之和小于
模块的容差能力极限时，这个总偏差不影响收发。模块的容差能力极限受是否采用分数波特率和 M
位（数据域字长）影响，采用分数波特率和使用 9 位数据域长度会使容差能力极限降低，但不低于
3%。
### 14.4 同步模式

同步模式使得系统在使用 USART 模块时可以输出时钟信号。在开启同步模式对外发送数据时，
CK 引脚会同时对外输出时钟。
开启同步模式的方式是对控制寄存器 2（R16_USARTx_CTLR2）的 CLKEN 位置位，但同时需要关
闭 LIN 模式、智能卡模式、红外模式和半双工模式，即保证 SCEN、HDSEL 和 IREN 位处于复位状态，
这三位在控制寄存器 3（R16_USARTx_CTLR3）中。
同步模式使用的要点在于时钟的输出控制。有以下几点需要注意：
USART 模块同步模式只工作在主模式，即 CK 引脚只输出时钟，不接收输入；
只在 TX 引脚输出数据时输出时钟信号；
LBCL 位决定在发送最后一位数据位时是否输出时钟，CPOL 位决定时钟的极性，CPHA 决定时钟
的相位，这三个位在控制寄存器 2（R16_USARTx_CTLR2）中，这三个位需要在 TE 和 RE 未被使能的
情况下设置，具体区别见图 14-2。
接收器在同步模式下只会在输出时钟时采样，需要从设备保持一定的信号建立时间和保持时间，
具体见图 14-3。

<a id="pdf-page-159"></a>
<!-- PDF page 159 -->

**图 14-2 USART 时钟时序示例(M=0)**

**图 14-3 数据采样保持时间**

CK (capture strobe on CK
rising edge in this example)
Data on RX
valid DATA bit
(from slave)
t t
SETUP HOLD
t = t 1/16 bit time
SETUP HOLD
### 14.5 单线半双工模式

半双工模式支持使用单个引脚（只使用 TX 引脚）来接收和发送，TX 引脚和 RX 引脚在芯片内部
连接。
开启半双工模式的方式是对控制寄存器 3（R16_USARTx_CTLR3）的 HDSEL 位置位，但同时需要
关闭 LIN 模式、智能卡模式、红外模式和同步模式，即保证 SCEN、CLKEN 和 IREN 位处于复位状态，
这三位在控制寄存器 2 和 3（R16_USARTx_CTLR2 和 R16_USARTx_CTLR3）中。
设置成半双工模式之后，需要把 TX 的 IO 口设置成输出模式外加上拉。在 TE 置位的情况下，只
要将数据写到数据寄存器上，就会发送出去。特别要注意的是，半双工模式可能会出现多设备使用
单总线收发时的总线冲突，这需要用户用软件自行避免。
### 14.6 智能卡

智能卡模式支持 ISO7816-3 协议访问智能卡控制器。
开启智能卡模式的方式是对控制寄存器 3（R16_USARTx_CTLR3）的 SCEN 位置位，但同时需要关

<a id="pdf-page-160"></a>
<!-- PDF page 160 -->

闭 LIN 模式、半双工模式和红外模式，即保证 LINEN、HDSEL 和 IREN 位处于复位状态，但是可以开
启 CLKEN 来输出时钟，这些位在控制寄存器 2 和 3（R16_USARTx_CTLR2 和 R16_USARTx_CTLR3）中。
为了支持智能卡模式，USART 应当被置为 8 位数据位外加 1 位校验位，它的停止位建议配置成
发送和接收都为 1.5 位，智能卡模式是一种单线半双工的协议，它使用 TX 线作为数据通讯，应当被
配置为输出外加上拉。当接收方接收一帧数据检测到奇偶校验错误时，会在停止位时，发出一个 NACK
信号，即在停止位期间主动把 TX 拉低一个周期，发送方检测到 NACK 信号后，会产生帧错误，应用
程序据此可以重发。图 14-4 展示了正确情况下和发生奇偶校验错误情况下的 TX 引脚上的波形图。
USART 的 TC 标志（发送完成标志）可以延迟 GT（保护时间）个时钟产生，接收方也不会将自己置的
NACK 信号认成起始位。
**图 14-4 (未)发生奇偶校验错误示意图**

在智能卡模式下，CK 引脚使能后输出的波形和通讯无关，它仅仅是给智能卡提供时钟的，它的
值是 HB 时钟再经过五位可设置的时钟分频（分频值为 PSC 的两倍，最高 62 分频）。
### 14.7 IrDA

USART 模块支持控制 IrDA 红外收发器进行物理层通信。使用 IrDA 必须清除 LINEN、STOP、CLKEN、
SCEN 和 HDSEL 位。USART 模块和 SIR 物理层（红外收发器）之间使用 NRZ（不归零）编码，最高支
持到 115200bps 速率。
IrDA 是一个半双工的协议，如果 USART 正在给 SIR 物理层发数据，那么 IrDA 解码器将会忽视
新发来的红外信号，如果 USART 正在接受从 SIR 发来的数据，那么 SIR 不会接受来自 USART 的信号。
USART 发给 SIR 和 SIR 发给 USART 的电平逻辑是不一样的，SIR 接收逻辑中，高电平为 1，低电平为
0，但是在 SIR 发送逻辑中，高电平为 0，低电平为 1。
### 14.8 DMA

USART 模块支持 DMA 功能，可以利用 DMA 实现快速连续收发。当启用 DMA 时，TXE 被置位时，DMA
就会从设定的内存空间向发送缓冲区写数据。当使用 DMA 接收时，每次 RXNE 置位后，DMA 就会将接
收缓冲区里的数据转移到特定的内存空间。
### 14.9 中断

USART 模块支持多种中断源，包括发送数据寄存器空（TXE）、CTS、发送完成（TC）、接收数
据就绪（RXNE）、数据溢出（ORE）、线路空闲（IDLE）、奇偶校验出错（PE）、断开标志（LBD）、
噪声（NE）、多缓冲通信的溢出（ORE）和帧错误（FE）等等。

<a id="pdf-page-161"></a>
<!-- PDF page 161 -->

**表 14-1 中断和对应的使能位的关系**

中断源使能位
数据寄存器空（TXE） TXEIE
允许发送（CTS） CTSIE
发送完成（TC） TCIE
接收数据就绪（RXNE）
RXNEIE
数据溢出（ORE）
线路空闲（IDLE） IDLEIE
奇偶校验出错（PE） PEIE
断开标志（LBD） LBDIE
噪声（NE）
多缓冲通信的溢出（ORE） EIE
多缓冲通信的帧错误（FE）
### 14.10 寄存器描述

**表 14-2 USART1 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R32_USART1_STATR | 0x40013800 | USART1状态寄存器 | 0x000000C0 |
| R32_USART1_DATAR | 0x40013804 | USART1数据寄存器 | 0x000000XX |
| R32_USART1_BRR | 0x40013808 | USART1波特率寄存器 | 0x00000000 |
| R32_USART1_CTLR1 | 0x4001380C | USART1控制寄存器1 | 0x00000000 |
| R32_USART1_CTLR2 | 0x40013810 | USART1控制寄存器2 | 0x00000000 |
| R32_USART1_CTLR3 | 0x40013814 | USART1控制寄存器3 | 0x00000000 |
| R32_USART1_GPR | 0x40013818 | USART1保护时间和预分频寄存器 | 0x00000000 |

**表 14-3 USART2 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R32_USART2_STATR | 0x40004400 | USART2状态寄存器 | 0x000000C0 |
| R32_USART2_DATAR | 0x40004404 | USART2数据寄存器 | 0x000000XX |
| R32_USART2_BRR | 0x40004408 | USART2波特率寄存器 | 0x00000000 |
| R32_USART2_CTLR1 | 0x4000440C | USART2控制寄存器1 | 0x00000000 |
| R32_USART2_CTLR2 | 0x40004410 | USART2控制寄存器2 | 0x00000000 |
| R32_USART2_CTLR3 | 0x40004414 | USART2控制寄存器3 | 0x00000000 |
| R32_USART2_GPR | 0x40004418 | USART2保护时间和预分频寄存器 | 0x00000000 |

**表 14-4 USART3 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R32_USART3_STATR | 0x40004800 | USART3状态寄存器 | 0x000000C0 |
| R32_USART3_DATAR | 0x40004804 | USART3数据寄存器 | 0x000000XX |
| R32_USART3_BRR | 0x40004808 | USART3波特率寄存器 | 0x00000000 |
| R32_USART3_CTLR1 | 0x4000480C | USART3控制寄存器1 | 0x00000000 |
| R32_USART3_CTLR2 | 0x40004810 | USART3控制寄存器2 | 0x00000000 |
| R32_USART3_CTLR3 | 0x40004814 | USART3控制寄存器3 | 0x00000000 |


<a id="pdf-page-162"></a>
<!-- PDF page 162 -->

R32_USART3_GPR 0x40004818 USART3 保护时间和预分频寄存器 0x00000000
**表 14-5 USART4 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R32_USART4_STATR | 0x40004C00 | USART4状态寄存器 | 0x000000C0 |
| R32_USART4_DATAR | 0x40004C04 | USART4数据寄存器 | 0x000000XX |
| R32_USART4_BRR | 0x40004C08 | USART4波特率寄存器 | 0x00000000 |
| R32_USART4_CTLR1 | 0x40004C0C | USART4控制寄存器1 | 0x00000000 |
| R32_USART4_CTLR2 | 0x40004C10 | USART4控制寄存器2 | 0x00000000 |
| R32_USART4_CTLR3 | 0x40004C14 | USART4控制寄存器3 | 0x00000000 |
| R32_USART4_GPR | 0x40004C18 | USART4保护时间和预分频寄存器 | 0x00000000 |

#### 14.10.1 USART状态寄存器（USARTx_STATR）（x=1/2/3/4）

偏移地址：0x00
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved CTS LBD TXE TC RXNE IDLE ORE NE FE PE
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:10] | Reserved | RO | 保留。 | 0 |
| 9 | CTS | RW0 | CTS 状态改变标志。如果设置了 CTSE 位，当<br>nCTS输出状态改变时，该位将由硬件置高。由<br>软件清零。如果CTSIE位已经被置位，则会产<br>生中断。<br>1：nCTS状态线上存在变化；<br>0：nCTS状态线上没有变化。 | 0 |
| 8 | LBD | RW0 | LIN Break检测标志。当检测到LIN Break时，<br>该位被硬件置位。由软件清零。如果LBDIE已<br>经被置位，则将会产生中断。<br>1：检测到LIN Break；<br>0：没有检测待LIN Break。 | 0 |
| 7 | TXE | RO | 发送数据寄存器空标志。当TDR寄存器中的的<br>数据被硬件转移到移位寄存器的时候，该位被<br>硬件置位。如果TXEIE已经被置位时，就会产<br>生中断，对数据寄存器进行写操作，此位将会<br>被复位。<br>1：数据已经被转移到移位寄存器；<br>0：数据还没被转移到移位寄存器。 | 1 |
| 6 | TC | RW0 | 发送完成标志。当含有数据的一帧发送完成<br>后，并且TXE被置位，则硬件将会此位置位，<br>如果 TCIE 被置位，还会产生对应中断，软件<br>读了此位再写数据寄存器则会清除此位。也可<br>以直接写0来清除此位。 | 1 |


<a id="pdf-page-163"></a>
<!-- PDF page 163 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 1：发送完成；<br>0：发送还未完成。 |  |
| 5 | RXNE | RW0 | 读数据寄存器非空标志，当移位寄存器中的数<br>据被转移到数据寄存器中，该位会被硬件置<br>位。如果 RXNEIE 已经被置位，则还会产生对<br>应的中断。对数据寄存器的读操作可以将该位<br>清除。也可以直接写0来清除该位。<br>1：数据收到，能够读出；<br>0：数据还没收到。 | 0 |
| 4 | IDLE | RO | 总线空闲标志。当总线空闲时，该位将会被硬<br>件置位。如果 IDLEIE 已经被置位，则会产生<br>对应的中断。读状态寄存器再读数据寄存器的<br>操作会清除此位。<br>1：总线正空闲；<br>0：没有检测到总线空闲。<br>注：此位不会被再次置位直到RXNE被置位。 | 0 |
| 3 | ORE | RO | 过载错误标志。当接收移位寄存器存在数据需<br>要转到数据寄存器时，但是数据寄存器的接收<br>域还有数据未读出时，此位将会被置位。如果<br>RXNEIE被置位了，还会产生对应中断。<br>1：发生过载错误；<br>0：没有过载错误。<br>注：发生过载错误时，数据寄存器的值不会丢<br>失，但是移位寄存器的值会被覆盖。如果设置<br>可EIE位，在多缓冲区通讯模式下，ORE标志<br>位置位会产生中断。 | 0 |
| 2 | NE | RO | 噪声错误标志。当检测到噪声错误标志时，由<br>硬件置位。读状态寄存器后，再读数据寄存器<br>的操作会复位此位。<br>1：检测到噪声；<br>0：没有检测到噪声。<br>注：该位不会产生中断。如果设置了EIE位，<br>在多缓冲区通讯模式下，FE标志位置位会产生<br>中断。 | 0 |
| 1 | FE | RO | 帧错误标志。当检测到同步错误，过多的噪声<br>或者断开符，该位将会被硬件置位。读此位再<br>读数据寄存器的操作会复位此位。<br>1：检测到帧错误；<br>0：没有检测到帧错误。<br>注：该位不会产生中断，如果设置了EIE位，<br>在多缓冲区通讯模式下，FE标志位置位会产生<br>中断。 | 0 |
| 0 | PE | RO | 校验错误标志。在接收模式下，如果产生奇偶<br>检验错误，硬件置位此位。读此位再读数据寄<br>存器的操作会复位此位。在清除此位前，软件<br>必须等RXNE标志位被置位。如果PEIE之前已 | 0 |


<a id="pdf-page-164"></a>
<!-- PDF page 164 -->

经被置位，那么此位被置位会产生对应的中
断。
1：出现奇偶校验错误；
0：没有检验错误。
#### 14.10.2 USART数据寄存器（USARTx_DATAR）（x=1/2/3/4）

偏移地址：0x04
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved DR[8:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:9] | Reserved | RO | 保留。 | 0 |
| [8:0] | DR[8:0] | RW | 数据寄存器。这个寄存器实际上是接收数据寄<br>存器（RDR）和发送寄存器（TDR）两个寄存器<br>组成，DR的读写操作起始分别是读接收寄存器<br>（RDR）和写发送寄存器（TDR）。 | X |

#### 14.10.3 USART波特率寄存器（USARTx_BRR）（x=1/2/3/4）

偏移地址：0x08
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
DIV_Mantissa[11:0] DIV_Fraction[3:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:16] | Reserved | RO | 保留。 | 0 |
| [15:4] | DIV_Mantissa<br>[11:0] | RW | 这12位定义了分频器除法因子的整数部分。 | 0 |
| [3:0] | DIV_Fraction[3:0] | RW | 这4位定义了分频器除法因子的小数部分。 | 0 |

#### 14.10.4 USART控制寄存器1（USARTx_CTLR1）（x=1/2/3/4）

偏移地址：0x0C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved UE M WAKE PCE PS PEIE TXEIE TCIE RXNEIE IDLEIE TE RE RWU SBK
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:14] | Reserved | RO | 保留。 | 0 |


<a id="pdf-page-165"></a>
<!-- PDF page 165 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| 13 | UE | RW | USART 使能位。当此位被清零后，在当前字节<br>传输完成后，USART 的分频器和输出都会停止<br>工作。 | 0 |
| 12 | M | RW | 字长位。<br>1：9个数据位； 0：8个数据位。 | 0 |
| 11 | WAKE | RW | 唤醒位。此位决定了把USART唤醒的方法：<br>1：地址标记； 0：总线空闲。 | 0 |
| 10 | PCE | RW | 校验位使能。对于接收方，就是进行对数据的<br>奇偶校验；对于发送方，就是插入校验位。一<br>旦设置了此位，只有当前字节传输完成后，校<br>验位使能才生效。 | 0 |
| 9 | PS | RW | 奇偶校验选择。0表示偶校验，1表示奇校验。<br>设置了该位后，只有当前字节传输完成后，校<br>验位使能才生效。 | 0 |
| 8 | PEIE | RW | 奇偶检验中断使能位。对此位置位表示允许产<br>生奇偶检验错误中断。 | 0 |
| 7 | TXEIE | RW | 发送缓冲区空中断使能。对此位置位表示允许<br>产生发送缓冲区空中断。 | 0 |
| 6 | TCIE | RW | 发送完成中断使能。对此位置位表示允许产生<br>发送完成中断。 | 0 |
| 5 | RXNEIE | RW | 接收缓冲区非空中断使能。对此位置位表示允<br>许产生接收缓冲区非空中断。 | 0 |
| 4 | IDLEIE | RW | 总线空闲中断使能。对此位置位表示允许产生<br>总线空闲中断。 | 0 |
| 3 | TE | RW | 发送使能。置此位会使能发送器。 | 0 |
| 2 | RE | RW | 接收使能。置此位会使能接收器，接收器开始<br>检测RX引脚上的起始位。 | 0 |
| 1 | RWU | RW | 接收唤醒。该位决定是否把USART置于静默模<br>式：<br>1：接收器处于静默模式；<br>0：接收器处于正常工作模式。<br>注1：置RWU位之前，USART需要先接收一个<br>数据字节，否则在静默模式下，不能被总线空<br>闲唤醒；<br>注2：当配置成地址标记唤醒时，在RXNE被置<br>位时，不能用软件修改RWU位。 | 0 |
| 0 | SBK | RW | 发送帧断开字符控制位。置此位来发送一个帧<br>断开字符。在断开帧的停止位时，由硬件复位。<br>1：发送； 0：不发送。 | 0 |

#### 14.10.5 USART控制寄存器2（USARTx_CTLR2）（x=1/2/3/4）

偏移地址：0x10
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0

<a id="pdf-page-166"></a>
<!-- PDF page 166 -->

Reser Reser Reser
LINEN STOP CLKEN CPOL CPHA LBCL LBDIE LBDL ADD[3:0]
ved ved ved
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:15] | Reserved | RO | 保留。 | 0 |
| 14 | LINEN | RW | LIN模式使能位，置位则使能LIN模式。在LIN<br>模式下，可以使用SBK位发送LIN同步断开符<br>号，以及检测LIN同步断开符。 | 0 |
| [13:12] | STOP[1:0] | RW | 停止位设置域。这两位来设置停止位。<br>00：1个停止位；<br>01：0.5个停止位；<br>10：2个停止位；<br>11：1.5个停止位。 | 0 |
| 11 | CLKEN | RW | 时钟使能，使能CK引脚。<br>1：使能；<br>0：禁止。 | 0 |
| 10 | CPOL | RW | 时钟极性设置位。在同步模式下，可以用该位<br>选择SLCK引脚上时钟输出的极性，和CPHA一<br>起配合来产生需要的时钟/数据的采样关系。<br>1：总线空闲时CK引脚上保持高电平；<br>0：总线空闲时CK引脚上保持低电平。<br>注：使能发送后此位不可被修改。 | 0 |
| 9 | CPHA | RW | 时钟相位设置位。在同步模式下，可以用该位<br>选择 SLCK 引脚上的时钟输出的相位，和 CPOL<br>位一起配合来产生需要的时钟/数据的采样关<br>系。<br>1：在时钟的第二个边沿进行数据捕获；<br>0：在时钟的第一个边沿进行数据捕获。<br>注：使能发送后此位不可被修改。 | 0 |
| 8 | LBCL | RW | 最后一个时钟脉冲控制位。<br>在同步模式下，使用该位来控制是否在 CK 引<br>脚上输出最后发送的那个数据字节对应的时<br>钟脉冲；<br>1：最后一位数据的时钟脉冲不从CK输出；<br>0：最后一位数据的时钟脉冲会从CK输出。<br>注：使能发送后此位不可被修改。 | 0 |
| 7 | Reserved | RW | 保留。 | 0 |
| 6 | LBDIE | RW | LIN Break检测中断使能，该位置位会使能LBD<br>引起的中断； | 0 |
| 5 | LBDL | RW | LIN Break检测长度，该位用来选择是11位还<br>是10位的断开符检测。<br>1：11位的断开符检测；<br>0：10位的断开符检测。 | 0 |
| 4 | Reserved | RW | 保留。 | 0 |
| [3:0] | ADD[3:0] | RW | 地址域，用来设置本设备的USART节点地址。 | 0 |


<a id="pdf-page-167"></a>
<!-- PDF page 167 -->

在多处理器通讯下的静默模式中使用的，使用
地址标记来唤醒某个 USART 设备。
#### 14.10.6 USART控制寄存器3（USARTx_CTLR3）（x=1/2/3/4）

偏移地址：0x14
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved CTSIE CTSE RTSE DMAT DMAR SCEN NACK HDSEL IRLP IREN EIE
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:11] | Reserved | RO | 保留。 | 0 |
| 10 | CTSIE | RW | CTSIE 中断使能位，置此位时在 CTS 被置位时<br>会产生中断。 | 0 |
| 9 | CTSE | RW | CTS使能位，置此位会使能CTS流控。 | 0 |
| 8 | RTSE | RW | RTS使能位，置此位会使能RTS流控。 | 0 |
| 7 | DMAT | RW | DMA发送使能位。此位置1在发送时使用DMA。 | 0 |
| 6 | DMAR | RW | DMA接收使能位。 此位置1在接收时使用DMA。 | 0 |
| 5 | SCEN | RW | 智能卡模式使能位，置1使能智能卡模式。 | 0 |
| 4 | NACK | RW | 智能卡 NACK 使能位，置此位在校验错误出现<br>时，发送NACK。 | 0 |
| 3 | HDSEL | RW | 半双工模式选择位，置此位选择半双工模式。 | 0 |
| 2 | IRLP | RW | 红外低功耗选择位，置此位在选择红外线时，<br>启用低功耗模式。 | 0 |
| 1 | IREN | RW | 红外线使能位，置此位使能红外模式。 | 0 |
| 0 | EIE | RW | 错误使能中断位，置此位后，在 DMAR 被置位<br>的前提下，如果 FE、ORE 或 NE 被置位，就会<br>产生中断。 | 0 |

#### 14.10.7 USART保护时间和预分频寄存器（USARTx_GPR）（x=1/2/3/4）

偏移地址：0x18
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
GT[7:0] PSC[7:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:16] | Reserved | RO | 保留。 | 0 |
| [15:8] | GT[7:0] | RW | 保护时间值域。该域规定了以波特率时钟为单<br>位的保护时间。在智能卡模式下，当保护时间<br>过去后，才会设置发送完成标志。 | 0 |
| [7:0] | PSC[7:0] | RW | 预分频器值域。 | 0 |


<a id="pdf-page-168"></a>
<!-- PDF page 168 -->

在红外低功耗模式下，源时钟被该值（全部 8
位有效）分频，值为 0 时表示保留；
在红外正常模式下，此位只能被设置为 1；
在智能卡模式下，源时钟被该值（低 5 位有效）
的两倍分频，来给智能卡提供时钟，值为 0 表
示保留。

<a id="pdf-page-169"></a>
<!-- PDF page 169 -->

## 第15章 两线通信总线（I2C）

内部集成电路总线（I2C 或 IIC）广泛用在微控制器和传感器及其他片外模块的通讯上，它本身
支持多主多从模式，仅仅使用两根线（SDA 和 SCL）就能以 100KHz（标准）和 400KHz（快速）两种
速度通讯。
### 15.1 主要特征

- 支持主机模式(Master）和从机模式(Slave)，支持多主多从。
- 支持两种速度模式：100KHz 和 400KHz，兼容 I2C 两线串行总线规范。
- 支持 7 位或 10 位地址。
- 从设备支持双 7 位地址。
- 支持总线广播。
- 支持总线仲裁、错误检测、PEC 校验、延长时钟。
### 15.2 概述

I2C 是半双工的总线，它同时只能运行在下列四种模式中之一：主设备发送模式、主设备接收
模式、从设备发送模式和从设备接收模式。I2C 模块默认工作在从模式，在产生起始条件后，会自
动地切换到主模式，当仲裁丢失或产生停止信号后，会切换到从模式。I2C 模块支持多主机功能。
工作在主模式时，I2C 模块会主动发出数据和地址。数据和地址都以 8 位为单位进行传输，高位在
前，低位在后，在起始事件后的是一个字节（7 位地址模式下）或两个字节（10 位地址模式下）地
址，主机每发送 8 位数据或地址，从机需要回复一个应答 ACK，即把 SDA 总线拉低，如图 15-1 所
示。
**图 15-1 I2C 时序图**

### 15.3 主模式

主模式时，I2C 模块主导数据传输并输出时钟信号，数据传输以开始事件开始，以结束事件结
束。使用主模式通讯的步骤为：
1) 在控制寄存器 2（R16_I2C1_CTLR2）和时钟控制寄存器（R16_I2C1_CKCFGR）中设置正确的
时钟；
2) 在控制寄存器（R16_I2C1_CTLR1）中置 PE 位启动外设；
3) 在控制寄存器（R16_I2C1_CTLR1）中置 START 位，产生起始事件。
在置START位后，I2C模块会自动切换到主模式，MSL位会置位，产生起始事件，在产生起始事
件后，SB 位会置位，如果 ITEVTEN 位（在 R16_I2C1_CTLR2）被置位，则会产生中断。此时应该读取

<a id="pdf-page-170"></a>
<!-- PDF page 170 -->

状态寄存器 1（R16_I2C1_STAR1），写从地址到数据寄存器后，SB 位会自动清除；
4）如果是使用 10 位地址模式，那么写数据寄存器发送头序列（头序列为 11110xx0b，其中的
xx 位是 10 位地址的最高两位）。
在发送完头序列之后，状态寄存器的 ADD10 位会被置位，如果 ITEVTEN 位已经置位，则会产生
中断，此时应读取R16_I2C1_STAR1寄存器后，写第二个地址字节到数据寄存器后，清除ADD10位。
然后写数据寄存器发送第二个地址字节，在发送完第二个地址字节后，状态寄存器的 ADDR 位
会被置位，如果ITEVTEN位已经置位，则会产生中断，此时应读取R16_I2C1_STAR1寄存器后再读一
次 R16_I2C1_STAR2 寄存器以清除 ADDR 位；
如果使用的是 7 位地址模式，那么写数据寄存器发送地址字节，在发送完地址字节后，状态寄
存器的 ADDR 位会被置位，如果 ITEVTEN 位已经置位，则会产生中断，此时应读取 R16_I2C1_STAR1
寄存器后再读一次 R16_I2C1_STAR2 寄存器以清除 ADDR 位；
在 7 位地址模式下，发送的第一个字节为地址字节，头 7 位代表的是目标从设备地址，第 8 位
决定了后续报文的方向，0 代表是主设备写入数据到从设备，1 代表是主设备向从设备读取信息。
在 10 位地址模式下，如图 15-3 所示，在发送地址阶段，第一个字节为 11110xx0，xx 为 10 位
地址的最高 2 位，第二个字节为 10 位地址的低 8 位。若后续进入主设备发送模式，则继续发送数
据；若后续准备进入主设备接收模式，则需要重新发送一个起始条件，跟随发送一个字节为
11110xx1，然后进入主设备接收模式。
**图 15-2 10 位地址时主机收发数据示意图**

Transmitter
S 1 11 1 0 X X 0 A Address 7- 0 A DATA A DATA A P
(The upper 2 bits (Write) The lower 8 bits of
of the address) the address
Receiver
S 1 11 1 0 X X 0 A Address 7- 0 A S 1 11 1 0 X X 1 A DATA A DATA A P
(The upper 2 bits (Write) The lower 8 bits of (Write)
ofthe address) the address
主发送模式：
主设备内部的移位寄存器将数据从数据寄存器发送到 SDA 线上，当主设备接收到 ACK 时，状态
寄存器 1（R16_I2C1_STAR1）的 TxE 被置位，如果 ITEVTEN 和 ITBUFEN 被置位，还会产生中断。向
数据寄存器写入数据将会清除 TxE 位。
如果TxE位被置位且上次发送数据之前没有新的数据被写入数据寄存器，那么BTF位会被置位,
在其被清除之前，SCL 将保持低电平，读 R16_I2C1_STAR1 后，向数据寄存器写入数据将会清除 BTF
位。

<a id="pdf-page-171"></a>
<!-- PDF page 171 -->

**图 15-3 主发送器传送序列图**

7位主发送
S 地址 A 数据1 A 数据2 A 数据N A P
……
EVT5 EVT6 EVT8_1 EVT8 EVT8 EVT8 EVT8_2
10位主发送
S 帧头 A 地址 A 数据1 A 数据N A P
……
EVT5 EVT9 EVT6 EVT8_1 EVT8 EVT8 EVT8_2
说明：S=Start(起始条件)，Sr=重复的起始条件，P=Stop（停止条件），A=响应，NA=非响应，EVTx=事件（ITEVFEN=1时产生中断）
EVT5：SB=1，读SR1然后将地址写入DR寄存器将清除该事件。
EVT6;ADDR=1,读SR1然后读SR2将消除该事件。
EVT8_1：TxE=1，移位寄存器空，数据寄存器空，写DR寄存器。
EVT8：TxE=1,移位寄存器非空，数据寄存器空，写入DR寄存器将清除该事件。
EVT8_2：TxE=1，BTF=1,请求设置停止位。TxE和BTF位由硬件在产生停止条件时清除。
EVT9：ADDR10=1，读SR1然后写入DR寄存器将清除该事件。
注：1：EVT5、EVT6、EVT9、EVT8_1和EVT8_2事件拉长SCL低的时间，直到对应的软件序列结束。
2：EVT8的软件序列必须在当前字节传输结束之前完成。
主接收模式
I2C 模块会从 SDA 线接收数据，通过移位寄存器写进数据寄存器。在每个字节之后，如果 ACK
位被置位，那么 I2C 模块将会发出一个应答低电平，同时 RxNE 位会被置位，如果 ITEVTEN 和
ITBUFEN 被置位，还会产生中断。如果 RxNE 被置位且在新的数据被接收前，原有的数据没有被读
出，则 BTF 位将被置位，在清除 BTF 之前，SCL 将保持低电平，读取 R16_I2C1_STAR1 后，再读取数
据寄存器将会清除 BTF 位。
**图 15-4 接收器传送序列图**

7位主接收
S 地址 A 数据1 A 数据2 A 数据N NA P
（1）
……
EVT5 EVT6 EVT6_1 EVT7 EVT7 EVT7_1 EVT7
10位主接收
S 帧头 A 地址 A
EVT5 EVT9 EVT6
Sr 帧头 A 数据1 A 数据2 A 数据N NA P
（1）
……
EVT5 EVT6 EVT6_1 EVT7 EVT7 EVT7_1 EVT7
说明：S=Start(起始条件)，Sr=重复的起始条件，P=Stop（停止条件），A=响应，NA=非响应，EVTx=事件（ITEVFEN=1时产生中断）
EVT5：SB=1，读SR1然后将地址写入DR寄存器将清除该事件。
EVT6：ADDR=1,读SR1然后读SR2将消除该事件。在10位主接收模式下，该事件后应设置CR2的START=1。
EVT6_1：没有对应的事件标志，只适于接收1个字节的情况。恰好在EVT6之后（即清除了ADDR之后），要清除响应和停止条件的产生位。
EVT7：RxNE=1，读DR寄存器清除该事件。
EVT7_1：RxNE=1，读DR寄存器清除该事件。设置ACK=0和STOP请求。
EVT9：ADDR10=1，读SR1然后写入DR寄存器将清除该事件。
主设备在结束发送数据时，会主动发一个结束事件，即置 STOP 位。在接收模式时，主设备需
要在最后一个数据位的应答位置 NAK。注意，产生 NAK 后，I2C 模块将会切换至从模式。
### 15.4 从模式

从模式时，I2C 模块能识别它自己的地址和广播呼叫地址。软件能控制开启或禁止广播呼叫地
址的识别。一旦检测到起始事件，I2C 模块将 SDA 的数据通过移位寄存器与自己的地址（位数取决
于 ENDUAL 和 ADDMODE）或广播地址（ENGC 置位时）相比较，如果不匹配将会忽略，直到产生新的起
始事件。如果与头序列相匹配，则会产生一个 ACK 信号并等待第二个字节的地址；如果第二字节的

<a id="pdf-page-172"></a>
<!-- PDF page 172 -->

地址也匹配或 7 位地址情况下全段地址匹配，那么：
首先产生一个 ACK 应答；
ADDR 位被置位，如果 ITEVTEN 位已经置位，那么还会产生相应的中断；
如果使用的是双地址模式（ENDUAL 位被置位），还需要读取 DUALF 位来判断主机唤起的是哪一
个地址。
从模式默认是接收模式，在接收的头序列的最后一位为 1，或 7 位地址最后一位为 1 时（取决
于第一次接收到头序列还是普通的 7 位地址），I2C 模块将进入到发送器模式，TRA 位将指示当前是
接收器还是发送器模式。
从发送模式
在清除 ADDR 位后，I2C 模块将字节从数据寄存器通过移位寄存器发送到 SDA 线上。在收到一个
应答 ACK 后，TxE 位将被置位，如果设置了 ITEVTEN 和 ITBUFEN，还会产生一个中断。如果 TxE 被置
位但在下一个数据发送结束前没有新的数据被写入数据寄存器时，BTF 位将被置位。在清除 BTF
前，SCL 将保持低电平，读取状态寄存器 1（R16_I2C1_STAR1）后，再向数据寄存器写入数据将会清
除 BTF 位。
**图 15-5 从发送器的传送序列图**

7位从发送
S 地址 A 数据1 A 数据2 A 数据N NA P
……
EVT1 EVT3_1 EVT3 EVT3 EVT3 EVT3_2
10位从发送
S 帧头 A 地址 A
EVT1
Sr 帧头 A 数据1 A 数据N NA P
……
EVT1 EVT3_1 EVT3 EVT3 EVT3_2
说明：S=Start(起始条件)，Sr=重复的起始条件，P=Stop（停止条件），A=响应，NA=非响应，EVTx=事件（ITEVFEN=1时产生中断）
EVT1;ADDR=1,读SR1然后读SR2将消除该事件。
EVT3_1：TxE=1，移位寄存器空，数据寄存器空，写DR。
EVT3：TxE=1,移位寄存器非空，数据寄存器空，写DR将清除该事件。
EVT3_2：AF=1，在SR1寄存器的AF位写’0’可清除AF位。
注：1：EVT1和EVT3_1事件拉长SCL低的时间，直到对应的软件序列结束。
2：EVT3的软件序列必须在当前字节传输结束之前完成。
从接收模式
在 ADDR 被清除后，I2C 模块将 SDA 上的数据通过移位寄存器存进数据寄存器，在每接收到一个
字节后，I2C 模块都会置一个 ACK 位，并置 RxNE 位，如果设置了 ITEVTEN 和 ITBUFEN，还会产生一
个中断。如果RxNE被置位，且在接收到新的数据前旧的数据没有被读出，那么BTF会被置位。在清
除 BTF 位之前 SCL 会保持低电平。读取状态寄存器 1（R16_I2C1_STAR1）并读取数据寄存器里的数
据会清除 BTF 位。

<a id="pdf-page-173"></a>
<!-- PDF page 173 -->

**图 15-6 从接收器的传送序列图**

7位从接收
S 地址 A 数据1 A 数据2 A 数据N A P
……
EVT1 EVT2 EVT2 EVT2 EVT4
10位从接收
S 帧头 A 地址 A 数据1 A 数据N A P
……
EVT1 EVT2 EVT2 EVT4
说明：S=Start(起始条件)，Sr=重复的起始条件，P=Stop（停止条件），A=响应，NA=非响应，EVTx=事件（ITEVFEN=1时产生中断）
EVT1;ADDR=1,读SR1然后读SR2将消除该事件。
EVT2：RxNE=1，读DR将清除该事件。
EVT4：STOPF=1,读SR1然后写CR1寄存器将清除该事件。
注：1：EVT1事件拉长SCL低的时间，直到对应的软件序列结束。
2：EVT2的软件序列必须在当前字节传输结束之前完成。
主设备在传输完最后一个数据字节后，将产生一个停止条件，当 I2C 模块检测到停止事件时，
将置 STOPF 位，如果设置了 ITEVFEN 位，还会产生一个中断。用户需要读取状态寄存器
（R16_I2C1_STAR1）再写控制寄存器（比如复位控制字 SWRST）来清除。
### 15.5 错误

#### 15.5.1 总线错误BERR

在传输地址或数据期间，I2C 模块检测到外部的起始或停止事件时，将产生一个总线错误。产
生总线错误时，BERR 位被置位，如果设置了 ITERREN 还会产生一个中断。在从模式下，数据被丢
弃，硬件释放总线。如果是起始信号，硬件会认为是重启信号，开始等待地址或停止信号；如果是
停止信号，则提前按正常的停止条件操作。在主模式下，硬件不会释放总线，同时不影响当前传
输，由用户代码决定是否中止传输。
#### 15.5.2 应答错误AF

当 I2C 模块检测到一个字节后没有应答时，会产生应答错误。产生应答错误时：AF 会被置位，
如果设置了 ITERREN 还会产生一个中断；遇到 AF 错误，如果 I2C 模块工作在从模式，硬件必须释放
总线，如果处于主模式，软件必须生成一个停止事件。
#### 15.5.3 仲裁丢失ARLO

当 I2C 模块检测到仲裁丢失时，产生仲裁丢失错误。产生仲裁丢失错误时：ARLO 位被置位，如
果设置了 ITERREN 还会产生一个中断；I2C 模块切换到从模式，并不再响应针对它的从地址发起的
传输，除非有主机发起新的起始事件；硬件会释放总线。
#### 15.5.4 过载/欠载错误OVR

- 过载错误：
在从机模式下，如果禁止时钟延长，I2C 模块正在接收数据，如果已经接受到一个字节的数据，
但是上一次接收到数据还没有被读出，则会产生过载错误。发生过载错误时，最后收到的字节将被
丢弃，发送方应当重发最后一次发送的字节。
- 欠载错误：
在从模式下，如果禁止时钟延长，I2C 模块正在发送数据，如果在下一个字节的时钟到来之前

<a id="pdf-page-174"></a>
<!-- PDF page 174 -->

新的数据还没有被写入到数据寄存器，那么将产生欠载错误。在发生欠载错误时，前一次数据寄存
器里的数据将被发送两次，如果发生欠载错误，那么接收方应该丢弃重复收到的数据。为了不产生
欠载错误，I2C 模块应当在下一个字节的第一个上升沿之前将数据写入数据寄存器。
### 15.6 时钟延长

如果禁止时钟延长，那么就存在发生过载/欠载错误的可能。但如果使能了时钟延长：
- 在发送模式下，如果 TxE 置位且 BTF 置位，SCL 将一直为低，一直等待用户读取状态寄存器，
并向数据寄存器写入待发送的数据；
- 在接收模式下，如果 RxNE 置位且 BTF 置位，那么 SCL 在接收到数据后将保持低，直到用户读取
状态寄存器，并读取数据寄存器；
由此可见，使能时钟延长可以避免出现过载/欠载错误。
### 15.7 中断

每个 I2C 模块都有两种中断向量，分别是事件中断和错误中断。两种中断支持图 15-4 的中断源。
**图 15-7 I2C 中断请求**

### 15.8 包校验错误

包错误校验(PEC)是为了提供传输的可靠性而增加一项 CRC8 校验的步骤，使用以下多项式对每
一位串行数据进行计算：
C=X8+X2+X+1
PEC 计算是由控制寄存器的 ENPEC 位激活，对所有信息字节进行计算，包括地址和读写位在内。
在发送时，启用 PEC 会在最后一字节数据之后加上一个字节的 CRC8 计算结果；而在接收模式，在最
后一字节被认为是 CRC8 校验结果，如果和内部的计算结果不符合，就会回复一个 NAK，如果是主接
收器，无论校验结果正确与否，都会回复一个 NAK。

<a id="pdf-page-175"></a>
<!-- PDF page 175 -->

### 15.9 寄存器描述

**表 15-1 I2C 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R16_I2C1_CTLR1 | 0x40005400 | I2C控制寄存器1 | 0x0000 |
| R16_I2C1_CTLR2 | 0x40005404 | I2C控制寄存器2 | 0x0000 |
| R16_I2C1_OADDR1 | 0x40005408 | I2C地址寄存器1 | 0x0000 |
| R16_I2C1_OADDR2 | 0x4000540C | I2C地址寄存器2 | 0x0000 |
| R16_I2C1_DATAR | 0x40005410 | I2C数据寄存器 | 0x0000 |
| R16_I2C1_STAR1 | 0x40005414 | I2C状态寄存器1 | 0x0000 |
| R16_I2C1_STAR2 | 0x40005418 | I2C状态寄存器2 | 0x0000 |
| R16_I2C1_CKCFGR | 0x4000541C | I2C时钟寄存器 | 0x0000 |

#### 15.9.1 I2C控制寄存器（I2C1_CTLR1）

偏移地址：0x00
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
NOSTR
SWRST Reserved PEC POS ACK STOP START ENGC ENPEC ENARP Reserved PE
ETCH
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 15 | SWRST | RW | 软件重置，用户代码置此位会使I2C外设重置。<br>在复位前确定I2C总线的引脚被释放，总线处<br>于空闲状态。<br>注：该位可以在总线上没有检测到停止条件但<br>是busy位为1时，重置I2C模块。 | 0 |
| [14:13] | Reserved | RO | 保留。 | 0 |
| 12 | PEC | RW | 数据包出错检测使能位，置此位启用数据包出<br>错检测。用户代码可以对此位置位或清零；当<br>PEC被传输后，产生开始或结束信号，或PE位<br>清0时，硬件清零该位；<br>1：带PEC；<br>0：不带PEC。<br>注：仲裁丢失时，PEC失效。 | 0 |
| 11 | POS | RW | ACK 和 PEC 位置设置位，该位可以被用户代码<br>置位或清零，在 PE 被清零后，可以被硬件清<br>除；<br>1：ACK位控制在移位寄存器里接收的下一个字<br>节的 ACK 或 NAK。PEC 移位寄存器里接收的下<br>一字节是PEC；<br>0：ACK位控制当前移位寄存器内正在接受的字<br>节的 ACK 或 NAK。PEC 位表明当位前移位寄存<br>器的字节是PEC。<br>注：POS位在2字节数据接收中的用法如下：<br>必须在接收之前配置好。为了NACK第2个字<br>节，必须在清除ADDR位后立刻清除ACK位； | 0 |


<a id="pdf-page-176"></a>
<!-- PDF page 176 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 为了检测第二个字节的PEC，必须在ADDR事件<br>发生后，配置POS位后设置PEC位。 |  |
| 10 | ACK | RW | 应答使能位，该位可以被用户代码置位或清<br>零，当PE位被置位时，该位可以被硬件清除；<br>1：在接收到一个字节后返回一个应答；<br>0：不设应答。 | 0 |
| 9 | STOP | RW | 停止事件产生位，该位可以被用户代码置位或<br>清零，或当检测到停止事件时，由硬件清除，<br>或检测到超时错误时，由硬件将其置位。<br>主模式下：<br>1：在当前字节传输或当前起始条件发出后产<br>生停止事件；<br>0：无停止事件产生。<br>从模式下：<br>1：在当前字节传输后释放SCL和SDA线；<br>0：无停止事件产生。 | 0 |
| 8 | START | RW | 起始事件产生位，该位可以被用户代码置位或<br>清零，当起始条件发出后或 PE 被清零时，由<br>硬件清零。<br>主模式下：<br>1：重复产生起始事件；<br>0：无起始事件产生。<br>从模式下：<br>1：当总线空闲时，产生起始事件；<br>0：无起始事件产生。 | 0 |
| 7 | NOSTRETCH | RW | 禁止时钟延长位，此位用于在 ADDR 或 BTF 标<br>志被置位的情况下，禁止从模式下的时钟延<br>长，直至被软件清零。<br>1：禁止时钟延长；<br>0：允许时钟延长。 | 0 |
| 6 | ENGC | RW | 广播呼叫使能位，置此位使能广播呼叫，应答<br>广播地址00h。 | 0 |
| 5 | ENPEC | RW | PEC使能位，置此位开启PEC计算。 | 0 |
| 4 | ENARP | RW | ARP使能位，置此位使能ARP。 | 0 |
| [3:1] | Reserved | RO | 保留。 | 0 |
| 0 | PE | RW | I2C外设使能位。<br>1：启用I2C模块；<br>0：禁用I2C模块。 | 0 |

#### 15.9.2 I2C控制寄存器2（I2C1_CTLR2）

偏移地址：0x04
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
ITBUF ITEVT ITERR
Reserved LAST DMAEN Reserved FREQ[5:0]
EN EN EN

<a id="pdf-page-177"></a>
<!-- PDF page 177 -->

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:13] | Reserved | RO | 保留。 | 0 |
| 12 | LAST | RW | DMA最后一次传输设置位。<br>1：下一次DMA的EOT是最后的传输；<br>0：下一次DMA的EOT不是最后的传输。<br>注：该位在主接收模式使用，可以在最后一次<br>接收数据时产生一个NAK。 | 0 |
| 11 | DMAEN | RW | DMA请求使能位，置此位在TxE或RxEN被置位<br>时允许DMA请求。 | 0 |
| 10 | ITBUFEN | RW | 缓冲器中断使能位。<br>1：当TxE或RxEN被置位时，产生事件中断；<br>0：当TxE或RxEN被置位时，不产生中断。 | 0 |
| 9 | ITEVTEN | RW | 事件中断使能位，置此位使能事件中断。<br>在下列条件下，将产生此中断：<br>SB=1(主模式)；<br>ADDR=1(主从模式)；<br>ADDR10=1（主模式）；<br>STOPF=1(从模式)；<br>BTF=1，但是没有TxE或RxEN事件；<br>如果ITBUFEN=1，TxE事件为1；<br>如果ITBUFEN=1，RxNE事件为1。 | 0 |
| 8 | ITERREN | RW | 出错中断使能位，置位表示允许出错中断。<br>在下列条件下，将产生该中断；<br>BERR=1；ARLO=1；AF=1；OVR=1；PECERR=1；<br>TIMEOUT=1；SMBAlert=1。 | 0 |
| [7:6] | Reserved | RO | 保留。 | 0 |
| [5:0] | FREQ[5:0] | RW | I2C 模块时钟频率域，必须输入正确的时钟频<br>率以产生正确的时序，允许的范围在 4-60MHz<br>之间。必须设置在000100b到111100b之间，<br>单位为MHz。 | 0 |

#### 15.9.3 I2C地址寄存器1（I2C1_OADDR1）

偏移地址：0x08
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
ADD
Reserved ADD[9:8] ADD[7:1] ADD0
MODE
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 15 | ADDMODE | RW | 地址模式。<br>1：10位从机地址（不响应7位地址）；<br>0：7位从机地址（不响应10位地址）。 | 0 |
| [14:10] | Reserved | RO | 保留。 | 0 |
| [9:8] | ADD[9:8] | RW | 接口地址，在使用 10 位地址时为第 9-8 位，<br>在使用7位地址时忽略。 | 0 |
| [7:1] | ADD[7:1] | RW | 接口地址，第7-1位。 | 0 |


<a id="pdf-page-178"></a>
<!-- PDF page 178 -->

接口地址，使用 10 位地址时为第 0 位，在使
0 ADD0 RW 0
用 7 位地址时忽略。
#### 15.9.4 I2C地址寄存器2（I2C1_OADDR2）

偏移地址：0x0C
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved ADD2[7:1] ENDUAL
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:8] | Reserved | RO | 保留。 | 0 |
| [7:1] | ADD2[7:1] | RW | 接口地址，双地址模式下地址的7-1位。 | 0 |
| 0 | ENDUAL | RW | 双地址模式使能位，置此位可以让 ADD2 也能<br>被识别。 | 0 |

#### 15.9.5 I2C数据寄存器（I2C1_DATAR）

偏移地址：0x10
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved DR[7:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:8] | Reserved | RO | 保留。 | 0 |
| [7:0] | DR[7:0] | RW | 数据寄存器，该域用来存放接收到的数据或存<br>放用于发送到总线的数据。 | 0 |

#### 15.9.6 I2C状态寄存器1（I2C1_STAR1）

偏移地址：0x14
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
PECER Reser
Reserved OVR AF ARLO BERR TxE RxNE STOPF ADD10 BTF ADDR SB
R ved
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:13] | Reserved | RO | 保留。 | 0 |
| 12 | PECERR | RW0 | 在接收时发生PEC错误标志位，该位可以由用<br>户写0复位，或在PE变低时由硬件复位。<br>1：有PEC错误，接收到PEC后，返回NAK；<br>0：无PEC错误。 | 0 |
| 11 | OVR | RW0 | 过载、欠载标志位。<br>1：有过载、欠载事件发生:当NOSTRETCH=1时，<br>在接收模式中收到一个新的字节时，数据寄存<br>器里的内容还未被读出，则新接收的字节将丢<br>失；在发送模式时，没有新的数据写入数据寄<br>存器，同样的字节将被发送两次；<br>0：无过载、欠载事件。 | 0 |


<a id="pdf-page-179"></a>
<!-- PDF page 179 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| 10 | AF | RW0 | 应答失败标志位，该位可以由用户写0复位，<br>或在PE变低时由硬件复位。<br>1：应答错误；<br>0：应答正常。 | 0 |
| 9 | ARLO | RW0 | 仲裁丢失标志位，该位可以由用户写0复位，<br>或在PE变低时由硬件复位。<br>1：检测到仲裁丢失，模块失去对总线的控制；<br>0：仲裁正常。 | 0 |
| 8 | BERR | RW0 | 总线出错标志位，该位可以由用户写0复位，<br>或在PE变低时由硬件复位。<br>1：起始或停止条件出错；<br>0：正常。 | 0 |
| 7 | TxE | RO | 数据寄存器为空标志位，向数据寄存器写数据<br>可以清除，或产生一个起始或停止位后，或当<br>PE为0后，由硬件自动清除。<br>1：发送数据时，发送数据寄存器为空；<br>0：数据寄存器非空。 | 0 |
| 6 | RxNE | RO | 数据寄存器非空标志位，对数据寄存器的读写<br>操作将清除此位，或当 PE 为 0 后，由硬件清<br>除此位。<br>1：接收数据时，数据寄存器不为空；<br>0：正常。 | 0 |
| 5 | Reserved | RO | 保留。 | 0 |
| 4 | STOPF | RO | 停止事件标志位，用户读取状态寄存器1之后，<br>对控制寄存器1的写操作将会清除该位，或当<br>PE为0后，由硬件清除此位。<br>1：在应答之后，从设备在总线上检测到停止<br>事件；<br>0：没有检测到停止事件。 | 0 |
| 3 | ADD10 | RO | 10位地址头序列发送标志位，用户读取状态寄<br>存器1之后，对控制寄存器1的写操作将会清<br>除该位，或当PE为0后，由硬件清除此位。<br>1：在10位地址模式下，主设备已经将第一个<br>地址字节发送出去；<br>0：无。 | 0 |
| 2 | BTF | RO | 字节发送结束标志位，用户读取状态寄存器 1<br>后，对数据寄存器的读写将清除此位；在传输<br>中，发起一个起始或者停止事件后，或当 PE<br>为0后，由硬件清除此位。<br>1：字节发送结束。当 NOSTRETCH=0 时：发送<br>时，当一个新数据被发送且数据寄存器还未被<br>写入新数据；接收时，当接收一个新的字节但<br>是数据寄存器还未被读取；<br>0：无。 | 0 |
| 1 | ADDR | RW0 | 地址被发送/地址匹配标志位，用户读取状态<br>寄存器1后，对状态寄存器2的读操作将会清 | 0 |


<a id="pdf-page-180"></a>
<!-- PDF page 180 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 除此位，或当PE为0时，由硬件清除此位。<br>主模式：<br>1：地址发送结束：在10位地址模式下，当收<br>到地址的第二个字节的ACK后改为被置位；在<br>7位地址模式下，当收到地址的ACK后被置位；<br>0：地址发送没有结束。<br>从模式：<br>1：收到的地址匹配；<br>0：地址不匹配或没有收到地址。 |  |
| 0 | SB | RO | 起始位发送标志位，读取状态寄存器1后写数<br>据寄存器的操作将清除该位，或当PE为0时，<br>硬件将会清除此位。<br>1：已发送起始位；<br>0：未发送起始位。 | 0 |

#### 15.9.7 I2C状态寄存器2（I2C1_STAR2）

偏移地址：0x18
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
GENCA Reser
PEC[7:0] DUALF Reserved TRA BUSY MSL
LL ved
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:8] | PEC[7:0] | RO | 包错误检查域，当PEC使能时（ENPEC置位），<br>此域存放PEC的值。 | 0 |
| 7 | DUALF | RO | 匹配检测标志位，在产生停止位或起始位时，<br>或在PE=0时，硬件会将该位清零。<br>1：接收到的地址与OAR2中的内容相符；<br>0：接收到的地址与OAR1中的内容相符。 | 0 |
| [6:5] | Reserved | RO | 保留。 | 0 |
| 4 | GENCALL | RO | 广播呼叫地址标志位，在产生停止位或起始位<br>时，或者在PE=0时，硬件会将该位清零。<br>1：当ENGC=1时，收到广播呼叫的地址；<br>0：未收到广播呼叫地址。 | 0 |
| 3 | Reserved | RO | 保留。 | 0 |
| 2 | TRA | RO | 发送/接收标志位，在检测到停止事件<br>（STOPF=1），重复的起始条件、总线仲裁丢<br>失（ARLO=1）或PE=0时，硬件会将其清零。<br>1：数据已发送；<br>0：接收到数据。<br>该位根据地址字节的RW位来决定。 | 0 |
| 1 | BUSY | RO | 总线忙标志位，该位在检测到一个停止位时会<br>被清零。在接口被禁用时（PE=0），该信息仍<br>被更新。<br>1：总线忙：SDA或SCL存在低电平；<br>0：总线空闲无通讯。 | 0 |


<a id="pdf-page-181"></a>
<!-- PDF page 181 -->

主从模式指示位， 当接口处于主模式时
（SB=1），硬件将该位置位；当总线检测到一
0 MSL RO 0
个停止位，仲裁丢失时，或 PE=0 时，硬件会
清除该位。
#### 16.9.8 I2C时钟寄存器（I2C1_CKCFGR）

偏移地址：0x1C
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
F/S DUTY Reserved CCR[11:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 15 | F/S | RW | 主模式选择位：<br>1：快速模式；<br>0：标准模式。 | 0 |
| 14 | DUTY | RW | 快速模式时的占空比：<br>1：T /T = 16/9；<br>低电平 高电平<br>0：T /T = 2。<br>低电平 高电平 | 0 |
| [13:12] | Reserved | RO | 保留。 | 0 |
| [11:0] | CCR[11:0] | RW | 时钟分频系数域，决定SCL时钟的频率波形。 | 0 |


<a id="pdf-page-182"></a>
<!-- PDF page 182 -->

## 第16章 串行外设接口（SPI）

SPI 支持以三线同步串行模式进行数据交互，加上片选线支持硬件切换主从模式，支持以单根
数据线通讯。
### 16.1 主要特征

#### 16.1.1 SPI特征

- 支持全双工同步串行模式
- 支持单线半双工模式
- 支持主模式和从模式，多从模式
- 支持 8 位或 16 位数据结构
- 最高时钟频率支持到 F 的一半
HCLK
- 数据顺序支持 MSB 或 LSB 在前
- 支持硬件或软件控制 NSS 引脚
- 收发支持硬件 CRC 校验
- 收发缓冲器支持 DMA 传输
- 支持修改时钟相位和极性
### 16.2 SPI功能描述

#### 16.2.1 概述

**图 16-1 SPI 结构框图**

Addressanddatabus
Read
Rxbuffer
SPI_CTLR2
MOSI
TXE RXNE ERR TXDMRXDM
0 0 SSOE
IE IE IE AEN AEN
Shiftregister
MISO
LSBfirst SPI_CTATR
MOD CRC
Txbuffer BSY OVR 0 0 TXE RXNE
F ERR
Write
0
Communication
control
1
SCK BR[2:0]
Baudrategenerator
LSB
SPE BR2 BR1 BR0 MSTR CPOL CPHA
FIRST
SPI_CTLR1
Mastercontrollogic BIDI BIDI CRC CRC RX
DFF SSM SSI
MODE OE EN Next ONLY
NSS
由图 16-1 可以看出，与 SPI 相关的主要是 MISO、M0SI、SCK 和 NSS 四个引脚。其中 MISO 引脚
在 SPI 模块工作在主模式下时，是数据输入引脚；工作在从模式下时，是数据输出引脚。MOSI 引脚
工作在主模式下时，是数据输出引脚；工作在从模式时，是数据输入引脚。SCK 是时钟引脚，时钟

<a id="pdf-page-183"></a>
<!-- PDF page 183 -->

信号一直由主机输出，从机接收时钟信号并同步数据收发。NSS 引脚是片选引脚，有以下用法：
1） NSS 由软件控制：此时 SSM 被置位，内部 NSS 信号由 SSI 决定输出高还是低，这种情况一般用
于 SPI 主模式；
2） NSS 由硬件控制：在 NSS 输出使能时，即 SSOE 置位时，在 SPI 主机向外发送输出时会主动拉低
NSS 引脚，如果不能成功拉低 NSS 脚，说明主线上有其他主设备正在通信，则会产生一个硬件
错误；SSOE 不置位，则可以用于多主机模式，如果它被拉低则会强行进入从机模式，MSTR 位会
被自动清除。
可以通过 CPHA 和 CPOL 配置 SPI 的工作模式。CPHA 置位表示模块在时钟的第二个边沿进行数据
采样，数据被锁存，CPHA 不置位表示 SPI 模块在时钟的第一个边沿进行采样，数据被锁存。CPOL
则表示无数据时时钟保持高电平还是低电平。
主机和设备需要设置为相同的 SPI 模式，在配置 SPI 模式前，需要清除 SPE 位。DEF 位可以决
定 SP 的单个数据长度是 8 位还是 16 位。LSBFIRST 可以控制单个数据字是高位在前还是低位在前。
**表 16-1 SPI 模式区分**

模式 0 模式 1 模式 2 模式 3
CPOL 0 1 1 1
CPHA 0 0 0 1
#### 16.2.2 主模式

在 SPI 模块工作在主模式时，由 SCK 产生串行时钟。配置成主模式进行以下步骤：
配置控制寄存器的 BR[2:0]域来确定时钟；
配置 CPOL 和 CPHA 位来确定 SPI 模式；
配置 DEF 确定数据字长；
配置 LSBFIRST 确定帧格式；
配置 NSS 引脚，比如置 SSOE 位让硬件去置 NSS。也可以置 SSM 位并把 SSI 位置高；
置 MSTR 位和 SPE 位，需要保证 NSS 此时已经是高。
需要发送数据时只需要向数据寄存器写要发送的数据就行了。SPI 会从发送缓冲区并行地把数
据送到移位寄存器，然后按照 LSBFIRST 的设置将数据从移位寄存器发出去，当数据已经到了移位寄
存器时，TXE 标志会被置位，如果已经置位了 TXEIE，那么会产生中断。如果 TXE 标志位置位需要向
数据寄存器里填数据，维持完整的数据流。
当接收器接收数据时，当数据字的最后一个采样时钟沿到来时，数据从移位寄存器并行地转移
到接收缓冲区，RXNE 位被置位，如果之前置位了 RXNEIE 位，还会产生中断。此时应该尽快读取数
据寄存器取走数据。

<a id="pdf-page-184"></a>
<!-- PDF page 184 -->

**图 16-2 SPI 主模式读写模式 0**

MODE 0
CPHA=0
CPOL=0
MOSI MSBit LSBit
MISO MSBit LSBit
NSS
(to slave)
Capturestrobe
**图 16-3 SPI 主模式读写模式 1**

MODE 1
CPHA=0
CPOL=1
MOSI MSBit LSBit
MISO MSBit LSBit
NSS
(to slave)
Capturestrobe

<a id="pdf-page-185"></a>
<!-- PDF page 185 -->

**图 16-4 SPI 主模式读写模式 2**

MODE 2
CPHA=1
CCPPOOLL==00
MOSI MSBit LSBit
MISO MSBit LSBit
NSS
(to slave)
Capturestrobe
**图 16-5 SPI 主模式读写模式 3**

MODE 3
CPHA=1
CPOL=1
MOSI MSBit LSBit
MISO MSBit LSBit
NSS
(to slave)
Capturestrobe
#### 16.2.3 从模式

当 SPI 模块工作在从模式时，SCK 用于接收主机发来的时钟，自身的波特率设置无效。配置成
从模式的步骤如下：
配置 DEF 位设置数据位长度；
配置 CPHA 匹配主机工作模式；
根据收发的配置和 CPOL 来决定 SPI 的工作模式；
若需要在从模式进行发送，则需要将 CPOL 置位，配置为模式 2 或模式 3，主机根据需要更改配
置；
若只需要在从模式进行接收，则只需要匹配主机 CPOL 模式即可；
配置 LSBFIRST 匹配主机数据帧格式；
硬件管理模式下，NSS 管脚需要保持为低电平，如果设置 NSS 为软件管理（SSM 置位），那么请
保持 SSI 不被置位；

<a id="pdf-page-186"></a>
<!-- PDF page 186 -->

清除 MSTR 位，置 SPE 位，开启 SPI 模式。
在发送时，当 SCK 出现第一个从机接收采样沿时，从机开始发送。发送的过程就是发送缓冲区
的数据移到发送移位寄存器，当发送缓冲区的数据移到了移位寄存器之后，会置位 TXE 标志，如果
之前置位了 TXEIE 位，那么会产生中断。
在接收时，最后一个时钟采样沿之后，RXNE 位被置位，移位寄存器接收到的字节被转移到接收
缓冲区，读数据寄存器的读操作可以获得接收缓冲区里的数据。如果在 RXNE 置位之前 RXNEIE 已经
被置位，那么会产生中断。
**图 16-6 SPI 从模式读模式 0**

MODE 0
CPHA=0
CPOL=0
MOSI MSBit LSBit
NSS
(to slave)
Capturestrobe
**图 16-7 SPI 从模式读模式 1**

MODE 1
CPHA=0
CPOL=1
MOSI MSBit LSBit
NSS
(to slave)
Capturestrobe

<a id="pdf-page-187"></a>
<!-- PDF page 187 -->

**图 16-8 SPI 从模式读写模式 2**

MODE 2
CPHA=1
CCPPOOLL==00
MOSI MSBit LSBit
MISO MSBit LSBit
NSS
(to slave)
Capturestrobe
**图 16-9 SPI 从模式读写模式 3**

MODE 3
CPHA=1
CPOL=1
MOSI MSBit LSBit
MISO MSBit LSBit
NSS
(to slave)
Capturestrobe
#### 16.2.4 单工模式

SPI 接口可以工作在半双工模式，即主设备使用 MOSI 引脚，从设备使用 MISO 引脚进行通讯。
使用半双工通讯时需要把 BIDIMODE 置位，使用 BIDIOE 控制传输方向。
在正常全双工模式下将 RXONLY 位置位可以将 SPI 模块设置为仅仅接收的单工模式，在 RXONLY
置位之后会释放一个数据脚，主模式和从模式释放的引脚并不相同。也可以不理会接收的数据将 SPI
置成只发送的模式。
#### 16.2.5 CRC

SPI 模块使用 CRC 校验保证全双工通信的可靠性，数据收发分别使用单独的 CRC 计算器。CRC
计算的多项式由多项式寄存器决定，对于 8 位数据宽度和 16 位数据宽度，会分别使用不同的计算方
法。
设置 CRCEN 位会启用 CRC 校验，同时会使 CRC 计算器复位。在发送完最后一个数据字节后，置

<a id="pdf-page-188"></a>
<!-- PDF page 188 -->

CRCNEXT 位会在当前字节发送结束后发送 TXCRCR 计算器的计算结果，同时最后接收到的接收移位寄
存器的值如果与本地算出来的 RXCRCR 的计算值不相符，那么 CRCERR 位会被置位。使用 CRC 校验需
要在配置 SPI 工作模式时设置多项式计算器并置 CRCEN 位，并在最后一个字或半字置 CRCNEXT 位发
送 CRC 并进行接收 CRC 的校验。注意，收发双方的 CRC 计算多项式应该统一。
#### 16.2.6 DMA

SPI 模块支持使用 DMA 加快数据通讯速度，可以使用 DMA 向发送缓冲区填写数据，或使用 DMA
从接收缓冲区及时取走数据。DMA 会以 RXNE 和 TXE 为信号及时取走或发来数据。DMA 也可以工作在
单工或加 CRC 校验的模式。
#### 16.2.7 错误

- 主模式失效错误
当 SPI 工作在 NSS 引脚硬件管理模式下，发生了外部拉低 NSS 引脚的操作；或在 NSS 引脚软件
管理模式下，SSI 位被清零；或 SPE 位被清零，导致 SPI 被关闭；或 MSTR 位被清零，SPI 进入从模
式。如果 ERRIE 位已经被置位，还会产生中断。清除 MODF 位步骤：首先执行一次对 R16_SPI1_STATR
的读或写操作，然后写 R16_SPI1_CTLR1。
- 溢出错误
如果主机发送了数据，而从设备的接收缓冲区中还有未读取的数据，就会发生溢出错误，OVR
位被置位，如果 ERRIE 被置位还会产生中断。发送溢出错误应该重新开始当前传输。读取数据寄存
器再读取状态寄存器会消除此位。
- CRC 错误
当接收到的 CRC 校验字和 RXCRCR 的值不匹配时，会产生 CRC 校验错误，CRCERR 位会被置位。
#### 16.2.8 中断

SPI 模块的中断支持五个中断源，其中发送缓冲区空、接收缓冲区非空这两个事件分别会置位
TXE 和 RXNE，在分别置位了 TXEIE 和 RXNEIE 位的情况下会产生中断。除此之外上面提到的三种错误
也会产生中断，分别是 MODF、OVR 和 CRCERR，在使能了 ERRIE 位之后，这三种错误也会产生错误中
断。
### 16.3 寄存器描述

**表 16-2 SPI 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R16_SPI1_CTLR1 | 0x40013000 | SPI控制寄存器1 | 0x0000 |
| R16_SPI1_CTLR2 | 0x40013004 | SPI控制寄存器2 | 0x0000 |
| R16_SPI1_STATR | 0x40013008 | SPI状态寄存器 | 0x0002 |
| R16_SPI1_DATAR | 0x4001300C | SPI数据寄存器 | 0x0000 |
| R16_SPI1_CRCR | 0x40013010 | SPI多项式寄存器 | 0x0007 |
| R16_SPI1_RCRCR | 0x40013014 | SPI接收CRC寄存器 | 0x0000 |
| R16_SPI1_TCRCR | 0x40013018 | SPI发送CRC寄存器 | 0x0000 |
| R16_SPI1_HSCR | 0x40013024 | SPI高速控制寄存器 | 0x0000 |

#### 16.3.1 SPI控制寄存器1（SPI1_CTLR1）

偏移地址：0x00

<a id="pdf-page-189"></a>
<!-- PDF page 189 -->

15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
BIDI BIDI CRC RX LSB
CRCEN DFF SSM SSI SPE BR[2:0] MSTR CPOL CPHA
MODE OE NEXT ONLY FIRST
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 15 | BIDIMODE | RW | 单向数据模式使能位：<br>1：选择单线双向模式；<br>0：选择双线双向模式。 | 0 |
| 14 | BIDIOE | RW | 单线输出使能位，和BIDIMODE配合使用。<br>1：使能输出，仅发送；<br>0：禁止输出，仅接收。 | 0 |
| 13 | CRCEN | RW | 硬件CRC校验使能位，该位只能在SPE为0时<br>写入，该位只能在全双工模式下使用。<br>1：启动CRC计算；<br>0：禁止CRC计算。 | 0 |
| 12 | CRCNEXT | RW | 在接下来的一次数据传输后，发送CRC寄存器<br>的值。这位应该在向数据寄存器写入最后一个<br>数据后立刻置位。<br>1：发送CRC校验结果；<br>0：继续发送数据寄存器的数据。 | 0 |
| 11 | DFF | RW | 数据帧长度位，此位只能在SPE为0时写入。<br>1：使用16位数据长度进行收发；<br>0：使用8位数据长度进行收发。 | 0 |
| 10 | RXONLY | RW | 双线模式下只接收位，该位和 BIDIMODE 配合<br>使用。置此位可以让设备只接收不发送。<br>1：只接收，单工模式；<br>0：全双工模式。 | 0 |
| 9 | SSM | RW | 片选引脚管理位，此位决定NSS引脚的电平由<br>硬件还是软件控制。<br>1：软件控制NSS引脚；<br>0：硬件控制NSS引脚。 | 0 |
| 8 | SSI | RW | 片选引脚控制位，在SSM置位的情况下，此位<br>决定NSS引脚的电平。<br>1：NSS为高电平；<br>0：NSS为低电平。 | 0 |
| 7 | LSBFIRST | RW | 帧格式控制位。不可以在通讯时修改此位。<br>1：先发送LSB；<br>0：先发送MSB。<br>注：LSB仅SPI做主机支持。 | 0 |
| 6 | SPE | RW | SPI使能位。<br>1：启用SPI；<br>0：禁用SPI。 | 0 |
| [5:3] | BR[2:0] | RW | 波特率设置域，在通讯时不可以修改此域。<br>000：F /2； 001：F /4；<br>HCLK HCLK<br>010：F /8； 011：F /16；<br>HCLK HCLK | 0 |


<a id="pdf-page-190"></a>
<!-- PDF page 190 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 100：F /32； 101：F /64；<br>HCLK HCLK<br>110：F /128； 111：F /256。<br>HCLK HCLK<br>注：此位仅适用于HSRXEN位为0的情况；当<br>HSRXEN位为1时，SCK频率为F /（BR+2）。<br>HCLK |  |
| 2 | MSTR | RW | 主从设置位，在通讯时不可以修改此位。<br>1：配置为主设备；<br>0：配置为从设备。 | 0b |
| 1 | CPOL | RW | 时钟极性选择位，在通讯时不可以修改此位。<br>1：空闲状态时，SCK保持高电平；<br>0：空闲状态时，SCK保持低电平。 | 0 |
| 0 | CPHA | RW | 时钟相位设置位，在通讯时不可以修改此位。<br>1：数据采样从第二个时钟沿开始；<br>0：数据采样从第一个时钟沿开始。 | 0 |

#### 16.3.2 SPI控制寄存器2（SPI1_CTLR2）

偏移地址：0x04
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
RXNE TXDMA RXDMA
ODEN Reserved TXEIE ERRIE Reserved SSOE
IE EN EN
控制寄存器 2
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 15 | ODEN | RW | SPI引脚的开漏输出使能：<br>1：使能NSS、SCK、MOSI开漏输出，可用于支<br>持低压SPI信号；<br>0：禁止SPI开漏输出，默认推挽。 | 0 |
| [14:8] | Reserved | RO | 保留。 | 0 |
| 7 | TXEIE | RW | 发送缓冲区空中断使能位。置此位允许TXE被<br>置位时产生中断。 | 0 |
| 6 | RXNEIE | RW | 接收缓冲区非空中断使能位。置此位允许RXNE<br>被置位时产生中断。 | 0 |
| 5 | ERRIE | RW | 错误中断使能位。置此位允许在产生错误<br>（CRCERR，OVR，MODF）时产生中断。 | 0 |
| [4:3] | Reserved | RO | 保留。 | 0 |
| 2 | SSOE | RW | SS 输出使能。禁止 SS 输出可以工作在多主模<br>式下。<br>1：使能SS输出；<br>0：禁止主模式下的SS输出。 | 0 |
| 1 | TXDMAEN | RW | 发送缓冲区DMA使能位。<br>1：启用发送缓冲区DMA；<br>0：禁用发送缓冲区DMA。 | 0 |
| 0 | RXDMAEN | RW | 接收缓冲区DMA使能位。<br>1：启用接收缓冲区DMA；<br>0：禁用接收缓冲区DMA。 | 0 |


<a id="pdf-page-191"></a>
<!-- PDF page 191 -->

#### 16.3.3 SPI状态寄存器（SPI1_STATR）

偏移地址：0x08
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
CRC
Reserved BSY OVR MODF Reserved TXE RXNE
ERR
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:8] | Reserved | RO | 保留。 | 0 |
| 7 | BSY | RO | 忙标志位，该位由硬件置位或复位。<br>1：SPI正在通讯，或发送缓冲区非空；<br>0：SPI不在通讯。 | 0 |
| 6 | OVR | RW0 | 溢出标志位,该位由硬件置位，软件复位。<br>1：出现溢出错误；<br>0：没有出现溢出错误。 | 0 |
| 5 | MODF | RO | 模式错误标志位，该位由硬件置位，软件复位。<br>1：出现了模式错误；<br>0：没有出现模式错误。 | 0 |
| 4 | CRCERR | RW0 | CRC错误标志位，该位由硬件置位，软件复位。<br>1：收到的CRC值与RCRCR的值不一致；<br>0：收到的CRC值与RCRCR的值一致。 | 0 |
| [3:2] | Reserved | RO | 保留。 | 0 |
| 1 | TXE | RO | 发送缓冲区为空标志位：<br>1：发送缓冲区为空；<br>0：发送缓冲区非空。 | 1 |
| 0 | RXNE | RO | 接收缓冲区非空标志位：<br>1：接收缓冲区非空；<br>0：接收缓冲区为空。 | 0 |

#### 16.3.4 SPI数据寄存器（SPI1_DATAR）

偏移地址：0x0C
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
DR[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:0] | DR[15:0] | RW | 数据寄存器。数据寄存器用于存放接收到的数<br>据或预存将要发送出去的数据，因此数据寄存<br>器的读写实际上是对应操作不同的区域，其中<br>读对应接收缓冲区，写对应发送缓冲区。数据<br>的接收和发送可以是 8 位或者 16 位的，需要<br>在传输之前就确定使用多少位的数据。使用 8<br>位进行数据传输时，只有数据寄存器的低8位<br>被使用，接收时高8位强制为0。使用16位数<br>据结构则会使全部16位数据寄存器被使用。 | 0 |


<a id="pdf-page-192"></a>
<!-- PDF page 192 -->

#### 16.3.5 SPI多项式寄存器（SPI1_CRCR）

偏移地址：0x10
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
CRCPOLY[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:0] | CRCPOLY[15:0] | RW | CRC多项式。此域定义CRC计算用到的多项式。 | 7 |

#### 16.3.6 SPI接收CRC寄存器（SPI1_RCRCR）

偏移地址：0x14
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
RXCRC[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:0] | RXCRC[15:0] | RO | 接收CRC值。存储着计算出来的接收到的字节<br>的CRC校验的结果。对CRCEN置位会复位该寄<br>存器。计算方法使用CRCPOLY用到的多项式。<br>8位模式下只有低8位参与计算，16位模式下<br>全部 16 位都会参与计算。需要在 BSY 为 0 时<br>去读取这个寄存器。 | 0 |

#### 16.3.7 发送CRC寄存器（SPI1_TCRCR）

偏移地址：0x18
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
TXCRC[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:0] | TXCRC[15:0] | RO | 发送CRC值。存储着计算出来的已经发送出去<br>的字节的CRC校验的结果。对CRCEN置位会复<br>位该寄存器。计算方法使用CRCPOLY用到的多<br>项式。8位模式下只有低8位参与计算，16位<br>模式下全部 16 位都会参与计算。需要在 BSY<br>为0时去读取这个寄存器。 | 0 |

#### 16.3.8 SPI高速控制寄存器（SPI1_HSCR）

偏移地址：0x24
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
HSRX
Reserved
EN
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:1] | Reserved | RO | 保留。 | 0 |


<a id="pdf-page-193"></a>
<!-- PDF page 193 -->

SPI 高速模式下读使能：
0 HSRXEN WO 1：使能高速读模式； 0
0：关闭高速读模式。

<a id="pdf-page-194"></a>
<!-- PDF page 194 -->

## 第17章 运放（OPA）和比较器（CMP）

该模块包含 2 个可独立配置的运算放大器（OPA 或 PGA）和 3 个可独立配置的电压比较器（CMP），
其中运算放大器（OPA 或 PGA）支持增益选择，也可改用于电压比较器。
每个运算放大器的输入和输出均连接至 I/O 口，且输入引脚或增益可选择，输出引脚可选择配
置到通用 I/O 口或复用为 ADC 采样通道的 I/O，支持将外部模拟小信号放大送入 ADC 以实现小信号
ADC 转换。
每个电压比较器的输入和输出均连接至 I/O 口，且输入引脚可选择，输出引脚可选择配置到通
用 I/O 口或复用为 TIM 内部采样通道（不占用 I/O 引脚）。
### 17.1 主要特性

- OPA 输入引脚或通道可选择
- OPA 输出引脚可选择通用 I/O 口或 ADC 采样通道
- OPA 支持正端输入轮询功能
- OPA 支持 PGA 增益选择
- CMP 输入引脚可选择，负端输入通道可选公用引脚
- CMP 输出引脚可选择通用 I/O 口或 TIM 内部采样通道
- 1 个中断向量
### 17.2 功能描述

#### 17.2.1 运放OPA

置位 OPA_CTLR1 寄存器中的 ENx，即可使能对应的 OPAx，配置 OPA_CTLR1 寄存器中的 MODEx 可
选择 OPAx 的输出通道为 ADC 采样通道或者普通 I/O 口，配置 OPA_CTLR1 寄存器中的 PSELx，可选择
OPAx 的正端输入引脚，配置 OPA_CTLR1 寄存器中的 NSELx，可选择 OPAx 的负端输入通道、或作为
PGA 使用时的增益。
EN2
PA7 00 PSEL2
PB3 01 MODE2 0 PA4
+
PB7 10 1 PA2
- 
OPA2
FB_EN2
PA5 000 NSEL2
PB1 001
192K(type)
PA1 010
12.8K 64K 27.4K 6.2K
101 011 100 110
GND GND GND GND
EN1
PB0 00 PSEL1
PB8 01 MODE1 0 PA3
+
PB4 10 1 PB5
- 
OPA1
FB_EN1
PA6 000 NSEL1
PB6 001
192K(type)
PA1 010
12.8K 64K 27.4K 6.2K
101 011 100 110
GND GND GND GND

<a id="pdf-page-195"></a>
<!-- PDF page 195 -->

#### 17.2.2 运放正输入端轮询

每个 OPA 的 P 端可从 OPA_P0/OPA_P1/OPA_P2 中选择，OPA 的轮询功能可实现定时依次选择
OPA_P0/OPA_P1/OPA_P2，轮流选中所有的 P 端；可通过配置 OPA_CFGR 寄存器中的 POLL_EN 位来选择
使能轮询功能的 OPAx。
其中轮询的通道数量可通过 OPA_CFGR 寄存器中的 POLLx_NUM 配置，轮询间隔可通过 OPA_CFGR
寄存器中的 POLL_VLU 配置。
#### 17.2.3 比较器CMP

置位 OPA_CTLR2 寄存器中的 ENx，即可使能对应的 CMPx，配置 OPA_CTLR2 寄存器中的 MODEx 可
选择 CMPx 的输出通道为普通 I/O 口或内部定时器通道。配置 OPA_CTLR2 寄存器中的 PSELx，可选择
CMPx 的正端输入引脚，配置 OPA_CTLR2 寄存器中的 NSELx，可选择 CMPx 的负端输入引脚。
注：各OPA和CMP详细的输入输出引脚，参考数据手册中引脚说明。
EN3
PA13 0 PSEL3 MODE3
PA14 1 CMP3 0 TIM2_CH3
+
1 PB3
- 
PA2 0 NSEL3 HYEN3
PC3 1
EN2
PA12 0 PSEL2 MODE2
PA11 1 CMP2 0 TIM2_CH2
+
1 PB2
- 
PA22 0 NSEL2 HYEN2
PC3 1
EN1
PC19 0 PSEL1 MODE1
PA0 1 CMP1 0 TIM2_CH1
+
1 PA1
- 
PC3 0 NSEL1 HYEN1
PA23 1
### 17.3 寄存器描述

**表 17-1 OPA 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R16_OPA_CFGR1 | 0x40026000 | OPA配置寄存器1 | 0x0080 |
| R16_OPA_CFGR2 | 0x40026002 | OPA配置寄存器2 | 0x0000 |
| R32_OPA_CTLR1 | 0x40026004 | OPA控制寄存器1 | 0x81D801D8 |
| R32_OPA_CTLR2 | 0x40026008 | OPA控制寄存器2 | 0x80000000 |
| R32_OPA_KEY | 0x4002600C | OPA解锁键寄存器 | 0xXXXXXXXX |
| R32_CMP_KEY | 0x40026010 | CMP解锁键寄存器 | 0xXXXXXXXX |
| R32_POLL_KEY | 0x40026014 | POLL解锁键寄存器 | 0xXXXXXXXX |

#### 17.3.1 OPA配置寄存器1（OPA_CFGR1）

偏移地址：0x00
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reser IF_CN IF_OU IF_OU NMI_E IE_CN IE_OU IE_OU POLL_ BKIN_ RST_E RST_E BKIN_ BKIN_ POLL_ POLL_
ved T T2 T1 N T T2 T1 LOCK SEL N2 N1 EN2 EN1 EN2 EN1

<a id="pdf-page-196"></a>
<!-- PDF page 196 -->

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 15 | Reserved | RO | 保留。 | 0 |
| 14 | IF_CNT | RW0 | OPA轮询间隔结束的中断标志：<br>1：轮询间隔结束；<br>0：无效。<br>写0清零、写1无效。 | 0 |
| 13 | IF_OUT2 | RW0 | 轮询到OPA2输出为高电平的中断标志：<br>1：轮询到OPA2输出为高电平；<br>0：无效。<br>写0清零、写1无效。 | 0 |
| 12 | IF_OUT1 | RW0 | 轮询到OPA1输出为高电平的中断标志：<br>1：轮询到OPA1输出为高电平；<br>0：无效。<br>写0清零、写1无效。 | 0 |
| 11 | NMI_EN | RW | OPA连接NMI中断使能：<br>1：开启；<br>0：关闭。 | 0 |
| 10 | IE_CNT | RW | OPA轮询间隔结束的中断使能：<br>1：打开中断使能；<br>0：关闭中断使能。 | 0 |
| 9 | IE_OUT2 | RW | OPA2中断使能：<br>1：打开中断使能；<br>0：关闭中断使能。 | 0 |
| 8 | IE_OUT1 | RW | OPA1中断使能：<br>1：打开中断使能；<br>0：关闭中断使能。 | 0 |
| 7 | POLL_LOCK | W1 | POLL锁(写1上锁，写0无效）：<br>1：上锁，无法对配置寄存器的其他位进行写操作；<br>0：解锁，可以对配置寄存器的其他位进行写操作。 | 1 |
| 6 | BKIN_SEL | RW | 刹车输入连接的定时器选择（两定时器交换）：<br>输出到定时器1：<br>1：OPA2输出；<br>0：OPA1输出。<br>输出到定时器2：<br>1：OPA1输出；<br>0：OPA2输出。<br>注：刹车信号只能为高电平有效，需将TIMx_BDTR寄<br>存器BKP位置1。 | 0 |
| 5 | RST_EN2 | RW | OPA2复位系统使能：<br>1：打开复位使能；<br>0：关闭复位使能。 | 0 |
| 4 | RST_EN1 | RW | OPA1复位系统使能：<br>1：打开复位使能；<br>0：关闭复位使能。 | 0 |


<a id="pdf-page-197"></a>
<!-- PDF page 197 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| 3 | BKIN_EN2 | RW | 定时器的刹车输入源OPA2使能：<br>1：打开OPA2刹车使能；<br>0：关闭OPA2刹车使能。 | 0 |
| 2 | BKIN_EN1 | RW | 定时器的刹车输入源OPA1使能：<br>1：打开OPA1刹车使能；<br>0：关闭OPA1刹车使能。 | 0 |
| 1 | POLL_EN2 | RW | OPA2正端轮询使能：<br>1：打开正端轮询使能；<br>0：关闭正端轮询使能。 | 0 |
| 0 | POLL_EN1 | RW | OPA1正端轮询使能：<br>1：打开正端轮询使能；<br>0：关闭正端轮询使能。 | 0 |

#### 17.3.2 OPA配置寄存器2（OPA_CFGR2）

偏移地址：0x02
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved POLL2_NUM POLL1_NUM POLL_VLU
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:13] | Reserved | RO | 保留。 | 0 |
| [12:11] | POLL2_NUM | WO | 配置OPA2轮询的正端个数：<br>00：1个，O2P0；<br>01：2个，O2P0+O2P1；<br>10：3个，O2P0+O2P1+O2P2；<br>11：保留。 | 0 |
| [10:9] | POLL1_NUM | WO | 配置OPA1轮询的正端个数：<br>00：1个，O1P0；<br>01：2个，O1P0+O1P1；<br>10：3个，O1P0+O1P1+O1P2；<br>11：保留。 | 0 |
| [8:0] | POLL_VLU | RW | 配置OPA正端轮询间隔：<br>轮询间隔=（POLL_VLU+1）*1us。 | 0 |

#### 17.3.3 OPA控制寄存器1（OPA_CTLR1）

偏移地址：0x04
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
OPA_L Reserv MODE
Reserved NSEL2 FB_EN2 PSEL2 EN2
OCK ed 2
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reser
Reserved NSEL1 FB_EN1 PSEL1 MODE1 EN1
ved
位名称访问描述复位值

<a id="pdf-page-198"></a>
<!-- PDF page 198 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| 31 | OPA_LOCK | W1 | OPA锁（写1上锁，写0无效）：<br>1：OPA上锁；<br>0：OPA解锁。 | 1 |
| [30:25] | Reserved | RO | 保留。 | 0 |
| [24:22] | NSEL2 | RW | OPA2负端输入通道，以及作为PGA使用时的增益选择：<br>000：PA5；<br>001：PB1；<br>010：PA1，有外部引脚的PGA模式，内部16倍放大，<br>外部可设置负端参考电压、串电阻可调低增益；<br>011：无外部引脚的PGA模式，固定约4倍放大；<br>100：无外部引脚的PGA模式，固定约8倍放大；<br>101：无外部引脚的PGA模式，固定约16倍放大；<br>110：无外部引脚的PGA模式，固定约32倍放大；<br>111：关断。 | 111b |
| 21 | FB_EN2 | RW | OPA2内部反馈电阻使能：<br>1：使能，用作PGA2，反馈电阻约192kΩ；<br>0：禁止。<br>注：上述NSEL2控制位为PGA模式时，此位必须置1。 | 0 |
| [20:19] | PSEL2[1:0] | RW | OPA2正向输入端选择：<br>00：PA7；<br>01：PB3；<br>10：PB7；<br>11：禁止。 | 11b |
| 18 | Reserved | RO | 保留。 | 0 |
| 17 | MODE2 | RW | OPA2输出通道选择：<br>1：输出通道为PA2；<br>0：输出通道为PA4。 | 0 |
| 16 | EN2 | RW | OPA2使能：<br>1：OPA2使能；<br>0：禁止OPA2。 | 0 |
| [15:9] | Reserved | RO | 保留。 | 0 |
| [8:6] | NSEL1 | RW | OPA1负端输入通道，以及作为PGA使用时的增益选择<br>000：PA6；<br>001：PB6；<br>010：PA1，有外部引脚的PGA模式，内部16倍放大，<br>外部可设置负端参考电压、串电阻可调低增益；<br>011：无外部引脚的PGA模式，固定约4倍放大；<br>100：无外部引脚的PGA模式，固定约8倍放大；<br>101：无外部引脚的PGA模式，固定约16倍放大；<br>110：无外部引脚的PGA模式，固定约32倍放大；<br>111：关断。 | 111b |
| 5 | FB_EN1 | RW | OPA1内部反馈电阻使能：<br>1：使能，用作PGA1，反馈电阻约192kΩ；<br>0：禁止。<br>注：上述NSEL1控制位为PGA模式时，此位必须置1。 | 0 |
| [4:3] | PSEL1[1:0] | RW | OPA1正向输入端选择： | 11b |


<a id="pdf-page-199"></a>
<!-- PDF page 199 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 00：PB0；<br>01：PB8；<br>10：PB4；<br>11：禁止。 |  |
| 2 | Reserved | RO | 保留。 | 0 |
| 1 | MODE1 | RW | OPA1输出通道选择：<br>1：输出通道为PB5；<br>0：输出通道为PA3。 | 0 |
| 0 | EN1 | RW | OPA1使能：<br>1：使能OPA1；<br>0：禁止OPA1。 | 0 |

#### 17.3.4 OPA控制寄存器2（OPA_CTLR2）

偏移地址：0x08
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
CMP_LO
Reserved
CK
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reser
HYEN3 PSEL3 NSEL3 MODE3 EN3 HYEN2 PSEL2 NSEL2 MODE2 EN2 HYEN1 PSEL1 NSEL1 MODE1 EN1
ved
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 31 | CMP_LOCK | W1 | CMP锁（写1上锁，写0无效）：<br>1：上锁CMP；<br>0：解锁CMP。 | 1 |
| [30:15] | Reserved | RO | 保留。 | 0 |
| 14 | HYEN3 | RW | CMP3比较器迟滞使能：<br>1：打开；<br>0；关闭。 | 0 |
| 13 | PSEL3 | RW | CMP3正端输入通道选择：<br>1：PA14；<br>0：PA13。 | 0 |
| 12 | NSEL3 | RW | CMP3负端输入通道选择：<br>1：PC3；<br>0：PA2。 | 0 |
| 11 | MODE3 | RW | CMPA3输出通道选择：<br>1：输出通道为PB3；<br>0：输出通道为内部通道TIM2_CH3。 | 0 |
| 10 | EN3 | RW | CMP3使能：<br>1：使能CMP3；<br>0：禁止CMP3。 | 0 |
| 9 | HYEN2 | RW | CMP2比较器迟滞使能：<br>1：打开；<br>0：关闭。 | 0 |


<a id="pdf-page-200"></a>
<!-- PDF page 200 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| 8 | PSEL2 | RW | CMP2正端输入通道选择：<br>1：PA11；<br>0：PA12。 | 0 |
| 7 | NSEL2 | RW | CMP2负端输入通道选择：<br>1：PC3；<br>0：PA22。 | 0 |
| 6 | MODE2 | RW | CMPA2输出通道选择：<br>1：输出通道为PB2；<br>0：输出通道为内部通道TIM2_CH2。 | 0 |
| 5 | EN2 | RW | CMP2使能：<br>1：使能CMP2；<br>0：禁止CMP2。 | 0 |
| 4 | HYEN1 | RW | CMP1比较器迟滞使能：<br>1：打开；<br>0：关闭。 | 0 |
| 3 | PSEL1 | RW | CMP1正端输入通道选择：<br>1：PA0；<br>0：PC19。 | 0 |
| 2 | NSEL1 | RW | CMP1负端输入通道选择：<br>1：PA23；<br>0：PC3。 | 0 |
| 1 | MODE1 | RW | CMPA1输出通道选择：<br>1：输出通道为PA1；<br>0：输出通道为内部通道TIM2_CH1。 | 0 |
| 0 | EN1 | RW | CMP1使能：<br>1：使能CMP1；<br>0：禁止CMP1。 | 0 |

#### 17.3.5 OPA解锁键寄存器（OPA_KEY）

偏移地址：0x0C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
OPA_KEY[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
OPA_KEY[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | OPA_KEY[31:0] | RW | OPA键，用于输入OPA的解锁键包括：<br>KEY1 = 0x45670123；<br>KEY2 = 0xCDEF89AB。 | X |

#### 17.3.6 CMP解锁键寄存器（CMP_KEY）

偏移地址：0x10
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16

<a id="pdf-page-201"></a>
<!-- PDF page 201 -->

CMP_KEY[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
CMP_KEY[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | CMP_KEY[31:0] | RW | CMP键，用于输入CMP的解锁键包括：<br>KEY1 = 0x45670123；<br>KEY2 = 0xCDEF89AB。 | X |

#### 17.3.7 POLL解锁键寄存器（POLL_KEY）

偏移地址：0x14
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
POLL_KEY[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
POLL_KEY[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | POLL_KEY[31:0] | RW | POLL键，用于输入POLL的解锁键包括：<br>KEY1 = 0x45670123；<br>KEY2 = 0xCDEF89AB。 | X |


<a id="pdf-page-202"></a>
<!-- PDF page 202 -->

## 第18章 USB全速主机/设备控制器（USBFS）

### 18.1 USB控制器简介

芯片内嵌 USB 控制器及收发器，特性如下：
- 双重角色控制器，支持 USB Host 主机功能和 USB Device 设备功能。
- 遵循 On-The-GoSupplement to the USB2.0 规范，主机和设备模式均支持 USB2.0 全速 12Mbps
或低速 1.5Mbps。
- 支持软件 HNP 和 SRP 协议。
- 支持 USB 控制传输、批量传输、中断传输、同步/实时传输。
- 支持最大 64 字节的数据包，内置 FIFO，支持中断和 DMA。
### 18.2 寄存器描述

USB 相关寄存器分为 3 个部分，部分寄存器是在主机和设备模式下进行复用的。
- USB 全局寄存器
- USB 设备控制寄存器
- USB 主机控制寄存器
#### 18.2.1 全局寄存器描述

**表 18-1 USBFS 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R8_BASE_CTRL | 0x40023400 | USB控制寄存器 | 0x06 |
| R8_INT_EN | 0x40023402 | USB中断使能寄存器 | 0x00 |
| R8_DEV_ADDR | 0x40023403 | USB设备地址寄存器 | 0x00 |
| R8_MIS_ST | 0x40023405 | USB杂项状态寄存器 | 0xXX |
| R8_INT_FG | 0x40023406 | USB中断标志寄存器 | 0x20 |
| R8_INT_ST | 0x40023407 | USB中断状态寄存器 | 0xXX |
| R16_RX_LEN | 0x40023408 | USB接收长度寄存器 | 0xXX |
| R8_UEP4_1_MOD | 0x4002340C | 端点1和4模式控制寄存器 | 0x00 |
| R8_UEP2_3_MOD | 0x4002340D | 端点2和3模式控制寄存器 | 0x00 |
| R8_UEP567_MOD | 0x4002340E | 端点5、6和7模式控制寄存器 | 0x00 |

##### 18.2.1.1 USB控制寄存器（R8_BASE_CTRL）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 7 | RB_UC_HOST_MODE | RW | USB工作模式选择位：<br>1：主机模式（HOST）；<br>0：设备模式（DEVICE）。 | 0 |
| 6 | RB_UC_LOW_SPEED | RW | USB低速使能位：<br>1：打开低速；<br>0：禁止低速。 | 0 |
| [5:4] | RB_SYS_MODE | RW | 主机模式下的测试模式。 | 0 |
| 3 | RB_UC_INT_BUSY | RW | USB 传输完成中断标志未清零前自动暂停使<br>能位：<br>1：在中断标志 UIF_TRANSFER 未清零前自动 | 0 |


<a id="pdf-page-203"></a>
<!-- PDF page 203 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 暂停，设备模式下自动应答忙NAK，主机模式<br>下自动暂停后续传输；<br>0：不暂停。 |  |
| 2 | RB_UC_RST_SIE | RW | USB协议处理器软件复位控制位：<br>1：强制复位 USB 协议处理器（SIE），需要<br>软件清零；<br>0：不复位。 | 1 |
| 1 | RB_UC_CLR_ALL | RW | USB的FIFO和中断标志清零：<br>1：清空USB中断标志和FIFO，需要软件清零；<br>0：不清空。 | 1 |
| 0 | RB_UC_DMA_EN | RW | 使能USB的DMA，正常传输模式下该位必须设<br>置为1：<br>1：使能DMA功能和DMA中断；<br>0：关闭DMA。 | 0 |

##### 18.2.1.2 USB中断使能寄存器（R8_INT_EN）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 7 | Reserved | RO | 保留。 | 0 |
| 6 | RB_UIE_DEV_NAK | RW | USB设备模式，接收到NAK中断：<br>1：使能相应中断；0：禁止相应中断。 | 0 |
| 5 | RB_UID_1_WIRE | RW | USB单线模式使能：<br>1：开启； 0：禁止。 | 0 |
| 4 | RB_UIE_FIFO_OV | RW | FIFO溢出中断：<br>1：使能中断； 0：禁止中断。 | 0 |
| 3 | RB_UIE_SOF_ACT | RW | USB主机模式，SOF接收完成中断：<br>1：使能中断； 0：禁止中断。 | 0 |
| 2 | RB_UIE_SUSPEND | RW | USB总线挂起或唤醒事件中断：<br>1：使能中断； 0：禁止中断。 | 0 |
| 1 | RB_UIE_TRANSFER | RW | USB传输（不包括SETUP事务）完成中断：<br>1：使能中断； 0：禁止中断。 | 0 |
| 0 | RB_UIE_DETECT | RW | USB主机模式，USB设备连接或断开事件中<br>断：<br>1：使能中断； 0：禁止中断。 | 0 |
|  | RB_UIE_BUS_RST | RW | USB设备模式，USB总线复位事件中断：<br>1：使能中断； 0：禁止中断。 | 0 |

##### 18.2.1.3 USB设备地址寄存器（R8_DEV_ADDR）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 7 | Reserved | RO | 保留。 | 0 |
| [6:0] | MASK_USB_ADDR | RW | 主机模式下是当前操作的 USB 设备的<br>地址或HUB地址；<br>设备模式：该USB自身地址。 | 0 |

##### 18.2.1.4 USB杂项状态寄存器（R8_MIS_ST）

位名称访问描述复位值

<a id="pdf-page-204"></a>
<!-- PDF page 204 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| 7 | RB_UMS_SOF_PRES | RO | USB主机模式下SOF包预示状态位：<br>1：将要发送SOF包，此时如有其它USB<br>数据包将被自动延后；<br>0：无SOF包发送。 | X |
| 6 | RB_UMS_SOF_ACT | RO | USB主机模式下SOF包传输状态位：<br>1：正在发出SOF包；<br>0：发送完成或空闲。 | X |
| 5 | RB_UMS_SIE_FREE | RO | USB协议处理器的空闲状态位：<br>1：协议器空闲；<br>0：忙，正在进行USB传输。 | 1 |
| 4 | RB_UMS_R_FIFO_RDY | RO | USB接收FIFO数据就绪状态位：<br>1：接收FIFO非空；<br>0：接收FIFO为空。 | 0 |
| 3 | RB_UMS_BUS_RST | RO | USB总线复位状态位：<br>1：当前USB总线处于复位态；<br>0：当前USB总线处于非复位态。 | X |
| 2 | RB_UMS_SUSPEND | RO | USB挂起状态位：<br>1：USB总线处于挂起态，有一段时间没<br>有USB活动；<br>0：USB总线处于非挂起态。 | 0 |
| 1 | RB_UMS_DM_LEVEL | RO | USB主机模式下，设备刚连入USB端口<br>是DM引脚的电平状态，用于判断速度：<br>1：高电平/低速；<br>0：低电平/全速。 | 0 |
| 0 | RB_UMS_DEV_ATTACH | RO | USB 主机模式下端口的 USB 设备连接状<br>态位：<br>1：端口已经连接USB设备；<br>0：端口没有USB设备连接。 | 0 |

##### 18.2.1.5 USB中断标志寄存器（R8_INT_FG）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 7 | RB_U_IS_NAK | RO | USB设备模式下，NAK响应中断标志位，<br>同RB_U_IS_NAK：<br>1：当前USB传输过程中回应NAK；<br>0：无事件。 | 0 |
| 6 | TOG_MATCH_SYNC | RO | USB事务接收完成后，接收到的数据包<br>的Toggle与设置的期望值。<br>匹配状态位：<br>1：toggle匹配；<br>0：toggle不匹配。 | 0 |
| 5 | RB_U_SIE_FREE | RO | USB协议处理器的空闲状态位：<br>1：USB空闲；<br>0：忙，正在进行USB传输。 | 1 |
| 4 | RB_UIF_FIFO_OV | RW | USB FIFO溢出中断标志位，写1清零：<br>1：FIFO溢出触发； 0：无事件。 | 0 |


<a id="pdf-page-205"></a>
<!-- PDF page 205 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| 3 | RB_UIF_HST_SOF | RW | USB 主机模式下 SOF 定时中断标志位，<br>写1清零：<br>1：SOF包传输完成触发；0：无事件。 | 0 |
| 2 | RB_UIF_SUSPEND | RW | USB 总线挂起或唤醒事件中断标志位，<br>写1清零：<br>1：USB挂起事件或唤醒事件触发；<br>0：无事件。 | 0 |
| 1 | RB_UIF_TRANSFER | RW | USB传输完成中断标志位，写1清零：<br>1：一个USB传输完成触发；<br>0：无事件。 | 0 |
| 0 | RB_UIF_DETECT | RW | USB 主机模式下 USB 设备连接或断开事<br>件中断标志位，写1清零：<br>1：检测到USB设备连接或断开触发；<br>0：无事件。 | 0 |
|  | RB_UIF_BUS_RST | RW | USB 设备模式下 USB 总线复位事件中断<br>标志位，写1清零：<br>1：USB总线复位事件触发；<br>0：无事件。 | 0 |

##### 18.2.1.6 USB中断状态寄存器（R8_INT_ST）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 7 | SETUP_ACT | RO | SETUP事务完成<br>1：SETUP事务完成；<br>0：无事件。 | 0 |
| 6 | RB_UIS_TOG_OK | RO | USB事务接收完成后，接收到的数据包<br>的Toggle与设置的期望值<br>匹配状态位：<br>1：toggle匹配；<br>0：toggle不匹配。 | 0 |
| [5:4] | MASK_UIS_TOKEN | RO | 设备模式下，当前 USB 传输事务的令牌<br>PID标识。 | XXb |
| [3:0] | MASK_UIS_ENDP | RO | 设备模式下，当前 USB 传输事务的端点<br>号。 | XXXXb |
|  | MASK_UIS_H_RES | RO | 主机模式下，当前 USB 传输事务的应答<br>PID标识，0000表示设备无应答或超时；<br>其它值表示应答PID。 | XXXXb |

注：MASK_UIS_TOKEN用于USB设备模式下标识当前USB传输事务的令牌PID：00表示OUT包；01
保留；10表示IN包；11表示SETUP包。
MASK_UIS_H_RES仅在主机模式下有效。在主机模式下，若主机发送OUT/SETUP令牌包时，则该
PID是握手包ACK/NAK/STALL，或是设备无应答/超时。若主机发送IN令牌包，则该PID是数据包的
PID（DATA0/DATA1）或握手包PID。
##### 18.2.1.7 USB接收长度寄存器（R16_RX_LEN）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:7] | Reserved | RO | 保留。 | 0 |


<a id="pdf-page-206"></a>
<!-- PDF page 206 -->

[6:0] USB_RX_LEN RO 当前 USB 端点接收的数据字节数。 X
##### 18.2.1.8 端点1和4模式控制寄存器（R8_UEP4_1_MOD）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 7 | EP1_R_EN | RW | 端点1接收使能。 | 0 |
| 6 | EP1_T_EN | RW | 端点1发送使能。 | 0 |
| 5 | Reserved | RO | 保留。 | 0 |
| 4 | EP1_BUF_MOD | RW | 端点1缓冲区模式控制位。 | 0 |
| 3 | EP4_R_EN | RW | 端点4接收使能。 | 0 |
| 2 | EP4_T_EN | RW | 端点4发送使能。 | 0 |
| [1:0] | Reserved | RO | 保留。 | 0 |

EP4_R_EN 和 EP4_T_EN 组合配置 USB 端点 0 和 4 的数据缓冲区模式，具体参考下表：
**表 18-2 端点 0 和 4 缓冲区模式**

EP4_R_EN EP4_T_EN 描述：以 UEP0_DMA 为起始地址由低向高排列
0 0 端点 0 单 64 字节收发共用缓冲区（IN 和 OUT）。
1 0 端点 0 单 64 字节收发共用缓冲区；端点 4 单 64 字节接收缓冲区（OUT）。
0 1 端点 0 单 64 字节收发共用缓冲区；端点 4 单 64 字节发送缓冲区（IN）。
端点 0 单 64 字节收发共用缓冲区；端点 4 单 64 字节接收缓冲区（OUT）；
端点 4 单 64 字节接收缓冲区（IN）。总共 192 字节排列如下：
1 1 UEP0_DMA+0 地址：端点 0 收发共用缓冲区 64 字节起始地址；
UEP0_DMA+64 地址：端点 4 接收缓冲区 64 字节起始地址；
UEP0_DMA+128 地址：端点 4 发送缓冲区 64 字节起始地址。
##### 18.2.1.9 端点2和3模式控制寄存器（R8_UEP2_3_MOD）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 7 | EP3_R_EN | RW | 端点3接收使能。 | 0 |
| 6 | EP3_T_EN | RW | 端点3发送使能。 | 0 |
| 5 | Reserved | RO | 保留。 | 0 |
| 4 | EP3_BUF_MOD | RW | 端点3缓冲模式控制位。 | 0 |
| 3 | EP2_R_EN | RW | 端点2接收使能。 | 0 |
| 2 | EP2_T_EN | RW | 端点2发送使能。 | 0 |
| 1 | Reserved | RO | 保留。 | 0 |
| 0 | EP2_BUF_MOD | RW | 端点2缓冲模式控制位。 | 0 |

##### 18.2.1.10 端点5、6和7模式控制寄存器（R8_UEP567_MOD）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [7:6] | Reserved | RO | 保留。 | 0 |
| 5 | EP7_R_EN | RW | 端点7接收使能。 | 0 |
| 4 | EP7_T_EN | RW | 端点7发送使能。 | 0 |
| 3 | EP6_R_EN | RW | 端点6接收使能。 | 0 |
| 2 | EP6_T_EN | RW | 端点6发送使能。 | 0 |
| 1 | EP5_R_EN | RW | 端点5接收使能。 | 0 |
| 0 | EP5_T_EN | RW | 端点5发送使能。 | 0 |


<a id="pdf-page-207"></a>
<!-- PDF page 207 -->

#### 18.2.2 USB设备寄存器描述

USBFS 模块在 USB 设备模式下，提供了端点 0-7 共 8 组双向端点，所有端点的最大数据包长度
都是 64 字节。
- 端点 0 是默认端点，支持控制传输，发送和接收共用一个 64 字节数据缓冲区。
- 端点 1-7 各自包括一个发送端点 IN 和一个接收端点 OUT，发送和接收各有一个独立的数据缓冲
区，支持批量传输、中断传输和实时/同步传输。
- 端点 0 具有独立的 DMA 地址，收发共用，端点 1~7 的发送和接收各有一个 DMA 地址。通过入
R32_UEPn_BUF_MOD 寄存器可以设置数据缓冲区的模式为双缓冲或单缓冲。若使用双缓冲区模
式，该端点只能使用单方向传输。
- 每组端点都具有收发控制寄存器 R8_UEPn_TX_CTRL、R8_UEPn_RX_CTRL 和发送长度寄存器
R16_UEPn_T_LEN 和 R32_UEPn_*_DMA（n=0~7），用于配置该端点的同步触发位、对 OUT 事务和
IN 事务的响应以及发送数据的长度等。
作为 USB 设备所必要的 USB 总线上拉电阻可以由软件随时设置是否启用，可参考 AFIO_CTLR 寄
存器。
当检测到 USB 总线复位、USB 总线挂起或唤醒事件，或当 USB 成功处理完数据发送或数据接收
后，USB 协议处理器都将设置相应的中断标志，如果中断使能打开，还会产生相应的中断请求。应
用程序可以直接查询或在 USB 中断服务程序中查询并分析中断标志寄存器 R8_USB_INT_FG，根据
RB_UIF_BUS_RST 和 RB_UIF_SUSPEND 进行相应的处理；并且，如果 RB_UIF_TRANSFER 有效，那么还
需要继续分析 USB 中断状态寄存器 R8_USB_INT_ST，根据当前端点号 MASK_UIS_ENDP 和当前事务令
牌 PID 标识 MASK_UIS_TOKEN 进行相应的处理。如果事先设定了各个端点的 OUT 事务的同步触发位
RB_UEP_R_TOG，那么可以通过 RB_U_TOG_OK 或 RB_UIS_TOG_OK 判断当前所接收到的数据包的同步触
发位是否与该端点的同步触发位匹配，如果数据同步，则数据有效；如果数据不同步，则数据应该
被丢弃。每次处理完 USB 发送或接收中断后，都应该正确修改相应端点的同步触发位，用于下次所
发送的数据包或下次所接收的数据包是否同步检测；另外，设置 RB_UEP_T_TOG_AUTO 或
RB_UEP_R_TOG_AUTO 可以实现在发送成功或接收成功后自动修改相应的同步触发位（翻转或自减）。
各个端点准备发送的数据在各自的缓冲区中， 准备发送的数据长度是独立设定在
R16_UEPn_T_LEN 中；各个端点接收到的数据在各自的缓冲区中，但是接收到的数据长度都在 USB 接
收长度寄存器 R16_USB_RX_LEN 中，可以在 USB 接收中断时根据当前端点号区分。
**表 18-3 设备相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R8_UDEV_CTRL | 0x40023401 | USB设备物理端口控制寄存器 | 0xX0 |
| R32_UEP0_DMA | 0x40023410 | 端点0缓冲区的起始地址 | 0x00000000 |
| R32_UEP1_DMA | 0x40023414 | 端点1缓冲区的起始地址 | 0x00000000 |
| R32_UEP2_DMA | 0x40023418 | 端点2缓冲区的起始地址 | 0x00000000 |
| R32_UEP3_DMA | 0x4002341C | 端点3缓冲区的起始地址 | 0x00000000 |
| R32_UEP0_CTRL | 0x40023420 | 端点0发送长度和控制寄存器 | 0x00000000 |
| R16_UEP0_TX_LEN | 0x40023420 | 端点0发送长度寄存器 | 0x0000 |
| R16_UEP0_CTRL_H | 0x40023422 | 端点0控制寄存器 | 0x0000 |
| R32_UEP1_CTRL | 0x40023424 | 端点1发送长度和控制寄存器 | 0x00000000 |
| R16_UEP1_TX_LEN | 0x40023424 | 端点1发送长度寄存器 | 0x0000 |
| R16_UEP1_CTRL_H | 0x40023426 | 端点1控制寄存器 | 0x0000 |
| R32_UEP2_CTRL | 0x40023428 | 端点2发送长度和控制寄存器 | 0x00000000 |
| R16_UEP2_TX_LEN | 0x40023428 | 端点2发送长度寄存器 | 0x0000 |
| R16_UEP2_CTRL_H | 0x4002342A | 端点2控制寄存器 | 0x0000 |


<a id="pdf-page-208"></a>
<!-- PDF page 208 -->

R32_UEP3_CTRL 0x4002342C 端点 3 发送长度和控制寄存器 0x00000000
R16_UEP3_TX_LEN 0x4002342C 端点 3 发送长度寄存器 0x0000
R16_UEP3_CTRL_H 0x4002342E 端点 3 控制寄存器 0x0000
R32_UEP4_CTRL 0x40023430 端点 4 发送长度和控制寄存器 0x00000000
R16_UEP4_TX_LEN 0x40023430 端点 4 发送长度寄存器 0x0000
R16_UEP4_CTRL_H 0x40023432 端点 4 控制寄存器 0x0000
R32_UEP5_DMA 0x40023454 端点 5 缓冲区的起始地址 0x00000000
R32_UEP6_DMA 0x40023458 端点 6 缓冲区的起始地址 0x00000000
R32_UEP7_DMA 0x4002345C 端点 7 缓冲区的起始地址 0x00000000
R32_UEP5_CTRL 0x40023464 端点 5 发送长度和控制寄存器 0x00000000
R16_UEP5_TX_LEN 0x40023464 端点 5 发送长度寄存器 0x0000
R16_UEP5_CTRL_H 0x40023466 端点 5 控制寄存器 0x0000
R32_UEP6_CTRL 0x40023468 端点 6 发送长度和控制寄存器 0x00000000
R16_UEP6_TX_LEN 0x40023468 端点 6 发送长度寄存器 0x0000
R16_UEP6_CTRL_H 0x4002346A 端点 6 控制寄存器 0x0000
R32_UEP7_CTRL 0x4002346C 端点 7 发送长度和控制寄存器 0x00000000
R16_UEP7_TX_LEN 0x4002346C 端点 7 发送长度寄存器 0x0000
R16_UEP7_CTRL_H 0x4002346E 端点 7 控制寄存器 0x0000
R32_UEPX_MOD 0x40023470 端点 X 控制寄存器 0x00000000
##### 18.2.2.1 USB设备物理端口控制寄存器（R8_UDEV_CTRL）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 7 | RB_UD_PD_DIS | RW | USB 设备端口 UDP/UDM 引脚内部下拉电<br>阻控制位：<br>1：禁用内部下拉；<br>0：使能内部下拉，也可用于 GPIO 模式<br>提供下拉电阻。<br>注：已改由GPIOC_CFGXR的MODE和CNF<br>及GPIOC_OUTDR设置下拉，此位保留 | 1 |
| 6 | Reserved | RO | 保留。 | 0 |
| 5 | RB_UD_DP_PIN | RO | 当前UDP引脚状态：<br>1：高电平；<br>0：低电平。 | X |
| 4 | RB_UD_DM_PIN | RO | 当前UDM引脚状态：<br>1：高电平；<br>0：低电平。 | X |
| 3 | Reserved | RO | 保留。 | 0 |
| 2 | RB_UD_LOW_SPEED | RW | USB设备物理端口低速模式使能位：<br>1：选择1.5Mbps低速模式；<br>0：选择12Mbps全速模式。 | 0 |
| 1 | RB_UD_GP_BIT | RW | USB设备模式通用标志位，用户自定义。 | 0 |
| 0 | RB_UD_PORT_EN | RW | USB设备物理端口使能位：<br>1：使能物理端口；<br>0：禁用物理端口。 | 0 |


<a id="pdf-page-209"></a>
<!-- PDF page 209 -->

##### 18.2.2.2 端点0缓冲区的起始地址（R32_UEP0_DMA）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:15] | Reserved | RO | 保留。 | 0 |
| [14:0] | EP0_BUF_ADDR | RW | 端点0缓冲区的起始地址。<br>低15位有效，地址必须4字节对齐。 | 0 |

注：端点0的收发使能信号始终有效。
##### 18.2.2.3 端点1缓冲区的起始地址（R32_UEP1_DMA）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:15] | Reserved | RO | 保留。 | 0 |
| [14:0] | EP1_BUF_ADDR | RW | 端点1缓冲区的起始地址。<br>低15位有效，地址必须4字节对齐。 | 0 |

注：端点1的收发使能信号始终有效。
##### 18.2.2.4 端点2缓冲区的起始地址（R32_UEP2_DMA）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:15] | Reserved | RO | 保留。 | 0 |
| [14:0] | EP2_BUF_ADDR | RW | 端点2缓冲区的起始地址。<br>低15位有效，地址必须4字节对齐。 | 0 |

注：端点2的收发使能信号始终有效。
##### 18.2.2.5 端点3缓冲区的起始地址（R32_UEP3_DMA）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:15] | Reserved | RO | 保留。 | 0 |
| [14:0] | EP3_BUF_ADDR | RW | 端点3缓冲区的起始地址。<br>低15位有效，地址必须4字节对齐。 | 0 |

注：端点3的收发使能信号始终有效。
##### 18.2.2.6 端点0发送长度和控制寄存器（R32_UEP0_CTRL）

| 位 | 名称 |
| --- | --- |
| [31:16] | R16_UEP0_CTRL_H |
| [15:0] | R16_UEP0_TX_LEN |

##### 18.2.2.7 端点0发送长度寄存器（R16_UEP0_TX_LEN）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:7] | Reserved | RO | 保留。 | 0 |
| [6:0] | EP0_T_LEN | RW | 端点0传输的字节数。 | 0 |

##### 18.2.2.8 端点0控制寄存器（R16_UEP0_CTRL_H）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:8] | Reserved | RO | 保留。 | 0 |
| 7 | EP0_R_TOG | RW | USB 端点 0 的接收器（处理 OUT 事务）<br>准备的同步触发位：<br>1：期望DATA1； | 0 |


<a id="pdf-page-210"></a>
<!-- PDF page 210 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 0：期望DATA0；<br>对于实时/同步传输无效。 |  |
| 6 | EP0_T_TOG | RW | USB端点0的发送器（处理IN事务）准<br>备的同步触发位：<br>1：发送DATA1；<br>0：发送DATA0； | 0 |
| [5:4] | Reserved | RO | 保留。 | 0 |
| [3:2] | EP0_R_RES[1:0] | RW | 端点0的接收器对OUT事务的响应控制：<br>00：数据就绪并期望ACK；<br>01：应答NYET;<br>10：应答NAK或忙；<br>11：应答STALL或错误。<br>对于实时/同步传输无效。 | 0 |
| [1:0] | EP0_T_RES[1:0] | RW | 端点0发送器对IN事务的响应控制位<br>00：期望应答ACK；<br>01：期望应答NYET；<br>10：期望应答NAK或忙；<br>11：期望应答STALL或错误。<br>对于实时/同步传输无效。 | 0 |

##### 18.2.2.9 端点1发送长度和控制寄存器（R32_UEP1_CTRL）

| 位 | 名称 |
| --- | --- |
| [31:16] | R16_UEP1_CTRL_H |
| [15:0] | R16_UEP1_TX_LEN |

##### 18.2.2.10 端点1发送长度寄存器（R16_UEP1_TX_LEN）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:7] | Reserved | RO | 保留。 | 0 |
| [6:0] | EP1_T_LEN | RW | 端点1传输的字节数。 | 0 |

##### 18.2.2.11 端点1控制寄存器（R16_UEP1_CTRL_H）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:8] | Reserved | RO | 保留。 | 0 |
| 7 | EP1_R_TOG | RW | USB 端点 1 的接收器（处理 OUT 事务）<br>准备的同步触发位：<br>1：期望DATA1；<br>0：期望DATA0；<br>对于实时/同步传输无效。 | 0 |
| 6 | EP1_T_TOG | RW | USB端点1的发送器（处理IN事务）准<br>备的同步触发位：<br>1：发送DATA1；<br>0：发送DATA0； | 0 |
| 5 | Reserved | RO | 保留。 | 0 |
| 4 | EP1_TOG_AUTO | RW | 同步触发位自动翻转使能控制位：<br>1：数据收发成功后自动翻转； | 0 |


<a id="pdf-page-211"></a>
<!-- PDF page 211 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 0：不自动翻转，可以手动切换。<br>注：端点0此位为保留位。 |  |
| [3:2] | EP1_R_RES[1:0] | RW | 端点1的接收器对OUT事务的响应控制：<br>00：数据就绪并期望ACK；<br>01：应答NYET；<br>10：应答NAK或忙；<br>11：应答STALL或错误。<br>对于实时/同步传输无效。 | 0 |
| [1:0] | EP1_T_RES[1:0] | RW | 端点1发送器对IN事务的响应控制位：<br>00：期望应答ACK；<br>01：期望应答NYET；<br>10：期望应答NAK或忙；<br>11：期望应答STALL或错误。<br>对于实时/同步传输无效。 | 0 |

##### 18.2.2.12 端点2发送长度和控制寄存器（R32_UEP2_CTRL）

| 位 | 名称 |
| --- | --- |
| [31:16] | R16_UEP2_CTRL_H |
| [15:0] | R16_UEP2_TX_LEN |

##### 18.2.2.13 端点2发送长度寄存器（R16_UEP2_TX_LEN）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:7] | Reserved | RO | 保留。 | 0 |
| [6:0] | EP2_T_LEN | RW | 端点2传输的字节数。 | 0 |

##### 18.2.2.14 端点2控制寄存器（R16_UEP2_CTRL_H）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:8] | Reserved | RO | 保留。 | 0 |
| 7 | EP2_R_TOG | RW | USB 端点 2 的接收器（处理 OUT 事务）<br>准备的同步触发位：<br>1：期望DATA1；<br>0：期望DATA0；<br>对于实时/同步传输无效。 | 0 |
| 6 | EP2_T_TOG | RW | USB端点2的发送器（处理IN事务）准<br>备的同步触发位：<br>1：发送DATA1；<br>0：发送DATA0； | 0 |
| 5 | Reserved | RO | 保留。 | 0 |
| 4 | EP2_TOG_AUTO | RW | 同步触发位自动翻转使能控制位：<br>1：数据收发成功后自动翻转；<br>0：不自动翻转，可以手动切换。<br>注：端点0此位为保留位。 | 0 |
| [3:2] | EP2_R_RES[1:0] | RW | 端点2的接收器对OUT事务的响应控制：<br>00：数据就绪并期望ACK；<br>01：应答NYET； | 0 |


<a id="pdf-page-212"></a>
<!-- PDF page 212 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 10：应答NAK或忙；<br>11：应答STALL或错误。<br>对于实时/同步传输无效。 |  |
| [1:0] | EP2_T_RES[1:0] | RW | 端点2发送器对IN事务的响应控制位：<br>00：期望应答ACK；<br>01：期望应答NYET；<br>10：期望应答NAK或忙；<br>11：期望应答STALL或错误。<br>对于实时/同步传输无效。 | 0 |

##### 18.2.2.15 端点3发送长度和控制寄存器（R32_UEP3_CTRL）

| 位 | 名称 |
| --- | --- |
| [31:16] | R16_UEP3_CTRL_H |
| [15:0] | R16_UEP3_TX_LEN |

##### 18.2.2.16 端点3发送长度寄存器（R16_UEP3_TX_LEN）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:7] | Reserved | RO | 保留。 | 0 |
| [6:0] | EP3_T_LEN | RW | 端点3传输的字节数。 | 0 |

##### 18.2.2.17 端点3控制寄存器（R16_UEP3_CTRL_H）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:8] | Reserved | RO | 保留。 | 0 |
| 7 | EP3_R_TOG | RW | USB 端点 3 的接收器（处理 OUT 事务）<br>准备的同步触发位：<br>1：期望DATA1；<br>0：期望DATA0；<br>对于实时/同步传输无效。 | 0 |
| 6 | EP3_T_TOG | RW | USB端点3的发送器（处理IN事务）准<br>备的同步触发位：<br>1：发送DATA1；<br>0：发送DATA0； | 0 |
| 5 | Reserved | RO | 保留。 | 0 |
| 4 | EP3_TOG_AUTO | RW | 同步触发位自动翻转使能控制位：<br>1：数据收发成功后自动翻转；<br>0：不自动翻转，可以手动切换。<br>注：端点0此位为保留位。 | 0 |
| [3:2] | EP3_R_RES[1:0] | RW | 端点3的接收器对OUT事务的响应控制：<br>00：数据就绪并期望ACK；<br>01：应答NYET；<br>10：应答NAK或忙；<br>11：应答STALL或错误。<br>对于实时/同步传输无效。 | 0 |
| [1:0] | EP3_T_RES[1:0] | RW | 端点3发送器对IN事务的响应控制位：<br>00：期望应答ACK； | 0 |


<a id="pdf-page-213"></a>
<!-- PDF page 213 -->

01：期望应答 NYET；
10：期望应答 NAK 或忙；
11：期望应答 STALL 或错误。
对于实时/同步传输无效。
##### 18.2.2.18 端点4发送长度和控制寄存器（R32_UEP4_CTRL）

| 位 | 名称 |
| --- | --- |
| [31:16] | R16_UEP4_CTRL_H |
| [15:0] | R16_UEP4_TX_LEN |

##### 18.2.2.19 端点4发送长度寄存器（R16_UEP4_TX_LEN）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:7] | Reserved | RO | 保留。 | 0 |
| [6:0] | EP4_T_LEN | RW | 端点4传输的字节数。 | 0 |

##### 18.2.2.20 端点4控制寄存器（R16_UEP4_CTRL_H）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:8] | Reserved | RO | 保留。 | 0 |
| 7 | EP4_R_TOG | RW | USB 端点 4 的接收器（处理 OUT 事务）<br>准备的同步触发位：<br>1：期望DATA1；<br>0：期望DATA0；<br>对于实时/同步传输无效。 | 0 |
| 6 | EP4_T_TOG | RW | USB端点4的发送器（处理IN事务）准<br>备的同步触发位：<br>1：发送DATA1；<br>0：发送DATA0； | 0 |
| [5:4] | Reserved | RO | 保留。 | 0 |
| [3:2] | EP4_R_RES[1:0] | RW | 端点4的接收器对OUT事务的响应控制：<br>00：数据就绪并期望ACK；<br>01：应答NYET；<br>10：应答NAK或忙；<br>11：应答STALL或错误。<br>对于实时/同步传输无效。 | 0 |
| [1:0] | EP4_T_RES[1:0] | RW | 端点4发送器对IN事务的响应控制位：<br>00：期望应答ACK；<br>01：期望应答NYET；<br>10：期望应答NAK或忙；<br>11：期望应答STALL或错误。<br>对于实时/同步传输无效。 | 0 |

##### 18.2.2.21 端点5缓冲区的起始地址（R32_UEP5_DMA）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:15] | Reserved | RO | 保留。 | 0 |
| [14:0] | EP5_BUF_ADDR | RW | 端点5缓冲区的起始地址。 | 0 |


<a id="pdf-page-214"></a>
<!-- PDF page 214 -->

低 15 位有效，地址必须 4 字节对齐。
注：端点5的收发使能信号始终有效。
##### 18.2.2.22 端点6缓冲区的起始地址（R32_UEP6_DMA）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:15] | Reserved | RO | 保留。 | 0 |
| [14:0] | EP6_BUF_ADDR | RW | 端点6缓冲区的起始地址。<br>低15位有效，地址必须4字节对齐。 | 0 |

注：端点6的收发使能信号始终有效。
##### 18.2.2.23 端点7缓冲区的起始地址（R32_UEP7_DMA）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:15] | Reserved | RO | 保留。 | 0 |
| [14:0] | EP7_BUF_ADDR | RW | 端点7缓冲区的起始地址。<br>低15位有效，地址必须4字节对齐。 | 0 |

注：端点7的收发使能信号始终有效。
##### 18.2.2.24 端点5发送长度和控制寄存器（R32_UEP5_CTRL）

| 位 | 名称 |
| --- | --- |
| [31:16] | R16_UEP5_CTRL_H |
| [15:0] | R16_UEP5_TX_LEN |

##### 18.2.2.25 端点5发送长度寄存器（R16_UEP5_TX_LEN）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:7] | Reserved | RO | 保留。 | 0 |
| [6:0] | EP5_T_LEN | RW | 端点5传输的字节数。 | 0 |

##### 18.2.2.26 端点5控制寄存器（R16_UEP5_CTRL_H）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:8] | Reserved | RO | 保留。 | 0 |
| 7 | EP5_R_TOG | RW | USB 端点 5 的接收器（处理 OUT 事务）<br>准备的同步触发位：<br>1：期望DATA1；<br>0：期望DATA0；<br>对于实时/同步传输无效。 | 0 |
| 6 | EP5_T_TOG | RW | USB端点5的发送器（处理IN事务）准<br>备的同步触发位：<br>1：发送DATA1；<br>0：发送DATA0； | 0 |
| 5 | Reserved | RO | 保留。 | 0 |
| 4 | EP5_TOG_AUTO | RW | 同步触发位自动翻转使能控制位：<br>1：数据收发成功后自动翻转；<br>0：不自动翻转，可以手动切换。<br>注：端点0此位为保留位。 | 0 |


<a id="pdf-page-215"></a>
<!-- PDF page 215 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| [3:2] | EP5_R_RES[1:0] | RW | 端点5的接收器对OUT事务的响应控制：<br>00：数据就绪并期望ACK；<br>01：应答NYET；<br>10：应答NAK或忙；<br>11：应答STALL或错误。<br>对于实时/同步传输无效。 | 0 |
| [1:0] | EP5_T_RES[1:0] | RW | 端点5发送器对IN事务的响应控制位：<br>00：期望应答ACK；<br>01：期望应答NYET；<br>10：期望应答NAK或忙；<br>11：期望应答STALL或错误。<br>对于实时/同步传输无效。 | 0 |

##### 18.2.2.27 端点6发送长度和控制寄存器（R32_UEP6_CTRL）

| 位 | 名称 |
| --- | --- |
| [31:16] | R16_UEP6_CTRL_H |
| [15:0] | R16_UEP6_TX_LEN |

##### 18.2.2.28 端点6发送长度寄存器（R16_UEP6_TX_LEN）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:7] | Reserved | RO | 保留。 | 0 |
| [6:0] | EP6_T_LEN | RW | 端点6传输的字节数。 | 0 |

##### 18.2.2.29 端点6控制寄存器（R16_UEP6_CTRL_H）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:8] | Reserved | RO | 保留。 | 0 |
| 7 | EP6_R_TOG | RW | USB 端点 6 的接收器（处理 OUT 事务）<br>准备的同步触发位：<br>1：期望DATA1；<br>0：期望DATA0；<br>对于实时/同步传输无效。 | 0 |
| 6 | EP6_T_TOG | RW | USB端点6的发送器（处理IN事务）准<br>备的同步触发位：<br>1：发送DATA1；<br>0：发送DATA0； | 0 |
| 5 | Reserved | RO | 保留。 | 0 |
| 4 | EP6_TOG_AUTO | RW | 同步触发位自动翻转使能控制位：<br>1：数据收发成功后自动翻转；<br>0：不自动翻转，可以手动切换。<br>注：端点0此位为保留位。 | 0 |
| [3:2] | EP6_R_RES[1:0] | RW | 端点6的接收器对OUT事务的响应控制：<br>00：数据就绪并期望ACK；<br>01：应答NYET；<br>10：应答NAK或忙；<br>11：应答STALL或错误。 | 0 |


<a id="pdf-page-216"></a>
<!-- PDF page 216 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  | 对于实时/同步传输无效。 |  |
| [1:0] | EP6_T_RES[1:0] | RW | 端点6发送器对IN事务的响应控制位：<br>00：期望应答ACK；<br>01：期望应答NYET；<br>10：期望应答NAK或忙；<br>11：期望应答STALL或错误。<br>对于实时/同步传输无效。 | 0 |

##### 18.2.2.30 端点7发送长度和控制寄存器（R32_UEP7_CTRL）

| 位 | 名称 |
| --- | --- |
| [31:16] | R16_UEP7_CTRL_H |
| [15:0] | R16_UEP7_TX_LEN |

##### 18.2.2.31 端点7发送长度寄存器（R16_UEP7_TX_LEN）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:7] | Reserved | RO | 保留。 | 0 |
| [6:0] | EP7_T_LEN | RW | 端点7传输的字节数。 | 0 |

##### 18.2.2.32 端点7控制寄存器（R16_UEP7_CTRL_H）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:8] | Reserved | RO | 保留。 | 0 |
| 7 | EP7_R_TOG | RW | USB 端点 7 的接收器（处理 OUT 事务）<br>准备的同步触发位：<br>1：期望DATA1；<br>0：期望DATA0；<br>对于实时/同步传输无效。 | 0 |
| 6 | EP7_T_TOG | RW | USB端点7的发送器（处理IN事务）准<br>备的同步触发位：<br>1：发送DATA1；<br>0：发送DATA0； | 0 |
| 5 | Reserved | RO | 保留。 | 0 |
| 4 | EP7_TOG_AUTO | RW | 同步触发位自动翻转使能控制位：<br>1：数据收发成功后自动翻转；<br>0：不自动翻转，可以手动切换。<br>注：端点0此位为保留位。 | 0 |
| [3:2] | EP7_R_RES[1:0] | RW | 端点7的接收器对OUT事务的响应控制：<br>00：数据就绪并期望ACK；<br>01：应答NYET；<br>10：应答NAK或忙；<br>11：应答STALL或错误。<br>对于实时/同步传输无效。 | 0 |
| [1:0] | EP7_T_RES[1:0] | RW | 端点7发送器对IN事务的响应控制位：<br>00：期望应答ACK；<br>01：期望应答NYET；<br>10：期望应答NAK或忙； | 0 |


<a id="pdf-page-217"></a>
<!-- PDF page 217 -->

11：期望应答 STALL 或错误。
对于实时/同步传输无效。
##### 18.2.2.33 端点X控制寄存器（R32_UEPX_MOD）

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:24] | Reserved | RO | 保留。 | 0 |
| [23:17] | EP_T_AF | RW | 发送端点复用使能：<br>1：对应复用端点；<br>0：不复用端点。 | 0 |
| 16 | Reserved | RO | 保留。 | 0 |
| [15:8] | EP_R_EN | RW | 端点（8-15）接收使能。 | 0 |
| [7:0] | EP_T_EN | RW | 端点（8-15）发送使能。 | 0 |

#### 18.2.3 USB主机寄存器描述

在 USB 主机模式下，芯片提供了一组双向主机端点，包括一个发送端点 OUT 和一个接收端点 IN，
一个数据包的最大长度是 1024 字节（同步传输），支持控制传输、中断传输、批量传输和实时/同
步传输。
主机端点发起的每一个 USB 事务，在处理结束后总是自动设置 RB_UIF_TRANSFER 中断标志。应
用程序可以直接查询或在 USB 中断服务程序中查询并分析中断标志寄存器 R8_USB_INT_FG，根据各
中断标志分别进行相应的处理；并且，如果 RB_UIF_TRANSFER 有效，那么还需要继续分析 USB 中断
状态寄存器 R8_USB_INT_ST，根据当前 USB 传输事务的应答 PID 标识 MASK_UIS_H_RES 进行相应的处
理。
如果事先设定了主机接收端点的 IN 事务的同步触发位（RB_UH_R_TOG），那么可以通过
RB_U_TOG_OK 或 RB_UIS_TOG_OK 判断当前所接收到的数据包的同步触发位是否与主机接收端点的同
步触发位匹配，如果数据同步，则数据有效；如果数据不同步，则数据应该被丢弃。每次处理完 USB
发送或接收中断后，都应该正确修改相应主机端点的同步触发位，用于同步下次所发送的数据包和
检测下次所接收的数据包是否同步；另外，通过设置 RB_UH_T_AUTO_TOG 和 RB_UH_R_AUTO_TOG 可以
实现在发送成功或接收成功后自动翻转相应的同步触发位。
USB 主机令牌设置寄存器 R8_UH_EP_PID 用于设置被操作的目标设备的端点号和本次 USB 传输事
务的令牌 PID 包标识。SETUP 令牌和 OUT 令牌所对应的数据由主机发送端点提供，准备发送的数据
在 R16_UH_TX_DMA 缓冲区中，准备发送的数据长度设置在 R16_UH_TX_LEN 中；IN 令牌所对应数据由
目标设备返回给主机接收端点，接收到数据存放 R16_UH_RX_DMA 缓冲区中，接收到的数据长度存放
在 R16_USB_RX_LEN 中。
**表 18-4 主机相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R8_HOST_CTRL | 0x40023401 | USB主机物理端口控制寄存器 | 0xX0 |
| R8_HOST_EP_MOD | 0x4002340D | USB主机端点模式控制寄存器 | 0x00 |
| R16_HOST_RX_DMA | 0x40023418 | USB主机接收缓冲区起始地址 | 0xXXXX |
| R16_HOST_TX_DMA | 0x4002341C | USB主机发送缓冲区起始地址 | 0xXXXX |
| R8_HOST_SETUP | 0x40023426 | USB主机辅助设置寄存器 | 0x00 |
| R8_HOST_EP_PID | 0x40023428 | USB主机令牌设置寄存器 | 0x00 |
| R8_HOST_RX_CTRL | 0x4002342A | USB主机接收端点控制寄存器 | 0x00 |
| R8_HOST_TX_LEN | 0x4002342C | USB主机发送长度寄存器 | 0xXX |
| R8_HOST_TX_CTRL | 0x4002342E | USB主机发送端点控制寄存器 | 0x00 |

##### 18.2.3.1 USB主机控制寄存器（R8_HOST_CTRL）


<a id="pdf-page-218"></a>
<!-- PDF page 218 -->

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 7 | RB_UH_PD_DIS | RW | USB 主机端口 UDP/UDM 引脚内部下拉电<br>阻控制位：<br>1：禁用内部下拉；<br>0：使能内部下拉，也可用于 GPIO 模式<br>提供下拉电阻。<br>注：已改由GPIOC_CFGXR的MODE和CNF<br>及GPIOC_OUTDR设置下拉，此位保留 | 1 |
| 6 | Reserved | RO | 保留。 | 0 |
| 5 | RB_UH_DP_PIN | RO | 当前UDP引脚状态：<br>1：高电平；<br>0：低电平。 | X |
| 4 | RB_UH_DM_PIN | RO | 当前UDM引脚状态：<br>1：高电平；<br>0：低电平。 | X |
| 3 | Reserved | RO | 保留。 | 0 |
| 2 | RB_UH_LOW_SPEED | RW | USB主机端口低速模式使能位：<br>1：选择1.5Mbps低速模式；<br>0：选择12Mbps全速模式。 | 0 |
| 1 | RB_UH_BUS_RESET | RW | USB主机模式总线复位控制位：<br>1：强制输出USB总线复位；<br>0：结束输出。 | 0 |
| 0 | RB_UH_PORT_EN | RW | USB主机端口使能位：<br>1：使能主机端口；<br>0：禁用主机端口。<br>当USB设备断开连接时，该为自动清0。 | 0 |

##### 18.2.3.2 USB主机端点模式控制寄存器(R8_HOST_EP_MOD)

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 7 | Reserved | RO | 保留。 | 0 |
| 6 | RB_UH_EP_TX_EN | RW | 主机发送端点发送（SETUP/OUT）使能位：<br>1：使能端点发送；<br>0：禁止端点发送。 | 0 |
| 5 | Reserved | RO | 保留。 | 0 |
| 4 | RB_UH_EP_TBUF_MOD | RW | 主机发送端点发送数据缓冲区模式控制<br>位。 | 0 |
| 3 | RB_UH_EP_RX_EN | RW | 主机接收端点接收（IN）使能位：<br>1：使能端点接收；<br>0：禁止端点接收。 | 0 |
| [2:1] | Reserved | RO | 保留。 | 00b |
| 0 | RB_UH_EP_RBUF_MOD | RW | USB 主机接收端点接收数据缓冲区模式<br>控制位。 | 0 |

由 RB_UH_EP_TX_EN 和 RB_UH_EP_TBUF_MOD 组合控制主机发送端点数据缓冲区模式，参考下表。
**表 18-5 主机发送缓冲区模式**

RB_UH_EP_TX_EN RB_UH_EP_TBUF_MOD 描述：以 R16_UH_TX_DMA 为起始地址

<a id="pdf-page-219"></a>
<!-- PDF page 219 -->

0 X 端点被禁用，未用到 R16_UH_TX_DMA 缓冲区。
1 0 单 64 字节发送缓冲区（SETUP/OUT）。
双 64 字节发送缓冲区，通过 RB_UH_T_TOG 选择：
1 1 当 RB_UH_T_TOG=0 时选择前 64 字节缓冲区；
当 RB_UH_T_TOG=1 时选择后 64 字节缓冲区。
由 RB_UH_EP_RX_EN 和 RB_UH_EP_RBUF_MOD 组合控制主机接收端点数据缓冲区模式，参考下表。
**表 18-6 主机接收缓冲区模式**

RB_UH_EP_RX_EN RB_UH_EP_RBUF_MOD 结构描述：以 R16_UH_TX_DMA 为起始地址
0 X 端点被禁用，未用到 R16_UH_RX_DMA 缓冲区。
1 0 单 64 字节接收缓冲区（IN）。
双 64 字节接收缓冲区，通过 RB_UH_R_TOG 选择：
1 1 当 RB_UH_R_TOG=0 时选择前 64 字节缓冲区；
当 RB_UH_R_TOG=1 时选择后 64 字节缓冲区。
##### 18.2.3.3 USB主机接收缓冲区起始地址(R16_HOST_RX_DMA)

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:0] | R16_UH_RX_DMA | RW | 主机端点数据接收缓冲区起始地址。<br>低15位有效，地址必须4字节对齐。 | XXXXh |

##### 18.2.3.4 USB主机发送缓冲区起始地址(R16_HOST_TX_DMA)

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:0] | R16_UH_TX_DMA | RW | 主机端点数据发送缓冲区起始地址。<br>低15位有效，地址必须4字节对齐。 | XXXXh |

##### 18.2.3.5 USB主机辅助设置寄存器(R8_HOST_SETUP)

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 7 | RB_UH_PRE_PID_EN | RW | 低速前导包PRE PID使能位：<br>1：使能，用于通过外部HUB与低速USB<br>设备通讯。<br>0：禁用低速前导包。 | 0 |
| 6 | RB_UH_SOF_EN | RW | 自动产生SOF包使能位：<br>1：主机自动产生SOF包；<br>0：不自动产生，但可手工产生。 | 0 |
| [5:0] | Reserved | RO | 保留。 | 000000b |

##### 18.2.3.6 USB主机令牌设置寄存器(R8_HOST_EP_PID)

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [7:4] | MASK_UH_TOKEN | RW | 设置本次 USB传输事务的令牌 PID包标<br>识。 | 0000b |
| [3:0] | MASK_UH_ENDP | RW | 设置本次被操作的目标设备的端点号。 | 0000b |

##### 18.2.3.7 USB主机接收端点控制寄存器(R8_HOST_RX_CTRL)

位名称访问描述复位值

<a id="pdf-page-220"></a>
<!-- PDF page 220 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| 7 | RB_UH_R_TOG | RW | USB主机接收器（处理IN事务）期望的<br>同步触发位：<br>1：期望DATA1；<br>0：期望DATA0。 | 0 |
| [6:5] | Reserved | RO | 保留。 | 00b |
| 4 | RB_UH_R_AUTO_TOG | RW | 同步触发位自动翻转使能控制位：<br>1：数据接收成功后自动翻转相应的期待<br>同步触发位(RB_UH_R_TOG)；<br>0：不自动翻转，可以手动切换。 | 0 |
| 3 | Reserved | RO | 保留。 | 0 |
| 2 | RB_UH_R_RES | RW | 主机接收器对IN事务的响应控制位：<br>1：无响应，用于非 0 端点的实时/同步<br>传输；<br>0：应答ACK。 | 0 |
| [1:0] | Reserved | RO | 保留。 | 00b |

##### 18.2.3.8 USB主机发送长度寄存器(R8_HOST_TX_LEN)

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [7:0] | R8_UH_TX_LEN | RW | 设置 USB 主机发送端点准备发送的数据<br>字节数。 | XXh |

##### 18.2.3.9 USB主机发送端点控制寄存器(R8_HOST_TX_CTRL)

| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 7 | Reserved | RO | 保留。 | 0 |
| 6 | RB_UH_T_TOG | RW | USB主机发送器（处理SETUP/OUT事务）<br>准备的同步触发位：<br>1：表示发送DATA1；<br>0：表示发送DATA0。 | 0 |
| 5 | Reserved | RO | 保留。 | 0 |
| 4 | RB_UH_T_AUTO_TOG | RW | 同步触发位自动翻转使能控制位：<br>1：数据发送成功后自动翻转相应的同步<br>触发位(RB_UH_T_TOG)；<br>0：不自动翻转，可以手动切换。 | 0 |
| [3:1] | Reserved | RO | 保留。 | 000b |
| 0 | RB_UH_T_RES | RW | USB 主机发送器对 SETUP/OUT 事务的响<br>应控制位：<br>1：期望无响应，用于非 0 端点的实时/<br>同步传输；<br>0：期望应答ACK。 | 0 |

注：复位的时间由RB_UH_TX_BUS_RST的高电平持续时间决定（建议至少10ms，复位结束之后再等
数us就可以直接查询速度类型）。如果主机唤醒设备，bUH_TX_BUS_RESUME拉高之后，硬件自动发
送 30ms 的唤醒信号（K），bUH_TX_BUS_RESUME 需要手动清除，以免影响下一次主机挂起
（bUH_TX_BUS_RESUME高电平至少维持50ns）。

<a id="pdf-page-221"></a>
<!-- PDF page 221 -->

## 第19章 电子签名（ESIG）

电子签名包含了芯片识别信息：闪存区容量和唯一身份标识。它由厂家在出厂时烧录到存储器
模块的系统存储区域，可以通过 SWD（SDI）或者应用代码读取。
### 19.1 功能描述

闪存区容量：指示当前芯片用户应用程序可以使用大小。
唯一身份标识：96 位二进制码，对任意一个微控制器都是唯一的，用户只能读访问不能修改。
此唯一标识信息可以用作微控制器（产品）的安全密码、加解密钥、产品序列号等，用来提高系统
安全机制或表明身份信息。
以上内容用户都可以按 8/16/32 位进行读访问。
### 19.2 寄存器描述

**表 19-1 ESIG 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R16_ESIG_FLACAP | 0x1FFFF7E0 | 闪存容量寄存器 | 0xXXXX |
| R32_ESIG_UNIID1 | 0x1FFFF7E8 | UID寄存器1 | 0xXXXXXXXX |
| R32_ESIG_UNIID2 | 0x1FFFF7EC | UID寄存器2 | 0xXXXXXXXX |
| R32_ESIG_UNIID3 | 0x1FFFF7F0 | UID寄存器3 | 0xXXXXXXXX |

#### 19.2.1 闪存容量寄存器（ESIG_FLACAP）

15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
F_SIZE[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:0] | F_SIZE | RO | 以Kbyte为单位的闪存容量。<br>例：0x0080 = 128K字节。 | X |

#### 19.2.2 UID寄存器（ESIG_UNIID1）

31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
U_ID[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
U_ID[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | U_ID[31:0] | RO | UID的0-31位。 | X |

#### 19.2.3 UID寄存器（ESIG_UNIID2）

31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
U_ID[63:48]

<a id="pdf-page-222"></a>
<!-- PDF page 222 -->

15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
U_ID[47:32]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | U_ID[63:32] | RO | UID的32-63位。 | X |

#### 19.2.4 UID寄存器（ESIG_UNIID3）

31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
U_ID[95:80]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
U_ID[79:64]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | U_ID[95:64] | RO | UID的64-95位。 | X |


<a id="pdf-page-223"></a>
<!-- PDF page 223 -->

## 第20章 闪存及用户选择字（FLASH）

### 20.1 闪存组织

芯片内部闪存组织结构如下：
**表 20-1 闪存组织结构**

块名称地址范围长度（字节）
页 0 0x0800 0000 - 0x0800 00FF 256
页 1 0x0800 0100 - 0x0800 01FF 256
页 2 0x0800 0200 - 0x0800 02FF 256
主存储器
页 3 0x0800 0300 - 0x0800 03FF 256
… … …
页 247 0x0800 F700- 0x0800 F7FF 256
启动程序代码 0x1FFF 0000 - 0x1FFF 0CFF 3K+256
信息块用户选择字 0x1FFF F800 - 0x1FFF F8FF 256
厂商配置字 0x1FFF F700 - 0x1FFF F7FF 256
注：
1） 上述主存储器区域用于用户的应用程序存储，以2K字节（8页）单位进行写保护划分；
除了“厂商配置字”区域出厂锁定，用户不可访问，其他区域在一定条件下用户可操作。
### 20.2 闪存编程及安全性

- 快速编程：此方式采用页操作方式（推荐）。经过特定序列解锁后，执行单次 256 字节的编程及
256 字节擦除、1K 字节擦除、整片擦除。
#### 20.2.2 安全性-防止非法访问（读、写、擦）

- 页写入保护
- 读保护
芯片处于读保护状态下时：
1） 主存储器 0-7 页（2K 字节）自动写保护状态，不受 FLASH_WPR 寄存器控制；解除读保护状态，
所有主存储页都由 FLASH_WPR 寄存器控制。
2） 系统引导代码区、SWD 模式、RAM 区域都不可对主存储器进行擦除或编程，整片擦除除外。可擦
除或编程用户选择字区域。如果试图解除读保护（编程用户字），芯片将自动擦除整片用户区。
注：进行闪存的编程/擦除操作时，必须打开内部RC振荡器（HSI）。
### 20.3 寄存器描述

**表 20-2 FLASH 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R32_FLASH_ACTLR | 0x40022000 | 控制寄存器 | 0x00000000 |
| R32_FLASH_KEYR | 0x40022004 | FPEC键寄存器 | 0xXXXXXXXX |
| R32_FLASH_OBKEYR | 0x40022008 | OBKEY寄存器 | 0xXXXXXXXX |
| R32_FLASH_STATR | 0x4002200C | 状态寄存器 | 0x0000B000 |
| R32_FLASH_CTLR | 0x40022010 | 配置寄存器 | 0x00008080 |
| R32_FLASH_ADDR | 0x40022014 | 地址寄存器 | 0x00000000 |


<a id="pdf-page-224"></a>
<!-- PDF page 224 -->

R32_FLASH_OBR 0x4002201C 选择字寄存器 0x0XXXXXXX
R32_FLASH_WPR 0x40022020 写保护寄存器 0xXXXXXXXX
R32_FLASH_MODEKEYR 0x40022024 扩展键寄存器 0xXXXXXXXX
R32_BOOT_MODEKEYR 0x40022028 解锁 BOOT 键寄存器 0xXXXXXXXX
#### 20.3.1 访问控制寄存器（FLASH_ACTLR）

偏移地址：0x00
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
LATENCY
Reserved
[1:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:2] | Reserved | RO | 保留 | 0 |
| [1:0] | LATENCY[1:0] | RW | FLASH等待状态数：<br>00：0等待（HCLK<=12MHz）；<br>01：1等待（12MHz<HCLK<=24MHz）；<br>10：2等待（24MHz<HCLK<=48MHz）；<br>11：无效。 | 0 |

#### 20.3.2 FPEC键寄存器（FLASH_KEYR）

偏移地址：0x04
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
KEYR[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
KEYR[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | KEYR[31:0] | WO | FPEC键，用于输入FPEC的解锁键包括：<br>KEY1 = 0x45670123；<br>KEY2 = 0xCDEF89AB。 | X |

#### 20.3.3 OBKEY寄存器（FLASH_OBKEYR）

偏移地址：0x08
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
OBKEYR[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
OBKEYR[15:0]
位名称访问描述复位值

<a id="pdf-page-225"></a>
<!-- PDF page 225 -->

选择字键，用于输入选择字键解除 OBWRE。
KEY1 = 0x45670123；
[31:0] OBKEYR[31:0] WO X
KEY2 = 0xCDEF89AB。
（注意：需要先解锁 FLASH）
#### 20.3.4 状态寄存器（FLASH_STATR）

偏移地址：0x0C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
STATU FWAKE WRPRT
LOCK MODE AVA Reserved TURBO EOP Reserved BSY
S _FLAG ERR
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:16] | Reserved | RO | 保留 | 0 |
| 15 | BOOT_LOCK | RW | BOOT区锁住：<br>1：锁住；<br>0：解锁。 | 1 |
| 14 | BOOT_MODE | RW | 和 BOOT_AVA 结合可以控制用户区和 BOOT 区<br>之间的切换：<br>1：软件复位之后可以切换到BOOT区；<br>0：软件复位之后可以切换到用户区。 | 0 |
| 13 | BOOT_STATUS | RO | 当前执行的程序来源：<br>1：表示从BOOT区加载的程序。 | 1 |
| 12 | BOOT_AVA | RO | 初始化配置字状态：<br>1：表示从BOOT区启动。 | 1 |
| [11:8] | Reserved | RO | 保留。 | 0 |
| 7 | TURBO | RO | TURBO模式使能：<br>1：表示处于TURBO模式；<br>0：无影响。 | 0 |
| 6 | FWAKE_FLAG | RW0 | FLASH唤醒标志，写0清零：<br>1：FALSH被唤醒；<br>0：无影响。 | 0 |
| 5 | EOP | RW1 | 指示操作结束，写1清零。<br>每次成功擦除或编程时，硬件会置位。 | 0 |
| 4 | WRPRTERR | RW1 | 指示写保护错误，写1清零。<br>如果对写保护的地址编程时，硬件会置位。 | 0 |
| [3:1] | Reserved | RO | 保留。 | 0 |
| 0 | BSY | RO | 指示忙状态：<br>1：表示闪存操作正在进行；<br>0：操作结束。 | 0 |

注：进行编程操作时，需要确定FLASH_CTLR寄存器的STRT位为0。
#### 20.3.5 控制寄存器（FLASH_CTLR）

偏移地址：0x10
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved BANK Reserved BUFR BUFLO FTER FTPG

<a id="pdf-page-226"></a>
<!-- PDF page 226 -->

ERAS ST AD
E
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reser FWAKE Reser Reser Reser
FLOCK EOPIE ERRIE OBWRE LOCK STRT OBER Reserved MER PER
ved IE ved ved ved
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:24] | Reserved | RO | 保留。 | 0 |
| 23 | BER32 | RW | 执行块擦除32KB。<br>注：仅擦除0x08000000-0x08007FFF地址。 | 0 |
| [22:20] | Reserved | RO | 保留。 | 0 |
| 19 | BUFRST | RW | 缓冲区BUF复位操作。 | 0 |
| 18 | BUFLOAD | RW | 将数据缓存到BUF中。 | 0 |
| 17 | FTER | RW | 执行快速页（256Byte）擦除操作。 | 0 |
| 16 | FTPG | RW | 执行快速页编程操作。 | 0 |
| 15 | FLOCK | RW1 | 快速编程锁。只能写‘1’。当该位为‘1’<br>时表示快速编程/擦除模式不可用。在检测到<br>正确的解锁序列后，硬件清除此位为‘0’。<br>软件置1，重新加锁。 | 1 |
| 14 | Reserved | RO | 保留。 | 0 |
| 13 | FWAKEIE | RW | 唤醒中断使能，当 FLASH 从低功耗模式中唤<br>醒时会产生一个标志位，如果唤醒中断使能<br>被置位则会产生一个中断信号，否则无作用。 | 0 |
| 12 | EOPIE | RW | 操作完成中断控制（FLASH_STATR 寄存器中<br>EOP置位）：<br>1：允许产生中断；<br>0：禁止产生中断。 | 0 |
| 11 | Reserved | RO | 保留。 | 0 |
| 10 | ERRIE | RW | 错误状态中断控制（FLASH_STATR 寄存器中<br>PGERR/WRPRTERR置位）：<br>1：允许产生中断；<br>0：禁止产生中断。 | 0 |
| 9 | OBWRE | RW0 | 用户选择字锁，软件清0：<br>1：表示可以对用户选择字进行编程操作。需<br>要在 FLASH_OBKEYR 寄存器中写入正确序列<br>后由硬件置位。<br>0：软件清零后重新加锁用户选择字。 | 0 |
| 8 | Reserved | RO | 保留。 | 0 |
| 7 | LOCK | RW1 | 锁。只能写‘1’。当该位为‘1’时表示FPEC<br>和FLASH_CTLR被锁住不可写。在检测到正确<br>的解锁序列后，硬件清除此位为‘0’。<br>在一次不成功的解锁操作后，直到下次系统<br>复位前，该位不会再改变。 | 1 |
| 6 | STRT | RW1 | 开始。置 1 启动一次擦除动作，硬件自动清<br>0（BSY变‘0’）。 | 0 |


<a id="pdf-page-227"></a>
<!-- PDF page 227 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| 5 | OBER | RW | 执行用户选择字擦除。 | 0 |
| [4:3] | Reserved | RO | 保留。 | 0 |
| 2 | MER | RW | 执行全擦除操作（擦除整个用户区）。 | 0 |
| 1 | PER | RW | 执行扇区擦除。 | 0 |
| 0 | Reserved | RO | 保留。 | 0 |

#### 20.3.6 地址寄存器（FLASH_ADDR）

偏移地址：0x14
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
FAR[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
FAR[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | FAR | WO | 闪存地址，进行编程时为编程的地址，进行<br>擦除时为擦除的起始地址。<br>当FLASH_STATR寄存器中的BSY位为‘1’时，<br>不能写此寄存器。 | 0 |

#### 20.3.7 选择字寄存器（FLASH_OBR）

偏移地址：0x1C
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved DATA1 DATA0
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reser STANDY STOP IWDG RDP
DATA0 FIX_11 RST_MODE OBERR
ved _RST _RST SW RT
| 位 | 名称 |  | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- | --- |
| [31:26] | Reserved |  | RO | 保留。 | 0 |
| [25:18] | DATA1 |  | RO | 数据字节1。 | X |
| [17:10] | DATA0 |  | RO | 数据字节0。 | X |
| [9:8] | FIX_11 |  | RO | 固定为11。 | 11b |
| 7 | USER | Reserved | RO | 保留。 | X |
| [6:5] |  | RST_MODE | RO | 配置字复位延迟时间。 | X |
| 4 |  | STANDY_RST | RO | 待机模式下系统复位控制。 | X |
| 3 |  | STOP_RST | RO | 停止模式下系统复位控制。 | X |
| 2 |  | IWDGSW | RO | 独立看门狗（IWDG）硬件使能位。 | 1 |
| 1 | RDPRT |  | RO | 读保护状态。<br>1：表示闪存当前读保护有效。 | 1 |
| 0 | OBERR |  | RO | 选择字错误。<br>1：表示选择字和它的反码不匹配。 | 0 |

注：USER和RDPRT在系统复位后从用户选择字区域加载。

<a id="pdf-page-228"></a>
<!-- PDF page 228 -->

#### 20.3.8 写保护寄存器（FLASH_WPR）

偏移地址：0x20
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
WPR[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
WPR[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | WPR | RO | 闪存写保护状态。<br>1：写保护失效；<br>0：写保护有效。<br>每个比特位代表2K字节（8页）存储写保护<br>状态。 | X |

注：WPR在系统复位后从用户选择字区域加载。
#### 20.3.9 扩展键寄存器（FLASH_MODEKEYR）

偏移地址：0x24
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
MODEKEYR[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
MODEKEYR[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | MODEKEYR[31:0] | WO | 输入下面序列解锁快速编程/擦除模式：<br>KEY1 = 0x45670123；<br>KEY2 = 0xCDEF89AB。<br>（注意：需要先解锁FLASH） | X |

#### 20.3.10 BOOT键寄存器（BOOT_MODEKEYP）

31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
MODEKEYR[31:16]
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
MODEKEYR[15:0]
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:0] | MODEKEYR[31:0] | WO | 输入下面序列解锁BOOT区<br>KEY1 = 0x45670123；<br>KEY2 = 0xCDEF89AB。 | X |


<a id="pdf-page-229"></a>
<!-- PDF page 229 -->

### 20.4 闪存操作流程

#### 20.4.1 读操作

在通用地址空间内进行直接寻址，任何 8/16/32 位数据的读操作都能访问闪存模块的内容并得到
相应的数据。
#### 20.4.2 解除闪存锁

系统复位后，闪存控制器（FPEC）和 FLASH_CTLR 寄存器是被锁定的，不可访问。通过写入序列
到 FLASH_KEYR 寄存器可解锁闪存控制器模块。
解锁序列：
1） 向 FLASH_KEYR 寄存器写入 KEY1 = 0x45670123（第 1 步必须是 KEY1）；
2） 向 FLASH_KEYR 寄存器写入 KEY2 = 0xCDEF89AB（第 2 步必须是 KEY2）。
上述操作必须按序并连续执行，否则属于错误操作，会锁死 FPEC 模块和 FLASH_CTLR 寄存器并产
生总线错误，直到下次系统复位。
闪存控制器（FPEC）和 FLASH_CTLR 寄存器可以通过将 FLASH_CTLR 寄存器的“LOCK”位，置 1 来
再次锁定。
#### 20.4.3 主存储器标准擦除

闪存可以按标准页（1K 字节）擦除，也可以整片擦除。
**图 20-1 FLASH 页擦除**

Readthe LOCKbitof
FLASH_CTRL
YES Perform "UnlockFlash
LOCKbit=1?
Memory" operation
NO
SetFLASH_CTLR的PERbit=1
Write the erasedpage header
addressinFLASH_ADDRregister
(erase8 pages atatime)
SetFLASH_CTLRSTRT bit=1
bit=1？ YES
BSY
NO
Readouterasepage data
verification
Continue YES
erasing?
NO
Over，PEGbit=0
1）检查 FLASH_CTLR 寄存器 LOCK 位，如果为 1，需要执行“解除闪存锁”操作。
2）设置 FLASH_CTLR 寄存器的 PER 位为‘1’，开启标准页擦除模式。
3）向 FLASH_ADDR 寄存器写入选择擦除的页首地址。
4）设置 FLASH_CTLR 寄存器的 STRT 位为‘1’，启动一次擦除动作。
5）等待 BSY 位变为‘0’或 FLASH_STATR 寄存器的 EOP 位为‘1’表示擦除结束，将 EOP 位清 0。
6）读擦除页的数据进行校验。
7）继续标准页擦除可以重复 3-5 步骤，结束擦除将 PEG 位清 0。
注：擦除成功后，字读- 0xFF。

<a id="pdf-page-230"></a>
<!-- PDF page 230 -->

**图 20-2 FLASH 整片擦除**

Readthe LOCKbitof
FLASH_CTRL
YES Perform "UnlockFlash
LOCK bit=1?
Memory" operation
NO
SetFLASH_CTLRMERbit=1
SetFLASH_CTLRSTRT bit=1
BSYbit=1？ YES
NO
Readoutallpagesof data to
verify
Over，MEG
bit=0
1）检查 FLASH_CTLR 寄存器 LOCK 位，如果为 1，需要执行“解除闪存锁”操作。
2）设置 FLASH_CTLR 寄存器的 MER 位为‘1’，开启整片擦除模式。
3）设置 FLASH_CTLR 寄存器的 STRT 位为‘1’，启动擦除动作。
4）等待 BSY 位变为‘0’或 FLASH_STATR 寄存器的 EOP 位为‘1’表示擦除结束，将 EOP 位清 0。
5）读擦除页的数据进行校验。
6）将 MER 位清 0。
#### 20.4.4 快速编程模式解锁

通过写入序列到 FLASH_MODEKEYR 寄存器可解锁快速编程模式操作。解锁后，FLASH_CTLR 寄存器
的 FLOCK 位将清 0，表示可以进行快速擦除和编程操作。通过将 FLASH_CTLR 寄存器的“FLOCK”位软
件置 1 来再次锁定。
解锁序列：
1）向 FLASH_MODEKEYR 寄存器写入 KEY1 = 0x45670123；
2）向 FLASH_MODEKEYR 寄存器写入 KEY2 = 0xCDEF89AB。
上述操作必须按序并连续执行，否则属于错误操作会锁定，直到下次系统复位才能重新解锁。
注：快速编程操作需要解除“LOCK”和“FLOCK”两层锁定。
#### 20.4.5 主存储器快速编程

快速编程按页（256 字节）进行编程。
1）检查 FLASH_CTLR 寄存器 LOCK 位，如果为‘1’，需要执行“解除闪存锁”操作。
2）检查 FLASH_CTLR 寄存器 FLOCK 位，如果为‘1’，需要执行“快速编程模式解锁”操作。
3）检查 FLASH_STATR 寄存器的 BSY 位，以确认没有其他正在进行的编程操作。
4）设置 FLASH_CTLR 寄存器的 FTPG 位为‘1’，使能快速页编程模式。
5）设置 FLASH_CTLR 寄存器的 BUFRST 位，执行清除内部 256 字节缓存区操作。
6）等待 BSY 位变为‘0’或 FLASH_STATR 寄存器的 EOP 位为‘1’表示清除结束，将 EOP 位清 0。
7）使用 32 位方式向 FLASH 地址写入数据，例如
*（uint32_t*）0x8000000 = 0x12345678；
8）然后设置 FLASH_CTLR 寄存器的 BUFLOAD 位，执行加载到缓存区。
9）等待 FLASH_STATR 寄存器的 BSY 为‘0’，写入下个数据。
10）重复步骤 7-9 共 64 次，将 256 字节数据都加载到缓存区（主要 64 轮操作地址要连续）。
11）向 FLASH_ADDR 寄存器写入快速编程页的首地址。
12）设置 FLASH_CTLR 寄存器的 STRT 位为‘1’，启动快速页编程。

<a id="pdf-page-231"></a>
<!-- PDF page 231 -->

13）等待 BSY 位变为‘0’或 FLASH_STATR 寄存器的 EOP 位为‘1’表示一次快速页编程完成，将 EOP
位清 0。
14）查询 FLASH_STATR 寄存器看是否有错误，或者读编程地址数据校验。
15）继续快速页编程可以重复 5-14 步骤，结束编程将 FTPG 位清 0。
#### 20.4.6 主存储器快速擦除

快速擦除按页（256 字节）进行擦除。
1）检查 FLASH_CTLR 寄存器 LOCK 位，如果为 1，需要执行“解除闪存锁”操作。
2）检查 FLASH_CTLR 寄存器 FLOCK 位，如果为 1，需要执行“快速编程模式解锁”操作。
3）检查 FLASH_STATR 寄存器的 BSY 位，以确认没有其他正在进行的编程操作。
4）设置 FLASH_CTLR 寄存器的 FTER 位为‘1’，开启快速页擦除（256 字节）模式功能。
5）向 FLASH_ADDR 寄存器写入快速擦除页的首地址。
6）设置 FLASH_CTLR 寄存器的 STRT 位为‘1’，启动一次快速页擦除（256 字节）动作。
7）等待 BSY 位变为‘0’或 FLASH_STATR 寄存器的 EOP 位为‘1’表示擦除结束，将 EOP 位清 0。
8）查询 FLASH_STATR 寄存器看是否有错误，或者读擦除页地址数据校验。
9）继续快速页擦除可以重复 5-8 步骤，结束擦除将 FTER 位清 0。
注：擦除成功后，字读- 0xFF。
快速擦除按块（32K 字节）进行擦除。
1）检查 FLASH_CTLR 寄存器 LOCK 位，如果为 1，需要执行“解除闪存锁”操作。
2）检查 FLASH_CTLR 寄存器 FLOCK 位，如果为 1，需要执行“快速编程模式解锁”操作。
3）检查 FLASH_STATR 寄存器的 BSY 位，以确认没有其他正在进行的编程操作。
4）设置 FLASH_CTLR 寄存器的 BER32 位为‘1’，开启快速块擦除（32K 字节）模式功能。
5）向 FLASH_ADDR 寄存器写入快速擦除块的首地址。
6）设置 FLASH_CTLR 寄存器的 STRT 位为‘1’，启动一次快速块擦除（32K 字节）动作。
7）等待 BSY 位变为‘0’或 FLASH_STATR 寄存器的 EOP 位为‘1’表示擦除结束，将 EOP 位清 0。
8）查询 FLASH_STATR 寄存器看是否有错误，或者读擦除页地址数据校验。
9）继续快速页擦除可以重复 5-8 步骤，结束擦除将 BER32 位清 0。
注：擦除成功后，字读- 0xFF。
### 20.5 用户选择字

用户选择字固化在 FLASH 中，在系统复位后会被重新装载到相应寄存器，用户可以任意的进行擦
除和编程。用户选择字信息块总共有 8 个字节（4 个字节为写保护，1 个字节为读保护，1 个字节为
配置选项，2 个字节存储用户数据），每个位都有其反码位用于装载过程中的校验。下面描述了选择
字信息结构和意义。
**表 20-3 32 位选择字格式划分**

[31:24] [23:16] [15:8] [7:0]
选择字字节 1 反码选择字字节 1 选择字字节 0 反码选择字字节 0
**表 20-4 用户选择字信息结构**

地址
[31:24] [23:16] [15:8] [7:0]
位
0x1FFFF800 nUSER USER nRDPR RDPR
0x1FFFF804 nData1 Data1 nData0 Data0
0x1FFFF808 nWRPR1 WRPR1 nWRPR0 WRPR0

<a id="pdf-page-232"></a>
<!-- PDF page 232 -->

0x1FFFF80C nWRPR3 WRPR3 nWRPR2 WRPR2
| 名称/字节 |  |  | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| RDPR |  |  | 读保护控制位，配置是否可以读出闪存中的代码。<br>0xA5：若此字节为0xA5（nRDP必须为0x5A），表示<br>当前代码处于非读保护状态，可以读出；<br>其他值：表示代码读保护状态，不可读，0-7页（2K）<br>将自动写保护，不受WRPR0控制。 | 0xA5 |
| USER | [7:5] | Reserved | 保留。 | xxxb |
|  | [4:3] | RST_MODE | 外部复位引脚RST使能：<br>00：开启RST复用功能；<br>11：复用功能关闭，PA21/PC3/PB7为GPIO功能。<br>注：不同封装的复位引脚，参考数据手册中引脚说明。<br>例如，64脚R8T6和48脚C8T6封装中PA21可以复<br>用作为外部复位引脚。 | 11b |
|  | 2 | STANDYRST | 待机模式下系统复位控制：<br>1：不启用，进入待机模式系统不复位；<br>0：启用，进入待机模式产生系统复位。 | 1 |
|  | 1 | STOPRST | 停止模式下系统复位控制：<br>1：不启用，进入停止模式不复位系统；<br>0：启用，进入停止模式产生系统复位。 | 1 |
|  | 0 | IWDGSW | 独立看门狗（IWDG）硬件使能位：<br>1：IWDG功能由软件开启，禁止硬件开启；<br>0：IWDG功能由硬件开启（随HSI时钟决定）。 | 1 |
| Data0–Data1 |  |  | 存储用户数据2字节。 | 0xFFFF |
| WRPR0 - WRPR3 |  |  | 写保护控制位。每个比特位用于控制主存储器中 2<br>个扇区（1K字节/扇区）的写保护状态：<br>1：关闭写保护；<br>0：启用写保护。<br>4个字节用于保护总共65K字节的主存储器。<br>WRPO：第0-15扇区存储写保护控制；<br>WRP1：第16-31扇区存储写保护控制；<br>WRP2：第32-47扇区存储写保护控制；<br>WRP3：位0-6提供第48-61扇区的写保护；位7提供<br>第62扇区（3328字节的系统存储器）的写保护。 | 0xFFFFFFFF |

#### 20.5.1 用户选择字解锁

通过写入序列到 FLASH_OBKEYR 寄存器可解锁用户选择字操作。解锁后，FLASH_CTLR 寄存器的
OBWRE 位将置 1，表示可以进行用户选择字的擦除和编程。通过将 FLASH_CTLR 寄存器的“OBWRE”位，
软件清 0 来再次锁定。
解锁序列：
1）向 FLASH_OBKEYR 寄存器写入 KEY1 = 0x45670123；
2）向 FLASH_OBKEYR 寄存器写入 KEY2 = 0xCDEF89AB。
注：用户选择字操作需要解除“LOCK”和“OBWRE”两层锁定。

<a id="pdf-page-233"></a>
<!-- PDF page 233 -->

#### 20.5.2 用户选择字编程

1）检查 FLASH_CTLR 寄存器 LOCK 位，如果为‘1’，需要执行“解除闪存锁”操作。
2）检查 FLASH_CTLR 寄存器 FLOCK 位，如果为‘1’，需要执行“快速编程模式解锁”操作。
3）检查 FLASH_STATR 寄存器的 BSY 位，以确认没有其他正在进行的编程操作。
4）设置 FLASH_CTLR 寄存器的 FTPG 位为‘1’，使能快速页编程模式。
5）设置 FLASH_CTLR 寄存器的 BUFRST 位，执行清除内部 256 字节缓存区操作。
6）等待 BSY 位变为‘0’或 FLASH_STATR 寄存器的 EOP 位为‘1’表示清除结束，将 EOP 位清 0。
7）使用 32 位方式向 FLASH 地址写入数据，例如
*（uint32_t*）0x1FFFF804= 0x5AA55AA5；
8）然后设置 FLASH_CTLR 寄存器的 BUFLOAD 位，执行加载到缓存区。
9）等待 FLASH_STATR 寄存器的 BSY 为‘0’，写入下个数据。
10）重复步骤 7-9 共 4 次，将 16 字节数据都加载到缓存区（主要 4 轮操作地址要连续），当前页剩
余字节使用缓存区复位默认值。
11）向 FLASH_ADDR 寄存器写入快速编程页的首地址。
12）设置 FLASH_CTLR 寄存器的 STRT 位为‘1’，启动快速页编程。
13）等待 BSY 位变为‘0’或 FLASH_STATR 寄存器的 EOP 位为‘1’表示一次快速页编程完成，将 EOP
位清 0。
14）查询 FLASH_STATR 寄存器看是否有错误，或者读编程地址数据校验。
15）继续快速页编程可以重复 5-14 步骤，结束编程将 FTPG 位清 0。
注：当修改选择字中的“读保护”变成“非保护”状态时，会自动执行一次整片擦除主存储区操作。
如果修改“读保护”之外的选型，则不会出现整片擦除的操作。
#### 20.5.3 用户选择字擦除

直接擦除整个 256 字节用户选择字区域。
1）检查 FLASH_CTLR 寄存器 LOCK 位，如果为 1，需要执行“解除闪存锁”操作。
2）检查 FLASH_STATR 寄存器的 BSY 位，以确认没有正在进行的编程操作。
3）检查 FLASH_CTLR 寄存器 OBWRE 位，如果为 0，需要执行“用户选择字解锁”操作。
4）设置 FLASH_CTLR 寄存器的 OBER 位为‘1’，之后设置 FLASH_CTLR 寄存器的 STRT 位为‘1’，开
启用户选择字擦除。
5）等待 BSY 位变为‘0’或 FLASH_STATR 寄存器的 EOP 位为‘1’表示擦除结束，将 EOP 位清 0。。
6）读擦除地址数据校验。
7）结束将 OBER 位清 0。
注：擦除成功后，字读- 0xFF。
#### 20.5.4 解除读保护

闪存是否读保护，由用户选择字决定。读取 FLASH_OBR 寄存器，当 RDPRT 位为‘1’表示当前闪
存处于读保护状态，闪存操作上受到读保护状态的一系列安全防护。解除读保护过程如下：
1）擦除整个用户选择字区域，此时读保护字段 RDPR，此时读保护仍然有效。
2）用户选择字编程，写入正确的 RDPR 代码 0xA5 以解除闪存的读保护。（此步骤首先将导致系统自
动对闪存执行整片擦除操作）。
3）进行上电复位以重新加载选择字节（包括新的 RDPR 码），此时读保护被解除。
#### 20.5.5 解除写保护

闪存是否写保护，由用户选择字决定。读取 FLASH_WPR 寄存器，每个比特位代表 2K 字节闪存空
间，当比特位为‘1’表示非写保护状态，为‘0’表示写保护。解除写保护过程如下：
1）擦除整个用户选择字区域。

<a id="pdf-page-234"></a>
<!-- PDF page 234 -->

2）写入正确的 RDPR 码 0xA5，允许读访问；
3）进行系统复位，重新加载选择字节（包括新的 WRPR[3:0]字节），写保护被解除。

<a id="pdf-page-235"></a>
<!-- PDF page 235 -->

## 第21章 USB PD控制器（USBPD）

### 21.1 USB PD控制器简介

芯片内置 USB Power Delivery 控制器和 PD 收发器 PHY，支持 USB type-C 主从检测，自动 BMC
编解码和 CRC，硬件边沿控制，支持 USB PD2.0 和 PD3.0 电力传输控制，支持快充，支持 UFP/DFP 和
PDUSB，支持 PD 受电端和 PD 供电端应用。
- 内置 USB type-C 接口，支持主从检测，支持 DRP、Sink/Consumer 和 Source/Provider；
- 内置 USB PD 收发器 PHY，集成硬件边沿斜率控制；
- 内置 USB Power Delivery 控制器，自动 BMC 编解码、4b5b 编解码和 CRC；
- 支持 SOP、SOP’、SOP”等 PD 包，支持 USB PD 复位信号帧硬件复位；
- 支持最大包长度 510 字节，支持 DMA；
- 支持 USB PD 2.0 和 3.0 电力传输协议，USB 端口支持 BC 等充电协议。
### 21.2 寄存器描述

**表 21-1 USBPD 相关寄存器列表**

| 名称 | 访问地址 | 描述 | 复位值 |
| --- | --- | --- | --- |
| R32_USBPD_CONFIG | 0x40027000 | PD配置寄存器 | 0x00000002 |
| R16_CONFIG | 0x40027000 | PD中断使能寄存器 | 0x0002 |
| R16_BMC_CLK_CNT | 0x40027002 | BMC采样时钟计数器 | 0x0000 |
| R32_USBPD_CONTROL | 0x40027004 | PD控制寄存器 | 0x00000000 |
| R16_CONTROL | 0x40027004 | PD收发控制寄存器 | 0x0000 |
| R8_CONTROL | 0x40027004 | PD收发使能寄存器 | 0x00 |
| R8_TX_SEL | 0x40027005 | PD发送SOP选择寄存器 | 0x00 |
| R16_BMC_TX_SZ | 0x40027006 | PD发送长度寄存器 | 0x0000 |
| R32_USBPD_STATUS | 0x40027008 | PD状态寄存器 | 0x000000XX |
| R16_STATUS | 0x40027008 | PD中断和数据寄存器 | 0x00XX |
| R8_DATA_BUF | 0x40027008 | DMA缓存数据寄存器 | 0xXX |
| R8_STATUS | 0x40027009 | PD中断标志寄存器 | 0x00 |
| R16_BMC_BYTE_CNT | 0x4002700A | 字节计数器 | 0x0000 |
| R32_USBPD_PORT | 0x4002700C | 端口控制寄存器 | 0x00030003 |
| R16_PORT_CC1 | 0x4002700C | CC1端口控制寄存器 | 0x0003 |
| R16_PORT_CC2 | 0x4002700E | CC2端口控制寄存器 | 0x0003 |
| R32_USBPD_DMA | 0x40027010 | DMA缓存地址寄存器 | 0x0000XXXX |
| R16_DMA | 0x40027010 | PD缓冲区起始地址寄存器 | 0xXXXX |

#### 21.2.1 PD配置寄存器（R32_USBPD_CONFIG）

偏移地址：0x00
| 位 | 名称 |
| --- | --- |
| [31:16] | R16_BMC_CLK_CNT |
| [15:0] | R16_CONFIG |

#### 21.2.2 PD中断使能寄存器（R16_CONFIG）

偏移地址：0x00

<a id="pdf-page-236"></a>
<!-- PDF page 236 -->

15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
IE_RX
IE_TX IE_RX IE_RX IE_RX IE_P WAKE_ PD_RS PD_DM CC_SE PD_AL PD_FI
_RESE Reserved
_END _ACT _BYTE _BIT D_IO POLAR T_EN A_EN L L_CLR LT_EN
T
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 15 | IE_TX_END | RW | 发送结束中断使能。 | 0 |
| 14 | IE_RX_RESET | RW | 接收复位中断使能。 | 0 |
| 13 | IE_RX_ACT | RW | 接收完成中断使能。 | 0 |
| 12 | IE_RX_BYTE | RW | 接收字节中断使能。 | 0 |
| 11 | IE_RX_BIT | RW | 接收bit中断使能。 | 0 |
| 10 | IE_PD_IO | RW | PD IO中断使能。 | 0 |
| [9:6] | Reserved | RO | 保留。 | 0 |
| 5 | WAKE_POLAR | RW | PD端口唤醒电平：<br>1：高电平有效；<br>0：低电平有效。 | 0 |
| 4 | PD_RST_EN | RW | PD模式复位命令使能：<br>1：复位；<br>0：无效。 | 0 |
| 3 | PD_DMA_EN | RW | 使能 USBPD 的 DMA，正常传输模式下该位必<br>须设置为1：<br>1：使能DMA功能和DMA中断；<br>0：关闭DMA。 | 0 |
| 2 | CC_SEL | RW | 选择当前PD通讯端口：<br>1：使用CC2端口通讯；<br>0：使用CC1端口通讯。 | 0 |
| 1 | PD_ALL_CLR | RW | PD模式清除所有的中断标志位：<br>1：清除中断标志位；<br>0：无效。 | 1 |
| 0 | PD_FILT_EN | RW | 控制PD引脚的输入滤波使能：<br>1：打开滤波；<br>0：关闭滤波。 | 0 |

#### 21.2.3 BMC采样时钟计数器（R16_BMC_CLK_CNT）

偏移地址：0x02
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved BMC_CLK_CNT
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:9] | Reserved | RO | 保留。 | 0 |
| [8:0] | BMC_CLK_CNT | RW | BMC发送或者接收采样时钟计数器。 | 0 |

#### 21.2.4 PD控制寄存器（R32_USBPD_CONTROL）

偏移地址：0x04

<a id="pdf-page-237"></a>
<!-- PDF page 237 -->

| 位 | 名称 |
| --- | --- |
| [31:16] | R16_BMC_TX_SZ |
| [15:0] | R16_CONTROL |

#### 21.2.5 PD收发控制寄存器（R16_CONTROL）

偏移地址：0x04
| 位 | 名称 |
| --- | --- |
| [15:8] | R8_TX_SEL |
| [7:0] | R8_CONTROL |

#### 21.2.6 PD收发使能寄存器（R8_CONTROL）

偏移地址：0x04
7 6 5 4 3 2 1 0
BMC_BYTE_HI TX_BIT_BACK DATA_FLAG RX_STATE BMC_START PD_TX_EN
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 7 | BMC_BYTE_HI | RO | 指示当前PD 数据收发时的半字节状态：<br>1：表示正在处理高4位；<br>0：正在处理低4位。 | 0 |
| 6 | TX_BIT_BACK | RO | 指示当前BMC发送编码时的位状态：<br>1：表示正在发送BMC字节；<br>0：空闲。 | 0 |
| 5 | DATA_FLAG | RO | 缓存数据有效标志位。 | 0 |
| [4:2] | RX_STATE | RO | PD接收状态标识<br>000：接收初始状态 001：开始接收SOP<br>010：接收复位 011：接收SOP<br>100：接收结束 101：接收未使用<br>110：接收EOP 111：接收字节。 | 0 |
| 1 | BMC_START | RW | BMC发送开始信号。 | 0 |
| 0 | PD_TX_EN | RW | USBPD收发模式和发送使能：<br>1：PD发送使能；<br>0：PD接收使能。 | 0 |

#### 21.2.7 PD发送SOP选择寄存器（R8_TX_SEL）

偏移地址：0x05
7 6 5 4 3 2 1 0
TX_SEL4 TX_SEL3 TX_SEL2 Reserved TX_SEL1
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [7:6] | TX_SEL4 | RW | PD发送模式下K-CODE4类型选择：<br>00：SYNC2；<br>01：SYNC3；<br>1x：RST2。 | 0 |


<a id="pdf-page-238"></a>
<!-- PDF page 238 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| [5:4] | TX_SEL3 | RW | PD发送模式下K-CODE3类型选择：<br>00：SYNC1；<br>01：SYNC3；<br>1x：RST1。 | 0 |
| [3:2] | TX_SEL2 | RW | PD发送模式下K-CODE2类型选择：<br>00：SYNC1；<br>01：SYNC3；<br>1x：RST1。 | 0 |
| 1 | Reserved | RO | 保留。 | 0 |
| 0 | TX_SEL1 | RW | PD发送模式下K-CODE1类型选择：<br>1：RST1；<br>0：SYNC1。 | 0 |

#### 21.2.8 PD发送长度寄存器（R16_BMC_TX_SZ）

偏移地址：0x06
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved BMC_TX_SZ
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:9] | Reserved | RO | 保留。 | 0 |
| [8:0] | BMC_TX_SZ | RW | PD模式下发送的的总长度。 | 0 |

#### 21.2.9 PD状态寄存器（R32_USBPD_STATUS）

偏移地址：0x08
| 位 | 名称 |
| --- | --- |
| [31:16] | R16_BMC_BYTE_CNT |
| [15:0] | R16_STATUS |

#### 21.2.10 PD中断和数据寄存器（R16_STATUS）

偏移地址：0x08
| 位 | 名称 |
| --- | --- |
| [15:8] | R8_STATUS |
| [7:0] | R8_DATA_BUF |

#### 21.2.11 DMA缓存数据寄存器（R8_DATA_BUF）

偏移地址：0x08
7 6 5 4 3 2 1 0
DATA_BUF
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [7:0] | DATA_BUF | RO | DMA缓存数据。 | X |

#### 21.2.12 PD中断标志寄存器（R8_STATUS）


<a id="pdf-page-239"></a>
<!-- PDF page 239 -->

偏移地址：0x09
7 6 5 4 3 2 1 0
IF_TX_END IF_RX_RESET IF_RX_ACT IF_RX_BYTE IF_RX_BIT BUF_ERR BMC_AUX
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| 7 | IF_TX_END | RW1 | 传送完成中断标志，写1清0，写0无效。 | 0 |
| 6 | IF_RX_RESET | RW1 | 接收复位中断标志，写1清0，写0无效。 | 0 |
| 5 | IF_RX_ACT | RW1 | 接收完成中断标志，写1清0，写0无效。 | 0 |
| 4 | IF_RX_BYTE | RW1 | 接收字节或者SOP中断标志，写1清0，写0<br>无效。 | 0 |
| 3 | IF_RX_BIT | RW1 | 接收bit或者5bit中断标志，写1清0，写<br>0无效。 | 0 |
| 2 | BUF_ERR | RW1 | BUFFER或者DMA错误中断标志，写1清0，<br>写0无效。 | 0 |
| [1:0] | BMC_AUX | RO | 指示当前PD状态：<br>在PD接收时或者接收完成后，状态如下：<br>00：接收空闲或者没有接收到有效的数据包；<br>01：接收到SOP即SOP0；<br>10：接收到SOP’即SOP1或者Hard Reset；<br>11：接收到SOP”即SOP2或者Cable Reset。<br>在PD发送时，状态如下：<br>00：正在发送CRC32[7:0]；<br>01：正在发送CRC32[15:8]；<br>10：正在发送CRC32[23:16]；<br>11：正在发送CRC32[31:24]。 | 00 |

#### 21.2.13 字节计数器（R16_BMC_BYTE_CNT）

偏移地址：0x0A
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved BMC_BYTE_CNT
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:9] | Reserved | RO | 保留。 | 0 |
| [8:0] | BMC_BYTE_CNT | RO | 字节计数器。 | 0 |

#### 21.2.14 端口控制寄存器（R32_USBPD_PORT）

偏移地址：0x0C
| 位 | 名称 |
| --- | --- |
| [31:16] | R16_PORT_CC2 |
| [15:0] | R16_PORT_CC1 |

#### 21.2.15 CC1端口控制寄存器（R16_PORT_CC1）

偏移地址：0x0C

<a id="pdf-page-240"></a>
<!-- PDF page 240 -->

15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved CC1_CE CC1_LVE CC1_PU Reserved PA_CC1_AI
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:8] | Reserved | RO | 保留。 | 0 |
| [7:5] | CC1_CE | RW | CC1端口电压比较器的使能：<br>000：关闭；<br>001：保留；<br>010：0.22V；<br>011：0.43V；<br>100：0.55V；<br>101：0.66V；<br>110：0.96V；<br>111：1.23V。 | 000 |
| 4 | CC1_LVE | RW | CC1端口输出低电压使能：<br>0：正常VDD电压驱动输出；<br>1：低电压驱动输出。 | 0 |
| [3:2] | CC1_PU | RW | CC1端口上拉电流选择：<br>00：禁止上拉电流；<br>01：330uA；<br>10：180uA；<br>11：80uA。 | 00 |
| 1 | Reserved | RO | 保留。 | 1 |
| 0 | PA_CC1_AI | RO | CC1端口比较器模拟输入。 | 1 |

#### 21.2.16 CC2端口控制寄存器（R16_PORT_CC2）

偏移地址：0x0E
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reserved CC2_CE CC2_LVE CC2_PU Reserved PA_CC2_AI
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:8] | Reserved | RO | 保留。 | 0 |
| [7:5] | CC2_CE | RW | CC2端口电压比较器的使能：<br>000：关闭；<br>001：保留；<br>010：0.22V；<br>011：0.43V；<br>100：0.55V；<br>101：0.66V；<br>110：0.96V；<br>111：1.23V。 | 000 |
| 4 | CC2_LVE | RW | CC2端口输出低电压使能：<br>1：低电压驱动输出；<br>0：正常VDD电压驱动输出。 | 0 |


<a id="pdf-page-241"></a>
<!-- PDF page 241 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| [3:2] | CC2_PU | RW | CC2端口上拉电流选择：<br>00：禁止上拉电流；<br>01：330uA；<br>10：180uA；<br>11：80uA。 | 00 |
| 1 | Reserved | RO | 保留。 | 1 |
| 0 | PA_CC2_AI | RO | CC2端口比较器模拟输入。 | 1 |

#### 21.2.17 DMA缓存地址寄存器（R32_USBPD_DMA）

偏移地址：0x10
| 位 | 名称 |
| --- | --- |
| [31:16] | Reserved |
| [15:0] | R16_DMA |

#### 21.2.18 PD缓冲区起始地址寄存器（R16_DMA）

偏移地址：0x10
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
USBPD_DMA_ADDR
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [15:0] | USBPD_DMA_ADDR | RW | USBPD_DMA缓存地址。<br>低16位有效，地址必须4字节对齐。 | X |


<a id="pdf-page-242"></a>
<!-- PDF page 242 -->

## 第22章 可编程协议I/O微控制器（PIOC）

CH32X035 芯片内嵌了一个可编程协议 I/O 微控制器，该微控制器基于单时钟周期的专用精简指
令集 RISC 内核，运行于系统主频，具有 2K 指令的程序 ROM 和 49 个 SFR 寄存器及 PWM 定时/计数器，
支持 2 个 I/O 引脚的协议控制。
### 22.1 主要特征

- RISC 内核，优化的单周期位操作指令集，全静态设计。
- 复用了 4K 字节的系统 SRAM 作为 2K 容量的程序 ROM，支持程序暂停和动态加载。
- 提供 33 字节的双向和单向各 1 个寄存器，提供 6 级独立堆栈。
- 支持 2 个通用双向 I/O 协议控制，支持输入电平变化检测。
- 通过动态加载不同的协议程序，可以支持多种协议规格的单线接口和两线接口。
### 22.2 应用

提供多种协议规格的目标程序，动态加载后支持相应的单线接口和两线接口。

<a id="pdf-page-243"></a>
<!-- PDF page 243 -->

## 第23章 调试支持（DBG）

### 23.1 主要特征

此寄存器允许在调试状态下配置 MCU。包括：
- 支持独立看门狗（IWDG）的计数器
- 支持窗口看门狗（WWDG）的计数器
- 支持定时器 1 的计数器
- 支持定时器 2 的计数器
- 支持定时器 3 的计数器
### 23.2 寄存器描述

#### 23.2.1 调试MCU配置寄存器（DBGMCU_CR）

地址：0x7C0(CSR)
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16
Reserved
15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
Reser TIM3_ TIM2_ TIM1_ WWDG_ IWDG_ STAND
Reserved Reserved STOP SLEEP
ved STOP STOP STOP STOP STOP BY
| 位 | 名称 | 访问 | 描述 | 复位值 |
| --- | --- | --- | --- | --- |
| [31:15] | Reserved | RW | 保留 | 0 |
| 14 | TIM3_STOP | RW | 定时器3调试停止位。当内核进入调试状态时计数<br>器停止工作。<br>1：定时器3的计数器停止工作；<br>0：定时器3的计数器仍然正常工作。 | 0 |
| 13 | TIM2_STOP | RW | 定时器2调试停止位。当内核进入调试状态时计数<br>器停止工作。<br>1：定时器2的计数器停止工作；<br>0：定时器2的计数器仍然正常工作。 | 0 |
| 12 | TIM1_STOP | RW | 定时器1调试停止位。当内核进入调试状态时计数<br>器停止工作。<br>1：定时器1的计数器停止工作；<br>0：定时器1的计数器仍然正常工作。 | 0 |
| [10:11] | Reserved | RW | 保留 | 0 |
| 9 | WWDG_STOP | RW | 窗口看门狗调试停止位。当内核进入调试状态时调<br>试窗口看门狗停止工作。<br>1：窗口看门狗计数器停止工作；<br>0：窗口看门狗计数器仍然正常工作。 | 0 |
| 8 | IWDG_STOP | RW | 独立看门狗调试停止位。当内核进入调试状态时看<br>门狗停止工作。<br>1：看门狗计数器停止工作；<br>0：看门狗计数器仍然正常工作。 | 0 |


<a id="pdf-page-244"></a>
<!-- PDF page 244 -->

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| [7:3] | Reserved | RW | 保留 | 0 |
| 2 | STANDBY | RW | 调试待机模式位。<br>1：(HCLK开)数字电路部分不下电，HCLK时钟由内<br>部RL振荡器提供时钟。另外，微控制器通过产生系<br>统复位来退出STANDBY模式和复位是一样的；<br>0：(HCLK关)整个数字电路部分都断电。<br>从软件的观点看，退出STANDBY模式与复位是一样<br>的(除了一些状态位指示了微控制器刚从 STANDBY<br>状态退出)。 | 0 |
| 1 | STOP | RW | 调试停止模式位。<br>1：(HCLK 开)在停止模式时，HCLK 时钟由内部 RC<br>振荡器提供。当退出停止模式时，软件必需重新配<br>置时钟系统启动PLL，晶振等(与配置此比特位为0<br>时的操作一样)；<br>0：(HCLK 关)在停止模式时，时钟控制器禁止一切<br>时钟(包括 HCLK)。当从 STOP 模式退出时，时钟的<br>配置和复位之后的配置一样(微控制器由内部RC振<br>荡器(HSI)提供时钟)。因此，软件必需重新配置时<br>钟控制系统启动PLL，晶振等。 | 0 |
| 0 | SLEEP | RW | 调试睡眠模式位。<br>1：(HCLK开)在睡眠模式时，HCLK时钟都由原先配<br>置好的系统时钟提供；<br>0：(HCLK关)在睡眠模式时，HCLK由原先已配置好<br>的系统时钟提供，HCLK则关闭。由于睡眠模式不会<br>复位已配置好的时钟系统，因此从睡眠模式退出时，<br>软件不需要重新配置时钟系统。 | 0 |

