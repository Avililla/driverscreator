type Partition = {
  name: string;
  bits: number;
  access: "read" | "write" | "read-write";
  description?: string;
};

type SpareBits = {
  bits: number;
};

type RegisterSection = Partition | SpareBits;

type Register = {
  id: string;
  name: string;
  description: string;
  sections: RegisterSection[];
};

export function generateCFile(
  deviceName: string,
  baseAddress: string,
  bitWidth: "32" | "64",
  registers: Register[]
): string {
  let content = `/**
* @file ${deviceName.toLowerCase()}_registers.c
* @brief Implementation of register access functions for ${deviceName}
*/

#include "${deviceName.toLowerCase()}_registers.h"

`;

  registers.forEach((register) => {
    content += `/* Register structure for ${register.name} */
typedef struct {
`;
    register.sections.forEach((section) => {
      if ("name" in section) {
        content += `    uint${bitWidth}_t ${section.name.toLowerCase()} : ${
          section.bits
        }U;
`;
      } else {
        content += `    uint${bitWidth}_t spare_${
          register.name
        }_${register.sections.indexOf(section)} : ${section.bits}U;
`;
      }
    });
    content += `} ${register.name.toUpperCase()}_t;
`;
  });

  content += `typedef struct {
`;
  registers.forEach((register) => {
    content += `    volatile ${register.name.toUpperCase()}_t ${register.name.toLowerCase()};
`;
  });
  content += `} ${deviceName.toUpperCase()}_RegisterMap_t;

/* Static register map */
static volatile ${deviceName.toUpperCase()}_RegisterMap_t* const ${deviceName.toUpperCase()}_REGS = (${deviceName.toUpperCase()}_RegisterMap_t*)${deviceName.toUpperCase()}_BASE_ADDRESS;

`;

  registers.forEach((register) => {
    register.sections.forEach((section) => {
      if ("name" in section) {
        if (section.access === "read" || section.access === "read-write") {
          content += `uint${bitWidth}_t ${register.name.toUpperCase()}_${section.name.toUpperCase()}_GET(void)
{
    return (uint${bitWidth}_t)((${deviceName.toUpperCase()}_REGS->${register.name.toLowerCase()}.${section.name.toLowerCase()} & ${register.name.toUpperCase()}_${section.name.toUpperCase()}_MASK) >> ${register.name.toUpperCase()}_${section.name.toUpperCase()}_SHIFT);
}

`;
        }

        if (section.access === "write" || section.access === "read-write") {
          content += `void ${register.name.toUpperCase()}_${section.name.toUpperCase()}_SET(uint${bitWidth}_t value)
{
    ${deviceName.toUpperCase()}_REGS->${register.name.toLowerCase()}.${section.name.toLowerCase()} = (uint${bitWidth}_t)((${deviceName.toUpperCase()}_REGS->${register.name.toLowerCase()}.${section.name.toLowerCase()} & ~${register.name.toUpperCase()}_${section.name.toUpperCase()}_MASK) | ((value << ${register.name.toUpperCase()}_${section.name.toUpperCase()}_SHIFT) & ${register.name.toUpperCase()}_${section.name.toUpperCase()}_MASK));
}

`;
        }
      }
    });
  });

  return content;
}

