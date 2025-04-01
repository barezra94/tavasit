import { z } from "zod";

// TODO: How should the OliveTypes be defined. There are multiple options for each of the sensitivity groups.

export const inputdataschema = z.object({
  oliveType: z.tuple([z.string(), // TODO: OliveType Name - Convert to enum
  z.string() // TODO: OliveType Sensitivity - Convert to enum
  ]),
  rainEvent: z.boolean(),
  rainTemp: z.tuple([z.number(), // amount of rain
    z.number() // temperature 
    ]).array()
});

export type InputData = z.infer<typeof inputdataschema>;