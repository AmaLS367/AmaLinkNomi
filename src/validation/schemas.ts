import { z } from 'zod';

export const GetNomiSchema = z.object({
  nomi_id: z.string().min(1, 'nomi_id cannot be empty'),
});

export const SendMessageSchema = z.object({
  nomi_id: z.string().min(1, 'nomi_id cannot be empty'),
  message: z.string().min(1, 'message cannot be empty').max(800, 'message exceeds 800 character limit'),
});

export const SendRoomMessageSchema = z.object({
  room_id: z.string().min(1, 'room_id cannot be empty'),
  message: z.string().min(1, 'message cannot be empty').max(800, 'message exceeds 800 character limit'),
});
