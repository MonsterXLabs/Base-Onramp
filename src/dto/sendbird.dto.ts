import { ISendbird } from '@/entities/sendbird.entity';
import { string, z } from 'zod';

export const SendbirdDtoSchema = z.object({
  id: z.string().optional(),
  participants: z.array(z.string()),
  adminSupport: z.boolean(),
  chatUrl: z.string(),
  nftId: z.string().optional(),
  unreadMessages: z.object({
    userId: z.string().optional(),
    unread_count: z.number().optional(),
    messages: z.array(z.string()),
  }),
});

export type SendbirdDTO = {
  id?: string;
  participants: string[];
  adminSupport: boolean;
  chatUrl: string;
  nftId?: string;
  unreadMessages: {
    userId?: string;
    unread_count?: number;
    messages?: string[];
  };
};

export const SendbirdDTO = {
  fromEntity(entity: ISendbird): SendbirdDTO {
    const { _id, participants, nftId, ...rest } = entity;
    const dto: SendbirdDTO = {
      id: entity._id.toString(),
      participants: entity.participants.map((participant) =>
        participant.toString(),
      ),
      ...rest,
    };

    if (nftId) {
      dto.nftId = nftId.toString();
    }

    return dto;
  },
};
