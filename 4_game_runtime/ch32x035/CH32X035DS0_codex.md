# CH32X035/X033 Datasheet (CH32X035DS0) — V1.9

> Converted from `CH32X035DS0.PDF` (40 PDF pages). Original language: Chinese.
> Sections and data tables are machine-readable where possible. Page markers refer to PDF page numbers (including cover pages).
> **Important:** Pinout diagrams, timing waveforms, and mechanical package drawings are graphical; consult the source PDF for exact geometry and signal timing relationships.


<!-- PDF page 1 -->

## 概述

CH32X035 是基于青稞 RISC-V 内核设计的工业级微控制器。CH32X035 内置 USB 和 PD PHY，支持 USB
Host 主机和 USB Device 设备功能、PDUSB 及 Type-C 快充功能，内置可编程协议 I/O 控制器，提供了
2 组 OPA 运放、3 组 CMP 电压比较器、4 组 USART 串口、I2C、SPI、多组定时器、12 位 ADC、14 路 Touchkey
等丰富外设资源。

## 产品特性

-  内核 Core：
- 青稞 32 位 RISC-V4C 内核
- 支持 RV32IMAC 指令集和自扩展指令
- 快速可编程中断控制器+硬件中断堆栈
- 分支预测、冲突处理机制
- 单周期乘法、硬件除法
-  存储器：
- 20KB 易失数据存储区 SRAM
- 62KB 程序存储区 CodeFlash
- 3328B 系统存储区 SystemFLASH
- 256B 系统非易失配置信息存储区
- 256B 用户自定义信息存储区
-  电源管理和低功耗：
- 系统供电 V 额定电压：3.3V 或 5V
DD
- 低功耗模式：睡眠、停止、待机
-  系统时钟和复位：
- 内置 48MHz 时钟振荡器
- 上/下电复位、可编程电压监测器
-  8 路通用 DMA 控制器：
- 8 个通道，支持环形缓冲区管理
- 支持 TIMx/ADC/USART/I2C/SPI
-  可编程协议 I/O 控制器 PIOC：
- 可编程，支持多种单线接口、两线接口
-  2 组运放 OPA/PGA/电压比较器：
- 多路输入通道，可选多档增益
- 各 2 路输出通道，可选 ADC 引脚

-  3 组模拟电压比较器 CMP：
- 各 2 路输入通道，可选公用参考电压引脚
- 输出到 I/O 或者内部直接触发 TIM2
-  12 位模数转换 ADC：
- 模拟输入范围：GND～V
DD
- 14 路外部信号+1 路内部信号通道
-  14 路 TouchKey 通道检测
-  多组定时器：
- 2 个 16 位高级定时器，增加死区控制和紧急
刹车，提供用于电机控制的 PWM 互补输出
- 1 个 16 位通用定时器，提供输入捕获/输出比
较/PWM
- 2 个看门狗定时器：独立和窗口型
- 系统时基定时器：64 位计数器
-  4 组 USART 串口：支持 LIN 和 ISO7816
-  1 个 I2C 接口
-  1 个 SPI 接口
-  USB2.0 全速控制器及 PHY：
- 支持 USB 主机或 USB 设备
-  USB PD 和 Type-C 控制器及 PHY
-  快速 GPIO 端口：
- 60 个 I/O 口，支持 24 个外部中断
-  安全特性：芯片唯一 ID
-  调试模式：串行 2 线调试接口 SDI
-  封装形式：LQFP、QFN、QSOP、TSSOP


<!-- PDF page 2 -->

<!-- Table extracted from PDF page 2; inspect original for merged-cell relationships -->
| 型号 | 闪 | RAM | 通 | 高 | 通 | 串 | 看 | PDUSB |  |  | ADC | OPA | CMP | 电容 | SPI | PIOC | 封装 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  | 级 | 用 |  |  | USB | USB | Type-C |  |  |  |  |  |  |  |
|  |  |  | 用 | 定 | 定 |  | 门 |  |  | Source |  | 运 | 比较 | 触摸 |  | 单线 |  |
|  | 存 |  |  |  |  | 口 |  | 主 | 设 |  |  |  |  |  |  |  | 形式 |
|  |  |  | I/O | 时 | 时 |  | 狗 |  |  | Sink |  | 放 | 器 | 按键 |  | 接口 |  |
|  |  |  |  |  |  |  |  | 机 | 备 |  |  |  |  |  |  |  |  |
|  |  |  |  | 器 | 器 |  |  |  |  | DRP |  |  |  |  |  |  |  |
| CH32X035R8T6 | 62K | 20K | 60 | 2 | 1 | 4 | 2 | √ | √ | √ | 14+1 | 2组 | 3组 | 14路 | √ | √ | LQFP64M |
| CH32X035C8T6 | 62K | 20K | 46 | 2 | 1 | 4 | 2 | √ | √ | √ | 10+1 | 2组 | 3组 | 10路 | √ | √ | LQFP48 |
| CH32X035G8U6 | 62K | 20K | 27 | 2 | 1 | 4 | 2 | √ | √ | √ | 12+1 | 2组 | 1组 | 12路 | √ | √ | QFN28 |
| CH32X035G8R6 | 62K | 20K | 26 | 2 | 1 | 4 | 2 | √ | √ | √ | 11+1 | 2组 | 3组 | 11路 | √ | √ | QSOP28 |
| CH32X035F8U6 | 62K | 20K | 19 | 2 | 1 | 3 | 2 | - | √ | √ | 10+1 | 2组 | - | 10路 | √ | √ | QFN20 |
| CH32X035F7P6 | 62K | 20K | 18 | 2 | 1 | 3 | 2 | - | √ | √ | 11+1 | 1组 | 1组 | 11路 | √ | √ | TSSOP20 |
| CH32X033F8P6 | 62K | 20K | 18 | 2 | 1 | 4 | 2 | - | √ | - | 10+1 | 2组 | 2组 | 10路 | √ | √ | TSSOP20 |


<!-- PDF page 3 -->

## 第1章 规格信息


### 1.1 系统架构

微控制器基于 RISC-V 指令集设计，其架构中将青稞微处理器内核、仲裁单元、DMA 模块、SRAM
存储等部件通过多组总线实现交互。集成通用 DMA 控制器以减轻 CPU 负担、提高访问效率，应用多级
时钟管理机制降低了外设的运行功耗，同时兼有数据保护机制，时钟自动切换保护等措施增加了系统
稳定性。下图是系列芯片内部总体架构框图。
图 1-1 系统框图
RISC-V (V4C) FLASH
I-code Bus
CTRL
PFIC RV32
SDI IMAC D-code Bus
Flash
Memory
SRAM
GPIOB
GPIOC
XUM
@VDD V DD : 2V~5.5V GND
SWCLK SWDIO
DMA Channels
PA0 ~ PA23 GPIOA
PB0 ~ PB21
PC0 ~ PC7
PC14 ~ PC19
MOSI,MISO,SCK, NSS SPI
RX, TX, CTS, RTS,CK USART1
4 channels
3 complementary Channels TIM1
ETR, BIKN
AIN0 ~ AIN13 Tkey
(GND)V -
REF ADC
V +
REF
suB
metsyS
XUM
SYSCLK
Reset & HBCLK
MUX & DIV HSI_DIV6_CLK
HSI_47KHZ_CLK
DP
DM
HSI-RC
RCC
CC1、CC2 AWU_CLK
IWDG_CLK
4 channels
TIM2 3 complementary Channels
ETR, BIKN
TIM3 2 channels
USART2 RX, TX, CTS, RTS,CK
USART3 RX, TX, CTS, RTS,CK
USART4
IWDG
WWDG
I2C SCL, SDA
PWR
PIOC
AWU
HB
USBFS
USBPD
N0、N1、N2
P0、P1、P2 OPA1
OUT0、OUT1
N0、N1、N2
P0、P1、P2 OPA2
OUT0、OUT1
N0、N1
P0、P1 CMP1
OUT
N0、N1
P0、P1 CMP2
OUT
RX, TX, CTS, RTS,CK
N0、N1
P0、P1 CMP3
OUT
AFIO
EXTI


<!-- PDF page 4 -->

### 1.2 存储器映射表

图 1-2 存储器地址映射
Reserved
0x5005 0000
USBPD
0x4002 7000
PIOC
0x4002 6C00
Reserved
0x4002 6800
AWU
0x4002 6400
OPA
0x4002 6000
Reserved
0x4002 3800
USBFS
0x4002 3400
Reserved
0x4002 2400
Flash Interface
0x4002 2000
Reserved
0x4002 1400
RCC
0x4002 1000
Reserved
0x4002 0400
DMA
0x4002 0000
Reserved
0x4001 3C00
USART1
0x4001 3800
Reserved
0x4001 3400
SPI
0x4001 3000
TIM1
0x4001 2C00
Reserved
0xFFFF FFFFF
0x4001 2800
ADC/TouchKey
Reserved 0x4001 2400
0xE010 0000 Reserved
Core Private
Peripherals
0xE000 0000 0x4001 1400
Port C
0x4001 1000
Port B
Reserved
0x4001 0C00
Port A
0x4001 0800
0x1FFF FFFF EXTI
Reserved 0xA000 1000 0x4001 0400
AFIO
0x1FFF F900 Option Bytes Reserved 0x4001 0000
0x1FFF F800 Reserved
Vendor Bytes
0x1FFF F700 0xA000 0000 0x4000 7400
Reserved PWR
0x4000 7000
0x1FFF 0D00 Reserved
Reserved
System FLASH
0x4000 5800
(BOOT_3KB+256B) 0x7000 0000 I2C
0x4000 5400
Reserved
0x1FFF 0000
0x4000 5000
0x6000 0000 Reserved 0x4000 4C00 USART4
USART3
Reserved 0x4000 4800
USART2
0x4000 4400
Peripherals Reserved
0x0800 F800 0x4000 0000
0x4000 3400
Code FLASH Reserved 0x4000 3000 IWDG
WWDG
62KB 0x2000 5000 0x4000 2C00
20KB SRAM
0x2000 0000
0x0800 0000 Reserved
Aliased to Flash or
system memory FLASH
depending on BOOT 0x4000 0800
pins 0x4000 0400 TIM3
0x0000 0000 0x0000 0000 TIM2
0x4000 0000
4G linear space


<!-- PDF page 5 -->

### 1.3 时钟树

系统时钟源：内部高频 RC 振荡器（HSI）。
图 1-3 时钟树框图
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


<!-- PDF page 6 -->

### 1.4 功能概述


#### 1.4.1 RISC-V4C处理器

RISC-V4C 支持 RISC-V 指令集 IMAC 子集。处理器内部以模块化管理，包含快速可编程中断控制器
（PFIC）、内存保护、分支预测模式、扩展指令支持等单元。对外多组总线与外部单元模块相连，实现
外部功能模块和内核的交互。
处理器以其极简指令集、多种工作模式、模块化定制扩展等特点可以灵活应用不同场景微控制器
设计，例如小面积低功耗嵌入式场景、高性能应用操作系统场景等。
-  支持机器和用户特权模式
-  快速可编程中断控制器（PFIC）
-  多级硬件中断堆栈
-  串行2线调试接口
-  标准内存保护设计
-  静态或动态分支预测、高效跳转、冲突检测机制
-  自定义扩展指令

#### 1.4.2 可编程协议I/O控制器（PIOC）

可编程协议 I/O 控制器基于单时钟周期的专用精简指令集 RISC 内核，运行于系统主频，具有 2K
指令的程序 ROM 和 49 个 SFR 寄存器及 PWM 定时/计数器，支持 2 个 I/O 引脚的协议控制。
-  复用了 4K 字节的系统 SRAM 作为 2K 字容量的程序 ROM，支持程序暂停和动态加载。
-  提供 33 字节的双向和单向各 1 个寄存器，提供 6 级独立堆栈。
-  通过动态加载不同的协议程序，可以支持多种协议规格的单线接口和两线接口。

#### 1.4.3 片上存储器

内置 20K 字节 SRAM 区，用于存放数据，掉电后数据丢失。其中 4K 可用于 PIOC。
内置 62K 字节程序闪存存储区（Code FLASH），即用户区，用于用户的应用程序和常量数据存储。
内置 3328 字节系统存储区（System FLASH），即 BOOT 区，用于系统引导程序存储，内置自举加载
程序。
256 字节系统非易失配置信息存储区，用于厂商配置字存储，出厂前固化，用户不可修改。
256 字节用户自定义信息存储区，用于用户选择字存储。

#### 1.4.4 供电方案

V = 2～5.5V：为 I/O 引脚和内部调压器供电（使用 ADC 时，V 不得小于 2.5V）。
DD DD

#### 1.4.5 供电监控器

芯片内部集成了上电复位(POR)/掉电复位(PDR)电路，该电路始终处于工作状态，保证系统在供电
超过 2V 时工作；当 V 低于设定的阈值(V )时，置器件于复位状态，而不必使用外部复位电路。
DD POR/PDR
另外系统设有一个可编程的电压监测器（PVD），需要通过软件开启，用于比较 V 供电与设定的阈
DD
值 V 的电压大小。打开 PVD 相应边沿中断，可在 V 下降到 PVD 阈值或上升到 PVD 阈值时，收到中断
PVD DD
通知。关于 V 和 V 的值参考第 3 章。
POR/PDR PVD

