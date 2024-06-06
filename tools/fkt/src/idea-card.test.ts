import { describe, expect, it } from 'vitest';
import { randomUUID } from 'crypto';

describe('Idea Cards', () => {
  describe('In-Memory Repository', () => {
    const repository = new InMemoryIdeaCardRepository();

    it('should be able to save and load an idea card', async () => {
      const cardDescription = 'test description';
      const cardId = randomUUID();
      const card = { id: cardId, content: cardDescription };

      await repository.save(card);
      const loadedCard = await repository.load(cardId);

      expect(loadedCard).toMatchObject({
        id: cardId,
        content: cardDescription,
      });
    });
  });
});
