import type { CollectionConfig } from 'payload'
import { isAuthenticated } from './access'

/**
 * WhackScores — high score table for the 404 page Whack-a-Vendor mini-game.
 *
 * Public can create and read; only authenticated staff can edit/delete.
 * The hooks sanitize and clamp incoming data so a malicious client can't
 * inject markup or claim impossible scores. The leaderboard view in the
 * front end filters by `createdAt` >= start of the current ISO week, so
 * the board "resets" every Monday without us having to delete old rows.
 */
export const WhackScores: CollectionConfig = {
  slug: 'whack-scores',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'score', 'createdAt'],
    description:
      'High scores from the 404 page mini-game. Resets visually each Monday — old entries stay in the database for moderation but stop appearing on the public leaderboard.',
  },
  defaultSort: '-score',
  access: {
    read: () => true,
    create: () => true,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data

        // Sanitize the name: trim, collapse whitespace, strip control chars,
        // cap at 20 visible characters. Anything beyond is the client's
        // problem — we never want stored garbage.
        if (typeof data.name === 'string') {
          data.name = data.name
            .replace(/[\u0000-\u001F\u007F]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 20)
        }

        // Clamp score to a sane bound. The game is 30 seconds with a max
        // realistic ceiling around 100 — anything past 200 is definitely
        // a tampered request.
        if (typeof data.score === 'number') {
          data.score = Math.max(0, Math.min(200, Math.floor(data.score)))
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      minLength: 1,
      maxLength: 20,
    },
    {
      name: 'score',
      type: 'number',
      required: true,
      min: 0,
      max: 200,
      index: true,
    },
  ],
  timestamps: true,
}