#### 1.4.6 系统电压调节器LDO

复位后，系统电压调节器自动开启，根据应用方式有两种操作模式。
-  开启模式：正常的运行操作，提供稳定的内核电源。
-  低功耗模式：当 CPU 进入待机模式后，调节器低功耗运行。


<!-- PDF page 7 -->

#### 1.4.7 低功耗模式

系统支持三种低功耗模式，可以针对低功耗、短启动时间和多种唤醒事件等条件下选择达到最佳
的平衡。
-  睡眠模式
在睡眠模式下，只有 CPU 时钟停止，但所有外设时钟供电正常，外设处于工作状态。此模式是最
浅低功耗模式，但可以达到最快唤醒。
退出条件：任意中断或唤醒事件。
-  停止模式
此模式 FLASH 进入低功耗模式，HSI 的 RC 振荡器被关闭。
退出条件：任意外部中断/事件（EXTI 信号）、RST 上的外部复位信号、IWDG 复位，其中 EXTI 信
号包括 24 个外部 I/O 口之一、PVD 的输出，USB 的唤醒信号，USB PD 唤醒信号等。
-  待机模式
此模式 FLASH 进入低功耗模式，HSI 的 RC 振荡器被关闭，系统 LDO 进入省电模式。
退出条件：任意外部中断/事件（EXTI 信号）、RST 上的外部复位信号、IWDG 复位，其中 EXTI 信
号包括 24 个外部 I/O 口之一、PVD 的输出，USB 的唤醒信号，USB PD 唤醒信号等。

#### 1.4.8 快速可编程中断控制器（PFIC）

芯片内置快速可编程中断控制器（PFIC），最多支持 255 个中断向量，以最小的中断延迟提供了灵
活的中断管理功能。当前芯片管理了 7 个内核私有中断和 39 个外设中断管理，其他中断源保留。PFIC
的寄存器均可以在用户和机器特权模式下访问。
-  2 个可单独屏蔽中断
-  提供一个不可屏蔽中断 NMI
-  支持硬件中断堆栈(HPE)，无需指令开销
-  提供 4 路免表中断(VTF)，更快进入中断服务程序
-  向量表支持地址或指令模式
-  中断嵌套深度可配置最高 2 级
-  支持中断尾部链接功能

#### 1.4.9 外部中断/事件控制器（EXTI）

外部中断/事件控制器总共包含 28 个边沿检测器，用于产生中断/事件请求。每个中断线都可以独
立地配置其触发事件（上升沿或下降沿或双边沿），并能够单独地被屏蔽；挂起寄存器维持所有中断请
求状态。多达 60 个通用 I/O 口都可选择连接到 24 个外部中断线。

#### 1.4.10 通用DMA控制器

系统内置了通用 DMA 控制器，管理 8 个通道，灵活处理存储器到存储器、外设到存储器和存储器
到外设间的高速数据传输，支持环形缓冲区方式。每个通道都有专门的硬件 DMA 请求逻辑，支持一个
或多个外设对存储器的访问请求，可配置访问优先权、传输长度、传输的源地址和目标地址等。
DMA 用于主要的外设包括：通用/高级定时器 TIMx、ADC、USART、I2C、SPI。
USB 和 USB PD 另有专用的独立 DMA 通道。
注：DMA和CPU经过仲裁器仲裁之后对系统SRAM进行访问。

#### 1.4.11 时钟和启动

系统时钟源 HSI 默认开启，在没有配置时钟或者复位后，内部 48MHz 的 RC 振荡器 6 分频作为默认
的 CPU 时钟。对于关闭时钟的低功耗模式，唤醒后系统将首先开启内部的 RC 振荡器。如果使能了时钟
中断，软件可以接收到相应的中断。


<!-- PDF page 8 -->

#### 1.4.12 ADC（模拟/数字转换器）和触摸按键电容检测（TKey）

芯片内置 12 位的模拟/数字转换器(ADC)，提供多达 14 个外部通道和 1 个内部通道采样，可编程
的通道采样时间，可以实现单次、连续、扫描或间断转换。提供模拟看门狗功能允许非常精准地监控
一路或多路选中的通道，用于监测通道信号电压。支持外部事件触发转换，触发源包括片上定时器的
内部信号和外部引脚。支持使用 DMA 操作。
ADC 内部通道为内部参考电源电压采样通道。
触摸按键电容检测单元，提供了多达 14 个检测通道，复用 ADC 模块的外部通道。检测结果通过
ADC 模块转换输出结果，通过触摸检测算法子程序库或用户软件识别触摸按键状态。
注：ADC的通道3、通道7、通道11、通道15功能不适用于批号倒数第5位为0的产品。

#### 1.4.13 定时器及看门狗

-  高级控制定时器（TIM1、TIM2）
高级控制定时器是一个 16 位的自动装载递加/递减计数器，具有 16 位可编程的预分频器。除了完
整的通用定时器功能外，可以被看成是分配到 6 个通道的三相 PWM 发生器，具有带死区插入的互补 PWM
输出功能，允许在指定数目的计数器周期之后更新定时器进行重复计数周期，刹车功能等。高级控制
定时器的很多功能都与通用定时器相同，内部结构也相同，因此高级控制定时器可以通过定时器链接
功能与其他 TIM 定时器协同操作，提供同步或事件链接功能。
-  通用定时器（TIM3）
通用定时器是一个 16 位的自动装载递加计数器，具有一个可编程的 16 位预分频器以及 2 个独立
的通道，每个通道都支持输入捕获、输出比较、PWM 生成和单脉冲模式输出。还能通过定时器链接功
能与高级控制定时器共同工作，提供同步或事件链接功能。在调试模式下，计数器可以被冻结，任意
通用定时器都能用于产生 PWM 输出。
-  独立看门狗
独立看门狗是一个自由运行的 12 位递减计数器，支持 7 种分频系数。由（HSI/1024）时钟的分频
提供时钟源。IWDG 在主程序之外，可以完全独立工作，因此，用于在发生问题时复位整个系统，或作
为一个自由定时器为应用程序提供超时管理。通过选项字节可以配置成是软件或硬件启动看门狗。在
调试模式下，计数器可以被冻结。
-  窗口看门狗
窗口看门狗是一个 7 位的递减计数器，并可以设置成自由运行。可以被用于在发生问题时复位整
个系统。其由主时钟驱动，具有早期预警中断功能；在调试模式下，计数器可以被冻结。
-  系统时基定时器
青稞微处理器内核自带了一个 64 位可选递增或递减的计数器，用于产生 SYSTICK 异常（异常号：
12），可专用于实时操作系统，为系统提供“心跳”节律，也可当成一个标准的 64 位计数器。具有自
动重加载功能及可编程的时钟源。

#### 1.4.14 通用异步收发器（USART）

芯片提供了 4 组通用同步/异步收发器。支持全双工异步串口通信、同步单向通信以及半双工单线
通信，也支持 LIN(局部互连网)，兼容 ISO7816 的智能卡协议和 IrDA SIR ENDEC 传输编解码规范，以
及调制解调器(CTS/RTS 硬件流控)操作，还支持多处理器通信。其采用分数波特率发生器系统，并支
持 DMA 操作连续通讯。


<!-- PDF page 9 -->

#### 1.4.15 串行外设接口（SPI）

芯片提供 1 个串行外设 SPI 接口，支持主或从操作，动态切换。支持多主模式，全双工或半双工
同步传输，支持基本的 SD 卡和 MMC 模式。可编程的时钟极性和相位，数据位宽提供 8 或 16 位选择，
可靠通信的硬件 CRC 产生/校验，支持 DMA 操作连续通讯。

#### 1.4.16 I2C总线

芯片提供 1 个 I2C 总线接口，能够工作于多主机模式或从模式，完成所有 I2C 总线特定的时序、
协议、仲裁等。支持标准和快速两种通讯速度。
I2C 接口提供 7 位或 10 位寻址，并且在 7 位从模式时支持双从地址寻址。内置了硬件 CRC 发生器
/校验器。支持 DMA 操作。
注：I2C功能不适用于批号倒数第5位为0的产品。

#### 1.4.17 通用串行总线USB2.0全速主机/设备控制器（USBFS）

USB2.0 全速主机控制器和设备控制器（USBFS），遵循 USB2.0 Fullspeed 标准，支持 BC 充电协议。
提供 8 个可配置的 USB 设备端点及一组主机端点。支持控制/批量/同步/中断传输，双缓冲区机制，USB
总线挂起/恢复操作，并提供待机/唤醒功能。USBFS 模块专用的 48MHz 时钟由内部高速时钟（HSI）直
接产生。

#### 1.4.18 USB PD及Type-C控制器（USB PD）

内置 USB Power Delivery 控制器和 PD 收发器 PHY，支持 USB Type-C 主从检测，自动 BMC 编解码
和 CRC，硬件边沿控制，支持 USB PD2.0 和 PD3.0 电力传输控制，支持快充，支持 UFP/PD 受电端 Sink
和 DFP/PD 供电端 Source 应用以及 DRP 应用，支持 PDUSB。
外加 Type-C/PD 高压接口芯片 CH211 可实现 28V 直接供电、CC 引脚 28V 耐压以及内置 Type-C 规
范定义的可控 Rd 下拉电阻 5K1。

#### 1.4.19 通用输入输出接口（GPIO）

系统提供了 3 组 GPIO 端口，共 60 个 GPIO 引脚。每个引脚都可以由软件配置成输出、输入(带或
不带上拉，部分引脚支持下拉)或复用的外设功能端口。
所有 GPIO 引脚都支持可控上拉，仅 PA0-PA15 和 PC16-PC17 支持可控下拉，其余引脚不支持下拉。
PC14-PC17 支持多种上拉模式，分别由 PD 和 USB 引脚相对应的专用控制寄存器设置。
多数 GPIO 引脚都与数字或模拟的复用外设共用。所有 PA 和 PB 的 GPIO 引脚都有较大电流驱动能
力。提供锁定机制冻结 IO 配置，以避免意外的写入 I/O 寄存器。
系统中大部分 IO 引脚电源由 V 提供，通过改变 V 供电将改变 IO 引脚输出电平高值来适配外部
DD DD
通讯接口电平。具体引脚请参考引脚描述。

#### 1.4.20 运放/比较器（OPA）

芯片内置 2 组运放（OPA），也可用作电压比较器，其输入可通过更改配置对多个通道进行选择，
包括可编程增益运放（PGA）的放大倍数选择，其输出可通过更改配置对 2 个通道进行选择，内部关联
到 ADC 通道。支持将外部模拟小信号放大送入 ADC 以实现小信号 ADC 转换。

#### 1.4.21 电压比较器（CMP）

芯片内置 3 组轨到轨模拟电压比较器，支持可选迟滞特性，电压比较结果由 GPIO 输出或者内部直
接接入 TIM2 的 CH1~CH3 的输入通道实现触发。

#### 1.4.22 串行2线调试接口（2-wire SDI Serial Debug Interface）

内核自带一个串行 2 线调试的接口（SDI），包括 SWDIO 和 SWCLK 引脚。系统上电或复位后默认调


<!-- PDF page 10 -->

试接口引脚功能开启，主程序运行后可以根据需要关闭 SDI。


<!-- PDF page 11 -->