export function generateHFile(
  deviceName: string,
  baseAddress: string,
  bitWidth: "32" | "64",
  registers: Register[]
): string {
  let content = `/**
* @file ${deviceName.toLowerCase()}_registers.h
* @brief Register definitions and access functions for ${deviceName}
*/

#ifndef ${deviceName.toUpperCase()}_REGISTERS_H
#define ${deviceName.toUpperCase()}_REGISTERS_H

#include <stdint.h>

/**
* @brief Base address for ${deviceName}
*/
#define ${deviceName.toUpperCase()}_BASE_ADDRESS ((uint${bitWidth}_t)(${baseAddress}ULL))

`;

  registers.forEach((register) => {
    let shift = 0;
    register.sections.forEach((section, sectionIndex) => {
      if ("name" in section) {
        content += `/**
* @brief ${register.name} - ${section.name}
* @details ${section.description || "No description provided"}
*/
#define ${register.name.toUpperCase()}_${section.name.toUpperCase()}_SHIFT ((uint${bitWidth}_t)(${shift}U))
#define ${register.name.toUpperCase()}_${section.name.toUpperCase()}_MASK ((uint${bitWidth}_t)(${
          section.bits === 64
            ? "0xFFFFFFFFFFFFFFFFULL"
            : `0x${"F".repeat(Math.ceil(section.bits / 4)).padStart(8, "0")}U`
        } << ${register.name.toUpperCase()}_${section.name.toUpperCase()}_SHIFT))

`;

        if (section.access === "read" || section.access === "read-write") {
          content += `uint${bitWidth}_t ${register.name.toUpperCase()}_${section.name.toUpperCase()}_GET(void);
`;
        }
        if (section.access === "write" || section.access === "read-write") {
          content += `void ${register.name.toUpperCase()}_${section.name.toUpperCase()}_SET(uint${bitWidth}_t value);
`;
        }
      } else {
        content += `/**
* @brief ${register.name} - Spare bits ${sectionIndex}
*/
#define ${register.name.toUpperCase()}_SPARE_BITS_${sectionIndex}_SHIFT ((uint${bitWidth}_t)(${shift}U))
#define ${register.name.toUpperCase()}_SPARE_BITS_${sectionIndex}_MASK ((uint${bitWidth}_t)(${
          section.bits === 64
            ? "0xFFFFFFFFFFFFFFFFULL"
            : `0x${"F".repeat(Math.ceil(section.bits / 4)).padStart(8, "0")}U`
        } << ${register.name.toUpperCase()}_SPARE_BITS_${sectionIndex}_SHIFT))

`;
      }
      shift += section.bits;
    });
  });

  content += `#endif /* ${deviceName.toUpperCase()}_REGISTERS_H */
`;

  return content;
}

export function generateLatexPDF(
  deviceName: string,
  deviceDescription: string,
  baseAddress: string,
  bitWidth: "32" | "64",
  registers: Register[]
): string {
  let content = `
\\documentclass{article}
\\usepackage[a4paper, margin=1in]{geometry}
\\usepackage{longtable}
\\usepackage{booktabs}
\\usepackage{array}
\\usepackage{multirow}
\\usepackage{colortbl}
\\usepackage{xcolor}

\\title{${deviceName} Register Documentation}
\\author{Generated by Register Generator}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Device Description}
${deviceDescription}

\\section{Base Address}
The base address for ${deviceName} is ${baseAddress}.

\\section{Registers}

`;

  registers.forEach((register, index) => {
    const offset = index * (bitWidth === "32" ? 4 : 8);
    content += `
\\subsection{${register.name}}
\\textbf{Description:} ${register.description}

\\textbf{Offset:} 0x${offset.toString(16).padStart(4, "0")}

\\begin{longtable}{|l|c|c|p{6cm}|}
\\hline
\\textbf{Field} & \\textbf{Bits} & \\textbf{Access} & \\textbf{Description} \\\\
\\hline
\\endhead
`;

    let currentBit = 0;
    register.sections.forEach((section) => {
      if ("name" in section) {
        const startBit = currentBit;
        const endBit = currentBit + section.bits - 1;
        content += `${
          section.name
        } & ${startBit}:${endBit} & ${section.access.toUpperCase()} & ${
          section.description || ""
        } \\\\
\\hline
`;
        currentBit = endBit + 1;
      } else {
        const startBit = currentBit;
        const endBit = currentBit + section.bits - 1;
        content += `SPARE & ${startBit}:${endBit} & - & Spare bits \\\\
\\hline
`;
        currentBit = endBit + 1;
      }
    });

    content += `\\end{longtable}

`;
  });

  content += `
\\end{document}
`;

  return content;
}
