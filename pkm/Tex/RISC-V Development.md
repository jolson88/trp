## Hello World from ChatGPT

Heck yes—this is a super fun project. Let’s get you from “nothing” → “hello world” in RISC-V asm on a Mac with QEMU, and then lay out a clear path toward your BIOS/OS, serial/USB, and simple framebuffer + IMGUI goals.

### Step 0 — Install the tools (macOS)

1. QEMU (system emulation, includes `qemu-system-riscv64`)
    

```bash
brew install qemu
```

The QEMU docs note Homebrew is a supported way on macOS (you can also use `-accel hvf` later for faster emulation of x86/arm, but for RISC-V you’ll use TCG). ([QEMU](https://wiki.qemu.org/Hosts/Mac?utm_source=chatgpt.com "Hosts/Mac - QEMU"))

2. RISC-V cross toolchain (ELF/newlib)
    

```bash
brew tap riscv-software-src/riscv
brew install riscv-tools
# includes riscv-gnu-toolchain (riscv64-unknown-elf-*), spike, pk, etc.
```

The official RISC-V Homebrew tap documents this flow and even has a `brew test` that builds a hello world to validate the install. ([GitHub](https://github.com/riscv-software-src/homebrew-riscv "GitHub - riscv-software-src/homebrew-riscv: homebrew (macOS) packages for RISC-V toolchain"))

---

### Step 1 — Minimal “Hello, world” in pure assembly (S-mode via OpenSBI)

We’ll boot your code as a “kernel” under the `virt` machine using QEMU’s default BIOS (OpenSBI). OpenSBI runs in M-mode and jumps to your code in S-mode. We’ll print using the SBI legacy console call `console_putchar` (simple and works everywhere). In that ABI, put the character in `a0`, set `a6 = 0`, `a7 = 1`, then `ecall`. ([QEMU](https://www.qemu.org/docs/master/system/riscv/virt.html?utm_source=chatgpt.com "‘virt’ Generic Virtual Platform (virt) — QEMU documentation"), [Stephen Marz Courses](https://courses.stephenmarz.com/my-courses/cosc562/risc-v/opensbi-calls/?utm_source=chatgpt.com "OpenSBI Calls – Stephen Marz"))

#### Files

**`link.ld`** (link your code to the standard OpenSBI handoff address)

```ld
OUTPUT_ARCH(riscv)
ENTRY(_start)

SECTIONS
{
  . = 0x80200000;          /* OpenSBI hands off to S-mode here on virt */
  .text : { *(.text .text.*) }
  .rodata : { *(.rodata .rodata.*) }
  .bss : { *(.bss .bss.* COMMON) }
  . = ALIGN(16);
  /* reserve 8 KiB for stack and expose a label */
  . += 8K;
  PROVIDE(stack_top = .);
}
```

OpenSBI + QEMU `virt` expects your payload at `0x80200000` when you pass it via `-kernel`. ([QEMU](https://www.qemu.org/docs/master/system/riscv/virt.html?utm_source=chatgpt.com "‘virt’ Generic Virtual Platform (virt) — QEMU documentation"), [Patchwork](https://patchwork.ozlabs.org/patch/1151134/?utm_source=chatgpt.com "[U-Boot,RESEND,v4,10/11] riscv: qemu: add SPL configuration"))

**`hello.S`**

```asm
    .section .text
    .globl _start

_start:
    /* simple stack so we can call tiny helpers */
    la   sp, stack_top

    la   t0, msg          /* t0 -> string */
1:  lbu  a0, 0(t0)        /* load next byte */
    beqz a0, 2f           /* 0 terminator? done */
    addi t0, t0, 1
    /* SBI legacy console putchar: a0=char, a6=0, a7=1, ecall */
    li   a6, 0
    li   a7, 1
    ecall
    j    1b

2:  /* hang */
    j    2b

    .section .rodata
msg:
    .asciz "Hello, RISC-V via SBI!\\n"
```

#### Build & run

```bash
riscv64-unknown-elf-gcc -march=rv64gc -mabi=lp64 \
  -nostdlib -nostartfiles -T link.ld -o hello.elf hello.S

qemu-system-riscv64 -M virt -nographic -bios default -kernel hello.elf
```

`-M virt` selects the generic RISC-V “virt” board; `-nographic` wires the serial console to your terminal; `-bios default` provides OpenSBI; `-kernel` feeds your ELF to OpenSBI. ([QEMU](https://www.qemu.org/docs/master/system/target-riscv.html?utm_source=chatgpt.com "RISC-V System emulator — QEMU documentation"))

> Tip: Debug with GDB  
> In one terminal:
> 
> ```bash
> qemu-system-riscv64 -M virt -nographic -bios default -kernel hello.elf -S -s
> ```
> 
> In another:
> 
> ```bash
> riscv64-unknown-elf-gdb hello.elf
> (gdb) target remote :1234
> (gdb) layout asm   # optional, if you like TUI
> (gdb) continue
> ```
> 
> QEMU’s `-s -S` opens a GDB stub on :1234 and halts at reset. ([QEMU](https://www.qemu.org/docs/master/system/gdb.html?utm_source=chatgpt.com "GDB usage — QEMU documentation"))

---

### Step 2 — Serial I/O without SBI (MMIO 16550 UART on `virt`)

The `virt` machine exposes an NS16550A UART at **0x1000_0000**. You can talk to it directly (TX register at offset 0; check LSR bit 5 = THR empty at offset 5) to print chars—handy once you start moving beyond SBI. ([twilco’s blog](https://twilco.github.io/riscv-from-scratch/2019/07/08/riscv-from-scratch-3.html "RISC-V from scratch 3: Writing a UART driver in assembly (1 / 3)"), [Lammert Bies](https://www.lammertbies.nl/comm/info/serial-uart?utm_source=chatgpt.com "Serial UART, an in depth tutorial - Lammert Bies"), [Stanford Center for Spatial Data Science](https://www.scs.stanford.edu/10wi-cs140/pintos/specs/pc16550d.pdf?utm_source=chatgpt.com "PC16550D Universal Asynchronous Receiver/Transmitter with FIFOs[dagger]"))

**Sketch (asm)**

```asm
.equ UART_BASE, 0x10000000
.equ UART_THR,  0x00           /* transmit holding register */
.equ UART_LSR,  0x05           /* line status register */
.equ LSR_THRE,  0x20           /* bit 5: THR empty */

uart_putc:
1:  lbu  t1, UART_LSR(UART_BASE)
    andi t1, t1, LSR_THRE
    beqz t1, 1b
    sb   a0, UART_THR(UART_BASE)
    ret
```

You can use the same `link.ld` and boot via OpenSBI, or later switch to `-bios none` when you’re ready to own M-mode entirely. (Serial still shows in your terminal with `-nographic`.) ([vociferousvoid.org](https://www.vociferousvoid.org/index.php/2019/11/01/risc-v-bare-metal-programming-chapter-1-the-setup/?utm_source=chatgpt.com "RISC-V Bare Metal Programming Chapter 1: The Setup"))

---

### Step 3 — Explore the machine like a firmware/OS would

**Dump the device tree (DTB) that QEMU passes** (gold for bare-metal bring-up):

```bash
qemu-system-riscv64 -machine virt -machine dumpdtb=virt.dtb
dtc -I dtb -O dts -o virt.dts virt.dtb
grep -n "uart@" -n virt.dts  # shows uart@10000000 reg/irq/etc.
```

This is exactly how you confirm the UART base, RAM size, fw_cfg, etc., at runtime. ([twilco’s blog](https://twilco.github.io/riscv-from-scratch/2019/07/08/riscv-from-scratch-3.html "RISC-V from scratch 3: Writing a UART driver in assembly (1 / 3)"))

The official “virt” board documentation is worth skimming once now and again later as you add devices (virtio, IOMMU, ACPI, etc.). ([QEMU](https://www.qemu.org/docs/master/system/riscv/virt.html?utm_source=chatgpt.com "‘virt’ Generic Virtual Platform (virt) — QEMU documentation"))

---

### Step 4 — A practical roadmap to your long-term goals

Here’s a sequence that keeps momentum while building toward a BIOS/OS with graphics and a Pascal-like language:

#### A) Bare-metal foundations (weeks → months)

1. **Solid serial console**
    
    - Implement minimal 16550 driver (polling TX; RX later).
        
    - Optional: keep SBI `console_putchar` as a fallback for early boot. ([Stephen Marz Courses](https://courses.stephenmarz.com/my-courses/cosc562/risc-v/opensbi-calls/?utm_source=chatgpt.com "OpenSBI Calls – Stephen Marz"))
        
2. **Traps & interrupts**
    
    - Set `stvec`, write a tiny trap handler, and print cause codes over serial.
        
    - Add timer interrupts via SBI timer or CLINT (if enabled in your DT). OpenSBI concepts overview: ([RISC-V International](https://riscv.org/wp-content/uploads/2024/12/13.30-RISCV_OpenSBI_Deep_Dive_v5.pdf?utm_source=chatgpt.com "OpenSBI Deep Dive - RISC-V"))
        
3. **Paging & memory management**
    
    - Identity-map early; later move to higher-half if you like.
        
    - Simple bump allocator → freelist/buddy allocator.
        
4. **Boot flow choice**
    
    - **Stay with OpenSBI** (recommended): you’re writing an **S-mode OS**; OpenSBI is your “BIOS.”
        
    - **Or** experiment with **coreboot** as firmware in QEMU (`-bios build/coreboot.rom`) once you want a different M-mode SEE. ([doc.coreboot.org](https://doc.coreboot.org/mainboard/emulation/qemu-riscv.html?utm_source=chatgpt.com "QEMU RISC-V emulator — coreboot 25.06-129-g5db8bf0cfa documentation"))
        
5. **Disks & files**
    
    - Use **virtio-blk** for a block device (simpler than AHCI/SATA). The `virt` machine is designed around virtio devices. ([GitHub](https://github.com/u-boot/u-boot/blob/master/doc/board/emulation/qemu-riscv.rst?utm_source=chatgpt.com "u-boot/doc/board/emulation/qemu-riscv.rst at master - GitHub"))
        

#### B) Graphics (simple first, then richer)

1. **Start over serial.** Make a tiny monitor/shell so you can poke memory and test drivers quickly.
    
2. **“Simple framebuffer”**: **ramfb**
    
    - Add `-device ramfb` to QEMU.
        
    - In guest, configure via **fw_cfg** and then write pixels to the allocated memory. It’s intentionally simple and great for hobby OS graphics bring-up on RISC-V. ([GNU Lists](https://lists.gnu.org/archive/html/qemu-riscv/2021-03/msg00173.html?utm_source=chatgpt.com "[PATCH v4 0/2] hw/riscv: Add fw_cfg support, allow ramfb"), [OSDev Wiki](https://wiki.osdev.org/Ramfb?utm_source=chatgpt.com "Ramfb - OSDev Wiki"))
        
3. **Graduate to virtio-gpu**
    
    - More work but future-proof; you’ll send commands to the device and blit into a host-backed buffer. (Good write-up here.) ([blog.stephenmarz.com](https://blog.stephenmarz.com/2020/11/11/risc-v-os-using-rust-graphics/?utm_source=chatgpt.com "Getting Graphical Output from our Custom RISC-V Operating System in ..."))
        
4. **Immediate-mode GUI**
    
    - Build a tiny shape API (lines, rects, text) atop your framebuffer; then an IMGUI on top of that. Casey’s original IMGUI write-up + video are great context. ([Home](https://caseymuratori.com/blog_0001?utm_source=chatgpt.com "Immediate-Mode Graphical User Interfaces (2005)"), [YouTube](https://www.youtube.com/watch?v=Z1qyvQsjK5Y&utm_source=chatgpt.com "Immediate-Mode Graphical User Interfaces - 2005 - YouTube"))
        

#### C) Input & peripherals

- **Keyboard/mouse**: easiest via **virtio-input**; or you can add `-device qemu-xhci -device usb-kbd -device usb-mouse` and write an **xHCI** driver (more complex). QEMU’s USB emulation docs show the controller choices. ([QEMU](https://www.qemu.org/docs/master/system/devices/usb.html?utm_source=chatgpt.com "USB emulation — QEMU documentation"))
    
- **Serial**: you already have it—keep it as your “safe mode” console.
    

#### D) Tooling & debug

- **GDB**: `-S -s` workflow you saw above. QEMU’s GDB doc is short and sweet. ([QEMU](https://www.qemu.org/docs/master/system/gdb.html?utm_source=chatgpt.com "GDB usage — QEMU documentation"))
    
- **Device tree**: treat it as your “hardware contract” (use `dumpdtb` regularly). ([twilco’s blog](https://twilco.github.io/riscv-from-scratch/2019/07/08/riscv-from-scratch-3.html "RISC-V from scratch 3: Writing a UART driver in assembly (1 / 3)"))
    

#### E) Language & “Project Oberon” inspiration

- Re: a **Pascal-like language** and Oberon-style system: a great north star. The original **Project Oberon** book/source are online and wonderfully approachable; you can mirror its bootstrapping flow (simple compiler → code generator → loader) but target RISC-V instead of RISC5. ([People ETH Zurich](https://people.inf.ethz.ch/wirth/ProjectOberon/?utm_source=chatgpt.com "Project Oberon (New Edition 2013) - ETH Z"), [Project Oberon](https://projectoberon.net/?utm_source=chatgpt.com "Oberon"))
    

---

### Bonus: “Hello, world” via direct UART (no SBI)

If you want to bypass SBI immediately, the `virt` UART lives at **0x10000000**. You can poll LSR bit 5 (THRE) at offset 5, then write the byte to offset 0 (THR). This address comes straight from the QEMU `virt` DTB (see `uart@10000000`), and the THR/LSR offsets are standard 16550. Boot the same way (`-bios default -kernel your.elf`) or later with `-bios none` when you replace firmware. ([twilco’s blog](https://twilco.github.io/riscv-from-scratch/2019/07/08/riscv-from-scratch-3.html "RISC-V from scratch 3: Writing a UART driver in assembly (1 / 3)"), [Stanford Center for Spatial Data Science](https://www.scs.stanford.edu/10wi-cs140/pintos/specs/pc16550d.pdf?utm_source=chatgpt.com "PC16550D Universal Asynchronous Receiver/Transmitter with FIFOs[dagger]"))

---

### “Deep hardware/QEMU” references you’ll want handy

- **QEMU “virt” machine** overview & options. ([QEMU](https://www.qemu.org/docs/master/system/riscv/virt.html?utm_source=chatgpt.com "‘virt’ Generic Virtual Platform (virt) — QEMU documentation"))
    
- **QEMU target RISC-V** intro (board selection, -M notes). ([QEMU](https://www.qemu.org/docs/master/system/target-riscv.html?utm_source=chatgpt.com "RISC-V System emulator — QEMU documentation"))
    
- **OpenSBI** (what it is, how calls work; good for when you formalize SBI usage). ([RISC-V International](https://riscv.org/wp-content/uploads/2024/12/13.30-RISCV_OpenSBI_Deep_Dive_v5.pdf?utm_source=chatgpt.com "OpenSBI Deep Dive - RISC-V"))
    
- **Device-tree spelunking workflow** (dumpdtb → dtc → find addresses like `uart@10000000`). ([twilco’s blog](https://twilco.github.io/riscv-from-scratch/2019/07/08/riscv-from-scratch-3.html "RISC-V from scratch 3: Writing a UART driver in assembly (1 / 3)"))
    
- **USB emulation** in QEMU (UHCI/OHCI/EHCI/XHCI controllers). ([QEMU](https://www.qemu.org/docs/master/system/devices/usb.html?utm_source=chatgpt.com "USB emulation — QEMU documentation"))
    
- **ramfb** for simple framebuffers on RISC-V in QEMU. ([OSDev Wiki](https://wiki.osdev.org/Ramfb?utm_source=chatgpt.com "Ramfb - OSDev Wiki"))
    
- **Coreboot on QEMU RISC-V** (if/when you swap firmware). ([doc.coreboot.org](https://doc.coreboot.org/mainboard/emulation/qemu-riscv.html?utm_source=chatgpt.com "QEMU RISC-V emulator — coreboot 25.06-129-g5db8bf0cfa documentation"))
    