41
0A/1P1C/2STC/1C2T/0AP
51
1A/2N2O/2N1O/_2STC/O1C/2C2T/2STR/1AP
61
2A/0N3C/_TE2T/_2STR/1O2O/3C2T/2XT/2AP
56
PA8/MISO_/RTS4/RTS1_ 57
PA9/MOSI_/MISO_/RX4_/CTS1_/T2BK_
58 23
PA10/SCL/TX1_/MOSI_/RX4_ PA7/MOSI/T3C2/T1C1N_/TX1_/CTS4_/O2P0/A7
59 22
PA11/SDA/SCK_/RX1_/C2P1 PA6/MISO/T3C1/RTS4_/T1BK_/O1N0/A6
60 21
PA12/CS_/T2C2_/T2C1N_/C2P0 PA5/SCK/TX4_/CTS4_/O2N0/A5
61 20
PA13/SCL_/RTS4_/CTS1_/T2C3_/T2C2N_/C3P0 PA4/CS/O2O0/RTS3_/T3C2_/A4
62
PA14/SDA_/RTS1_/T2C3N_/CTS4_/C3P1
17
PA3/T2C4/O1O0/T3C1_/RX2/CTS3_/A3
1
_2XT/51AP
2
_2XR/61AP
3
_2STC/71AP
4
_TE2T/_3XT/81AP
5
_2XR/TE2T/91AP
6
KB2T/_2XT/02AP
7
_2STR/N1C2T/TSR/12AP
8
01A/_KB2T/_1C1T/_4C2T/_2XT/0CP
9
11A/_2XR/_N1C2T/_2C1T/1CP
01
21A/_2STC/_N2C2T/_3C1T/2CP
11
31A/1N3C/1N2C/0N1C/_N1C2T/_N3C2T/_4C1T/_2STR/3CP
21
0N2C/N2C2T/22AP
31
1N1C/N3C2T/32AP
25
PC7/MOSI_/T1C3N_ 24
PC6/MISO_/T1C2N_
19
PC5/SCK_/T1C1N_
18
PC4/CS_/T1BK_/T2ET_
64
_TE1T/_C2I/_2C3T/_N1C2T/_3XT/OID/81CP
54
01CP/TE1T/_4XR/_C2I/_4XT/1STR/PDU/71CP
44
11CP/1STC/_4XR/_C2I/_4XT/4C1T/MDU/61CP
49
PC19/DCK/T2C1_/T3C1_/I2C_/RX3_/RX4_/C1P0
30
PB4/T2C4_/T3C1_/T2BK_/RX3/O1P2
29
PB3/TX3/C3O/T2C3_/T2C3N_/O2P1
28
PB2/C2O/RX1_
27
PB1/T1C3N_/RX4/O2N1/A9
26
PB0/TX4/T1C2N_/O1P0/A8
84
_4XT/31BP
74
_N2C2T/_4C1T/21BP
34
1XR/_N1C2T/3C1T/11BP
24
2C1T/1XT/01BP
14
_4XT/OCM/1C1T/9BP
63
1P1O/N3C1T/8BP
53
2P2O/_3STR/N2C1T/7BP
43
1N1O/3STC/N1C1T/6BP
33
KB1T/_2C3T/1O1O/5BP
50
PB14/RX3_
53
PB15/T2C2_/SCK_/CTS4
04
_4C2T/_3STR/91BP
93
_3STC/_3C2T/81BP
83
_3XR/_2C2T/71BP
73
_1C2T/_3XT/61BP

## 第2章 引脚信息


### 2.1 引脚排列

32
VDD
31
GND
51
PB20
52
PB21/T2C1_/CS_/RTS4_
54
55
PC14/CC1/T1C3_/T2C2_
PC15/CC2/T2C3_/T1ET_
CH32X035R8T6
63
GND
64
VDD


<!-- PDF page 12 -->

01
0A/1P1C/2STC/1C2T/0AP
11
1A/2N2O/2N1O/_2STC/O1C/2C2T/2STR/1AP
21
2A/0N3C/_TE2T/_2STR/1O2O/3C2T/2XT/2AP
40
PA8/RTS4/RTS1_
41
PA9/MISO_/RX4_/CTS1_/T2BK_
42
PA10/SCL/TX1_/MOSI_/RX4_
43
PA11/SDA/SCK_/RX1_/C2P1
44 17
PA12/CS_/T2C2_/T2C1N_/C2P0 PA7/MOSI/T3C2/T1C1N_/TX1_/CTS4_/O2P0/A7
45 16
PA13/SCL_/RTS4_/CTS1_/T2C3_/T2C2N_/C3P0 PA6/MISO/T3C1/RTS4_/T1BK_/O1N0/A6
46 15
PA14/SDA_/RTS1_/T2C3N_/CTS4_/C3P1 PA5/SCK/TX4_/CTS4_/O2N0/A5
14
PA4/CS/O2O0/RTS3_/T3C2_/A4
13
PA3/T2C4/O1O0/T3C1_/RX2/CTS3_/A3
1
_2XT/51AP
2
_2XR/61AP
43
3
_TE1T/_C2I/_2C3T/_N1C2T/_3XT/OID/81CP
_2STC/71AP
33
4
01CP/TE1T/_4XR/_C2I/_4XT/1STR/PDU/71CP
_TE2T/_3XT/81AP
23
5
11CP/1STC/_4XR/_C2I/_4XT/4C1T/MDU/61CP
_2XR/TE2T/91AP
6
KB2T/_2XT/02AP
7
_2STR/N1C2T/TSR/12AP
8
0N2C/N2C2T/22AP
9
1N1C/N3C2T/32AP
24
PB4/T2C4_/T3C1_/T2BK_/RX3/O1P2
23
PB3/TX3/C3O/T2C3_/T2C3N_/O2P1
22
PB2/C2O/RX1_
21
PB1/T1C3N_/RX4/O2N1/A9
20
PB0/TX4/T1C2N_/O1P0/A8
63
_4XT/31BP
13
1XR/_N1C2T/3C1T/11BP
03
2C1T/1XT/01BP
92
_4XT/OCM/1C1T/9BP
82
1P1O/N3C1T/8BP
72
2P2O/_3STR/N2C1T/7BP
62
1N1O/3STC/N1C1T/6BP
52
KB1T/_2C3T/1O1O/5BP
37
PC19/DCK/T2C1_/T3C1_/I2C_/RX3_/RX4_/C1P0
53
_N2C2T/_4C1T/21BP
38
PC14/CC1/T1C3_/T2C2_
39
PC15/CC2/T2C3_/T1ET_
19
PC7/T1C3N_
CH32X035C8T6 18
PC6/T1C2N_
47
GND
48
VDD
1 20
PB12/T1C4_/T2C2N_ PC19/DCK/T2C1_/T3C1_/I2C_/RX3_/C1P0
2 19
PC14/CC1/T1C3_/T2C2_ PC18/DIO/TX3_/T2C1N_/T3C2_/I2C_/T1ET_
3 18
PC15/CC2/T2C3_/T1ET_ PC17/UDP/TX4_/I2C_/RX4_/T1ET/PC10
4 17
PC3/RST/T1C4_/T2C3N_/C1N0/A13 PC16/UDM/T1C4/TX4_/I2C_/RX4_/PC11
5 16
PC1/T1C2_/T2C1N_/RX2_/A11 VDD
6 15
PA0/T2C1/CTS2/C1P1/A0 GND
7 14
PA1/RTS2/T2C2/C1O/O2N2/A1 PB1/T1C3N_/RX4/O2N1/A9
8 13
PA2/TX2/T2C3/O2O1/T2ET_/A2 PA7/MOSI/T3C2/T1C1N_/TX1_/O2P0/A7
9 12
PA3/T2C4/T3C1_/RX2/A3 PA6/MISO/T3C1/T1BK_/A6
10 11
PA4/CS/O2O0/T3C2_/A4 PA5/SCK/TX4_/O2N0/A5
CH32X035F7P6


<!-- PDF page 13 -->

5
0A/1P1C/2STC/1C2T/0AP
6
1A/2N2O/2N1O/O1C/2C2T/2STR/1AP
7
2A/_TE2T/1O2O/3C2T/2XT/2AP
12
PA7/MOSI/T3C2/T1C1N_/TX1_/O2P0/A7
11 PA6/MISO/T3C1/T1BK_/O1N0/A6
10
PA5/SCK/TX4_/O2N0/A5
9
PA4/CS/O2O0/T3C2_/A4
8
PA3/T2C4/O1O0/T3C1_/RX2/A3
4
31A/0N1C/_N1C2T/_N3C2T/_4C1T/3CP
23 13
PB12/T1C4_/T2C2N_ PB0/TX4/T1C2N_/O1P0/A8
26
PC16/UDM/T1C4/TX4_/I2C_/RX4_/CTS1/PC11
27
PC17/UDP/RTS1/TX4_/I2C_/RX4_/T1ET/PC10
71
1N1O/3STC/N1C1T/6BP
51
2P1O/3XR/_KB2T/_1C3T/_4C2T/4BP
24
PC19/DCK/T2C1_/T3C1_/I2C_/RX3_/C1P0
0
DNG
2
DDV
61
KB1T/_2C3T/1O1O/5BP/9A/1N2O/4XR/_N3C1T/1BP
14
PB3/TX3/T2C3_/T2C3N_/O2P1
12
2C1T/1XT/01BP
02
_4XT/OCM/1C1T/9BP
91
1P1O/N3C1T/8BP
81
2P2O/_3STR/N2C1T/7BP
22
PB11/T1C3/T2C1N_/RX1
25 PC18/DIO/TX3_/T2C1N_/T3C2_/I2C_/T1ET_
28
PC14/CC1/T1C3_/T2C2_
1
_TE1T/_3C2T/2CC/51CP
3
01A/_KB2T/_1C1T/_4C2T/_2XT/0CP
CH32X035G8U6
1 28
PC19/DCK/T2C1_/T3C1_/I2C_/RX3_/C1P0 PC18/DIO/TX3_/T2C1N_/T3C2_/I2C_
2 27
PC16/UDM/T1C4/TX4_/I2C_/RX4_/CTS1/PC11 PB12/T1C4_/T2C2N_
3 26
PC17/UDP/RTS1/TX4_/I2C_/RX4_/T1ET/PC10 PB11/T1C3/T2C1N_/RX1
4 25
PA12/T2C2_/T2C1N_/C2P0/PC14/CC1/T1C3_/T2C2_ PB10/TX1/T1C2
5 24
PA13/T2C3_/T2C2N_/C3P0/PC15/CC2/T2C3_ PB9/T1C1/MCO/TX4_
6 23
VDD PB8/T1C3N/O1P1
7 22
GND PB7/T1C2N/RTS3_/O2P2
8 21
PC3/RST/T2C3N_/T2C1N_/C1N0/C2N1/C3N1/A13 PB6/T1C1N/CTS3/O1N1
9 20
PA0/T2C1/CTS2/C1P1/A0 PB1/T1C3N_/RX4/O2N1/A9/PB5/O1O1/T3C2_/T1BK
10 19
PA1/RTS2/T2C2/C1O/O1N2/O2N2/A1 PB4/T2C4_/T3C1_/T2BK_/RX3/O1P2
11 18
PA2/TX2/T2C3/O2O1/T2ET_/C3N0/A2 PB3/TX3/C3O/T2C3_/T2C3N_/O2P1
12 17
PA3/T2C4/O1O0/T3C1_/RX2/A3 PA7/MOSI/T3C2/T1C1N_/TX1_/O2P0/A7
13 16
PA6/MISO/T3C1/T1BK_/O1N0/A6 PA5/SCK/TX4_/O2N0/A5
14 15
PB0/TX4/T1C2N_/O1P0/A8 PA4/CS/O2O0/T3C2_/A4
CH32X035G8R6


<!-- PDF page 14 -->

9
PC16/UDM/T1C4/TX4_/I2C_/RX4_
8
PC17/UDP/TX4_/I2C_/RX4_/T1ET
7
6
1 20
PA6/MISO/T3C1/T1BK_/O1N0/A6 PA5/SCK/TX4_1/O2N0/A5
2 19
PA7/MOSI/T3C2/T1C1N_/O2P0/PB0/TX4/T1C2N_/O1P0/A8 PA4/CS/O2O0/T3C2_/A4
3 18
PB1/T1C3N_/RX4/O2N1/A9 PC19/DCK/T2C1_/T3C1_/I2C_/RX3_/C1P0
4 17
PB7/RST/T1C2N/O2P2 PA3/T2C4/T3C1_/RX2/O1O0/A3
5 16
PC16/UDM/T1C4/TX4_2/I2C_/RX4_5/PC11 PA2/TX2/T2C3/O2O1/T2ET_/A2
6 15
PC17/UDP/TX4_5/I2C_/RX4_2/T1ET/PC10 PA1/T2C2/C1O/O1N2/O2N2/A1
7 14
GND PA0/T2C1/C1P1/A0
8 13
PC18/DIO/TX3_/T2C1N_/T3C2_/I2C_/T1ET_ PC3/T1C4_/T2C1N_/C1N0/C2N1/A13
9 12
VDD PA10/SCL/TX1_/MOSI_
10 11
PA9/MISO_/RX4_1/T2BK_ PA11/SDA/SCK_/RX1_/C2P1
CH32X033F8P6
51
10
PC19/DCK/T2C1_/T3C1_/I2C_/RX3_
41 31 21 11
16
17
18
CH32X035F8U6
19
PC14/CC1/T1C3_/T2C2_
20
PC15/CC2/T2C3_/T1ET_
0
DNG
1
DDV
2
0A/2STC/1C2T/0AP
3
1A/2N2O/2N1O/2C2T/2STR/1AP
4
2A/_TE2T/1O2O/3C2T/2XT/2AP
5
3A/2XR/_1C3T/0O1O/4C2T/3AP
PB0/TX4/T1C2N_/O1P0/A8
PA7/MOSI/T3C2/T1C1N_/O2P0/A7
PA6/MISO/T3C1/T1BK_/O1N0/A6
PA5/SCK/TX4_/O2N0/A5
PA4/CS/O2O0/T3C2_/A4
_N2C2T/_4C1T/21BP _C2I/_2C3T/_N1C2T/_3XT/OID/81CP 1XR/_N1C2T/3C1T/11BP 1P2O/_N3C2T/_3C2T/3XT/3BP 9A/1N2O/4XR/_N3C1T/1BP
注：引脚图中复用功能均为缩写。
示例：A:ADC_ (A10:ADC_IN10)
C:CMP_ (C3N0:CMP3_N0)


