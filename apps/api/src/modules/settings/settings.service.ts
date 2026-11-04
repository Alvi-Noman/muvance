import type { AvailabilitySettings } from '@muvance/shared';
import { defaultAvailability } from '@/config/booking';
import { collections } from '@/db/client';
import type { UserDoc } from '@/db/types';

export const settingsService = {
  async getAvailability(): Promise<AvailabilitySettings> {
    const doc = await collections.settings().findOne({ _id: 'booking' });
    return doc?.availability ?? defaultAvailability;
  },

  async updateAvailability(input: AvailabilitySettings, actor: UserDoc) {
    const availability = {
      ...input,
      workingDays: [...new Set(input.workingDays)].sort((a, b) => a - b),
    };
    await collections
      .settings()
      .updateOne(
        { _id: 'booking' },
        { $set: { availability, updatedAt: new Date(), updatedBy: actor._id } },
        { upsert: true },
      );
    return availability;
  },
};
