import { z } from "zod";

export const LyricLineSchema = z.object({
  text: z.string(),
  time: z.string(),
  startFrame: z.number().int(),
  endFrame: z.number().int(),
});

export const LyricsLineSchema = z.array(LyricLineSchema);

export type Lyric = z.infer<typeof LyricLineSchema>;
export type Lyrics = z.infer<typeof LyricsLineSchema>;

export const LyricsPropsSchema = z.object({
  lyrics: LyricsLineSchema,
  fontFamily: z.string().optional().default("Inter, system-ui, sans-serif"),
  backgroundColor: z.string().optional().default("hsl(0 0% 20%)"),
  textColor: z.string().optional().default("hsl(0 0% 98%)"),
  highlightColor: z.string().optional().default("hsl(142.1 76.2% 36.3%)"),
  backgroundImage: z.string().optional(),
});

export type LyricsProps = z.infer<typeof LyricsPropsSchema>;