<!-- PDF page 15 -->

T:TIME_ (T2C4:TIM2_CH4、T2C2N:TIM2_CH2N)
O:OPA_ (O1N2:OPA1_N2、O2O0:OPA2_OUT0)
TX2:USART2_TX
CS:SPI_NSS
UDP:USBDP
UDM:USBDM
DIO:SWDIO
DCK:SWCLK


<!-- PDF page 16 -->

### 2.2 引脚描述

注意，下表中的引脚功能描述针对的是所有功能，不涉及具体型号产品。不同型号之间外设资源有差
异，查看前请先根据产品型号资源表确认是否有此功能。
表 2-1 CH32X035 引脚定义

<!-- Table extracted from PDF page 16; inspect original for merged-cell relationships -->
| 引脚编号 |  |  |  |  |  | 引脚 | 引脚 类型(1) | 主功能 | 默认复用功能 | 重映射功能(2) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| M46PFQL | 84PFQL | 82NFQ | 82POSQ | 02NFQ | 02POSST |  |  |  |  |  |
|  |  |  |  |  |  |  |  | （复位 |  |  |
|  |  |  |  |  |  | 名称 |  |  |  |  |
|  |  |  |  |  |  |  |  | 后） |  |  |
| - | - | 0 | - | 0 | - | GND | P | GND |  |  |
| 31 | 47 | - | 7 | - | 15 | GND | P | GND |  |  |
| 1 | 1 | - | - | - | - | PA15 | I/O | PA15 |  | TX2_2/TX2_4 |
| 2 | 2 | - | - | - | - | PA16 | I/O | PA16 |  | RX2_2/RX2_4 |
| 3 | 3 | - | - | - | - | PA17 | I/O | PA17 |  | CTS2_2/CTS2_4 |
| 4 | 4 | - | - | - | - | PA18 | I/O | PA18 |  | TX3_2/T2ET_1/T2ET_3 |
| 5 | 5 | - | - | - | - | PA19 | I/O | PA19 | T2ET | RX2_1/T2ET_2 |
| 6 | 6 | - | - | - | - | PA20 | I/O | PA20 | T2BK | TX2_1/T2BK_2 |
| 7 | 7 | - | - | - | - | PA21 | I/O | PA21 | RST/T2C1N | RTS2_2 |
| 8 | - | 3 | - | - | - | PC0 | I/O/A | PC0 | A10 | TX2_3/T2C4_5 /T2C4_6/T1C1_3/T2BK_4 |
| 9 | - | - | - | - | 5 | PC1 | I/O/A | PC1 | A11(3) | T1C2_3/T2C1N_4/RX2_3 |
| 10 | - | - | - | - | - | PC2 | I/O/A | PC2 | A12 | T1C3_3/T2C2N_4/CTS2_3 |
| 11 | - | 4 | - | - | - | PC3 | I/O/A | PC3 | C1N0/C2N1/C3N1/A13 | RTS2_3/T1C4_3 /T2C3N_4/T2C1N_2/RTS2_4 |
| - | - | - | 8 | - | 4 |  |  |  | RST/C1N0/C2N1 /C3N1/A13 |  |
| 12 | 8 | - | - | - | - | PA22 | I/O/A | PA22 | T2C2N/C2N0 | CK2_2/T2C2N_2/CK2_4 |
| 13 | 9 | - | - | - | - | PA23 | I/O/A | PA23 | T2C3N/C1N1 | CK2_1/T2C3N_2 |
| 14 | 10 | 5 | 9 | 2 | 6 | PA0 | I/O/A | PA0 | T2C1/CTS2/C1P1/A0 | T2C1_2 |
| 15 | 11 | 6 | 10 | 3 | 7 | PA1 | I/O/A | PA1 | RTS2/T2C2/C1O /O1N2/O2N2/A1 | CTS2_1/T2C2_2 |
| 16 | 12 | 7 | 11 | 4 | 8 | PA2 | I/O/A | PA2 | TX2/T2C3/O2O1/C3N0 /A2 | RTS2_1/T2ET_5/T2C3_1/T2ET_6 |
| 63 | - | - | - | - | - | GND | P | GND |  |  |
| 32 | 48 | 2 | 6 | 1 | 16 | V DD | P | VDD |  |  |
| 17 | 13 | 8 | 12 | 5 | 9 | PA3 | I/O/A | PA3 | RX2/T2C4/O1O0/A3(3) | T3C1_3/T2C4_1/CTS3_2 |
| 18 | - | - | - | - | - | PC4 | I/O | PC4 |  | CS_3/T1BK_3/T2ET_4 |
| 19 | - | - | - | - | - | PC5 | I/O | PC5 |  | SCK_3/T1C1N_3 |
| 20 | 14 | 9 | 15 | 6 | 10 | PA4 | I/O/A | PA4 | CS/CK2/O2O0/A4 | RTS3_2/T3C2_3 |
| 21 | 15 | 10 | 16 | 7 | 11 | PA5 | I/O/A | PA5 | SCK/O2N0/A5 | TX4_1/CTS4_4 |
| 22 | 16 | 11 | 13 | 8 | 12 | PA6 | I/O/A | PA6 | MISO/T3C1/O1N0/A6 | CK4_1/RTS4_4/T1BK_1 |
| 23 | 17 | 12 | 17 | 9 | 13 | PA7 | I/O/A | PA7 | MOSI/T3C2/O2P0/A7(3) | T1C1N_1/TX1_3/CTS4_1 |
| 24 | 18 | - | - | - | - | PC6 | I/O | PC6 |  | MISO_3/T1C2N_3 |
| 25 | 19 | - | - | - | - | PC7 | I/O | PC7 |  | MOSI_3/T1C3N_3/PIOC_IO0_1 |


<!-- PDF page 17 -->

<!-- Table extracted from PDF page 17; inspect original for merged-cell relationships -->
| 引脚编号 |  |  |  |  |  | 引脚 | 引脚 类型(1) | 主功能 | 默认复用功能 | 重映射功能(2) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| M46PFQL | 84PFQL | 82NFQ | 82POSQ | 02NFQ | 02POSST |  |  |  |  |  |
|  |  |  |  |  |  |  |  | （复位 |  |  |
|  |  |  |  |  |  | 名称 |  |  |  |  |
|  |  |  |  |  |  |  |  | 后） |  |  |
| 26 | 20 | 13 | 14 | 10 | - | PB0 | I/O/A | PB0 | TX4/O1P0/A8 | T1C2N_1 |
| 27 | 21 | 16 | 20 | 11 | 14 | PB1(5) | I/O/A | PB1 | RX4/O2N1/A9 | T1C3N_1 |
| 28 | 22 | - | - | - | - | PB2 | I/O/A | PB2 | CK4/C2O | RX1_3/CK4_2/CK4_5 |
| 29 | 23 | 14 | 18 | 12 | - | PB3 | I/O/A | PB3 | TX3/C3O/O2P1 | T2C3_2/T2C3N_5/T2C3_3/T2C3N_6 |
| 30 | 24 | 15 | 19 | - | - | PB4 | I/O/A | PB4 | RX3/O1P2 | T2C4_2/T3C1_1/T2BK_5 /T2C4_3/T2BK_6 |
| 64 | - | - | - | - | - | V DD | P | V DD |  |  |
| 33 | 25 | 16 | 20 | - | - | PB5(5) | I/O/A | PB5 | CK3/O1O1/T1BK | CK1_2/T3C2_1/CK3_1/T1BK_2 |
| 34 | 26 | 17 | 21 | - | - | PB6 | I/O/A | PB6 | T1C1N/CTS3/O1N1 | T1C1N_2/CTS3_1 |
| 35 | 27 | 18 | 22 | - | - | PB7 | I/O/A | PB7 | T1C2N/O2P2/RTS3 | RTS3_1/T1C2N_2 |
| 36 | 28 | 19 | 23 | - | - | PB8 | I/O/A | PB8 | T1C3N/O1P1 | CK3_2/CK4_3/T1C3N_2 |
| 37 | - | - | - | - | - | PB16 | I/O | PB16 |  | TX3_3/T2C1_4 |
| 38 | - | - | - | - | - | PB17 | I/O | PB17 |  | T2C2_4/RX3_3 |
| 39 | - | - | - | - | - | PB18 | I/O | PB18 |  | T2C3_4/CTS3_3 |
| 40 | - | - | - | - |  | PB19 | I/O | PB19 |  | RTS3_3/T2C4_4 |
| 41 | 29 | 20 | 24 | - | - | PB9 | I/O | PB9 | CK1/T1C1/MCO | TX4_3/CK1_1/T1C1_1/T1C1_2 |
| 42 | 30 | 21 | 25 | - | - | PB10 | I/O | PB10 | TX1/T1C2 | T1C2_1/T1C2_2/TX1_2 |
| 43 | 31 | 22 | 26 | 13 | - | PB11 | I/O | PB11 | T1C3/RX1 | T1C3_1/T1C3_2/RX1_2/T2C1N_6 |
| 44 | 32 | 26 | 2 | 17 | 17 | PC16(4)(9) | I/O/A | PC16 | UDM/T1C4/CTS1 | TX4_2/SCL_2(3)/SDA_4(3)/RX4_5 /CTS1_1/T1C4_1 |
|  |  |  |  | - |  | PC11(4) | I/O | PC11 |  |  |
| 45 | 33 | 27 | 3 | 18 | 18 | PC17(4)(8) | I/O/A | PC17 | UDP/RTS1/T1ET | TX4_5/SDA_2(3)/SCL_4(3)/RX4_2 /RTS1_1/T1ET_1 |
|  |  |  |  | - |  | PC10(4) | I/O | PC10 |  |  |
| 46 | 34 | 25 | 28 | 14 | 19 | PC18 | I/O | PC18 | DIO/PIOC_IO0 | TX3_1/T2C1N_5/SDA_3(3)/SCL_5(3) T1ET_2/T1ET_3/T3C2_2 |
| 47 | 35 | 23 | 27 | 15 | 1 | PB12 | I/O | PB12 |  | CK1_3/T1C4_2/T2C2N_5/T2C2N_6 |
| 48 | 36 | - | - | - | - | PB13 | I/O | PB13 |  | TX4_4 |
| 49 | 37 | 24 | 1 | 16 | 20 | PC19 | I/O/A | PC19 | DCK/PIOC_IO1/C1P0 | T2C1_5/T3C1_2/SCL_3(3)/SDA_5(3) /RX3_1/RX4_4/T2C1_6 |
| 50 | - | - | - | - | - | PB14 | I/O | PB14 |  | RX3_2 |
| 51 | - | - | - | - | - | PB20 | I/O | PB20 |  | CK2_3 |
| 52 | - | - | - | - | - | PB21 | I/O | PB21 |  | T2C1_1/CS_1/RTS4_1/T2C1_3 |
| 53 | - | - | - | - | - | PB15 | I/O | PB15 | CTS4 | T2C2_1/SCK_1/T2C2_3/CTS4_2 /CTS4_5 |
| 54 | 38 | 28 | 4 | 19 | 2 | PC14(6) | I/O/A | PC14 | CC1 | T1C3_4/T2C2_6 |
| 55 | 39 | 1 | 5 | 20 | 3 | PC15(6) | I/O/A | PC15 | CC2 | T2C3_6/T1ET_4 |
| 56 | 40 | - | - | - | - | PA8 | I/O | PA8 | RTS4 | RTS1_2/CK4_4/RTS4_2/RTS4_5 |


<!-- PDF page 18 -->

<!-- Table extracted from PDF page 18; inspect original for merged-cell relationships -->
| 引脚编号 M46PFQL 84PFQL 82NFQ 82POSQ 02NFQ 02POSST |  |  |  |  |  | 引脚 | 引脚 类型(1) | 主功能 | 默认复用功能 | 重映射功能(2) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| M46PFQL | 84PFQL | 82NFQ | 82POSQ | 02NFQ |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  | （复位 |  |  |
|  |  |  |  |  |  | 名称 |  |  |  |  |
|  |  |  |  |  |  |  |  | 后） |  |  |
|  |  |  |  |  |  |  |  |  |  | /MISO_1 |
| 57 | 41 | - | - | - | - | PA9 | I/O | PA9 |  | MOSI_1/RX4_1/CTS1_2/MISO_2 /T2BK_1/T2BK_3 |
| 58 | 42 | - | - | - | - | PA10 | I/O | PA10 | SCL(3) | TX1_1/MOSI_2/RX4_3 |
| 59 | 43 | - | - | - | - | PA11 | I/O/A | PA11 | SDA(3)/C2P1 | SCK_2/RX1_1 |
| 60 | 44 | - | 4 | - | - | PA12(6) | I/O/A | PA12 | C2P0 | CS_2/T2C2_5/T2C1N_1/T2C1N_3 |
| 61 | 45 | - | 5 | - | - | PA13(6) | I/O/A | PA13 | C3P0 | SCL_1(3)/RTS4_3/CTS1_3/T2C3_5 /T2C2N_1/T2C2N_3 |
| 62 | 46 | - | - | - | - | PA14 | I/O/A | PA14 | C3P1 | SDA_1(3)/RTS1_3/T2C3N_1/CTS4_3 /T2C3N_3 |

表2-2 CH32X033引脚定义

<!-- Table extracted from PDF page 18; inspect original for merged-cell relationships -->
| 引脚编号 |  | 引脚 | 引脚 类型(1) | 主功能 | 默认复用功能 | 重映射功能(2) |
| --- | --- | --- | --- | --- | --- | --- |
|  | 02POSST |  |  |  |  |  |
|  |  | 名称 |  | （复位后） |  |  |
| - | 7 | GND | P | GND |  |  |
| - | 9 | V DD | P | VDD |  |  |
| - | 14 | PA0 | I/O/A | PA0 | T2C1/CTS2/C1P1/A0 | T2C1_2 |
| - | 15 | PA1 | I/O/A | PA1 | RTS2/T2C2/C1O /O1N2/O2N2/A1 | CTS2_1/T2C2_2 |
| - | 16 | PA2 | I/O/A | PA2 | TX2/T2C3/O2O1/C3N0 /A2 | RTS2_1/T2ET_5/T2C3_1/T2ET_6 |
| - | 17 | PA3 | I/O/A | PA3 | RX2/T2C4/O1O0/A3(3) | T3C1_3/T2C4_1/CTS3_2 |
| - | 19 | PA4 | I/O/A | PA4 | CS/CK2/O2O0/A4 | RTS3_2/T3C2_3 |
| - | 20 | PA5 | I/O/A | PA5 | SCK/O2N0/A5 | TX4_1/CTS4_4 |
| - | 1 | PA6 | I/O/A | PA6 | MISO/T3C1/O1N0/A6 | CK4_1/RTS4_4/T1BK_1 |
| - | 2 | PA7(7) | I/O/A | PA7 | MOSI/T3C2/O2P0/A7(3) | T1C1N_1/TX1_3/CTS4_1 |
| - | 10 | PA9 | I/O | PA9 |  | MOSI_1/RX4_1/CTS1_2/MISO_2 /T2BK_1/T2BK_3 |
| - | 12 | PA10 | I/O | PA10 | SCL(3) | TX1_1/MOSI_2/RX4_3 |
| - | 11 | PA11 | I/O/A | PA11 | SDA(3)/C2P1 | SCK_2/RX1_1 |
| - | 2 | PB0(7) | I/O/A | PB0 | TX4/O1P0/A8 | T1C2N_1 |
| - | 3 | PB1 | I/O/A | PB1 | RX4/O2N1/A9 | T1C3N_1 |
| - | 4 | PB7 | I/O/A | PB7 | RST/T1C2N/O2P2/RTS3 | RTS3_1/T1C2N_2 |
| - | 13 | PC3 | I/O/A | PC3 | C1N0/C2N1/C3N1/A13 | RTS2_3/T1C4_3 /T2C3N_4/T2C1N_2/RTS2_4 |
| - | 5 | PC16(4)(9) | I/O/A | PC16 | UDM/T1C4/CTS1 | TX4_2/SCL_2(3)/SDA_4(3)/RX4_5 |


<!-- PDF page 19 -->

<!-- Table extracted from PDF page 19; inspect original for merged-cell relationships -->
| 引脚编号 |  | 引脚 | 引脚 类型(1) | 主功能 （复位后） | 默认复用功能 | 重映射功能(2) |
| --- | --- | --- | --- | --- | --- | --- |
|  | 02POSST |  |  |  |  |  |
|  |  | 名称 |  |  |  |  |
|  |  |  |  |  |  | /CTS1_1/T1C4_1 |
| - |  | PC11(4) | I/O | PC11 |  |  |
| - | 6 | PC17(4)(8) | I/O/A | PC17 | UDP/RTS1/T1ET | TX4_5/SDA_2(3)/SCL_4(3)/RX4_2 /RTS1_1/T1ET_1 |
| - |  | PC10(4) | I/O | PC10 |  |  |
| - | 8 | PC18 | I/O | PC18 | DIO/PIOC_IO0 | TX3_1/T2C1N_5/SDA_3(3)/SCL_5(3) T1ET_2/T1ET_3/T3C2_2 |
| - | 18 | PC19 | I/O/A | PC19 | DCK/PIOC_IO1/C1P0 | T2C1_5/T3C1_2/SCL_3(3)/SDA_5(3) /RX3_1/RX4_4/T2C1_6 |

注1：表格缩写解释：
I = TTL/CMOS 电平斯密特输入；O = CMOS 电平三态输出；
A = 模拟信号输入或输出；P = 电源。
注2：重映射功能下划线后的数值表示AFIO寄存器中相对应位的配置值。例如：TX2_2表示AFIO寄存器相
应位配置为10b。
注3：ADC的通道3、通道7、通道11、通道15和I2C功能不适用于批号倒数第5位为0的产品。
注4：除CH32X035F8U6芯片(QFN20封装)以外，对于CH32X033和其他CH32X035型号的芯片，PC10与PC17
引脚在芯片内部短接合封，禁止两个IO均配置为输出功能；PC11与PC16引脚在芯片内部短接合封，
禁止两个IO均配置为输出功能；在USB应用中，PC10和PC11引脚应配置为浮空输入模式（复位后的
默认值）。
注5：对于CH32X035G8U6、CH32X035G8R6芯片，PB1与PB5引脚在芯片内部短接合封，禁止两个IO均配置
为输出功能。
注6：对于CH32X035G8R6芯片，PA12与PC14引脚在芯片内部短接合封，禁止两个IO均配置为输出功能；
PA13与PC15引脚在芯片内部短接合封，禁止两个IO均配置为输出功能。
注7：对于CH32X033F8P6芯片，PA7与PB0引脚在芯片内部短接合封，禁止两个IO均配置为输出功能。
注8：PC17为BOOT检测引脚，上电时，PC17为高电平，此时芯片进入BOOT区。
注9：当使用I2C功能时，PC16引脚需外接上拉电阻。


<!-- PDF page 20 -->

### 2.3 引脚复用功能

注意，下表中的引脚功能描述针对的是所有功能，不涉及具体型号产品。不同型号之间外设资源有差
异，查看前请先根据产品型号资源表确认是否有此功能。
表 2-3 引脚复用和重映射功能

<!-- Table extracted from PDF page 20; inspect original for merged-cell relationships -->
| 复用 | ADC | TIM1/2 | TIM3 | USART | CMP | SYS | I2C | SPI | USB | OPA | PIOC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 引脚 |  |  |  |  |  |  |  |  |  |  |  |
| PA0 | A0 | T2C1 T2C1_2 |  | CTS2 | C1P1 |  |  |  |  |  |  |
| PA1 | A1 | T2C2 T2C2_2 |  | RTS2 CTS2_1 | C1O |  |  |  |  | O1N2 O2N2 |  |
| PA2 | A2 | T2C3 T2C3_1 T2ET_5 T2ET_6 |  | TX2 RTS2_1 | C3N0 |  |  |  |  | O2O1 |  |
| PA3 | A3(1) | T2C4 T2C4_1 | T3C1_3 | RX2 CTS3_2 |  |  |  |  |  | O1O0 |  |
| PA4 | A4 |  | T3C2_3 | CK2 RTS3_2 |  |  |  | CS |  | O2O0 |  |
| PA5 | A5 |  |  | TX4_1 CTS4_4 |  |  |  | SCK |  | O2N0 |  |
| PA6 | A6 | T1BK_1 | T3C1 | CK4_1 RTS4_4 |  |  |  | MISO |  | O1N0 |  |
| PA7 | A7(1) | T1C1N_1 | T3C2 | CTS4_1 TX1_3 |  |  |  | MOSI |  | O2P0 |  |
| PA8 |  |  |  | RTS4 RTS1_2 CK4_4 RTS4_2 RTS4_5 |  |  |  | MISO_1 |  |  |  |
| PA9 |  | T2BK_1 T2BK_3 |  | RX4_1 CTS1_2 |  |  |  | MOSI_1 MISO_2 |  |  |  |
| PA10 |  |  |  | TX1_1 RX4_3 |  |  | SCL(1) | MOSI_2 |  |  |  |
| PA11 |  |  |  | RX1_1 | C2P1 |  | SDA(1) | SCK_2 |  |  |  |
| PA12 |  | T2C2_5 T2C1N_1 T2C1N_3 |  |  | C2P0 |  |  | CS_2 |  |  |  |
| PA13 |  | T2C3_5 T2C2N_1 T2C2N_3 |  | RTS4_3 CTS1_3 | C3P0 |  | SCL_1(1) |  |  |  |  |
| PA14 |  | T2C3N_1 T2C3N_3 |  | CTS4_3 RTS1_3 | C3P1 |  | SDA_1(1) |  |  |  |  |
| PA15 |  |  |  | TX2_2 TX2_4 |  |  |  |  |  |  |  |
| PA16 |  |  |  | RX2_2 RX2_4 |  |  |  |  |  |  |  |
| PA17 |  |  |  | CTS2_2 CTS2_4 |  |  |  |  |  |  |  |
| PA18 |  | T2ET_1 T2ET_3 |  | TX3_2 |  |  |  |  |  |  |  |
| PA19 |  | T2ET T2ET_2 |  | RX2_1 |  |  |  |  |  |  |  |
| PA20 |  | T2BK T2BK_2 |  | TX2_1 |  |  |  |  |  |  |  |
| PA21 |  | T2C1N |  | RTS2_2 |  | RST |  |  |  |  |  |
| PA22 |  | T2C2N T2C2N_2 |  | CK2_2 CK2_4 | C2NO |  |  |  |  |  |  |
| PA23 |  | T2C3N T2C3N_2 |  | CK2_1 | C1N1 |  |  |  |  |  |  |
| PB0 | A8 | T1C2N_1 |  | TX4 |  |  |  |  |  | O1P0 |  |
| PB1 | A9 | T1C3N_1 |  | RX4 |  |  |  |  |  | O2N1 |  |
| PB2 |  |  |  | RX1_3 | C2O |  |  |  |  |  |  |


<!-- PDF page 21 -->

<!-- Table extracted from PDF page 21; inspect original for merged-cell relationships -->
| 复用 | ADC | TIM1/2 | TIM3 | USART | CMP | SYS | I2C | SPI | USB | OPA | PIOC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 引脚 |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  | CK4 CK4_2 CK4_5 |  |  |  |  |  |  |  |
| PB3 |  | T2C3_2 T2C3_3 T2C3N_5 T2C3N_6 |  | TX3 | C3O |  |  |  |  | O2P1 |  |
| PB4 |  | T2C4_2 T2C4_3 T2BK_5 T2BK_6 | T3C1_1 | RX3 |  |  |  |  |  | O1P2 |  |
| PB5 |  | T1BK T1BK_2 | T3C2_1 | CK3 CK1_2 CK3_1 |  |  |  |  |  | O1O1 |  |
| PB6 |  | T1C1N T1C1N_2 |  | CTS3 CTS3_1 |  |  |  |  |  | O1N1 |  |
| PB7 |  | T1C2N T1C2N_2 |  | RTS3 RTS3_1 |  | RST(3) |  |  |  | O2P2 |  |
| PB8 |  | T1C3N T1C3N_2 |  | CK3_2 CK4_3 |  |  |  |  |  | O1P1 |  |
| PB9 |  | T1C1 T1C1_1 T1C1_2 |  | CK1 CK1_1 TX4_3 |  | MCO |  |  |  |  |  |
| PB10 |  | T1C2 T1C2_1 T1C2_2 |  | TX1 TX1_2 |  |  |  |  |  |  |  |
| PB11 |  | T1C3 T1C3_1 T1C3_2 T2C1N_6 |  | RX1 RX1_2 |  |  |  |  |  |  |  |
| PB12 |  | T1C4_2 T2C2N_5 T2C2N_6 |  | CK1_3 |  |  |  |  |  |  |  |
| PB13 |  |  |  | TX4_4 |  |  |  |  |  |  |  |
| PB14 |  |  |  | RX3_2 |  |  |  |  |  |  |  |
| PB15 |  | T2C2_1 T2C2_3 |  | CTS4 CTS4_2 CTS4_5 |  |  |  | SCK_1 |  |  |  |
| PB16 |  | T2C1_4 |  | TX3_3 |  |  |  |  |  |  |  |
| PB17 |  | T2C2_4 |  | RX3_3 |  |  |  |  |  |  |  |
| PB18 |  | T2C3_4 |  | CTS3_3 |  |  |  |  |  |  |  |
| PB19 |  | T2C4_4 |  | RTS3_3 |  |  |  |  |  |  |  |
| PB20 |  |  |  | CK2_3 |  |  |  |  |  |  |  |
| PB21 |  | T2C1_1 T2C1_3 |  | RTS4_1 |  |  |  | CS_1 |  |  |  |
| PC0 | A10 | T1C1_3 T2C4_5 T2C4_6 T2BK_4 |  | TX2_3 |  |  |  |  |  |  |  |
| PC1 | A11(1) | T1C2_3 T2C1N_4 |  | RX2_3 |  |  |  |  |  |  |  |
| PC2 | A12 | T1C3_3 T2C2N_4 |  | CTS2_3 |  |  |  |  |  |  |  |
| PC3 | A13 | T1C4_3 T2C3N_4 T2C1N_2 |  | RTS2_3 RTS2_4 | C1NO C2N1 C3N1 | RST(2) |  |  |  |  |  |
| PC4 |  | T1BK_3 T2ET_4 |  |  |  |  |  | CS_3 |  |  |  |
| PC5 |  | T1C1N_3 |  |  |  |  |  | SCK_3 |  |  |  |
| PC6 |  | T1C2N_3 |  |  |  |  |  | MISO_3 |  |  |  |
| PC7 |  | T1C3N_3 |  |  |  |  |  | MOSI_3 |  |  | PIOC_IO0_1 |


<!-- PDF page 22 -->

<!-- Table extracted from PDF page 22; inspect original for merged-cell relationships -->
| 复用 | ADC | TIM1/2 | TIM3 | USART | CMP | SYS | I2C | SPI | USB | OPA | PIOC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 引脚 |  |  |  |  |  |  |  |  |  |  |  |
| PC14 |  | T1C3_4 T2C2_6 |  |  |  |  |  |  | CC1 |  |  |
| PC15 |  | T1ET_4 T2C3_6 |  |  |  |  |  |  | CC2 |  |  |
| PC16 |  | T1C4 T1C4_1 |  | CTS1 CTS1_1 TX4_2 RX4_5 |  |  | SCL_2(1) SDA_4(1) |  | UDM |  |  |
| PC17 |  | T1ET T1ET_1 |  | RTS1 RTS1_1 RX4_2 TX4_5 |  |  | SDA_2(1) SCL_4(1) |  | UDP |  |  |
| PC18 |  | T1ET_2 T1ET_3 T2C1N_5 | T3C2_2 | TX3_1 |  | DIO | SDA_3(1) SCL_5(1) |  |  |  | PIOC_IO0 |
| PC19 |  | T2C1_5 T2C1_6 | T3C1_2 | RX3_1 RX4_4 | C1P0 | DCK | SCL_3(1) SDA_5(1) |  |  |  | PIOC_IO1 |

注：1.ADC的通道3、通道7、通道11、通道15和I2C功能不适用于批号倒数第5位为0的产品；
2.PC3引脚的RST功能仅适用于QSOP28封装和TSSOP20封装的CH32X035。
3.PB7引脚的RST功能仅适用于TSSOP20封装的CH32X033。


<!-- PDF page 23 -->

## 第3章 电气特性


### 3.1 测试条件

除非特殊说明和标注，所有电压都以 GND 为基准。
所有最小值和最大值将在最坏的环境温度、供电电压和时钟频率条件下得到保证。典型数值是基
于常温 25℃和 V = 额定 5V 环境下用于设计指导。
DD
对于通过综合评估、设计模拟或工艺特性得到的数据，不会在生产线进行测试。在综合评估的基
础上，最小和最大值是通过样本测试后统计得到。除非特殊说明为实测值，否则特性参数以综合评估
或设计保证。
供电方案：
图 3-1 常规供电典型电路
V
DD
V
DD
4.7uF 0.1uF
GND

### 3.2 绝对最大值

临界或者超过绝对最大值将可能导致芯片工作不正常甚至损坏。
表 3-1 绝对最大值参数表

<!-- Table extracted from PDF page 23; inspect original for merged-cell relationships -->
| 符号 | 描述 | 最小值 | 最大值 | 单位 |
| --- | --- | --- | --- | --- |
| T A | 工作时的环境温度 | -40 | 85 | ℃ |
| T S | 存储时的环境温度 | -40 | 125 | ℃ |
| V DD | 外部主供电引脚V 上的电压 DD | -0.3 | 6.0 | V |
| V IN | I/O引脚上的电压 | -0.3 | V +0.3 DD | V |
| \|△V \| DD_x | 主供电引脚各V 之间的电压差 DD |  | 20 | mV |
| \|△GND \| _x | 公共地引脚各GND之间的电压差 |  | 20 | mV |
| V ESD(HBM) | 普通I/O引脚的ESD静电放电电压（HBM） | 4K |  | V |
| I VDD | 所有V 主供电引脚的合计总电流 DD |  | 150 | mA |
| I GND | 所有GND公共地引脚的合计总电流 |  | 200 | mA |
| I IO | 任意I/O引脚上的sink电流 |  | 40 | mA |
|  | 任意I/O引脚上的source电流 |  | 30 | mA |

### 3.3 电气参数


#### 3.3.1 工作条件

表 3-2 通用工作条件

<!-- Table extracted from PDF page 23; inspect original for merged-cell relationships -->
| 符号 | 参数 | 条件 | 最小值 | 最大值 | 单位 |
| --- | --- | --- | --- | --- | --- |
| F HCLK 或F SYS | 内部系统总线频率 或微处理器主频 |  |  | 48 | MHz |
| V DD | 工作电源电压（额定5V） | 未用USB和PD功能 | 2.0 | 5.5 | V |
|  |  | 使用USB或PD功能 | 3.0 | 5.3 |  |
|  |  | 未使用ADC功能 | 2.0 | 5.5 | V |


<!-- PDF page 24 -->

表 3-3 上电和掉电条件

<!-- Table extracted from PDF page 24; inspect original for merged-cell relationships -->
| 符号 | 参数 | 条件 | 最小值 | 最大值 | 单位 |
| --- | --- | --- | --- | --- | --- |
| t VDD | V 上升速率 DD |  | 0.1 | ∞ | us/V |
|  | V 下降速率 DD |  | 10 | ∞ |  |

#### 3.3.2 内置复位和电源控制模块特性

表 3-4 复位及电压监测（PDR 选择高阈值档位）

<!-- Table extracted from PDF page 24; inspect original for merged-cell relationships -->
| 符号 | 参数 | 条件 | 最小值 | 典型值 | 最大值 | 单位 |
| --- | --- | --- | --- | --- | --- | --- |
| V (1) PVD | 可编程电压检测器的 电平选择 | PLS[1:0] = 00上升沿 |  | 2.12 |  | V |
|  |  | PLS[1:0] = 00下降沿 |  | 2.1 |  |  |
|  |  | PLS[1:0] = 01上升沿 |  | 2.32 |  | V |
|  |  | PLS[1:0] = 01下降沿 |  | 2.3 |  |  |
|  |  | PLS[1:0] = 10上升沿 |  | 3.02 |  | V |
|  |  | PLS[1:0] = 10下降沿 |  | 3 |  |  |
|  |  | PLS[1:0] = 11上升沿 |  | 4.02 |  | V |
|  |  | PLS[1:0] = 11下降沿 |  | 4 |  |  |
| V PVDhyst | PVD迟滞 |  |  | 20 |  | mV |
| V POR/PDR | 上电/掉电复位阈值 | 上升沿 |  | 1.8 |  | V |
|  |  | 下降沿 |  | 1.78 |  | V |
| V PDRhyst | PDR迟滞 |  |  | 20 |  | mV |
| t RSTTEMPO | 上电复位 |  | 4 | 17 | 24 | ms |
|  | 其他复位 |  | 6 | 9 | 20 | us |

注：1.常温测试值。

#### 3.3.3 内置的参考电压

表 3-5 内置参考电压

<!-- Table extracted from PDF page 24; inspect original for merged-cell relationships -->
| 符号 | 参数 | 条件 | 最小值 | 典型值 | 最大值 | 单位 |
| --- | --- | --- | --- | --- | --- | --- |
| V REFINT | 内置参考电压 | T = -40℃～85℃ A | 1.16 | 1.2 | 1.24 | V |
| T S_vrefint | 当读出内部参考电压时， ADC的采样时间 | 建议慢速采样 |  |  | 11 | 1/f ADC |

#### 3.3.4 供电电流特性

电流消耗是多种参数和因素的综合指标，这些参数和因素包括工作电压、环境温度、I/O 引脚的
负载、产品的软件配置、工作频率、I/O 脚的翻转速率、程序在存储器中的位置以及执行的代码等。
电流消耗测量方法如下图：


<!-- PDF page 25 -->

图 3-2 电流消耗测量
Electric current
measurement
V
DD
Electric current
measurement
微控制器处于下列条件：
常温 V = 3.3V 情况下，测试时：所有 IO 端口配置上拉输入，HSI=48M。使能或关闭所有外设时
DD
钟的功耗。
表 3-6 运行模式下典型的电流消耗，数据处理代码从内部闪存中运行

<!-- Table extracted from PDF page 25; inspect original for merged-cell relationships -->
| 符号 | 参数 | 条件 |  | 典型值 |  | 单位 |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  | 使能所有外设 | 关闭所有外设 |  |
| I (1) DD | 运行模式下的 供应电流 | 运行于高速内部 RC振荡器（HSI）， 使用 HB 预分频以 减低频率 | F = 48MHz HCLK | 4.2 | 3.0 | mA |
|  |  |  | F = 24MHz HCLK | 3.2 | 2.6 |  |
|  |  |  | F = 16MHz HCLK | 2.5 | 2.1 |  |
|  |  |  | F = 8MHz HCLK | 2.2 | 2.0 |  |

注：以上为实测参数。
表 3-7 睡眠模式下典型的电流消耗，数据处理代码从内部闪存或 SRAM 中运行

<!-- Table extracted from PDF page 25; inspect original for merged-cell relationships -->
| 符号 | 参数 | 条件 |  | 典型值 |  | 单位 |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  | 使能所有外设 | 关闭所有外设 |  |
| I (1) DD | 睡眠模式下 的供应电流 （此时外设供 电和时钟保持） | 运行于高速内部 RC振荡器（HSI）， 使用 HB 预分频以 减低频率 | F = 48MHz HCLK | 3.0 | 1.8 | mA |
|  |  |  | F = 24MHz HCLK | 2.1 | 1.5 |  |
|  |  |  | F = 16MHz HCLK | 1.8 | 1.4 |  |
|  |  |  | F = 8MHz HCLK | 1.5 | 1.3 |  |

注：以上为实测参数。
表 3-8 停止和待机模式下典型的电流消耗

<!-- Table extracted from PDF page 25; inspect original for merged-cell relationships -->
| 符号 | 参数 | 条件 | 典型值 | 最大值 |
| --- | --- | --- | --- | --- |
| I DD | 停止模式下的供应电流 | 高速内部 RC 振荡器处于关闭状 态（没有独立看门狗） | 75 | 120 |
|  | 待机模式下的供应电流 | 独立看门狗处于开启状态 | 530 |  |
|  |  | AWU处于开启状态 | 528 |  |
|  |  | 独立看门狗和AWU处于关闭状态 | 51 | 90 |

注：以上为实测参数。

#### 3.3.5 内部时钟源特性

表 3-9 内部高速(HSI)RC 振荡器特性

<!-- Table extracted from PDF page 25; inspect original for merged-cell relationships -->
| 符号 | 参数 | 条件 | 最小值 | 典型值 | 最大值 | 单位 |
| --- | --- | --- | --- | --- | --- | --- |
| F HSI | 频率(校准后) |  |  | 48 |  | MHz |
| DuCy HSI | 占空比 |  | 45 | 50 | 55 | % |


<!-- PDF page 26 -->

<!-- Table extracted from PDF page 26; inspect original for merged-cell relationships -->
| ACC HSI | HSI振荡器的精度（校准后） | TA = 0℃～70℃ | -1.7 | ±0.8 | 1.6 | % |
| --- | --- | --- | --- | --- | --- | --- |
|  |  | TA = -40℃～85℃ | -2.6 | ±1.1 | 2.2 | % |
| t SU(HSI) | HSI振荡器启动稳定时间 |  | 1.5 |  | 3.5 | us |
| I DD(HSI) | HSI振荡器功耗 |  |  | 312 |  | uA |

#### 3.3.6 从低功耗模式唤醒的时间

表 3-10 低功耗模式唤醒的时间

<!-- Table extracted from PDF page 26; inspect original for merged-cell relationships -->
| 符号 | 参数 | 条件 | 典型值 | 单位 |
| --- | --- | --- | --- | --- |
| t wusleep | 从睡眠模式唤醒 | 使用HSI RC时钟唤醒 | 1 | us |
| t wustop | 从停止模式唤醒 | 使用HSI RC时钟唤醒 | 10 | us |
| t WUSTDBY | 从待机模式唤醒 | 使用HSI RC时钟唤醒 | 10 | us |

注：以上为实测参数。

#### 3.3.7 存储器特性

表 3-11 闪存存储器特性

<!-- Table extracted from PDF page 26; inspect original for merged-cell relationships -->
| 符号 | 参数 | 条件 | 最小值 | 典型值 | 最大值 | 单位 |
| --- | --- | --- | --- | --- | --- | --- |
| t prog_page | 页（256字节）编程时间 |  |  | 1.5 | 2.0 | ms |
| t erase_page | 页（256字节）擦除时间 |  |  | 2.5 | 3.0 | ms |
| t erase_sec | 扇区（1K字节）擦除时间 |  |  | 2.7 | 3.3 | ms |

表 3-12 闪存存储器寿命和数据保存期限

<!-- Table extracted from PDF page 26; inspect original for merged-cell relationships -->
| 符号 | 参数 | 条件 | 最小值 | 典型值 | 最大值 | 单位 |
| --- | --- | --- | --- | --- | --- | --- |
| N END | 擦写次数 | T = 25℃ A | 300K |  |  | 次 |
|  |  | T = 70℃ A | 100K |  |  | 次 |
| t RET | 数据保存期限 | T = 25℃ A | 20 |  |  | 年 |
|  |  | T = 70℃ A | 10 |  |  | 年 |

#### 3.3.8 I/O端口特性

表 3-13 通用 I/O 静态特性

<!-- Table extracted from PDF page 26; inspect original for merged-cell relationships -->
| 符号 | 参数 | 条件 | 最小值 | 典型值 | 最大值 | 单位 |
| --- | --- | --- | --- | --- | --- | --- |
| V IH | 普通I/O引脚输入高电平电压 |  | (V -2)* DD 0.36+1.3 |  | V DD | V |
|  |  | V = 5V DD | 2.4 |  | V DD | V |
|  |  | V = 3.3V DD | 1.8 |  | V DD | V |
| V IL | 普通I/O引脚输入低电平电压 |  | 0 |  | (V -2)* DD 0.24+0.4 | V |
|  |  | V = 5V DD | 0 |  | 1.1 | V |
|  |  | V = 3.3V DD | 0 |  | 0.7 | V |
| V OH | 普通I/O引脚输出高电平电压 | I = 6mA IO V = 3.3V DD | V -0.4 DD |  |  | V |
|  |  | I = 12mA IO V = 5V DD | V -0.5 DD |  |  | V |
| V OL | 普通I/O引脚输出低电平电压 | I = 8mA IO |  |  | 0.4 | V |


<!-- PDF page 27 -->

<!-- Table extracted from PDF page 27; inspect original for merged-cell relationships -->
|  |  | V = 3.3V DD |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
|  |  | I = 16mA IO V = 5V DD |  |  | 0.5 | V |
| V hys | 普通I/O施密特触发器电压迟滞 | V = 5V DD | 180 | 350 |  | mV |
| I lkg | 普通I/O引脚输入漏电流 |  | -2 |  | 2 | uA |
| I PU | 普通I/O引脚弱上拉电流 | V = 5V DD | 25 | 60 | 140 | uA |
|  |  | V = 3.3V DD | 12 | 30 | 65 | uA |
| I PD | PA0-PA15引脚弱下拉电流 | V = 5V DD | 60 | 150 | 350 | uA |
|  |  | V = 3.3V DD | 30 | 75 | 180 | uA |
| C IO | 单个I/O引脚电容（不含双I/O合封） |  |  | 5 |  | pF |

注：以上均为设计参数保证；
输出驱动电流特性
GPIO(通用输入/输出端口)可以吸收或输出多达±8mA 电流。在用户应用中，所有 IO 引脚驱动总
电流不能超过 3.2 节给出的绝对最大额定值。
表 3-14 输入输出交流特性

<!-- Table extracted from PDF page 27; inspect original for merged-cell relationships -->
| 引脚 | 符号 | 参数 | 条件 | 最小值 | 最大值 | 单位 |
| --- | --- | --- | --- | --- | --- | --- |
| PA | F max(IO)out | 最大频率 | CL = 50pF，V = 2.9～4.0V DD |  | 40 | MHz |
|  |  |  | CL = 50pF，V = 4.0～5.5V DD |  | 56 | MHz |
|  | t f(IO)out | 输出高至低电平的 下降时间 | CL = 50pF，V = 2.9～4.0V DD |  | 6 | ns |
|  |  |  | CL = 50pF，V = 4.0～5.5V DD |  | 4.2 | ns |
|  | t r(IO)out | 输出低至高电平的 上升时间 | CL = 50pF，V = 2.9～4.0V DD |  | 8.4 | ns |
|  |  |  | CL = 50pF，V = 4.0～5.5V DD |  | 6 | ns |
| PB | F max(IO)out | 最大频率 | CL = 50pF，V = 2.9～4.0V DD |  | 16 | MHz |
|  |  |  | CL = 50pF，V = 4.0～5.5V DD |  | 24 | MHz |
|  | t f(IO)out | 输出高至低电平的 下降时间 | CL = 50pF，V = 2.9～4.0V DD |  | 6 | ns |
|  |  |  | CL = 50pF，V = 4.0～5.5V DD |  | 4.2 | ns |
|  | t r(IO)out | 输出低至高电平的 上升时间 | CL = 50pF，V = 2.9～4.0V DD |  | 18 | ns |
|  |  |  | CL = 50pF，V = 4.0～5.5V DD |  | 13.2 | ns |
| PC | F max(IO)out | 最大频率 | CL = 50pF，V = 2.9～4.0V DD |  | 28 | MHz |
|  |  |  | CL = 50pF，V = 4.0～5.5V DD |  | 36 | MHz |
|  | t f(IO)out | 输出高至低电平的 下降时间 | CL = 50pF，V = 2.9～4.0V DD |  | 8.4 | ns |
|  |  |  | CL = 50pF，V = 4.0～5.5V DD |  | 7.2 | ns |
|  | t r(IO)out | 输出低至高电平的 上升时间 | CL = 50pF，V = 2.9～4.0V DD |  | 13.2 | ns |
|  |  |  | CL = 50pF，V = 4.0～5.5V DD |  | 9.6 | ns |

注：以上均为设计参数保证。

#### 3.3.9 RST引脚特性

表 3-15 外部复位引脚特性

电路参考设计及要求：


<!-- PDF page 28 -->

图 3-3 外部复位引脚典型电路
V
DD
R
PU
RST
Filter
0.1uF

#### 3.3.10 USB PD接口特性

表 3-16 PD 接口 I/O 特性，应用：PD 通讯

<!-- Table extracted from PDF page 28; inspect original for merged-cell relationships -->
| 符号 | 参数 | 条件 | 最小值 | 典型值 | 最大值 | 单位 |
| --- | --- | --- | --- | --- | --- | --- |
| t Rise | 上升时间 | 幅度10%到90%之间的时间， 最小值为无负载条件下的时间。 | 300 |  | 600 | ns |
| t Fall | 下降时间 | 幅度10%到90%之间的时间， 最小值为无负载条件下的时间。 | 300 |  | 600 | ns |
| V Swing | 输出电压摆幅 （峰-峰值） | 低电压输出模式，CL=50pF | 1.04 | 1.12 | 1.20 | V |
| I pu | CC上拉电流 | 引脚电压 < V - 1V，PUCC[1:0] = 11 DD | 64 | 80 | 96 | uA |
|  |  | 引脚电压 < V - 1V，PUCC[1:0] = 10 DD | 144 | 180 | 216 | uA |
|  |  | 引脚电压 < V - 1V，PUCC[1:0] = 01 DD | 264 | 330 | 396 | uA |

注：外加Type-C/PD高压接口芯片CH211可实现PD引脚28V耐压以及内置Type-C规范定义的可控Rd
下拉电阻5K1。

#### 3.3.11 TIM定时器特性

表 3-17 TIMx 特性

<!-- Table extracted from PDF page 28; inspect original for merged-cell relationships -->
| 符号 | 参数 | 条件 | 最小值 | 最大值 | 单位 |
| --- | --- | --- | --- | --- | --- |
| t res(TIM) | 定时器基准时钟 |  | 1 |  | t TIMxCLK |
|  |  | f = 48MHz TIMxCLK | 20.8 |  | ns |
| F EXT | CH1至CH4的定时器外部时钟频率 |  | 0 | f /2 TIMxCLK | MHz |
|  |  | f = 48MHz TIMxCLK | 0 | 24 | MHz |
| R esTIM | 定时器分辨率 |  |  | 16 | 位 |
| t COUNTER | 当选择了内部时钟时，16 位计数 器时钟周期 |  | 1 | 65536 | t TIMxCLK |
|  |  | f = 48MHz TIMxCLK | 0.0208 | 1363 | us |
| t MAX_COUNT | 最大可能的计数 |  |  | 65535 | t TIMxCLK |
|  |  | f = 48MHz TIMxCLK |  | 1363 | us |


<!-- PDF page 29 -->

#### 3.3.12 I2C接口特性

图 3-4 I2C 总线时序图
t
w(SCKH)
t
r(SCL)
t
SCL t h(STA) w(SCKL) t f(SCL)
t
SU(STO)
t t h(SDA)

SDA tr(SDA) Stop condition
Start condition t
SU(STA)
表 3-18 I2C 接口特性

<!-- Table extracted from PDF page 29; inspect original for merged-cell relationships -->
| 符号 | 参数 | 标准I2C |  | 快速I2C |  | 单位 |
| --- | --- | --- | --- | --- | --- | --- |
|  |  | 最小值 | 最大值 | 最小值 | 最大值 |  |
| t w(SCKL) | SCL时钟低电平时间 | 4.7 |  | 1.2 |  | us |
| t w(SCKH) | SCL时钟高电平时间 | 4.0 |  | 0.6 |  | us |
| t SU(SDA) | SDA数据建立时间 | 250 |  | 100 |  | ns |
| t h(SDA) | SDA数据保持时间 | 0 |  | 0 | 900 | ns |
| t /t r(SDA) r(SCL) | SDA和SCL上升时间 |  | 1000 | 20 |  | ns |
| t /t f(SDA) f(SCL) | SDA和SCL下降时间 |  | 300 |  |  | ns |
| t h(STA) | 开始条件保持时间 | 4.0 |  | 0.6 |  | us |
| t SU(STA) | 重复的开始条件建立时间 | 4.7 |  | 0.6 |  | us |
| t SU(STO) | 停止条件建立时间 | 4.0 |  | 0.6 |  | us |
| t w(STO:STA) | 停止条件至开始条件的时间（总线空闲） | 4.7 |  | 1.2 |  | us |
| C b | 每条总线的容性负载 |  | 400 |  | 400 | pF |


<!-- PDF page 30 -->

#### 3.3.13 SPI接口特性

图 3-5 SPI 主模式时序图
t SCK t r(SCK)
t
f(SCK)
SCK Output
CPHA=0
CPOL=0
CPHA=0
CPOL=1
t
w(SCKH)
t
w(SCKL)
SCK Output
CPHA=1
CPOL=0
CPHA=1
CPOL=1
t
h(MI)
t
su(MI)

MOSI Output Output highest bit Output 6-1 bit Output lowest bit
图 3-6-1 SPI 从模式时序图（CPHA=0，CPOL=0）
NSS Input
t
t SCK t r(SCK) h(NSS)
t
SCK Input t f(SCK)
su(NSS)
CPHA=0
CPOL=0

su(SI)
MOSI Input Input highest bit Input 6-1 bit Input lowest bit


<!-- PDF page 31 -->

图 3-6-2 SPI 从模式时序图（CPHA=0，CPOL=1）
NSS Input
t t
SCK t h(NSS)
r(SCK)
t
f(SCK)
t
su(NSS)
SCK Input
CPHA=0
CPOL=1
t t
a(SO) V(SO) t
h(SO)
t
dis(SO)

<!-- Table extracted from PDF page 31; inspect original for merged-cell relationships -->
| utput highest bit |  |  |
| --- | --- | --- |
| t h(SI) | t |  |
|  | h(SI) |  |

MOSI Input Input highest bit Input 6-1 bit Input lowest bit
图 3-7-1 SPI 从模式时序图（CPHA=1，CPOL=0）
NSS Input
t
t SCK t r(SCK) h(NSS)
t
SCK Input t f(SCK)
su(NSS)
CPHA=1
CPOL=0

MOSI Input Input highest bit Input 6-1 bit Input lowest bit
图 3-7-2 SPI 从模式时序图（CPHA=1，CPOL=1）
NSS Input
t
t SCK t r(SCK) h(NSS)
t
t f(SCK)
su(NSS)
SCK Input
CPHA=1
CPOL=1
t a(SO) t V(SO) t h(SO) t dis(SO)
Output lowest
MISO Output Output highest bit Output 6-1 bit
bit

MOSI Input Input highest bit Input 6-1 bit Input lowest bit


<!-- PDF page 32 -->

表 3-19 SPI 接口特性

<!-- Table extracted from PDF page 32; inspect original for merged-cell relationships -->
| 符号 | 参数 | 条件 | 最小值 | 最大值 | 单位 |
| --- | --- | --- | --- | --- | --- |
| f /t SCK SCK | SPI时钟频率 | 主模式 |  | 24 | MHz |
|  |  | 从模式 |  | 24 | MHz |
| t /t r(SCK) f(SCK) | SPI时钟上升和下降时间 | 负载电容：C = 30pF |  | 20 | ns |
| t SU(NSS) | NSS建立时间 | 从模式 | 2t HCLK |  | ns |
| t h(NSS) | NSS保持时间 | 从模式 | 2t HCLK |  | ns |
| t /t w(SCKH) w(SCKL) | SCK高电平和低电平时间 | 主模式，f = 24MHz，预分频 HCLK 系数=4 | 70 | 100 | ns |
| t SU(MI) | 数据输入建立时间 | 主模式 | 5 |  | ns |
| t SU(SI) |  | 从模式 | 5 |  | ns |
| t h(MI) | 数据输入保持时间 | 主模式 | 5 |  | ns |
| t h(SI) |  | 从模式 | 4 |  | ns |
| t a(SO) | 数据输出访问时间 | 从模式，f = 20MHz HCLK | 0 | 1t HCLK | ns |
| t dis(SO) | 数据输出禁止时间 | 从模式 | 0 | 10 | ns |
| t V(SO) | 数据输出有效时间 | 从模式（使能边沿之后） |  | 25 | ns |
| t V(MO) |  | 主模式（使能边沿之后） |  | 5 | ns |
| t h(SO) | 数据输出保持时间 | 从模式（使能边沿之后） | 15 |  | ns |
| t h(MO) |  | 主模式（使能边沿之后） | 0 |  | ns |

#### 3.3.14 USB接口特性

表 3-20 USB 接口 I/O 特性

<!-- Table extracted from PDF page 32; inspect original for merged-cell relationships -->
| 符号 | 参数 | 条件 | 最小值 | 典型值 | 最大值 | 单位 |
| --- | --- | --- | --- | --- | --- | --- |
| V DD | USB工作电压 | 根据V 电压选择USB参数 DD | 3.0 |  | 5.3 | V |
| V SE | 单端接收器阈值 | 额定电压 | 1.2 |  | 1.9 | V |
| V OL | 静态输出低电平 |  |  |  | 0.3 | V |
| V OH | 静态输出高电平 |  | 2.8 |  |  | V |
| V BC_REF | BC比较器参考电压 |  |  | 0.4 |  | V |
| V BC_SRC | BC协议输出电压 |  |  | 0.6 |  | V |

#### 3.3.15 12位ADC特性

表 3-21 ADC 特性

<!-- Table extracted from PDF page 32; inspect original for merged-cell relationships -->
| 符号 | 参数 | 条件 | 最小值 | 典型值 | 最大值 | 单位 |
| --- | --- | --- | --- | --- | --- | --- |
| V DD | 供电电压 | 额定性能 | 3.0 | 5 | 5.3 | V |
|  |  | 性能可能降低 | 2.5 |  | 5.5 | V |
| I DD | 供电电流 |  |  | 290 | 480 | uA |
| f ADC | ADC时钟频率 | V >= 3.2V DD | 3 |  | 8 | MHz |
|  |  | V < 3.2V DD | 3 |  | 6 | MHz |
| f S | 采样速率 | V >= 3.2V DD | 125 |  | 470 | KHz |
|  |  | V < 3.2V DD | 125 |  | 353 | KHz |
| V AIN | 转换电压范围 |  | 0 |  | V DD | V |
| R ADC | 采样开关电阻 |  | 0.5 | 0.6 | 1.5 | kΩ |


<!-- PDF page 33 -->

<!-- Table extracted from PDF page 33; inspect original for merged-cell relationships -->
| C ADC | 内部采样和保持电容 |  |  | 21 |  | pF |
| --- | --- | --- | --- | --- | --- | --- |
| t Iat | 注入触发转换时延 |  |  | 1 |  | 1/f ADC |
| t Iatr | 常规触发转换时延 |  |  | 1 |  | 1/f ADC |
| t s | 采样时间 |  |  | 3.5 |  | 1/f ADC |
| t CONV | 总的转换时间（包括采样时间） |  | 17 |  | 24 | 1/f ADC |

注：以上均为设计参数保证。
表 3-22 ADC 误差

<!-- Table extracted from PDF page 33; inspect original for merged-cell relationships -->
| 符号 | 参数 | 条件 | 最小值 | 典型值 | 最大值 | 单位 |
| --- | --- | --- | --- | --- | --- | --- |
| EO | 失调误差 | f = 3MHz, ADC R < 10 kΩ, AIN V = 5V DD |  | ±4 |  | LSB |
| ED | 微分非线性误差 |  |  | ±1 | ±10 |  |
| EL | 积分非线性误差 |  |  | ±4 | ±20 |  |

注：以上均为设计参数保证。
C 表示 PCB 与焊盘上的寄生电容（大约 5pF），可能与焊盘和 PCB 布局质量有关。较大的 C 数值将
p p
降低转换精度，解决办法是降低 f 值。
ADC
图 3-8 ADC 典型连接图
V
DD
V Sample and hold ADC converter
T
R AIN AINx 0.6V R ADC
12-bit
converter
V Parasitic C P 0 V . T 6V C ADC
AIN capacitance
图 3-9 模拟电源及退耦电路参考
V
DD
4.7uF 0.1uF
GND

#### 3.3.16 OPA特性

表 3-23 OPA 运放特性

<!-- Table extracted from PDF page 33; inspect original for merged-cell relationships -->
| 符号 | 参数 | 条件：V = 5V DD | 最小值 | 典型值 | 最大值 | 单位 |
| --- | --- | --- | --- | --- | --- | --- |
| V DD | 供电电压 | 建议不低于2.5V | 2 | 5 | 5.5 | V |
| V CM | 共模输入电压 |  | 0 |  | V DD | V |
| V IOFFSET | 输入失调电压 | 共模输入V = 0.5V CM |  | ±5 | ±13 | mV |


<!-- PDF page 34 -->

<!-- Table extracted from PDF page 34; inspect original for merged-cell relationships -->
|  |  | 共模输入V = V /2 CM DD |  | ±3 | ±10 |  |
| --- | --- | --- | --- | --- | --- | --- |
|  |  | 共模输入V = V -0.5V CM DD |  | ±5 | ±13 |  |
| I LOAD | 驱动电流 | R = 5kΩ LOAD |  |  | 1 | mA |
| I LOAD_PGA | PGA模式驱动电流 |  |  |  | 400 | uA |
| I DDOPAMP | 消耗电流 | 无负载，静态模式 |  | 210 |  | uA |
| CMRR(1) | 共模抑制比 | @1kHz |  | 110 |  | dB |
| PSRR(1) | 电源抑制比 | @1kHz |  | 71 |  | dB |
| Av(1) | 开环增益 | C = 5pF LOAD |  | 110 |  | dB |
| G (1) BW | 单位增益带宽 | C = 5pF LOAD |  | 13 |  | MHz |
| P(1) M | 相位裕度 | C = 5pF LOAD |  | 88 |  |  |
| S(1) R | 压摆率 | C = 5pF LOAD |  | 5 |  | V/us |
| t (1) WAKUP | 关闭到唤醒时间，0.1% | 输入V /2， DD C = 50pF，R = 5kΩ LOAD LOAD |  |  | 1 | us |
| R LOAD | 阻性负载 |  | 5 |  |  | kΩ |
| C LOAD | 容性负载 |  |  |  | 50 | pF |
| V (2) OHSAT | 高饱和输出电压 | R = 5kΩ LOAD | V -300 DD |  |  | mV |
|  |  | R = 20kΩ LOAD | V -50 DD |  |  |  |
| V (2) OLSAT | 低饱和输出电压 | R = 5kΩ LOAD |  |  | 10 | mV |
|  |  | R = 20kΩ LOAD |  |  | 7 |  |
| PGA Gain(1) | NSEL=010b模式同相 | Gain =16，PA1=GND | -3 |  | 3 | % |
|  | 内部同相PGA | Gain = 4 V < (V /7) INP DD | -1 |  | 1 | % |
|  |  | Gain = 8 V < (V /15) INP DD | -1 |  | 1 | % |
|  |  | Gain = 16 V < (V /31) INP DD | -1 |  | 1 | % |
|  |  | Gain = 32 V <( V /63) INP DD | -1 |  | 1 | % |
| Delta R | 电阻绝对值变化 |  | -15 |  | 15 | % |
| EN(1) | 等效输入噪声 | R = 5kΩ@1kHz LOAD |  | 100 |  | nV/ sqrt(Hz) |
|  |  | R = 20kΩ@1KHz LOAD |  | 60 |  |  |

注：1.设计参数保证；
2.负载电流会限制饱和输出电压。

#### 3.3.17 CMP特性

表 3-24 CMP 电压比较器特性

<!-- Table extracted from PDF page 34; inspect original for merged-cell relationships -->
| 符号 | 参数 | 条件：V = 5V DD | 最小值 | 典型值 | 最大值 | 单位 |
| --- | --- | --- | --- | --- | --- | --- |
| V DD | 供电电压 | 建议不低于2.5V | 2 | 5 | 5.5 | V |
| V CM | 共模输入电压 |  | 0 |  | V DD | V |
| V (1) IOFFSET | 输入失调电压 |  |  | ±5 | ±18 | mV |
| I DDOPAMP | 消耗电流 |  |  | 75 |  | uA |
| V hys | 迟滞电压 |  |  | ±24 |  | mV |
| t(1) D | 比较器延时， V 从（V -100mV） INP INN | 0 ≤ V ≤ V INN DD |  | 15 | 50 | ns |


<!-- PDF page 35 -->

注：1.设计参数保证。


<!-- PDF page 36 -->

## 第4章 封装及订货信息

芯片封装

<!-- Table extracted from PDF page 36; inspect original for merged-cell relationships -->
| 封装形式 | 塑体尺寸 | 引脚节距 |  | 封装说明 | 订货型号 |
| --- | --- | --- | --- | --- | --- |
| LQFP64M | 10*10mm | 0.5mm | 19.7mil | LQFP64M（10*10）贴片 | CH32X035R8T6 |
| LQFP48 | 7*7mm | 0.5mm | 19.7mil | 标准LQFP48贴片 | CH32X035C8T6 |
| QFN28 | 4*4mm | 0.4mm | 15.7mil | 四边无引线28脚 | CH32X035G8U6 |
| QSOP28 | 3.9*9.9mm | 0.635mm | 25.0mil | 1/4尺寸28脚贴片 | CH32X035G8R6 |
| QFN20 | 3*3mm | 0.4mm | 15.7mil | 四边无引线20脚 | CH32X035F8U6 |
| TSSOP20 | 4.4*6.5mm | 0.65mm | 25.6mil | 薄小型的20脚贴片 | CH32X035F7P6 |
| TSSOP20 | 4.4*6.5mm | 0.65mm | 25.6mil | 薄小型的20脚贴片 | CH32X033F8P6 |


<!-- PDF page 37 -->

说明：尺寸标注的单位是 mm（毫米），引脚中心间距总是标称值，没有误差，除此之外的尺寸误差不
大于±0.2mm 或者±10%两者中的较大值。
图 4-1 LQFP64M 封装
图 4-2 LQFP48 封装


<!-- PDF page 38 -->

图 4-3 QFN28 封装
图 4-4 QSOP28 封装


<!-- PDF page 39 -->

图 4-5 QFN20 封装
图 4-6 TSSOP20 封装


<!-- PDF page 40 -->

## 系列产品命名规则

举例： CH32 V 3 03 R 8 T 6
产品系列
F = 基于 ARM 内核，通用 MCU
V = 基于青稞 RISC-V 内核，通用 MCU
L = 基于青稞 RISC-V 内核，低功耗 MCU
X = 基于青稞 RISC-V 内核，专用架构或特殊 IO
产品类型
0 = 青稞 V2/V4 内核，超值版，主频<=48M
1 = M3/青稞 V3/V4 内核，基本版，主频<=72M
2 = M3/青稞 V4 非浮点内核，增强版，主频<=144M
3 = 青稞 V4F 浮点内核，增强版，主频<=144M
产品子系列
03 = 通用型
05 = 连接型（USB 高速、SDIO、CAN）
07 = 互联型（USB 高速、CAN、以太网、SDIO、FSMC）
08 = 无线型（蓝牙 BLE5.X、CAN、USB、以太网）
35 = 连接型（USB、USB PD/Type-C）
33 = 连接型（USB）
引脚数目
J = 8 脚 A = 16 脚 F = 20 脚 G = 28 脚
K = 32 脚 T = 36 脚 C = 48 脚 R = 64 脚
W = 68 脚 V = 100 脚 Z = 144 脚
闪存存储容量
4 = 16K 闪存存储器
6 = 32K 闪存存储器
7 = 48K 闪存存储器
8 = 64K 闪存存储器
B = 128K 闪存存储器
C = 256K 闪存存储器
封装
T = LQFP U = QFN R = QSOP P = TSSOP M = SOP
温度范围
6 = -40℃～85℃（工业级）
7 = -40℃～105℃（汽车 2 级）
3 = -40℃～125℃（汽车 1 级）
D = -40℃～150℃（汽车 0 级）
